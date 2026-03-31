import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft, Plus, Trash2, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function MonitorDetails() {
  const { id } = useParams();
  const [monitor, setMonitor] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: 'email', destination: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [monitorRes, alertsRes] = await Promise.all([
        axios.get(`/api/monitors/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/alerts/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMonitor(monitorRes.data.monitor);
      setHistory(monitorRes.data.history.reverse());
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/alerts', { ...newAlert, monitor_id: parseInt(id!) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddAlert(false);
      setNewAlert({ type: 'email', destination: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to add alert');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (!confirm('Delete this alert?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (!monitor) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const chartData = history.map(h => ({
    time: format(new Date(h.checked_at), 'HH:mm'),
    responseTime: h.response_time_ms,
    status: h.status
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Activity className="h-6 w-6 text-indigo-600" />
            <span className="ml-2 text-lg font-bold text-slate-900">{monitor.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Response Time (Last 100 checks)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', fontWeight: 500, marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="responseTime" stroke="#4f46e5" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Recent Checks</h2>
              </div>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.slice(0, 10).map((ping) => (
                    <tr key={ping.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(ping.checked_at), 'MMM d, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ping.status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ping.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {ping.response_time_ms}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {ping.status_code || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Monitor Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-slate-500">URL</dt>
                  <dd className="mt-1 text-sm text-slate-900 break-all"><a href={monitor.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{monitor.url}</a></dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Check Interval</dt>
                  <dd className="mt-1 text-sm text-slate-900">Every {monitor.interval_minutes} minutes</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Current Status</dt>
                  <dd className="mt-1 text-sm text-slate-900 capitalize">{monitor.status}</dd>
                </div>
              </dl>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-slate-500" />
                  Alerts
                </h2>
                <button onClick={() => setShowAddAlert(true)} className="text-indigo-600 hover:text-indigo-900">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No alerts configured.</p>
              ) : (
                <ul className="space-y-3">
                  {alerts.map(alert => (
                    <li key={alert.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-xs font-semibold uppercase text-slate-500 block">{alert.type}</span>
                        <span className="text-sm text-slate-900 truncate max-w-[200px] block" title={alert.destination}>{alert.destination}</span>
                      </div>
                      <button onClick={() => handleDeleteAlert(alert.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Alert</h2>
            <form onSubmit={handleAddAlert}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Alert Type</label>
                  <select
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Destination (Email or URL)</label>
                  <input
                    type={newAlert.type === 'email' ? 'email' : 'url'}
                    required
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newAlert.destination}
                    onChange={(e) => setNewAlert({ ...newAlert, destination: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAlert(false)}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
