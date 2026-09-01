import React from "react";
import schoolLogo from "../../../sps_logo.png";
import { MAROON, GOLD } from "./theme";

export function Footer({ onOpenHelpDesk }) {
  return (
    <footer
      className="w-full py-5 pl-6 pr-8 border-t text-white shadow-inner flex items-center"
      style={{
        backgroundColor: MAROON,
        borderTop: `2.5px solid ${GOLD}`,
        fontFamily: "inherit"
      }}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Column: Aligned Brand Logo and Address */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <img
              src={schoolLogo}
              alt="South Point School Logo"
              style={{ height: 26, width: "auto", objectFit: "contain" }}
            />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                South Point School
              </h3>
              <span className="text-[9.5px] font-bold tracking-wider block leading-none" style={{ color: GOLD }}>
                Guwahati
              </span>
            </div>
          </div>
          <p className="text-[11.5px] text-white/70 leading-normal font-semibold pl-0 md:pl-8">
            21, Barsapara Road, Binova Nagar, Guwahati - 781018
          </p>
        </div>

        {/* Middle Column: Centered Compliance Links */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm font-bold">
          <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
            Terms of Use
          </a>
          <a href="#" className="transition-colors hover:underline text-white/80 hover:text-white">
            Security Policy
          </a>
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              if (onOpenHelpDesk) onOpenHelpDesk();
            }} 
            className="transition-colors hover:underline text-white/80 hover:text-white cursor-pointer"
          >
            Help Desk
          </button>
        </div>

        {/* Right Column: Aligned Warning & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-0.5">
          <p className="text-[10.5px] text-white/50 leading-normal max-w-[320px] font-semibold">
            Official admin portal. Unauthorized access or credential sharing is strictly prohibited.
          </p>
          <p className="text-[10.5px] text-white/40 mt-1 font-semibold">
            © {new Date().getFullYear()} South Point School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
