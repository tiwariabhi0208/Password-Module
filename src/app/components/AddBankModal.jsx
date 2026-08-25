import React, { useState } from "react";
import { X, Plus, Shield } from "lucide-react";
import { MAROON, MAROON_HOVER, BORDER } from "./theme";

export function AddBankModal({ isOpen, onClose, onAdd, entities = [] }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className="w-[500px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up" 
        style={{ borderColor: BORDER }}
      >
        {/* Maroon modal header with brand gradient */}
        <div
          className="flex items-center justify-between px-6 py-5 text-white"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4a0d20 100%)` }}
        >
          <div className="flex flex-col text-left">
            <span className="text-[17px] font-black tracking-wide flex items-center gap-1.5">
              <Plus size={18} className="text-[#C9A227]" /> Add Vault Account
            </span>
            <span className="text-[8.5px] uppercase tracking-widest text-white/50 font-black mt-1 flex items-center gap-1">
              <Shield size={10} className="text-white/40" /> New Bank Authorization
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8.5 h-8.5 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 bg-slate-50/20 dark:bg-[#101010]/20">
          <div className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border shadow-sm text-left animate-fade-in" style={{ borderColor: BORDER }}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                Select Registered Entity
              </label>
              <select
                onChange={(e) => {
                  const selectedName = e.target.value;
                  if (selectedName) {
                    setHolder(selectedName);
                  }
                }}
                defaultValue=""
                className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
              >
                <option value="" disabled>-- Select registered entity to pre-fill --</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.name}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                placeholder="Account Holder's Name"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="A/C Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="IFSC Code"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-mono font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Guwahati Main"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Corporate Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Portal Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 text-xs font-black rounded-xl text-white transition-all shadow-sm hover:shadow-md cursor-pointer border-none bg-[#7B1535] hover:bg-[#600f27] dark:bg-[#E27D9B] dark:hover:bg-[#d85f83] dark:text-[#101010] active:scale-[0.98]"
            >
              Add Vault Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
