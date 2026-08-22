import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  LogOut,
  Settings,
  X,
  ExternalLink,
  Edit2,
  ArrowLeft,
  Mail,
  Lock,
  LogIn
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import schoolBg from "@/imports/1.png";
const MAROON = "#7B1535";
const GOLD = "#C9A227";
const GOLD_LIGHT = "#F5E9BE";
const MAROON_HOVER = "#661128";
const BORDER = "rgba(123,21,53,0.16)";
const BANKS = [
  { id: 1, name: "HDFC Bank", initial: "H", accountNumber: "50100234567892", ifsc: "HDFC0001234", holder: "South Point School, Guwahati", color: "#1E3A5F" },
  { id: 2, name: "ICICI Bank", initial: "I", accountNumber: "003305678901234", ifsc: "ICIC0000033", holder: "South Point School, Guwahati", color: "#7A4C1A" },
  { id: 3, name: "State Bank of India", initial: "SB", accountNumber: "38012345678901", ifsc: "SBIN0001234", holder: "South Point School, Guwahati", color: "#1B3F5C" },
  { id: 4, name: "Axis Bank", initial: "A", accountNumber: "915010012345678", ifsc: "UTIB0001234", holder: "South Point School, Guwahati", color: "#5C2E6B" },
  { id: 5, name: "Kotak Mahindra Bank", initial: "K", accountNumber: "1234567890123", ifsc: "KKBK0001234", holder: "South Point School, Guwahati", color: "#7A1A1A" },
  { id: 6, name: "Yes Bank", initial: "Y", accountNumber: "009876543210123", ifsc: "YESB0001234", holder: "South Point School, Guwahati", color: "#1A3F6B" },
  { id: 7, name: "Punjab National Bank", initial: "PN", accountNumber: "017200012345678", ifsc: "PUNB0012345", holder: "South Point School, Guwahati", color: "#2C1A5F" },
  { id: 8, name: "Bank of Baroda", initial: "BB", accountNumber: "05120200000122", ifsc: "BARB0BORIVL", holder: "South Point School, Guwahati", color: "#5F3A0A" }
];
const USERS = ["Priya Sharma", "Rahul Verma", "Anita Nair", "Deepak Mehta"];
function maskAccount(num) {
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${num.slice(-4)}`;
}
function formatAccount(num) {
  return num.replace(/(.{4})/g, "$1 ").trim();
}
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function SchoolCrest({ size = 60 }) {
  const h = size * 1.12;
  return <svg width={size} height={h} viewBox="0 0 60 67" fill="none" xmlns="http://www.w3.org/2000/svg">
      {
    /* Shield body */
  }
      <path
    d="M30 3L4 14V35C4 49 16 60 30 64C44 60 56 49 56 35V14L30 3Z"
    fill={MAROON}
    stroke={GOLD}
    strokeWidth="2.5"
    strokeLinejoin="round"
  />
      {
    /* Inner shield ring */
  }
      <path
    d="M30 9L9 18V35C9 47 19 56 30 60C41 56 51 47 51 35V18L30 9Z"
    fill="none"
    stroke={GOLD}
    strokeWidth="1"
    opacity="0.5"
  />
      {
    /* Torch flame */
  }
      <path
    d="M30 18C30 18 24 24 24 30C24 33.8 26.7 37 30 38C33.3 37 36 33.8 36 30C36 24 30 18 30 18Z"
    fill={GOLD}
  />
      {
    /* Flame inner highlight */
  }
      <path
    d="M30 22C30 22 27 26 27 29C27 31 28.3 32.5 30 33C31.7 32.5 33 31 33 29C33 26 30 22 30 22Z"
    fill={MAROON}
    opacity="0.4"
  />
      {
    /* Torch handle */
  }
      <rect x="28" y="38" width="4" height="12" rx="2" fill={GOLD} />
      {
    /* Torch base */
  }
      <rect x="24.5" y="49" width="11" height="3" rx="1.5" fill={GOLD} />
    </svg>;
}
function AuthCard({ children }) {
  return <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {
    /* School building background */
  }
      <ImageWithFallback
    src={schoolBg}
    alt="South Point School, Guwahati campus building"
    className="absolute inset-0 w-full h-full object-cover"
  />
      {
    /* Maroon tinted overlay */
  }
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(80, 10, 25, 0.62)" }} />

      {
    /* Card */
  }
      <div className="relative z-10 w-full max-w-[360px] rounded-2xl overflow-hidden shadow-2xl">
        {
    /* Maroon header */
  }
        <div
    className="flex flex-col items-center py-7 px-6"
    style={{ backgroundColor: MAROON }}
  >
          <SchoolCrest size={58} />
          <h1
    className="mt-3 text-lg font-bold tracking-wide text-center"
    style={{ color: GOLD }}
  >
            South Point School
          </h1>
          <p
    className="text-[10px] font-semibold tracking-[0.18em] uppercase mt-0.5 text-center"
    style={{ color: GOLD, opacity: 0.85 }}
  >
            Guwahati
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ color: GOLD, opacity: 0.5 }} className="text-xs">—</span>
            <p
    className="text-[9.5px] font-semibold tracking-[0.22em] uppercase"
    style={{ color: GOLD, opacity: 0.75 }}
  >
              Credential Vault
            </p>
            <span style={{ color: GOLD, opacity: 0.5 }} className="text-xs">—</span>
          </div>
        </div>

        {
    /* White form body */
  }
        <div className="bg-white px-7 py-6">{children}</div>
      </div>
    </div>;
}
function AccountModal({ bank, onClose }) {
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: "rgba(80,10,25,0.5)" }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
      <div className="w-[520px] rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: BORDER }}>
        {
    /* Maroon modal header */
  }
        <div
    className="flex items-center justify-between px-5 py-4"
    style={{ backgroundColor: MAROON }}
  >
          <div className="flex items-center gap-3">
            <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: bank.color }}
  >
              <span className="text-white text-[10px] font-bold leading-none">{bank.initial}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[15px] font-semibold">{bank.name}</span>
              <button className="transition-colors" style={{ color: GOLD }} title="Open bank portal">
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
    style={{ color: GOLD }}
    title="Edit"
  >
              <Edit2 size={13} />
            </button>
            <button
    onClick={onClose}
    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10 text-white"
    title="Close"
  >
              <X size={15} />
            </button>
          </div>
        </div>

        {
    /* Body */
  }
        <div className="bg-white px-5 py-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Number
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#1A0810] text-sm font-mono">
                  {reveal ? formatAccount(bank.accountNumber) : maskAccount(bank.accountNumber)}
                </span>
                <button
    onClick={() => setReveal(!reveal)}
    className="transition-colors flex-shrink-0"
    style={{ color: GOLD }}
  >
                  {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                IFSC Code
              </p>
              <span className="text-[#1A0810] text-sm font-mono">{bank.ifsc}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Holder
              </p>
              <span className="text-[#1A0810] text-sm">{bank.holder}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Type
              </p>
              <span className="text-[#1A0810] text-sm">Current Account</span>
            </div>
          </div>
        </div>

        {
    /* Footer */
  }
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: BORDER, backgroundColor: "#FDFAFB" }}>
          <button
    className="flex-1 h-9 border-2 text-sm font-semibold rounded-lg transition-colors hover:text-white"
    style={{ borderColor: MAROON, color: MAROON }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = MAROON;
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = MAROON;
    }}
  >
            Corporate Login
          </button>
          <button
    className="flex-1 h-9 border-2 text-sm font-semibold rounded-lg transition-colors hover:text-white"
    style={{ borderColor: MAROON, color: MAROON }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = MAROON;
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = MAROON;
    }}
  >
            Personal Login
          </button>
        </div>
      </div>
    </div>;
}
function IconInput({
  icon,
  right,
  ...props
}) {
  return <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}>
        {icon}
      </span>
      <input
    {...props}
    className="w-full h-10 pl-9 pr-9 text-sm border rounded-lg bg-white text-[#1A0810] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
    style={{
      borderColor: BORDER
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = MAROON;
      e.currentTarget.style.boxShadow = `0 0 0 2px rgba(123,21,53,0.12)`;
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = BORDER;
      e.currentTarget.style.boxShadow = "none";
      props.onBlur?.(e);
    }}
  />
      {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
    </div>;
}
export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const otpRefs = useRef([]);
  useEffect(() => {
    if (screen !== "forgot-step2" || resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1e3);
    return () => clearInterval(id);
  }, [screen]);
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  const handleResend = () => {
    setOtpValues(["", "", "", "", "", ""]);
    setResendTimer(60);
    setCanResend(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };
  const goToDashboard = () => {
    setScreen("dashboard");
    setSelectedBank(null);
  };
  const sendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
    setOtpValues(["", "", "", "", "", ""]);
    setScreen("forgot-step2");
  };
  const primaryBtn = (label, onClick, icon, disabled = false) => <button
    onClick={onClick}
    disabled={disabled}
    className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ backgroundColor: disabled ? "#7B153580" : MAROON }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = MAROON_HOVER;
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = MAROON;
    }}
  >
      {icon}
      {label}
    </button>;
  if (screen === "login") {
    return <AuthCard>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
              Email Address
            </label>
            <IconInput
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="e.g. admin@school.edu"
      icon={<Mail size={14} />}
      onKeyDown={(e) => e.key === "Enter" && goToDashboard()}
    />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
              Password
            </label>
            <IconInput
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      icon={<Lock size={14} />}
      right={<button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="transition-colors"
        style={{ color: "#94A3B8" }}
      >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>}
      onKeyDown={(e) => e.key === "Enter" && goToDashboard()}
    />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
      className="w-4 h-4 rounded border cursor-pointer"
      style={{ accentColor: MAROON }}
    />
              <span className="text-sm text-[#7A6068]">Remember Me</span>
            </label>
            <button
      onClick={() => setScreen("forgot-step1")}
      className="text-sm font-medium transition-colors hover:underline"
      style={{ color: MAROON }}
    >
              Forgot Password?
            </button>
          </div>

          {primaryBtn("Log in", goToDashboard, <LogIn size={15} />)}
        </div>
      </AuthCard>;
  }
  if (screen === "forgot-step1") {
    return <AuthCard>
        <button
      onClick={() => setScreen("login")}
      className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70"
      style={{ color: MAROON }}
    >
          <ArrowLeft size={13} />
          Back to login
        </button>
        <h2 className="text-base font-semibold mb-1" style={{ color: MAROON }}>Reset Password</h2>
        <p className="text-sm text-[#7A6068] mb-4">
          We&apos;ll send a one-time code to your work email.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
              Work Email
            </label>
            <IconInput
      type="email"
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      placeholder="e.g. admin@school.edu"
      icon={<Mail size={14} />}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
    />
          </div>
          {primaryBtn("Send OTP", sendOtp)}
        </div>
      </AuthCard>;
  }
  if (screen === "forgot-step2") {
    const otpComplete = otpValues.every((v) => v !== "");
    return <AuthCard>
        <button
      onClick={() => setScreen("forgot-step1")}
      className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70"
      style={{ color: MAROON }}
    >
          <ArrowLeft size={13} />
          Back
        </button>
        <h2 className="text-base font-semibold mb-1" style={{ color: MAROON }}>Verify Identity</h2>
        <p className="text-sm text-[#7A6068] mb-5">
          6-digit code sent to{" "}
          <span className="font-medium text-[#1A0810]">{forgotEmail || "your email"}</span>
        </p>

        {
      /* OTP boxes */
    }
        <div className="flex gap-2 mb-4">
          {otpValues.map((val, i) => <input
      key={i}
      ref={(el) => {
        otpRefs.current[i] = el;
      }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={val}
      onChange={(e) => handleOtpChange(i, e.target.value)}
      onKeyDown={(e) => handleOtpKeyDown(i, e)}
      className="flex-1 h-12 text-center text-base font-bold border-2 rounded-lg bg-white text-[#1A0810] focus:outline-none transition-colors caret-transparent"
      style={{
        borderColor: val ? MAROON : BORDER,
        backgroundColor: val ? GOLD_LIGHT : "#fff"
      }}
    />)}
        </div>

        {
      /* Resend */
    }
        <div className="mb-4 h-5 flex items-center">
          {canResend ? <button
      onClick={handleResend}
      className="text-sm font-semibold hover:underline"
      style={{ color: MAROON }}
    >
              Resend code
            </button> : <span className="text-sm text-[#7A6068]">
              Resend in{" "}
              <span className="font-mono font-semibold" style={{ color: MAROON }}>
                0:{String(resendTimer).padStart(2, "0")}
              </span>
            </span>}
        </div>

        {primaryBtn("Verify & Reset Password", goToDashboard, void 0, !otpComplete)}
      </AuthCard>;
  }
  return <div className="min-h-screen bg-[#FAFAFA]">
      {
    /* Nav — maroon */
  }
      <nav
    className="h-14 flex items-center px-6 justify-between sticky top-0 z-20"
    style={{ backgroundColor: MAROON, borderBottom: `1px solid rgba(255,255,255,0.08)` }}
  >
        {
    /* Brand */
  }
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <SchoolCrest size={22} />
            <span className="text-white text-sm font-bold tracking-tight">Credential Vault</span>
          </div>
          <span
    className="text-[9px] font-semibold tracking-[0.18em] uppercase ml-6 -mt-0.5"
    style={{ color: GOLD, opacity: 0.8 }}
  >
            South Point School, Guwahati
          </span>
        </div>

        {
    /* Avatar menu */
  }
        <div className="relative">
          <button
    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
    className="flex items-center gap-2 h-8 px-2 rounded-lg transition-colors hover:bg-white/10"
  >
            <div
    className="w-7 h-7 rounded-full flex items-center justify-center border-2"
    style={{ backgroundColor: "rgba(201,162,39,0.2)", borderColor: GOLD }}
  >
              <span className="text-[10px] font-bold" style={{ color: GOLD }}>
                {getInitials(selectedUser)}
              </span>
            </div>
            <span className="text-sm text-white font-medium">{selectedUser}</span>
            <ChevronDown size={13} className="text-white/60" />
          </button>

          {avatarMenuOpen && <>
              <div className="fixed inset-0 z-10" onClick={() => setAvatarMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl z-30 py-1 overflow-hidden border" style={{ borderColor: BORDER }}>
                <div className="px-3 py-2.5 border-b" style={{ borderColor: BORDER, backgroundColor: "#FBF3F5" }}>
                  <p className="text-sm font-semibold" style={{ color: MAROON }}>{selectedUser}</p>
                  <p className="text-xs text-[#7A6068] mt-0.5">admin@southpoint.edu.in</p>
                </div>
                <button className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] hover:bg-[#FBF3F5] flex items-center gap-2.5 transition-colors">
                  <Settings size={13} style={{ color: MAROON }} />
                  Settings
                </button>
                <button
    onClick={() => {
      setAvatarMenuOpen(false);
      setScreen("login");
    }}
    className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] hover:bg-[#FBF3F5] flex items-center gap-2.5 transition-colors"
  >
                  <LogOut size={13} style={{ color: MAROON }} />
                  Sign out
                </button>
              </div>
            </>}
        </div>
      </nav>

      {
    /* Page content */
  }
      <main className="max-w-[1200px] mx-auto px-8 py-8">
        {
    /* Header row */
  }
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: MAROON }}>Account Vault</h1>
            <p className="text-sm text-[#7A6068] mt-1">
              Linked bank accounts — South Point School, Guwahati
            </p>
          </div>

          {
    /* User selector */
  }
          <div className="relative flex items-center gap-2">
            <span className="text-sm text-[#7A6068]">Viewing:</span>
            <button
    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
    className="flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg border text-sm font-medium transition-colors bg-white"
    style={{ borderColor: BORDER, color: MAROON }}
  >
              {selectedUser}
              <ChevronDown size={13} style={{ color: GOLD }} />
            </button>

            {userDropdownOpen && <>
                <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl z-20 py-1 overflow-hidden border" style={{ borderColor: BORDER }}>
                  {USERS.map((user) => <button
    key={user}
    onClick={() => {
      setSelectedUser(user);
      setUserDropdownOpen(false);
    }}
    className="w-full text-left px-3 py-2.5 text-sm transition-colors"
    style={user === selectedUser ? { color: MAROON, backgroundColor: "#FBF3F5", fontWeight: 600 } : { color: "#1A0810" }}
  >
                      {user}
                    </button>)}
                </div>
              </>}
          </div>
        </div>

        {
    /* Divider */
  }
        <div className="h-px mb-6" style={{ backgroundColor: BORDER }} />

        {
    /* Count badge */
  }
        <div className="flex items-center justify-between mb-4">
          <span
    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
    style={{ color: MAROON, backgroundColor: "#FBF3F5", border: `1px solid ${BORDER}` }}
  >
            {BANKS.length} Accounts
          </span>
        </div>

        {
    /* Account grid */
  }
        <div className="grid grid-cols-4 gap-3">
          {BANKS.map((bank) => <button
    key={bank.id}
    onClick={() => setSelectedBank(bank)}
    className="group bg-white rounded-xl p-4 text-left transition-all duration-150 focus:outline-none border"
    style={{ borderColor: BORDER }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = MAROON;
      e.currentTarget.style.backgroundColor = "#FBF3F5";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = BORDER;
      e.currentTarget.style.backgroundColor = "#FFFFFF";
    }}
  >
              <div className="flex items-start gap-3">
                <div
    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: bank.color }}
  >
                  <span className="text-white text-[10px] font-bold leading-none">{bank.initial}</span>
                </div>
                <div className="min-w-0 flex-1 mt-0.5">
                  <p className="text-sm font-semibold truncate" style={{ color: MAROON }}>
                    {bank.name}
                  </p>
                  <p className="text-[11px] font-mono mt-1 text-[#7A6068]">
                    {maskAccount(bank.accountNumber)}
                  </p>
                </div>
              </div>
              {
    /* Gold accent bottom bar on hover */
  }
              <div
    className="mt-3 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
    style={{ backgroundColor: GOLD }}
  />
            </button>)}
        </div>
      </main>

      {
    /* Modal */
  }
      {selectedBank && <AccountModal bank={selectedBank} onClose={() => setSelectedBank(null)} />}
    </div>;
}
