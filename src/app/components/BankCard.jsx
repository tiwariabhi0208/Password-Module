import React from "react";
import { Eye, Trash2, Lock, Wifi } from "lucide-react";
import { GOLD } from "./theme";
import bobLogo from "../../../photos/BOB-Bank.png";
import hdfcLogo from "../../../photos/HDFC-Bank.png";
import sbiLogo from "../../../photos/SBI-Bank.png";
import axisLogo from "../../../photos/AXIS-Bank.png";
import iciciLogo from "../../../photos/ICICI_Bank.png";
import kotakLogo from "../../../photos/KOTAK-Bank.png";
import yesLogo from "../../../photos/YES-Bank.png";

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
  return null;
}

export function BankCard({ bank, onClick, onConfirmDelete }) {
  // Extract initials or use predefined
  const initial = bank.initial || bank.name.slice(0, 2).toUpperCase();
  const logoUrl = getBankLogo(bank.name);

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden w-full aspect-[1.586/1] rounded-2xl transition-all duration-500 cursor-pointer shadow-md select-none border border-white/5 flex flex-col justify-between p-4.5 text-white"
      style={{
        background: `linear-gradient(135deg, ${bank.color}eb 0%, #0c0205 100%)`,
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.15)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 20px 40px -10px ${bank.color}50, 0 10px 20px -12px rgba(0,0,0,0.35)`;
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(0, 0, 0, 0.15)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
      }}
    >
      {/* Glossy Reflective Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-[25deg] -translate-y-1/2 scale-150 pointer-events-none transition-transform duration-1000 group-hover:translate-x-full" />

      {/* Decorative Radial Lighting Blurs */}
      <div 
        className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-2xl opacity-35 pointer-events-none" 
        style={{ backgroundColor: bank.color }} 
      />
      <div 
        className="absolute -left-12 -top-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none" 
        style={{ backgroundColor: GOLD }} 
      />

      {/* Header Row: Logo & Bank Name on the Left, Lock Status on the Right */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={bank.name} 
              className="w-8.5 h-8.5 rounded-lg object-contain bg-white p-1 border border-white/20 shadow-sm shrink-0" 
            />
          ) : (
            <div 
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20 bg-white/10 shrink-0" 
              style={{ color: GOLD }}
            >
              {initial}
            </div>
          )}
          <span 
            className="text-[12.5px] font-black tracking-wide uppercase drop-shadow-sm text-white/95 truncate" 
            title={bank.name}
          >
            {bank.name}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-70 shrink-0 bg-black/20 border border-white/10 px-2 py-1 rounded-lg">
          <Lock size={10} className="text-white/80" />
          <span className="text-[7.5px] font-extrabold tracking-wider text-white/80 uppercase">SECURE</span>
        </div>
      </div>

      {/* Middle Row: Gold Smart Chip & Wifi Icon */}
      <div className="flex items-center gap-3 relative z-10 mt-1">
        <svg width="32" height="24" viewBox="0 0 34 26" fill="none" className="rounded-[4px] shadow-sm">
          <rect width="34" height="26" rx="4" fill="url(#chip-grad-card)" />
          <rect x="2" y="2" width="30" height="22" rx="3" stroke="#4a3605" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M11 2v22M23 2v22M2 13h30M11 7.5h12M11 18.5h12" stroke="#4a3605" strokeWidth="0.8" opacity="0.3" />
          <defs>
            <linearGradient id="chip-grad-card" x1="0" y1="0" x2="34" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFECA1" />
              <stop offset="50%" stopColor="#C9A227" />
              <stop offset="100%" stopColor="#9C7514" />
            </linearGradient>
          </defs>
        </svg>
        <Wifi size={13} className="text-white/40 rotate-90" />
      </div>

      {/* Account Number Row (Credit Card Formatting) */}
      <div className="text-center font-mono text-[16px] sm:text-[18px] tracking-[0.18em] font-semibold relative z-10 drop-shadow-md text-white/90 my-1">
        ••••  ••••  ••••  {bank.accountNumber.slice(-4)}
      </div>

      {/* Footer Row: Cardholder & IFSC */}
      <div className="flex items-end justify-between w-full relative z-10">
        <div className="flex flex-col">
          <span className="text-[6.5px] uppercase tracking-widest text-white/40 leading-none">CARDHOLDER</span>
          <span className="text-[9.5px] font-bold tracking-wide mt-1 truncate max-w-[130px] uppercase text-white/90">
            {bank.holder ? bank.holder.split(",")[0] : "SOUTH POINT SCHOOL"}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[6.5px] uppercase tracking-widest text-white/40 leading-none">IFSC CODE</span>
          <span className="text-[9.5px] font-mono font-bold mt-1 text-white/85 tracking-wider">
            {bank.ifsc}
          </span>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-0 bg-[#0d0306]/85 backdrop-blur-[2.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 flex items-center justify-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirmDelete(bank);
          }}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}
