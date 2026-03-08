import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Bell,
  Activity,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Add Website", path: "/add-website", icon: PlusCircle },
    { name: "Downtime History", path: "/history", icon: History },
    { name: "Alerts", path: "/alerts", icon: Bell },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Activity className="h-8 w-8 text-primary mr-3" />
        <span className="text-xl font-bold text-gray-800 tracking-tight">
          PingNova
        </span>
      </div>
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-primary font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">
            SYSTEM STATUS
          </p>
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
