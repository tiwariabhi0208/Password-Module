import React, { useState, useEffect } from "react";
import { X, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const logoUrl = getBankLogo(bankName);

  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[520px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up flex flex-col max-h-[88vh]"
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
                className="h-14 w-14 rounded-xl object-contain shrink-0 bg-white"
              />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt={bankName}
                className="h-14 w-auto object-contain shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/10 shadow-inner"
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
        <div className="p-5 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-[#101010]/20 flex-grow">
          {filteredAccounts.length > 0 ? (
            paginatedAccounts.map((acc) => {
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

        {/* Footer Pagination Bar */}
        {filteredAccounts.length > 0 && (
          <div className="px-6 py-3.5 bg-white dark:bg-[#141414] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Showing <span className="font-black text-slate-800 dark:text-slate-200">{startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredAccounts.length)}</span> of <span className="font-black text-slate-800 dark:text-slate-200">{filteredAccounts.length}</span> accounts
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-transparent cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer border ${
                      pg === safeCurrentPage
                        ? "bg-[#7B1535] text-white border-[#7B1535] dark:bg-[#E27D9B] dark:text-[#101010] dark:border-[#E27D9B]"
                        : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#202020]"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202020] transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-transparent cursor-pointer"
                title="Next Page"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


