'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Bookmark,
  GraduationCap,
  Play,
  Clock,
  Users,
  Star,
  MessageSquare,
} from 'lucide-react';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'my-learning' | 'calendar' | 'feedback'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.training-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab]);

  const trainingStats = [
    { label: 'Courses Enrolled', value: '5', icon: BookOpen },
    { label: 'Completed', value: '3', icon: CheckCircle },
    { label: 'In Progress', value: '2', icon: Bookmark },
    { label: 'Certificates', value: '3', icon: GraduationCap },
  ];

  const availableCourses = [
    {
      id: 1,
      title: 'Leadership Excellence Program',
      category: 'Management',
      duration: '8 weeks',
      instructor: 'Sarah Johnson',
      enrolled: 45,
      rating: 4.8,
      status: 'Available',
    },
    {
      id: 2,
      title: 'Advanced HR Analytics',
      category: 'Technical',
      duration: '6 weeks',
      instructor: 'Mike Chen',
      enrolled: 32,
      rating: 4.6,
      status: 'Available',
    },
    {
      id: 3,
      title: 'Employee Relations Masterclass',
      category: 'HR',
      duration: '4 weeks',
      instructor: 'Lisa Anderson',
      enrolled: 28,
      rating: 4.7,
      status: 'Enrolled',
    },
  ];

  const myLearning = [
    {
      id: 1,
      title: 'Employee Relations Masterclass',
      progress: 65,
      totalModules: 8,
      completedModules: 5,
      nextDue: '2024-03-25',
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Communication Skills Workshop',
      progress: 100,
      totalModules: 6,
      completedModules: 6,
      completedOn: '2024-03-10',
      status: 'Completed',
    },
    {
      id: 3,
      title: 'Diversity & Inclusion Training',
      progress: 30,
      totalModules: 5,
      completedModules: 1,
      nextDue: '2024-03-28',
      status: 'In Progress',
    },
  ];

  const upcomingSessions = [
    { id: 1, title: 'Leadership Workshop - Module 3', date: '2024-03-25', time: '10:00 AM', location: 'Room 201' },
    { id: 2, title: 'HR Analytics Lab Session', date: '2024-03-26', time: '2:00 PM', location: 'Online' },
    { id: 3, title: 'Team Building Activities', date: '2024-03-28', time: '9:00 AM', location: 'Conference Hall' },
  ];

  const courseFeedbacks = [
    {
      id: 1,
      courseId: 1,
      courseName: 'Leadership Excellence Program',
      employeeName: 'John Doe',
      employeeAvatar: 'JD',
      rating: 5,
      comment: 'Excellent course! The instructor was very knowledgeable and the content was practical. Highly recommend for anyone in a leadership role.',
      date: '2024-03-15',
    },
    {
      id: 2,
      courseId: 2,
      courseName: 'Advanced HR Analytics',
      employeeName: 'Sarah Smith',
      employeeAvatar: 'SS',
      rating: 4,
      comment: 'Great introduction to HR analytics. The hands-on exercises were very helpful. Would have liked more advanced topics.',
      date: '2024-03-12',
    },
    {
      id: 3,
      courseId: 1,
      courseName: 'Leadership Excellence Program',
      employeeName: 'Mike Johnson',
      employeeAvatar: 'MJ',
      rating: 5,
      comment: 'Transformed my leadership style. The modules on conflict resolution were particularly valuable.',
      date: '2024-03-10',
    },
  ];

  const handleSubmitFeedback = () => {
    if (selectedCourse && rating > 0) {
      alert(`Feedback submitted! Rating: ${rating} stars`);
      setSelectedCourse(null);
      setRating(0);
      setFeedback('');
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Enrolled':
        return 'bg-purple-100 text-purple-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div ref={contentRef}>
        {/* Header */}
        <div className="mb-8 training-item">
          <h1 className="text-3xl font-bold font-['Montserrat']">Training & Development</h1>
          <p className="text-gray-600 mt-1">Enhance skills and advance your career</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 training-item">
          {trainingStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 font-['Montserrat']">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mb-6 training-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'courses' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Available Courses
            </button>
            <button
              onClick={() => setActiveTab('my-learning')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'my-learning' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              My Learning
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'calendar' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'feedback' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Feedback & Ratings
            </button>
          </div>
        </div>

        {/* Available Courses */}
        {activeTab === 'courses' && (
          <div className="training-item">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <div key={course.id} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-['Montserrat']">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.category}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-semibold">{course.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-semibold">⭐ {course.rating}</span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                    {course.status === 'Enrolled' ? 'Continue Learning' : 'Enroll Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Learning */}
        {activeTab === 'my-learning' && (
          <div className="training-item">
            <div className="space-y-6">
              {myLearning.map((course) => (
                <div key={course.id} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 font-['Montserrat']">{course.title}</h3>
                      <p className="text-sm text-gray-600">
                        {course.completedModules} of {course.totalModules} modules completed
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-black h-3 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {course.status === 'In Progress' ? `Next due: ${course.nextDue}` : `Completed: ${course.completedOn}`}
                    </span>
                    <button className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                      {course.status === 'In Progress' ? 'Continue' : 'Review'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        {activeTab === 'calendar' && (
          <div className="training-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold mb-4 font-['Montserrat']">Upcoming Sessions</h3>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl">
                        📅
                      </div>
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-sm text-gray-600">{session.date} at {session.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.location}</p>
                      <button className="text-sm text-black hover:underline mt-1">Join Session</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback & Ratings */}
        {activeTab === 'feedback' && (
          <div className="training-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit Feedback */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Submit Feedback
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Completed Course</label>
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="">Choose a course...</option>
                      <option value={1}>Leadership Excellence Program</option>
                      <option value={2}>Advanced HR Analytics</option>
                      <option value={3}>Employee Relations Masterclass</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {renderStars(rating, true)}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={5}
                      placeholder="Share your experience with this course. What did you learn? How can it be improved?"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    disabled={!selectedCourse || rating === 0}
                    className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>

              {/* Course Feedback Summary */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                <h3 className="text-xl font-bold font-['Montserrat'] mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Course Ratings Summary
                </h3>
                <div className="space-y-4">
                  {availableCourses.map((course) => {
                    const courseFeedback = courseFeedbacks.filter(f => f.courseId === course.id);
                    const avgRating = courseFeedback.length > 0
                      ? (courseFeedback.reduce((sum, f) => sum + f.rating, 0) / courseFeedback.length).toFixed(1)
                      : 'N/A';

                    return (
                      <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{course.title}</h4>
                            <p className="text-xs text-gray-500">{courseFeedback.length} reviews</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-500">{avgRating}</div>
                            {avgRating !== 'N/A' && renderStars(Number(avgRating))}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(Number(avgRating) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Feedback List */}
            <div className="mt-8 p-6 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-bold font-['Montserrat'] mb-6">Recent Feedback</h3>
              <div className="space-y-4">
                {courseFeedbacks.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">
                        {item.employeeAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{item.employeeName}</h4>
                            <p className="text-sm text-gray-600">{item.courseName}</p>
                          </div>
                          <div className="text-right">
                            {renderStars(item.rating)}
                            <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">"{item.comment}"</p>
                      </div>
                    </div>
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
