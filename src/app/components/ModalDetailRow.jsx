import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { MAROON } from "./theme";

export function ModalDetailRow({ label, value, isMonospaced = false, isPassword = false }) {
  const [showValue, setShowValue] = useState(!isPassword);
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-[#1A0810] text-sm font-medium ${isMonospaced ? "font-mono" : ""}`}>
          {isPassword && !showValue ? "••••••••" : value}
        </span>
        <div className="flex items-center gap-1">
          {isPassword && (
            <button
              onClick={() => setShowValue(!showValue)}
              className="p-1 rounded hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
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
