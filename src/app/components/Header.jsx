import React, { useState } from "react";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import schoolLogo from "../../../images(1).png";
import { MAROON, GOLD, BORDER } from "./theme";

export const USERS = ["Priya Sharma", "Rahul Verma", "Anita Nair", "Deepak Mehta"];

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function Header({ selectedUser, setSelectedUser, setScreen, setStealthMode, onNavigate }) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  return (
    <nav
      className="h-20 flex items-center px-6 justify-between sticky top-0 z-20 shadow-md"
      style={{ backgroundColor: MAROON, borderBottom: `2.5px solid ${GOLD}` }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <img
          src={schoolLogo}
          alt="South Point School Logo"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold leading-tight">South Point School</span>
          <span
            className="text-[10px] font-bold tracking-wider uppercase mt-0.5"
            style={{ color: GOLD }}
          >
            GUWAHATI
          </span>
        </div>
      </div>

      {/* Actions (Stealth Button & Avatar Menu) */}
      <div className="flex items-center gap-4">
        {/* Stealth Mode Button */}
        <button
          onClick={() => setStealthMode(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg border text-sm font-bold transition-all hover:bg-white/10 text-white shadow-sm hover:shadow"
          style={{ borderColor: "rgba(255,255,255,0.35)", cursor: "pointer", letterSpacing: "0.02em" }}
          title="Activate Stealth Mode (Quick Lock)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Stealth Mode
        </button>

        {/* Avatar menu */}
        <div className="relative">
          <button
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{ backgroundColor: "rgba(201,162,39,0.2)", borderColor: GOLD }}
            >
              <span className="text-[10px] font-bold" style={{ color: GOLD }}>
                {getInitials(selectedUser)}
              </span>
            </div>
            <span className="text-sm text-white font-medium">{selectedUser}</span>
            <ChevronDown size={13} className="text-white/60" />
          </button>

          {avatarMenuOpen && <>
            <div className="fixed inset-0 z-10" onClick={() => setAvatarMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#151515] rounded-xl shadow-xl z-30 py-1 overflow-hidden border border-slate-100 dark:border-slate-800" style={{ borderColor: BORDER }}>
              <div className="px-3 py-2.5 border-b bg-[#FBF3F5] dark:bg-[#221015]" style={{ borderColor: BORDER }}>
                <p className="text-sm font-semibold text-[#7B1535] dark:text-[#E27D9B]">{selectedUser}</p>
                <p className="text-xs text-[#7A6068] dark:text-slate-400 mt-0.5">admin@southpoint.edu.in</p>
              </div>
              <button 
                onClick={() => {
                  setAvatarMenuOpen(false);
                  if (onNavigate) onNavigate("settings");
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] dark:text-slate-200 hover:bg-[#FBF3F5] dark:hover:bg-[#221015] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Settings size={13} className="text-[#7B1535] dark:text-[#E27D9B]" />
                Settings
              </button>
              <button
                onClick={() => {
                  setAvatarMenuOpen(false);
                  setScreen("login");
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] dark:text-slate-200 hover:bg-[#FBF3F5] dark:hover:bg-[#221015] flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut size={13} className="text-[#7B1535] dark:text-[#E27D9B]" />
                Sign out
              </button>
            </div>
          </>}
        </div>
      </div>
    </nav>
  );
}
