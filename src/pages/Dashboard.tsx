import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Activity, Clock, AlertTriangle, CheckCircle, PauseCircle, Trash2, Edit2, PlayCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '', interval_minutes: 5 });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dashboardRes, monitorsRes] = await Promise.all([
        axios.get(`/api/dashboard?timeRange=${timeRange}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/monitors', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(dashboardRes.data);
      setMonitors(monitorsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/monitors', newMonitor, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Monitor added successfully');
      setShowAddModal(false);
      setNewMonitor({ name: '', url: '', interval_minutes: 5 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add monitor');
    }
  };

  const togglePause = async (id: number, isPaused: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/monitors/${id}/pause`, { paused: !isPaused }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Monitor ${!isPaused ? 'paused' : 'resumed'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update monitor');
    }
  };

  const deleteMonitor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this monitor?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/monitors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Monitor deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete monitor');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'Up', value: stats?.upMonitors || 0, color: '#10B981' },
    { name: 'Down', value: stats?.downMonitors || 0, color: '#EF4444' },
    { name: 'Paused', value: stats?.pausedMonitors || 0, color: '#94A3B8' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
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
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Monitors</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.totalMonitors || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Uptime</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.uptimePercent}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Avg Response</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.avgResponseTime}ms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Active Alerts</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.activeAlerts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Uptime History (%)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.history || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(time) => timeRange === '24h' ? format(new Date(time), 'HH:mm') : format(new Date(time), 'MMM dd')}
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(label) => format(new Date(label), 'PPpp')}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="uptime_percent" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Status Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Response Time History</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.history || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(time) => timeRange === '24h' ? format(new Date(time), 'HH:mm') : format(new Date(time), 'MMM dd')}
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip 
                  labelFormatter={(label) => format(new Date(label), 'PPpp')}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avg_response_time" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Downtime Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Total Downtime</span>
              <span className="font-semibold text-slate-900">{stats?.downtime?.totalMinutes || 0} mins</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Incidents</span>
              <span className="font-semibold text-slate-900">{stats?.downtime?.incidents || 0}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-semibold text-slate-900">Your Monitors</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Checked</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {monitors.map((monitor) => (
                  <tr key={monitor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/monitors/${monitor.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        {monitor.name}
                      </Link>
                      <div className="text-sm text-slate-500">{monitor.url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${monitor.status === 'up' ? 'bg-emerald-100 text-emerald-800' : 
                          monitor.status === 'down' ? 'bg-rose-100 text-rose-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                        {monitor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {monitor.last_checked ? format(new Date(monitor.last_checked), 'PP p') : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => togglePause(monitor.id, monitor.status === 'paused')} className="text-slate-400 hover:text-indigo-600 mx-2">
                        {monitor.status === 'paused' ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
                      </button>
                      <button onClick={() => deleteMonitor(monitor.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {monitors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No monitors found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Monitor</h2>
            <form onSubmit={handleAddMonitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={newMonitor.name}
                  onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  placeholder="My Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">URL</label>
                <input
                  type="url"
                  required
                  value={newMonitor.url}
                  onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Check Interval (minutes)</label>
                <select
                  value={newMonitor.interval_minutes}
                  onChange={(e) => setNewMonitor({ ...newMonitor, interval_minutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
