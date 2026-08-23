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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(80,10,25,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[450px] bg-white rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: BORDER }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ backgroundColor: MAROON }}
        >
          <span className="text-white text-[15px] font-semibold">Add New Bank Account</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10 text-white"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Bank"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]"
              style={{ borderColor: BORDER }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Account Holder
            </label>
            <input
              type="text"
              required
              placeholder="Account Holder's Name"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]"
              style={{ borderColor: BORDER }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                placeholder="A/C Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535] font-mono"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                required
                placeholder="IFSC Code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535] font-mono"
                style={{ borderColor: BORDER }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Guwahati Main"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]"
              style={{ borderColor: BORDER }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Corporate Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <input
                type="text"
                required
                placeholder="Portal Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm border bg-white rounded-lg focus:outline-none focus:border-[#7B1535]"
                style={{ borderColor: BORDER }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t" style={{ borderColor: BORDER }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              style={{ borderColor: BORDER, color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 text-sm font-semibold rounded-lg text-white transition-colors"
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
