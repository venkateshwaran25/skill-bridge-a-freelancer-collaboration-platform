const Project = require("../models/Project");
const User = require("../models/User");
const AIChatSession = require("../models/AIChatSession");
const {
  calculateSkillMatch,
  generateProposalText,
  optimizeProjectDescription,
  processAIChat,
  analyzeProfileForImprovements,
  suggestProjectBudget,
} = require("../ai/aiService");

// Match projects for logged-in freelancer
const getMatchedProjects = async (req, res) => {
  try {
    const user = req.user;
    const projects = await Project.find({ status: "open" }).populate(
      "postedBy",
      "name email role"
    );

    const matchedProjects = projects.map((project) => {
      const pObj = project.toObject();
      pObj.matchScore = calculateSkillMatch(user.skills, project.skills);
      return pObj;
    });

    matchedProjects.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      projects: matchedProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Match freelancers for a client's project
const getMatchedFreelancers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const freelancers = await User.find({ role: "freelancer" }).select(
      "-password"
    );

    const matchedFreelancers = freelancers.map((f) => {
      const fObj = f.toObject();
      fObj.matchScore = calculateSkillMatch(f.skills, project.skills);
      return fObj;
    });

    matchedFreelancers.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      freelancers: matchedFreelancers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Generate AI proposal text
const generateProposal = async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const proposalText = await generateProposalText(req.user, project);

    res.status(200).json({
      success: true,
      proposalText,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optimize Project Description
const optimizeDescription = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Title and description required" });
    }

    const result = await optimizeProjectDescription(title, description);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Handle unified AI chatbot assistance & MongoDB persistence
const handleAIChat = async (req, res) => {
  try {
    const { message, history, sessionId, title } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message query is required" });
    }

    const reply = await processAIChat(
      message,
      req.user ? req.user.role : "user",
      req.user ? req.user.name : "Guest",
      history || []
    );

    const followUps = [
      "Can you give me a complete code example?",
      "Explain step-by-step how to implement this.",
      "What are common pitfalls or performance tips?"
    ];

    // Persist session to MongoDB if sessionId is provided
    if (sessionId) {
      try {
        let session = await AIChatSession.findOne({ sessionId });
        const userMsg = { sender: "user", content: message };
        const aiMsg = { sender: "ai", content: reply, followUps };

        if (!session) {
          const autoTitle = title || (message.length > 28 ? message.slice(0, 28) + "..." : message);
          session = new AIChatSession({
            sessionId,
            title: autoTitle,
            user: req.user ? req.user._id : null,
            messages: [userMsg, aiMsg]
          });
        } else {
          session.messages.push(userMsg);
          session.messages.push(aiMsg);
          if (title) session.title = title;
        }

        await session.save();
      } catch (dbErr) {
        console.warn("MongoDB AI Chat log save warning:", dbErr.message);
      }
    }

    res.status(200).json({
      success: true,
      reply,
      followUps
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ success: false, message: "Server error in AI Chat" });
  }
};

// Get all AI Chat Sessions from MongoDB
const getAIChatSessions = async (req, res) => {
  try {
    const filter = req.user ? { user: req.user._id } : {};
    const sessions = await AIChatSession.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Fetch AI Chat Sessions error:", error);
    res.status(500).json({ success: false, message: "Error fetching AI sessions from MongoDB" });
  }
};

// Rename an AI Chat Session in MongoDB
const renameAIChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const session = await AIChatSession.findOneAndUpdate(
      { sessionId },
      { title: title.trim() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Rename AI Session error:", error);
    res.status(500).json({ success: false, message: "Error renaming session in MongoDB" });
  }
};

// Delete an AI Chat Session from MongoDB
const deleteAIChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await AIChatSession.findOneAndDelete({ sessionId });

    res.status(200).json({
      success: true,
      message: "Session deleted from MongoDB",
    });
  } catch (error) {
    console.error("Delete AI Session error:", error);
    res.status(500).json({ success: false, message: "Error deleting session from MongoDB" });
  }
};

// Clear All AI Chat Sessions for User from MongoDB
const clearAllAIChatSessions = async (req, res) => {
  try {
    const filter = req.user ? { user: req.user._id } : {};
    await AIChatSession.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: "All sessions cleared from MongoDB",
    });
  } catch (error) {
    console.error("Clear All AI Sessions error:", error);
    res.status(500).json({ success: false, message: "Error clearing sessions from MongoDB" });
  }
};

// Suggest project budget with AI
const suggestBudget = async (req, res) => {
  try {
    const { title, description, skills, complexity, duration } = req.body;
    const suggestion = await suggestProjectBudget({
      title,
      description,
      skills,
      complexity,
      duration,
    });

    res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error("AI Budget Suggestion error:", error);
    res.status(500).json({ success: false, message: "Server error suggesting budget" });
  }
};

module.exports = {
  getMatchedProjects,
  getMatchedFreelancers,
  generateProposal,
  optimizeDescription,
  handleAIChat,
  getAIChatSessions,
  renameAIChatSession,
  deleteAIChatSession,
  clearAllAIChatSessions,
  suggestBudget,
};
