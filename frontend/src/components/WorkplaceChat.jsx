import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Paperclip, Circle } from 'lucide-react';

const WorkplaceChat = ({ workplaceId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();

    if (user?._id) {
      try {
        const socketUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
        socketRef.current = io(socketUrl, {
          auth: { token: localStorage.getItem('skillbridge_token') },
        });

        socketRef.current.emit('join_workplace', {
          userId: user._id,
          workplaceId,
        });

        socketRef.current.on('receive_workplace_message', (data) => {
          const incoming = data.message || data;
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (m) =>
                (m._id && (m._id === incoming._id || m._id === incoming.id)) ||
                (m.senderId === user?._id &&
                  m.content === incoming.content &&
                  Math.abs(new Date(m.timestamp) - new Date(incoming.timestamp || Date.now())) < 5000)
            );
            if (isDuplicate) return prev;
            return [...prev, incoming];
          });
        });

        socketRef.current.on('user_online', (data) => {
          setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
        });

        socketRef.current.on('user_typing', (data) => {
          if (data.isTyping) {
            setUsersTyping((prev) => [...new Set([...prev, data.userId])]);
          } else {
            setUsersTyping((prev) => prev.filter((id) => id !== data.userId));
          }
        });
      } catch (err) {
        console.error('Socket initialization error:', err);
      }

      return () => {
        socketRef.current?.emit('leave_workplace', {
          userId: user._id,
          workplaceId,
        });
        socketRef.current?.disconnect();
      };
    }
  }, [workplaceId, user?._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/api/workspace-messages/workplace/${workplaceId}`,
        { params: { limit: 100, page: 1 } }
      );
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error fetching workplace messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgObj = {
      _id: `m-${Date.now()}`,
      senderId: user?._id || "me",
      senderName: user?.name || "You",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, msgObj]);

    try {
      await API.post('/api/workspace-messages', { workplaceId, content: newMessage });

      socketRef.current?.emit('send_workplace_message', {
        senderId: user._id,
        workplaceId,
        content: newMessage,
        senderName: user.name,
      });
    } catch (error) {
      console.log('Message send saved locally');
    } finally {
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#635BFF]" />
            <span>Workspace Team Chat</span>
          </h2>
          <p className="text-xs text-slate-500">Real-time team chat thread for this project.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Team Online</span>
        </div>
      </div>

      <div className="saas-card h-[450px] flex flex-col overflow-hidden bg-slate-50/40">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => {
            const isOwn = msg.senderId === user?._id || msg.senderId === "me";
            return (
              <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                    isOwn
                      ? "bg-[#635BFF] text-white rounded-br-none shadow-2xs"
                      : "bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-0.5 border-b border-slate-100/20">
                    <span className="font-bold">{isOwn ? "You" : msg.senderName || "Collaborator"}</span>
                    <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed pt-1">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Send message to team..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="form-control-custom flex-1 text-xs py-2"
          />
          <button type="submit" className="btn-saas-primary text-xs py-2 px-4">
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkplaceChat;
