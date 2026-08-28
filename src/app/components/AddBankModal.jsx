import React, { useState, useEffect } from "react";
import { X, Plus, Shield, Edit2, ChevronDown } from "lucide-react";
import { MAROON, MAROON_HOVER, BORDER } from "./theme";

export function AddBankModal({ isOpen, onClose, onAdd, onEdit, bankToEdit, entities = [] }) {
  const [name, setName] = useState("");
  const [holder, setHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branchName, setBranchName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [accountType, setAccountType] = useState("corporate");
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const handlePhotoChange = (e) => {
    setPhotoError("");
    const file = e.target.files[0];
    if (!file) return;

    // File validation: Size limit to 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError("File size exceeds 5 MB. Please choose a smaller image.");
      e.target.value = null;
      return;
    }

    // File validation: Allow only jpeg, jpg, png
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Unsupported format. Only JPEG, JPG, and PNG are allowed.");
      e.target.value = null;
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      if (bankToEdit) {
        setName(bankToEdit.name || "");
        setHolder(bankToEdit.holder || "");
        setAccountNumber(bankToEdit.accountNumber || "");
        setIfsc(bankToEdit.ifsc || "");
        setBranchName(bankToEdit.branchName || "");
        setUsername(bankToEdit.username || "");
        setPassword(bankToEdit.password || "");
        setTransactionPassword(bankToEdit.transactionPassword || "");
        setAccountType(bankToEdit.accountType || "corporate");
        setPhoto(bankToEdit.photo || null);
        setPhotoError("");
      } else {
        setName("");
        setHolder("");
        setAccountNumber("");
        setIfsc("");
        setBranchName("");
        setUsername("");
        setPassword("");
        setTransactionPassword("");
        setAccountType("corporate");
        setPhoto(null);
        setPhotoError("");
      }
    }
  }, [isOpen, bankToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !holder || !accountNumber || !ifsc || !branchName || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const initial = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    if (bankToEdit) {
      onEdit({
        ...bankToEdit,
        name,
        initial,
        accountNumber,
        ifsc,
        holder,
        branchName,
        username,
        password,
        transactionPassword,
        accountType,
        photo
      });
    } else {
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
        transactionPassword,
        accountType,
        color,
        photo
      });
    }

    setName("");
    setAccountNumber("");
    setIfsc("");
    setBranchName("");
    setUsername("");
    setPassword("");
    setTransactionPassword("");
    setAccountType("corporate");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-[720px] max-w-full bg-white dark:bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border animate-fade-in-up"
        style={{ borderColor: BORDER }}
      >
        {/* Maroon modal header with brand gradient */}
        <div
          className="flex items-center justify-between px-6 py-5 text-white"
          style={{ background: `linear-gradient(135deg, ${MAROON} 0%, #4a0d20 100%)` }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Shield size={18} className="text-[#F5E9BE]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-wide">
                {bankToEdit ? "Modify Vault Credentials" : "Add New Vault Account"}
              </span>
              <span className="text-[9.5px] uppercase tracking-widest text-[#F5E9BE] font-bold mt-0.5">
                {bankToEdit ? "Update secure access keys" : "Link secondary banking channel"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer border-none"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 bg-slate-50/20 dark:bg-[#101010]/20">
          <div className="space-y-4 bg-white dark:bg-[#121212] p-5 rounded-2xl border shadow-sm text-left animate-fade-in" style={{ borderColor: BORDER }}>

            {/* Row 1: Select Registered Entity & Account Holder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Select Registered Entity
                </label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      if (selectedName) {
                        setHolder(selectedName);
                      }
                    }}
                    defaultValue=""
                    className="w-full h-11 px-3.5 pr-10 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select registered entity to pre-fill --</option>
                    {entities.map((ent) => (
                      <option key={ent.id} value={ent.name}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Point School, Guwahati"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Row 2: Bank Name & Branch Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Row 3: Account Number & IFSC Code */}
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

            {/* Row 4: Net Banking Username & Password */}
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

            {/* Row 5: Account Login Type & Transaction Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Account Login Type
                </label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold appearance-none cursor-pointer"
                  >
                    <option value="corporate">Corporate Banking Login</option>
                    <option value="retail">Retail / Personal Banking Login</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400 mb-1.5">
                  Transaction Password <span className="text-slate-400 dark:text-slate-500 font-medium font-sans text-[10px] lowercase italic">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Transaction Password (if any)"
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm border bg-[#FDFAFB] dark:bg-[#181818] border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:border-[#7B1535] dark:focus:border-[#E27D9B] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Row 6: Upload Account Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6068] dark:text-slate-400">
                Account Photo / Logo <span className="text-slate-400 dark:text-slate-500 font-medium font-sans text-[10px] lowercase italic">(Optional)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4.5 bg-[#FDFAFB] dark:bg-[#181818] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                {photo ? (
                  <div className="relative shrink-0 w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#101010] flex items-center justify-center">
                    <img src={photo} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-[10px] font-black border-none cursor-pointer shadow active:scale-90"
                      title="Remove Photo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0 w-16 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-850 bg-slate-50/50 dark:bg-[#101010]/30 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <Plus size={20} />
                  </div>
                )}
                
                <div className="flex-grow text-left w-full sm:w-auto">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                    onChange={handlePhotoChange}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-xl file:border-0
                      file:text-xs file:font-black
                      file:bg-[#7B1535]/10 file:text-[#7B1535]
                      dark:file:bg-[#E27D9B]/10 dark:file:text-[#E27D9B]
                      hover:file:bg-[#7B1535]/15 dark:hover:file:bg-[#E27D9B]/15
                      file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                    Allowed formats: JPEG, JPG, PNG (Max size: 5 MB)
                  </p>
                  {photoError && (
                    <p className="text-[10.5px] font-semibold text-red-600 dark:text-red-400 mt-1">
                      ⚠️ {photoError}
                    </p>
                  )}
                </div>
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
              {bankToEdit ? "Save Changes" : "Add Vault Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
