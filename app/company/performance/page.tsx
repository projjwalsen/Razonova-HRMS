'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Star,
  Target,
  MessageSquare,
  BookOpen,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'goals' | 'feedback'>('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.performance-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const performanceMetrics = [
    { label: 'Current Rating', value: '4.2/5.0', change: '+0.3', icon: Star },
    { label: 'Goals Completed', value: '8/10', change: '80%', icon: Target },
    { label: 'Feedback Received', value: '12', change: 'This quarter', icon: MessageSquare },
    { label: 'Training Hours', value: '24', change: 'This year', icon: BookOpen },
  ];

  const myGoals = [
    {
      id: 1,
      title: 'Complete Leadership Training',
      category: 'Professional Development',
      dueDate: '2024-04-30',
      progress: 75,
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Improve Team Productivity by 20%',
      category: 'Team Management',
      dueDate: '2024-06-30',
      progress: 45,
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Certify in Advanced HR Management',
      category: 'Certification',
      dueDate: '2024-03-31',
      progress: 100,
      status: 'Completed',
    },
  ];

  const upcomingReviews = [
    {
      id: 1,
      employee: 'Jane Smith',
      type: 'Quarterly Review',
      date: '2024-03-25',
      status: 'Scheduled',
    },
    {
      id: 2,
      employee: 'Mike Johnson',
      type: 'Monthly Check-in',
      date: '2024-03-28',
      status: 'Scheduled',
    },
  ];

  const feedbackReceived = [
    {
      id: 1,
      from: 'Sarah Johnson',
      position: 'Department Head',
      date: '2024-03-10',
      rating: 5,
      comment: 'Excellent leadership and team management skills. Great progress on Q1 goals.',
    },
    {
      id: 2,
      from: 'Team Members',
      position: 'Peers',
      date: '2024-03-05',
      rating: 4,
      comment: 'Good communication and support. Could improve on delegation.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 performance-item">
          <h1 className="text-3xl font-bold font-['Montserrat']">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track goals, reviews, and professional development</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 performance-item">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0445AD] rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{metric.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1 font-['Montserrat']">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6 performance-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'overview' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              My Performance
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'reviews' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'goals' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'feedback' ? 'text-[#0445AD] border-b-2 border-black' : 'text-gray-500 hover:text-[#0445AD]'
              }`}
            >
              Feedback
            </button>
          </div>
        </div>

        {/* My Performance */}
        {activeTab === 'overview' && (
          <div className="performance-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Feedback */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Recent Feedback</h3>
                <div className="space-y-4">
                  {feedbackReceived.slice(0, 2).map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{feedback.from}</p>
                          <p className="text-sm text-gray-500">{feedback.position}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{feedback.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Reviews */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Upcoming Reviews</h3>
                <div className="space-y-3">
                  {upcomingReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{review.employee}</p>
                        <p className="text-sm text-gray-600">{review.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{review.date}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goals */}
        {activeTab === 'goals' && (
          <div className="performance-item">
            <div className="mb-4 flex justify-end">
              <button className="px-6 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800">
                + Add New Goal
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myGoals.map((goal) => (
                <div key={goal.id} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 font-['Montserrat']">{goal.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{goal.category}</p>
                      <p className="text-sm text-gray-500">Due: {goal.dueDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0445AD] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-[#0445AD] hover:underline">
                    Update Progress
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {activeTab === 'feedback' && (
          <div className="performance-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Feedback */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Request Feedback</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Employee</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black">
                      <option>Select an employee</option>
                      <option>Jane Smith</option>
                      <option>Mike Johnson</option>
                      <option>Sarah Williams</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                      placeholder="Request specific feedback..."
                    />
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800">
                    Send Request
                  </button>
                </form>
              </div>

              {/* Feedback History */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Feedback History</h3>
                <div className="space-y-4">
                  {feedbackReceived.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{feedback.from}</p>
                          <p className="text-sm text-gray-500">{feedback.position}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{feedback.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="performance-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Performance Reviews</h3>
              <div className="space-y-4">
                {['2024 Q1 Review', '2023 Q4 Review', '2023 Q3 Review'].map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{review}</p>
                      <p className="text-sm text-gray-600">Completed on {index === 0 ? 'March 15, 2024' : index === 1 ? 'December 20, 2023' : 'September 18, 2023'}</p>
                    </div>
                    <button className="px-4 py-2 bg-[#0445AD] text-white rounded-lg text-sm font-semibold hover:bg-gray-800">
                      View Details
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
