import { NavLink } from "react-router-dom";
import { Bus, LogOut } from "lucide-react";

export default function Sidebar({ nav, isOpen }: any) {
    const user = { name: "John Doe" };

    return (
        <aside
            className={`
        bg-slate-900 text-white flex flex-col transition-all duration-300
        ${isOpen ? "w-[230px]" : "w-[68px]"}
      `}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-slate-800 p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Bus size={20} />
                </div>

                {isOpen && (
                    <div>
                        <p className="text-xs font-bold tracking-widest">
                            CAMPUSTRANSIT
                        </p>
                        <p className="text-[11px] text-slate-400">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {nav.map(({ id, label, icon: Icon, path }: any) => (
                    <div key={id} className="relative group">
                        <NavLink
                            to={path}
                            className={({ isActive }) =>
                                `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${isOpen ? "justify-start" : "justify-center"}
                ${isActive
                                    ? "bg-emerald-500 text-white shadow-md"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }
                `
                            }
                        >
                            <Icon size={19} />
                            {isOpen && <span className="text-sm">{label}</span>}
                        </NavLink>

                        {/* Tooltip */}
                        {!isOpen && (
                            <div
                                className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-3
                  whitespace-nowrap px-3 py-1.5 rounded-md text-sm
                  bg-slate-800 text-white shadow-lg
                  opacity-0 group-hover:opacity-100
                  translate-x-[-8px] group-hover:translate-x-0
                  transition-all duration-200 pointer-events-none
                "
                            >
                                {label}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-slate-800 p-3">
                {isOpen && (
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold">
                            {user.name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {user.name.split(" ")[0]}
                            </p>
                            <p className="text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>
                )}

                {/* Logout with tooltip */}
                <div className="relative group">
                    <button
                        className={`
              flex items-center gap-2 w-full px-3 py-2 rounded-lg
              text-slate-400 hover:bg-slate-800 hover:text-white
              ${isOpen ? "justify-start" : "justify-center"}
            `}
                    >
                        <LogOut size={16} />
                        {isOpen && <span>Logout</span>}
                    </button>

                    {!isOpen && (
                        <div
                            className="
                absolute left-full top-1/2 -translate-y-1/2 ml-3
                whitespace-nowrap px-3 py-1.5 rounded-md text-sm
                bg-slate-800 text-white shadow-lg
                opacity-0 group-hover:opacity-100
                translate-x-[-8px] group-hover:translate-x-0
                transition-all duration-200 pointer-events-none
              "
                        >
                            Logout
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}