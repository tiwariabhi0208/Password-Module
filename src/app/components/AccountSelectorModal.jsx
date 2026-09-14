import React, { useState, useEffect } from "react";
import { X, Shield, Search } from "lucide-react";
import { MAROON, GOLD, BORDER } from "./theme";
import { getBankLogo } from "./BankCard";

export function AccountSelectorModal({
  isOpen,
  onClose,
  bankName,
  accounts,
  onViewDetails
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const logoUrl = getBankLogo(bankName);

  useEffect(() => {
    setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredAccounts = accounts.filter((acc, index) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const accountLabel = `account ${index + 1}`.toLowerCase();
    const matchesLabel = accountLabel.includes(q);
    const matchesBranch = acc.branchName && acc.branchName.toLowerCase().includes(q);
    const matchesHolder = acc.holder && acc.holder.toLowerCase().includes(q);
    const matchesNumber = acc.accountNumber && acc.accountNumber.toLowerCase().includes(q);
    const matchesType = acc.accountType && acc.accountType.toLowerCase().includes(q);

    return matchesLabel || matchesBranch || matchesHolder || matchesNumber || matchesType;
  });

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
            {accounts[0]?.photo ? (
              <img
                src={accounts[0].photo}
                alt={bankName}
                className="h-16 w-16 rounded-xl object-contain shrink-0 bg-white"
              />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt={bankName}
                className="h-16 w-auto object-contain shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10 shadow-inner"
                style={{ color: GOLD }}
              >
                <span className="text-base font-black tracking-wider leading-none">
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

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-[#101010]/50 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${bankName} accounts...`}
              className="w-full h-10 pl-9 pr-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all shadow-inner"
              style={{ borderColor: BORDER }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-[#101010]/20 flex-grow">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((acc) => {
              const originalIndex = accounts.findIndex((a) => a.id === acc.id);
              const displayIndex = originalIndex >= 0 ? originalIndex + 1 : 1;

              return (
                <div
                  key={acc.id}
                  onClick={() => onViewDetails(acc)}
                  className="bg-white dark:bg-[#121212] p-4.5 rounded-2xl border shadow-sm flex items-center justify-between gap-4 transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer text-left"
                  style={{ borderColor: BORDER }}
                >
                  <div className="flex flex-col text-left min-w-0 flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Account {displayIndex}
                      </span>
                      {acc.branchName && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">
                          {acc.branchName}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                      {acc.holder ? acc.holder.split(",")[0] : "SOUTH POINT SCHOOL"}
                    </span>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#7A6068] dark:text-slate-500">
                      Account Number
                    </span>
                    <span className="font-mono text-xs font-black text-[#7B1535] dark:text-[#E27D9B] bg-[#FBF3F5] dark:bg-[#221015]/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      {acc.accountNumber}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
              <Search size={28} className="text-slate-300 dark:text-slate-600 mb-1" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No accounts found
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                No matching accounts for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

