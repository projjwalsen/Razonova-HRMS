'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  CreditCard,
  Globe,
  Mail,
  Key,
  Save,
  CheckCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing' | 'integrations'>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.settings-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 settings-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure system-wide preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 settings-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'general'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'billing'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'integrations'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Database className="w-4 h-4" />
              Integrations
            </button>
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Information */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  System Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">System Name</label>
                    <input
                      type="text"
                      defaultValue="HRMS Enterprise"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">System URL</label>
                    <input
                      type="url"
                      defaultValue="https://hrms.enterprise.com"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@hrms.com"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Timezone</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                      <option>Asia/Kolkata</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Default Settings */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Default Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Default Language</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Default Currency</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date Format</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Temporarily disable access for maintenance</p>
                    </div>
                    <button className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-black transition-all">
                  Disabled
                </button>
                  </div>
                </div>
              </div>

              {/* Storage Limits */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100 lg:col-span-2">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Storage per Company</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>10 GB</option>
                      <option>25 GB</option>
                      <option>50 GB</option>
                      <option>100 GB</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max File Upload Size</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>5 MB</option>
                      <option>10 MB</option>
                      <option>25 MB</option>
                      <option>50 MB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Backup Retention</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Policy
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      defaultValue={8}
                      min="6"
                      max="16"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Require Uppercase Letters</p>
                      <p className="text-sm text-gray-500">At least one uppercase letter</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Require Numbers</p>
                      <p className="text-sm text-gray-500">At least one number</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Require Special Characters</p>
                      <p className="text-sm text-gray-500">At least one special character</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password Expiry (Days)</label>
                    <input
                      type="number"
                      defaultValue={90}
                      min="30"
                      max="365"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Session Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Session Timeout (Minutes)</label>
                    <input
                      type="number"
                      defaultValue={30}
                      min="5"
                      max="120"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Concurrent Sessions</label>
                    <input
                      type="number"
                      defaultValue={5}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for all admins</p>
                    </div>
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200">
                      Enabled
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">IP Whitelist</p>
                      <p className="text-sm text-gray-500">Restrict access by IP</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'New Company Registration', desc: 'When a new company registers' },
                  { label: 'Payment Received', desc: 'When payment is successfully processed' },
                  { label: 'System Alerts', desc: 'Critical system issues and errors' },
                  { label: 'User Activity', desc: 'Daily summary of user activities' },
                  { label: 'Storage Warnings', desc: 'When storage limit is reached' },
                  { label: 'Support Requests', desc: 'New support tickets from companies' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={index < 3} className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="settings-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Plans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { name: 'Basic', price: '$29', users: '25', features: ['Core HR Features', 'Email Support', '5GB Storage'] },
                  { name: 'Professional', price: '$79', users: '100', features: ['Advanced Analytics', 'Priority Support', '25GB Storage', 'API Access'] },
                  { name: 'Enterprise', price: '$199', users: 'Unlimited', features: ['Custom Integrations', '24/7 Support', 'Unlimited Storage', 'Dedicated Manager'] },
                ].map((plan, index) => (
                  <div key={index} className="p-6 border-2 border-gray-100 rounded-xl hover:border-black transition-all">
                    <h4 className="text-xl font-bold font-['Montserrat'] mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                    <div className="text-sm mb-4"><strong>{plan.users}</strong> users</div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <div className="settings-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Third-Party Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Stripe Payments', status: 'Connected', icon: '💳' },
                  { name: 'SendGrid Email', status: 'Connected', icon: '📧' },
                  { name: 'AWS S3 Storage', status: 'Connected', icon: '☁️' },
                  { name: 'Slack Notifications', status: 'Not Connected', icon: '💬' },
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <p className="font-semibold">{integration.name}</p>
                        <p className={`text-xs ${integration.status === 'Connected' ? 'text-green-600' : 'text-gray-500'}`}>
                          {integration.status}
                        </p>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      integration.status === 'Connected'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}>
                      {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
