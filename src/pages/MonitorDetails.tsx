import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft, Plus, Trash2, Bell, Download, Clock, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MonitorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: 'email', destination: '' });
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [monitorRes, alertsRes] = await Promise.all([
        axios.get(`/api/monitors/${id}?timeRange=${timeRange}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/alerts/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMonitor(monitorRes.data.monitor);
      setHistory(monitorRes.data.history.reverse());
      setAlerts(alertsRes.data);
    } catch (error) {
      toast.error('Failed to fetch monitor details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [id, timeRange]);

  const handleExport = async () => {
    try {
      const toastId = toast.loading('Generating report...');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/export/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.url) {
        window.open(res.data.url, '_blank');
        toast.success('Report generated!', { id: toastId });
      } else {
        toast.error('Failed to generate report', { id: toastId });
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/alerts', { ...newAlert, monitor_id: parseInt(id!) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Alert added');
      setShowAddAlert(false);
      setNewAlert({ type: 'email', destination: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add alert');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Alert deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const chartData = history.map(h => ({
    time: h.checked_at,
    responseTime: h.response_time_ms,
    status: h.status
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{monitor.name}</h1>
            <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
              {monitor.url}
            </a>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${monitor.status === 'up' ? 'bg-emerald-100 text-emerald-800' : 
              monitor.status === 'down' ? 'bg-rose-100 text-rose-800' : 
              'bg-slate-100 text-slate-800'}`}>
            {monitor.status}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/status/${id}`}
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
          >
            Public Status Page
          </Link>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Response Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => format(new Date(time), timeRange === '24h' ? 'HH:mm' : 'MMM dd')}
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `${value}ms`} />
                  <Tooltip 
                    labelFormatter={(label) => format(new Date(label), 'PPpp')}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="responseTime" name="Response Time" stroke="#4F46E5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">Recent Pings</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.slice(0, 50).map((ping: any) => (
                    <tr key={ping.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(ping.checked_at), 'PPpp')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${ping.status === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {ping.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {ping.response_time_ms} ms
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
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Monitor Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">Check Interval</dt>
                <dd className="mt-1 text-sm text-slate-900">Every {monitor.interval_minutes} minutes</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Created At</dt>
                <dd className="mt-1 text-sm text-slate-900">{format(new Date(monitor.created_at), 'PPp')}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-slate-500" />
                Alerts
              </h3>
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
                    <button onClick={() => handleDeleteAlert(alert.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showAddAlert && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
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
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
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
