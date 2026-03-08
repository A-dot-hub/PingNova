import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "success" | "danger" | "warning";
  trend?: string;
}

export default function StatusCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: StatusCardProps) {
  const colorMap = {
    primary: "bg-blue-50 text-primary border-blue-100",
    success: "bg-green-50 text-success border-green-100",
    danger: "bg-red-50 text-danger border-red-100",
    warning: "bg-yellow-50 text-warning border-yellow-100",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p
            className={`text-xs mt-2 font-medium ${trend.startsWith("+") ? "text-success" : "text-danger"}`}
          >
            {trend} from last week
          </p>
        )}
      </div>
      <div
        className={`h-14 w-14 rounded-xl flex items-center justify-center border ${colorMap[color]}`}
      >
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
}
