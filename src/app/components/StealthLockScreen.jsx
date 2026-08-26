import React from "react";
import { Lock, LogIn } from "lucide-react";
import schoolLogo from "../../../images(1).png";
import { MAROON, GOLD, BORDER, T, font, MAROON_HOVER, shadow } from "./theme";

export function StealthLockScreen({
  stealthPassword,
  setStealthPassword,
  stealthError,
  setStealthError,
  password,
  setStealthMode,
  setScreen
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (stealthPassword === password) {
      setStealthMode(false);
      setStealthPassword("");
      setStealthError("");
    } else {
      setStealthError("Incorrect password. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      style={{ fontFamily: font.body }}
    >
      <div
        className="w-full max-w-[400px] bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden border-2 border-[#C9A227]"
        style={{ boxShadow: shadow }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
            padding: "32px 24px 24px",
            textAlign: "center",
            borderBottom: `2.5px solid ${T.accent}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src={schoolLogo}
            alt="South Point School Logo"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
          />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
              Session Locked
            </h2>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: GOLD }}>
              Lock Screen Active
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-[#141414]">
          {stealthError && (
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2.5 rounded-lg">
              ⚠️ {stealthError}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Enter password to unlock
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="••••••••"
                value={stealthPassword}
                onChange={(e) => setStealthPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-10 text-sm border rounded-xl focus:outline-none transition-all bg-[#FDFAFB] dark:bg-[#181818] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-[#7B1535] dark:focus:border-[#E27D9B]"
                style={{ WebkitTextSecurity: "disc" }}
                autoComplete="new-password"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Lock size={15} />
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 text-sm font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
            style={{ backgroundColor: MAROON }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
          >
            <LogIn size={15} />
            Unlock Session
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setStealthMode(false);
                setStealthPassword("");
                setStealthError("");
                setScreen("login");
              }}
              className="text-xs font-semibold hover:underline text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              Sign Out / Exit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
