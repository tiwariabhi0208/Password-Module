import React, { useState, useEffect } from "react";
import { ShieldCheck, Database, AlertTriangle, Eye, EyeOff, X, Lock, ChevronDown } from "lucide-react";
import { MAROON, MAROON_HOVER, BORDER } from "./theme";
import { api } from "../utils/apiClient";
import { hashPasswordSHA256 } from "../utils/cryptoHelper";

export function Settings({
  banks,
  setBanks,
  setActivities,
  setEntities,
  logActivity,
  tfaEnabled,
  setTfaEnabled,
  auditEnabled,
  setAuditEnabled,
  timeoutDuration,
  setTimeoutDuration,
  darkMode,
  setDarkMode,
  defaultBanks,
  masterPasswordHash,
  activeAdmin
}) {
  const [actionType, setActionType] = useState(null); // 'export' | 'reset' | null
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordHash, setConfirmPasswordHash] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [timeoutDropdownOpen, setTimeoutDropdownOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function updateHash() {
      if (!confirmPassword) {
        if (active) setConfirmPasswordHash("");
        return;
      }
      const hash = await hashPasswordSHA256(confirmPassword);
      if (active) setConfirmPasswordHash(hash);
    }
    updateHash();
    return () => {
      active = false;
    };
  }, [confirmPassword]);

  const targetPasswordHash = masterPasswordHash;
  const isMatch = confirmPasswordHash && targetPasswordHash && confirmPasswordHash === targetPasswordHash;

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(banks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sps_vault_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logActivity("Backup Exported", "Exported vault credentials database to JSON backup", "info");
  };

  const handleConfirmAction = async () => {
    if (!isMatch) return;
    
    if (actionType === "export") {
      handleExportData();
      setSuccessMessage("Database backup JSON file generated successfully.");
    } else if (actionType === "reset") {
      try {
        await api.post('/auth/reset-database/');
        setBanks([]);
        setActivities([]);
        setEntities([]);
        logActivity("Database Reset", "Wiped all vault credentials, logs, and entities", "warning");
        setSuccessMessage("Database successfully reset. All credentials, activity logs, and entities have been erased.");
      } catch (error) {
        console.error("Failed to reset database:", error);
        alert("Failed to reset database. Please try again.");
      }
    }
    setActionType(null);
    setConfirmPassword("");
    setShowPass(false);
  };

  return (
    <div className="w-full text-left animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>General Settings</h1>
        <p className="text-sm text-[#7A6068] dark:text-slate-400 mt-0.5 font-medium">
          Manage your security options, interfaces, and vault backups
        </p>
      </div>
      <div className="h-px mb-6" style={{ backgroundColor: BORDER }} />

      <div className="space-y-8">
        {/* Security & Audit Section */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
            <ShieldCheck size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Security & Audit</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Dark Mode Toggle */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Interface Mode</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Switch between standard light layout and oklch dark security interface.
                </span>
              </div>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  logActivity("Settings Updated", `Dark theme was ${!darkMode ? "enabled" : "disabled"}`, "info");
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${darkMode ? "bg-[#7B1535] dark:bg-[#E27D9B]" : "bg-slate-200 dark:bg-slate-800"} relative cursor-pointer`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-100 shadow transition-all duration-300 ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Require a mobile authenticator code when logging in from new sessions.
                </span>
              </div>
              <button
                onClick={async () => {
                  const targetState = !tfaEnabled;
                  try {
                    setTfaEnabled(targetState);
                    await api.post('/auth/tfa/toggle/', { tfa_enabled: targetState });
                    logActivity("Settings Updated", `2FA auth was ${targetState ? "enabled" : "disabled"}`, "info");
                  } catch (error) {
                    console.error("Failed to toggle 2FA settings:", error);
                    setTfaEnabled(!targetState);
                    alert("Failed to update 2FA setting. Please try again.");
                  }
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${tfaEnabled ? "bg-[#7B1535] dark:bg-[#E27D9B]" : "bg-slate-200 dark:bg-slate-800"} relative cursor-pointer`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-100 shadow transition-all duration-300 ${tfaEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Strict Audit Log Toggle */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Strict Audit Logging</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Log every individual view event, export activity, and configuration update.
                </span>
              </div>
              <button
                onClick={() => {
                  setAuditEnabled(!auditEnabled);
                  logActivity("Settings Updated", `Strict logging was ${!auditEnabled ? "enabled" : "disabled"}`, "info");
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${auditEnabled ? "bg-[#7B1535] dark:bg-[#E27D9B]" : "bg-slate-200 dark:bg-slate-800"} relative cursor-pointer`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-100 shadow transition-all duration-300 ${auditEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Auto Lock Timer Select */}
            <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800/60 text-left" style={{ borderColor: BORDER }}>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Inactivity Timeout Lock</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Automatically lock vault database after a period of user inactivity.
                </span>
              </div>
              <div className="relative z-20">
                {(() => {
                  const optionsMap = {
                    "5m": "5 min",
                    "10m": "10 min",
                    "15m": "15 min",
                    "30m": "30 min",
                    "60m": "60 min",
                    "never": "Never"
                  };

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setTimeoutDropdownOpen(!timeoutDropdownOpen)}
                        className="h-10 pl-3.5 pr-9 text-xs font-bold border bg-[#FDFAFB] dark:bg-[#121212] border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all flex items-center justify-between cursor-pointer min-w-[100px]"
                        style={{ borderColor: BORDER }}
                      >
                        <span className="font-bold text-[#7B1535] dark:text-[#E27D9B]">
                          {optionsMap[timeoutDuration] || "15 min"}
                        </span>
                      </button>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronDown size={14} className={`transition-transform duration-200 ${timeoutDropdownOpen ? "rotate-180" : ""}`} />
                      </div>

                      {timeoutDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setTimeoutDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#151515] rounded-xl shadow-2xl z-40 py-1.5 w-32 overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                            {[
                              { value: "5m", label: "5 min" },
                              { value: "10m", label: "10 min" },
                              { value: "15m", label: "15 min" },
                              { value: "30m", label: "30 min" },
                              { value: "60m", label: "60 min" },
                              { value: "never", label: "Never" }
                            ].map((opt) => {
                              const isSelected = timeoutDuration === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setTimeoutDuration(opt.value);
                                    logActivity("Settings Updated", `Inactivity lock duration set to ${opt.value === "never" ? "never" : opt.value}`, "info");
                                    setTimeoutDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#FBF3F5] dark:bg-[#221015]"
                                      : "hover:bg-slate-50 dark:hover:bg-[#202020]"
                                  }`}
                                  style={isSelected ? { color: MAROON } : { color: "#1A0810" }}
                                >
                                  <span className={isSelected ? "text-[#7B1535] dark:text-[#E27D9B] font-bold" : "dark:text-slate-200"}>
                                    {opt.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Data & Backup Section */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200/60 dark:border-slate-800">
            <Database size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Data & Database backups</h2>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
              <div className="flex flex-col max-w-md">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Export Vault Database</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Download a local copy of all current bank credentials, usernames, and properties in JSON format.
                </span>
              </div>
              <button
                onClick={() => {
                  setActionType("export");
                  setConfirmPassword("");
                  setShowPass(false);
                }}
                className="h-10 px-5 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none shrink-0"
                style={{ backgroundColor: MAROON }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
              >
                Export Database (.json)
              </button>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {activeAdmin?.level === 3 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                <div className="flex flex-col max-w-md">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Database Maintenance</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                    Reset the vault records database back to the original standard 8 institutional bank accounts.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActionType("reset");
                    setConfirmPassword("");
                    setShowPass(false);
                  }}
                  className="h-10 px-5 rounded-xl text-sm font-bold text-[#7B1535] dark:text-[#E27D9B] border-2 border-[#7B1535] dark:border-[#E27D9B] hover:bg-[#FBF3F5] dark:hover:bg-[#221015] transition-all cursor-pointer shrink-0"
                >
                  Reset Database
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 opacity-60">
                <div className="flex flex-col max-w-md">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Database Maintenance</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                    Resetting the vault records database is restricted to Level 3 - Super Administrators only.
                  </span>
                </div>
                <button
                  disabled
                  className="h-10 px-5 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-600 border-2 border-slate-200 dark:border-slate-800 transition-all cursor-not-allowed shrink-0 bg-slate-50 dark:bg-[#1b1b1b]"
                >
                  Reset Restricted
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strict Security Modal Confirmation */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 max-w-md w-full mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up text-left">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <AlertTriangle size={19} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Security Authorization
                  </h3>
                  <span className="text-xs font-extrabold text-red-600 dark:text-red-500 uppercase tracking-wider">
                    Strict clearance required
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActionType(null);
                  setConfirmPassword("");
                  setShowPass(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Warning Text */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 text-sm p-4 rounded-xl font-medium leading-relaxed mb-5">
              {actionType === "export" ? (
                <>
                  <span className="font-extrabold block mb-1 text-sm">⚠️ DANGEROUS EXPORT ACTION:</span>
                  You are exporting the primary school credentials vault database. This backup file will contain active credentials, routing tokens, and decrypted institutional records. If this file is intercepted or shared, it can lead to unauthorized access, fraudulent bank interactions, or account takeovers.
                </>
              ) : (
                <>
                  <span className="font-extrabold block mb-1 text-sm">⚠️ DANGEROUS DESTRUCTIVE ACTION:</span>
                  You are performing a hard database restore. This will wipe all campus records, active modifications, and customized credentials currently stored in the vault, reverting it back to standard setups. This action is permanent and cannot be undone.
                </>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Master Password to Unlock
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full h-11 pl-3.5 pr-10 text-sm font-semibold border bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] text-slate-800 dark:text-slate-200 transition-colors"
                  style={{ WebkitTextSecurity: showPass ? "none" : "disc" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password Match Message */}
              <div className="text-xs font-bold pt-1">
                {confirmPassword === "" ? (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock size={12} /> Enter master password to authenticate
                  </span>
                ) : isMatch ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    ✓ Master password verified. Access granted.
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    ❌ Invalid credentials. Button disabled.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3.5 pt-1">
              <button
                onClick={() => {
                  setActionType(null);
                  setConfirmPassword("");
                  setShowPass(false);
                }}
                className="px-4 h-10 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                disabled={!isMatch}
                onClick={handleConfirmAction}
                className={`px-4 h-10 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 border-none ${
                  isMatch 
                    ? "bg-[#7B1535] hover:bg-[#600f27] cursor-pointer hover:-translate-y-0.5 active:translate-y-0" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50 shadow-none"
                }`}
              >
                {actionType === "export" ? "Confirm & Export" : "Confirm & Reset"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 max-w-sm w-full mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl mb-4 animate-bounce"
              style={{ backgroundColor: `${MAROON}15`, color: MAROON }}
            >
              ✓
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">
              Action Completed
            </h3>
            <p className="text-xs text-[#7A6068] dark:text-slate-400 mb-5 leading-relaxed font-semibold">
              {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="w-full h-10 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              style={{ backgroundColor: MAROON }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
