import React from "react";
import { MAROON, GOLD } from "./theme";

export function SchoolCrest({ size = 60 }) {
  const h = size * 1.12;
  return (
    <svg width={size} height={h} viewBox="0 0 60 67" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 3L4 14V35C4 49 16 60 30 64C44 60 56 49 56 35V14L30 3Z"
        fill={MAROON}
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M30 9L9 18V35C9 47 19 56 30 60C41 56 51 47 51 35V18L30 9Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M 30 19 L 33.5 27 L 42 27 L 35 32 L 37.5 40 L 30 35 L 22.5 40 L 25 32 L 18 27 L 26.5 27 Z"
        fill={GOLD}
      />
      <path
        d="M30 22C30 22 26.5 25.5 26.5 29C26.5 31.8 28 33.5 30 34.2C32 33.5 33.5 31.8 33.5 29C33.5 25.5 30 22 30 22Z"
        fill={MAROON}
      />
      <rect x="28" y="36" width="4" height="12" rx="2" fill={GOLD} />
      <rect x="24.5" y="47" width="11" height="3" rx="1.5" fill={GOLD} />
    </svg>
  );
}
