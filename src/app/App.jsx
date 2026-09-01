import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mail, Lock, LogIn, ArrowLeft, ChevronDown, Search, Grid, List, ShieldCheck, Users, Info, Copy, Check, Eye, Trash2, Plus, AlertCircle, Landmark, History, User, Settings as SettingsIcon, UserPlus, Edit2, AlertTriangle, X } from "lucide-react";

import { MAROON, GOLD, GOLD_LIGHT, MAROON_HOVER, BORDER, T, radius, font } from "./components/theme";
import { BoyCharacter } from "./components/BoyCharacter";
import { AuthCard } from "./components/AuthCard";
import { AccountModal } from "./components/AccountModal";
import { AddBankModal } from "./components/AddBankModal";
import { Header } from "./components/Header";
import { StealthLockScreen } from "./components/StealthLockScreen";
import { BankCard, getBankLogo } from "./components/BankCard";
import { AccountSelectorModal } from "./components/AccountSelectorModal";
import { Footer } from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import { CopyButton } from "./components/ModalDetailRow";
import { Settings } from "./components/Settings";
import { HelpInfo } from "./components/HelpInfo";
import { HelpDeskModal } from "./components/HelpDeskModal";
import { LoadingScreen } from "./components/LoadingScreen";

import { api, setAccessToken } from "./utils/apiClient";
import { deriveKeyAndHash, encryptData, decryptData, arrayBufferToHex, hexToArrayBuffer, hashPasswordSHA256 } from "./utils/cryptoHelper";

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
            zIndex: 10,
            flexShrink: 0
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

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const BANKS = [];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [focusField, setFocusField] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [timerResetTrigger, setTimerResetTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [accessToken, setAccessTokenState] = useState("");
  const [masterKey, setMasterKey] = useState(null);
  const [vaultKey, setVaultKey] = useState(null);
  const [tempLoginHash, setTempLoginHash] = useState("");
  const [entities, setEntities] = useState([]);
  const [admins, setAdmins] = useState([
    {
      name: "Abhishek Tiwari",
      email: "admin@southpoint.edu.in",
      level: 3,
      dept: "Information Security & IT Administration",
      campus: "",
      clearance: "Level 3 - Super Admin",
      designation: "Director of IT Infrastructure",
      auth_time: "25 Aug 2026, 09:30 AM",
      ip: "127.0.0.1",
      status: "Active / Administrator Verified"
    }
  ]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const activeAdmin = currentAdmin || admins[0];
  const isOtpScreen = screen === "login-otp" || screen === "forgot-step2";
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [emailOtpState, setEmailOtpState] = useState(null);
  const [deleteBank, setDeleteBank] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [entitiesScrollProgress, setEntitiesScrollProgress] = useState(0);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [adminSuccessMessage, setAdminSuccessMessage] = useState(null);
  const [entityConfirmModal, setEntityConfirmModal] = useState(null);
  const [showEntityWarning, setShowEntityWarning] = useState(false);
  const [duplicateEntityModal, setDuplicateEntityModal] = useState(null);
  const [bulkEntities, setBulkEntities] = useState([{ name: "", phone: "", email: "" }]);
  const [validationError, setValidationError] = useState(null);
  const [regAdminLevel, setRegAdminLevel] = useState("1");
  const [regAdminLevelDropdownOpen, setRegAdminLevelDropdownOpen] = useState(false);
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(null);

  const handleBulkChange = (index, field, value) => {
    setBulkEntities(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

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

  // Auto-select first entity email if none is selected
  useEffect(() => {
    if (selectedUser === "" && entities.length > 0) {
      setSelectedUser(entities[0].email);
    }
  }, [entities, selectedUser]);

  // Load all credentials on mount or token change
  useEffect(() => {
    if (accessToken && vaultKey) {
      fetchEntities();
      fetchBanks();
      fetchActivities();
    }
  }, [accessToken, vaultKey]);

  const fetchEntities = async () => {
    try {
      const response = await api.get('/entities/');
      setEntities(response.data);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/vault/');
      const activeKey = vaultKey;
      
      if (!activeKey) {
        console.warn("No active encryption key found. Skipping bank decryption.");
        setError("Decryption Error: No active vault encryption key loaded. Please log in again.");
        return;
      }

      // Decrypt credentials client-side on-the-fly
      const decryptedBanks = await Promise.all(response.data.map(async (bank) => {
        try {
          return {
            id: bank.id,
            entityId: bank.entity,
            name: bank.name,
            initial: bank.initial,
            color: bank.color || "#7B1535",
            accountType: bank.account_type,
            branchName: bank.branch_name,
            holder: await decryptData(bank.encrypted_holder, activeKey),
            accountNumber: await decryptData(bank.encrypted_account_number, activeKey),
            ifsc: await decryptData(bank.encrypted_ifsc, activeKey),
            username: await decryptData(bank.encrypted_username, activeKey),
            password: await decryptData(bank.encrypted_password, activeKey),
            transactionPassword: bank.encrypted_transaction_password 
              ? await decryptData(bank.encrypted_transaction_password, activeKey) 
              : "",
            isDecrypted: true
          };
        } catch (decryptError) {
          console.error(`Failed to decrypt bank card ${bank.name}:`, decryptError);
          // Fallback to masked values if decryption key is not valid for this card
          return {
            id: bank.id,
            entityId: bank.entity,
            name: bank.name,
            initial: bank.initial,
            color: bank.color || "#7B1535",
            accountType: bank.account_type,
            branchName: bank.branch_name,
            holder: "[Locked / Encrypted]",
            accountNumber: "•••• •••• •••• " + (bank.id && typeof bank.id === 'string' ? bank.id.slice(-4) : "0000"),
            ifsc: "[Locked]",
            username: "[Locked]",
            password: "[Locked]",
            transactionPassword: "",
            isDecrypted: false
          };
        }
      }));
      setBanks(decryptedBanks);
    } catch (error) {
      console.error("Failed fetching credential vault.", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/audit-logs/');
      // Map API fields to UI field format: time, action, details, user, type, ip
      const mapped = response.data.map((log) => ({
        id: log.id,
        time: new Date(log.timestamp).toLocaleString(),
        action: log.action,
        details: log.details,
        user: log.user_snapshot,
        type: log.log_type,
        ip: log.ip_address
      }));
      setActivities(mapped);
    } catch (error) {
      console.error("Failed fetching audit logs.", error);
    }
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
      // Step 1: Request the server salt
      const saltResponse = await api.get(`/auth/salt/?email=${encodeURIComponent(email.trim())}`);
      const serverSaltHex = saltResponse.data.salt;

      // Step 2: Derive master key and login hash hex
      const derived = await deriveKeyAndHash(password.trim(), serverSaltHex);

      // Step 3: Login Phase 1
      const loginResponse = await api.post('/auth/login/', {
        email: email.trim(),
        password: derived.loginHashHex,
      });

      if (loginResponse.data.otp_required) {
        // Save derived variables in temporary states for Phase 2 verification
        setTempLoginHash(derived.loginHashHex);
        setMasterKey(derived.masterKey);
        setSuccess("OTP sent to your registered email address.");

        // Compute secure SHA-256 hash of password for local validation and clear plaintext
        const pHash = await hashPasswordSHA256(password.trim());
        setPasswordHash(pHash);
        setPassword("");

        // Transition to OTP verification screen
        setResendTimer(60);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        setScreen("login-otp");
      } else {
        // Direct login success when 2FA is off
        const token = loginResponse.data.access;
        const userData = loginResponse.data.user;

        // Store access token in memory and state
        setAccessToken(token);
        setAccessTokenState(token);

        // Store master key in state for decryption
        setMasterKey(derived.masterKey);

        // Derive vaultKey
        let vKey = derived.masterKey;
        if (userData.encrypted_vault_key) {
          try {
            const hexKey = await decryptData(userData.encrypted_vault_key, derived.masterKey);
            vKey = hexToArrayBuffer(hexKey);
          } catch (err) {
            console.error("Failed to decrypt vault key:", err);
            vKey = null;
            setError("Decryption Failure: The shared vault key could not be decrypted with your credentials.");
          }
        } else {
          // If no encrypted_vault_key exists and this is the super admin, self-initialize
          if (userData.level === 3) {
            try {
              const hexKey = arrayBufferToHex(derived.masterKey);
              const encVKey = await encryptData(hexKey, derived.masterKey);
              await api.patch('/auth/profile/', { encrypted_vault_key: encVKey });
              userData.encrypted_vault_key = encVKey;
            } catch (err) {
              console.error("Failed to self-initialize encrypted vault key:", err);
            }
          }
        }
        setVaultKey(vKey);

        // Save user profile state
        setCurrentAdmin(userData);
        setTfaEnabled(userData.tfa_enabled || false);

        // Compute secure SHA-256 hash of password for local validation and clear plaintext
        const pHash = await hashPasswordSHA256(password.trim());
        setPasswordHash(pHash);
        setPassword("");

        setSuccess("Login successful!");
        setLoadingScreen({ mode: "login", message: "Authenticating & Loading Secure Vault..." });
        setTimeout(() => {
          setScreen("dashboard");
          setLoadingScreen(null);
          setSuccess("");
        }, 1200);
      }
    } catch (err) {
      console.error("Login initialization failed.", err);
      setError(err.response?.data?.detail || "Invalid credentials or deactivated account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpVerify = async () => {
    setError("");
    setSuccess("");
    const otpCode = otpValues.join("");
    if (otpCode.length < 6) return;

    setLoading(true);
    try {
      const verifyResponse = await api.post('/auth/login/verify/', {
        email: email.trim(),
        password: tempLoginHash,
        otp: otpCode
      });

      // Verification success
      const token = verifyResponse.data.access;
      const userData = verifyResponse.data.user;

      // Store access token
      setAccessToken(token);
      setAccessTokenState(token);

      // Derive vaultKey
      let vKey = masterKey;
      if (userData.encrypted_vault_key) {
        try {
          const hexKey = await decryptData(userData.encrypted_vault_key, masterKey);
          vKey = hexToArrayBuffer(hexKey);
        } catch (err) {
          console.error("Failed to decrypt vault key:", err);
          vKey = null;
          setError("Decryption Failure: The shared vault key could not be decrypted with your credentials.");
        }
      } else {
        // If no encrypted_vault_key exists and this is the super admin, self-initialize
        if (userData.level === 3 && masterKey) {
          try {
            const hexKey = arrayBufferToHex(masterKey);
            const encVKey = await encryptData(hexKey, masterKey);
            await api.patch('/auth/profile/', { encrypted_vault_key: encVKey });
            userData.encrypted_vault_key = encVKey;
          } catch (err) {
            console.error("Failed to self-initialize encrypted vault key:", err);
          }
        }
      }
      setVaultKey(vKey);

      // Save user profile state
      setCurrentAdmin(userData);
      setTfaEnabled(userData.tfa_enabled || false);

      setSuccess("Verification successful!");
      setLoadingScreen({ mode: "login", message: "Authenticating & Loading Secure Vault..." });
      setTimeout(() => {
        setScreen("dashboard");
        setLoadingScreen(null);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("OTP verification failed.", err);
      setError(err.response?.data?.detail || "Invalid OTP code or expired session.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (bankData) => {
    try {
      const activeKey = vaultKey;
      if (!activeKey) {
        throw new Error("No active vault encryption key loaded. Please log in again.");
      }
      const payload = {
        entity: bankData.entityId || null,
        name: bankData.name,
        initial: bankData.initial,
        color: bankData.color || "#7B1535",
        account_type: bankData.accountType,
        branch_name: bankData.branchName,
        encrypted_holder: await encryptData(bankData.holder, activeKey),
        encrypted_account_number: await encryptData(bankData.accountNumber, activeKey),
        encrypted_ifsc: await encryptData(bankData.ifsc, activeKey),
        encrypted_username: await encryptData(bankData.username, activeKey),
        encrypted_password: await encryptData(bankData.password, activeKey),
        encrypted_transaction_password: bankData.transactionPassword 
          ? await encryptData(bankData.transactionPassword, activeKey) 
          : null,
        photo_payload: bankData.photoPayload || null
      };

      await api.post('/vault/', payload);
      fetchBanks();
      setAddModalOpen(false);
    } catch (error) {
      alert("Error adding bank credential: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditBank = async (bankData) => {
    try {
      const activeKey = vaultKey;
      if (!activeKey) {
        throw new Error("No active vault encryption key loaded. Please log in again.");
      }
      const payload = {
        entity: bankData.entityId || null,
        name: bankData.name,
        initial: bankData.initial,
        color: bankData.color || "#7B1535",
        account_type: bankData.accountType,
        branch_name: bankData.branchName,
        encrypted_holder: await encryptData(bankData.holder, activeKey),
        encrypted_account_number: await encryptData(bankData.accountNumber, activeKey),
        encrypted_ifsc: await encryptData(bankData.ifsc, activeKey),
        encrypted_username: await encryptData(bankData.username, activeKey),
        encrypted_password: await encryptData(bankData.password, activeKey),
        encrypted_transaction_password: bankData.transactionPassword 
          ? await encryptData(bankData.transactionPassword, activeKey) 
          : null,
        photo_payload: bankData.photoPayload || null
      };

      await api.put(`/vault/${bankData.id}/`, payload);
      fetchBanks();
      setAddModalOpen(false);
      setEditingBank(null);
    } catch (error) {
      alert("Error updating bank credential: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteBank = async (bankId) => {
    try {
      await api.delete(`/vault/${bankId}/`);
      fetchBanks();
      setDeleteBank(null);
    } catch (error) {
      alert("Error deleting bank credential: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleLogout = async () => {
    setLoadingScreen({ mode: "logout", message: "Securing Vault & Terminating Session..." });
    setTimeout(async () => {
      try {
        await api.post('/auth/logout/');
      } catch (err) {
        console.error("Logout failed on server.", err);
      } finally {
        // Clear client session regardless of server success
        setAccessToken("");
        setAccessTokenState("");
        setMasterKey(null);
        setVaultKey(null);
        setTempLoginHash("");
        setPasswordHash("");
        setCurrentAdmin(null);
        setBanks([]);
        setActivities([]);
        setEntities([]);
        setScreen("login");
        setActiveTab("vault");
        setLoadingScreen(null);
      }
    }, 1200);
  };

  const entitiesCarouselRef = useRef(null);
  const profileFormRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Centralized effect to block document body scroll when any modal popup is open
  useEffect(() => {
    const isAnyModalOpen =
      addModalOpen ||
      !!selectedBank ||
      !!editingBank ||
      !!deleteBank ||
      !!selectedGroup ||
      !!entityConfirmModal ||
      !!duplicateEntityModal ||
      !!showEntityWarning ||
      !!emailOtpState ||
      !!validationError ||
      !!adminSuccessMessage ||
      !!pendingTabChange;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    addModalOpen,
    selectedBank,
    editingBank,
    deleteBank,
    selectedGroup,
    entityConfirmModal,
    duplicateEntityModal,
    showEntityWarning,
    emailOtpState,
    validationError,
    adminSuccessMessage,
    pendingTabChange
  ]);

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

  const handleOpenAddModal = () => {
    if (entities.length === 0) {
      setShowEntityWarning(true);
    } else {
      setAddModalOpen(true);
    }
  };

  const logActivity = (action, details, type) => {
    setActivities((prev) => [
      {
        id: Date.now(),
        time: "Just now",
        action,
        details,
        user: activeAdmin ? activeAdmin.name : "System",
        type,
        ip: ""
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

  const handleOpenEditModal = (bank) => {
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
    if (!isOtpScreen) {
      setTimerResetTrigger(0);
    }
  }, [isOtpScreen]);

  useEffect(() => {
    if (!isOtpScreen || resendTimer <= 0) return;

    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isOtpScreen, timerResetTrigger]);

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

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      if (screen === "login-otp") {
        await api.post('/auth/login/', {
          email: email.trim(),
          password: tempLoginHash
        });
        setSuccess("A new login OTP code has been sent to your email.");
      } else if (screen === "forgot-step2") {
        await api.post('/auth/password-reset/', {
          email: forgotEmail.trim()
        });
        setSuccess("A new password reset OTP code has been sent to your email.");
      }

      setOtpValues(["", "", "", "", "", ""]);
      setResendTimer(60);
      setCanResend(false);
      setTimerResetTrigger(prev => prev + 1);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      console.error("Failed to resend OTP code:", err);
      setError(err.response?.data?.detail || "Failed to resend OTP. Please try again later.");
    }
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

  const hasProfileFormChanges = () => {
    if (!isEditingProfile || !profileFormRef.current) return false;
    const form = profileFormRef.current;
    const profile = activeAdmin;

    const currentName = form.elements["profileName"]?.value || "";
    const currentDesignation = form.elements["profileDesignation"]?.value || "";
    const currentDept = form.elements["profileDept"]?.value || "";

    const rawPhone = form.elements["profilePhone"]?.value || "";
    const currentPhone = rawPhone.replace(/\D/g, "").slice(-10);
    const profilePhone = (profile.phone || "9876543210").replace(/\D/g, "").slice(-10);

    const currentCampus = form.elements["profileCampus"]?.value || "";

    return (
      currentName.trim() !== (profile.name || "").trim() ||
      currentDesignation.trim() !== (profile.designation || "").trim() ||
      currentDept.trim() !== (profile.dept || "").trim() ||
      currentPhone !== profilePhone ||
      currentCampus.trim() !== (profile.campus || "").trim()
    );
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    if (isEditingProfile && hasProfileFormChanges()) {
      setPendingTabChange(newTab);
      return;
    }
    if (isEditingProfile) {
      setIsEditingProfile(false);
    }
    setActiveTab(newTab);
  };



  const goToDashboard = () => {
    setScreen("dashboard");
    setSelectedBank(null);
    setUserDropdownOpen(false);
  };

  const sendOtp = async () => {
    if (!forgotEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await api.post('/auth/password-reset/', {
        email: forgotEmail.trim()
      });
      if (response.data.otp_sent) {
        setSuccess("Verification OTP sent to your registered email address.");
        setResendTimer(60);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        setScreen("forgot-step2");
      }
    } catch (err) {
      console.error("Failed to send password reset OTP.", err);
      setError(err.response?.data?.detail || "Failed to send OTP. Please verify your email is correct and registered.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetConfirm = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length < 6) {
      setError("Please enter the full 6-digit OTP code.");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter your new master password.");
      return;
    }
    if (newPassword.trim().length < 10) {
      setError("For security, your master password must be at least 10 characters long.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Step 1: Request the salt for this email first (to derive the correct keys)
      const saltResponse = await api.get(`/auth/salt/?email=${encodeURIComponent(forgotEmail.trim())}`);
      const serverSaltHex = saltResponse.data.salt;

      // Step 2: Validate OTP and retrieve the encrypted vault key
      let encryptedVaultKey = null;
      try {
        const keyResponse = await api.post('/auth/password-reset/key/', {
          email: forgotEmail.trim(),
          otp: otpCode
        });
        encryptedVaultKey = keyResponse.data.encrypted_vault_key;
      } catch (keyErr) {
        throw new Error(keyErr.response?.data?.detail || "Invalid OTP code.");
      }

      // Step 3: Handle vault key re-wrapping if old password was provided
      let newEncryptedVaultKey = undefined;
      if (oldPassword.trim()) {
        if (encryptedVaultKey) {
          try {
            // Derive old master key to decrypt the vault key
            const oldDerived = await deriveKeyAndHash(oldPassword.trim(), serverSaltHex);
            const decryptedHexKey = await decryptData(encryptedVaultKey, oldDerived.masterKey);
            const rawVKey = hexToArrayBuffer(decryptedHexKey);

            // Derive new master key to re-encrypt
            const newDerived = await deriveKeyAndHash(newPassword.trim(), serverSaltHex);
            newEncryptedVaultKey = await encryptData(arrayBufferToHex(rawVKey), newDerived.masterKey);
          } catch (decryptErr) {
            setError("Incorrect current master password. Please verify your current password, or leave it blank to reset vault access (warning: this will lock existing credentials).");
            setLoading(false);
            return;
          }
        }
      } else {
        // If old password not provided, warn the user about permanent vault locking
        const proceed = window.confirm(
          "WARNING: You did not enter your current master password. Resetting your password without it will permanently lock you out of all currently saved credentials. Are you sure you want to proceed?"
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
        // Explicitly pass null to clear the encrypted vault key
        newEncryptedVaultKey = null;
      }

      // Step 4: Derive the new login hash
      const derived = await deriveKeyAndHash(newPassword.trim(), serverSaltHex);

      // Step 5: Send the reset confirm request to the backend with new login hash and re-wrapped key
      await api.post('/auth/password-reset/verify/', {
        email: forgotEmail.trim(),
        otp: otpCode,
        new_password: derived.loginHashHex,
        encrypted_vault_key: newEncryptedVaultKey
      });

      setSuccess("Password has been reset successfully. Please log in with your new password.");

      // Clear password states and redirect to login
      setNewPassword("");
      setPassword("");
      setOldPassword("");
      setTimeout(() => {
        setScreen("login");
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error("Password reset confirmation failed.", err);
      setError(err.message || err.response?.data?.detail || "Failed to reset password. Please check your OTP and try again.");
    } finally {
      setLoading(false);
    }
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
    const activeEntity = entities.find(e => e.email === selectedUser);
    if (activeEntity && bank.entityId && bank.entityId !== activeEntity.id) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchesName = bank.name.toLowerCase().includes(q);
    const matchesBranch = bank.branchName && bank.branchName.toLowerCase().includes(q);

    // Only search in sensitive fields if they were successfully decrypted (not placeholders)
    const matchesHolder = bank.isDecrypted && bank.holder && bank.holder.toLowerCase().includes(q);
    const matchesAccountNumber = bank.isDecrypted && bank.accountNumber && bank.accountNumber.includes(q);
    const matchesIfsc = bank.isDecrypted && bank.ifsc && bank.ifsc.toLowerCase().includes(q);

    return matchesName || matchesBranch || matchesHolder || matchesAccountNumber || matchesIfsc;
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

  if (screen === "login-otp") {
    const otpComplete = otpValues.every((v) => v !== "");
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

        <button
          onClick={() => setScreen("login")}
          className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70 bg-transparent border-none cursor-pointer"
          style={{ color: MAROON }}
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>
        <h2 className="text-base font-semibold mb-1" style={{ color: MAROON }}>2FA Authentication</h2>
        <p className="text-sm text-[#7A6068] mb-5">
          Enter the 6-digit OTP code sent to{" "}
          <span className="font-medium text-[#1A0810]">{email}</span>
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
              className="w-0 min-w-0 flex-1 h-12 text-center text-base font-bold border-2 rounded-lg bg-white text-[#1A0810] focus:outline-none transition-colors caret-transparent"
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
              className="text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
              style={{ color: MAROON }}
            >
              Resend code
            </button>
          ) : (
            <span className="text-sm text-[#7A6068]">
              Resend in{" "}
              <span className="font-mono font-semibold" style={{ color: MAROON }}>
                {formatTime(resendTimer)}
              </span>
            </span>
          )}
        </div>

        {primaryBtn("Verify & Log In", handleLoginOtpVerify, undefined, !otpComplete || loading)}
      </AuthCard>
    );
  }

  if (loadingScreen) {
    return <LoadingScreen mode={loadingScreen.mode} message={loadingScreen.message} />;
  }

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
              textAlign: "left"
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
              textAlign: "left"
            }}
          >
            ✓ {success}
          </div>
        )}

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
          {primaryBtn(loading ? "Sending..." : "Send OTP", sendOtp, undefined, loading)}
        </div>
      </AuthCard>
    );
  }

  if (screen === "forgot-step2") {
    const otpComplete = otpValues.every((v) => v !== "");
    return (
      <AuthCard>
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
              textAlign: "left"
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
              textAlign: "left"
            }}
          >
            ✓ {success}
          </div>
        )}

        <button
          onClick={() => setScreen("forgot-step1")}
          className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70 bg-transparent border-none cursor-pointer"
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
              className="w-0 min-w-0 flex-1 h-12 text-center text-base font-bold border-2 rounded-lg bg-white text-[#1A0810] focus:outline-none transition-colors caret-transparent"
              style={{
                borderColor: val ? MAROON : BORDER,
                backgroundColor: val ? GOLD_LIGHT : "#fff"
              }}
            />
          ))}
        </div>

        <div style={{ marginBottom: 14, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormLabel text="Current Master Password" />
            <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Optional</span>
          </div>
          <CustomInput
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            }
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Required to preserve saved credentials..."
            showPasswordToggle={true}
            onToggleShowPassword={() => setShowOldPassword(!showOldPassword)}
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-tight">
            ⚠️ If you forgot your password, leave this blank. Your account will reset but existing vault credentials will be locked.
          </p>
        </div>

        <div style={{ marginBottom: 14, textAlign: "left" }}>
          <FormLabel text="New Master Password" />
          <CustomInput
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            }
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new master password..."
            showPasswordToggle={true}
            onToggleShowPassword={() => setShowNewPassword(!showNewPassword)}
            required
          />
        </div>

        <div className="mb-4 h-5 flex items-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
              style={{ color: MAROON }}
            >
              Resend code
            </button>
          ) : (
            <span className="text-sm text-[#7A6068]">
              Resend in{" "}
              <span className="font-mono font-semibold" style={{ color: MAROON }}>
                {formatTime(resendTimer)}
              </span>
            </span>
          )}
        </div>

        {primaryBtn(loading ? "Verifying..." : "Verify & Reset Password", handlePasswordResetConfirm, undefined, !otpComplete || loading)}
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
        passwordHash={passwordHash}
        setStealthMode={setStealthMode}
        setScreen={setScreen}
        onLogout={handleLogout}
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
        onLogout={handleLogout}
      />

      <div className="flex-grow flex w-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          vaultCount={filteredBanks.length}
          activeAdmin={activeAdmin}
        />

        <main className="flex-grow min-w-0 px-3 sm:px-8 py-4 sm:py-5 pb-24 md:pb-5">
          {activeTab === "vault" && (
            <>
              {/* Header Title section */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 border-b border-slate-200 dark:border-slate-800" style={{ borderColor: BORDER }}>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: MAROON }}>Account Vault</h1>
                  <p className="text-xs sm:text-sm text-[#7A6068] mt-0.5 font-medium">
                    Linked bank credentials — South Point School, Guwahati
                  </p>
                </div>

                {/* Highly Visible Active User Indicator */}
                <div className="flex items-center justify-between sm:justify-start gap-2.5">
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-[#7A6068] dark:text-slate-400 uppercase tracking-widest shrink-0">Active Session:</span>
                  <div className="relative z-30">
                    {entities.length === 0 ? (
                      <div className="flex items-center gap-2.5 h-10 sm:h-12 px-3 sm:px-5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs sm:text-sm font-extrabold bg-slate-100/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                        No Entity Exists
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const activeEntity = entities.find(e => e.email === selectedUser);
                          const activeDisplayName = activeEntity ? activeEntity.name : "Select Entity";

                          return (
                            <>
                              <button
                                onClick={() => {
                                  const nextVal = !userDropdownOpen;
                                  setUserDropdownOpen(nextVal);
                                  if (nextVal) {
                                    setAvatarMenuOpen(false);
                                  }
                                }}
                                className="flex items-center gap-2 h-10 sm:h-12 px-3 sm:px-5 rounded-xl border border-slate-250 dark:border-slate-800 text-xs sm:text-sm font-black transition-all bg-[#FBF3F5] dark:bg-[#221015]/60 hover:bg-[#F5ECEE] dark:hover:bg-[#2a131a] border-[#7B1535]/30 hover:border-[#7B1535]/50 text-[#7B1535] dark:text-[#E27D9B] cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                              >
                                {activeDisplayName}
                                <ChevronDown size={15} style={{ color: GOLD }} />
                              </button>

                              {userDropdownOpen && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#151515] rounded-xl shadow-xl z-20 py-1 overflow-hidden border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ borderColor: BORDER }}>
                                    {entities.map((entity) => {
                                      const isSelected = entity.email === selectedUser;
                                      return (
                                        <button
                                          key={entity.id}
                                          onClick={() => {
                                            setSelectedUser(entity.email);
                                            setUserDropdownOpen(false);
                                          }}
                                          className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${isSelected ? "bg-[#FBF3F5] dark:bg-[#221015]" : "hover:bg-slate-50 dark:hover:bg-[#202020]"}`}
                                          style={isSelected ? { color: MAROON } : { color: "#1A0810" }}
                                        >
                                          <div className="flex flex-col text-left">
                                            <span className="dark:text-slate-200">{entity.name}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">{entity.email}</span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-5 sm:mb-6">
                {/* Stats Card 1: Total Vault Accounts */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4 sm:p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 sm:gap-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FBF3F5] dark:bg-[#221015]/60 shrink-0" style={{ color: MAROON }}>
                    <Users size={20} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Active Bank Accounts</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-none">{filteredBanks.length}</span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#7B1535] dark:bg-[#E27D9B] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((filteredBanks.length / 12) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Stats Card 2: Unique Bank Accounts */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4 sm:p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 sm:gap-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/20 text-[#1E3A5F] dark:text-[#6FA4E3] shrink-0">
                    <Landmark size={20} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Unique Bank Accounts</span>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-none">
                        {new Set(filteredBanks.map(b => b.name.trim().toLowerCase())).size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Card 3: Active Session Info */}
                <div className="bg-white dark:bg-[#101010] rounded-2xl p-4 sm:p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 sm:gap-4 transition-all duration-300 hover:shadow-md sm:col-span-2 md:col-span-1" style={{ borderColor: BORDER }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border bg-[#FBF3F5] dark:bg-[#221015] border-slate-200 dark:border-slate-800 shrink-0"
                    style={{ color: MAROON }}
                  >
                    <User size={18} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-400">Active Administrator</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-1 leading-tight">{activeAdmin?.name || "Abhishek Tiwari"}</h3>
                    <span
                      className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-1.5 border border-slate-200 dark:border-slate-800 bg-[#FBF3F5] dark:bg-[#221015]/60 text-[#7B1535] dark:text-[#E27D9B]"
                    >
                      {activeAdmin?.level === 3 ? "Level 3 - Super Admin" : activeAdmin?.level === 2 ? "Level 2 - Limited Access" : "Level 1 - Read Only"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 p-3 sm:p-4 bg-white dark:bg-[#101010] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" style={{ borderColor: BORDER }}>
                {/* Left: Search input */}
                <div className="relative flex-grow max-w-full sm:max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by bank name, cardholder, account #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm border bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-colors"
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
                  {activeAdmin?.level === 3 && (
                    <button
                      onClick={handleOpenAddModal}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-102"
                      style={{ backgroundColor: MAROON }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                    >
                      <Plus size={14} />
                      Add Account
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              {banks.length === 0 ? (
                /* Fully Empty State */
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#101010] rounded-2xl border border-dashed text-center p-6" style={{ borderColor: BORDER }}>
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center text-slate-500 mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No accounts linked</h3>
                  <p className="text-xs text-[#7A6068] dark:text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                    There are currently no bank credentials stored in the vault terminal. Click below to add your first account.
                  </p>
                  {activeAdmin?.level === 3 && (
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-4 px-4 py-2 bg-[#7B1535] hover:bg-[#661128] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add Account
                    </button>
                  )}
                </div>
              ) : filteredBanks.length === 0 ? (
                /* Search Empty State */
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#101010] rounded-2xl border border-dashed text-center p-6" style={{ borderColor: BORDER }}>
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No accounts match your search</h3>
                  <p className="text-xs text-[#7A6068] dark:text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
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
                        onEdit={handleOpenEditModal}
                        activeAdminLevel={activeAdmin?.level}
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
                          {activeAdmin?.level > 1 && (
                            <th className="py-3.5 px-5 text-right pr-6">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                        {filteredBanks.map((bank) => (
                          <tr
                            key={bank.id}
                            onClick={() => handleViewBank(bank)}
                            className="hover:bg-[#7B1535]/5 dark:hover:bg-[#E27D9B]/5 cursor-pointer transition-colors group"
                          >
                            {/* Bank Name */}
                            <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-2.5">
                                {bank.photo ? (
                                  <img
                                    src={bank.photo}
                                    alt={bank.name}
                                    className="h-12 w-12 rounded-xl object-contain shrink-0 bg-white"
                                  />
                                ) : getBankLogo(bank.name) ? (
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
                            {activeAdmin?.level > 1 && (
                              <td className="py-3.5 px-5 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                  {activeAdmin?.level >= 2 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(bank);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#202020] text-slate-500 hover:text-[#7B1535] dark:hover:text-[#E27D9B] transition-colors cursor-pointer"
                                      title="Edit Account Details"
                                    >
                                      <Edit2 size={15} />
                                    </button>
                                  )}
                                  {activeAdmin?.level === 3 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteBank(bank);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete Account"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
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

                            {activeAdmin?.level === 3 && (
                              <button
                                onClick={() => {
                                  setEntityConfirmModal({
                                    title: "Delete Entity Confirmation",
                                    message: `Are you sure you want to delete and unregister "${entity.name}" from the system database?`,
                                    onConfirm: async () => {
                                      try {
                                        await api.delete(`/entities/${entity.id}/`);
                                        setEntities(prev => {
                                          const updated = prev.filter(e => e.id !== entity.id);
                                          if (selectedUser === entity.email) {
                                            setSelectedUser(updated.length > 0 ? updated[0].email : "");
                                          }
                                          return updated;
                                        });
                                        fetchActivities();
                                      } catch (error) {
                                        console.error("Failed to delete entity:", error);
                                        alert("Failed to delete entity. You may not have permission.");
                                      }
                                    }
                                  });
                                }}
                                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent"
                                title="Remove Entity"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
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
                {activeAdmin?.level === 3 && (
                  <div className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm w-full" style={{ borderColor: BORDER }}>
                    <h3 className="text-sm font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-5">
                      Add New Entity
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();

                        // 1. Validate all rows are filled
                        const hasEmpty = bulkEntities.some(ent => !ent.name.trim() || !ent.phone.trim() || !ent.email.trim());
                        if (hasEmpty) {
                          setValidationError("All fields are required in all rows.");
                          return;
                        }

                        // 2. Validate row details
                        for (let i = 0; i < bulkEntities.length; i++) {
                          const ent = bulkEntities[i];
                          const name = ent.name.trim();
                          const phone = ent.phone.trim();
                          const email = ent.email.trim();

                          const isAdminUser = admins.some(adm => adm.name.toLowerCase() === name.toLowerCase());
                          if (isAdminUser) {
                            setValidationError(`Error in row ${i + 1}: "${name}" is registered as an Administrator. Entities cannot have the same name as an administrator.`);
                            return;
                          }

                          const isAdminEmail = admins.some(adm => adm.email.toLowerCase() === email.toLowerCase());
                          if (isAdminEmail) {
                            setValidationError(`Error in row ${i + 1}: "${email}" is registered as an Administrator email. Entities cannot have the same email as an administrator.`);
                            return;
                          }

                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(email)) {
                            setValidationError(`Error in row ${i + 1}: Email must be a valid email address.`);
                            return;
                          }

                          const isTenDigits = /^\d{10}$/.test(phone);
                          if (!isTenDigits) {
                            setValidationError(`Error in row ${i + 1}: Phone number must be exactly 10 digits (e.g. 9876543210).`);
                            return;
                          }
                        }

                        // 3. Check for duplicates within bulkEntities itself (email OR phone match)
                        let internalEmailConflict = null;
                        let internalPhoneConflict = null;

                        for (let i = 0; i < bulkEntities.length; i++) {
                          for (let j = i + 1; j < bulkEntities.length; j++) {
                            if (bulkEntities[i].email.trim().toLowerCase() === bulkEntities[j].email.trim().toLowerCase()) {
                              internalEmailConflict = bulkEntities[i].email.trim();
                            }
                            if (bulkEntities[i].phone.trim() === bulkEntities[j].phone.trim()) {
                              internalPhoneConflict = bulkEntities[i].phone.trim();
                            }
                          }
                        }

                        if (internalEmailConflict || internalPhoneConflict) {
                          const conflictItems = [];
                          if (internalEmailConflict) conflictItems.push(`Email: ${internalEmailConflict}`);
                          if (internalPhoneConflict) conflictItems.push(`Phone number: ${internalPhoneConflict}`);

                          setValidationError(
                            <div className="text-left space-y-2.5">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                The following details are found to be matching/common in your bulk entries:
                              </p>
                              <ul className="list-decimal pl-5 space-y-1.5 font-mono text-[11px] text-[#7A6068] dark:text-slate-400 font-bold">
                                {conflictItems.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          );
                          return;
                        }

                        // 4. Check for duplicates in existing database (email OR phone match)
                        for (let i = 0; i < bulkEntities.length; i++) {
                          const ent = bulkEntities[i];
                          const email = ent.email.trim().toLowerCase();
                          const phone = ent.phone.trim();

                          const emailExists = entities.some(ex => ex.email.toLowerCase() === email);
                          const phoneExists = entities.some(ex => ex.phone === phone);

                          if (emailExists || phoneExists) {
                            const conflictItems = [];
                            if (emailExists) conflictItems.push(`Email: ${ent.email}`);
                            if (phoneExists) conflictItems.push(`Phone number: ${ent.phone}`);

                            setValidationError(
                              <div className="text-left space-y-2.5">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  The following details for row {i + 1} are found to be matching/common in the database:
                                </p>
                                <ul className="list-decimal pl-5 space-y-1.5 font-mono text-[11px] text-[#7A6068] dark:text-slate-400 font-bold">
                                  {conflictItems.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                            return;
                          }
                        }

                        setEntityConfirmModal({
                          title: "Confirm Bulk Registration",
                          message: `Are you sure you want to register these ${bulkEntities.length} entities?`,
                          onConfirm: async () => {
                            try {
                              const payload = bulkEntities.map(ent => ({
                                name: ent.name.trim(),
                                email: ent.email.trim(),
                                phone: ent.phone.trim()
                              }));
                              const response = await api.post('/entities/bulk/', payload);
                              const newEntitiesList = response.data;
                              setEntities(prev => {
                                const updated = [...prev, ...newEntitiesList];
                                if (selectedUser === "" && updated.length > 0) {
                                  setSelectedUser(updated[0].email);
                                }
                                return updated;
                              });
                              fetchActivities();
                              setBulkEntities([{ name: "", phone: "", email: "" }]); // Reset to 1 empty row
                            } catch (error) {
                              console.error("Bulk registration failed:", error);
                              const errMsg = error.response?.data?.error || "Registration failed. Please try again.";
                              setValidationError(errMsg);
                            }
                          }
                        });
                      }}
                      className="space-y-6 text-left"
                    >
                      <div className="space-y-4">
                        {bulkEntities.map((ent, idx) => (
                          <div key={idx} className="relative bg-white dark:bg-[#121212] p-5 rounded-2xl border shadow-sm space-y-4 animate-fade-in" style={{ borderColor: BORDER }}>
                            {bulkEntities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBulkEntities(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-4 right-4 text-xs font-bold text-red-600 hover:text-red-750 bg-transparent border-none cursor-pointer hover:underline"
                              >
                                Remove Row
                              </button>
                            )}
                            <div className="text-xs font-black uppercase text-[#7B1535] dark:text-[#E27D9B] tracking-wider mb-1">
                              Entity Row #{idx + 1}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                                  Full Name / Entity Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={ent.name}
                                  onChange={(e) => handleBulkChange(idx, "name", e.target.value)}
                                  placeholder="e.g. Guwahati Central Campus"
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
                                  required
                                  minLength={10}
                                  maxLength={10}
                                  value={ent.phone}
                                  onChange={(e) => handleBulkChange(idx, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                  placeholder="e.g. 9876543210"
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
                                required
                                value={ent.email}
                                onChange={(e) => handleBulkChange(idx, "email", e.target.value)}
                                placeholder="e.g. branch@gmail.com"
                                className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                                style={{ borderColor: BORDER }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBulkEntities(prev => [...prev, { name: "", phone: "", email: "" }]);
                          }}
                          className="flex-grow h-11 border border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 bg-transparent border-slate-300 dark:border-slate-800 text-[#7B1535] dark:text-[#E27D9B]"
                        >
                          + Add More Entities
                        </button>
                        <button
                          type="submit"
                          className="flex-grow h-11 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 border-none"
                          style={{ backgroundColor: MAROON }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
                        >
                          Register All Entities
                        </button>
                      </div>
                    </form>
                  </div>
                )}
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
                          success: { text: "#16A34A", darkText: "#4ADE80", bg: "#F0FDF4", darkBg: "#122a18", border: "border-l-[#16A34A]" },
                          info: { text: "#1E3A5F", darkText: "#6FA4E3", bg: "#E8F0F8", darkBg: "#101f30", border: "border-l-[#1E3A5F]" },
                          warning: { text: "#C9A227", darkText: "#FBBF24", bg: "#FDF8E8", darkBg: "#2c2512", border: "border-l-[#C9A227]" },
                          error: { text: "#DC2626", darkText: "#F87171", bg: "#FDF2F2", darkBg: "#321515", border: "border-l-[#DC2626]" }
                        }[log.type] || { text: "#7A6068", darkText: "#A1A1AA", bg: "#F5ECEE", darkBg: "#221a1a", border: "border-l-slate-300" };

                        return (
                          <div
                            key={log.id}
                            className={`p-4 pl-5 border-l-4 ${badgeStyles.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-[#1a1a1a]/30 transition-colors`}
                          >
                            <div className="flex flex-col gap-1.5 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full dark:bg-opacity-30"
                                  style={{
                                    color: darkMode ? badgeStyles.darkText : badgeStyles.text,
                                    backgroundColor: darkMode ? badgeStyles.darkBg : badgeStyles.bg
                                  }}
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
                                {log.ip && <span className="block text-xs text-[#7A6068]/80 font-mono mt-0.5">{log.ip}</span>}
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
                    ref={profileFormRef}
                    onSubmit={async (e) => {
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

                      try {
                        const response = await api.patch('/auth/profile/', {
                          name, designation, dept, phone, campus
                        });
                        const updated = response.data;

                        // Reflect the persisted (server-confirmed) values, not the raw form input
                        const updatedAdmins = admins.map(a =>
                          a.email.toLowerCase() === profile.email.toLowerCase() ? { ...a, ...updated } : a
                        );
                        setAdmins(updatedAdmins);
                        if (currentAdmin && currentAdmin.email.toLowerCase() === profile.email.toLowerCase()) {
                          setCurrentAdmin({ ...currentAdmin, ...updated });
                        }

                        logActivity("Profile Updated", "Updated name, designation, department, phone, and campus details", "updated");
                        setIsEditingProfile(false);
                      } catch (err) {
                        console.error("Profile update failed.", err);
                        alert(err.response?.data?.detail || "Failed to update profile. Please try again.");
                      }
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
                          {profile.public_signature || profile.publicKey}
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
                        onConfirm: async () => {
                          const departments = {
                            1: "General Administration",
                            2: "Audit & Risk Compliance",
                            3: "Information Security & IT Administration"
                          };
                          const designations = {
                            1: "Accounts Assistant",
                            2: "Senior Compliance Auditor",
                            3: "Director of IT Infrastructure"
                          };

                          try {
                            // The server never sees the plaintext password -- derive the
                            // same login-hash the sign-in flow sends, using that email's salt.
                            const saltResponse = await api.get(`/auth/salt/?email=${encodeURIComponent(email)}`);
                            const newAdminDerived = await deriveKeyAndHash(passVal, saltResponse.data.salt);

                            // Encrypt the current shared vaultKey with the new admin's masterKey
                            const activeVaultKey = vaultKey || masterKey;
                            let encryptedVKeyForNewAdmin = null;
                            if (activeVaultKey) {
                              const hexVaultKey = arrayBufferToHex(activeVaultKey);
                              encryptedVKeyForNewAdmin = await encryptData(hexVaultKey, newAdminDerived.masterKey);
                            }

                            const response = await api.post('/admins/', {
                              name,
                              email,
                              password: newAdminDerived.loginHashHex,
                              level: levelVal,
                              dept: departments[levelVal],
                              campus: "",
                              designation: designations[levelVal],
                              encrypted_vault_key: encryptedVKeyForNewAdmin
                            });

                            setAdmins([...admins, response.data]);
                            logActivity("Admin Registered", `Registered new administrator: ${name} (Level ${levelVal})`, "updated");
                            targetForm.reset();
                            setAdminSuccessMessage(`Administrator "${name}" successfully registered! They can now log in using their email and password.`);
                          } catch (err) {
                            console.error("Admin registration failed.", err);
                            setValidationError(err.response?.data?.email?.[0] || err.response?.data?.detail || "Failed to register administrator. Please try again.");
                          }
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
                        <div className="relative z-20">
                          <input type="hidden" name="adminLevel" value={regAdminLevel} />
                          <button
                            type="button"
                            onClick={() => setRegAdminLevelDropdownOpen(!regAdminLevelDropdownOpen)}
                            className="w-full h-11 px-3.5 pr-10 text-sm border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold flex items-center text-left cursor-pointer"
                            style={{ borderColor: BORDER }}
                          >
                            <span className="font-bold text-[#7B1535] dark:text-[#E27D9B] truncate">
                              {regAdminLevel === "3" ? "Level 3 - Super Admin" : regAdminLevel === "2" ? "Level 2 - Limited Access" : "Level 1 - Read Only"}
                            </span>
                          </button>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                            <ChevronDown size={16} className={`transition-transform duration-200 ${regAdminLevelDropdownOpen ? "rotate-180" : ""}`} />
                          </div>

                          {regAdminLevelDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setRegAdminLevelDropdownOpen(false)} />
                              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#151515] rounded-xl shadow-2xl z-40 py-1.5 overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                                {[
                                  { value: "1", label: "Level 1 - Read Only" },
                                  { value: "2", label: "Level 2 - Limited Access" },
                                  { value: "3", label: "Level 3 - Super Admin" }
                                ].map((opt) => {
                                  const isSelected = regAdminLevel === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        setRegAdminLevel(opt.value);
                                        setRegAdminLevelDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                                        isSelected
                                          ? "bg-[#FBF3F5] dark:bg-[#221015]"
                                          : "hover:bg-slate-50 dark:hover:bg-[#202020]"
                                      }`}
                                      style={isSelected ? { color: MAROON } : { color: "#1A0810" }}
                                    >
                                      <span className={isSelected ? "text-[#7B1535] dark:text-[#E27D9B] font-bold" : "dark:text-slate-200"}>{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
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
                    onSubmit={async (e) => {
                      e.preventDefault();
                      
                      const currentVal = e.target.elements["currentPassword"].value;
                      const confirmVal = e.target.elements["confirmPassword"].value;

                      // 1. Verify current password matches locally
                      const currentHash = await hashPasswordSHA256(currentVal);
                      if (currentHash !== passwordHash) {
                        alert("Error: Current password is incorrect.");
                        return;
                      }

                      // 2. Verify new password matches confirmation
                      if (newPasswordVal !== confirmVal) {
                        alert("Error: New password and confirmation password do not match.");
                        return;
                      }

                      // 3. Check complexity rules
                      if (newPasswordVal.length < 10) {
                        alert("Error: New password must be at least 10 characters long.");
                        return;
                      }

                      try {
                        // 4. Retrieve salt
                        const saltResponse = await api.get(`/auth/salt/?email=${encodeURIComponent(activeAdmin.email)}`);
                        const serverSalt = saltResponse.data.salt;

                        // 5. Derive new masterKey and new loginHashHex
                        const derived = await deriveKeyAndHash(newPasswordVal, serverSalt);

                        // 6. Re-encrypt the current decrypted vaultKey using the new derived masterKey
                        if (!vaultKey) {
                          alert("Error: Vault encryption key is not loaded in this session.");
                          return;
                        }
                        const hexVaultKey = arrayBufferToHex(vaultKey);
                        const newEncryptedVaultKey = await encryptData(hexVaultKey, derived.masterKey);

                        // 7. Call the backend API patch endpoint
                        await api.patch('/auth/profile/', {
                          password: derived.loginHashHex,
                          encrypted_vault_key: newEncryptedVaultKey
                        });

                        // 8. Update local cryptographic states
                        setMasterKey(derived.masterKey);
                        const newLocalHash = await hashPasswordSHA256(newPasswordVal);
                        setPasswordHash(newLocalHash);

                        logActivity("Security Alert", "Master password updated successfully on server", "warning");
                        alert("Master password updated successfully!");

                        setNewPasswordVal("");
                        e.target.reset();
                      } catch (err) {
                        console.error("Password change failed.", err);
                        alert(err.response?.data?.detail || "Failed to update master password on server. Please try again.");
                      }
                    }}
                    className="lg:col-span-2 space-y-5"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                        Current Master Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
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
                        name="newPassword"
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
                        name="confirmPassword"
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
              setActivities={setActivities}
              setEntities={setEntities}
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
              masterPasswordHash={passwordHash}
              activeAdmin={activeAdmin}
            />
          )}

          {activeTab === "help" && (
            <HelpInfo onOpenHelpDesk={() => setIsHelpDeskOpen(true)} />
          )}
        </main>
      </div>

      <HelpDeskModal
        isOpen={isHelpDeskOpen}
        onClose={() => setIsHelpDeskOpen(false)}
      />

      {selectedBank && (
        <AccountModal
          bank={selectedBank}
          activeAdmin={activeAdmin}
          onClose={() => setSelectedBank(null)}
          onDelete={(bankObj) => {
            setDeleteBank(bankObj);
            setSelectedBank(null);
          }}
          onEdit={(bankObj) => {
            setSelectedBank(null);
            handleOpenEditModal(bankObj);
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
        defaultEntityId={entities.find(e => e.email === selectedUser)?.id}
        bankToEdit={editingBank}
        onAdd={handleAddBank}
        onEdit={handleEditBank}
      />

      {deleteBank && (
        <DeleteConfirmModal
          bank={deleteBank}
          onClose={() => setDeleteBank(null)}
          onConfirm={() => handleDeleteBank(deleteBank.id)}
        />
      )}

      {showEntityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 max-w-sm w-full mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up text-center" style={{ borderColor: BORDER }}>
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mx-auto text-amber-500 mb-4 animate-pulse text-lg font-bold">
              ⚠️
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">
              Registered Entity Required
            </h3>
            <p className="text-xs text-[#7A6068] dark:text-slate-400 mb-5 leading-relaxed font-semibold">
              You must register at least one school branch or entity before linking bank accounts. Please go to "Register Entity" to add an entity.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEntityWarning(false)}
                className="flex-grow h-10 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEntityWarning(false);
                  setActiveTab("entities");
                }}
                className="flex-grow h-10 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                style={{ backgroundColor: MAROON }}
              >
                Go to Register Entity
              </button>
            </div>
          </div>
        </div>
      )}

      {validationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 max-w-sm w-full mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up text-center" style={{ borderColor: BORDER }}>
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto text-red-500 mb-4 animate-pulse text-lg font-bold">
              ⚠️
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">
              Registration Validation Error
            </h3>
            <div className="text-xs text-[#7A6068] dark:text-slate-400 mb-5 leading-relaxed font-semibold">
              {validationError}
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="w-full h-10 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              style={{ backgroundColor: MAROON }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {adminSuccessMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 max-w-sm w-full mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up text-center" style={{ borderColor: BORDER }}>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto text-emerald-500 mb-4 animate-pulse text-lg font-bold">
              ✓
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">
              Registration Successful
            </h3>
            <p className="text-xs text-[#7A6068] dark:text-slate-400 mb-5 leading-relaxed font-semibold">
              {adminSuccessMessage}
            </p>
            <button
              onClick={() => setAdminSuccessMessage(null)}
              className="w-full h-10 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              style={{ backgroundColor: MAROON }}
            >
              Close
            </button>
          </div>
        </div>
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

      {duplicateEntityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-[450px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border-2 p-6 text-center animate-scale-in" style={{ borderColor: "rgba(239, 68, 68, 0.4)" }}>
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-red-600 dark:text-red-400 mb-2.5">
              {duplicateEntityModal.title}
            </h3>
            <p className="text-xs text-[#7A6068] dark:text-slate-400 mb-6 leading-relaxed font-semibold">
              {duplicateEntityModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDuplicateEntityModal(null)}
                className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
              >
                Cancel & Review
              </button>
              <button
                onClick={() => {
                  duplicateEntityModal.onConfirm();
                  setDuplicateEntityModal(null);
                }}
                className="flex-1 h-11 text-xs font-black rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              >
                Register Anyway
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
              {emailOtpState.success ? (
                <div className="space-y-5 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce"
                    style={{ backgroundColor: `${MAROON}15`, color: MAROON }}
                  >
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1.5">
                      Email Updated Successfully
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                      Your email address has been updated to:
                      <span className="block mt-1 font-mono font-bold text-slate-700 dark:text-slate-350">{emailOtpState.newEmail}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailOtpState(null)}
                    className="w-full h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                    style={{ backgroundColor: MAROON }}
                  >
                    Close
                  </button>
                </div>
              ) : !emailOtpState.otpSent ? (
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
                      disabled={loading}
                      onClick={async () => {
                        const newMail = emailOtpState.newEmail.trim();
                        if (!newMail || !newMail.includes("@")) {
                          alert("Please enter a valid email address.");
                          return;
                        }
                        setLoading(true);
                        try {
                          await api.post('/auth/email-change/', { new_email: newMail });
                          setEmailOtpState({
                            ...emailOtpState,
                            otpSent: true
                          });
                        } catch (error) {
                          console.error("Failed requesting email change.", error);
                          alert(error.response?.data?.detail || "Failed sending verification code. Email may already be registered.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                      style={{ backgroundColor: MAROON }}
                    >
                      {loading ? "Sending..." : "Send OTP Code"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-amber-850 dark:text-amber-400 uppercase tracking-widest block mb-1">Verification OTP Sent</span>
                    <span className="text-xs text-slate-650 dark:text-slate-450 block font-bold leading-relaxed">An OTP has been sent to your email. Kindly type the code.</span>
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
                      disabled={loading}
                      onClick={async () => {
                        const userCode = emailOtpState.userCode;
                        if (!userCode || userCode.length < 6) {
                          alert("Please enter the complete 6-digit OTP code.");
                          return;
                        }
                        const newEmail = emailOtpState.newEmail.trim();
                        const targetEmail = activeAdmin.email;

                        setLoading(true);
                        try {
                          await api.post('/auth/email-change/verify/', {
                            new_email: newEmail,
                            otp: userCode
                          });

                          // Update state successfully
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

                          setEmailOtpState({
                            ...emailOtpState,
                            success: true
                          });
                        } catch (error) {
                          console.error("Email update verification failed.", error);
                          alert(error.response?.data?.detail || "Invalid or expired OTP code.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
                      style={{ backgroundColor: MAROON }}
                    >
                      {loading ? "Verifying..." : "Verify & Update"}
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

        {activeAdmin?.level >= 2 && (
          <button
            onClick={() => handleTabChange("entities")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${activeTab === "entities" ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068] dark:text-slate-400"
              }`}
          >
            <UserPlus size={20} />
            <span className="text-[10px] font-bold">Entities</span>
          </button>
        )}

        {activeAdmin?.level >= 2 && (
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
        )}

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

      {activeTab === "vault" && <Footer onOpenHelpDesk={() => setIsHelpDeskOpen(true)} />}

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
                      handleLogout();
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
