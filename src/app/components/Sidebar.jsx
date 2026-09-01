import React from "react";
import { Landmark, History, User, Lock, LogOut, ShieldCheck, Settings, UserPlus, HelpCircle } from "lucide-react";
import { GOLD, BORDER } from "./theme";

export function Sidebar({ activeTab, onTabChange, onLogout, vaultCount, activeAdmin }) {
  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { id: "vault", label: "Account Vault", icon: Landmark },
        { id: "entities", label: "Register Entity", icon: UserPlus },
        ...(activeAdmin?.level >= 2 ? [{ id: "activity", label: "Activity Log", icon: History }] : [])
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { id: "profile", label: "My Profile", icon: User },
        ...(activeAdmin?.level === 3 ? [{ id: "register-admin", label: "Register Admin", icon: ShieldCheck }] : []),
        { id: "password", label: "Change Password", icon: Lock },
        { id: "settings", label: "General Settings", icon: Settings },
        { id: "help", label: "Help & Information", icon: HelpCircle },
        { id: "logout", label: "Logout", icon: LogOut, isAction: true }
      ]
    }
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white dark:bg-[#101010] flex-shrink-0 flex-col justify-between py-6 px-5 border-r border-slate-100 dark:border-[#222222] min-h-[calc(100vh-80px)] shadow-sm transition-colors duration-200">
      {/* Top Menu Links */}
      <div className="flex flex-col gap-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="flex flex-col">
            {/* Group Label */}
            <span className="text-[9px] font-bold tracking-widest text-[#7A6068] dark:text-slate-500 px-4 mb-3">
              {group.title}
            </span>

            {/* Group Items */}
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isAction) {
                        if (item.id === "logout") {
                          if (onTabChange) onTabChange("logout");
                          else if (onLogout) onLogout();
                        }
                      } else {
                        onTabChange(item.id);
                      }
                    }}
                    className={`flex items-center gap-3.5 h-11 px-4 rounded-xl text-[13.5px] font-bold transition-all duration-200 cursor-pointer border-l-4 ${isActive
                        ? "bg-[#FBF3F5] dark:bg-[#221015] text-[#7B1535] dark:text-[#E27D9B] border-[#7B1535] dark:border-[#E27D9B] shadow-sm translate-x-1"
                        : "text-[#7A6068] dark:text-slate-400 hover:text-[#7B1535] dark:hover:text-[#E27D9B] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border-transparent hover:translate-x-0.5"
                      }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-[#7B1535] dark:text-[#E27D9B]" : "text-[#7A6068]/80 dark:text-slate-400 group-hover:text-[#7B1535] dark:group-hover:text-[#E27D9B]"}
                    />
                    <span>{item.label}</span>

                    {/* Vault account count bubble */}
                    {item.id === "vault" && vaultCount !== undefined && (
                      <span className={`ml-auto text-[9px] font-extrabold px-2 py-0.5 rounded-full ${isActive
                          ? "bg-[#7B1535] dark:bg-[#E27D9B] text-white dark:text-[#111111]"
                          : "bg-[#FBF3F5] dark:bg-[#221015] text-[#7B1535] dark:text-[#E27D9B]"
                        }`}>
                        {vaultCount}
                      </span>
                    )}

                    {/* Activity log alert indicator */}
                    {item.id === "activity" && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                    )}
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
          className="rounded-2xl p-4.5 border flex flex-col gap-2.5 shadow-sm relative overflow-hidden transition-all hover:shadow-md bg-[#FDF6F7] dark:bg-[#221015]/60"
          style={{
            borderColor: "rgba(123, 21, 53, 0.12)"
          }}
        >
          {/* Specular sheen decorative overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7B1535]/5 to-transparent rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-[#7B1535] dark:text-[#E27D9B] flex-shrink-0" />
            <span className="text-[10px] font-black text-[#7B1535] dark:text-[#E27D9B] uppercase tracking-wide">
              Secure Terminal
            </span>
          </div>
          <span className="text-[10px] text-[#7A6068] dark:text-slate-400 leading-relaxed font-semibold">
            Data encryption active. All actions are logged under strict audit rules.
          </span>

          {/* Status indicator: System Online */}
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#7B1535]/5 dark:border-[#E27D9B]/5 mt-0.5">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16A34A]" />
            </div>
            <span className="text-[9px] font-bold text-[#16A34A] uppercase tracking-wider">
              System Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
