import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Trash2, AlertTriangle, Mail, Webhook } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      // We need an endpoint to get all alerts for a user, but currently we only have /api/alerts/:monitorId
      // Let's assume we update the backend to support GET /api/alerts without ID to get all user alerts
      const res = await axios.get('/api/alerts', { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(res.data);
    } catch (error) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/alerts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">All Alerts</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No alerts configured</h3>
            <p className="mt-1 text-slate-500">Go to a monitor's details page to set up alerts.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${alert.type === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {alert.type === 'email' ? <Mail className="h-6 w-6" /> : <Webhook className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-slate-900">
                        {alert.monitor_name}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center mt-1">
                        <span className="uppercase font-medium text-xs tracking-wider mr-2">{alert.type}</span>
                        {alert.destination}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
