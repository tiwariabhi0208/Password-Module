import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded hover:bg-black/5 transition-colors flex items-center justify-center flex-shrink-0"
      style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8" }}
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check size={12} style={{ color: "#16A34A" }} />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}
