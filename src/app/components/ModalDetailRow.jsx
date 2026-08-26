import React, { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { MAROON } from "./theme";

export function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded hover:bg-black/5 transition-colors flex items-center justify-center flex-shrink-0"
      style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check size={12} style={{ color: "#16A34A" }} />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

export function ModalDetailRow({ label, value, isMonospaced = false, isPassword = false }) {
  const [showValue, setShowValue] = useState(!isPassword);
  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50/50 dark:bg-[#181818]/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]">
      <p 
        className="text-xs font-black uppercase tracking-widest text-[#7B1535] dark:text-[#E27D9B] mb-0.5"
      >
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[#1A0810] dark:text-slate-100 text-base font-bold select-all ${isMonospaced ? "font-mono tracking-wide" : ""}`}>
          {isPassword && !showValue ? "••••••••" : value}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-slate-850 p-1 rounded-xl shadow-sm">
          {isPassword && (
            <button
              onClick={() => setShowValue(!showValue)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              style={{ border: "none", background: "none", cursor: "pointer" }}
              title={showValue ? "Hide Password" : "Show Password"}
            >
              {showValue ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
          <CopyButton value={value} label={label} />
        </div>
      </div>
    </div>
  );
}
