'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizationByTenant } from '@/store/actions/organizationActions';
import {
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Settings,
  Menu,
  X,
  Bell,
  FileText,
  BarChart3,
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { organization } = useAppSelector((state) => state.organization);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Check if organization exists
        await dispatch(fetchOrganizationByTenant());
      }
    };

    checkAccess();
  }, [dispatch, router]);

  useEffect(() => {
    if (!checking) return;

    // Once fetchOrganizationByTenant completes, check result
    if (organization === null && !checking) {
      router.push("/organization");
      return;
    }

    if (organization) {
      setChecking(false);
    }
  }, [organization, checking, router]);

  useEffect(() => {
    if (checking) return;
    // CSS animations - no blur
    const items = dashboardRef.current?.querySelectorAll('.dashboard-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0'; // Start hidden
    });
  }, [checking]);

  const stats = [
    {
      title: 'Total Employees',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Positions',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: Briefcase,
    },
    {
      title: 'Pending Reviews',
      value: '23',
      change: '-5%',
      trend: 'down',
      icon: FileText,
    },
    {
      title: 'Training Completion',
      value: '87%',
      change: '+3%',
      trend: 'up',
      icon: GraduationCap,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New employee onboarded',
      employee: 'Sarah Johnson',
      department: 'Marketing',
      time: '2 hours ago',
    },
    {
      id: 2,
      action: 'Performance review completed',
      employee: 'Michael Chen',
      department: 'Engineering',
      time: '4 hours ago',
    },
    {
      id: 3,
      action: 'Leave request approved',
      employee: 'Emily Rodriguez',
      department: 'Sales',
      time: '5 hours ago',
    },
    {
      id: 4,
      action: 'Training module completed',
      employee: 'David Thompson',
      department: 'Operations',
      time: '6 hours ago',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review Q1 performance reports',
      due: 'Today',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Conduct team 1-on-1 meetings',
      due: 'This week',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Update training materials',
      due: 'Next week',
      priority: 'low',
    },
    {
      id: 4,
      title: 'Prepare monthly HR dashboard',
      due: 'Next week',
      priority: 'medium',
    },
  ];

  const navigationItems = [
    { name: 'Dashboard', href: '/company', icon: LayoutDashboard, active: true },
    { name: 'Employees', href: '/company/employees', icon: Users, active: false },
    { name: 'Departments', href: '/company/departments', icon: Building, active: false },
    { name: 'Recruitment', href: '/company/recruitment', icon: Briefcase, active: false },
    { name: 'Performance', href: '/company/performance', icon: TrendingUp, active: false },
    { name: 'Training', href: '/company/training', icon: GraduationCap, active: false },
    { name: 'Payroll', href: '/company/payroll', icon: DollarSign, active: false },
    { name: 'Settings', href: '/company/settings', icon: Settings, active: false },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Show loading spinner while checking access
  if (checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a8f]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div ref={dashboardRef}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 dashboard-item">
                <div>
                  <h1 className="text-3xl font-bold font-['Montserrat']">Dashboard Overview</h1>
                  <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-white rounded-lg border-2 border-gray-200 hover:border-black transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
                  </button>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden px-4 py-2 bg-white border-2 border-gray-200 rounded-lg"
                  >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 dashboard-item">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="p-6 bg-white border-2 border-gray-100 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{stat.change}</span>
                      </div>
                      <div className="text-3xl font-bold mb-1 font-['Montserrat']">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="dashboard-item">
                  <h2 className="text-xl font-bold mb-4 font-['Montserrat']">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/company/employees"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <Users className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Manage Employees</h3>
                      <p className="text-xs text-gray-500">View and manage employee records</p>
                    </Link>

                    <Link
                      href="/company/recruitment"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <Briefcase className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Recruitment</h3>
                      <p className="text-xs text-gray-500">Manage job postings and applications</p>
                    </Link>

                    <Link
                      href="/company/payroll"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <DollarSign className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Payroll</h3>
                      <p className="text-xs text-gray-500">Process payroll and payslips</p>
                    </Link>

                    <Link
                      href="/company/company/reports"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <BarChart3 className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Reports</h3>
                      <p className="text-xs text-gray-500">Generate detailed reports</p>
                    </Link>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-1 dashboard-item">
                  <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                    <h2 className="text-xl font-bold mb-6 font-['Montserrat']">Recent Activity</h2>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-[#0445AD] rounded-full flex items-center justify-center text-white font-bold font-['Montserrat']">
                            {activity.employee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">
                              {activity.employee} • {activity.department}
                            </p>
                            <p className="text-xs text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="dashboard-item">
                  <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                    <h2 className="text-xl font-bold mb-6 font-['Montserrat']">Upcoming Tasks</h2>
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-gray-50 border-2 border-gray-100 rounded-lg hover:border-black transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{task.title}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">Due: {task.due}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
}
