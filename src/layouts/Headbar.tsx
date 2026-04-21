import { Menu, Bell } from "lucide-react";

export default function Headbar({ onCollapse, activeMenu }: any) {
    return (
        <header className="flex items-center gap-3 px-4 md:px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm shadow-gray-900/5">
            <button
                onClick={onCollapse}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 transition-all border border-gray-100"
            >
                <Menu size={20} />
            </button>

            <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">
                    {activeMenu?.label || "Overview"}
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 transition-all border border-gray-100 relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                    {new Date().toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </div>
        </header>
    );
}