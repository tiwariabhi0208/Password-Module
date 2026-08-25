import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, LogIn, ArrowLeft, ChevronDown, Search, Grid, List, ShieldCheck, Users, Info, Copy, Check, Eye, Trash2, Plus, AlertCircle, Landmark, History, User, Settings as SettingsIcon, UserPlus } from "lucide-react";

import { MAROON, GOLD, GOLD_LIGHT, MAROON_HOVER, BORDER, T, radius } from "./components/theme";
import { BoyCharacter } from "./components/BoyCharacter";
import { CustomInput, FormLabel, IconInput } from "./components/CustomInput";
import { AuthCard } from "./components/AuthCard";
import { AccountModal } from "./components/AccountModal";
import { AddBankModal } from "./components/AddBankModal";
import { Header, USERS } from "./components/Header";
import { StealthLockScreen } from "./components/StealthLockScreen";
import { BankCard, getBankLogo } from "./components/BankCard";
import { Footer } from "./components/Footer";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { Sidebar } from "./components/Sidebar";
import { CopyButton } from "./components/CopyButton";
import { Settings } from "./components/Settings";

const BANKS = [
  { id: 1, name: "HDFC Bank", initial: "H", accountNumber: "50100234567892", ifsc: "HDFC0001234", holder: "South Point School, Guwahati", branchName: "Guwahati Main", username: "sps_hdfc_corp", password: "HdfcVault#2026", color: "#1E3A5F" },
  { id: 2, name: "ICICI Bank", initial: "I", accountNumber: "003305678901234", ifsc: "ICIC0000033", holder: "South Point School, Guwahati", branchName: "Beltola", username: "sps_icici_admin", password: "IciciSecure!99", color: "#7A4C1A" },
  { id: 3, name: "State Bank of India", initial: "SB", accountNumber: "38012345678901", ifsc: "SBIN0001234", holder: "South Point School, Guwahati", branchName: "Dispur", username: "sps_sbi_vault", password: "SbiPassphrase*12", color: "#1B3F5C" },
  { id: 4, name: "Axis Bank", initial: "A", accountNumber: "915010012345678", ifsc: "UTIB0001234", holder: "South Point School, Guwahati", branchName: "Ganeshguri", username: "sps_axis_pay", password: "AxisKey#Secure1", color: "#5C2E6B" },
  { id: 5, name: "Kotak Mahindra Bank", initial: "K", accountNumber: "1234567890123", ifsc: "KKBK0001234", holder: "South Point School, Guwahati", branchName: "Zoo Road", username: "sps_kotak_fin", password: "KotakPass$882", color: "#7A1A1A" },
  { id: 6, name: "Yes Bank", initial: "Y", accountNumber: "009876543210123", ifsc: "YESB0001234", holder: "South Point School, Guwahati", branchName: "Bhangagarh", username: "sps_yes_corp", password: "YesBank#9021", color: "#1A3F6B" },
  { id: 7, name: "Punjab National Bank", initial: "PN", accountNumber: "017200012345678", ifsc: "PUNB0012345", holder: "South Point School, Guwahati", branchName: "Maligaon", username: "sps_pnb_vault", password: "PnbToken@Secure", color: "#2C1A5F" },
  { id: 8, name: "Bank of Baroda", initial: "BB", accountNumber: "05120200000122", ifsc: "BARB0BORIVL", holder: "South Point School, Guwahati", branchName: "Paltan Bazaar", username: "sps_bob_admin", password: "BobPassword!77", color: "#5F3A0A" }
];

const INITIAL_ACTIVITIES = [
  { id: 1, time: "Today, 12:05 PM", action: "Credential Accessed", details: "Viewed password details for HDFC Bank", user: "Priya Sharma", type: "success", ip: "192.168.1.45" },
  { id: 2, time: "Today, 11:32 AM", action: "Lock Screen Triggered", details: "Stealth mode manual activation", user: "Priya Sharma", type: "info", ip: "192.168.1.45" },
  { id: 3, time: "Yesterday, 04:10 PM", action: "Account Added", details: "Added Kotak Mahindra Bank account", user: "Rahul Verma", type: "success", ip: "192.168.1.98" },
  { id: 4, time: "21 Aug, 09:12 AM", action: "Failed Authentication", details: "Invalid stealth password entered", user: "System", type: "error", ip: "172.56.21.9" },
  { id: 5, time: "18 Aug, 02:40 PM", action: "Account Deleted", details: "Deleted Yes Bank account details", user: "Anita Nair", type: "warning", ip: "192.168.1.14" }
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [focusField, setFocusField] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState(BANKS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [entities, setEntities] = useState([
    { id: 1, name: "Priya Sharma", phone: "+91 98450 12345", email: "priya.sharma@southpoint.edu.in" },
    { id: 2, name: "Rahul Verma", phone: "+91 97060 54321", email: "rahul.verma@southpoint.edu.in" },
    { id: 3, name: "Anita Nair", phone: "+91 88760 98765", email: "anita.nair@southpoint.edu.in" },
    { id: 4, name: "Deepak Mehta", phone: "+91 94350 55667", email: "deepak.mehta@southpoint.edu.in" }
  ]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteBank, setDeleteBank] = useState(null);
  const [activeTab, setActiveTab] = useState("vault");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logFilterSeverity, setLogFilterSeverity] = useState("all");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [timeoutEnabled, setTimeoutEnabled] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logActivity = (action, details, type) => {
    setActivities((prev) => [
      {
        id: Date.now(),
        time: "Just now",
        action,
        details,
        user: selectedUser,
        type,
        ip: "192.168.1.45"
      },
      ...prev
    ]);
  };

  const handleViewBank = (bank) => {
    setSelectedBank(bank);
    if (bank) {
      logActivity("Credential Accessed", `Viewed credentials for ${bank.name}`, "success");
    }
  };

  const [stealthPassword, setStealthPassword] = useState("");
  const [stealthError, setStealthError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) { }
  }, []);

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

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        if (rememberMe) {
          localStorage.setItem("remembered_email", email.trim());
        } else {
          localStorage.removeItem("remembered_email");
        }
      } catch (err) { }

      setSuccess("Login successful!");
      setTimeout(() => {
        goToDashboard();
        setSuccess("");
      }, 400);
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    setScreen("dashboard");
    setSelectedBank(null);
    setUserDropdownOpen(true);
  };

  const sendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
    setOtpValues(["", "", "", "", "", ""]);
    setScreen("forgot-step2");
  };

  const primaryBtn = (label, onClick, icon, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
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
    </button>
  );

  if (screen === "login") {
    return (
      <AuthCard sideElement={<BoyCharacter state={focusField} />}>
        {error && (
          <div
            style={{
              background: T.redLight,
              border: `1px solid ${T.red}33`,
              color: T.red,
              padding: "8px 12px",
              borderRadius: radius.md,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 14,
              lineHeight: 1.4,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: T.greenLight,
              border: `1px solid ${T.green}33`,
              color: T.green,
              padding: "8px 12px",
              borderRadius: radius.md,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 14,
              lineHeight: 1.4,
            }}
          >
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 14 }} method="POST" action="#">
          <div>
            <FormLabel text="Email Address" />
            <CustomInput
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              }
              type="email"
              name="username"
              id="admin-email"
              autoComplete="username"
              placeholder="e.g. admin@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField(null)}
              required
            />
          </div>

          <div>
            <FormLabel text="Password" />
            <CustomInput
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              }
              type={showPassword ? "text" : "password"}
              name="password"
              id="admin-password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle={true}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField(null)}
              required
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: -6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  accentColor: T.primary,
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.inkLight,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Remember Me
              </label>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setScreen("forgot-step1");
              }}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: T.primary,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="btn-hover"
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${T.primary} 0%, #4c0519 100%)`,
              border: "none",
              borderRadius: 99,
              padding: "10px 0",
              width: "100%",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 20px rgba(114, 16, 42, 0.2)",
              marginTop: 4,
              transition: "all 0.2s"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>{loading ? "Logging in…" : "Log in"}</span>
          </button>
        </form>
      </AuthCard>
    );
  }

  if (screen === "forgot-step1") {
    return (
      <AuthCard>
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
      </AuthCard>
    );
  }

  if (screen === "forgot-step2") {
    const otpComplete = otpValues.every((v) => v !== "");
    return (
      <AuthCard>
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

        <div className="flex gap-2 mb-4">
          {otpValues.map((val, i) => (
            <input
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
            />
          ))}
        </div>

        <div className="mb-4 h-5 flex items-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold hover:underline"
              style={{ color: MAROON }}
            >
              Resend code
            </button>
          ) : (
            <span className="text-sm text-[#7A6068]">
              Resend in{" "}
              <span className="font-mono font-semibold" style={{ color: MAROON }}>
                0:{String(resendTimer).padStart(2, "0")}
              </span>
            </span>
          )}
        </div>

        {primaryBtn("Verify & Reset Password", goToDashboard, undefined, !otpComplete)}
      </AuthCard>
    );
  }

  if (stealthMode) {
    return (
      <StealthLockScreen
        stealthPassword={stealthPassword}
        setStealthPassword={setStealthPassword}
        stealthError={stealthError}
        setStealthError={setStealthError}
        password={password}
        setStealthMode={setStealthMode}
        setScreen={setScreen}
      />
    );
  }

  const filteredBanks = banks.filter((bank) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      bank.name.toLowerCase().includes(q) ||
      (bank.holder && bank.holder.toLowerCase().includes(q)) ||
      bank.accountNumber.includes(q) ||
      (bank.ifsc && bank.ifsc.toLowerCase().includes(q)) ||
      (bank.branchName && bank.branchName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#080808] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      <Header
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setScreen={setScreen}
        setStealthMode={setStealthMode}
        onNavigate={setActiveTab}
      />

      <div className="flex-grow flex w-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => {
            setScreen("login");
            setActiveTab("vault");
          }}
          vaultCount={banks.length}
        />

        <main className="flex-grow min-w-0 px-4 sm:px-8 py-5 pb-24 md:pb-5">
          {activeTab === "vault" && (
            <>
              {/* Header Title section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800" style={{ borderColor: BORDER }}>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Account Vault</h1>
                  <p className="text-sm text-[#7A6068] mt-0.5 font-medium">
                    Linked bank credentials — South Point School, Guwahati
                  </p>
                </div>

                {/* Highly Visible Active User Indicator */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-extrabold text-[#7A6068] dark:text-slate-400 uppercase tracking-widest shrink-0">Active Session:</span>
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2.5 h-12 px-5 rounded-xl border border-slate-250 dark:border-slate-800 text-sm font-black transition-all bg-[#FBF3F5] dark:bg-[#221015]/60 hover:bg-[#F5ECEE] dark:hover:bg-[#2a131a] border-[#7B1535]/30 hover:border-[#7B1535]/50 text-[#7B1535] dark:text-[#E27D9B] cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      Viewing: {selectedUser}
                      <ChevronDown size={15} style={{ color: GOLD }} />
                    </button>

                    {userDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#151515] rounded-xl shadow-xl z-20 py-1 overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ borderColor: BORDER }}>
                          {USERS.map((user) => (
                            <button
                              key={user}
                              onClick={() => {
                                setSelectedUser(user);
                                setUserDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${user === selectedUser ? "bg-[#FBF3F5] dark:bg-[#221015]" : "hover:bg-slate-50 dark:hover:bg-[#202020]"}`}
                              style={user === selectedUser ? { color: MAROON } : { color: "#1A0810" }}
                            >
                              <span className="dark:text-slate-200">{user}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {/* Stats Card 1: Total Vault Accounts */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FBF3F5] dark:bg-[#221015]/60" style={{ color: MAROON }}>
                    <Users size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Active Bank Accounts</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-none">{banks.length}</span>
                      <span className="text-xs font-semibold text-[#16A34A] dark:text-[#18c459]">Monitored</span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#7B1535] dark:bg-[#E27D9B] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((banks.length / 12) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Stats Card 2: Security Status */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-950/20 text-[#16A34A]">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Security Coverage</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-none">AES-256</span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">ENCRYPTED</span>
                    </div>
                    <p className="text-[10.5px] text-[#7A6068] dark:text-slate-400 mt-2 font-medium leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                      Vault database active & locked
                    </p>
                  </div>
                </div>

                {/* Stats Card 3: Active Session Info */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border bg-[#FBF3F5] dark:bg-[#221015] border-slate-200 dark:border-slate-800"
                    style={{ color: MAROON }}
                  >
                    {selectedUser.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Active Administrator</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-1 leading-tight">{selectedUser}</h3>
                    <span
                      className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-1.5 border border-slate-200 dark:border-slate-800 bg-[#FBF3F5] dark:bg-[#221015]/60 text-[#7B1535] dark:text-[#E27D9B]"
                    >
                      Access Level 3
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-[#101010] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderColor: BORDER }}>
                {/* Left: Search input */}
                <div className="relative flex-grow max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by bank name, cardholder, account #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm border bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-colors"
                    style={{ borderColor: BORDER }}
                  />
                </div>

                {/* Right: Layout Switcher, View State, and Add Button */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Grid / List View Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-[#1c1c1c] text-[#7B1535] dark:text-[#E27D9B] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}
                      title="Grid View"
                    >
                      <Grid size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-[#1c1c1c] text-[#7B1535] dark:text-[#E27D9B] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}
                      title="List View"
                    >
                      <List size={15} />
                    </button>
                  </div>

                  {/* Add Account Button */}
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-102"
                    style={{ backgroundColor: MAROON }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                  >
                    <Plus size={14} />
                    Add Account
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              {filteredBanks.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed text-center p-6" style={{ borderColor: BORDER }}>
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No accounts match your search</h3>
                  <p className="text-xs text-[#7A6068] mt-1 max-w-xs leading-relaxed">
                    Try checking your spelling or search terms, or clear the search to view all bank credentials.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 bg-[#7B1535] hover:bg-[#661128] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                /* Grid View (Redesigned Premium Cards) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {filteredBanks.map((bank) => (
                    <BankCard
                      key={bank.id}
                      bank={bank}
                      onClick={() => handleViewBank(bank)}
                      onConfirmDelete={(bankObj) => setDeleteBank(bankObj)}
                    />
                  ))}
                </div>
              ) : (
                /* List View (Sleek Administrative Table) */
                <div className="bg-white dark:bg-[#101010] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm" style={{ borderColor: BORDER }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50/50 dark:bg-slate-900/40 text-[10px] font-bold uppercase tracking-widest text-[#7A6068] dark:text-slate-400 border-slate-200 dark:border-slate-800" style={{ borderColor: BORDER }}>
                          <th className="py-3.5 px-5">Bank</th>
                          <th className="py-3.5 px-5">Account Holder</th>
                          <th className="py-3.5 px-5">Account Number</th>
                          <th className="py-3.5 px-5">IFSC Code</th>
                          <th className="py-3.5 px-5">Branch</th>
                          <th className="py-3.5 px-5 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                        {filteredBanks.map((bank) => (
                          <tr key={bank.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1c1c1c]/40 transition-colors group">
                            {/* Bank Name */}
                            <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-2.5">
                                {getBankLogo(bank.name) ? (
                                  <img
                                    src={getBankLogo(bank.name)}
                                    alt={bank.name}
                                    className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200/60 dark:border-slate-850 shrink-0"
                                  />
                                ) : (
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                    style={{ backgroundColor: bank.color }}
                                  >
                                    {bank.initial || bank.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span>{bank.name}</span>
                              </div>
                            </td>

                            {/* Account Holder */}
                            <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-semibold">{bank.holder ? bank.holder.split(",")[0] : "SOUTH POINT SCHOOL"}</td>

                            {/* Account Number */}
                            <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span>{`•••• •••• •••• ${bank.accountNumber.slice(-4)}`}</span>
                                <CopyButton value={bank.accountNumber} label="Account Number" />
                              </div>
                            </td>

                            {/* IFSC Code */}
                            <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span>{bank.ifsc}</span>
                                <CopyButton value={bank.ifsc} label="IFSC Code" />
                              </div>
                            </td>

                            {/* Branch */}
                            <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-semibold">{bank.branchName}</td>

                            {/* Actions */}
                            <td className="py-3.5 px-5 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewBank(bank)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#202020] text-slate-500 hover:text-[#7B1535] dark:hover:text-[#E27D9B] transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => setDeleteBank(bank)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "entities" && (() => {
            return (
              <div className="w-full text-left animate-fade-in">
                <div className="mb-5">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Register Entity</h1>
                  <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                    Manage and register authorized school branches, administrators, or contact nodes
                  </p>
                </div>
                <div className="h-px mb-8" style={{ backgroundColor: BORDER }} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Entities List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                      Registered Entities ({entities.length})
                    </h3>

                    {entities.length === 0 ? (
                      <div className="text-center py-12 bg-white dark:bg-[#101010] border border-dashed rounded-2xl p-6 text-slate-400" style={{ borderColor: BORDER }}>
                        No registered entities found. Use the form to add one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entities.map((entity) => (
                          <div
                            key={entity.id}
                            className="bg-white dark:bg-[#101010] p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                            style={{ borderColor: BORDER }}
                          >
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: MAROON }} />
                            
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 truncate pr-6">{entity.name}</h4>
                            <div className="mt-3 space-y-1.5 text-xs text-[#7A6068] dark:text-slate-400 font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">✉</span>
                                <span className="font-mono">{entity.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">📞</span>
                                <span className="font-mono">{entity.phone}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setEntities(entities.filter(e => e.id !== entity.id));
                                logActivity("Entity Removed", `Removed entity: ${entity.name}`, "warning");
                              }}
                              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-655 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent"
                              title="Remove Entity"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Add Entity Form */}
                  <div className="lg:col-span-1 bg-white dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl h-fit shadow-sm" style={{ borderColor: BORDER }}>
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                      Add New Entity
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const name = formData.get("entityName").trim();
                        const email = formData.get("entityEmail").trim();
                        const phone = formData.get("entityPhone").trim();

                        if (!name || !email || !phone) {
                          alert("All fields are required.");
                          return;
                        }

                        const newEntity = {
                          id: Date.now(),
                          name,
                          email,
                          phone
                        };

                        setEntities([...entities, newEntity]);
                        logActivity("Entity Registered", `Registered new entity: ${name}`, "updated");
                        e.target.reset();
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Full Name / Entity Name
                        </label>
                        <input
                          type="text"
                          name="entityName"
                          required
                          placeholder="e.g. Guwahati North Campus"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Email ID
                        </label>
                        <input
                          type="email"
                          name="entityEmail"
                          required
                          placeholder="e.g. north.campus@school.edu"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="entityPhone"
                          required
                          placeholder="e.g. +91 94350 55667"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md mt-2 flex items-center justify-center gap-1.5 border-none"
                        style={{ backgroundColor: MAROON }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                      >
                        Register Entity
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === "activity" && (() => {
            const filteredActivities = activities.filter((act) => {
              const q = logSearchQuery.toLowerCase().trim();
              const matchesQuery = !q ||
                act.action.toLowerCase().includes(q) ||
                act.details.toLowerCase().includes(q) ||
                act.user.toLowerCase().includes(q) ||
                act.ip.toLowerCase().includes(q);

              const matchesSeverity = logFilterSeverity === "all" || act.type === logFilterSeverity;

              return matchesQuery && matchesSeverity;
            });

            return (
              <>
                <div className="mb-5 text-left">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Activity Log</h1>
                  <p className="text-sm text-[#7A6068] mt-0.5 font-medium">
                    Audit trail and security events on the vault database
                  </p>
                </div>

                <div className="h-px mb-5" style={{ backgroundColor: BORDER }} />

                {/* Filters and Search toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  {/* Search */}
                  <div className="relative flex-grow max-w-sm">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search logs by action, user, IP..."
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 text-xs font-semibold border bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] text-slate-800 dark:text-slate-200 transition-colors"
                      style={{ borderColor: BORDER }}
                    />
                  </div>

                  {/* Severity Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "all", label: "All Logs", color: "bg-slate-500" },
                      { id: "success", label: "Viewed", color: "bg-[#16A34A]" },
                      { id: "info", label: "Updated", color: "bg-[#1E3A5F]" },
                      { id: "warning", label: "Warning", color: "bg-[#C9A227]" },
                      { id: "error", label: "Error", color: "bg-[#DC2626]" }
                    ].map((sev) => {
                      const isActive = logFilterSeverity === sev.id;
                      const count = sev.id === "all"
                        ? activities.length
                        : activities.filter(a => a.type === sev.id).length;

                      return (
                        <button
                          key={sev.id}
                          onClick={() => setLogFilterSeverity(sev.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${isActive
                            ? "bg-[#7B1535] text-white shadow-sm border-transparent"
                            : "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                            }`}
                          style={!isActive ? { borderColor: BORDER } : {}}
                        >
                          {sev.id !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${sev.color}`} />}
                          {sev.label}
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audit trail feed */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: BORDER }}>
                  {filteredActivities.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                      <AlertCircle size={28} className="text-slate-300 mb-2" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">No logs found matching criteria</span>
                      <span className="text-[11px] text-[#7A6068] dark:text-slate-400 mt-1 leading-none">Try resetting your filter or search query.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredActivities.map((log) => {
                        const badgeStyles = {
                          success: { text: "#16A34A", bg: "#F0FDF4", darkBg: "#122a18", border: "border-l-[#16A34A]" },
                          info: { text: "#1E3A5F", bg: "#E8F0F8", darkBg: "#101f30", border: "border-l-[#1E3A5F]" },
                          warning: { text: "#C9A227", bg: "#FDF8E8", darkBg: "#2c2512", border: "border-l-[#C9A227]" },
                          error: { text: "#DC2626", bg: "#FDF2F2", darkBg: "#321515", border: "border-l-[#DC2626]" }
                        }[log.type] || { text: "#7A6068", bg: "#F5ECEE", darkBg: "#221a1a", border: "border-l-slate-300" };

                        return (
                          <div
                            key={log.id}
                            className={`p-4 pl-5 border-l-4 ${badgeStyles.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-[#1a1a1a]/30 transition-colors`}
                          >
                            <div className="flex flex-col gap-1.5 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full dark:bg-opacity-30"
                                  style={{ color: badgeStyles.text, backgroundColor: document.documentElement.classList.contains("dark") ? badgeStyles.darkBg : badgeStyles.bg }}
                                >
                                  {log.action}
                                </span>
                                <span className="text-xs text-[#7A6068] dark:text-slate-400 font-semibold">{log.time}</span>
                              </div>
                              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{log.details}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-[#7A6068] sm:text-right">
                              <div>
                                <span className="block text-sm text-slate-900 dark:text-slate-200 font-extrabold">{log.user}</span>
                                <span className="block text-xs text-[#7A6068]/80 font-mono mt-0.5">{log.ip}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {activeTab === "profile" && (() => {
            const USER_PROFILES = {
              "Priya Sharma": {
                email: "priya.sharma@southpoint.edu.in",
                phone: "+91 98450 12345",
                dept: "Accounts & Finance Division",
                campus: "Guwahati Main Campus, Assam",
                clearance: "Level 3 - Super Administrator",
                designation: "Chief Accounts Officer (CAO)",
                session_id: "SPS-ADM-301-PRIYA",
                auth_time: "25 Aug 2026, 09:30 AM",
                ip: "192.168.1.12",
                publicKey: "sha256:f7b1535b4a9b227cf842d0c321e6d7821c3b5f842d0c321e6d7821c3b5f842d0",
                status: "Active / Encrypted Session"
              },
              "Rahul Verma": {
                email: "rahul.verma@southpoint.edu.in",
                phone: "+91 97060 54321",
                dept: "General Administration",
                campus: "Guwahati East Branch, Assam",
                clearance: "Level 1 - Read-Only Clerk",
                designation: "Accounts Assistant",
                session_id: "SPS-ADM-104-RAHUL",
                auth_time: "25 Aug 2026, 08:45 AM",
                ip: "192.168.1.45",
                publicKey: "sha256:d8c1928ab02b189cd458b1a1a1a1a1a1d8c1928ab02b189cd458b1a1a1a1a1d8",
                status: "Active / Encrypted Session"
              },
              "Anita Nair": {
                email: "anita.nair@southpoint.edu.in",
                phone: "+91 88760 98765",
                dept: "Audit & Risk Compliance",
                campus: "Guwahati South Campus, Assam",
                clearance: "Level 2 - Operator Manager",
                designation: "Senior Compliance Auditor",
                session_id: "SPS-ADM-205-ANITA",
                auth_time: "25 Aug 2026, 10:15 AM",
                ip: "192.168.1.28",
                publicKey: "sha256:b5c4210e194e354aa907d458b1a1a1a1b5c4210e194e354aa907d458b1a1a1a1",
                status: "Active / Encrypted Session"
              },
              "Deepak Mehta": {
                email: "deepak.mehta@southpoint.edu.in",
                phone: "+91 94350 55667",
                dept: "Information Technology",
                campus: "Guwahati North Campus, Assam",
                clearance: "Level 2 - Operator Manager",
                designation: "Systems IT Coordinator",
                session_id: "SPS-ADM-209-DEEPAK",
                auth_time: "25 Aug 2026, 09:10 AM",
                ip: "192.168.1.34",
                publicKey: "sha256:e6d7821c3b5f842dc321f842d0c321e6d7821c3b5f842d0c321e6d7821c3b5f8",
                status: "Active / Encrypted Session"
              }
            };
            const profile = USER_PROFILES[selectedUser] || USER_PROFILES["Priya Sharma"];

            return (
              <div className="w-full text-left animate-fade-in">
                <div className="mb-5">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Profile Details</h1>
                  <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                    Your administrator security credentials and role assignment
                  </p>
                </div>

                <div className="h-px mb-8" style={{ backgroundColor: BORDER }} />

                {/* Profile Main Header Information Panel */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-inner bg-[#F5ECEE] dark:bg-[#221015]/60 shrink-0"
                      style={{ color: MAROON }}
                    >
                      {selectedUser.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 leading-none">{selectedUser}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800"
                          style={{ color: MAROON }}
                        >
                          {profile.designation}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Dept: {profile.dept}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl">
                    <div className="relative flex items-center justify-center w-2.5 h-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">STATUS</span>
                      <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">{profile.status}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Grid Information Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Card 1: Account Information */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      Personal & Role Info
                    </h3>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Full Name</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{selectedUser}</span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Designation</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.designation}</span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Department</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.dept}</span>
                    </div>
                  </div>

                  {/* Card 2: Contact & Location */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      Contact & Assignment
                    </h3>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Email Address</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base font-mono">{profile.email}</span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Phone Number</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base font-mono">{profile.phone}</span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Assigned Campus</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.campus}</span>
                    </div>
                  </div>

                  {/* Card 3: Security & Session Credentials */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      Security Clearance
                    </h3>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Vault Access Clearance</span>
                      <span className="text-red-700 dark:text-red-500 font-extrabold mt-1.5 block text-base flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 dark:bg-red-500 animate-pulse" />
                        {profile.clearance}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Session Token ID</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-bold mt-1.5 block text-sm truncate" title={profile.session_id}>
                        {profile.session_id}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Assigned IP Address</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-bold mt-1.5 block text-sm">{profile.ip}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Row: Encryption Details covering wide screen */}
                <div className="mt-10 p-5 bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Cryptographic Public Signature Token
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-[11px] font-mono text-slate-650 dark:text-slate-400 break-all select-all font-semibold">
                      {profile.publicKey}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#7B1535] dark:text-[#E27D9B] bg-[#FBF3F5] dark:bg-[#221015] border border-[#7B1535]/14 dark:border-[#E27D9B]/15 px-3 py-1 rounded-lg shrink-0 uppercase tracking-widest">
                      AES-256 Verified
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === "password" && (() => {
            const getPasswordStrength = (pass) => {
              if (!pass) return { score: 0, label: "None", color: "bg-slate-200", width: "0%" };
              let score = 0;
              if (pass.length >= 6) score += 1;
              if (pass.length >= 10) score += 1;
              if (/[0-9]/.test(pass)) score += 1;
              if (/[A-Z]/.test(pass)) score += 1;
              if (/[^A-Za-z0-9]/.test(pass)) score += 1;

              if (score <= 2) return { score, label: "Weak", color: "bg-red-500", width: "33%" };
              if (score <= 4) return { score, label: "Medium", color: "bg-amber-500", width: "66%" };
              return { score, label: "Strong", color: "bg-green-500", width: "100%" };
            };

            const strength = getPasswordStrength(newPasswordVal);

            return (
              <div className="w-full text-left animate-fade-in">
                <div className="mb-5">
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Change Password</h1>
                  <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                    Update your vault master password for enhanced security
                  </p>
                </div>
                <div className="h-px mb-8" style={{ backgroundColor: BORDER }} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Form Inputs */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPassword(newPasswordVal);
                      logActivity("Security Alert", "Master password updated successfully", "warning");
                      alert("Master password updated successfully!");
                      setNewPasswordVal("");
                      e.target.reset();
                    }}
                    className="lg:col-span-2 space-y-5"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                        Current Master Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 text-base border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all input-focus-container"
                        style={{ borderColor: BORDER }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                        New Master Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="w-full h-11 px-3.5 text-base border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all input-focus-container"
                        style={{ borderColor: BORDER }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full h-11 px-3.5 text-base border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all input-focus-container"
                        style={{ borderColor: BORDER }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-11 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md mt-2 flex items-center justify-center gap-1.5 border-none"
                      style={{ backgroundColor: MAROON }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                    >
                      Update Master Password
                    </button>
                  </form>

                  {/* Right: Strength Checker & Policy Rules card */}
                  <div className="lg:col-span-1 bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-5.5 rounded-2xl flex flex-col justify-between h-fit gap-5">
                    <div>
                      <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                        Complexity Audit
                      </h3>

                      {newPasswordVal ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-[#7A6068] dark:text-slate-400">Strength:</span>
                            <span
                              style={{
                                color: strength.score <= 2 ? "#DC2626" : strength.score <= 4 ? "#D97706" : "#16A34A"
                              }}
                            >
                              {strength.label}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                              style={{ width: strength.width }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 dark:text-slate-500 font-semibold text-xs flex flex-col items-center justify-center gap-2">
                          <Lock size={20} className="text-slate-300" />
                          Type a password to audit complexity
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FDF6F7] dark:bg-[#221015]/40 border border-[#7B1535]/12 dark:border-[#E27D9B]/15 p-4 rounded-xl">
                      <span className="text-xs font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-wide block mb-1.5">
                        School Security Rulebook
                      </span>
                      <ul className="text-xs text-[#7A6068] dark:text-slate-400 font-medium leading-relaxed list-disc list-inside space-y-1">
                        <li>At least 10 characters long</li>
                        <li>Include numeric digits (0-9)</li>
                        <li>Include uppercase letters (A-Z)</li>
                        <li>Include symbols (e.g. @, #, $, %)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === "settings" && (
            <Settings
              banks={banks}
              setBanks={setBanks}
              logActivity={logActivity}
              tfaEnabled={tfaEnabled}
              setTfaEnabled={setTfaEnabled}
              auditEnabled={auditEnabled}
              setAuditEnabled={setAuditEnabled}
              timeoutEnabled={timeoutEnabled}
              setTimeoutEnabled={setTimeoutEnabled}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              defaultBanks={BANKS}
              masterPassword={password}
            />
          )}
        </main>
      </div>

      {selectedBank && (
        <AccountModal
          bank={selectedBank}
          onClose={() => setSelectedBank(null)}
          onDelete={(bankObj) => {
            setDeleteBank(bankObj);
            setSelectedBank(null);
          }}
        />
      )}

      <AddBankModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={(newBank) => {
          setBanks([...banks, newBank]);
          logActivity("Account Added", `Added ${newBank.name} account details`, "success");
        }}
      />

      {deleteBank && (
        <DeleteConfirmModal
          bank={deleteBank}
          onClose={() => setDeleteBank(null)}
          onConfirm={() => {
            setBanks(banks.filter((b) => b.id !== deleteBank.id));
            logActivity("Account Deleted", `Deleted ${deleteBank.name} account details`, "warning");
            setDeleteBank(null);
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#101010] border-t border-slate-200 dark:border-[#222222] flex justify-around items-center h-16 md:hidden px-4 shadow-lg">
        <button
          onClick={() => setActiveTab("vault")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeTab === "vault" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
          }`}
        >
          <Landmark size={20} />
          <span className="text-[10px] font-bold">Vault</span>
        </button>

        <button
          onClick={() => setActiveTab("entities")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeTab === "entities" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
          }`}
        >
          <UserPlus size={20} />
          <span className="text-[10px] font-bold">Entities</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all relative ${
            activeTab === "activity" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
          }`}
        >
          <History size={20} />
          <span className="text-[10px] font-bold">Logs</span>
          {activities.length > 0 && (
            <span className="absolute top-1.5 right-[35%] w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeTab === "profile" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
          }`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeTab === "settings" || activeTab === "password" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
          }`}
        >
          <SettingsIcon size={20} />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </div>

      <Footer />
    </div>
  );
}
