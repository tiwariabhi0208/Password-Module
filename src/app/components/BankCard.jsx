import React from "react";
import { MAROON, GOLD, BORDER } from "./theme";

function maskAccount(num) {
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${num.slice(-4)}`;
}

export function BankCard({ bank, onClick, onConfirmDelete }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 text-center transition-all duration-300 border flex flex-col items-center justify-between aspect-square shadow-sm hover:shadow-md cursor-pointer"
      style={{ borderColor: BORDER }}
    >
      <div className="flex flex-col items-center gap-4 w-full my-auto">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: bank.color }}
        >
          <span className="text-white text-sm font-extrabold tracking-wider leading-none">{bank.initial}</span>
        </div>
        <div className="min-w-0 w-full">
          {/* Account name row with delete button */}
          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <p className="text-base font-bold truncate" style={{ color: MAROON }}>
              {bank.name}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete ${bank.name}?`)) {
                  onConfirmDelete(bank.id);
                }
              }}
              className="text-slate-400 hover:text-red-600 transition-colors p-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 duration-200"
              title="Delete Bank Account"
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <p className="text-xs font-mono mt-1.5 text-[#7A6068]">
            {maskAccount(bank.accountNumber)}
          </p>
        </div>
      </div>
      <div
        className="w-10 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-50 group-hover:scale-x-100"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );
}
