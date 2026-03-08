import { Globe, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import StatusCard from "../components/StatusCard";
import WebsiteTable from "../components/WebsiteTable";
import ResponseChart from "../components/ResponseChart";
import { useMonitor } from "../context/MonitorContext";

export default function Dashboard() {
  const { websites } = useMonitor();

  const totalWebsites = websites.length;
  const upWebsites = websites.filter((w) => w.status === "UP").length;
  const downWebsites = websites.filter((w) => w.status === "DOWN").length;

  const avgResponseTime =
    websites.length > 0
      ? Math.round(
          websites.reduce((acc, curr) => acc + curr.responseTime, 0) /
            websites.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor your website uptime and performance in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Total Websites"
          value={totalWebsites}
          icon={Globe}
          color="primary"
        />
        <StatusCard
          title="Websites Up"
          value={upWebsites}
          icon={ArrowUpCircle}
          color="success"
          trend="+2.5%"
        />
        <StatusCard
          title="Websites Down"
          value={downWebsites}
          icon={ArrowDownCircle}
          color="danger"
          trend={downWebsites > 0 ? "+1.2%" : "0.0%"}
        />
        <StatusCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={Clock}
          color="warning"
          trend="-15ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResponseChart />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              System Health
            </h2>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-gray-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-success"
                  strokeDasharray="98, 100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-800">
                  98<span className="text-xl">%</span>
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  Overall Score
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">API Gateway</span>
              <span className="font-medium text-success">Operational</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Database Cluster</span>
              <span className="font-medium text-success">Operational</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Worker Nodes</span>
              <span className="font-medium text-success">Operational</span>
            </div>
          </div>
        </div>
      </div>

      <WebsiteTable />
    </div>
  );
}
