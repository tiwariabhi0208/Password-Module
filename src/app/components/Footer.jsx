import React from "react";
import schoolLogo from "../../../images(1).png";
import { MAROON, GOLD } from "./theme";

export function Footer() {
  return (
    <footer
      className="w-full py-8 px-8 border-t text-white shadow-inner"
      style={{
        backgroundColor: MAROON,
        borderTop: `2.5px solid ${GOLD}`,
        fontFamily: "inherit"
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Top Section: Logo, School Details and Links */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Logo & School Address */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex items-center gap-3">
              <img
                src={schoolLogo}
                alt="South Point School Logo"
                style={{ height: 36, width: "auto", objectFit: "contain" }}
              />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  South Point School
                </h3>
                <span className="text-[9px] font-semibold tracking-wider block" style={{ color: GOLD }}>
                  Guwahati
                </span>
              </div>
            </div>
            
            <p className="text-[11px] text-white/70 max-w-sm leading-relaxed">
              21, Barsapara Road, Near Battalion Gate,<br />
              Binova Nagar, Guwahati, Assam - 781018
            </p>
          </div>

          {/* Quick Compliance Links */}
          <div className="flex flex-col items-center md:items-end gap-3 text-xs">
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-semibold">
              <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
                Terms of Use
              </a>
              <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
                Security Policy
              </a>
              <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
                Help Desk
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[9px] text-white/50 max-w-[280px] leading-normal">
                Official administration vault portal. Unauthorized access or sharing of credentials is strictly prohibited.
              </p>
              <p className="text-[9px] text-white/40 mt-1">
                © {new Date().getFullYear()} South Point School. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
