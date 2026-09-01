import React from "react";
import { X, MapPin, Mail, Phone, Clock, Headphones, AlertCircle } from "lucide-react";
import { MAROON, MAROON_HOVER, GOLD, BORDER } from "./theme";

export function HelpDeskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#141414] rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-scale-up text-left cursor-default"
        style={{ borderColor: BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b bg-[#FDF6F7] dark:bg-[#1c0c11]"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F7EBEF] dark:bg-[#2a131a]"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <Headphones size={20} className="text-[#7B1535] dark:text-[#E27D9B]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                Help Desk Support
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                South Point School Vault & Admin Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Contact Info Items */}
        <div className="p-6 space-y-4">
          
          {/* Address Item */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#FDFAFB] dark:bg-[#181818] transition-all hover:border-[#7B1535]/40">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF6F7] dark:bg-[#251217] shrink-0 mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <MapPin size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6068] dark:text-slate-400">
                Address
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">
                21 Barsapara Road, Guwahati, Assam
              </span>
            </div>
          </div>

          {/* Email Item */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#FDFAFB] dark:bg-[#181818] transition-all hover:border-[#7B1535]/40">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF6F7] dark:bg-[#251217] shrink-0 mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <Mail size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6068] dark:text-slate-400">
                Email
              </span>
              <a 
                href="mailto:helpdesk@spsghy.co.in"
                className="text-xs sm:text-sm font-bold text-[#7B1535] dark:text-[#E27D9B] hover:underline mt-0.5"
              >
                helpdesk@spsghy.co.in
              </a>
            </div>
          </div>

          {/* Phone Item */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#FDFAFB] dark:bg-[#181818] transition-all hover:border-[#7B1535]/40">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF6F7] dark:bg-[#251217] shrink-0 mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <Phone size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6068] dark:text-slate-400">
                Phone
              </span>
              <a 
                href="tel:+919706012121"
                className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-[#7B1535] dark:hover:text-[#E27D9B] transition-colors mt-0.5"
              >
                +91 97060 12121
              </a>
            </div>
          </div>

          {/* Office Opening Hours Item */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-[#FDFAFB] dark:bg-[#181818] transition-all hover:border-[#7B1535]/40">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF6F7] dark:bg-[#251217] shrink-0 mt-0.5" style={{ border: `1px solid ${BORDER}` }}>
              <Clock size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A6068] dark:text-slate-400">
                Office Opening Hours
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                09:00 AM - 03:00 PM
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/50">
                <AlertCircle size={13} className="shrink-0" />
                <span>1st and 3rd Saturdays and Sunday are closed</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
