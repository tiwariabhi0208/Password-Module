import React, { useEffect } from "react";
import { X, ExternalLink, Edit2, Trash2 } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(12,2,5,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-[520px] max-w-full bg-white rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up" 
        style={{ borderColor: BORDER }}
      >
        {/* Maroon modal header with gradient */}
        <div
          className="flex items-center justify-between px-6 py-4.5 text-white"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4c0519 100%)` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10"
              style={{ color: GOLD }}
            >
              <span className="text-sm font-black tracking-wide leading-none">{bank.initial || bank.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-extrabold tracking-wide leading-none">{bank.name}</span>
                <button 
                  className="text-white/60 hover:text-white transition-colors cursor-pointer" 
                  title="Open bank portal"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(bank.name + " corporate login")}`, "_blank")}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
              <span className="text-[8px] uppercase tracking-widest text-white/50 font-bold mt-1">Credentials Access</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDelete(bank)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-400 transition-all cursor-pointer border-none"
              title="Delete Account"
            >
              <Trash2 size={13} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#C9A227] hover:text-[#ffd24d] transition-all cursor-pointer border-none"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/85 hover:text-white transition-all cursor-pointer border-none"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="bg-slate-50/50 p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: BORDER }}>
            <ModalDetailRow label="Account Holder" value={bank.holder} />
            <ModalDetailRow label="Account Number" value={bank.accountNumber} isMonospaced={true} />
            <ModalDetailRow label="IFSC Code" value={bank.ifsc} isMonospaced={true} />
            <ModalDetailRow label="Branch Name" value={bank.branchName} />
            <ModalDetailRow label="Username" value={bank.username} isMonospaced={true} />
            <ModalDetailRow label="Password" value={bank.password} isMonospaced={true} isPassword={true} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4.5 border-t bg-slate-50/60" style={{ borderColor: BORDER }}>
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(bank.name + " corporate banking")}`, "_blank")}
            className="flex-1 h-9 border-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
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
            <ExternalLink size={12} />
            Corporate Portal
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(bank.name + " login")}`, "_blank")}
            className="flex-1 h-9 border-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
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
            <ExternalLink size={12} />
            Retail Portal
          </button>
        </div>
      </div>
    </div>
  );
}
