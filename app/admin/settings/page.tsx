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
  Calendar,
  HandCoins,
  Clock,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'billing' | 'integrations' | 'company' | 'leave'>('general');
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
    <div className="w-full p-8">
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
            className="px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Settings className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'billing'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'integrations'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Database className="w-4 h-4" />
              Integrations
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'company'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'leave'
                  ? 'text-[#0445AD] border-b-2 border-black'
                  : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Leave Settings
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
                        : 'bg-[#0445AD] text-white hover:bg-gray-800'
                    }`}>
                      {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Settings */}
        {activeTab === 'company' && (
          <div className="settings-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Currency & Taxation */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <HandCoins className="w-5 h-5" />
                  Currency & Taxation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Default Currency</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="CNY">CNY - Chinese Yuan (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tax ID / EIN</label>
                    <input
                      type="text"
                      placeholder="Enter your tax identification number"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Income Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 25.5"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Social Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12.5"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Tax Exempt</p>
                      <p className="text-sm text-gray-500">Enable if organization is tax-exempt</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timezone & Schedule
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Company Timezone</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">America/New York (EST/EDT)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                      <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Working Hours</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Start Time</label>
                        <input
                          type="time"
                          defaultValue="09:00"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">End Time</label>
                        <input
                          type="time"
                          defaultValue="17:00"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            ['Sat', 'Sun'].includes(day)
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-[#0445AD] text-white'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Schedule Details */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100 lg:col-span-2">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Work Schedule Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Hours per Week</label>
                    <input
                      type="number"
                      defaultValue={40}
                      min="0"
                      max="60"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Overtime Threshold (hours/week)</label>
                    <input
                      type="number"
                      defaultValue={40}
                      min="0"
                      max="60"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Overtime Multiplier</label>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={1.5}
                      min="1"
                      max="3"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Settings */}
        {activeTab === 'leave' && (
          <div className="settings-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leave Types */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Leave Types Configuration
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Annual Leave', days: 20, color: 'blue' },
                    { name: 'Sick Leave', days: 10, color: 'red', attachment: true },
                    { name: 'Maternity Leave', days: 90, color: 'purple', attachment: true },
                    { name: 'Paternity Leave', days: 14, color: 'green' },
                    { name: 'Personal Leave', days: 5, color: 'yellow' },
                  ].map((leave, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${leave.color}-500`} />
                          <span className="font-semibold">{leave.name}</span>
                          {leave.attachment && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Attachment Required
                            </span>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-[#0445AD]">✕</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Days per Year</label>
                          <input
                            type="number"
                            defaultValue={leave.days}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Carry Forward Limit</label>
                          <input
                            type="number"
                            placeholder="Max days"
                            className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-[#0445AD] transition-all font-semibold">
                    + Add Leave Type
                  </button>
                </div>
              </div>

              {/* Leave Accrual & Workflow */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Accrual & Approval Workflow
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Leave Accrual Frequency</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Annually</option>
                      <option>Per Pay Period</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Accrual Start Date</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>From Joining Date</option>
                      <option>Start of Calendar Year</option>
                      <option>Start of Fiscal Year</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Pro-rated for New Joiners</p>
                      <p className="text-sm text-gray-500">Calculate leave based on months worked</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Negative Leave Balance</p>
                      <p className="text-sm text-gray-500">Allow employees to take leave in advance</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Approval Workflow</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>Single Manager Approval</option>
                      <option>Manager + HR Approval</option>
                      <option>Manager + HR + Finance Approval</option>
                      <option>Custom Workflow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Consecutive Days</label>
                    <input
                      type="number"
                      placeholder="Maximum leave days in a single request"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
