import React from "react";
import { T, font, MAROON, BORDER } from "./theme";

export function FormLabel({ text }) {
  return (
    <label style={{
      fontSize: 11,
      fontWeight: "800",
      color: "#374151",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 5,
      display: "block",
    }}>
      {text}
    </label>
  );
}

export function CustomInput({
  icon,
  type = "text",
  name,
  id,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
  showPasswordToggle,
  onToggleShowPassword,
  onFocus,
  onBlur
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      border: `1.5px solid #d1d5db`,
      borderRadius: 12,
      background: "#fff",
      overflow: "hidden",
      transition: "border-color 0.2s",
      width: "100%",
    }}
      className="input-focus-container"
    >
      <div style={{
        width: 38,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1.5px solid #e5e7eb",
        color: T.primary,
        background: "rgba(114, 16, 42, 0.02)",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <input
        type={type}
        name={name}
        id={id}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "8px 12px",
          fontSize: 14,
          fontFamily: font.body,
          color: T.ink,
          background: "transparent",
          width: "100%",
        }}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onToggleShowPassword}
          style={{
            background: "none",
            border: "none",
            padding: "0 12px",
            cursor: "pointer",
            color: "#6B6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10
          }}
        >
          {type === "password" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export function IconInput({
  icon,
  right,
  ...props
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center" style={{ color: MAROON }}>
        {icon}
      </span>
      <input
        {...props}
        className="w-full h-12 pl-11 pr-10 text-sm border bg-white text-[#1A0810] placeholder:text-[#94A3B8] focus:outline-none transition-colors rounded-xl"
        style={{
          borderColor: BORDER
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = MAROON;
          e.currentTarget.style.boxShadow = `0 0 0 2px rgba(123,21,53,0.12)`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = BORDER;
          e.currentTarget.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
      />
      {right && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">{right}</span>}
    </div>
  );
}
