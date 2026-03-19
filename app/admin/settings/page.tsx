'use client';

import { useEffect, useRef, useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'roles' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.settings-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (234) 567-8901',
    department: 'Human Resources',
    position: 'HR Manager',
    employeeId: 'EMP001',
    manager: 'Sarah Johnson',
    bio: 'Experienced HR professional with expertise in talent management and employee relations.',
  });

  const [companySettings, setCompanySettings] = useState({
    name: 'TechCorp Inc.',
    industry: 'Technology',
    size: '500-1000',
    website: 'https://techcorp.com',
    country: 'United States',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    workWeekStart: 'Monday',
  });

  const roles = [
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access',
      users: 5,
      permissions: ['All'],
    },
    {
      id: 2,
      name: 'HR Manager',
      description: 'Manage employees, payroll, and leave',
      users: 8,
      permissions: ['Employee Management', 'Payroll', 'Leave Management', 'Reports'],
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Approve leave and view team performance',
      users: 15,
      permissions: ['Leave Approval', 'Team Performance', 'Team Attendance'],
    },
    {
      id: 4,
      name: 'Employee',
      description: 'Basic employee access',
      users: 472,
      permissions: ['My Profile', 'My Attendance', 'My Leave', 'My Payslips'],
    },
  ];

  const notificationSettings = {
    email: {
      leaveApproval: true,
      payslipGenerated: true,
      attendanceReminder: true,
      performanceReview: true,
    },
    push: {
      leaveApproval: true,
      attendanceReminder: false,
      meetingReminder: true,
    },
    sms: {
      leaveApproval: false,
      attendanceReminder: false,
      emergencyAlert: true,
    },
  };

  const handleSaveProfile = () => {
    alert('Profile saved successfully!');
    setIsEditing(false);
  };

  const handleSaveCompany = () => {
    alert('Company settings saved successfully!');
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 settings-item">
          <h1 className="text-3xl font-bold font-['Montserrat']">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and system settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 settings-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'profile' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'company' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Company Settings
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'roles' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'notifications' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="settings-item">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat']">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-3xl font-bold font-['Montserrat'] mx-auto mb-4">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <h3 className="text-xl font-bold font-['Montserrat']">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-gray-600 mb-4">{profile.position}</p>
                    <div className="flex justify-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{profile.employeeId}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 p-6 bg-white rounded-xl border-2 border-gray-100">
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">First Name</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Department</label>
                        <input
                          type="text"
                          value={profile.department}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Position</label>
                        <input
                          type="text"
                          value={profile.position}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    {isEditing && (
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                      >
                        Save Changes
                      </button>
                    )}
                  </form>

                  {/* Change Password Section */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-200">
                    <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Current Password</label>
                        <input type="password" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">New Password</label>
                        <input type="password" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                        <input type="password" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" />
                      </div>
                      <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Settings */}
        {activeTab === 'company' && (
          <div className="settings-item">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat']">Company Settings</h2>
              </div>

              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCompany(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Company Name</label>
                      <input
                        type="text"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Industry</label>
                      <select
                        value={companySettings.industry}
                        onChange={(e) => setCompanySettings({ ...companySettings, industry: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Company Size</label>
                      <select
                        value={companySettings.size}
                        onChange={(e) => setCompanySettings({ ...companySettings, size: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option>1-50</option>
                        <option>51-200</option>
                        <option>201-500</option>
                        <option>500-1000</option>
                        <option>1000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Website</label>
                      <input
                        type="url"
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Country</label>
                      <input
                        type="text"
                        value={companySettings.country}
                        onChange={(e) => setCompanySettings({ ...companySettings, country: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Timezone</label>
                      <select
                        value={companySettings.timezone}
                        onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option>America/New_York</option>
                        <option>America/Los_Angeles</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                        <option>Australia/Sydney</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Currency</label>
                      <select
                        value={companySettings.currency}
                        onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>JPY</option>
                        <option>AUD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Date Format</label>
                      <select
                        value={companySettings.dateFormat}
                        onChange={(e) => setCompanySettings({ ...companySettings, dateFormat: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions */}
        {activeTab === 'roles' && (
          <div className="settings-item">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-['Montserrat']">Roles & Permissions</h2>
              <button className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                + Add Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold font-['Montserrat']">{role.name}</h3>
                    <button className="text-sm font-semibold text-black hover:underline">Edit</button>
                  </div>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Users: {role.users}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="settings-item">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat']">Notification Settings</h2>
                <button className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Email Notifications */}
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📧</span>
                    <h3 className="text-lg font-bold font-['Montserrat']">Email</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={value} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🔔</span>
                    <h3 className="text-lg font-bold font-['Montserrat']">Push Notifications</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={value} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📱</span>
                    <h3 className="text-lg font-bold font-['Montserrat']">SMS</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings.sms).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={value} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                        </label>
                      </div>
                    ))}
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
