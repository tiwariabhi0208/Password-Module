import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Headphones, 
  AlertCircle, 
  KeyRound, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { MAROON, MAROON_HOVER, GOLD, BORDER } from "./theme";

export function HelpDeskModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("contact");

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#141414] rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-scale-up text-left cursor-default flex flex-col max-h-[90vh]"
        style={{ borderColor: BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b bg-[#FDF6F7] dark:bg-[#1c0c11] shrink-0"
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
                Help & Support Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                South Point School Vault & Emergency Recovery
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 px-6 pt-3 bg-slate-50/50 dark:bg-[#181818] shrink-0">
          <button
            onClick={() => setActiveTab("contact")}
            className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "contact"
                ? "border-[#7B1535] text-[#7B1535] dark:border-[#E27D9B] dark:text-[#E27D9B]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Phone size={14} />
            <span>Contact Support</span>
          </button>
          <button
            onClick={() => setActiveTab("rescue")}
            className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "rescue"
                ? "border-[#7B1535] text-[#7B1535] dark:border-[#E27D9B] dark:text-[#E27D9B]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <KeyRound size={14} />
            <span>Emergency Rescue Kit</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {activeTab === "contact" && (
            <div className="space-y-4 animate-fade-in">
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
          )}

          {activeTab === "rescue" && (
            <div className="space-y-4 animate-fade-in text-left">
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-[#FDF6F7] dark:bg-[#221015] border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-[#7B1535] dark:text-[#E27D9B] font-extrabold text-xs">
                  <ShieldCheck size={16} />
                  <span>What is the Emergency Rescue Kit?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  The Emergency Rescue Kit is a secret <strong>256-bit cryptographic recovery key</strong> generated for your account. Because this vault uses zero-knowledge encryption, your Master Password is never saved on the server. Your Rescue Kit is the <em>only key</em> that can unlock your bank credentials if you forget your password.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  How to Use Your Rescue Kit
                </h4>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181818]">
                  <div className="w-6 h-6 rounded-full bg-[#7B1535] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate & Download in Settings</h5>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Go to <strong>Settings → Security & Emergency Rescue Kit</strong> and click <strong>Generate Rescue Kit</strong>. Download the `.txt` file or copy the key.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181818]">
                  <div className="w-6 h-6 rounded-full bg-[#7B1535] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Recovering during Password Reset</h5>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Click <strong>Forgot Password?</strong> on the login screen, enter your email OTP, and paste your Rescue Key when prompted.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-[#181818]">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Automatic Re-wrapping</h5>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      The system uses your Rescue Key to decrypt your vault data and re-wraps it securely under your new Master Password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning box */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold leading-relaxed">
                <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  <strong>Keep your Rescue Kit offline and secure.</strong> Never email it to unknown parties or store it unencrypted on shared computers.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
