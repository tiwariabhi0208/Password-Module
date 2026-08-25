import React, { useState } from "react";
import { ShieldCheck, Database, AlertTriangle, Eye, EyeOff, X, Lock } from "lucide-react";
import { MAROON, MAROON_HOVER, BORDER } from "./theme";

export function Settings({
  banks,
  setBanks,
  logActivity,
  tfaEnabled,
  setTfaEnabled,
  auditEnabled,
  setAuditEnabled,
  timeoutEnabled,
  setTimeoutEnabled,
  darkMode,
  setDarkMode,
  defaultBanks,
  masterPassword
}) {
  const [actionType, setActionType] = useState(null); // 'export' | 'reset' | null
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const targetPassword = masterPassword || "admin123";
  const isMatch = confirmPassword === targetPassword;

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

  const handleConfirmAction = () => {
    if (!isMatch) return;
    
    if (actionType === "export") {
      handleExportData();
      alert("Database backup JSON file generated successfully.");
    } else if (actionType === "reset") {
      setBanks(defaultBanks);
      logActivity("Database Reset", "Reverted vault database to standard accounts", "warning");
      alert("Database successfully reset to original standard accounts.");
    }
    setActionType(null);
    setConfirmPassword("");
    setShowPass(false);
  };

  return (
    <div className="max-w-3xl text-left">
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Interface Mode</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Require a mobile authenticator code when logging in from new sessions.
                </span>
              </div>
              <button
                onClick={() => {
                  setTfaEnabled(!tfaEnabled);
                  logActivity("Settings Updated", `2FA auth was ${!tfaEnabled ? "enabled" : "disabled"}`, "info");
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${tfaEnabled ? "bg-[#7B1535] dark:bg-[#E27D9B]" : "bg-slate-200 dark:bg-slate-800"} relative cursor-pointer`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-100 shadow transition-all duration-300 ${tfaEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Strict Audit Log Toggle */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Strict Audit Logging</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
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

            {/* Auto Lock Timer Toggle */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Inactivity Timeout Lock</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Automatically lock vault database after 15 minutes of user inactivity.
                </span>
              </div>
              <button
                onClick={() => {
                  setTimeoutEnabled(!timeoutEnabled);
                  logActivity("Settings Updated", `Inactivity lock was ${!timeoutEnabled ? "enabled" : "disabled"}`, "info");
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${timeoutEnabled ? "bg-[#7B1535] dark:bg-[#E27D9B]" : "bg-slate-200 dark:bg-slate-800"} relative cursor-pointer`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-100 shadow transition-all duration-300 ${timeoutEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Vault Database</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Download a local copy of all current bank credentials, usernames, and properties in JSON format.
                </span>
              </div>
              <button
                onClick={() => {
                  setActionType("export");
                  setConfirmPassword("");
                  setShowPass(false);
                }}
                className="h-9 px-5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none shrink-0"
                style={{ backgroundColor: MAROON }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
              >
                Export Database (.json)
              </button>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
              <div className="flex flex-col max-w-md">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Maintenance</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal mt-0.5">
                  Reset the vault records database back to the original standard 8 institutional bank accounts.
                </span>
              </div>
              <button
                onClick={() => {
                  setActionType("reset");
                  setConfirmPassword("");
                  setShowPass(false);
                }}
                className="h-9 px-5 rounded-xl text-xs font-bold text-[#7B1535] dark:text-[#E27D9B] border-2 border-[#7B1535] dark:border-[#E27D9B] hover:bg-[#FBF3F5] dark:hover:bg-[#221015] transition-all cursor-pointer shrink-0"
              >
                Reset Database
              </button>
            </div>
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
                  <span className="text-[9px] font-extrabold text-red-600 dark:text-red-500 uppercase tracking-wider">
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
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 text-xs p-3.5 rounded-xl font-medium leading-relaxed mb-5">
              {actionType === "export" ? (
                <>
                  <span className="font-extrabold block mb-1">⚠️ DANGEROUS EXPORT ACTION:</span>
                  You are exporting the primary school credentials vault database. This backup file will contain active credentials, routing tokens, and decrypted institutional records. If this file is intercepted or shared, it can lead to unauthorized access, fraudulent bank interactions, or account takeovers.
                </>
              ) : (
                <>
                  <span className="font-extrabold block mb-1">⚠️ DANGEROUS DESTRUCTIVE ACTION:</span>
                  You are performing a hard database restore. This will wipe all campus records, active modifications, and customized credentials currently stored in the vault, reverting it back to standard setups. This action is permanent and cannot be undone.
                </>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-2 mb-5">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Master Password to Unlock
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full h-10 pl-3.5 pr-10 text-xs font-semibold border bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] text-slate-800 dark:text-slate-200 transition-colors"
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
              <div className="text-[10px] font-bold pt-1">
                {confirmPassword === "" ? (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock size={10} /> Enter master password to authenticate
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
                className="px-4 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                disabled={!isMatch}
                onClick={handleConfirmAction}
                className={`px-4 h-9 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 border-none ${
                  isMatch 
                    ? "bg-[#7B1535] hover:bg-[#600f27] cursor-pointer hover:-translate-y-0.5 active:translate-y-0" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50 shadow-none"
                }`}
              >
                {actionType === "export" ? "Confirm & Export Database" : "Confirm & Reset Database"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
