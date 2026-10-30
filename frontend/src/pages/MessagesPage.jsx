import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Search,
  Paperclip,
  Smile,
  ShieldCheck,
  User,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  UserPlus,
  Circle,
  ExternalLink
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { initSocket } from "../services/socket";

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserIdFromUrl = searchParams.get("user") || searchParams.get("userId");

  // State
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // LinkedIn-style live search dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const searchContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Conversations List
  const fetchConversations = async (targetIdToSelect = null) => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/messages/conversations");
      if (data.success) {
        setConversations(data.conversations || []);
        
        // Handle initial selection
        if (targetIdToSelect) {
          const found = data.conversations.find(
            (c) => (c.user?._id || c.user) === targetIdToSelect
          );
          if (found) {
            setActiveUser(found.user);
          }
        } else if (!activeUser && data.conversations.length > 0) {
          setActiveUser(data.conversations[0].user);
        }
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(targetUserIdFromUrl);
  }, [targetUserIdFromUrl]);

  // Handle URL target user if provided
  useEffect(() => {
    if (targetUserIdFromUrl && (!activeUser || activeUser._id !== targetUserIdFromUrl)) {
      const existingConv = conversations.find(
        (c) => (c.user?._id || c.user) === targetUserIdFromUrl
      );
      if (existingConv) {
        setActiveUser(existingConv.user);
      } else {
        // Fetch target user info directly
        API.get(`/api/users/${targetUserIdFromUrl}`)
          .then(({ data }) => {
            if (data.success && data.user) {
              selectAndStartChatWithUser(data.user);
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [targetUserIdFromUrl]);

  // Fetch Messages for Active User
  useEffect(() => {
    if (!activeUser?._id) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data } = await API.get(`/api/messages/${activeUser._id}`);
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeUser]);

  // Real-time Socket Listener
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = initSocket(currentUser._id);

    const handleReceiveMessage = (newMsg) => {
      // Check if message belongs to active conversation
      const msgSenderId = newMsg.sender?._id || newMsg.sender;
      const msgRecipientId = newMsg.recipient?._id || newMsg.recipient;

      if (
        (msgSenderId === activeUser?._id && msgRecipientId === currentUser._id) ||
        (msgSenderId === currentUser._id && msgRecipientId === activeUser?._id)
      ) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              (m._id && m._id === newMsg._id) ||
              (m.content === newMsg.content &&
                Math.abs(
                  new Date(m.createdAt || m.timestamp || Date.now()) -
                    new Date(newMsg.createdAt || newMsg.timestamp || Date.now())
                ) < 5000)
          );
          if (exists) return prev;
          return [...prev, newMsg];
        });
      }

      // Refresh conversations list to update previews
      fetchConversations();
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [currentUser, activeUser]);

  // Live Member Search (LinkedIn Style)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await API.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (data.success) {
          setSearchResults(data.users || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Member search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select User from Search Dropdown & Open Chat
  const selectAndStartChatWithUser = (userObj) => {
    setActiveUser(userObj);
    setSearchQuery("");
    setShowDropdown(false);

    // Add to conversations list if not already present
    setConversations((prev) => {
      const exists = prev.some((c) => (c.user?._id || c.user) === userObj._id);
      if (exists) return prev;
      return [
        {
          user: userObj,
          lastMessage: "Start a new conversation...",
          lastMessageDate: new Date(),
          unread: false,
          contractStatus: "Direct Connection",
        },
        ...prev,
      ];
    });
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser?._id) return;

    const contentText = inputText.trim();
    setInputText("");

    // Optimistic local add
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: { _id: currentUser._id, name: currentUser.name },
      recipient: { _id: activeUser._id, name: activeUser.name },
      content: contentText,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const { data } = await API.post("/api/messages", {
        recipientId: activeUser._id,
        content: contentText,
      });

      if (data.success && data.message) {
        // Emit socket message for real-time delivery
        const socket = initSocket(currentUser._id);
        socket.emit("send_message", {
          senderId: currentUser._id,
          recipientId: activeUser._id,
          content: contentText,
        });

        // Replace temp message with server message
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? data.message : m))
        );

        // Update conversation list preview
        setConversations((prev) =>
          prev.map((c) => {
            if ((c.user?._id || c.user) === activeUser._id) {
              return {
                ...c,
                lastMessage: contentText,
                lastMessageDate: new Date(),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 pt-2 px-2 sm:px-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 shadow-lg text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>LinkedIn Direct Platform Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Direct Messaging & Connections
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Search any registered member on SkillBridge AI to start a conversation in real-time.
          </p>
        </div>
      </div>

      {/* Split Chat Window */}
      <div className="rounded-3xl bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 shadow-2xl h-[640px] flex overflow-hidden text-white">
        
        {/* LEFT PANEL: Member Search Dropdown & Active Conversations */}
        <div className="w-full md:w-80 bg-slate-900/90 border-r border-white/10 flex flex-col shrink-0">
          
          {/* LinkedIn-style Live Search Input & Dropdown Container */}
          <div className="p-4 border-b border-white/10 relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-violet-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search member by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/15 text-white placeholder-slate-400 text-xs outline-none focus:border-violet-500 transition-all"
              />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin absolute right-3 top-3.5" />
              )}
            </div>

            {/* LIVE MATCHING DROPDOWN MENU */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-4 right-4 top-[70px] z-50 rounded-2xl bg-[#1E293B] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/10"
                >
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Matching Platform Members</span>
                    <span className="text-[10px] text-violet-400">{searchResults.length} found</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No members matched "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((member) => (
                      <div
                        key={member._id}
                        onClick={() => selectAndStartChatWithUser(member)}
                        className="p-3 hover:bg-violet-600/20 transition-all cursor-pointer flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                          {member.name ? member.name[0].toUpperCase() : "M"}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              {member.role || "member"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{member.title || "Specialist Member"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-400">No active chats yet.</p>
                <p className="text-[11px] text-slate-500">
                  Use the search box above to find any member and start messaging!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.user;
                if (!partner) return null;
                const isActive = activeUser?._id === partner._id;

                return (
                  <div
                    key={partner._id}
                    onClick={() => setActiveUser(partner)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive
                        ? "bg-violet-600/20 border-l-4 border-violet-500 shadow-md"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        {partner.name ? partner.name[0].toUpperCase() : "U"}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{partner.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessageDate
                            ? new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                      {conv.contractStatus && (
                        <span className="inline-block mt-1 text-[9px] font-semibold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                          {conv.contractStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Direct Messaging Thread */}
        <div className="flex-1 flex flex-col bg-slate-950/60">
          {activeUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1E293B]/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {activeUser.name ? activeUser.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{activeUser.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">{activeUser.title || "SkillBridge Specialist"}</p>
                  </div>
                </div>

                <Link to={`/profile/${activeUser._id}`} className="no-underline">
                  <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer">
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1120]/60">
                {messagesLoading ? (
                  <div className="text-center py-12 text-slate-400 text-xs">Loading message history...</div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center space-y-2 max-w-sm mx-auto my-auto">
                    <Sparkles className="w-8 h-8 text-violet-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Start a new conversation with {activeUser.name}</h4>
                    <p className="text-xs text-slate-400">
                      Send a message below to connect and discuss projects or collaborations.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = msg.sender?._id || msg.sender;
                    const isMe = senderId === currentUser?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                            isMe
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none"
                              : "bg-[#1E293B] text-slate-100 rounded-bl-none border border-white/10"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                          <span
                            className={`text-[9px] block text-right font-mono ${
                              isMe ? "text-violet-200" : "text-slate-400"
                            }`}
                          >
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex items-center gap-2 bg-[#1E293B]/90">
                <input
                  type="text"
                  placeholder={`Write a message to ${activeUser.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-400 text-xs outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 border-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <MessageSquare className="w-12 h-12 text-violet-400 opacity-50" />
              <h3 className="text-base font-bold text-white">Select a Member to Start Chatting</h3>
              <p className="text-xs max-w-sm">
                Search member names in the left search box to start a direct message thread instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
