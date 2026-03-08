import { Search, Bell, User, Settings } from "lucide-react";
import { useMonitor } from "../context/MonitorContext";

export default function Navbar() {
  const { alerts } = useMonitor();
  const unreadCount = alerts.filter((a) => a.status === "Unread").length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search websites, alerts..."
          className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative cursor-pointer group">
          <Bell className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <div className="cursor-pointer group">
          <Settings className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-center cursor-pointer border-l border-gray-200 pl-6">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 leading-tight">
              Admin User
            </span>
            <span className="text-xs text-gray-500">DevOps Team</span>
          </div>
        </div>
      </div>
    </header>
  );
}
