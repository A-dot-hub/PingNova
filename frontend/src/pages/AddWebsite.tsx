import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMonitor } from "../context/MonitorContext";
import { Globe, Clock, Mail, ShieldCheck } from "lucide-react";

export default function AddWebsite() {
  const { addWebsite } = useMonitor();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: "",
    checkFrequency: 1,
    alertEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.url) {
      newErrors.url = "Website URL is required";
    } else if (
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.url,
      )
    ) {
      newErrors.url = "Please enter a valid URL (e.g., https://example.com)";
    }

    if (!formData.alertEmail) {
      newErrors.alertEmail = "Alert email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alertEmail)) {
      newErrors.alertEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate network request
      setTimeout(() => {
        addWebsite({
          url: formData.url.startsWith("http")
            ? formData.url
            : `https://${formData.url}`,
          checkFrequency: formData.checkFrequency,
          alertEmail: formData.alertEmail,
        });
        setIsSubmitting(false);
        navigate("/dashboard");
      }, 800);
    }
  };

  const handleReset = () => {
    setFormData({ url: "", checkFrequency: 1, alertEmail: "" });
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Monitor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure a new website to track its uptime and performance.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center text-primary">
            <ShieldCheck className="w-5 h-5 mr-2" />
            <h2 className="font-semibold text-gray-800">
              Monitor Configuration
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className={`block w-full pl-11 pr-4 py-3 border ${errors.url ? "border-danger focus:ring-danger/20" : "border-gray-200 focus:ring-primary/20"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:border-primary transition-all`}
                placeholder="https://yourwebsite.com"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>
            {errors.url && (
              <p className="mt-2 text-sm text-danger">{errors.url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Frequency
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 3, 5].map((freq) => (
                <div
                  key={freq}
                  className={`relative flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.checkFrequency === freq
                      ? "border-primary bg-blue-50 text-primary shadow-sm"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, checkFrequency: freq })
                  }
                >
                  <Clock
                    className={`w-4 h-4 mr-2 ${formData.checkFrequency === freq ? "text-primary" : "text-gray-400"}`}
                  />
                  <span className="font-medium text-sm">
                    Every {freq} min{freq > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className={`block w-full pl-11 pr-4 py-3 border ${errors.alertEmail ? "border-danger focus:ring-danger/20" : "border-gray-200 focus:ring-primary/20"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:border-primary transition-all`}
                placeholder="alerts@yourcompany.com"
                value={formData.alertEmail}
                onChange={(e) =>
                  setFormData({ ...formData, alertEmail: e.target.value })
                }
              />
            </div>
            {errors.alertEmail && (
              <p className="mt-2 text-sm text-danger">{errors.alertEmail}</p>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-100"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Website"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
