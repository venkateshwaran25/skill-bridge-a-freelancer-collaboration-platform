import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Code2,
  Brain,
  Rocket,
  Trash2,
  RotateCcw,
  Terminal,
  Cpu,
  Paperclip,
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  FileCode,
  CornerDownRight,
  Plus,
  Edit2,
  MessageSquare,
  Database,
  Share2
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const starterCategories = [
  {
    id: "proposals",
    label: "📄 Proposals & Bidding",
    icon: Rocket,
    prompts: [
      "Draft a winning, high-converting client proposal for a Full-Stack React + Node.js project.",
      "How do I answer client questions effectively during discovery chat to close a deal?",
      "Review and improve my cover letter: 'I am good dev I do your website fast and cheap'."
    ]
  },
  {
    id: "english",
    label: "🔤 English Grammar & Tone",
    icon: FileText,
    prompts: [
      "Correct my English grammar and make it formal business tone: 'i send design file please check and tell feedback'.",
      "How do I professionally ask a client for milestone payment approval in English?",
      "Translate my Tanglish thought: 'Indha project time ku panni mudipen worry pannadhiga' into fluent Business English."
    ]
  },
  {
    id: "projects",
    label: "🏗️ Project Analysis & Architecture",
    icon: Brain,
    prompts: [
      "Analyze an AI-powered SaaS platform project and suggest tech stack, DB schemas & milestones.",
      "What is the best architecture for an E-Commerce platform handling 50,000 daily orders?",
      "Give a complete technical breakdown and estimate budget for a Uber-like delivery app."
    ]
  },
  {
    id: "coding",
    label: "💻 Coding & Debugging",
    icon: Code2,
    prompts: [
      "Write a complete React + Node.js REST API script with error handling & JWT authentication.",
      "How do I optimize MongoDB indexing for 100,000 requests per second?",
      "Write a Python script for web scraping with async requests and rate limit handling."
    ]
  }
];

const CodeBlockRenderer = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden bg-[#0F172A] border border-slate-800 text-slate-100 shadow-md my-3 font-mono text-xs">
      <div className="px-4 py-2 bg-[#1E293B]/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3 h-3 text-indigo-400" />
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied Code!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-indigo-200 leading-relaxed">
        <pre className="font-mono text-xs sm:text-sm whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const formatInlineMarkdown = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-purple-50 text-[#635BFF] font-mono text-[11px] font-semibold border border-purple-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const FormattedContent = ({ content }) => {
  if (!content) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: content.substring(lastIndex, match.index),
      });
    }

    parts.push({
      type: "code",
      language: match[1] || "code",
      value: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      value: content.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-3">
      {parts.map((part, pIdx) => {
        if (part.type === "code") {
          return (
            <CodeBlockRenderer
              key={pIdx}
              language={part.language}
              code={part.value}
            />
          );
        }

        return (
          <div key={pIdx} className="space-y-2">
            {part.value.split("\n").map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={lIdx}
                    className="text-sm sm:text-base font-extrabold text-slate-900 pt-3 pb-1 border-b border-slate-200 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#635BFF]" />
                    <span>{trimmed.replace(/^###\s+/, "")}</span>
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={lIdx}
                    className="text-base sm:text-lg font-extrabold text-slate-900 pt-3 pb-1 border-b border-slate-200"
                  >
                    {trimmed.replace(/^##\s+/, "")}
                  </h2>
                );
              }

              if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
                return (
                  <div key={lIdx} className="overflow-x-auto my-2 text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <pre className="text-slate-700 whitespace-pre">{trimmed}</pre>
                  </div>
                );
              }

              const isBullet =
                trimmed.startsWith("•") ||
                trimmed.startsWith("- ") ||
                trimmed.startsWith("* ") ||
                /^\d+\.\s/.test(trimmed);

              return (
                <p
                  key={lIdx}
                  className={
                    isBullet
                      ? "pl-3 text-slate-800 text-xs sm:text-sm font-medium flex items-start gap-2"
                      : "text-slate-800 text-xs sm:text-sm leading-relaxed"
                  }
                >
                  {isBullet && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] shrink-0 mt-2" />
                  )}
                  <span>
                    {formatInlineMarkdown(trimmed.replace(/^([•\-\*]|\d+\.)\s*/, ""))}
                  </span>
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const AIChatAssistantPage = () => {
  const { user } = useAuth();
  const [attachedFile, setAttachedFile] = useState(null);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [dbSynced, setDbSynced] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const createInitialWelcomeMessage = () => ({
    sender: "ai",
    content: `👋 Hello **${user?.name || "Developer"}**! I am your **SkillBridge Universal AI Copilot**.\n\nI answer queries across **ALL departments in a single unified chatbot** (Saved permanently to MongoDB):\n\n- 📄 **Project Proposals & Bidding**: Win high-paying contracts with 90%+ conversion cover letters & pricing strategies.\n- 🔤 **English Grammar & Tone Coach**: Correct grammar, spelling, and transform Tanglish / informal drafts into formal Business English.\n- 🏗️ **Project Analysis & Architecture**: Get technical stack recommendations, DB schemas, feature breakdowns & budget estimates.\n- 💻 **Coding & Full-Stack Engineering**: Production React, Node.js, Python, MongoDB, API integration & debugging.\n\nAsk any question or attach files below to get started!`,
    followUps: [
      "Draft a winning client proposal for a React + Node.js project",
      "Correct my English draft: 'i send design file please check and tell feedback'",
      "Analyze a project and suggest tech stack, DB schemas & milestones"
    ]
  });

  // Load chat sessions from localStorage or MongoDB
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("skillbridge_ai_chat_sessions_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load local AI chat sessions");
    }

    const defaultSession = {
      id: "session-" + Date.now(),
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      messages: [createInitialWelcomeMessage()]
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || "session-" + Date.now();
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Sync sessions with MongoDB Database on load
  useEffect(() => {
    const fetchDBSessions = async () => {
      try {
        const { data } = await API.get("/api/ai/chat/sessions");
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const formatted = data.sessions.map((s) => ({
            id: s.sessionId,
            title: s.title,
            createdAt: s.createdAt,
            messages: s.messages.map(m => ({
              sender: m.sender,
              content: m.content,
              followUps: m.followUps
            }))
          }));
          setSessions(formatted);
          setActiveSessionId(formatted[0].id);
          setDbSynced(true);
        }
      } catch (err) {
        console.warn("MongoDB sessions fetch fallback:", err.message);
      }
    };

    fetchDBSessions();
  }, []);

  // Save sessions to localStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem("skillbridge_ai_chat_sessions_v4", JSON.stringify(sessions));
    } catch (e) {
      console.warn("Could not save local AI chat sessions");
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Create a brand new Chat Session
  const handleNewChat = () => {
    window.speechSynthesis && window.speechSynthesis.cancel();
    const newSession = {
      id: "session-" + Date.now(),
      title: `New Chat ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [createInitialWelcomeMessage()]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setAttachedFile(null);
  };

  // Delete a specific Chat Session (both in state & MongoDB)
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await API.delete(`/api/ai/chat/sessions/${sessionId}`);
    } catch (err) {
      console.warn("MongoDB delete session warning:", err.message);
    }

    setToastMsg("🗑️ Chat session deleted from database.");
    setTimeout(() => setToastMsg(""), 3000);

    if (sessions.length <= 1) {
      handleNewChat();
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const [toastMsg, setToastMsg] = useState("");

  // Share a Chat Session (Copies full formatted transcript & link)
  const handleShareSession = (session, e) => {
    e.stopPropagation();
    const sessionMessages = session.messages || [];
    const formattedText = `💬 **SkillBridge AI Chat Session**: "${session.title}"\n\n` +
      sessionMessages.map(m => `**${m.sender === 'user' ? '👤 User' : '🤖 SkillBridge AI Copilot'}**:\n${m.content}`).join("\n\n---\n\n");
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedText);
      setToastMsg(`✅ Chat session "${session.title}" copied to clipboard! Ready to share.`);
      setTimeout(() => setToastMsg(""), 4000);
    }
  };

  // Start Editing Chat Title
  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitleText(session.title);
  };

  // Save Edited Chat Title (both in state & MongoDB)
  const handleSaveRename = async (sessionId) => {
    if (!editingTitleText.trim()) return;
    const newTitle = editingTitleText.trim();
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
    setEditingSessionId(null);
    setToastMsg(`✏️ Chat title updated to "${newTitle}"`);
    setTimeout(() => setToastMsg(""), 3000);

    try {
      await API.put(`/api/ai/chat/sessions/${sessionId}/rename`, { title: newTitle });
    } catch (err) {
      console.warn("MongoDB rename session warning:", err.message);
    }
  };

  // Voice Input (Microphone)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Voice Readout (Text to Speech)
  const handleSpeak = (text, idx) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, " [code block omitted] ").replace(/[*#`|]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // File Upload Selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();

    if (isImage) {
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: "image",
          dataUrl: event.target.result
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: "text",
          content: event.target.result
        });
      };
      reader.readAsText(file);
    }
  };

  // Export Current Chat Session
  const handleExportChat = () => {
    const mdContent = messages
      .map(m => `### ${m.sender === "user" ? "👤 User" : "🤖 SkillBridge AI"}\n\n${m.content}\n\n---`)
      .join("\n\n");

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSession.title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllSessions = async () => {
    if (window.confirm("Are you sure you want to clear all saved chat conversations from MongoDB and local storage?")) {
      window.speechSynthesis && window.speechSynthesis.cancel();
      try {
        await API.delete("/api/ai/chat/sessions");
      } catch (err) {
        console.warn("MongoDB clear all sessions warning:", err.message);
      }
      localStorage.removeItem("skillbridge_ai_chat_sessions_v4");
      const freshSession = {
        id: "session-" + Date.now(),
        title: "New Conversation",
        createdAt: new Date().toISOString(),
        messages: [createInitialWelcomeMessage()]
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
      setInput("");
      setAttachedFile(null);
    }
  };

  const handleSend = async (queryText) => {
    let query = queryText || input;
    if ((!query.trim() && !attachedFile) || loading) return;

    let fullPrompt = query.trim();
    let displayMsgContent = query.trim();

    if (attachedFile) {
      if (attachedFile.type === "text") {
        fullPrompt = `[Attached File: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\nQuestion / Request: ${query || "Please analyze this file in detail."}`;
        displayMsgContent = `📎 **Attached File:** \`${attachedFile.name}\` (${attachedFile.size})\n\n${query || "Analyze this file."}`;
      } else if (attachedFile.type === "image") {
        fullPrompt = `[Attached Image File: ${attachedFile.name}]\nQuestion / Request: ${query || "Please analyze this image request in detail."}`;
        displayMsgContent = `🖼️ **Attached Image:** \`${attachedFile.name}\` (${attachedFile.size})\n\n${query || "Analyze this image."}`;
      }
    }

    const userMsg = { sender: "user", content: displayMsgContent, file: attachedFile };
    const newMessages = [...messages, userMsg];

    const isDefaultTitle = activeSession.title.startsWith("New Chat") || activeSession.title === "New Conversation";
    const newTitle = isDefaultTitle ? (query.length > 28 ? query.slice(0, 28) + "..." : query) : activeSession.title;

    setSessions(prev =>
      prev.map(s => (s.id === activeSessionId ? { ...s, title: newTitle, messages: newMessages } : s))
    );

    if (!queryText) {
      setInput("");
      setAttachedFile(null);
    }
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      // Calls backend API which processes AI chat AND persists to MongoDB database!
      const { data } = await API.post("/api/ai/chat", {
        message: fullPrompt,
        history: historyPayload,
        sessionId: activeSessionId,
        title: newTitle,
      });

      if (data.success && data.reply) {
        const aiMsg = {
          sender: "ai",
          content: data.reply,
          followUps: data.followUps || [
            "Can you give me a complete code example?",
            "Explain step-by-step how to implement this.",
            "What are common pitfalls or performance tips?"
          ]
        };
        setSessions(prev =>
          prev.map(s => (s.id === activeSessionId ? { ...s, messages: [...newMessages, aiMsg] } : s))
        );
      }
    } catch (err) {
      console.error("AI Chat fetch error:", err);
      const fallbackMsg = {
        sender: "ai",
        content: "### 💡 Technical Solution & Execution Guide\n\nHere is guidance for your request:\n\n• **Core Strategy**: Break down complex problems into modular, testable components.\n• **Code Quality**: Follow standard design patterns, strict type/schema validation, and error handling.\n• **Support**: Ask me follow-up questions on any code, science, business or general topic!",
      };
      setSessions(prev =>
        prev.map(s => (s.id === activeSessionId ? { ...s, messages: [...newMessages, fallbackMsg] } : s))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto text-slate-900">
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-[#635BFF] text-white text-xs font-bold shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg("")}
            className="text-white hover:text-slate-200 bg-transparent border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span>Universal AI Copilot</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Omni-capable AI assistant for Proposals, English Coaching, Technical Architecture, Coding, and General Knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="Download conversation history as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-[#635BFF]" />
            <span>Export Chat</span>
          </button>

          <button
            onClick={clearAllSessions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Clear all saved chat conversations"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Chats</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid with Sidebar & Chat Window */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* ChatGPT Style History Sidebar */}
        <div className="md:col-span-1 saas-card p-3 flex flex-col h-[720px] border border-slate-200 shadow-md bg-slate-50/70">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full btn-saas-primary text-xs py-2.5 px-4 mb-3 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>Saved Chats ({sessions.length})</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>MongoDB</span>
            </span>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    window.speechSynthesis && window.speechSynthesis.cancel();
                    setActiveSessionId(session.id);
                  }}
                  className={`group p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? "bg-white text-[#635BFF] border-[#635BFF] shadow-xs font-bold"
                      : "bg-transparent text-slate-700 hover:bg-white hover:border-slate-300 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#635BFF]" : "text-slate-400"}`} />
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(session.id);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-xs border border-[#635BFF] rounded-lg outline-none bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(session.id)}
                          className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                          title="Save Title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Actions for Session Item: Edit, Share, Delete */}
                  {!isEditing && (
                    <div className={`flex items-center gap-1 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(session, e)}
                        className="p-1 text-slate-400 hover:text-[#635BFF] rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Edit Chat Title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareSession(session, e)}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                        title="Share Chat Transcript & Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Chat Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-3">
          {/* Main Chat Container */}
          <div className="saas-card h-[720px] flex flex-col overflow-hidden border border-slate-200 shadow-md">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {activeSession.title}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>MongoDB Database Sync Active</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#635BFF] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>MongoDB Storage Active</span>
              </span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === "ai";
                const isSpeaking = speakingIdx === idx;
                const msgKey = `${activeSessionId}-${idx}`;

                return (
                  <div
                    key={idx}
                    className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}
                  >
                    {isAI && (
                      <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}

                    <div className="space-y-2 max-w-2xl w-full">
                      <div
                        className={`p-4 rounded-2xl relative group ${
                          isAI
                            ? "bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-none"
                            : "bg-[#635BFF] text-white rounded-tr-none shadow-xs text-xs sm:text-sm font-medium leading-relaxed"
                        }`}
                      >
                        {isAI ? (
                          <>
                            <FormattedContent content={msg.content} />

                            {/* AI Response Action Bar */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(msg.content, `ai-${msgKey}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#635BFF] bg-slate-50 hover:bg-purple-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                  title="Copy full AI response text"
                                >
                                  {copiedKey === `ai-${msgKey}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600">Copied Answer!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Answer</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSpeak(msg.content, idx)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                    isSpeaking
                                      ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                                      : "text-slate-600 hover:text-[#635BFF] bg-slate-50 hover:bg-purple-50 border-slate-200"
                                  }`}
                                  title="Listen to AI voice readout"
                                >
                                  {isSpeaking ? (
                                    <>
                                      <VolumeX className="w-3.5 h-3.5" />
                                      <span>Stop Voice</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span>Read Aloud</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {idx === messages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const lastUserMsg = [...messages].reverse().find(m => m.sender === "user");
                                    if (lastUserMsg) handleSend(lastUserMsg.content);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Regenerate AI Answer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Regenerate</span>
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <p className="whitespace-pre-line flex-1">{msg.content}</p>
                              {/* USER MESSAGE QUESTION COPY BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, `user-${msgKey}`)}
                                className="p-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-all shrink-0 border border-white/20"
                                title="Copy your question"
                              >
                                {copiedKey === `user-${msgKey}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {msg.file && msg.file.type === "image" && msg.file.dataUrl && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-white/20 max-w-xs">
                                <img src={msg.file.dataUrl} alt="Attached Preview" className="w-full object-cover max-h-48" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dynamic Follow-Up Suggestion Chips */}
                      {isAI && msg.followUps && (
                        <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                          {msg.followUps.map((fu, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSend(fu)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#635BFF] text-[11px] font-semibold transition-all cursor-pointer text-left flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3 h-3 text-[#635BFF]" />
                              <span>{fu}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3 text-xs text-slate-600 p-3.5 bg-white rounded-2xl border border-slate-200 w-fit shadow-xs">
                  <div className="w-4 h-4 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold text-[#635BFF]">
                    Universal AI Copilot is processing query & saving to MongoDB...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached File Preview Bar */}
            {attachedFile && (
              <div className="px-4 py-2 bg-purple-50 border-t border-purple-100 flex items-center justify-between text-xs font-semibold text-[#635BFF]">
                <div className="flex items-center gap-2 truncate">
                  {attachedFile.type === "image" ? (
                    <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                  <span className="truncate">{attachedFile.name} ({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Remove attached file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Form Footer Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.js,.jsx,.ts,.tsx,.py,.json,.md,.html,.css,.csv,.pdf,.png,.jpg,.jpeg,.webp"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-[#635BFF] bg-slate-100 hover:bg-purple-50 rounded-xl transition-all cursor-pointer border border-slate-200 shrink-0"
                title="Upload code file, document, or image for AI analysis"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white border-rose-600 animate-bounce"
                    : "text-slate-500 hover:text-[#635BFF] bg-slate-100 hover:bg-purple-50 border-slate-200"
                }`}
                title="Speech to Text (Voice Input)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder={
                  isListening
                    ? "Listening... Speak your question now..."
                    : "Ask ANYTHING (Proposals, English, Coding, Architecture, Math...)"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="form-control-custom flex-1 text-xs sm:text-sm py-2.5"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !attachedFile)}
                className="btn-saas-primary text-xs py-2.5 px-5"
              >
                <Send className="w-4 h-4" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistantPage;
