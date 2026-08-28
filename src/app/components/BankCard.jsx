import React from "react";
import { Eye, Trash2, Lock, Edit2 } from "lucide-react";
import { GOLD, MAROON, BORDER } from "./theme";
import bobLogo from "../../../photos/BOB-Bank.png";
import hdfcLogo from "../../../photos/HDFC-Bank.png";
import sbiLogo from "../../../photos/SBI-Bank.png";
import axisLogo from "../../../photos/AXIS-Bank.png";
import iciciLogo from "../../../photos/ICICI_Bank.png";
import kotakLogo from "../../../photos/KOTAK-Bank.png";
import yesLogo from "../../../photos/YES-Bank.png";
import pnbLogo from "../../../photos/PNB-Bank.png";

export function getBankLogo(bankName) {
  if (!bankName) return null;
  const name = bankName.toLowerCase();
  if (name.includes("hdfc")) return hdfcLogo;
  if (name.includes("state bank") || name.includes("sbi")) return sbiLogo;
  if (name.includes("baroda") || name.includes("bob")) return bobLogo;
  if (name.includes("axis")) return axisLogo;
  if (name.includes("icici")) return iciciLogo;
  if (name.includes("kotak")) return kotakLogo;
  if (name.includes("yes")) return yesLogo;
  if (name.includes("punjab") || name.includes("pnb")) return pnbLogo;
  return null;
}

export function BankCard({ accounts, onClick, onConfirmDelete, onEdit }) {
  const bank = accounts[0];
  const isMultiple = accounts.length > 1;

  // Extract initials or use predefined
  const initial = bank.initial || bank.name.slice(0, 2).toUpperCase();
  const logoUrl = getBankLogo(bank.name);

  // Helper values for multiple accounts logic
  const isSameHolder = accounts.every(a => a.holder === bank.holder);
  const holderText = isSameHolder ? bank.holder.split(",")[0] : "Multiple Holders";

  const isSameIfsc = accounts.every(a => a.ifsc === bank.ifsc);
  const ifscText = isSameIfsc ? bank.ifsc : "Multiple IFSCs";

  const isSameBranch = accounts.every(a => a.branchName === bank.branchName);
  const branchText = isSameBranch ? (bank.branchName || "Guwahati Main") : "Multiple Branches";

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden w-full aspect-[1.586/1] rounded-2xl transition-all duration-300 cursor-pointer shadow-md select-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 text-slate-850 dark:text-slate-200 bg-white dark:bg-[#121212]"
      style={{
        boxShadow: "0 4px 15px -2px rgba(0, 0, 0, 0.05)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)";
        e.currentTarget.style.borderColor = bank.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 15px -2px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.borderColor = "";
      }}
    >
      {/* Brand Accent Top Strip */}
      <div 
        className="absolute left-0 right-0 top-0 h-1.5 transition-all duration-300"
        style={{ backgroundColor: bank.color }}
      />

      {/* Structured Document Layout */}
      <div className="flex flex-col h-full justify-between gap-2 relative z-10">
        
        {/* Row 1: Header (Bank Info & Account Tag) */}
        <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            {bank.photo ? (
              <img 
                src={bank.photo} 
                alt={bank.name} 
                className="h-14 w-14 rounded-xl object-contain shrink-0 bg-white" 
              />
            ) : logoUrl ? (
              <img 
                src={logoUrl} 
                alt={bank.name} 
                className="h-14 w-auto object-contain shrink-0" 
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-black bg-slate-100 dark:bg-slate-900 shrink-0 text-slate-650 dark:text-slate-350"
              >
                {initial}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate tracking-wide">
                {bank.name}
              </span>
              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                OFFICIAL BANK CARD
              </span>
            </div>
          </div>
          
          <div 
            className="px-2 py-0.5 rounded-md text-[8.5px] font-extrabold tracking-wider border shrink-0 bg-slate-50 dark:bg-slate-900/50 uppercase"
            style={{ 
              color: bank.color, 
              borderColor: `${bank.color}35`, 
            }}
          >
            {isMultiple ? `${accounts.length} Accounts` : (bank.accountType === "retail" ? "Retail A/C" : "Corporate A/C")}
          </div>
        </div>

        {/* Row 2: Account Number Section */}
        <div className="flex flex-col bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-lg p-2 flex-grow justify-center">
          <span className="text-[8.5px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-extrabold block mb-0.5">
            {isMultiple ? "Account Numbers" : "Account Number (A/C)"}
          </span>
          <div className={`font-mono font-black text-slate-800 dark:text-slate-100 tracking-wide truncate ${isMultiple ? "text-xs" : "text-base"}`}>
            {isMultiple ? accounts.map(a => `•••• ${a.accountNumber.slice(-4)}`).join(", ") : bank.accountNumber}
          </div>
        </div>

        {/* Row 3: Account Holder & Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[8.5px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-extrabold block mb-0.5">
              Account Holder
            </span>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-wide">
              {holderText}
            </span>
          </div>

          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[8.5px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-extrabold block mb-0.5">
              IFSC Code
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              {ifscText}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-900 text-[9.5px] text-slate-500 dark:text-slate-400 font-bold">
          <div className="truncate">
            Branch: <span className="text-slate-700 dark:text-slate-350 font-extrabold">{branchText}</span>
          </div>
        </div>

      </div>

      {/* Hover Action Overlay */}
      {isMultiple ? (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 flex items-center justify-center px-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold py-2.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none"
            title="View Accounts"
          >
            <Eye size={14} /> View Accounts
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 flex items-center justify-center gap-2.5 px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center gap-1 bg-[#C9A227] hover:bg-[#b08d20] text-white text-[11px] font-black px-2.5 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none"
            title="View Details"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(accounts[0]);
            }}
            className="flex items-center gap-1 bg-[#7B1535] hover:bg-[#600f27] text-white text-[11px] font-black px-2.5 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none"
            title="Edit Details"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete(accounts[0]);
            }}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-2.5 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none"
            title="Delete Account"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
