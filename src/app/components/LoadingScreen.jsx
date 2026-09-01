import React, { useEffect, useState } from "react";
import schoolLogo from "../../../sps_logo.png";
import { MAROON, GOLD } from "./theme";

export function LoadingScreen({ mode = "login", message }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar animation over 1.2 seconds
    const startTime = Date.now();
    const duration = 1100;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const defaultMessage =
    mode === "login"
      ? "Authenticating & Loading Secure Vault..."
      : "Securing Vault & Terminating Session...";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#10080B] text-white select-none overflow-hidden animate-fade-in">
      {/* Background Ambient Glow */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse"
        style={{
          background: `radial-gradient(circle, ${MAROON} 0%, ${GOLD} 70%, transparent 100%)`
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center space-y-6">
        
        {/* Logo Container with Spinner Ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Gold Spinner Ring */}
          <div 
            className="w-44 h-44 rounded-full border-3 border-transparent border-t-[#C9A227] border-r-[#7B1535] animate-spin"
            style={{ animationDuration: "1.4s" }}
          />

          {/* Logo Card */}
          <div 
            className="absolute w-32 h-32 rounded-3xl bg-[#1C0D12] border-2 border-[#7B1535]/60 flex items-center justify-center p-4 shadow-2xl animate-scale-up"
            style={{ boxShadow: `0 0 45px ${MAROON}60` }}
          >
            <img 
              src={schoolLogo} 
              alt="South Point School Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* School Name & Branding */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            South Point School
          </h2>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
            Guwahati — Vault Terminal
          </p>
        </div>

        {/* Status Message */}
        <div className="space-y-3 w-full">
          <p className="text-xs font-semibold text-slate-300 animate-pulse">
            {message || defaultMessage}
          </p>

          {/* Progress Bar Container */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5 shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-75"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${MAROON} 0%, ${GOLD} 100%)`,
                boxShadow: `0 0 10px ${GOLD}80`
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>{mode === "login" ? "INITIALIZING SESSION" : "CLEANING MEMORY"}</span>
            <span className="font-bold text-[#C9A227]">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
