import React, { useState } from "react";
import { X } from "lucide-react";
import { MAROON, MAROON_HOVER, BORDER } from "./theme";

export function AddBankModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [holder, setHolder] = useState("South Point School, Guwahati");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branchName, setBranchName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !holder || !accountNumber || !ifsc || !branchName || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const initial = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["#1E3A5F", "#7A4C1A", "#1B3F5C", "#5C2E6B", "#7A1A1A", "#1A3F6B", "#2C1A5F", "#5F3A0A"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    onAdd({
      id: Date.now(),
      name,
      initial,
      accountNumber,
      ifsc,
      holder,
      branchName,
      username,
      password,
      color
    });

    setName("");
    setAccountNumber("");
    setIfsc("");
    setBranchName("");
    setUsername("");
    setPassword("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(12,2,5,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-[480px] max-w-full bg-white rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up" 
        style={{ borderColor: BORDER }}
      >
        {/* Maroon modal header with gradient */}
        <div
          className="flex items-center justify-between px-6 py-4.5 text-white"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4c0519 100%)` }}
        >
          <div className="flex flex-col">
            <span className="text-[16px] font-extrabold tracking-wide">Add Vault Account</span>
            <span className="text-[8px] uppercase tracking-widest text-white/50 font-bold mt-1">New Bank Credentials</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 bg-slate-50/20">
          <div className="space-y-4 bg-white p-5 rounded-2xl border shadow-sm text-left" style={{ borderColor: BORDER }}>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all input-focus-container"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                Account Holder
              </label>
              <input
                type="text"
                required
                placeholder="Account Holder's Name"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all input-focus-container"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="A/C Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all font-mono input-focus-container"
                  style={{ borderColor: BORDER }}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="IFSC Code"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all font-mono input-focus-container"
                  style={{ borderColor: BORDER }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Guwahati Main"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all input-focus-container"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Corporate Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all input-focus-container"
                  style={{ borderColor: BORDER }}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#7A6068] mb-1.5">
                  Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Portal Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm border bg-[#FDFAFB] rounded-xl focus:outline-none focus:border-[#7B1535] transition-all input-focus-container"
                  style={{ borderColor: BORDER }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border-2 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ borderColor: BORDER, color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 text-xs font-bold rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none"
              style={{ backgroundColor: MAROON }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = MAROON_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = MAROON}
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
