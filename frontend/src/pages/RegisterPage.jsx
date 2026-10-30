import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Mail,
  KeyRound,
  Lock,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Zap,
  ShieldCheck,
  Check
} from "lucide-react";
import API from "../services/api";
import Button from "../components/marketplace/Button";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Registration Stepper States:
  // Step 1: "EMAIL" -> Enter email & Generate OTP
  // Step 2: "OTP" -> Enter 6-digit OTP & verify email
  // Step 3: "DETAILS" -> Set name, password, confirm password, and choose role (Client or Freelancer)
  const [step, setStep] = useState("EMAIL");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("freelancer"); // "freelancer" or "client"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP to Gmail
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/send-otp", {
        email: normalizedEmail,
        purpose: "register",
      });

      if (data.success) {
        setInfoMsg(data.message || `A 6-digit verification code has been sent to ${normalizedEmail}`);
        if (data.devOtp) {
          setOtpCode(data.devOtp);
        }
        setStep("OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        purpose: "register",
      });

      if (data.success) {
        setInfoMsg("Email verified successfully! Now choose your account role & set your password.");
        setStep("DETAILS");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password, Role, Details & Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/verify-register-otp", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        otp: otpCode.trim(),
      });

      if (data.success) {
        // Registration complete! Redirect to Login page as requested by user
        navigate(
          `/login?registered=true&email=${encodeURIComponent(
            email.trim().toLowerCase()
          )}`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white pt-28 pb-20 px-4 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow-purple w-[500px] h-[500px] -top-20 -left-20" />
      <div className="ambient-glow-blue w-[500px] h-[500px] bottom-0 -right-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-[28px] bg-[#1E293B]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative z-10 space-y-6"
      >
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(124,58,237,0.5)] text-white">
            {step === "EMAIL" && <Mail className="w-7 h-7" />}
            {step === "OTP" && <KeyRound className="w-7 h-7 text-sky-300" />}
            {step === "DETAILS" && <ShieldCheck className="w-7 h-7 text-emerald-400" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Join SkillBridge AI to post projects or hire top tech specialists
          </p>
        </div>

        {/* 3-Step Stepper Header */}
        <div className="grid grid-cols-3 gap-2 py-2">
          {/* Step 1 Indicator */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === "EMAIL"
                ? "bg-violet-600/20 border-violet-500 text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : step === "OTP" || step === "DETAILS"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                : "bg-slate-900 border-white/5 text-slate-400"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Step 1</div>
            <div className="text-xs flex items-center justify-center gap-1">
              {step === "OTP" || step === "DETAILS" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : null}
              1. Email & OTP
            </div>
          </div>

          {/* Step 2 Indicator */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === "OTP"
                ? "bg-sky-600/20 border-sky-500 text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                : step === "DETAILS"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                : "bg-slate-900 border-white/5 text-slate-400"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Step 2</div>
            <div className="text-xs flex items-center justify-center gap-1">
              {step === "DETAILS" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              2. Verify OTP
            </div>
          </div>

          {/* Step 3 Indicator */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-all ${
              step === "DETAILS"
                ? "bg-emerald-600/20 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-slate-900 border-white/5 text-slate-400"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Step 3</div>
            <div className="text-xs">3. Role & Password</div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Enter Email & Generate OTP */}
          {step === "EMAIL" && (
            <motion.form
              key="step_email"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleSendOTP}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Enter Your Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] text-sm"
                disabled={loading}
                icon={KeyRound}
              >
                {loading ? "Generating OTP..." : "Generate & Send Gmail OTP Code →"}
              </Button>

              <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-violet-400 hover:text-violet-300 font-bold no-underline"
                >
                  Log In Here
                </Link>
              </div>
            </motion.form>
          )}

          {/* STEP 2: Enter OTP Code & Verify */}
          {step === "OTP" && (
            <motion.form
              key="step_otp"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleVerifyOTP}
              className="space-y-4"
            >
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-medium">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-slate-400 hover:text-white text-[11px] underline bg-transparent border-none cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2 text-center uppercase tracking-wider">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-3.5 text-center text-2xl tracking-[10px] font-mono font-extrabold rounded-2xl bg-slate-900 border-2 border-sky-500/50 text-sky-300 placeholder-slate-600 focus:border-sky-400 outline-none shadow-[0_0_25px_rgba(14,165,233,0.25)]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] bg-gradient-to-r from-sky-600 to-blue-600 text-sm"
                disabled={loading || otpCode.length !== 6}
                icon={CheckCircle2}
              >
                {loading ? "Verifying Email..." : "Verify OTP Code →"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-slate-400 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend OTP Code
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: Enter Details, Select Role & Set Password */}
          {step === "DETAILS" && (
            <motion.form
              key="step_details"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleCompleteRegistration}
              className="space-y-4"
            >
              {/* Verified Email Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Email: {email}</span>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Choose Account Type (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("freelancer")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      role === "freelancer"
                        ? "bg-gradient-to-br from-violet-600/30 to-blue-600/30 border-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                        : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                      <User className="w-4 h-4 text-violet-400" />
                      Freelancer
                    </div>
                    <div className="text-[11px] text-slate-300 leading-tight">
                      Offer your services & apply to project listings
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      role === "client"
                        ? "bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      Client
                    </div>
                    <div className="text-[11px] text-slate-300 leading-tight">
                      Post projects & hire top tech specialists
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Venkatesh C"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:border-violet-500 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Set Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:border-violet-500 outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-400 text-sm focus:border-violet-500 outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-sm"
                disabled={loading || !password || password !== confirmPassword}
                icon={CheckCircle2}
              >
                {loading ? "Creating Account..." : "Complete Registration → Open Login Page 🎉"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold no-underline">
            Go to Login Page
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
