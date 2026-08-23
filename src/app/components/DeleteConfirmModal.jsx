import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { MAROON, BORDER, T } from "./theme";

function maskAccount(num) {
  if (!num) return "";
  return `•••• •••• •••• ${num.slice(-4)}`;
}

export function DeleteConfirmModal({ bank, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!bank) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Dialog Card */}
      <div
        className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-red-200/80 transform scale-100 transition-all duration-300 flex flex-col"
        style={{ fontFamily: "inherit" }}
      >
        {/* Top Accent Warning Line */}
        <div className="h-1.5 w-full bg-red-600" />

        {/* Modal Header & Close Button */}
        <div className="flex justify-end pt-3 pr-3">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Cancel"
            style={{ border: "none", background: "none" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 flex flex-col items-center text-center">
          {/* Pulsing Warning Icon Container */}
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 animate-pulse">
            <AlertTriangle size={28} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-red-950 tracking-tight mb-2">
            Delete Bank Account?
          </h3>

          {/* Description */}
          <p className="text-sm text-[#7A6068] leading-relaxed mb-4">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{bank.name}</span> ({maskAccount(bank.accountNumber)})?
          </p>

          {/* Danger Alert Box */}
          <div className="w-full bg-red-50/60 border border-red-100/80 rounded-xl p-3.5 text-left mb-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 block mb-1">
              ⚠️ Strict Warning
            </span>
            <p className="text-xs text-red-900 leading-normal font-medium">
              This will permanently delete the entire account details, including saved login credentials, usernames, passwords, and IFSC codes. This action is irreversible.
            </p>
          </div>

          {/* Buttons Row */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              No, Keep Account
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-red-200 cursor-pointer"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
