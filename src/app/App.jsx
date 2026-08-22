import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  LogOut,
  Settings,
  X,
  ExternalLink,
  Edit2,
  ArrowLeft,
  Mail,
  Lock,
  LogIn
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
const MAROON = "#7B1535";
const GOLD = "#C9A227";
const GOLD_LIGHT = "#F5E9BE";
const MAROON_HOVER = "#661128";
const BORDER = "rgba(123,21,53,0.16)";
const BANKS = [
  { id: 1, name: "HDFC Bank", initial: "H", accountNumber: "50100234567892", ifsc: "HDFC0001234", holder: "South Point School, Guwahati", color: "#1E3A5F" },
  { id: 2, name: "ICICI Bank", initial: "I", accountNumber: "003305678901234", ifsc: "ICIC0000033", holder: "South Point School, Guwahati", color: "#7A4C1A" },
  { id: 3, name: "State Bank of India", initial: "SB", accountNumber: "38012345678901", ifsc: "SBIN0001234", holder: "South Point School, Guwahati", color: "#1B3F5C" },
  { id: 4, name: "Axis Bank", initial: "A", accountNumber: "915010012345678", ifsc: "UTIB0001234", holder: "South Point School, Guwahati", color: "#5C2E6B" },
  { id: 5, name: "Kotak Mahindra Bank", initial: "K", accountNumber: "1234567890123", ifsc: "KKBK0001234", holder: "South Point School, Guwahati", color: "#7A1A1A" },
  { id: 6, name: "Yes Bank", initial: "Y", accountNumber: "009876543210123", ifsc: "YESB0001234", holder: "South Point School, Guwahati", color: "#1A3F6B" },
  { id: 7, name: "Punjab National Bank", initial: "PN", accountNumber: "017200012345678", ifsc: "PUNB0012345", holder: "South Point School, Guwahati", color: "#2C1A5F" },
  { id: 8, name: "Bank of Baroda", initial: "BB", accountNumber: "05120200000122", ifsc: "BARB0BORIVL", holder: "South Point School, Guwahati", color: "#5F3A0A" }
];
const USERS = ["Priya Sharma", "Rahul Verma", "Anita Nair", "Deepak Mehta"];
function maskAccount(num) {
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${num.slice(-4)}`;
}
function formatAccount(num) {
  return num.replace(/(.{4})/g, "$1 ").trim();
}
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function SchoolCrest({ size = 60 }) {
  const h = size * 1.12;
  return <svg width={size} height={h} viewBox="0 0 60 67" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield body */}
      <path
        d="M30 3L4 14V35C4 49 16 60 30 64C44 60 56 49 56 35V14L30 3Z"
        fill={MAROON}
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner shield ring */}
      <path
        d="M30 9L9 18V35C9 47 19 56 30 60C41 56 51 47 51 35V18L30 9Z"
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Gold Star */}
      <path
        d="M 30 19 L 33.5 27 L 42 27 L 35 32 L 37.5 40 L 30 35 L 22.5 40 L 25 32 L 18 27 L 26.5 27 Z"
        fill={GOLD}
      />
      {/* Torch flame (burgundy/maroon) inside the star */}
      <path
        d="M30 22C30 22 26.5 25.5 26.5 29C26.5 31.8 28 33.5 30 34.2C32 33.5 33.5 31.8 33.5 29C33.5 25.5 30 22 30 22Z"
        fill={MAROON}
      />
      {/* Torch handle */}
      <rect x="28" y="36" width="4" height="12" rx="2" fill={GOLD} />
      {/* Torch base */}
      <rect x="24.5" y="47" width="11" height="3" rx="1.5" fill={GOLD} />
    </svg>;
}
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

function BoyCharacter({ state }) {
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

  // Sunglasses logic:
  // Idle (state === null): worn on eyes (gx = 120, gy = 76)
  // Email (state === "email"): removed/forehead (gx = 120, gy = 48)
  // Password (state === "password"): worn on eyes (gx = 120, gy = 76)
  let gx = 120;
  let gy = 76; // Default: worn on eyes

  if (state === "email") {
    gx = 120;
    gy = 48; // Removed: pushed up to forehead
  }

  // Pupil positions (relative to eyes whites: left eye cx=106, right eye cx=134, cy=76)
  // Idle: stare forward (cx=106, 134)
  // Email (looking left towards card): cx=102, cx=130
  // Password (looking right away): cx=110, cx=138
  let pupilLX = 106;
  let pupilLY = 76;
  let pupilRX = 134;
  let pupilRY = 76;

  if (state === "email") {
    // Looking left (towards the input card on his left)
    pupilLX = 102;
    pupilLY = 76;
    pupilRX = 130;
    pupilRY = 76;
  } else if (state === "password") {
    // Looking right (away from the card on his left)
    pupilLX = 110;
    pupilLY = 76;
    pupilRX = 138;
    pupilRY = 76;
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-[240px] h-[380px] animate-bob-slow">
      <style dangerouslySetInnerHTML={{ __html: WHISTLE_STYLES }} />
      {/* Musical notes (typing-password) - placed on the right side floating away */}
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
        {/* Hair back */}
        <path d="M88,60 Q120,-5 152,60 Z" fill={hairColor} />

        {/* Ears */}
        <circle cx="83" cy="80" r="9" fill={skinColor} />
        <circle cx="157" cy="80" r="9" fill={skinColor} />
        <circle cx="83" cy="80" r="5" fill="#ECA689" />
        <circle cx="157" cy="80" r="5" fill="#ECA689" />

        {/* Neck */}
        <rect x="108" y="105" width="24" height="25" fill={skinColor} />

        {/* Face */}
        <path d="M88,80 C88,115 152,115 152,80 C152,55 88,55 88,80 Z" fill={skinColor} />

        {/* Hair front */}
        <path d="M84,68 C100,45 140,45 156,68 C160,50 145,20 120,25 C95,20 80,50 84,68 Z" fill={hairColor} />
        <path d="M85,68 Q102,52 112,62 Q122,52 132,62 Q142,52 155,68 L152,56 Q120,22 88,56 Z" fill={hairColor} />

        {/* Eyes whites */}
        <circle cx="106" cy="76" r="8" fill="white" stroke="#3D2314" strokeWidth="1.5" />
        <circle cx="134" cy="76" r="8" fill="white" stroke="#3D2314" strokeWidth="1.5" />

        {/* Pupils */}
        <circle cx={pupilLX} cy={pupilLY} r="4" fill="#3D2314" />
        <circle cx={pupilRX} cy={pupilRY} r="4" fill="#3D2314" />
        <circle cx={pupilLX + (state === "email" ? -1 : 1)} cy={pupilLY - 1} r="1" fill="white" />
        <circle cx={pupilRX + (state === "email" ? -1 : 1)} cy={pupilRY - 1} r="1" fill="white" />

        {/* Eyebrows */}
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

        {/* Blush Cheeks */}
        {state === "email" && (
          <>
            <circle cx="96" cy="90" r="5" fill="#FF8080" opacity="0.4" />
            <circle cx="144" cy="90" r="5" fill="#FF8080" opacity="0.4" />
          </>
        )}

        {/* Nose */}
        <path d="M 118 86 Q 120 90 122 86" stroke="#DCA285" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Mouth */}
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

        {/* --- SUIT / TORSO --- */}
        {/* White Shirt collar area */}
        <path d="M 106 120 L 120 148 L 134 120 Z" fill={shirtColor} />
        {/* Red Tie */}
        <path d="M 117 126 L 123 126 L 125 170 L 120 178 L 115 170 Z" fill={tieColor} />

        {/* Suit Jacket Body */}
        <path d="M 80 130 C 80 130, 68 200, 68 230 L 172 230 C 172 200, 160 130, 160 130 Z" fill={suitColor} />

        {/* Lapels */}
        <path d="M 84 130 L 108 120 L 104 165 L 92 195 Z" fill={lapelColor} />
        <path d="M 156 130 L 132 120 L 136 165 L 148 195 Z" fill={lapelColor} />

        {/* Folded Arms (Crossed Arms posture) */}
        {/* Left arm sleeve wrapping rightwards */}
        <path d="M 80 130 C 70 145, 80 178, 120 178 C 150 178, 160 145, 160 130 L 148 132 C 148 142, 138 165, 120 165 C 102 165, 92 142, 92 132 Z" fill={suitColor} />
        {/* Sleeve fold overlap shadows to show depth */}
        <path d="M 90 148 L 150 148" stroke={lapelColor} strokeWidth="3" strokeLinecap="round" />
        {/* Cuff/Hand details tucked inside */}
        <circle cx="120" cy="160" r="4.5" fill="#3D2314" /> {/* watch */}

        {/* --- LEGS CROSSED --- */}
        {/* Under leg (left leg standing straight/slightly tilted) */}
        <path d="M 86 230 L 132 325 L 148 325 L 110 230 Z" fill="#151d2a" />
        
        {/* Over leg (right leg crossed in front, bent at knee) */}
        <path d="M 116 230 C 110 260, 90 290, 110 325 L 128 325 C 115 295, 130 260, 154 230 Z" fill={suitColor} stroke={lapelColor} strokeWidth="0.5" />

        {/* Shoes */}
        {/* Left Shoe (under) */}
        <path d="M 132 325 C 130 325, 128 335, 138 335 L 158 335 C 166 335, 164 325, 148 325 Z" fill="#111827" />
        <path d="M 138 331 L 152 331" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
        {/* Right Shoe (over) */}
        <path d="M 110 325 C 102 325, 96 337, 110 337 L 128 337 C 132 337, 132 325, 128 325 Z" fill="#111827" />
        <path d="M 112 333 L 124 333" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />

        {/* Render Goggles */}
        {drawGoggles(gx, gy)}
      </svg>
    </div>
  );
}

function AuthCard({ children, sideElement }) {
  return <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8" style={{ backgroundColor: "#500a19" }}>
      {/* Layout wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[420px]">
        {sideElement && (
          <div className="md:absolute md:-right-[140px] md:bottom-[20px] md:z-20 mb-4 md:mb-0 transform md:-rotate-[3deg] origin-bottom transition-all duration-300">
            {sideElement}
          </div>
        )}

        {/* Card */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white bg-white z-10">
          {/* Maroon header */}
          <div
            className="flex flex-col items-center py-7 px-6"
            style={{ backgroundColor: MAROON }}
          >
            <SchoolCrest size={58} />
            <h1
              className="mt-2.5 text-xl font-bold tracking-wide text-center font-serif"
              style={{ color: GOLD }}
            >
              South Point School
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 w-full justify-center">
              <span style={{ color: GOLD, opacity: 0.8 }} className="text-[10px] font-bold">—</span>
              <p
                className="text-[9px] font-bold tracking-[0.16em] uppercase text-center"
                style={{ color: GOLD }}
              >
                Management Information System
              </p>
              <span style={{ color: GOLD, opacity: 0.8 }} className="text-[10px] font-bold">—</span>
            </div>
            <div className="text-[10px] leading-none mt-1" style={{ color: GOLD }}>•</div>
          </div>

          {/* White form body */}
          <div className="bg-white px-8 py-7">{children}</div>
        </div>
      </div>
    </div>;
}
function AccountModal({ bank, onClose }) {
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: "rgba(80,10,25,0.5)" }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
      <div className="w-[520px] rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: BORDER }}>
        {
    /* Maroon modal header */
  }
        <div
    className="flex items-center justify-between px-5 py-4"
    style={{ backgroundColor: MAROON }}
  >
          <div className="flex items-center gap-3">
            <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: bank.color }}
  >
              <span className="text-white text-[10px] font-bold leading-none">{bank.initial}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[15px] font-semibold">{bank.name}</span>
              <button className="transition-colors" style={{ color: GOLD }} title="Open bank portal">
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
    style={{ color: GOLD }}
    title="Edit"
  >
              <Edit2 size={13} />
            </button>
            <button
    onClick={onClose}
    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/10 text-white"
    title="Close"
  >
              <X size={15} />
            </button>
          </div>
        </div>

        {
    /* Body */
  }
        <div className="bg-white px-5 py-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Number
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#1A0810] text-sm font-mono">
                  {reveal ? formatAccount(bank.accountNumber) : maskAccount(bank.accountNumber)}
                </span>
                <button
    onClick={() => setReveal(!reveal)}
    className="transition-colors flex-shrink-0"
    style={{ color: GOLD }}
  >
                  {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                IFSC Code
              </p>
              <span className="text-[#1A0810] text-sm font-mono">{bank.ifsc}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Holder
              </p>
              <span className="text-[#1A0810] text-sm">{bank.holder}</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
                Account Type
              </p>
              <span className="text-[#1A0810] text-sm">Current Account</span>
            </div>
          </div>
        </div>

        {
    /* Footer */
  }
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: BORDER, backgroundColor: "#FDFAFB" }}>
          <button
    className="flex-1 h-9 border-2 text-sm font-semibold rounded-lg transition-colors hover:text-white"
    style={{ borderColor: MAROON, color: MAROON }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = MAROON;
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = MAROON;
    }}
  >
            Corporate Login
          </button>
          <button
    className="flex-1 h-9 border-2 text-sm font-semibold rounded-lg transition-colors hover:text-white"
    style={{ borderColor: MAROON, color: MAROON }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = MAROON;
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = MAROON;
    }}
  >
            Personal Login
          </button>
        </div>
      </div>
    </div>;
}
function IconInput({
  icon,
  right,
  ...props
}) {
  return <div className="relative">
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
    </div>;
}
export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [focusField, setFocusField] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const otpRefs = useRef([]);
  useEffect(() => {
    if (screen !== "forgot-step2" || resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1e3);
    return () => clearInterval(id);
  }, [screen]);
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  const handleResend = () => {
    setOtpValues(["", "", "", "", "", ""]);
    setResendTimer(60);
    setCanResend(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };
  const goToDashboard = () => {
    setScreen("dashboard");
    setSelectedBank(null);
  };
  const sendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
    setOtpValues(["", "", "", "", "", ""]);
    setScreen("forgot-step2");
  };
  const primaryBtn = (label, onClick, icon, disabled = false) => <button
    onClick={onClick}
    disabled={disabled}
    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
    style={{ backgroundColor: disabled ? "#7B153580" : MAROON }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = MAROON_HOVER;
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.backgroundColor = MAROON;
    }}
  >
      {icon}
      {label}
    </button>;
  if (screen === "login") {
    return <AuthCard sideElement={<BoyCharacter state={focusField} />}>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-700">
              EMAIL ADDRESS
            </label>
            <IconInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@school.edu"
              icon={<Mail size={16} />}
              onKeyDown={(e) => e.key === "Enter" && goToDashboard()}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField(null)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-700">
              PASSWORD
            </label>
            <IconInput
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              right={<button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="transition-colors flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>}
              onKeyDown={(e) => e.key === "Enter" && goToDashboard()}
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField(null)}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: MAROON }}
              />
              <span className="text-xs text-gray-500 font-medium">Remember Me</span>
            </label>
            <button
              onClick={() => setScreen("forgot-step1")}
              className="text-xs font-semibold transition-colors hover:underline"
              style={{ color: MAROON }}
            >
              Forgot Password?
            </button>
          </div>

          <div className="pt-2">
            {primaryBtn("Log in", goToDashboard, <LogIn size={16} />)}
          </div>
        </div>
      </AuthCard>;
  }
  if (screen === "forgot-step1") {
    return <AuthCard>
        <button
      onClick={() => setScreen("login")}
      className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70"
      style={{ color: MAROON }}
    >
          <ArrowLeft size={13} />
          Back to login
        </button>
        <h2 className="text-base font-semibold mb-1" style={{ color: MAROON }}>Reset Password</h2>
        <p className="text-sm text-[#7A6068] mb-4">
          We&apos;ll send a one-time code to your work email.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: MAROON }}>
              Work Email
            </label>
            <IconInput
      type="email"
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      placeholder="e.g. admin@school.edu"
      icon={<Mail size={14} />}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
    />
          </div>
          {primaryBtn("Send OTP", sendOtp)}
        </div>
      </AuthCard>;
  }
  if (screen === "forgot-step2") {
    const otpComplete = otpValues.every((v) => v !== "");
    return <AuthCard>
        <button
      onClick={() => setScreen("forgot-step1")}
      className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70"
      style={{ color: MAROON }}
    >
          <ArrowLeft size={13} />
          Back
        </button>
        <h2 className="text-base font-semibold mb-1" style={{ color: MAROON }}>Verify Identity</h2>
        <p className="text-sm text-[#7A6068] mb-5">
          6-digit code sent to{" "}
          <span className="font-medium text-[#1A0810]">{forgotEmail || "your email"}</span>
        </p>

        {
      /* OTP boxes */
    }
        <div className="flex gap-2 mb-4">
          {otpValues.map((val, i) => <input
      key={i}
      ref={(el) => {
        otpRefs.current[i] = el;
      }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={val}
      onChange={(e) => handleOtpChange(i, e.target.value)}
      onKeyDown={(e) => handleOtpKeyDown(i, e)}
      className="flex-1 h-12 text-center text-base font-bold border-2 rounded-lg bg-white text-[#1A0810] focus:outline-none transition-colors caret-transparent"
      style={{
        borderColor: val ? MAROON : BORDER,
        backgroundColor: val ? GOLD_LIGHT : "#fff"
      }}
    />)}
        </div>

        {
      /* Resend */
    }
        <div className="mb-4 h-5 flex items-center">
          {canResend ? <button
      onClick={handleResend}
      className="text-sm font-semibold hover:underline"
      style={{ color: MAROON }}
    >
              Resend code
            </button> : <span className="text-sm text-[#7A6068]">
              Resend in{" "}
              <span className="font-mono font-semibold" style={{ color: MAROON }}>
                0:{String(resendTimer).padStart(2, "0")}
              </span>
            </span>}
        </div>

        {primaryBtn("Verify & Reset Password", goToDashboard, void 0, !otpComplete)}
      </AuthCard>;
  }
  return <div className="min-h-screen bg-[#FAFAFA]">
      {
    /* Nav — maroon */
  }
      <nav
    className="h-14 flex items-center px-6 justify-between sticky top-0 z-20"
    style={{ backgroundColor: MAROON, borderBottom: `1px solid rgba(255,255,255,0.08)` }}
  >
        {
    /* Brand */
  }
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <SchoolCrest size={22} />
            <span className="text-white text-sm font-bold tracking-tight">Credential Vault</span>
          </div>
          <span
    className="text-[9px] font-semibold tracking-[0.18em] uppercase ml-6 -mt-0.5"
    style={{ color: GOLD, opacity: 0.8 }}
  >
            South Point School, Guwahati
          </span>
        </div>

        {
    /* Avatar menu */
  }
        <div className="relative">
          <button
    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
    className="flex items-center gap-2 h-8 px-2 rounded-lg transition-colors hover:bg-white/10"
  >
            <div
    className="w-7 h-7 rounded-full flex items-center justify-center border-2"
    style={{ backgroundColor: "rgba(201,162,39,0.2)", borderColor: GOLD }}
  >
              <span className="text-[10px] font-bold" style={{ color: GOLD }}>
                {getInitials(selectedUser)}
              </span>
            </div>
            <span className="text-sm text-white font-medium">{selectedUser}</span>
            <ChevronDown size={13} className="text-white/60" />
          </button>

          {avatarMenuOpen && <>
              <div className="fixed inset-0 z-10" onClick={() => setAvatarMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl z-30 py-1 overflow-hidden border" style={{ borderColor: BORDER }}>
                <div className="px-3 py-2.5 border-b" style={{ borderColor: BORDER, backgroundColor: "#FBF3F5" }}>
                  <p className="text-sm font-semibold" style={{ color: MAROON }}>{selectedUser}</p>
                  <p className="text-xs text-[#7A6068] mt-0.5">admin@southpoint.edu.in</p>
                </div>
                <button className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] hover:bg-[#FBF3F5] flex items-center gap-2.5 transition-colors">
                  <Settings size={13} style={{ color: MAROON }} />
                  Settings
                </button>
                <button
    onClick={() => {
      setAvatarMenuOpen(false);
      setScreen("login");
    }}
    className="w-full text-left px-3 py-2.5 text-sm text-[#1A0810] hover:bg-[#FBF3F5] flex items-center gap-2.5 transition-colors"
  >
                  <LogOut size={13} style={{ color: MAROON }} />
                  Sign out
                </button>
              </div>
            </>}
        </div>
      </nav>

      {
    /* Page content */
  }
      <main className="max-w-[1200px] mx-auto px-8 py-8">
        {
    /* Header row */
  }
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: MAROON }}>Account Vault</h1>
            <p className="text-sm text-[#7A6068] mt-1">
              Linked bank accounts — South Point School, Guwahati
            </p>
          </div>

          {
    /* User selector */
  }
          <div className="relative flex items-center gap-2">
            <span className="text-sm text-[#7A6068]">Viewing:</span>
            <button
    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
    className="flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg border text-sm font-medium transition-colors bg-white"
    style={{ borderColor: BORDER, color: MAROON }}
  >
              {selectedUser}
              <ChevronDown size={13} style={{ color: GOLD }} />
            </button>

            {userDropdownOpen && <>
                <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl z-20 py-1 overflow-hidden border" style={{ borderColor: BORDER }}>
                  {USERS.map((user) => <button
    key={user}
    onClick={() => {
      setSelectedUser(user);
      setUserDropdownOpen(false);
    }}
    className="w-full text-left px-3 py-2.5 text-sm transition-colors"
    style={user === selectedUser ? { color: MAROON, backgroundColor: "#FBF3F5", fontWeight: 600 } : { color: "#1A0810" }}
  >
                      {user}
                    </button>)}
                </div>
              </>}
          </div>
        </div>

        {
    /* Divider */
  }
        <div className="h-px mb-6" style={{ backgroundColor: BORDER }} />

        {
    /* Count badge */
  }
        <div className="flex items-center justify-between mb-4">
          <span
    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
    style={{ color: MAROON, backgroundColor: "#FBF3F5", border: `1px solid ${BORDER}` }}
  >
            {BANKS.length} Accounts
          </span>
        </div>

        {
    /* Account grid */
  }
        <div className="grid grid-cols-4 gap-3">
          {BANKS.map((bank) => <button
    key={bank.id}
    onClick={() => setSelectedBank(bank)}
    className="group bg-white rounded-xl p-4 text-left transition-all duration-150 focus:outline-none border"
    style={{ borderColor: BORDER }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = MAROON;
      e.currentTarget.style.backgroundColor = "#FBF3F5";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = BORDER;
      e.currentTarget.style.backgroundColor = "#FFFFFF";
    }}
  >
              <div className="flex items-start gap-3">
                <div
    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: bank.color }}
  >
                  <span className="text-white text-[10px] font-bold leading-none">{bank.initial}</span>
                </div>
                <div className="min-w-0 flex-1 mt-0.5">
                  <p className="text-sm font-semibold truncate" style={{ color: MAROON }}>
                    {bank.name}
                  </p>
                  <p className="text-[11px] font-mono mt-1 text-[#7A6068]">
                    {maskAccount(bank.accountNumber)}
                  </p>
                </div>
              </div>
              {
    /* Gold accent bottom bar on hover */
  }
              <div
    className="mt-3 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
    style={{ backgroundColor: GOLD }}
  />
            </button>)}
        </div>
      </main>

      {
    /* Modal */
  }
      {selectedBank && <AccountModal bank={selectedBank} onClose={() => setSelectedBank(null)} />}
    </div>;
}
