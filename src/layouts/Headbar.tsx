import { Menu } from "lucide-react";

export default function Headbar({ onCollapse, activeMenu }: any) {
    return (
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
            <button
                onClick={onCollapse}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"
            >
                <Menu size={18} />
            </button>

            <h1 className="flex-1 text-lg font-bold text-slate-900">
                {activeMenu?.label || "Dashboard"}
            </h1>

            <span className="text-sm text-slate-400">
                {new Date().toLocaleDateString("en-NG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
            </span>
        </header>
    );
}