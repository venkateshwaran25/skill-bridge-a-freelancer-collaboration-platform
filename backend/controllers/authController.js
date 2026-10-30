const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge_secret_123";

// Helper: Extract client IP, device, and user-agent metadata
const getClientInfo = (req) => {
  const rawIp =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1";
  const ipAddress = Array.isArray(rawIp)
    ? rawIp[0]
    : typeof rawIp === "string"
    ? rawIp.split(",")[0].trim()
    : "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Browser Client";

  let device = "Desktop Browser";
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    device = "Mobile Device";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    device = "macOS";
  } else if (/windows nt/i.test(userAgent)) {
    device = "Windows PC";
  } else if (/linux/i.test(userAgent)) {
    device = "Linux";
  }

  return { ipAddress, device, userAgent };
};

// Helper: Auto-provision User if not found in MongoDB
const autoProvisionUser = async (email, password, role, clientInfo = {}) => {
  const targetRole = role || (email.includes("admin") ? "admin" : email.includes("client") ? "client" : "freelancer");
  
  // Clean readable name from email username
  const emailPrefix = email.split("@")[0];
  const formattedName = emailPrefix
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const name =
    targetRole === "admin"
      ? "SkillBridge Admin"
      : formattedName || "SkillBridge Specialist";

  const hashedPassword = await bcrypt.hash(password || "password123", 10);
  const now = new Date();

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: targetRole,
    title: targetRole === "freelancer" ? "Full Stack & AI Specialist" : "Project Client",
    skills: ["React", "Node.js", "Python", "MongoDB", "TailwindCSS"],
    bio: "Account created on SkillBridge AI platform.",
    rating: 5.0,
    lastLogin: now,
    loginHistory: [
      {
        loginAt: now,
        ipAddress: clientInfo.ipAddress || "127.0.0.1",
        device: clientInfo.device || "Desktop Browser",
        userAgent: (clientInfo.userAgent || "").substring(0, 150),
      },
    ],
  });

  return user;
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Prevent admin registration from public API
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be registered publicly",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { ipAddress, device, userAgent } = getClientInfo(req);
    const now = new Date();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "freelancer",
      skills: role === "freelancer" ? ["React", "Node.js", "JavaScript"] : [],
      lastLogin: now,
      loginHistory: [
        {
          loginAt: now,
          ipAddress,
          device,
          userAgent: userAgent.substring(0, 150),
        },
      ],
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during registration",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const clientInfo = getClientInfo(req);
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email address. Please register first.",
      });
    }

    // Role is automatically retrieved from user database record upon login

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update login timestamp & login history
    const now = new Date();
    user.lastLogin = now;
    const historyEntry = {
      loginAt: now,
      ipAddress: clientInfo.ipAddress,
      device: clientInfo.device,
      userAgent: clientInfo.userAgent.substring(0, 150),
    };
    user.loginHistory = [historyEntry, ...(user.loginHistory || [])].slice(0, 20);
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later.",
    });
  }
};

// Send OTP to Gmail
const sendOTP = async (req, res) => {
  try {
    const { email, purpose = "register" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Standard email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (purpose === "register") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email address. Please log in.",
        });
      }
    } else if (purpose === "login") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address. Please register first.",
        });
      }
    }

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Overwrite previous OTPs for this email and purpose
    await OTP.deleteMany({ email: normalizedEmail, purpose });

    // Save new OTP record
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose,
    });

    // Send Gmail OTP
    const mailResult = await sendOTPEmail(normalizedEmail, otpCode, purpose);
    const isConsoleFallback = mailResult.delivered === "console_fallback";

    res.status(200).json({
      success: true,
      message: isConsoleFallback
        ? `[Dev Mode] Verification code for ${normalizedEmail} is: ${otpCode} (Set EMAIL_USER & EMAIL_PASS in .env for real Gmail inbox delivery)`
        : `A 6-digit verification code has been sent to ${normalizedEmail}`,
      devOtp: isConsoleFallback ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP code. Please try again.",
    });
  }
};

// Verify OTP and Complete Registration
const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields including OTP code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check OTP record
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: "register",
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP verification code. Please request a new code.",
      });
    }

    // Check duplicate user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    // Delete verified OTP record
    await OTP.deleteMany({ email: normalizedEmail, purpose: "register" });

    // Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const clientInfo = getClientInfo(req);
    const now = new Date();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "freelancer",
      skills: role === "freelancer" ? ["React", "Node.js", "JavaScript"] : [],
      lastLogin: now,
      loginHistory: [
        {
          loginAt: now,
          ipAddress: clientInfo.ipAddress,
          device: clientInfo.device,
          userAgent: clientInfo.userAgent.substring(0, 150),
        },
      ],
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful! Account verified via Gmail OTP.",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Verify OTP & Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration verification.",
    });
  }
};

// Verify OTP and Login User
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check OTP record
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: "login",
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Delete verified OTP record
    await OTP.deleteMany({ email: normalizedEmail, purpose: "login" });

    // Update login history
    const clientInfo = getClientInfo(req);
    const now = new Date();
    user.lastLogin = now;
    const historyEntry = {
      loginAt: now,
      ipAddress: clientInfo.ipAddress,
      device: clientInfo.device,
      userAgent: clientInfo.userAgent.substring(0, 150),
    };
    user.loginHistory = [historyEntry, ...(user.loginHistory || [])].slice(0, 20);
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login Successful via Gmail OTP!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Verify OTP & Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login verification.",
    });
  }
};

// Seamless Continue with Google Sign-In
const googleAuth = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google Account email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      return res.status(400).json({
        success: false,
        message: "Only real Gmail (@gmail.com) Google accounts are supported.",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    // Auto-create user if first time Google Sign-In
    if (!user) {
      const emailPrefix = normalizedEmail.split("@")[0];
      const formattedName =
        name ||
        emailPrefix
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      const randomPassword = await bcrypt.hash(
        Date.now().toString() + "_google_secret",
        10
      );
      const clientInfo = getClientInfo(req);
      const now = new Date();

      user = await User.create({
        name: formattedName,
        email: normalizedEmail,
        password: randomPassword,
        role: role || "freelancer",
        isVerified: true,
        skills: ["React", "Node.js", "Python"],
        lastLogin: now,
        loginHistory: [
          {
            loginAt: now,
            ipAddress: clientInfo.ipAddress,
            device: clientInfo.device,
            userAgent: clientInfo.userAgent.substring(0, 150),
          },
        ],
      });
    } else {
      const clientInfo = getClientInfo(req);
      const now = new Date();
      user.lastLogin = now;
      const historyEntry = {
        loginAt: now,
        ipAddress: clientInfo.ipAddress,
        device: clientInfo.device,
        userAgent: clientInfo.userAgent.substring(0, 150),
      };
      user.loginHistory = [historyEntry, ...(user.loginHistory || [])].slice(0, 20);
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Google Sign-In Successful!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
};

// Verify OTP Code (Standalone check for Step 2)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = "register" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and 6-digit OTP code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired 6-digit OTP code. Please check your email or request a new code.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP code verified successfully!",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification.",
    });
  }
};

// Check if user exists (Amazon / Flipkart Auth Flow)
const checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        name: user.name,
        role: user.role,
        message: `Account found for ${user.name}. Please enter your password to log in.`,
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "New user detected. Verify your Gmail OTP to set password and create account.",
      });
    }
  } catch (error) {
    console.error("Check User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking account status.",
    });
  }
};

module.exports = {
  checkUser,
  register,
  login,
  sendOTP,
  verifyOTP,
  verifyOTPAndRegister,
  verifyOTPAndLogin,
  googleAuth,
};