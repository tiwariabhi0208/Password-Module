import React from "react";
import { MAROON, GOLD, BORDER } from "./theme";

function maskAccount(num) {
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${num.slice(-4)}`;
}

export function BankCard({ bank, onClick, onConfirmDelete }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl p-5 text-center transition-all duration-300 border flex flex-col items-center justify-between aspect-square shadow-sm hover:shadow-md hover:border-[#C9A227]/40 cursor-pointer relative overflow-hidden"
      style={{ borderColor: BORDER }}
    >
      {/* Top-right delete button visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfirmDelete(bank);
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100 duration-200 cursor-pointer"
        title="Delete Bank Account"
        style={{ border: "none", background: "none" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>

      <div className="flex flex-col items-center gap-3.5 w-full my-auto">
        {/* Avatar Icon */}
        <div
          className="w-13 h-13 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: bank.color }}
        >
          <span className="text-white text-sm font-extrabold tracking-wider leading-none">{bank.initial}</span>
        </div>

        {/* Account Details */}
        <div className="min-w-0 w-full">
          <p className="text-[14.5px] font-bold truncate text-[#7B1535] leading-snug">
            {bank.name}
          </p>
          <p className="text-xs font-mono text-[#7A6068] mt-1">
            {maskAccount(bank.accountNumber)}
          </p>
        </div>
      </div>

      {/* Bottom gold hover indicator */}
      <div
        className="w-10 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-50 group-hover:scale-x-100 mt-1"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );
}
