import React, { useEffect } from "react";
import { X, Shield, Eye, Edit2, Trash2 } from "lucide-react";
import { MAROON, GOLD, BORDER } from "./theme";
import { getBankLogo } from "./BankCard";

export function AccountSelectorModal({
  isOpen,
  onClose,
  bankName,
  accounts,
  onViewDetails,
  onEdit,
  onDelete
}) {
  const logoUrl = getBankLogo(bankName);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[500px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up flex flex-col max-h-[85vh]"
        style={{ borderColor: BORDER }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4a0d20 100%)` }}
        >
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={bankName}
                className="h-12 w-auto object-contain shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10 shadow-inner"
                style={{ color: GOLD }}
              >
                <span className="text-sm font-black tracking-wider leading-none">
                  {bankName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-base font-black tracking-wide leading-none">{bankName}</span>
              <span className="text-[8.5px] uppercase tracking-widest text-white/50 font-black mt-1 flex items-center gap-1">
                <Shield size={10} className="text-[#C9A227]" /> {accounts.length} Accounts Registered
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8.5 h-8.5 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-[#101010]/20 flex-grow">
          {accounts.map((acc, index) => (
            <div
              key={acc.id}
              className="bg-white dark:bg-[#121212] p-4.5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.01]"
              style={{ borderColor: BORDER }}
            >
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Account {index + 1}
                  </span>
                  {acc.branchName && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">
                      {acc.branchName}
                    </span>
                  )}
                </div>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mb-0.5">
                  {acc.holder ? acc.holder.split(",")[0] : "SOUTH POINT SCHOOL"}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {acc.accountNumber}
                </span>
              </div>

              {/* Individual Account Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onViewDetails(acc)}
                  className="h-8.5 px-3 flex items-center justify-center gap-1 rounded-xl bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer border-none"
                  title="View Details"
                >
                  <Eye size={12} /> View
                </button>
                <button
                  onClick={() => onEdit(acc)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-[#7B1535]/10 dark:hover:bg-[#E27D9B]/10 text-slate-600 dark:text-slate-400 hover:text-[#7B1535] dark:hover:text-[#E27D9B] border border-slate-200/50 dark:border-slate-800 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  title="Edit Account Details"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => onDelete(acc)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-750 transition-all hover:scale-102 active:scale-98 cursor-pointer border border-transparent"
                  title="Delete Account"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
