import { Link } from 'react-router-dom';
import { Activity, Shield, Zap, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">PingNova</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">Log in</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl">
            Never miss a minute of downtime.
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">
            PingNova monitors your websites, APIs, and servers 24/7. Get instant alerts via email or webhooks when things go wrong.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Start Monitoring for Free
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Global Checks</h3>
                <p className="text-slate-600">Monitor your endpoints from multiple locations around the world to ensure global availability.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Alerts</h3>
                <p className="text-slate-600">Get notified immediately via Email, Webhooks, Slack, or SMS the second your site goes down.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Detailed Analytics</h3>
                <p className="text-slate-600">Track response times, uptime percentages, and historical performance data with beautiful charts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Simple, transparent pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
              <h3 className="text-xl font-semibold text-slate-900">Free</h3>
              <p className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold">/mo</span>
              </p>
              <ul className="mt-6 space-y-4 flex-1">
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> 5 Monitors</li>
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> 5-minute checks</li>
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> Email alerts</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full bg-indigo-50 text-indigo-700 text-center px-4 py-2 rounded-md font-semibold hover:bg-indigo-100 transition">Get Started</Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-indigo-600 rounded-2xl shadow-xl border border-indigo-600 p-8 flex flex-col transform scale-105">
              <h3 className="text-xl font-semibold text-white">Pro</h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">$9</span>
                <span className="ml-1 text-xl font-semibold text-indigo-200">/mo</span>
              </p>
              <ul className="mt-6 space-y-4 flex-1">
                <li className="flex items-center text-indigo-100"><Zap className="h-5 w-5 text-indigo-300 mr-2" /> 50 Monitors</li>
                <li className="flex items-center text-indigo-100"><Zap className="h-5 w-5 text-indigo-300 mr-2" /> 1-minute checks</li>
                <li className="flex items-center text-indigo-100"><Zap className="h-5 w-5 text-indigo-300 mr-2" /> Email & Webhook alerts</li>
                <li className="flex items-center text-indigo-100"><Zap className="h-5 w-5 text-indigo-300 mr-2" /> 1 year history</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full bg-white text-indigo-600 text-center px-4 py-2 rounded-md font-semibold hover:bg-indigo-50 transition">Upgrade to Pro</Link>
            </div>

            {/* Business Tier */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
              <h3 className="text-xl font-semibold text-slate-900">Business</h3>
              <p className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">$29</span>
                <span className="ml-1 text-xl font-semibold">/mo</span>
              </p>
              <ul className="mt-6 space-y-4 flex-1">
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> 200 Monitors</li>
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> 30-second checks</li>
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> All alert integrations</li>
                <li className="flex items-center text-slate-600"><Zap className="h-5 w-5 text-indigo-500 mr-2" /> Priority support</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full bg-indigo-50 text-indigo-700 text-center px-4 py-2 rounded-md font-semibold hover:bg-indigo-100 transition">Contact Sales</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-indigo-400" />
            <span className="ml-2 text-lg font-bold text-white">PingNova</span>
          </div>
          <p className="text-slate-400">© 2026 PingNova Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
