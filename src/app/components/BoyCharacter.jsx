import React from "react";
import { GOLD } from "./theme";

const WHISTLE_STYLES = `
@keyframes whistleFloat1 {
  0% {
    transform: translate(0, 0) scale(0.6) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translate(25px, -45px) scale(1) rotate(-15deg);
    opacity: 0;
  }
}
@keyframes whistleFloat2 {
  0% {
    transform: translate(0, 0) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translate(35px, -35px) scale(0.9) rotate(20deg);
    opacity: 0;
  }
}
@keyframes bobSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-whistle-1 {
  animation: whistleFloat1 2s infinite linear;
}
.animate-whistle-2 {
  animation: whistleFloat2 2.4s infinite linear;
  animation-delay: 0.8s;
}
.animate-bob-slow {
  animation: bobSlow 4s infinite ease-in-out;
}
`;

export function BoyCharacter({ state }) {
  const skinColor = "#FFD2B2";
  const hairColor = "#3D2314";
  const suitColor = "#1F2937";
  const lapelColor = "#111827";
  const shirtColor = "#FFFFFF";
  const tieColor = "#DC2626";

  const drawGoggles = (gx, gy) => (
    <g transform={`translate(${gx}, ${gy})`} className="transition-all duration-300 ease-in-out">
      {/* Strap */}
      <path d="M -36 0 L 36 0" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      {/* Lenses outer frames */}
      <circle cx="-14" cy="0" r="10.5" fill="#D1D5DB" stroke="#111827" strokeWidth="2" />
      <circle cx="14" cy="0" r="10.5" fill="#D1D5DB" stroke="#111827" strokeWidth="2" />
      {/* Lenses glass */}
      <circle cx="-14" cy="0" r="8.5" fill="rgba(31, 41, 55, 0.85)" />
      <circle cx="14" cy="0" r="8.5" fill="rgba(31, 41, 55, 0.85)" />
      {/* Glass glare */}
      <path d="M -18 -3 L -12 3" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M 10 -3 L 16 3" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      {/* Bridge */}
      <path d="M -4 0 L 4 0" stroke="#111827" strokeWidth="2.5" />
    </g>
  );

  let gx = 120;
  let gy = 76; 

  if (state === "email") {
    gx = 120;
    gy = 48; 
  }

  let pupilLX = 106;
  let pupilLY = 76;
  let pupilRX = 134;
  let pupilRY = 76;

  if (state === "email") {
    pupilLX = 102;
    pupilLY = 76;
    pupilRX = 130;
    pupilRY = 76;
  } else if (state === "password") {
    pupilLX = 110;
    pupilLY = 76;
    pupilRX = 138;
    pupilRY = 76;
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-[240px] h-[380px] animate-bob-slow">
      <style dangerouslySetInnerHTML={{ __html: WHISTLE_STYLES }} />
      {state === "password" && (
        <div className="absolute top-[30px] right-[25px] pointer-events-none w-[60px] h-[60px] z-20">
          <svg className="w-full h-full" viewBox="0 0 60 60" fill={GOLD}>
            <path
              className="animate-whistle-1"
              d="M10,25 A3,3 0 1,1 7,22 L7,10 L15,12 L15,18 L10,17 Z"
            />
            <path
              className="animate-whistle-2"
              d="M15,35 A2.5,2.5 0 1,1 12.5,32.5 L12.5,22 L19,23.5 L19,28 L15,27 Z"
            />
          </svg>
        </div>
      )}

      <svg width="240" height="380" viewBox="0 0 240 380" fill="none" className="drop-shadow-2xl">
        <path d="M88,60 Q120,-5 152,60 Z" fill={hairColor} />
        <circle cx="83" cy="80" r="9" fill={skinColor} />
        <circle cx="157" cy="80" r="9" fill={skinColor} />
        <circle cx="83" cy="80" r="5" fill="#ECA689" />
        <circle cx="157" cy="80" r="5" fill="#ECA689" />
        <rect x="108" y="105" width="24" height="25" fill={skinColor} />
        <path d="M88,80 C88,115 152,115 152,80 C152,55 88,55 88,80 Z" fill={skinColor} />
        <path d="M84,68 C100,45 140,45 156,68 C160,50 145,20 120,25 C95,20 80,50 84,68 Z" fill={hairColor} />
        <path d="M85,68 Q102,52 112,62 Q122,52 132,62 Q142,52 155,68 L152,56 Q120,22 88,56 Z" fill={hairColor} />
        <circle cx="106" cy="76" r="8" fill="white" stroke="#3D2314" strokeWidth="1.5" />
        <circle cx="134" cy="76" r="8" fill="white" stroke="#3D2314" strokeWidth="1.5" />
        <circle cx={pupilLX} cy={pupilLY} r="4" fill="#3D2314" />
        <circle cx={pupilRX} cy={pupilRY} r="4" fill="#3D2314" />
        <circle cx={pupilLX + (state === "email" ? -1 : 1)} cy={pupilLY - 1} r="1" fill="white" />
        <circle cx={pupilRX + (state === "email" ? -1 : 1)} cy={pupilRY - 1} r="1" fill="white" />
        {state === "password" ? (
          <>
            <path d="M 96 66 Q 104 60 112 65" stroke="#3D2314" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 128 65 Q 136 60 144 66" stroke="#3D2314" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 96 64 Q 104 61 112 63" stroke="#3D2314" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 128 63 Q 136 61 144 64" stroke="#3D2314" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {state === "email" && (
          <>
            <circle cx="96" cy="90" r="5" fill="#FF8080" opacity="0.4" />
            <circle cx="144" cy="90" r="5" fill="#FF8080" opacity="0.4" />
          </>
        )}
        <path d="M 118 86 Q 120 90 122 86" stroke="#DCA285" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {state === "password" ? (
          <>
            <circle cx="120" cy="98" r="4.5" fill="#3D2314" />
            <circle cx="120" cy="98" r="2.5" fill="#D32F2F" />
          </>
        ) : state === "email" ? (
          <path d="M 110 94 Q 120 110 130 94 Z" fill="#D32F2F" stroke="#3D2314" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path d="M 112 96 Q 120 102 128 96" stroke="#3D2314" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        <path d="M 106 120 L 120 148 L 134 120 Z" fill={shirtColor} />
        <path d="M 117 126 L 123 126 L 125 170 L 120 178 L 115 170 Z" fill={tieColor} />
        <path d="M 80 130 C 80 130, 68 200, 68 230 L 172 230 C 172 200, 160 130, 160 130 Z" fill={suitColor} />
        <path d="M 84 130 L 108 120 L 104 165 L 92 195 Z" fill={lapelColor} />
        <path d="M 156 130 L 132 120 L 136 165 L 148 195 Z" fill={lapelColor} />
        <path d="M 80 130 C 70 145, 80 178, 120 178 C 150 178, 160 145, 160 130 L 148 132 C 148 142, 138 165, 120 165 C 102 165, 92 142, 92 132 Z" fill={suitColor} />
        <path d="M 90 148 L 150 148" stroke={lapelColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="120" cy="160" r="4.5" fill="#3D2314" />
        <path d="M 86 230 L 132 325 L 148 325 L 110 230 Z" fill="#151d2a" />
        <path d="M 116 230 C 110 260, 90 290, 110 325 L 128 325 C 115 295, 130 260, 154 230 Z" fill={suitColor} stroke={lapelColor} strokeWidth="0.5" />
        <path d="M 132 325 C 130 325, 128 335, 138 335 L 158 335 C 166 335, 164 325, 148 325 Z" fill="#111827" />
        <path d="M 138 331 L 152 331" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
        <path d="M 110 325 C 102 325, 96 337, 110 337 L 128 337 C 132 337, 132 325, 128 325 Z" fill="#111827" />
        <path d="M 112 333 L 124 333" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
        {drawGoggles(gx, gy)}
      </svg>
    </div>
  );
}
