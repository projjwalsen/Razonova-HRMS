'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizationByTenant } from '@/store/actions/organizationActions';
import { fetchCompanyDashboardKPIs } from '@/store/actions/adminActions';
import { fetchActiveHolidayCalendar } from '@/store/actions/leaveActions';
import {
  Users,
  Building,
  HandCoins,
  Menu,
  X,
  Bell,
  FileText,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { organization } = useAppSelector((state) => state.organization);
  const { companyDashboardKPIs, kpiLoading } = useAppSelector((state) => state.admin);
  const { activeHolidayCalendar } = useAppSelector((state) => state.leave);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgFetched, setOrgFetched] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        await dispatch(fetchOrganizationByTenant());
        setOrgFetched(true);
      }
    };

    checkAccess();
  }, [dispatch, router]);

  useEffect(() => {
    if (!orgFetched) return;

    if (organization === null) {
      router.push("/organization");
      return;
    }

    setChecking(false);
  }, [orgFetched, organization, router]);

  useEffect(() => {
    if (checking) return;
    dispatch(fetchCompanyDashboardKPIs());
    dispatch(fetchActiveHolidayCalendar());
  }, [checking, dispatch]);

  useEffect(() => {
    if (checking) return;
    const items = dashboardRef.current?.querySelectorAll('.dashboard-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [checking]);

  const upcomingHolidays = (activeHolidayCalendar?.holidays || []).filter(
    (h) => new Date(h.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                {kpiLoading || !companyDashboardKPIs ? (
                  <div className="col-span-4 flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0445AD]" />
                  </div>
                ) : (
                  <>
                    <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1 font-['Montserrat']">
                        {companyDashboardKPIs.totalEmployees ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Employees</div>
                    </div>

                    <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1 font-['Montserrat']">
                        {companyDashboardKPIs.totalDepartments ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">Departments</div>
                    </div>

                    <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1 font-['Montserrat']">
                        {companyDashboardKPIs.pendingApprovals?.total ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">Pending Approvals</div>
                    </div>

                    <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                          <CalendarDays className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1 font-['Montserrat']">
                        {companyDashboardKPIs.attendanceToday?.present ?? 0}
                      </div>
                      <div className="text-sm text-gray-600">Present Today</div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="dashboard-item">
                  <h2 className="text-xl font-bold mb-4 font-['Montserrat']">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/company/employees"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <Users className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Employees</h3>
                      <p className="text-xs text-gray-500">Manage employee records</p>
                    </Link>

                    <Link
                      href="/company/attendance"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <BarChart3 className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Attendance</h3>
                      <p className="text-xs text-gray-500">Track attendance</p>
                    </Link>

                    <Link
                      href="/company/payroll"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <HandCoins className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Payroll</h3>
                      <p className="text-xs text-gray-500">Process payroll</p>
                    </Link>

                    <Link
                      href="/company/leave"
                      className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                    >
                      <CalendarDays className="w-8 h-8 mb-3 text-gray-700" />
                      <h3 className="font-semibold mb-1">Leave</h3>
                      <p className="text-xs text-gray-500">Manage leave requests</p>
                    </Link>
                  </div>
                </div>

                {/* Upcoming Holidays */}
                <div className="dashboard-item">
                  <div className="p-6 bg-white border-2 border-gray-100 rounded-xl">
                    <h2 className="text-xl font-bold mb-6 font-['Montserrat']">Upcoming Holidays</h2>
                    {upcomingHolidays.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No upcoming holidays</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingHolidays.slice(0, 5).map((holiday) => (
                          <div
                            key={holiday.id}
                            className="p-4 bg-gray-50 border-2 border-gray-100 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-sm">{holiday.name}</h4>
                              {holiday.isOptional && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Optional</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(holiday.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
}
