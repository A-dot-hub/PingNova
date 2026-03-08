import { useMonitor } from "../context/MonitorContext";
import {
  Clock,
  Calendar,
  PieChart as PieChartIcon,
  BarChart2,
  Activity,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
);

export default function History() {
  const { history } = useMonitor();

  const pieData = {
    labels: ["Uptime", "Downtime"],
    datasets: [
      {
        data: [98.5, 1.5],
        backgroundColor: ["#22c55e", "#ef4444"],
        hoverBackgroundColor: ["#16a34a", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Incidents",
        data: [2, 0, 1, 4, 0, 0, 1],
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          },
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          stepSize: 1,
          font: {
            family: "'Poppins', sans-serif",
          },
        },
        beginAtZero: true,
      },
    },
  };

  const lineData = {
    labels: ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30"],
    datasets: [
      {
        label: "Avg Response Time (ms)",
        data: [120, 135, 125, 140, 210, 180, 150],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2563eb",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Poppins', sans-serif" } },
      },
      y: {
        grid: { color: "#f3f4f6", borderDash: [5, 5] },
        ticks: { font: { family: "'Poppins', sans-serif" }, stepSize: 100 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Downtime History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review past incidents and system availability metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Overall Uptime
            </h2>
          </div>
          <div className="flex-1 relative w-full h-full">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <div className="flex items-center mb-4">
            <BarChart2 className="w-5 h-5 text-warning mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Weekly Incidents
            </h2>
          </div>
          <div className="flex-1 relative w-full h-full">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[350px] flex flex-col">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-success mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Response Trend
            </h2>
          </div>
          <div className="flex-1 relative w-full h-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center text-gray-800">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            <h2 className="font-semibold">Incident Log</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Website URL</th>
                <th className="px-6 py-4 font-medium">Downtime Start</th>
                <th className="px-6 py-4 font-medium">Downtime End</th>
                <th className="px-6 py-4 font-medium">Total Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No downtime incidents recorded.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">
                        {record.url}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.downtimeStart).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.downtimeEnd ? (
                        new Date(record.downtimeEnd).toLocaleString()
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                          Ongoing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {record.totalDowntime || (
                        <div className="flex items-center text-danger">
                          <Clock className="w-4 h-4 mr-1" /> Calculating...
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
