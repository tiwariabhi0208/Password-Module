import React from "react";
import { Landmark, History, User, Lock, LogOut, ShieldCheck } from "lucide-react";
import { MAROON, GOLD, BORDER } from "./theme";

export function Sidebar({ activeTab, onTabChange, onLogout }) {
  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { id: "vault", label: "Account Vault", icon: Landmark },
        { id: "activity", label: "Activity Log", icon: History }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { id: "profile", label: "Profile", icon: User },
        { id: "password", label: "Change Password", icon: Lock },
        { id: "logout", label: "Logout", icon: LogOut, isAction: true }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white flex-shrink-0 flex flex-col justify-between py-5 px-6 border-r border-slate-100 min-h-[calc(100vh-80px)]">
      {/* Top Menu Links */}
      <div className="flex flex-col gap-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="flex flex-col">
            {/* Group Label */}
            <span className="text-[10px] font-bold tracking-widest text-[#7A6068] px-3 mb-2.5">
              {group.title}
            </span>

            {/* Group Items */}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isAction) {
                        if (item.id === "logout") onLogout();
                      } else {
                        onTabChange(item.id);
                      }
                    }}
                    className={`flex items-center gap-3.5 h-11 px-3.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer border-l-4 ${
                      isActive
                        ? "bg-[#FBF3F5] text-[#7B1535] border-[#7B1535]"
                        : "text-[#7A6068] hover:text-[#1A0810] hover:bg-slate-50 border-transparent"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-[#7B1535]" : "text-[#7A6068]/80"}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Secure & Private Box */}
      <div className="mt-8">
        <div 
          className="rounded-2xl p-4 border flex items-start gap-3"
          style={{ 
            backgroundColor: "#FDF6F7", 
            borderColor: "rgba(123, 21, 53, 0.12)" 
          }}
        >
          <ShieldCheck size={20} className="text-[#7B1535] mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#7B1535] leading-none">
              Secure & Private
            </span>
            <span className="text-[10.5px] text-[#7A6068] mt-1.5 leading-relaxed font-medium">
              All account details are encrypted and secure.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
