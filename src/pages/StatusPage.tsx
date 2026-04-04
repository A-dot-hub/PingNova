import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function StatusPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/status/${id}`);
        setData(res.data);
      } catch (err) {
        setError('Status page not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const { monitor, uptimePercent, incidents } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Activity className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">{monitor.name} Status</h1>
          <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline mt-2 inline-block">
            {monitor.url}
          </a>
        </div>

        {/* Current Status Banner */}
        <div className={`rounded-xl p-6 flex items-center justify-between ${
          monitor.status === 'up' ? 'bg-emerald-50 border border-emerald-200' : 
          monitor.status === 'down' ? 'bg-rose-50 border border-rose-200' : 
          'bg-slate-100 border border-slate-200'
        }`}>
          <div className="flex items-center">
            {monitor.status === 'up' ? (
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-4" />
            ) : monitor.status === 'down' ? (
              <AlertTriangle className="h-8 w-8 text-rose-600 mr-4" />
            ) : (
              <Clock className="h-8 w-8 text-slate-600 mr-4" />
            )}
            <div>
              <h2 className={`text-xl font-bold capitalize ${
                monitor.status === 'up' ? 'text-emerald-900' : 
                monitor.status === 'down' ? 'text-rose-900' : 
                'text-slate-900'
              }`}>
                All Systems {monitor.status === 'up' ? 'Operational' : monitor.status}
              </h2>
              <p className={`text-sm ${
                monitor.status === 'up' ? 'text-emerald-700' : 
                monitor.status === 'down' ? 'text-rose-700' : 
                'text-slate-700'
              }`}>
                Last updated: Just now
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">30-Day Uptime</p>
            <p className="text-3xl font-bold text-slate-900">{uptimePercent}%</p>
          </div>
        </div>

        {/* Incident History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Incidents</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {incidents.length > 0 ? (
              incidents.map((incident: any, index: number) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-rose-700">Downtime Detected</h4>
                    <span className="text-sm text-slate-500">{format(new Date(incident.checked_at), 'PPp')}</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    The monitor failed to respond. Status code: {incident.status_code || 'Timeout/Network Error'}.
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No incidents reported in the recent history.
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          Powered by <span className="font-semibold text-indigo-600">PingNova</span>
        </div>
      </div>
    </div>
  );
}
