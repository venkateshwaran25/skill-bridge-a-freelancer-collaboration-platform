/**
 * SkillBridge AI Engine - Intelligent Skill Matching & Gemini AI Generation Service
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// Initialize Gemini SDK with the API key from the environment
const rawApiKey = process.env.GEMINI_API_KEY || "";
// Accept any non-empty API key (not just 'AIzaSy' prefix)
const apiKey = rawApiKey && rawApiKey.trim().length > 10 ? rawApiKey.trim() : "";
const genAI = new GoogleGenerativeAI(apiKey || "placeholder_for_sdk_init");

// Initialize Groq SDK with the API key from environment
const rawGroqKey = process.env.GROQ_API_KEY || "";
const isGroqValid = rawGroqKey && rawGroqKey.trim() !== "" && rawGroqKey !== "your_groq_api_key_here";
const groq = isGroqValid ? new Groq({ apiKey: rawGroqKey.trim() }) : null;

// Model fallback cascade list to handle 503 high demand or quota limits
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

// Helper function to retry API calls with exponential backoff
const withRetry = async (fn, maxRetries = 2, initialDelayMs = 500) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Gemini API busy (${error.status || error.message}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Model fallback executor
const generateWithModelFallback = async (prompt) => {
  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await withRetry(() => model.generateContent(prompt));
      const text = result?.response?.text();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model candidate [${modelName}] unavailable (${err.status || err.message}). Trying fallback candidate...`);
    }
  }
  throw lastError || new Error("All Gemini AI candidate models are currently busy.");
};

// Calculate Skill Match Percentage
const calculateSkillMatch = (userSkills = [], projectSkills = []) => {
  if (!projectSkills || projectSkills.length === 0) return 92;
  if (!userSkills || userSkills.length === 0) return 35;

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
  const normalizedProjectSkills = projectSkills.map((s) => s.toLowerCase().trim());

  let matches = 0;
  normalizedProjectSkills.forEach((pSkill) => {
    const isDirectMatch = normalizedUserSkills.includes(pSkill);
    const isPartialMatch = normalizedUserSkills.some(
      (uSkill) => uSkill.includes(pSkill) || pSkill.includes(uSkill)
    );
    if (isDirectMatch) {
      matches += 1.0;
    } else if (isPartialMatch) {
      matches += 0.65;
    }
  });

  const rawScore = (matches / normalizedProjectSkills.length) * 100;
  return Math.min(Math.max(Math.round(rawScore), 40), 99);
};

// High-Conversion Proposal Generator
const generateProposalText = async (user, project, tone = "professional") => {
  const skillsList = user.skills && user.skills.length > 0 ? user.skills.join(", ") : "Full-Stack Development, React, Node.js, MongoDB";
  const userTitle = user.title || "Full-Stack Specialist";
  const userName = user.name || "Freelance Specialist";
  const projectTitle = project.title || "your project";
  const projectSkills = project.skills && project.skills.length > 0 ? project.skills.join(", ") : "the requested tech stack";

  const createSmartFallbackProposal = () => {
    return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in your project, "${projectTitle}". As a dedicated ${userTitle} experienced in ${skillsList}, I am confident in delivering a high-performance, maintainable solution tailored to your goals.

### Why I Am a Great Fit for This Project:
• **Targeted Technical Expertise**: Proven hands-on experience building scaleable web & cloud applications using ${projectSkills}.
• **Milestone-Driven Execution**: I work with clear deliverables, daily updates, and strict adherence to software engineering best practices.
• **High Reliability & Quality Code**: Clean modular codebase with 100% test coverage readiness and seamless API integration.

### Proposed Workflow & Timeline:
1. **Discovery & Architecture Setup**: Align on requirements, API specs, and database schemas (Days 1-2).
2. **Core Feature Development & Iteration**: Agile sprint updates with live preview deployments (Days 3-7).
3. **QA, Performance Tuning & Handover**: Complete code walkthrough, documentation, and production launch.

I would love to discuss your specific requirements and milestone schedule in a quick call or chat.

Best regards,
**${userName}**
*${userTitle}*`;
  };

  if (!apiKey) {
    return createSmartFallbackProposal();
  }

  try {
    const prompt = `You are an expert, top-rated freelancer named ${userName}, who is a professional ${userTitle} skilled in ${skillsList}.
Write a high-converting ${tone.toUpperCase()} project proposal for a project titled "${projectTitle}".
Project Description: ${project.description || "No description provided."}
Project Required Skills: ${projectSkills}

Structure your proposal into 4 distinct, impressive sections:
1. Enthusiastic Greeting & Client Value Hook (addressing their project goal)
2. Relevant Technical Strengths & Past Architecture Victories (bullet points)
3. Step-by-Step Deliverables & Execution Plan
4. Call to Action for a call/chat.

Do not include empty bracket placeholders. Format with Markdown.`;

    const text = await generateWithModelFallback(prompt);
    if (text) return text;
    return createSmartFallbackProposal();
  } catch (error) {
    console.warn("Gemini AI API fallback for proposals:", error.message || error);
    return createSmartFallbackProposal();
  }
};

// Project Description Optimizer
const optimizeProjectDescription = async (title, description) => {
  if (!apiKey) {
    return {
      enhancedDescription: `### Project Overview: ${title}\n\n${description}\n\n### Key Requirements & Deliverables\n• Clean, production-ready implementation following modern software engineering practices.\n• Scalable architecture with complete documentation and unit test coverage.\n• Clear daily milestone updates and responsive communication.`,
      suggestedSkills: ["React", "Node.js", "MongoDB", "API Design", "TailwindCSS"]
    };
  }

  const prompt = `You are a senior technical project manager. A client wants to post a project titled "${title}".
Original Description: ${description}

Task 1: Rewrite and expand this description into a professional, high-clarity project brief. Add sections: "Project Overview", "Core Requirements & Deliverables", and "Expected Quality Standards".
Task 2: Suggest up to 5 essential technical skills needed for freelancers applying to this project.

Return the response STRICTLY as a JSON object (no markdown code blocks around it):
{
  "enhancedDescription": "High quality markdown text here...",
  "suggestedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}`;

  try {
    let text = await generateWithModelFallback(prompt);
    text = text.replace(/```json\n?|\n?```/gi, "").trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.warn("Gemini AI error (optimizeProjectDescription fallback):", error.message || error);
    return {
      enhancedDescription: `### Project Brief: ${title}\n\n${description}\n\n### Core Deliverables:\n• End-to-end implementation with high performance & responsive design.\n• Modular codebase with clear API specifications.`,
      suggestedSkills: ["Full-Stack", "JavaScript", "API Integration", "Database Design"]
    };
  }
};
// Helper function to query free live Open LLM (Pollinations AI) with retry loop
const queryOpenLLM = async (message, userRole = "user", userName = "User") => {
  const roleContext = userRole === "client" ? "a Project Client / Hiring Manager" : "a Freelancer & Specialist";
  const cleanMsg = message.replace(/[\r\n]+/g, " ").trim();

  const systemContent = `You are SkillBridge AI Assistant — an expert AI that answers ANY question accurately.
User: ${userName || "User"} (${roleContext}).
Answer the EXACT question asked. For code questions, show real working code. Use Markdown formatting.
Never give generic or template responses. Always answer specifically what was asked.`;

  // Method 1: POST request with messages payload
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const postRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: cleanMsg }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (postRes.ok) {
      const text = await postRes.text();
      if (text && text.trim() && text.trim() !== "{}" && !text.includes("Invalid messages array") && text.length > 50) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn(`Pollinations POST attempt failed (${err.message}). Trying GET method...`);
  }

  // Method 2: GET Request to Pollinations AI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const getRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(cleanMsg)}`, {
      method: "GET",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (getRes.ok) {
      const text = await getRes.text();
      if (text && text.trim() && text.trim() !== "{}" && text.length > 50) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn(`Pollinations GET attempt failed (${err.message}).`);
  }

  return null;
};

// Last-resort fallback: uses Pollinations with a direct, no-template prompt
const generateSmartLocalResponse = async (message) => {
  const cleanMsg = message.trim();

  // One final Pollinations attempt with a very direct prompt
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai-large",
        messages: [
          {
            role: "system",
            content: "You are a helpful, knowledgeable AI assistant. Answer the user's question directly, accurately, and in detail. Use Markdown formatting with code blocks for code examples."
          },
          { role: "user", content: cleanMsg }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 30) return text.trim();
    }
  } catch (err) {
    console.warn("Final fallback Pollinations failed:", err.message);
  }

  // Absolute last resort — very minimal static message
  return `I'm having trouble connecting to the AI service right now. Please try again in a moment.\n\nYour question was: **"${cleanMsg}"**\n\nTip: Make sure the backend server has internet access and the Groq API key is valid.`;
};

// Helper function to query Groq LLM API
const queryGroqLLM = async (message, userRole = "user", userName = "User", history = []) => {
  if (!groq) return null;
  try {
    const roleContext = userRole === "client" ? "a Project Client / Hiring Manager" : "a Freelancer & Specialist";
    const systemPrompt = `You are SkillBridge AI Assistant — a highly capable, knowledgeable AI assistant similar to ChatGPT.
User: ${userName || "User"} (${roleContext}).

You can answer ANY question the user asks — programming, technology, general knowledge, science, math, career advice, freelancing, proposals, grammar correction, project analysis, code debugging, and more.

IMPORTANT RULES:
- Answer the EXACT question asked. Do NOT give a generic or templated response.
- For coding questions (React, Node.js, Python, etc.): provide actual working code examples with explanations.
- For technical topics: give accurate, detailed, up-to-date technical answers.
- For general questions: give clear, direct, helpful answers.
- Always use Markdown formatting: ### headings, bullet points, and \`\`\`code blocks\`\`\` for code.
- If user writes in Tamil or Tanglish, respond in Tamil/Tanglish.
- Never say you cannot answer — always try your best.`;

    const messages = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(history) && history.length > 0) {
      history.slice(-8).forEach((h) => {
        messages.push({
          role: h.sender === "user" ? "user" : "assistant",
          content: h.content,
        });
      });
    }

    messages.push({ role: "user", content: message });

    // Try models in order of quality — use first one that works
    const groqModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "canopylabs/orpheus-v1-english"
    ];

    let reply = null;
    for (const modelName of groqModels) {
      try {
        const completion = await groq.chat.completions.create({
          messages,
          model: modelName,
          temperature: 0.6,
          max_tokens: 2048,
        });
        const candidate = completion.choices[0]?.message?.content;
        if (candidate && candidate.trim()) {
          reply = candidate.trim();
          console.log(`[AI] Groq answered via model: ${modelName}`);
          break;
        }
      } catch (modelErr) {
        console.warn(`Groq model [${modelName}] failed: ${modelErr.message}. Trying next...`);
      }
    }

    if (reply) return reply;
  } catch (err) {
    console.warn("Groq AI API error, falling back to other providers:", err.message || err);
  }
  return null;
};

// Universal Multi-Domain AI Chat Processor
const processAIChat = async (message, userRole = "user", userName = "User", history = []) => {
  // 1. Try Groq API first (fastest, best quality — llama-3.3-70b)
  const groqResponse = await queryGroqLLM(message, userRole, userName, history);
  if (groqResponse) {
    console.log("[AI] Answered via Groq LLM");
    return groqResponse;
  }

  // 2. Try Gemini API next
  if (apiKey) {
    try {
      const roleContext = userRole === "client" ? "a Project Client / Hiring Manager" : "a Freelancer & Specialist";
      const systemInstruction = `You are SkillBridge AI Assistant — a highly capable AI that answers ANY question accurately.
User: ${userName || "User"} (${roleContext}).
Answer the EXACT question asked. For coding questions, provide real working code with explanations.
Use Markdown with ### headings, bullet points, and \`\`\`code blocks\`\`\` for code.`;

      const formattedHistory = Array.isArray(history) && history.length > 0
        ? history.slice(-6).map(h => `${h.sender === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n\n")
        : "";
      const prompt = formattedHistory
        ? `${systemInstruction}\n\nConversation History:\n${formattedHistory}\n\nUser: ${message}`
        : `${systemInstruction}\n\nUser: ${message}`;

      const response = await generateWithModelFallback(prompt);
      if (response && response.trim()) {
        console.log("[AI] Answered via Gemini");
        return response;
      }
    } catch (error) {
      console.warn("Gemini AI API unavailable:", error.message || error);
    }
  }

  // 3. Try Pollinations (free open LLM)
  const openLLMResponse = await queryOpenLLM(message, userRole, userName);
  if (openLLMResponse) {
    console.log("[AI] Answered via Pollinations");
    return openLLMResponse;
  }

  // 4. Final fallback
  console.warn("[AI] All AI providers failed, using last-resort fallback");
  return generateSmartLocalResponse(message);
};


// Profile Improvement Analyzer
const analyzeProfileForImprovements = async (user) => {
  const currentSkills = user.skills && user.skills.length > 0 ? user.skills.join(", ") : "None listed";
  const userTitle = user.title || "Freelancer";
  const userBio = user.bio || "No bio provided";
  const userExperience = user.experience || 0;

  if (!apiKey) {
    return {
      profileStrength: 82,
      suggestedSkills: ["TypeScript", "Docker", "Next.js", "Redis", "CI/CD"],
      tips: [
        "Include specific technical frameworks and version numbers in your skills list",
        "Add at least 2 showcase projects with live demo or GitHub repository links",
        "Craft a client-centric bio highlighting project outcomes and ROI",
        "Set a competitive hourly rate matching your years of experience"
      ],
      summary: "Your profile has a strong foundation. Adding verified showcase projects will increase client contact rates by 60%."
    };
  }

  const prompt = `Analyze this freelancer profile and provide actionable optimization tips.
Title: ${userTitle}
Skills: ${currentSkills}
Bio: ${userBio}
Experience: ${userExperience} years

Provide response STRICTLY as a JSON object (no markdown code blocks):
{
  "profileStrength": <number 0-100>,
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "summary": "2-sentence summary."
}`;

  try {
    let text = await generateWithModelFallback(prompt);
    text = text.replace(/```json\n?|\n?```/gi, "").trim();
    const parsed = JSON.parse(text);
    return {
      profileStrength: Math.min(100, Math.max(0, parsed.profileStrength || 80)),
      suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills.slice(0, 5) : ["TypeScript", "Docker", "Next.js"],
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 4) : ["Add more portfolio samples."],
      summary: parsed.summary || "Profile looks promising! High-performing profiles include specific technical case studies."
    };
  } catch (error) {
    console.warn("Gemini AI error (analyzeProfileForImprovements fallback):", error.message || error);
    return {
      profileStrength: 80,
      suggestedSkills: ["TypeScript", "Docker", "Next.js"],
      tips: [
        "Highlight your top technical projects",
        "Detail your role in past client deliverables",
        "Keep your bio focused on client value"
      ],
      summary: "Solid profile foundation. Adding showcase links will boost client conversions."
    };
  }
};

// Project Budget Estimator
const suggestProjectBudget = async ({ title, description, skills = [], complexity = "Intermediate", duration = "2-3 weeks" }) => {
  const skillsStr = Array.isArray(skills) ? skills.join(", ") : skills || "General Development";

  const createFallbackSuggestion = () => ({
    recommendedBudgetType: "fixed",
    budgetMin: 800,
    budgetMax: 2200,
    hourlyRateMin: 35,
    hourlyRateMax: 65,
    estimatedHoursMin: 25,
    estimatedHoursMax: 50,
    estimatedDuration: duration || "2-3 weeks",
    reason: `Based on the project requirements ("${title || "Project"}") and tech stack (${skillsStr}), this scope corresponds to ${complexity} complexity deliverables.`
  });

  if (!apiKey) {
    return createFallbackSuggestion();
  }

  const prompt = `You are a senior technical estimator. Estimate budget for a project.
Title: ${title}
Description: ${description}
Required Skills: ${skillsStr}
Complexity: ${complexity}
Duration: ${duration}

Provide response STRICTLY as a JSON object (no markdown code blocks):
{
  "recommendedBudgetType": "fixed" or "hourly",
  "budgetMin": <number>,
  "budgetMax": <number>,
  "hourlyRateMin": <number>,
  "hourlyRateMax": <number>,
  "estimatedHoursMin": <number>,
  "estimatedHoursMax": <number>,
  "estimatedDuration": "X weeks",
  "reason": "Detailed 2-sentence explanation of pricing."
}`;

  try {
    let text = await generateWithModelFallback(prompt);
    text = text.replace(/```json\n?|\n?```/gi, "").trim();
    const parsed = JSON.parse(text);
    return {
      recommendedBudgetType: parsed.recommendedBudgetType || "fixed",
      budgetMin: Number(parsed.budgetMin) || 800,
      budgetMax: Number(parsed.budgetMax) || 2200,
      hourlyRateMin: Number(parsed.hourlyRateMin) || 35,
      hourlyRateMax: Number(parsed.hourlyRateMax) || 65,
      estimatedHoursMin: Number(parsed.estimatedHoursMin) || 25,
      estimatedHoursMax: Number(parsed.estimatedHoursMax) || 50,
      estimatedDuration: parsed.estimatedDuration || duration || "2-3 weeks",
      reason: parsed.reason || "Estimated based on project scope and technical complexity."
    };
  } catch (error) {
    console.warn("Gemini AI error (suggestProjectBudget fallback):", error.message || error);
    return createFallbackSuggestion();
  }
};

module.exports = {
  calculateSkillMatch,
  generateProposalText,
  optimizeProjectDescription,
  processAIChat,
  analyzeProfileForImprovements,
  suggestProjectBudget,
};
