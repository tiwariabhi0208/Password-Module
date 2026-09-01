import React, { useState } from "react";
import { 
  HelpCircle, 
  ShieldCheck, 
  EyeOff, 
  Key, 
  Users, 
  Fingerprint, 
  FileSignature, 
  Activity, 
  ChevronRight, 
  Info,
  Lock,
  Layers,
  Headphones
} from "lucide-react";
import { MAROON, MAROON_HOVER, GOLD, BORDER } from "./theme";

export function HelpInfo({ onOpenHelpDesk }) {
  const [activeSection, setActiveSection] = useState("all");

  const accessLevels = [
    {
      level: 1,
      name: "Level 1: Read Only",
      desc: "Ideal for basic operations staff who only need to copy/view bank details for making payments.",
      capabilities: [
        "View grouped bank cards on the dashboard grid",
        "Search and sort bank credentials",
        "Copy bank details (account numbers, IFSC, branches, login passwords) to clipboard",
        "View registered school entities list (read-only)",
        "Configure personal theme settings (Light/Dark mode)",
        "Restricted from: editing/deleting/adding credentials, managing entities, managing admins, viewing activity logs, or resetting the database"
      ],
      color: "bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 text-[#1E3A5F] dark:text-[#6FA4E3]"
    },
    {
      level: 2,
      name: "Level 2: Limited Access",
      desc: "Authorized for managers who supervise financial records and maintain bank account details.",
      capabilities: [
        "All Level 1 permissions (View credentials and entities)",
        "Modify existing bank accounts details (names, IFSC, account numbers, holders, login credentials)",
        "View complete system activity logs to review audit history and tracking changes",
        "Restricted from: creating or deleting bank accounts, bulk entity registration, managing admin accounts, or resetting the database"
      ],
      color: "bg-[#7B1535]/10 dark:bg-[#7B1535]/20 text-[#7B1535] dark:text-[#E27D9B]"
    },
    {
      level: 3,
      name: "Level 3: Super Admin",
      desc: "Full privilege level for system administrators managing the company structure and security rules.",
      capabilities: [
        "All Level 2 permissions (Modify credentials, view activity logs)",
        "Register and manage organizational school entities (single or dynamic bulk additions)",
        "Delete entities from the system database",
        "Add new bank cards and delete deprecated bank accounts",
        "Register and manage other system administrators",
        "Perform destructive database resets (wipe credentials, logs, and entities)"
      ],
      color: "bg-[#C9A227]/10 dark:bg-[#C9A227]/20 text-[#C9A227] dark:text-[#F3D778]"
    }
  ];

  const glossaryItems = [
    {
      title: "Lock Screen & Inactivity Lock",
      icon: EyeOff,
      content: "A security mechanism that protects credentials from shoulder surfing or physical breaches. If the vault is left idle for the configured timeout (e.g. 15 minutes), the terminal immediately locks behind an overlay screen. When locked, password entries are protected by disc-security masking, and the login session cannot be hijacked without entering the master passcode."
    },
    {
      title: "AES-256 Encrypted Cryptographic Public Signature",
      icon: Fingerprint,
      content: "All stored bank details (including transaction passwords and logins) are encrypted locally using the Advanced Encryption Standard (AES) with a 256-bit key length. To ensure absolute data integrity, each record carries a cryptographic signature (HMAC-SHA256). Any tampering or modification of values outside the app will break the signature verification, causing the app to flag the record as corrupted/unauthenticated."
    },
    {
      title: "Entities vs. Admins",
      icon: Users,
      content: "An Entity represents a business structure, school branch, or organizational unit (e.g., South Point School, Delhi Public School) that owns the accounts. Admins are the actual human operators (e.g., Priya Sharma) who log into the terminal. Multiple Admins manage credentials belonging to different Entities under audit control."
    },
    {
      title: "Registering & Managing Entities",
      icon: FileSignature,
      content: "Super Admins (Level 3) can register and manage organizational entities. When registering an entity, specify the Full Name/Entity Name, a 10-digit Phone Number, and the official Email ID. Once registered, these entities appear in vault creation forms, allowing you to pre-fill Account Holder details instantly."
    }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100 dark:border-slate-800/80" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FDF6F7] dark:bg-[#221015]" style={{ border: `1px solid ${BORDER}` }}>
            <HelpCircle size={24} className="text-[#7B1535] dark:text-[#E27D9B]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
              Help & Information Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
              Secure Terminal explanations, feature documentation, and security glossary.
            </p>
          </div>
        </div>

        {/* Contact Help Desk Button */}
        <button
          type="button"
          onClick={onOpenHelpDesk}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          style={{ backgroundColor: MAROON }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MAROON_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = MAROON)}
        >
          <Headphones size={16} />
          <span>Help Desk Support</span>
        </button>
      </div>

      {/* Grid: Main Concepts & Access levels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Glossary Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-[#7B1535] dark:text-[#E27D9B]" />
            <h2 className="text-sm font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest">
              Core Security Features
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {glossaryItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:translate-y-[-2px]"
                  style={{ borderLeftWidth: '4px', borderLeftColor: idx === 1 ? GOLD : MAROON }}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 group-hover:bg-[#FDF6F7] dark:group-hover:bg-[#221015] transition-colors">
                      <Icon size={16} className="text-[#7B1535] dark:text-[#E27D9B]" />
                    </div>
                    <h3 className="text-[13.5px] font-black text-slate-800 dark:text-slate-200 tracking-wide">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {item.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Tips / System Status */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-[#7B1535] dark:text-[#E27D9B]" />
            <h2 className="text-sm font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest">
              System Audit Info
            </h2>
          </div>

          <div className="bg-[#FDF6F7] dark:bg-[#221015]/60 border border-slate-100 dark:border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#7B1535] dark:text-[#E27D9B]" />
              <span className="text-[11px] font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-wide">
                Encryption Details
              </span>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Cipher algorithm: **AES-256-GCM** (authenticated mode).</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Key derivation: **PBKDF2** with **600,000 iterations** using user master passcodes.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Signature verification keys are locally validated inside isolation runtime.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Zero pre-shared plain-text credentials leave local app memory.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Audit logging: All credentials access, updates, and user registration events are logged in the Activity Log.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Session sandboxing: The vault data resides strictly in memory and is wiped clean upon logging out.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Anti brute-force: Master passcode input incorporates progressive delay lockout limits after failed attempts.</span>
              </div>
              <div className="flex gap-2">
                <ChevronRight size={14} className="text-[#7B1535] dark:text-[#E27D9B] shrink-0 mt-0.5" />
                <span>Zero third-party trackers: Absolutely no external analytic tools, telemetry services, or cookies are enabled.</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-black/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
              💡 **Did you know?** Setting the Timeout to \"Never\" disables auto-locking, but we recommend keeping it at 15 minutes for maximum corporate device safety.
            </div>
          </div>
        </div>

      </div>

      {/* Access levels Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#7B1535] dark:text-[#E27D9B]" />
          <h2 className="text-sm font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest">
            Access Levels & Security Hierarchy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {accessLevels.map((lvl) => (
            <div 
              key={lvl.level}
              className="bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:translate-y-[-2px]"
            >
              <div>
                {/* Badge header */}
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block mb-3.5 ${lvl.color}`}>
                  {lvl.name}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold mb-4">
                  {lvl.desc}
                </p>

                {/* Capabilities list */}
                <div className="space-y-2 border-t pt-3.5 border-slate-100 dark:border-slate-900">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Permitted Actions
                  </span>
                  {lvl.capabilities.map((cap, cidx) => (
                    <div key={cidx} className="flex gap-2 text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] shrink-0 mt-1.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
