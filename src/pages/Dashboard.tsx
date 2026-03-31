import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Plus, Settings, LogOut, CheckCircle2, XCircle, PauseCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard({ setIsAuthenticated }: { setIsAuthenticated: (val: boolean) => void }) {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '', interval_minutes: 5 });
  const navigate = useNavigate();

  const fetchMonitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/monitors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonitors(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/monitors', newMonitor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewMonitor({ name: '', url: '', interval_minutes: 5 });
      fetchMonitors();
    } catch (error) {
      console.error(error);
      alert('Failed to add monitor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/monitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMonitors();
    } catch (error) {
      console.error(error);
      alert('Failed to delete monitor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">PingNova</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/settings" className="text-slate-500 hover:text-slate-700">
                <Settings className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Monitor
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Checked</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {monitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No monitors found. Add one to get started!
                  </td>
                </tr>
              ) : (
                monitors.map((monitor) => (
                  <tr key={monitor.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {monitor.status === 'up' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                      {monitor.status === 'down' && <XCircle className="h-6 w-6 text-red-500" />}
                      {monitor.status === 'paused' && <PauseCircle className="h-6 w-6 text-slate-400" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/monitors/${monitor.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        {monitor.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                      {monitor.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                      {monitor.last_checked ? formatDistanceToNow(new Date(monitor.last_checked), { addSuffix: true }) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(monitor.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Monitor</h2>
            <form onSubmit={handleAddMonitor}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Friendly Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newMonitor.name}
                    onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">URL (with http/https)</label>
                  <input
                    type="url"
                    required
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newMonitor.url}
                    onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Check Interval (minutes)</label>
                  <select
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newMonitor.interval_minutes}
                    onChange={(e) => setNewMonitor({ ...newMonitor, interval_minutes: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
