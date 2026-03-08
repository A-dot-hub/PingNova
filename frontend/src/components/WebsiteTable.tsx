import { useState } from "react";
import { useMonitor, Website } from "../context/MonitorContext";
import {
  Trash2,
  ExternalLink,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function WebsiteTable() {
  const { websites, removeWebsite } = useMonitor();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch = site.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "UP":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> UP
          </span>
        );
      case "DOWN":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 animate-pulse">
            <XCircle className="w-3.5 h-3.5 mr-1" /> DOWN
          </span>
        );
      case "SLOW":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> SLOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Monitored Websites
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search URLs..."
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="UP">Up</option>
            <option value="DOWN">Down</option>
            <option value="SLOW">Slow</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-medium">Website URL</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Response Time</th>
              <th className="px-6 py-4 font-medium">Uptime</th>
              <th className="px-6 py-4 font-medium">Health</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWebsites.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No websites found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredWebsites.map((site) => (
                <tr
                  key={site.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${site.status === "UP" ? "bg-success" : site.status === "DOWN" ? "bg-danger" : "bg-warning"}`}
                      ></div>
                      <span className="font-medium text-gray-800">
                        {site.url}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(site.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm">
                      <Activity
                        className={`w-4 h-4 mr-2 ${site.responseTime > 500 ? "text-warning" : site.responseTime === 0 ? "text-danger" : "text-success"}`}
                      />
                      <span className="font-medium">
                        {site.responseTime} ms
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2 max-w-[60px]">
                        <div
                          className="bg-success h-1.5 rounded-full"
                          style={{ width: `${site.uptimePercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {site.uptimePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${site.healthScore > 90 ? "text-success" : site.healthScore > 60 ? "text-warning" : "text-danger"}`}
                    >
                      {site.healthScore}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="Visit Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => removeWebsite(site.id)}
                        className="text-gray-400 hover:text-danger transition-colors"
                        title="Remove Website"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
