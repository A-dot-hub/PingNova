import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft, CreditCard, User } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Activity className="h-6 w-6 text-indigo-600" />
            <span className="ml-2 text-lg font-bold text-slate-900">Settings</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex items-center">
              <User className="h-5 w-5 text-slate-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-slate-900">Profile Information</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Full name</dt>
                  <dd className="mt-1 text-sm text-slate-900">{user.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Email address</dt>
                  <dd className="mt-1 text-sm text-slate-900">{user.email}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex items-center">
              <CreditCard className="h-5 w-5 text-slate-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-slate-900">Subscription Plan</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Current Plan: <span className="uppercase font-bold text-indigo-600">{user.plan}</span></p>
                  <p className="text-sm text-slate-500 mt-1">
                    {user.plan === 'free' ? 'You are currently on the free tier (5 monitors max).' : 'You are on a premium plan.'}
                  </p>
                </div>
                {user.plan === 'free' && (
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
