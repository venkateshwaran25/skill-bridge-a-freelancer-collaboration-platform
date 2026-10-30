import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  AlertCircle,
  Lock,
  Mail,
  User,
  Briefcase,
  KeyRound,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  UserPlus,
  Zap,
  ShieldCheck,
  Check,
  Shield
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/marketplace/Button";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const registeredParam = searchParams.get("registered") === "true";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState("PASSWORD"); // "PASSWORD" or "OTP"
  const [otpCode, setOtpCode] = useState("");

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState(
    registeredParam
      ? "🎉 Registration successful! Account verified. Please enter your password to log in."
      : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Standard Email + Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      if (data.success) {
        login(data.token, data.user);
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Send Login OTP
  const handleSendLoginOTP = async () => {
    setError("");
    setInfoMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/send-otp", {
        email: normalizedEmail,
        purpose: "login",
      });

      if (data.success) {
        setInfoMsg(data.message || `Login 6-digit OTP code sent to ${normalizedEmail}`);
        if (data.devOtp) {
          setOtpCode(data.devOtp);
        }
        setLoginMethod("OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send login OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Verify Login OTP
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/verify-login-otp", {
        email: email.trim().toLowerCase(),
        otp: otpCode.trim(),
      });

      if (data.success) {
        login(data.token, data.user);
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Continue with Google Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setInfoMsg("");

    let targetEmail = email;
    if (!targetEmail || !targetEmail.toLowerCase().endsWith("@gmail.com")) {
      const prompted = window.prompt("Enter your Google Gmail address (@gmail.com):", email || "user@gmail.com");
      if (!prompted) return;
      targetEmail = prompted.trim();
    }

    if (!targetEmail.toLowerCase().endsWith("@gmail.com")) {
      setError("Only real Gmail (@gmail.com) accounts are supported.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/google", {
        email: targetEmail,
      });

      if (data.success) {
        login(data.token, data.user);
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Accounts Toolbar
  const handleFillDemo = (demoType) => {
    setError("");
    setInfoMsg("");
    setLoginMethod("PASSWORD");
    if (demoType === "freelancer") {
      setEmail("freelancer@skillbridge.ai");
      setPassword("password123");
    } else if (demoType === "client") {
      setEmail("client@skillbridge.ai");
      setPassword("password123");
    } else if (demoType === "admin") {
      setEmail("admin@skillbridge.ai");
      setPassword("admin123");
    }
  };

  return (
    <div
      className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center font-sans relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Warm background blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(253,230,138,0.3) 0%, rgba(253,230,138,0) 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] p-6 sm:p-8 relative z-10 space-y-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header Icon & Title */}
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow: "var(--shadow-amber)" }}
          >
            {loginMethod === "PASSWORD" ? (
              <Lock className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Lora', Georgia, serif", color: "var(--text-main)" }}
          >
            Log In to SkillBridge
          </h1>

          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {loginMethod === "PASSWORD"
              ? "Enter your credentials to access your dashboard"
              : `Enter the 6-digit OTP code sent to ${email}`}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* PASSWORD LOGIN FORM */}
          {loginMethod === "PASSWORD" && (
            <motion.form
              key="login_password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasswordLogin}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-sub)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: "var(--text-light)" }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-main)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-sub)" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: "var(--text-light)" }}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-main)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 font-bold shadow-[0_0_20px_rgba(124,58,237,0.35)] text-sm"
                disabled={loading}
                icon={LogIn}
              >
                {loading ? "Logging in..." : "Log In →"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleSendLoginOTP}
                  disabled={loading}
                  className="font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  style={{ color: "var(--primary)" }}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Log in via Gmail OTP instead
                </button>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-[1px]" style={{ background: "var(--border-color)" }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Or</span>
                <div className="flex-1 h-[1px]" style={{ background: "var(--border-color)" }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </motion.form>
          )}

          {/* OTP LOGIN FORM */}
          {loginMethod === "OTP" && (
            <motion.form
              key="login_otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyLoginOTP}
              className="space-y-4"
            >
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
                  className="w-full py-3.5 text-center text-2xl tracking-[10px] font-mono font-extrabold rounded-2xl bg-slate-900 border-2 border-sky-500/50 text-sky-400 placeholder-slate-600 focus:border-sky-400 outline-none shadow-[0_0_25px_rgba(14,165,233,0.25)]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] bg-gradient-to-r from-sky-600 to-blue-600 text-sm"
                disabled={loading || otpCode.length !== 6}
                icon={LogIn}
              >
                {loading ? "Verifying..." : "Verify OTP & Log In"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLoginMethod("PASSWORD")}
                  className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Password Login
                </button>

                <button
                  type="button"
                  onClick={handleSendLoginOTP}
                  disabled={loading}
                  className="font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  style={{ color: "var(--primary)" }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* New User Register CTA */}
        <div className="p-4 rounded-2xl text-center space-y-2"
          style={{ background: "var(--primary-soft)", border: "1px solid var(--primary-mid)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Don't have an account on SkillBridge yet?
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs transition-all no-underline"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", boxShadow: "var(--shadow-amber)" }}
          >
            <UserPlus className="w-4 h-4" />
            Create New Account
          </Link>
        </div>

        {/* Quick Demo Accounts Toolbar */}
        <div className="p-3.5 rounded-2xl space-y-2 text-xs"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
          <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: "var(--text-muted)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            Quick Demo Accounts (1-Click Fill)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Freelancer", type: "freelancer" },
              { label: "Client", type: "client" },
              { label: "Admin", type: "admin" },
            ].map(({ label, type }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFillDemo(type)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer text-center"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-sub)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary-soft)";
                  e.currentTarget.style.borderColor = "var(--primary-light)";
                  e.currentTarget.style.color = "var(--primary-dark)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-sub)";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
