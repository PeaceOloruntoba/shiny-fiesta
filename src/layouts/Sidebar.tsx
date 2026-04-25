import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Bus, LogOut } from "lucide-react";
import { useAuth } from "../stores/auth";
import ConfirmationModal from "../components/ui/ConfirmationModal";

export default function Sidebar({ nav, isOpen, onClose }: any) {
    const { logout, user: authUser } = useAuth();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    
    // Use user from auth store if available, otherwise fallback
    const user = authUser || { name: "Admin User" };

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutConfirmOpen(false);
    };

    return (
        <aside
            className={`
        bg-slate-900 text-white flex flex-col transition-all duration-300 h-full
        ${isOpen ? "w-[240px]" : "w-0 md:w-[68px]"}
      `}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-slate-800 p-4 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Bus size={20} />
                </div>

                {isOpen && (
                    <div className="truncate">
                        <p className="text-xs font-bold tracking-widest text-emerald-400">
                            PAULO
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">ADMIN DASHBOARD</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {nav.map(({ id, label, icon: Icon, path }: any) => (
                    <div key={id} className="relative group">
                        <NavLink
                            to={path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${isOpen ? "justify-start" : "justify-center"}
                ${isActive
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                }
                `
                            }
                        >
                            <Icon size={19} className="shrink-0" />
                            {isOpen && <span className="text-sm font-medium">{label}</span>}
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
                  transition-all duration-200 pointer-events-none z-50
                "
                            >
                                {label}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-slate-800 p-3 shrink-0">
                {isOpen && (
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold border border-emerald-500/20">
                            {user.name ? user.name[0] : "A"}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-semibold truncate">
                                {user.name ? user.name.split(" ")[0] : "Admin"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">System Manager</p>
                        </div>
                    </div>
                )}

                {/* Logout with tooltip */}
                <div className="relative group">
                    <button
                        onClick={handleLogout}
                        className={`
              flex items-center gap-3 w-full px-3 py-3 rounded-xl
              text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all
              ${isOpen ? "justify-start" : "justify-center"}
            `}
                    >
                        <LogOut size={16} className="shrink-0" />
                        {isOpen && <span className="text-sm font-medium">Sign Out</span>}
                    </button>

                    {!isOpen && (
                        <div
                            className="
                absolute left-full top-1/2 -translate-y-1/2 ml-3
                whitespace-nowrap px-3 py-1.5 rounded-md text-sm
                bg-slate-800 text-white shadow-lg
                opacity-0 group-hover:opacity-100
                translate-x-[-8px] group-hover:translate-x-0
                transition-all duration-200 pointer-events-none z-50
              "
                        >
                            Sign Out
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal 
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={confirmLogout}
                title="Sign Out"
                description="Are you sure you want to end your current session?"
                confirmText="Sign Out"
                variant="danger"
            />
        </aside>
    );
}
