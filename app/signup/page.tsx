'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  fields: string[];
}

const roles: RoleConfig[] = [
  {
    id: 'company_admin',
    name: 'Company Admin',
    description: 'Manage HR operations, payroll, attendance, and generate reports within your organization',
    fields: ['firstName', 'lastName', 'email', 'company', 'phone', 'employeeId', 'department'],
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Oversee team members, approve leave requests, and conduct performance evaluations',
    fields: ['firstName', 'lastName', 'email', 'company', 'phone', 'employeeId', 'department', 'teamSize'],
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Access self-service portal to view profile, mark attendance, apply for leave, and track performance',
    fields: ['firstName', 'lastName', 'email', 'company', 'phone', 'employeeId', 'department', 'manager'],
  },
];

export default function SignupPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',

    // Role specific
    employeeId: '',
    department: '',
    manager: '',
    teamSize: '',

    // Common
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });



  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Signup Data:', { ...formData, role: selectedRole });
    alert(`Account created successfully as ${roles.find(r => r.id === selectedRole)?.name}!`);
    router.push('/login');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl">
            <div ref={formRef} className="signup-form">
              {/* Header */}
              <div className="text-center mb-12">
                <Link href="/" className="inline-flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl font-['Montserrat']">H</span>
                  </div>
                  <span className="text-2xl font-bold font-['Montserrat']">
                    HRMS
                  </span>
                </Link>
                <h1 className="text-4xl font-bold mb-4 font-['Montserrat']">
                  Create Your Account
                </h1>
                <p className="text-gray-600">
                  Choose your role and fill in the required information
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Role Selection */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <h2 className="text-xl font-bold mb-4 font-['Montserrat']">Select Your Role</h2>
                    <div className="space-y-3">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                            selectedRole === role.id
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-900 border-gray-200 hover:border-black'
                          }`}
                        >
                          <div className="font-bold mb-1">{role.name}</div>
                          <div className={`text-sm ${selectedRole === role.id ? 'text-gray-300' : 'text-gray-600'}`}>
                            {role.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signup Form */}
                <div className="lg:col-span-2">
                  <div className="p-8 bg-white border-2 border-gray-100 rounded-2xl">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2 font-['Montserrat']">
                        Create {currentRole?.name} Account
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Fill in the required information for your {currentRole?.name.toLowerCase()} account
                      </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                      {/* Common Fields - All Roles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="John"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                          placeholder="you@company.com"
                          required
                        />
                      </div>

                      {/* Company Name - All roles */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                          placeholder="Your Company"
                          required
                        />
                      </div>

                      {/* Phone - All roles */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                          placeholder="+1 (234) 567-890"
                          required
                        />
                      </div>

                      {/* Employee ID - All roles */}
                      {(selectedRole === 'company_admin' || selectedRole === 'manager' || selectedRole === 'employee') && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Employee ID *
                          </label>
                          <input
                            type="text"
                            value={formData.employeeId}
                            onChange={(e) => handleInputChange('employeeId', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="EMP001"
                            required
                          />
                        </div>
                      )}

                      {/* Department - All roles */}
                      {(selectedRole === 'company_admin' || selectedRole === 'manager' || selectedRole === 'employee') && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Department *
                          </label>
                          <select
                            value={formData.department}
                            onChange={(e) => handleInputChange('department', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="engineering">Engineering</option>
                            <option value="marketing">Marketing</option>
                            <option value="hr">Human Resources</option>
                            <option value="finance">Finance</option>
                            <option value="sales">Sales</option>
                            <option value="operations">Operations</option>
                          </select>
                        </div>
                      )}

                      {/* Manager - Employee only */}
                      {selectedRole === 'employee' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Manager *
                          </label>
                          <input
                            type="text"
                            value={formData.manager}
                            onChange={(e) => handleInputChange('manager', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="Manager Name"
                            required
                          />
                        </div>
                      )}

                      {/* Team Size - Manager only */}
                      {selectedRole === 'manager' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Team Size *
                          </label>
                          <input
                            type="number"
                            value={formData.teamSize}
                            onChange={(e) => handleInputChange('teamSize', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="Number of team members"
                            required
                          />
                        </div>
                      )}

                      {/* Manager - Employee only */}
                      {selectedRole === 'employee' && (
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Manager Name *
                          </label>
                          <input
                            type="text"
                            value={formData.manager}
                            onChange={(e) => handleInputChange('manager', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                            placeholder="Your manager's name"
                            required
                          />
                        </div>
                      )}

                      {/* Password - All roles */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                          placeholder="••••••••"
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                          placeholder="••••••••"
                          required
                          minLength={8}
                        />
                      </div>

                      {/* Terms and Conditions */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.agreeToTerms}
                          onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                          className="mt-1 w-4 h-4 accent-black"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{' '}
                          <a href="/terms" className="text-black underline hover:underline">
                            Terms of Service
                          </a>
                          {' '}and{' '}
                          <a href="/privacy" className="text-black underline hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      {/* Marketing Consent */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="marketing"
                          className="mt-1 w-4 h-4 accent-black"
                        />
                        <label htmlFor="marketing" className="text-sm text-gray-600">
                          I'd like to receive product updates and marketing communications
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full px-8 py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-all duration-300"
                      >
                        Create {currentRole?.name} Account
                      </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-black hover:underline">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">ℹ️</span>
                      <div>
                        <p className="font-bold text-sm mb-1">Role Information</p>
                        <p className="text-sm text-gray-600">
                          {currentRole?.description}. Different roles have different access levels and permissions within the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
