import React, { useEffect } from "react";
import { X, ExternalLink, Edit2 } from "lucide-react";
import { ModalDetailRow } from "./ModalDetailRow";
import { MAROON, GOLD, BORDER } from "./theme";

export function AccountModal({ bank, onClose, onDelete }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(80,10,25,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[520px] rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: BORDER }}>
        {/* Maroon modal header */}
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
              <button
                onClick={() => {
                  onDelete(bank);
                }}
                className="text-white/60 hover:text-red-400 transition-colors p-0.5 ml-1"
                title="Delete Account"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
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

        {/* Body */}
        <div className="bg-white px-5 py-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <ModalDetailRow label="Account Holder" value={bank.holder} />
            <ModalDetailRow label="Account Number" value={bank.accountNumber} isMonospaced={true} />
            <ModalDetailRow label="IFSC Code" value={bank.ifsc} isMonospaced={true} />
            <ModalDetailRow label="Branch Name" value={bank.branchName} />
            <ModalDetailRow label="Username" value={bank.username} isMonospaced={true} />
            <ModalDetailRow label="Password" value={bank.password} isMonospaced={true} isPassword={true} />
          </div>
        </div>

        {/* Footer */}
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
    </div>
  );
}
