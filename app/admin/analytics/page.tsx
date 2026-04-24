'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  HandCoins,
  Activity,
  BarChart3,
  Calendar,
  Download,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.analytics-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [selectedPeriod]);

  const revenueData = [
    { month: 'Oct', revenue: 45000, companies: 120, users: 4500 },
    { month: 'Nov', revenue: 52000, companies: 135, users: 5200 },
    { month: 'Dec', revenue: 61000, companies: 142, users: 6100 },
    { month: 'Jan', revenue: 58000, companies: 148, users: 5800 },
    { month: 'Feb', revenue: 69000, companies: 152, users: 6900 },
    { month: 'Mar', revenue: 75000, companies: 156, users: 7500 },
  ];

  const topCompanies = [
    { name: 'Global Solutions', revenue: 15000, users: 456, growth: '+23%' },
    { name: 'Acme Corporation', revenue: 12500, users: 245, growth: '+15%' },
    { name: 'Digital Dynamics', revenue: 8900, users: 178, growth: '+12%' },
    { name: 'TechStart Inc', revenue: 5400, users: 89, growth: '+8%' },
    { name: 'Innovate Labs', revenue: 4200, users: 67, growth: '+18%' },
  ];

  const planDistribution = [
    { plan: 'Enterprise', companies: 45, revenue: 225000, percentage: 29 },
    { plan: 'Professional', companies: 78, revenue: 234000, percentage: 50 },
    { plan: 'Basic', companies: 33, revenue: 33000, percentage: 21 },
  ];

  const systemMetrics = [
    { label: 'Average Response Time', value: '1.2s', change: '-0.3s', trend: 'down' },
    { label: 'Server Uptime', value: '99.9%', change: '+0.1%', trend: 'up' },
    { label: 'Active Sessions', value: '2,654', change: '+12%', trend: 'up' },
    { label: 'Storage Used', value: '2.4TB', change: '5TB', trend: 'neutral' },
  ];

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 analytics-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">System Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive system performance metrics</p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="px-6 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold hover:border-black transition-all duration-300 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 analytics-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <HandCoins className="w-12 h-12 text-[#0445AD]" />
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">$284,700</div>
            <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
            <div className="text-xs text-green-600 font-semibold">+15.3% vs last period</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-12 h-12 text-[#0445AD]" />
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">156</div>
            <div className="text-sm text-gray-600 mb-2">Active Companies</div>
            <div className="text-xs text-green-600 font-semibold">+12 this month</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 text-[#0445AD]" />
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">12,847</div>
            <div className="text-sm text-gray-600 mb-2">Total Users</div>
            <div className="text-xs text-green-600 font-semibold">+843 this month</div>
          </div>
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-12 h-12 text-[#0445AD]" />
            </div>
            <div className="text-3xl font-bold mb-1 font-['Montserrat']">2,654</div>
            <div className="text-sm text-gray-600 mb-2">Active Sessions</div>
            <div className="text-xs text-green-600 font-semibold">Currently online</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="analytics-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Growth
              </h3>
              <div className="h-64 flex items-end justify-between gap-4 px-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-[#0445AD] rounded-t-lg transition-all duration-500 hover:bg-gray-800"
                      style={{ height: `${(data.revenue / 75000) * 100}%` }}
                    />
                    <div className="text-xs text-gray-600 mt-2 font-medium">{data.month}</div>
                    <div className="text-xs text-gray-500">${(data.revenue / 1000).toFixed(0)}k</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="analytics-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Plan Distribution
              </h3>
              <div className="space-y-4">
                {planDistribution.map((plan, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{plan.plan}</span>
                        <span className="text-sm text-gray-500">({plan.companies} companies)</span>
                      </div>
                      <span className="font-bold">${plan.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#0445AD] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${plan.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Companies */}
          <div className="analytics-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Top Performing Companies
              </h3>
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0445AD] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.users} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${company.revenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">{company.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="analytics-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                    <div className="text-2xl font-bold font-['Montserrat']">{metric.value}</div>
                    <div className={`text-xs mt-1 font-semibold ${
                      metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Growth */}
        <div className="analytics-item">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
            <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Growth Trajectory
            </h3>
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t-lg transition-all duration-500 hover:bg-blue-700"
                    style={{ height: `${(data.users / 7500) * 100}%` }}
                  />
                  <div className="text-xs text-gray-600 mt-2 font-medium">{data.month}</div>
                  <div className="text-xs text-gray-500">{data.users.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
