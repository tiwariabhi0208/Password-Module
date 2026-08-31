import React from "react";
import schoolLogo from "../../../sps_logo.png";
import campusBg from "../../../school_campus.jpg";
import { T, font } from "./theme";

export function AuthCard({ children, sideElement }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundImage: `linear-gradient(135deg, rgba(92, 12, 33, 0.55) 0%, rgba(30, 3, 10, 0.75) 100%), url(${campusBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: font.body,
        boxSizing: "border-box",
      }}
    >
      {/* Spacer to center card vertically */}
      <div className="flex-grow" />

      {/* Card Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[420px] px-4">
        {sideElement && (
          <div className="pointer-events-none md:absolute md:-right-[140px] md:bottom-[20px] md:z-20 mb-4 md:mb-0 transform md:-rotate-[3deg] origin-bottom transition-all duration-300">
            {sideElement}
          </div>
        )}

        {/* Card */}
        <div
          className="animate-fade-in-up w-full"
          style={{
            position: "relative",
            background: T.surface,
            borderRadius: 24,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
            overflow: "hidden",
            border: `1.5px solid ${T.accent}44`,
            zIndex: 10,
          }}
        >
          {/* Brand Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark} 100%)`,
              padding: "20px 24px 16px",
              textAlign: "center",
              borderBottom: `2.5px solid ${T.accent}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <img
              src={schoolLogo}
              alt="South Point School Logo"
              style={{ height: 48, width: "auto", objectFit: "contain" }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: "bold",
                  fontFamily: "Georgia, serif",
                  color: T.accent,
                  letterSpacing: "0.01em",
                }}
              >
                South Point School
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Password Module
                </p>
                <div style={{ width: 16, height: 1, background: "rgba(255, 255, 255, 0.3)" }} />
              </div>
              <div style={{ fontSize: 8, color: T.accent, marginTop: 3, lineHeight: 1 }}>◆</div>
            </div>
          </div>

          {/* White form body */}
          <div style={{ padding: "20px 24px 18px" }}>{children}</div>
        </div>
      </div>

      {/* Spacer to center card vertically */}
      <div className="flex-grow" />
    </div>
  );
}
