const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");

const User = require("../models/User");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Post = require("../models/Post");
const Review = require("../models/Review");
const Showcase = require("../models/Showcase");
const Payment = require("../models/Payment");
const Workplace = require("../models/Workplace");
const Report = require("../models/Report");

const seedDatabase = async () => {
  try {
    console.log("🌱 Connecting to MongoDB for full database seeding...");
    await connectDB();

    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Post.deleteMany({}),
      Review.deleteMany({}),
      Showcase.deleteMany({}),
      Payment.deleteMany({}),
      Workplace.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log("👥 Seeding Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Admin Account
    const admin = await User.create({
      name: "SkillBridge Admin",
      email: "admin@skillbridge.ai",
      password: hashedPassword,
      role: "admin",
      title: "Platform Governance Officer",
      bio: "SkillBridge AI super administrator overseeing platform safety, governance, and AI monitoring.",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    });

    const client1 = await User.create({
      name: "TechCorp Inc.",
      email: "client1@skillbridge.ai",
      password: hashedPassword,
      role: "client",
      title: "VP of Engineering",
      bio: "Leading innovative enterprise web and cloud solutions.",
      location: "San Francisco, CA",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    });

    const client2 = await User.create({
      name: "Acme Innovations",
      email: "client2@skillbridge.ai",
      password: hashedPassword,
      role: "client",
      title: "Product Director",
      bio: "Building next-generation AI platforms.",
      location: "New York, NY",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    });

    const freelancer1 = await User.create({
      name: "Sarah Jenkins",
      email: "freelancer1@skillbridge.ai",
      password: hashedPassword,
      role: "freelancer",
      title: "Senior Full-Stack Architect",
      bio: "7+ years building enterprise React, Node.js, and MongoDB platforms with high concurrency.",
      skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript"],
      hourlyRate: 75,
      experience: 7,
      rating: 4.9,
      totalJobs: 24,
      location: "Austin, TX",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    });

    const freelancer2 = await User.create({
      name: "Alex Chen",
      email: "freelancer2@skillbridge.ai",
      password: hashedPassword,
      role: "freelancer",
      title: "AI & Data Scientist",
      bio: "Specializing in NLP, PyTorch, Python backend services, and LLM integrations.",
      skills: ["Python", "AI & Data Science", "PyTorch", "Node.js", "Docker"],
      hourlyRate: 85,
      experience: 5,
      rating: 5.0,
      totalJobs: 18,
      location: "Seattle, WA",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    });

    const freelancer3 = await User.create({
      name: "Elena Rostova",
      email: "freelancer3@skillbridge.ai",
      password: hashedPassword,
      role: "freelancer",
      title: "UI/UX & Frontend Specialist",
      bio: "Designing stunning glassmorphic web apps and pixel-perfect responsive interfaces.",
      skills: ["UI/UX Design", "Figma", "React", "Tailwind", "CSS3"],
      hourlyRate: 65,
      experience: 4,
      rating: 4.8,
      totalJobs: 15,
      location: "Berlin, Germany",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    });

    console.log("📌 Seeding Projects...");
    const project1 = await Project.create({
      title: "Full-Stack E-Commerce Platform with Real-Time Bidding",
      description: "Looking for an expert Full-Stack developer to build a modern React & Node.js web application with WebSocket real-time updates and MongoDB backend.",
      category: "Web Development",
      budget: 3500,
      duration: "2-3 weeks",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      postedBy: client1._id,
      status: "in progress",
      assignedFreelancer: freelancer1._id,
      proposalsCount: 2,
      maxProposals: 5,
    });

    const project2 = await Project.create({
      title: "AI Knowledge Base Chatbot & Document Extractor",
      description: "We need an AI engineer to integrate Google Gemini / OpenAI APIs with a Python FastAPI microservice that extracts PDF text and answers user queries intelligently.",
      category: "AI & Data Science",
      budget: 4200,
      duration: "3-4 weeks",
      skills: ["Python", "AI & Data Science", "Docker"],
      postedBy: client2._id,
      status: "in progress",
      assignedFreelancer: freelancer2._id,
      proposalsCount: 1,
      maxProposals: 5,
    });

    const project3 = await Project.create({
      title: "SaaS Dashboard Redesign & UI Component Library",
      description: "Redesign our analytics dashboard into a premium dark-mode glassmorphic web interface using Figma and React.",
      category: "UI/UX Design",
      budget: 2200,
      duration: "1-2 weeks",
      skills: ["UI/UX Design", "Figma", "React"],
      postedBy: client1._id,
      status: "open",
      proposalsCount: 1,
      maxProposals: 5,
    });

    console.log("📝 Seeding Proposals...");
    const prop1 = await Proposal.create({
      project: project1._id,
      freelancer: freelancer1._id,
      bidAmount: 3400,
      coverLetter: "Hi! I have built over 20+ React & Node.js platforms. My skill set matches your requirement 98%. I can start immediately and deliver high-performance architecture.",
      estimatedDays: 14,
      status: "accepted",
    });

    const prop2 = await Proposal.create({
      project: project1._id,
      freelancer: freelancer3._id,
      bidAmount: 3200,
      coverLetter: "I specialize in responsive React frontend development and clean API integration. I can deliver a stunning UI for your marketplace.",
      estimatedDays: 16,
      status: "pending",
    });

    const prop3 = await Proposal.create({
      project: project2._id,
      freelancer: freelancer2._id,
      bidAmount: 4000,
      coverLetter: "As an AI specialist, I have extensive experience deploying Python LLM wrappers and vector embeddings. I'd love to collaborate!",
      estimatedDays: 20,
      status: "accepted",
    });

    console.log("💬 Seeding Community Posts & Comments...");
    await Post.create({
      author: freelancer1._id,
      content: "🚀 Just finished setting up a real-time WebSocket architecture for our new client project! Socket.io + Express scale so gracefully when configured with redis adapters.",
      postType: "project_update",
      techStack: ["React", "Node.js", "Socket.io", "MongoDB"],
      likes: [client1._id, freelancer2._id],
      comments: [
        {
          user: client1._id,
          text: "Awesome work Sarah! The real-time updates are insanely responsive.",
          createdAt: new Date(),
        },
        {
          user: freelancer2._id,
          text: "Great setup! Are you using pub/sub Redis adapter for scaling instances?",
          createdAt: new Date(),
        },
      ],
    });

    await Post.create({
      author: freelancer2._id,
      content: "💡 Tip for AI Developers: When working with Gemini API and structured outputs, always enforce JSON schemas with explicit typing to guarantee clean frontend rendering.",
      postType: "article",
      techStack: ["Python", "Gemini API", "PyTorch"],
      likes: [freelancer1._id, freelancer3._id, admin._id],
      comments: [
        {
          user: freelancer3._id,
          text: "This saved us so much fallback parsing time in our UI components. Thanks Alex!",
          createdAt: new Date(),
        },
      ],
    });

    await Post.create({
      author: freelancer3._id,
      content: "🎨 UI/UX Design System: Glassmorphism looks crisp when combined with 1px subtle borders (`border-white/20`) and high contrast typography. Check out our latest showcase!",
      postType: "achievement",
      techStack: ["Figma", "Tailwind", "CSS3", "React"],
      likes: [client2._id, freelancer1._id],
      comments: [
        {
          user: client2._id,
          text: "Top tier design! Looking forward to implementing this in our product.",
          createdAt: new Date(),
        },
      ],
    });

    console.log("💼 Seeding Active Digital Workplaces...");
    const wp1 = await Workplace.create({
      project: project1._id,
      proposal: prop1._id,
      client: client1._id,
      freelancer: freelancer1._id,
      title: project1.title,
      description: project1.description,
      budget: 3500,
      status: "active",
    });

    const wp2 = await Workplace.create({
      project: project2._id,
      proposal: prop3._id,
      client: client2._id,
      freelancer: freelancer2._id,
      title: project2.title,
      description: project2.description,
      budget: 4200,
      status: "active",
    });

    console.log("⭐ Seeding Reviews...");
    await Review.create({
      workplaceId: wp1._id,
      projectId: project1._id,
      fromUser: client1._id,
      toUser: freelancer1._id,
      reviewerType: "client",
      rating: 5,
      title: "Outstanding Full-Stack Execution",
      comment: "Sarah delivered our E-commerce platform ahead of schedule with top-tier code quality, comprehensive socket handlers, and immaculate state management.",
    });

    await Review.create({
      workplaceId: wp2._id,
      projectId: project2._id,
      fromUser: client2._id,
      toUser: freelancer2._id,
      reviewerType: "client",
      rating: 5,
      title: "Masterclass in AI Engineering",
      comment: "Alex integrated Google Gemini NLP with precision. Our internal teams are blown away by the response accuracy and response times.",
    });

    await Review.create({
      workplaceId: wp1._id,
      projectId: project3._id,
      fromUser: client1._id,
      toUser: freelancer3._id,
      reviewerType: "client",
      rating: 5,
      title: "Stunning UI/UX Redesign",
      comment: "Elena's design system transformed our application interface. Super intuitive, responsive, and aesthetically pleasing.",
    });

    console.log("🎨 Seeding Showcase Projects...");
    await Showcase.create({
      author: freelancer2._id,
      title: "Nexus AI Code Synthesizer",
      description: "An automated multi-file code generation tool powered by Google Gemini LLM with real-time live preview and test coverage runner.",
      category: "AI/ML",
      techStack: ["Python", "React", "Gemini API", "FastAPI"],
      projectUrl: "https://nexus-ai-demo.com",
      githubUrl: "https://github.com/alexchen/nexus-ai",
      isFeatured: true,
    });

    await Showcase.create({
      author: freelancer1._id,
      title: "Aura Modern Fintech Dashboard",
      description: "High-throughput financial analytics web platform with WebSocket stream monitoring, interactive charts, and glassmorphic UI.",
      category: "Web Development",
      techStack: ["React", "Node.js", "Chart.js", "MongoDB"],
      projectUrl: "https://aura-fintech.com",
      githubUrl: "https://github.com/sarahjenkins/aura-fintech",
      isFeatured: true,
    });

    await Showcase.create({
      author: freelancer3._id,
      title: "Hyperion Design System & UI Kit",
      description: "A comprehensive React & CSS glassmorphism UI kit designed for modern SaaS web apps with micro-animations.",
      category: "UI/UX",
      techStack: ["Figma", "React", "Tailwind", "Framer Motion"],
      projectUrl: "https://hyperion-ui.com",
      isFeatured: false,
    });

    console.log("💳 Seeding Payments & Escrow Transactions...");
    await Payment.create({
      workplaceId: wp1._id,
      projectId: project1._id,
      payerId: client1._id,
      recipientId: freelancer1._id,
      amount: 1500,
      status: "completed",
      paidDate: new Date(),
      paymentMethod: "stripe",
      notes: "Milestone 1: Backend API & Database Schema Setup",
    });

    await Payment.create({
      workplaceId: wp2._id,
      projectId: project2._id,
      payerId: client2._id,
      recipientId: freelancer2._id,
      amount: 2000,
      status: "pending",
      paymentMethod: "stripe",
      notes: "Milestone 1: AI Chatbot Engine Integration",
    });

    await Payment.create({
      workplaceId: wp1._id,
      projectId: project3._id,
      payerId: client1._id,
      recipientId: freelancer3._id,
      amount: 1100,
      status: "pending",
      paymentMethod: "stripe",
      notes: "Milestone 1: Wireframe & Figma Component Library",
    });

    console.log("📊 Seeding AI Project Risk Reports...");
    await Report.create({
      workplaceId: wp1._id,
      projectId: project1._id,
      generatedBy: admin._id,
      type: "weekly",
      summary: "Project is running ahead of schedule with 98% milestone velocity and high code quality score.",
      metrics: {
        completedTasks: 8,
        totalTasks: 10,
        completionPercentage: 80,
      },
      riskAssessment: { overallRisk: "low" },
    });

    await Report.create({
      workplaceId: wp2._id,
      projectId: project2._id,
      generatedBy: admin._id,
      type: "milestone",
      summary: "Minor latency observed on large PDF extraction batch sizes; optimization task logged.",
      metrics: {
        completedTasks: 4,
        totalTasks: 6,
        completionPercentage: 66,
      },
      riskAssessment: { overallRisk: "medium" },
    });

    console.log("🎉 All Database Collections Seeded Successfully!");
    console.log("-----------------------------------------");
    console.log("🔑 Demo Credentials (Password: password123)");
    console.log("  🛡️  Admin: admin@skillbridge.ai");
    console.log("  👤 Client 1: client1@skillbridge.ai");
    console.log("  👤 Client 2: client2@skillbridge.ai");
    console.log("  💻 Freelancer 1 (Fullstack): freelancer1@skillbridge.ai");
    console.log("  🤖 Freelancer 2 (AI Dev): freelancer2@skillbridge.ai");
    console.log("  🎨 Freelancer 3 (UI/UX): freelancer3@skillbridge.ai");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();

