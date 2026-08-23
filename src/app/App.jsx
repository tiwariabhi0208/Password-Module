import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, LogIn, ArrowLeft, ChevronDown } from "lucide-react";

import { MAROON, GOLD, GOLD_LIGHT, MAROON_HOVER, BORDER, T, radius } from "./components/theme";
import { BoyCharacter } from "./components/BoyCharacter";
import { CustomInput, FormLabel, IconInput } from "./components/CustomInput";
import { AuthCard } from "./components/AuthCard";
import { AccountModal } from "./components/AccountModal";
import { AddBankModal } from "./components/AddBankModal";
import { Header, USERS } from "./components/Header";
import { StealthLockScreen } from "./components/StealthLockScreen";
import { BankCard } from "./components/BankCard";
import { Footer } from "./components/Footer";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { Sidebar } from "./components/Sidebar";

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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState(BANKS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteBank, setDeleteBank] = useState(null);
  const [activeTab, setActiveTab] = useState("vault");
  const [stealthMode, setStealthMode] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setScreen={setScreen}
        setStealthMode={setStealthMode}
      />

      <div className="flex-grow flex w-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => {
            setScreen("login");
            setActiveTab("vault");
          }}
        />

        <main className="flex-grow min-w-0 px-8 py-5">
          {activeTab === "vault" && (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold" style={{ color: MAROON }}>Account Vault</h1>
                  <p className="text-sm text-[#7A6068] mt-1">
                    Linked bank accounts — South Point School, Guwahati
                  </p>
                </div>

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

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl z-20 py-1 overflow-hidden border" style={{ borderColor: BORDER }}>
                        {USERS.map((user) => (
                          <button
                            key={user}
                            onClick={() => {
                              setSelectedUser(user);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm transition-colors"
                            style={user === selectedUser ? { color: MAROON, backgroundColor: "#FBF3F5", fontWeight: 600 } : { color: "#1A0810" }}
                          >
                            {user}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="h-px mb-4" style={{ backgroundColor: BORDER }} />

              <div className="flex items-center justify-between mb-3.5">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ color: MAROON, backgroundColor: "#FBF3F5", border: `1px solid ${BORDER}` }}
                >
                  {banks.length} Accounts
                </span>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white transition-colors shadow-sm hover:shadow cursor-pointer"
                  style={{ backgroundColor: MAROON }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Bank Account
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 w-full">
                {banks.map((bank) => (
                  <BankCard
                    key={bank.id}
                    bank={bank}
                    onClick={() => setSelectedBank(bank)}
                    onConfirmDelete={(bankObj) => setDeleteBank(bankObj)}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === "activity" && (
            <>
              <div>
                <h1 className="text-xl font-bold" style={{ color: MAROON }}>Activity Log</h1>
                <p className="text-sm text-[#7A6068] mt-1">
                  Recent actions and security events on the vault
                </p>
              </div>
              <div className="h-px mb-6 mt-6" style={{ backgroundColor: BORDER }} />

              <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: BORDER }}>
                <div className="divide-y divide-slate-100">
                  {[
                    { id: 1, time: "Today, 12:05 PM", action: "Credential Accessed", details: "Viewed password details for HDFC Bank", user: selectedUser, type: "success", ip: "192.168.1.45" },
                    { id: 2, time: "Today, 11:32 AM", action: "Lock Screen Triggered", details: "Stealth mode manual activation", user: selectedUser, type: "info", ip: "192.168.1.45" },
                    { id: 3, time: "Yesterday, 04:10 PM", action: "Account Added", details: "Added Kotak Mahindra Bank account", user: "Rahul Verma", type: "success", ip: "192.168.1.98" },
                    { id: 4, time: "21 Aug, 09:12 AM", action: "Failed Authentication", details: "Invalid stealth password entered", user: "System", type: "error", ip: "172.56.21.9" },
                    { id: 5, time: "18 Aug, 02:40 PM", action: "Account Deleted", details: "Deleted Yes Bank account details", user: "Anita Nair", type: "warning", ip: "192.168.1.14" }
                  ].map((log) => {
                    const badgeStyles = {
                      success: { text: "#16A34A", bg: "#F0FDF4" },
                      info: { text: "#1E3A5F", bg: "#E8F0F8" },
                      warning: { text: "#C9A227", bg: "#FDF8E8" },
                      error: { text: "#DC2626", bg: "#FDF2F2" }
                    }[log.type];

                    return (
                      <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ color: badgeStyles.text, backgroundColor: badgeStyles.bg }}
                            >
                              {log.action}
                            </span>
                            <span className="text-xs text-[#7A6068] font-medium">{log.time}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-1">{log.details}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-[#7A6068] sm:text-right">
                          <div>
                            <span className="block text-slate-900 font-semibold">{log.user}</span>
                            <span className="block text-[10px] text-[#7A6068]/80 font-mono mt-0.5">{log.ip}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <>
              <div>
                <h1 className="text-xl font-bold" style={{ color: MAROON }}>Profile Details</h1>
                <p className="text-sm text-[#7A6068] mt-1">
                  Your administrator security credentials and role
                </p>
              </div>
              <div className="h-px mb-6 mt-6" style={{ backgroundColor: BORDER }} />

              <div className="bg-white rounded-2xl border p-6 max-w-xl shadow-sm" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-5 mb-6">
                  <div 
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-extrabold shadow-sm"
                    style={{ backgroundColor: "#FBF3F5", borderColor: GOLD, color: MAROON }}
                  >
                    {selectedUser.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedUser}</h2>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 inline-block"
                      style={{ color: MAROON, backgroundColor: "#FBF3F5", border: `1px solid ${BORDER}` }}
                    >
                      Administrator
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6068] block">Email Address</span>
                    <span className="text-slate-900 font-semibold mt-1 block">priya.sharma@southpoint.edu.in</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6068] block">Department</span>
                    <span className="text-slate-900 font-semibold mt-1 block">Accounts & Finance Division</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6068] block">Vault Access Clearance</span>
                    <span className="text-red-700 font-bold mt-1 block flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                      Level 3 Credentials
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6068] block">Assigned Campus</span>
                    <span className="text-slate-900 font-semibold mt-1 block">Guwahati Main, Assam</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "password" && (
            <>
              <div>
                <h1 className="text-xl font-bold" style={{ color: MAROON }}>Change Password</h1>
                <p className="text-sm text-[#7A6068] mt-1">
                  Update your vault master password for enhanced security
                </p>
              </div>
              <div className="h-px mb-6 mt-6" style={{ backgroundColor: BORDER }} />

              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  alert("Master password updated successfully!"); 
                  e.target.reset();
                }} 
                className="bg-white rounded-2xl border p-6 max-w-md shadow-sm space-y-4" 
                style={{ borderColor: BORDER }}
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                    Current Master Password
                  </label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]" 
                    style={{ borderColor: BORDER }} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                    New Master Password
                  </label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]" 
                    style={{ borderColor: BORDER }} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                    Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]" 
                    style={{ borderColor: BORDER }} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full h-10 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: MAROON }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                >
                  Update Master Password
                </button>
              </form>
            </>
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
        onAdd={(newBank) => setBanks([...banks, newBank])}
      />

      {deleteBank && (
        <DeleteConfirmModal
          bank={deleteBank}
          onClose={() => setDeleteBank(null)}
          onConfirm={() => {
            setBanks(banks.filter((b) => b.id !== deleteBank.id));
            setDeleteBank(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
