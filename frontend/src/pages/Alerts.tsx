import { useMonitor } from "../context/MonitorContext";
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

export default function Alerts() {
  const { alerts, markAlertRead } = useMonitor();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "Website Down":
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      case "Website Slow":
        return <Clock className="w-5 h-5 text-warning" />;
      case "Website Back Online":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "Website Down":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            CRITICAL
          </span>
        );
      case "Website Slow":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            WARNING
          </span>
        );
      case "Website Back Online":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            RESOLVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Recent notifications and system events.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center text-gray-800">
            <Bell className="w-5 h-5 mr-2 text-primary" />
            <h2 className="font-semibold">Alert Log</h2>
          </div>
          <span className="text-sm text-gray-500">Showing last 50 alerts</span>
        </div>

        <div className="divide-y divide-gray-100">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No alerts generated yet.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 transition-colors ${alert.status === "Unread" ? "bg-blue-50/30" : "hover:bg-gray-50/50"}`}
                onClick={() =>
                  alert.status === "Unread" && markAlertRead(alert.id)
                }
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${alert.type === "Website Down" ? "bg-red-50" : alert.type === "Website Slow" ? "bg-yellow-50" : "bg-green-50"}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className={`font-semibold ${alert.status === "Unread" ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {alert.type}
                      </h3>
                      {getAlertBadge(alert.type)}
                      {alert.status === "Unread" && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Event triggered for{" "}
                      <span className="font-medium text-gray-800">
                        {alert.url}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(alert.timeSent).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
