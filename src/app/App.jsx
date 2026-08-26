import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, LogIn, ArrowLeft, ChevronDown, Search, Grid, List, ShieldCheck, Users, Info, Copy, Check, Eye, Trash2, Plus, AlertCircle, Landmark, History, User, Settings as SettingsIcon, UserPlus, Edit2, AlertTriangle, X } from "lucide-react";

import { MAROON, GOLD, GOLD_LIGHT, MAROON_HOVER, BORDER, T, radius, font } from "./components/theme";
import { BoyCharacter } from "./components/BoyCharacter";
import { AuthCard } from "./components/AuthCard";
import { AccountModal } from "./components/AccountModal";
import { AddBankModal } from "./components/AddBankModal";
import { Header, USERS } from "./components/Header";
import { StealthLockScreen } from "./components/StealthLockScreen";
import { BankCard, getBankLogo } from "./components/BankCard";
import { AccountSelectorModal } from "./components/AccountSelectorModal";
import { Footer } from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import { CopyButton } from "./components/ModalDetailRow";
import { Settings } from "./components/Settings";
import { HelpInfo } from "./components/HelpInfo";

const BANKS = [
  { id: 1, name: "HDFC Bank", initial: "H", accountNumber: "50100234567892", ifsc: "HDFC0001234", holder: "South Point School, Guwahati", branchName: "Guwahati Main", username: "sps_hdfc_corp", password: "HdfcVault#2026", color: "#1E3A5F", accountType: "corporate" },
  { id: 2, name: "ICICI Bank", initial: "I", accountNumber: "003305678901234", ifsc: "ICIC0000033", holder: "South Point School, Guwahati", branchName: "Beltola", username: "sps_icici_admin", password: "IciciSecure!99", color: "#7A4C1A", accountType: "corporate" },
  { id: 3, name: "State Bank of India", initial: "SB", accountNumber: "38012345678901", ifsc: "SBIN0001234", holder: "South Point School, Guwahati", branchName: "Dispur", username: "sps_sbi_vault", password: "SbiPassphrase*12", color: "#1B3F5C", accountType: "corporate" },
  { id: 4, name: "Axis Bank", initial: "A", accountNumber: "915010012345678", ifsc: "UTIB0001234", holder: "South Point School, Guwahati", branchName: "Ganeshguri", username: "sps_axis_pay", password: "AxisKey#Secure1", color: "#5C2E6B", accountType: "corporate" },
  { id: 5, name: "Kotak Mahindra Bank", initial: "K", accountNumber: "1234567890123", ifsc: "KKBK0001234", holder: "South Point School, Guwahati", branchName: "Zoo Road", username: "sps_kotak_fin", password: "KotakPass$882", color: "#7A1A1A", accountType: "corporate" },
  { id: 6, name: "Yes Bank", initial: "Y", accountNumber: "009876543210123", ifsc: "YESB0001234", holder: "South Point School, Guwahati", branchName: "Bhangagarh", username: "sps_yes_corp", password: "YesBank#9021", color: "#1A3F6B", accountType: "corporate" },
  { id: 7, name: "Punjab National Bank", initial: "PN", accountNumber: "017200012345678", ifsc: "PUNB0012345", holder: "South Point School, Guwahati", branchName: "Maligaon", username: "sps_pnb_vault", password: "PnbToken@Secure", color: "#2C1A5F", accountType: "corporate" },
  { id: 8, name: "Bank of Baroda", initial: "BB", accountNumber: "05120200000122", ifsc: "BARB0BORIVL", holder: "South Point School, Guwahati", branchName: "Paltan Bazaar", username: "sps_bob_admin", password: "BobPassword!77", color: "#5F3A0A", accountType: "corporate" },
  { id: 9, name: "HDFC Bank", initial: "H", accountNumber: "50100987654321", ifsc: "HDFC0001234", holder: "South Point School, Guwahati", branchName: "Guwahati East", username: "sps_hdfc_retail", password: "HdfcRetail#99", color: "#1E3A5F", accountType: "retail" }
];

const INITIAL_ACTIVITIES = [
  { id: 1, time: "Today, 12:05 PM", action: "Credential Accessed", details: "Viewed password details for HDFC Bank", user: "Priya Sharma", type: "success", ip: "192.168.1.45" },
  { id: 2, time: "Today, 11:32 AM", action: "Lock Screen Triggered", details: "Stealth mode manual activation", user: "Priya Sharma", type: "info", ip: "192.168.1.45" },
  { id: 3, time: "Yesterday, 04:10 PM", action: "Account Added", details: "Added Kotak Mahindra Bank account", user: "Rahul Verma", type: "success", ip: "192.168.1.98" },
  { id: 4, time: "21 Aug, 09:12 AM", action: "Failed Authentication", details: "Invalid stealth password entered", user: "System", type: "error", ip: "172.56.21.9" },
  { id: 5, time: "18 Aug, 02:40 PM", action: "Account Deleted", details: "Deleted Yes Bank account details", user: "Anita Nair", type: "warning", ip: "192.168.1.14" }
];

// --- INLINED COMPONENTS ---

export function FormLabel({ text }) {
  return (
    <label style={{
      fontSize: 11,
      fontWeight: "800",
      color: "#374151",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 5,
      display: "block",
    }}>
      {text}
    </label>
  );
}

export function CustomInput({
  icon,
  type = "text",
  name,
  id,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
  showPasswordToggle,
  onToggleShowPassword,
  onFocus,
  onBlur
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: `1.5px solid #d1d5db`,
      borderRadius: 12,
      background: "#fff",
      overflow: "hidden",
      transition: "border-color 0.2s",
      width: "100%",
    }}
      className="input-focus-container"
    >
      <div style={{
        width: 38,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1.5px solid #e5e7eb",
        color: T.primary,
        background: "rgba(114, 16, 42, 0.02)",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <input
        type={type}
        name={name}
        id={id}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "8px 12px",
          fontSize: 14,
          fontFamily: font.body,
          color: T.ink,
          background: "transparent",
          width: "100%",
        }}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onToggleShowPassword}
          style={{
            background: "none",
            border: "none",
            padding: "0 12px",
            cursor: "pointer",
            color: "#6B6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10
          }}
        >
          {type === "password" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export function IconInput({
  icon,
  right,
  ...props
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center" style={{ color: MAROON }}>
        {icon}
      </span>
      <input
        {...props}
        className="w-full h-12 pl-11 pr-10 text-sm border bg-white text-[#1A0810] placeholder:text-[#94A3B8] focus:outline-none transition-colors rounded-xl"
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
      {right && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">{right}</span>}
    </div>
  );
}

function maskAccount(num) {
  if (!num) return "";
  return `•••• •••• •••• ${num.slice(-4)}`;
}

export function DeleteConfirmModal({ bank, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!bank) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[400px] bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border border-red-200/80 dark:border-red-950/60 transform scale-100 transition-all duration-300 flex flex-col"
        style={{ fontFamily: "inherit" }}
      >
        <div className="h-1.5 w-full bg-red-600" />
        <div className="flex justify-end pt-3 pr-3">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Cancel"
            style={{ border: "none", background: "none" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 mb-4 animate-pulse">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-red-950 dark:text-red-200 tracking-tight mb-2">
            Delete Bank Account?
          </h3>
          <p className="text-sm text-[#7A6068] leading-relaxed mb-4">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{bank.name}</span> ({maskAccount(bank.accountNumber)})?
          </p>
          <div className="w-full bg-red-50/60 border border-red-100/80 rounded-xl p-3.5 text-left mb-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 block mb-1">
              ⚠️ Strict Warning
            </span>
            <p className="text-xs text-red-900 leading-normal font-medium">
              This will permanently delete the entire account details, including saved login credentials, usernames, passwords, and IFSC codes. This action is irreversible.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              No, Keep Account
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-red-200/30 cursor-pointer"
              style={{ border: "none" }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [selectedUser, setSelectedUser] = useState("Guwahati Central Campus");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState(BANKS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [entities, setEntities] = useState([
    { id: 1, name: "Guwahati Central Campus", phone: "+91 98450 99999", email: "central.campus@southpoint.edu.in" },
    { id: 2, name: "Guwahati East Branch", phone: "+91 97060 88888", email: "east.branch@southpoint.edu.in" },
    { id: 3, name: "Guwahati South Campus", phone: "+91 88760 77777", email: "south.campus@southpoint.edu.in" }
  ]);
  const [admins, setAdmins] = useState([
    {
      name: "Abhishek Tiwari",
      email: "admin@southpoint.edu.in",
      password: "admin",
      level: 3,
      dept: "Information Security & IT Administration",
      campus: "Guwahati Central Campus, Assam",
      clearance: "Level 3 - System Super Administrator",
      designation: "Director of IT Infrastructure",
      session_id: "SPS-ADM-001-ABHISHEK",
      auth_time: "25 Aug 2026, 09:30 AM",
      ip: "192.168.1.1",
      publicKey: "sha256:abhishektiwari7b1535b4a9b227cf842d0c321e6d7821c3b5f842d0",
      status: "Active / Administrator Verified"
    }
  ]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const activeAdmin = currentAdmin || admins[0];
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [emailOtpState, setEmailOtpState] = useState(null);
  const [deleteBank, setDeleteBank] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [entitiesScrollProgress, setEntitiesScrollProgress] = useState(0);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [entityConfirmModal, setEntityConfirmModal] = useState(null);
  const [activeTab, setActiveTab] = useState("vault");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logFilterSeverity, setLogFilterSeverity] = useState("all");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [timeoutDuration, setTimeoutDuration] = useState("15m");
  const [stealthMode, setStealthMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  const entitiesCarouselRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (screen !== "dashboard" || stealthMode || timeoutDuration === "never") {
      return;
    }

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let seconds = 900; // default 15m
      if (timeoutDuration === "5m") seconds = 300;
      else if (timeoutDuration === "10m") seconds = 600;
      else if (timeoutDuration === "15m") seconds = 900;
      else if (timeoutDuration === "30m") seconds = 1800;
      else if (timeoutDuration === "60m") seconds = 3600;

      timeoutId = setTimeout(() => {
        setStealthMode(true);
        logActivity("Lock Screen Triggered", "Vault locked automatically due to inactivity", "info");
      }, seconds * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [screen, stealthMode, timeoutDuration]);

  useEffect(() => {
    if (selectedGroup) {
      const remaining = banks.filter(b => b.name.trim() === selectedGroup.name);
      if (remaining.length === 0) {
        setSelectedGroup(null);
      }
    }
  }, [banks, selectedGroup]);

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

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setAddModalOpen(true);
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

  const handleEntitiesScroll = (e) => {
    const slider = e.currentTarget;
    if (!slider) return;
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    if (maxScrollLeft <= 0) {
      setEntitiesScrollProgress(0);
      return;
    }
    const percentage = (slider.scrollLeft / maxScrollLeft) * 100;
    setEntitiesScrollProgress(percentage);
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    if (isEditingProfile) {
      setPendingTabChange(newTab);
      return;
    }
    setActiveTab(newTab);
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

      let foundAdmin = admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password.trim());
      if (!foundAdmin) {
        // Automatically look up by email, otherwise dynamically create a temporary admin profile
        foundAdmin = admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
        if (!foundAdmin) {
          const namePrefix = email.split("@")[0];
          const nameParts = namePrefix.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
          const derivedName = nameParts.join(" ") || "External Admin";

          foundAdmin = {
            name: derivedName,
            email: email.trim(),
            password: password.trim(),
            level: 3,
            dept: "Information Security & IT Administration",
            campus: "Guwahati Central Campus, Assam",
            clearance: "Level 3 - System Super Administrator",
            designation: "Director of IT Infrastructure",
            session_id: `SPS-ADM-TEMP-${namePrefix.toUpperCase()}`,
            auth_time: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            ip: "192.168.1.100",
            publicKey: `sha256:temp${namePrefix.toLowerCase()}${Date.now().toString().slice(-6)}`,
            status: "Active / Temporary Administrator Session"
          };
          setAdmins(prev => [...prev, foundAdmin]);
        }
      }

      setCurrentAdmin(foundAdmin);
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
    setUserDropdownOpen(false);
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

  const groupedBanks = React.useMemo(() => {
    const groups = {};
    filteredBanks.forEach((bank) => {
      const name = bank.name.trim();
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(bank);
    });
    return Object.keys(groups).map((name) => ({
      name,
      accounts: groups[name],
    }));
  }, [filteredBanks]);

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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#080808] text-slate-800 dark:text-slate-200 transition-colors duration-200">
      <Header
        activeAdmin={activeAdmin}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setScreen={setScreen}
        setStealthMode={setStealthMode}
        onNavigate={handleTabChange}
        avatarMenuOpen={avatarMenuOpen}
        setAvatarMenuOpen={setAvatarMenuOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        onLogout={() => {
          if (isEditingProfile) {
            setPendingTabChange("logout");
            return;
          }
          setScreen("login");
          setActiveTab("vault");
        }}
      />

      <div className="flex-grow flex w-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={() => {
            if (isEditingProfile) {
              setPendingTabChange("logout");
              return;
            }
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
                      onClick={() => {
                        const nextVal = !userDropdownOpen;
                        setUserDropdownOpen(nextVal);
                        if (nextVal) {
                          setAvatarMenuOpen(false);
                        }
                      }}
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
                          {entities.map((entity) => (
                            <button
                              key={entity.id}
                              onClick={() => {
                                setSelectedUser(entity.name);
                                setUserDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${entity.name === selectedUser ? "bg-[#FBF3F5] dark:bg-[#221015]" : "hover:bg-slate-50 dark:hover:bg-[#202020]"}`}
                              style={entity.name === selectedUser ? { color: MAROON } : { color: "#1A0810" }}
                            >
                              <span className="dark:text-slate-200">{entity.name}</span>
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
                    AT
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Active Administrator</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-1 leading-tight">Abhishek Tiwari</h3>
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
                  {groupedBanks.map((group) => {
                    const accounts = group.accounts;
                    const handleClick = () => {
                      if (accounts.length > 1) {
                        setSelectedGroup(group);
                      } else {
                        handleViewBank(accounts[0]);
                      }
                    };

                    return (
                      <BankCard
                        key={group.name}
                        accounts={accounts}
                        onClick={handleClick}
                        onConfirmDelete={(bankObj) => setDeleteBank(bankObj)}
                        onEdit={handleEditBank}
                      />
                    );
                  })}
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
                                    className="h-12 w-auto object-contain shrink-0"
                                  />
                                ) : (
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
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
                                  onClick={() => handleEditBank(bank)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#202020] text-slate-500 hover:text-[#7B1535] dark:hover:text-[#E27D9B] transition-colors cursor-pointer"
                                  title="Edit Account Details"
                                >
                                  <Edit2 size={15} />
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
              <div className="w-full text-left animate-fade-in space-y-8">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Register Entity</h1>
                  <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                    Manage and register authorized school branches, administrators, or contact nodes
                  </p>
                </div>
                <div className="h-px" style={{ backgroundColor: BORDER }} />

                {/* Top Section: Registered Entities (Carousel) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest">
                      Registered Entities ({entities.length})
                    </h3>
                  </div>

                  {entities.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#101010] border border-dashed rounded-2xl p-6 text-slate-400" style={{ borderColor: BORDER }}>
                      No registered entities found. Use the form below to add one.
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Horizontal Scrolling Carousel wrapper */}
                      <div
                        ref={entitiesCarouselRef}
                        onScroll={handleEntitiesScroll}
                        onMouseDown={(e) => {
                          const slider = entitiesCarouselRef.current;
                          if (!slider) return;
                          slider.isDown = true;
                          slider.startX = e.pageX - slider.offsetLeft;
                          slider.scrollStartLeft = slider.scrollLeft;
                        }}
                        onMouseLeave={() => {
                          const slider = entitiesCarouselRef.current;
                          if (!slider) return;
                          slider.isDown = false;
                        }}
                        onMouseUp={() => {
                          const slider = entitiesCarouselRef.current;
                          if (!slider) return;
                          slider.isDown = false;
                        }}
                        onMouseMove={(e) => {
                          const slider = entitiesCarouselRef.current;
                          if (!slider || !slider.isDown) return;
                          e.preventDefault();
                          const x = e.pageX - slider.offsetLeft;
                          const walk = (x - slider.startX) * 1.5;
                          slider.scrollLeft = slider.scrollStartLeft - walk;
                        }}
                        className="flex overflow-x-auto gap-4 pb-5 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar select-none cursor-grab active:cursor-grabbing"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {entities.map((entity) => (
                          <div
                            key={entity.id}
                            className="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-[calc((100%-48px)/4)] lg:min-w-[calc((100%-48px)/4)] lg:max-w-[calc((100%-48px)/4)] bg-white dark:bg-[#101010] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                            style={{ borderColor: BORDER }}
                          >
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: MAROON }} />

                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 truncate pr-6">{entity.name}</h4>
                            <div className="mt-3.5 space-y-2 text-xs text-[#7A6068] dark:text-slate-400 font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">✉</span>
                                <span className="font-mono">{entity.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">📞</span>
                                <span className="font-mono">{entity.phone}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEntityConfirmModal({
                                  title: "Delete Entity Confirmation",
                                  message: `Are you sure you want to delete and unregister "${entity.name}" from the system database?`,
                                  onConfirm: () => {
                                    setEntities(entities.filter(e => e.id !== entity.id));
                                    logActivity("Entity Removed", `Removed entity: ${entity.name}`, "warning");
                                  }
                                });
                              }}
                              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent"
                              title="Remove Entity"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Custom Scroll Indicator Bar */}
                      {entities.length > 1 && (
                        <div className="flex justify-center mt-4 select-none">
                          <div 
                            className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full relative overflow-hidden"
                          >
                            <div 
                              className="absolute top-0 bottom-0 bg-[#7B1535] dark:bg-[#E27D9B] rounded-full transition-all duration-75"
                              style={{ 
                                left: `${(entitiesScrollProgress / 100) * 112}px`, // sliding within 160px - 48px = 112px
                                width: '48px' 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Add Entity Form */}
                <div className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm w-full" style={{ borderColor: BORDER }}>
                  <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-5">
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

                      // Validate that entity name does not equal any admin user (case-insensitive)
                      const isAdminUser = USERS.some(u => u.toLowerCase() === name.toLowerCase());
                      if (isAdminUser) {
                        alert(`Error: "${name}" is registered as an Administrator. Entities cannot have the same name as an administrator.`);
                        return;
                      }

                      // Validate that entity email does not equal any admin user email
                      const ADMIN_EMAILS = [
                        "priya.sharma@southpoint.edu.in",
                        "rahul.verma@southpoint.edu.in",
                        "anita.nair@southpoint.edu.in",
                        "deepak.mehta@southpoint.edu.in"
                      ];
                      const isAdminEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
                      if (isAdminEmail) {
                        alert(`Error: "${email}" is registered as an Administrator email. Entities cannot have the same email as an administrator.`);
                        return;
                      }

                      // Validate email contains @gmail.com
                      if (!email.toLowerCase().endsWith("@gmail.com")) {
                        alert("Error: Email must be a valid @gmail.com address.");
                        return;
                      }

                      // Validate phone is exactly 10 digits
                      const isTenDigits = /^\d{10}$/.test(phone);
                      if (!isTenDigits) {
                        alert("Error: Phone number must be exactly 10 digits (e.g. 9876543210).");
                        return;
                      }

                      const targetForm = e.target;
                      setEntityConfirmModal({
                        title: "Confirm Registration",
                        message: `Are you sure you want to register "${name}" as a new school entity?`,
                        onConfirm: () => {
                          const newEntity = {
                            id: Date.now(),
                            name,
                            email,
                            phone
                          };
                          setEntities([...entities, newEntity]);
                          logActivity("Entity Registered", `Registered new entity: ${name}`, "updated");
                          targetForm.reset();
                        }
                      });
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Full Name / Entity Name
                        </label>
                        <input
                          type="text"
                          name="entityName"
                          required
                          placeholder="Your Entity Name"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
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
                          minLength={10}
                          maxLength={10}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          }}
                          placeholder="Your Phone Number"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                        Email ID
                      </label>
                      <input
                        type="email"
                        name="entityEmail"
                        required
                        placeholder="Your Email"
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
            const profile = activeAdmin;

            return (
              <div className="w-full text-left animate-fade-in">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>My Profile</h1>
                    <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                      Your administrator security credentials and role assignment
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4.5 h-11 text-xs font-black text-white rounded-xl shadow-sm hover:shadow-md cursor-pointer border-none transition-all"
                      style={{ backgroundColor: MAROON }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                <div className="h-px mb-8" style={{ backgroundColor: BORDER }} />

                {isEditingProfile ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const name = formData.get("profileName").trim();
                      const designation = formData.get("profileDesignation").trim();
                      const dept = formData.get("profileDept").trim();
                      const phone = formData.get("profilePhone").trim();
                      const campus = formData.get("profileCampus").trim();

                      if (!name || !designation || !dept || !phone || !campus) {
                        alert("Full Name, Designation, Department, Phone Number, and Assigned Campus are required.");
                        return;
                      }

                      // Check phone number length validation
                      const isTenDigits = /^\d{10}$/.test(phone.replace(/\D/g, ""));
                      if (!isTenDigits) {
                        alert("Error: Phone number must be exactly 10 digits.");
                        return;
                      }

                      // Update the active admin profile
                      const updatedAdmins = admins.map(a => {
                        if (a.email.toLowerCase() === profile.email.toLowerCase()) {
                          return {
                            ...a,
                            name,
                            designation,
                            dept,
                            phone,
                            campus
                          };
                        }
                        return a;
                      });
                      setAdmins(updatedAdmins);
                      if (currentAdmin && currentAdmin.email.toLowerCase() === profile.email.toLowerCase()) {
                        setCurrentAdmin({
                          ...currentAdmin,
                          name,
                          designation,
                          dept,
                          phone,
                          campus
                        });
                      }

                      logActivity("Profile Updated", "Updated name, designation, department, phone, and campus details", "updated");
                      setIsEditingProfile(false);
                    }}
                    className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm w-full space-y-6"
                    style={{ borderColor: BORDER }}
                  >
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      Edit Administrator Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          name="profileName"
                          defaultValue={profile.name}
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Email Address (Change via OTP below)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            disabled
                            value={profile.email}
                            className="w-full h-11 px-3.5 text-sm border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-450 rounded-xl cursor-not-allowed font-semibold font-mono flex-grow"
                          />
                          <button
                            type="button"
                            onClick={() => setEmailOtpState({ newEmail: "", otpCode: "", otpSent: false, userCode: "" })}
                            className="px-3.5 h-11 text-[10px] font-black text-white rounded-xl cursor-pointer bg-[#C9A227] hover:bg-[#b08d20] border-none uppercase tracking-widest shrink-0 transition-colors"
                          >
                            Change Email
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Designation
                        </label>
                        <input
                          type="text"
                          name="profileDesignation"
                          required
                          defaultValue={profile.designation}
                          placeholder="e.g. Director of IT Infrastructure"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          name="profileDept"
                          required
                          defaultValue={profile.dept}
                          placeholder="e.g. Information Security"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="profilePhone"
                          required
                          minLength={10}
                          maxLength={10}
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          }}
                          defaultValue={profile.phone ? profile.phone.replace(/\D/g, "").slice(-10) : "9876543210"}
                          placeholder="e.g. 9876543210"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Assigned Campus
                        </label>
                        <input
                          type="text"
                          name="profileCampus"
                          required
                          defaultValue={profile.campus}
                          placeholder="e.g. Guwahati Central Campus, Assam"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                        style={{ backgroundColor: MAROON }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Profile Main Header Information Panel */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-200/60 dark:border-slate-800/80">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-inner bg-[#F5ECEE] dark:bg-[#221015]/60 shrink-0"
                          style={{ color: MAROON }}
                        >
                          {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 leading-none">{profile.name}</h2>
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
                          <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.name}</span>
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
                          <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base font-mono">
                            {profile.phone ? (profile.phone.startsWith("+91") ? profile.phone : `+91 ${profile.phone.slice(0, 5)} ${profile.phone.slice(5)}`) : "+91 98765 43210"}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Assigned Campus</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.campus}</span>
                        </div>
                      </div>

                      {/* Card 3: Security & Session Credentials */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 pb-2">
                          Security Credentials
                        </h3>

                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Security Clearance</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold mt-1.5 block text-base">{profile.clearance}</span>
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
                  </>
                )}
              </div>
            );
          })()}

          {activeTab === "register-admin" && (() => {
            return (
              <div className="w-full text-left animate-fade-in space-y-8">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>Register Admin</h1>
                  <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
                    Create a new system administrator and assign database access clearance levels
                  </p>
                </div>
                <div className="h-px" style={{ backgroundColor: BORDER }} />

                <div className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm w-full" style={{ borderColor: BORDER }}>
                  <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-5">
                    Administrator Details
                  </h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const name = formData.get("adminName").trim();
                      const email = formData.get("adminEmail").trim();
                      const passVal = formData.get("adminPassword").trim();
                      const levelVal = parseInt(formData.get("adminLevel"), 10);

                      if (!name || !email || !passVal || !levelVal) {
                        alert("All fields are required.");
                        return;
                      }

                      // Check if email already exists
                      const emailExists = admins.some(a => a.email.toLowerCase() === email.toLowerCase());
                      if (emailExists) {
                        alert(`Error: Administrator with email "${email}" is already registered.`);
                        return;
                      }

                      const targetForm = e.target;
                      setEntityConfirmModal({
                        title: "Confirm Admin Registration",
                        message: `Are you sure you want to register "${name}" as a new Level ${levelVal} Administrator?`,
                        onConfirm: () => {
                          const departments = {
                            1: "General Administration",
                            2: "Audit & Risk Compliance",
                            3: "Information Security & IT Administration"
                          };
                          const clearances = {
                            1: "Level 1 - Read-Only Access",
                            2: "Level 2 - Operator Manager Access",
                            3: "Level 3 - System Super Administrator"
                          };
                          const designations = {
                            1: "Accounts Assistant",
                            2: "Senior Compliance Auditor",
                            3: "Director of IT Infrastructure"
                          };

                          const newAdmin = {
                            name,
                            email,
                            password: passVal,
                            level: levelVal,
                            dept: departments[levelVal],
                            campus: "Guwahati Central Campus, Assam",
                            clearance: clearances[levelVal],
                            designation: designations[levelVal],
                            session_id: `SPS-ADM-00${admins.length + 1}-${name.split(" ")[0].toUpperCase()}`,
                            auth_time: "Just registered",
                            ip: "192.168.1.1",
                            publicKey: `sha256:${name.toLowerCase().replace(/\s/g, "")}${Date.now().toString().slice(-6)}`,
                            status: "Active / Administrator Verified"
                          };

                          setAdmins([...admins, newAdmin]);
                          logActivity("Admin Registered", `Registered new administrator: ${name} (Level ${levelVal})`, "updated");
                          targetForm.reset();
                          alert(`Administrator "${name}" successfully registered! They can now log in using their email and password.`);
                        }
                      });
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="adminName"
                          required
                          placeholder="Your Name"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Access Level Clearance
                        </label>
                        <div className="relative">
                          <select
                            name="adminLevel"
                            required
                            className="w-full h-11 px-3.5 pr-10 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold appearance-none cursor-pointer"
                            style={{ borderColor: BORDER }}
                          >
                            <option value="1">Level 1 - Read-Only Clerk</option>
                            <option value="2">Level 2 - Operator Manager</option>
                            <option value="3">Level 3 - System Super Administrator</option>
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          required
                          placeholder="Your Email"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                          Account Password
                        </label>
                        <input
                          type="password"
                          name="adminPassword"
                          required
                          placeholder="Your Password"
                          className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                          style={{ borderColor: BORDER }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md mt-2 flex items-center justify-center gap-1.5 border-none"
                      style={{ backgroundColor: MAROON }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                    >
                      Register Admin
                    </button>
                  </form>
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
                        placeholder="Your Current Password"
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
                        placeholder="Your New Password"
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
                        placeholder="Confirm Your New Password"
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
              timeoutDuration={timeoutDuration}
              setTimeoutDuration={setTimeoutDuration}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              defaultBanks={BANKS}
              masterPassword={password}
            />
          )}

          {activeTab === "help" && (
            <HelpInfo />
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
          onEdit={(bankObj) => {
            setSelectedBank(null);
            handleEditBank(bankObj);
          }}
        />
      )}

      {(() => {
        if (!selectedGroup) return null;
        const currentGroupAccounts = banks.filter(b => b.name.trim() === selectedGroup.name);
        if (currentGroupAccounts.length === 0) return null;

        // Render the selector only when other modals (details, edit, delete) are closed
        if (selectedBank || addModalOpen || deleteBank) return null;

        return (
          <AccountSelectorModal
            isOpen={true}
            onClose={() => setSelectedGroup(null)}
            bankName={selectedGroup.name}
            accounts={currentGroupAccounts}
            onViewDetails={(acc) => {
              handleViewBank(acc);
            }}
            onEdit={(acc) => {
              handleEditBank(acc);
            }}
            onDelete={(acc) => {
              setDeleteBank(acc);
            }}
          />
        );
      })()}

      <AddBankModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingBank(null);
        }}
        entities={entities}
        bankToEdit={editingBank}
        onAdd={(newBank) => {
          setBanks([...banks, newBank]);
          logActivity("Account Added", `Added ${newBank.name} account details`, "success");
        }}
        onEdit={(updatedBank) => {
          setBanks(banks.map((b) => (b.id === updatedBank.id ? updatedBank : b)));
          logActivity("Account Updated", `Updated ${updatedBank.name} account details`, "info");
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

      {entityConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[420px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border p-6 text-center animate-fade-in-up" style={{ borderColor: BORDER }}>
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">
              {entityConfirmModal.title}
            </h3>
            <p className="text-sm text-[#7A6068] dark:text-slate-400 mb-6 font-semibold">
              {entityConfirmModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEntityConfirmModal(null)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  entityConfirmModal.onConfirm();
                  setEntityConfirmModal(null);
                }}
                className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                style={{ backgroundColor: MAROON }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {emailOtpState && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[440px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up" style={{ borderColor: BORDER }}>
            <div
              className="px-6 py-5 text-white"
              style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4a0d20 100%)` }}
            >
              <h3 className="text-base font-black tracking-wide uppercase">Email Change Verification</h3>
              <p className="text-[10px] text-white/65 tracking-widest uppercase font-bold mt-1">OTP Authentication Process</p>
            </div>

            <div className="p-6 space-y-5 text-left bg-slate-50/20 dark:bg-[#101010]/20">
              {!emailOtpState.otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={emailOtpState.newEmail}
                      onChange={(e) => setEmailOtpState({ ...emailOtpState, newEmail: e.target.value })}
                      placeholder="e.g. new.email@gmail.com"
                      className="w-full h-11 px-3.5 text-sm border bg-white dark:bg-[#181818] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEmailOtpState(null)}
                      className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!emailOtpState.newEmail.trim() || !emailOtpState.newEmail.includes("@")) {
                          alert("Please enter a valid email address.");
                          return;
                        }
                        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setEmailOtpState({
                          ...emailOtpState,
                          otpSent: true,
                          otpCode: generatedCode
                        });
                        alert(`Simulated OTP Code sent to "${emailOtpState.newEmail}": ${generatedCode}\n\nPlease enter this code on the next screen.`);
                      }}
                      className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                      style={{ backgroundColor: MAROON }}
                    >
                      Send OTP Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest block mb-1">Simulated OTP Sent</span>
                    <span className="text-lg font-mono font-black tracking-widest text-[#7B1535] dark:text-[#E27D9B] block">{emailOtpState.otpCode}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtpState.userCode || ""}
                      onChange={(e) => setEmailOtpState({ ...emailOtpState, userCode: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 123456"
                      className="w-full h-11 px-3.5 text-center text-lg tracking-widest font-mono border bg-white dark:bg-[#181818] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-bold"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEmailOtpState({ ...emailOtpState, otpSent: false })}
                      className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (emailOtpState.userCode !== emailOtpState.otpCode) {
                          alert("Error: Invalid OTP code. Please enter the correct 6-digit code shown above.");
                          return;
                        }
                        // Update in state!
                        const targetEmail = activeAdmin.email;
                        const newEmail = emailOtpState.newEmail.trim();

                        const updatedAdmins = admins.map(a => {
                          if (a.email.toLowerCase() === targetEmail.toLowerCase()) {
                            return { ...a, email: newEmail };
                          }
                          return a;
                        });
                        setAdmins(updatedAdmins);
                        if (currentAdmin && currentAdmin.email.toLowerCase() === targetEmail.toLowerCase()) {
                          setCurrentAdmin({ ...currentAdmin, email: newEmail });
                        }

                        logActivity("Email Updated", `Updated administrator email to: ${newEmail}`, "updated");
                        setEmailOtpState(null);
                        alert(`Email successfully updated to ${newEmail}!`);
                      }}
                      className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                      style={{ backgroundColor: MAROON }}
                    >
                      Verify & Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#101010] border-t border-slate-200 dark:border-[#222222] flex justify-around items-center h-16 md:hidden px-4 shadow-lg">
        <button
          onClick={() => handleTabChange("vault")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${activeTab === "vault" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
            }`}
        >
          <Landmark size={20} />
          <span className="text-[10px] font-bold">Vault</span>
        </button>

        <button
          onClick={() => handleTabChange("entities")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${activeTab === "entities" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
            }`}
        >
          <UserPlus size={20} />
          <span className="text-[10px] font-bold">Entities</span>
        </button>

        <button
          onClick={() => handleTabChange("activity")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all relative ${activeTab === "activity" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
            }`}
        >
          <History size={20} />
          <span className="text-[10px] font-bold">Logs</span>
          {activities.length > 0 && (
            <span className="absolute top-1.5 right-[35%] w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => handleTabChange("profile")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${activeTab === "profile" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
            }`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>

        <button
          onClick={() => handleTabChange("settings")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${activeTab === "settings" || activeTab === "password" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
            }`}
        >
          <SettingsIcon size={20} />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </div>

      {activeTab === "vault" && <Footer />}

      {/* Custom Leave Profile Confirmation Modal */}
      {pendingTabChange && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setPendingTabChange(null)}
        >
          <div
            className="w-full max-w-[400px] bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border transform scale-100 transition-all duration-300 flex flex-col animate-fade-in-up"
            style={{ borderColor: BORDER, fontFamily: "inherit" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-[#C9A227]" />

            {/* Modal Header & Close Button */}
            <div className="flex justify-end pt-3 pr-3">
              <button
                onClick={() => setPendingTabChange(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Cancel"
                style={{ border: "none", background: "none" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6 flex flex-col items-center text-center">
              {/* Pulsing Warning Icon Container */}
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-[#C9A227] mb-4">
                <AlertCircle size={28} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Unsaved Changes
              </h3>

              {/* Description */}
              <p className="text-sm text-[#7A6068] dark:text-slate-400 leading-relaxed mb-6 font-semibold">
                Are you sure you want to leave without saving the changes? Your modifications will be permanently lost.
              </p>

              {/* Buttons Row */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setPendingTabChange(null)}
                  className="flex-1 h-10 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-lg transition-colors cursor-pointer bg-transparent"
                >
                  Keep Editing
                </button>
                <button
                  onClick={() => {
                    const destination = pendingTabChange;
                    setPendingTabChange(null);
                    setIsEditingProfile(false);
                    if (destination === "logout") {
                      setScreen("login");
                      setActiveTab("vault");
                    } else {
                      setActiveTab(destination);
                    }
                  }}
                  className="flex-1 h-10 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer border-none"
                  style={{ backgroundColor: MAROON }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
