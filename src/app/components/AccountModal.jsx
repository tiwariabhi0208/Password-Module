import React, { useEffect } from "react";
import { X, ExternalLink, Edit2, Trash2, Globe, Shield } from "lucide-react";
import { ModalDetailRow } from "./ModalDetailRow";
import { MAROON, GOLD, BORDER } from "./theme";
import { getBankLogo } from "./BankCard";

export function getDirectLoginUrl(bankName, accountType = "corporate") {
  if (!bankName) return "";
  const name = bankName.toLowerCase();
  const type = accountType.toLowerCase();

  if (name.includes("icici")) {
    return type === "retail" 
      ? "https://infinity.icicibank.com/" 
      : "https://cib.icicibank.com/";
  }
  if (name.includes("hdfc")) {
    return "https://netbanking.hdfcbank.com/netbanking/";
  }
  if (name.includes("state bank") || name.includes("sbi")) {
    return type === "retail"
      ? "https://retail.onlinesbi.sbi/"
      : "https://corp.onlinesbi.sbi/";
  }
  if (name.includes("axis")) {
    return type === "retail"
      ? "https://retail.axisbank.co.in/"
      : "https://corporate.axisbank.co.in/";
  }
  if (name.includes("kotak")) {
    return "https://netbanking.kotak.com/knb2/";
  }
  if (name.includes("yes")) {
    return "https://yesonline.yesbank.co.in/";
  }
  if (name.includes("punjab") || name.includes("pnb")) {
    return "https://netpnb.com/";
  }
  if (name.includes("baroda") || name.includes("bob")) {
    return "https://www.bobibanking.com/";
  }

  // Fallback to Google Search for unrecognized banks
  return `https://www.google.com/search?q=${encodeURIComponent(bankName + " " + type + " banking login")}`;
}

export function AccountModal({ bank, onClose, onDelete, onEdit }) {
  const logoUrl = getBankLogo(bank.name);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-[540px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up" 
        style={{ borderColor: BORDER }}
      >
        {/* Maroon modal header with brand identity gradient */}
        <div
          className="flex items-center justify-between px-6 py-5 text-white"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4a0d20 100%)` }}
        >
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={bank.name} 
                className="h-20 w-auto object-contain shrink-0" 
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10 shadow-inner"
                style={{ color: GOLD }}
              >
                <span className="text-xl font-black tracking-wider leading-none">
                  {bank.initial || bank.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-black tracking-wide leading-none">{bank.name}</span>
                <button 
                  className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5" 
                  title="Open official login portal"
                  onClick={() => window.open(getDirectLoginUrl(bank.name, bank.accountType), "_blank")}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
              <span className="text-[8.5px] uppercase tracking-widest text-white/50 font-black mt-1 flex items-center gap-1">
                <Shield size={10} className="text-[#C9A227]" /> Secured Vault Node
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDelete(bank)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-red-500/30 text-white/80 hover:text-red-300 transition-all cursor-pointer border-none"
              title="Delete Account"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => onEdit(bank)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-[#C9A227] hover:text-[#ffe066] transition-all cursor-pointer border-none"
              title="Edit Account Details"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white/85 hover:text-white transition-all cursor-pointer border-none"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 px-6 py-5">
            <ModalDetailRow label="Account Holder" value={bank.holder} />
            <ModalDetailRow label="Account Number" value={bank.accountNumber} isMonospaced={true} />
            <ModalDetailRow label="IFSC Code" value={bank.ifsc} isMonospaced={true} />
            <ModalDetailRow label="Branch Name" value={bank.branchName} />
            <ModalDetailRow label="Login Type" value={bank.accountType === "retail" ? "Retail / Personal Banking" : "Corporate Banking"} />
            <ModalDetailRow label="Net Banking Username" value={bank.username} isMonospaced={true} />
            <ModalDetailRow label="Password" value={bank.password} isMonospaced={true} isPassword={true} />
            {bank.transactionPassword && (
              <ModalDetailRow label="Transaction Password" value={bank.transactionPassword} isMonospaced={true} isPassword={true} />
            )}
          </div>
        </div>

        <div className="flex gap-4 px-6 py-4.5 border-t bg-slate-50/50 dark:bg-[#151515]/80" style={{ borderColor: BORDER }}>
          <button
            onClick={() => window.open(getDirectLoginUrl(bank.name, bank.accountType), "_blank")}
            className="flex-grow h-10 border border-[#7B1535] dark:border-[#E27D9B] text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 bg-transparent text-[#7B1535] dark:text-[#E27D9B] hover:bg-[#7B1535] hover:text-white dark:hover:bg-[#E27D9B] dark:hover:text-[#101010] active:scale-[0.98]"
          >
            <Globe size={13} />
            {bank.accountType === "retail" ? "Retail Login" : "Corporate Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
