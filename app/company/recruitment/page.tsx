'use client';

import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'interviews'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CSS animations - no blur
    const items = contentRef.current?.querySelectorAll('.recruitment-item');
    items?.forEach((item, index) => {
      (item as HTMLElement).style.animation = `fadeInSmooth 0.5s ease-out ${index * 0.1}s forwards`;
      (item as HTMLElement).style.opacity = '0';
    });
  }, [activeTab, showJobForm]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setCoverImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const recruitmentStats = [
    { label: 'Open Positions', value: '12', icon: '📋' },
    { label: 'Active Candidates', value: '48', icon: '👥' },
    { label: 'Interviews Scheduled', value: '8', icon: '📅' },
    { label: 'Offers Extended', value: '3', icon: '✉️' },
  ];

  const jobPostings = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'New York',
      type: 'Full-time',
      experience: '5+ years',
      salary: '$90,000 - $120,000',
      posted: '2024-03-10',
      applicants: 24,
      status: 'Active',
    },
    {
      id: 2,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      salary: '$70,000 - $90,000',
      posted: '2024-03-08',
      applicants: 18,
      status: 'Active',
    },
    {
      id: 3,
      title: 'HR Coordinator',
      department: 'Human Resources',
      location: 'San Francisco',
      type: 'Full-time',
      experience: '2+ years',
      salary: '$55,000 - $70,000',
      posted: '2024-03-05',
      applicants: 15,
      status: 'Active',
    },
  ];

  const candidates = [
    {
      id: 1,
      name: 'Alex Thompson',
      position: 'Senior Software Engineer',
      email: 'alex.t@email.com',
      phone: '+1 (234) 567-8901',
      experience: '6 years',
      appliedDate: '2024-03-12',
      stage: 'Interview',
      status: 'Shortlisted',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      position: 'Marketing Manager',
      email: 'maria.g@email.com',
      phone: '+1 (234) 567-8902',
      experience: '4 years',
      appliedDate: '2024-03-11',
      stage: 'Screening',
      status: 'In Review',
    },
    {
      id: 3,
      name: 'James Wilson',
      position: 'Senior Software Engineer',
      email: 'james.w@email.com',
      phone: '+1 (234) 567-8903',
      experience: '7 years',
      appliedDate: '2024-03-10',
      stage: 'Offer',
      status: 'Offer Extended',
    },
  ];

  const interviews = [
    {
      id: 1,
      candidate: 'Alex Thompson',
      position: 'Senior Software Engineer',
      date: '2024-03-25',
      time: '10:00 AM',
      interviewer: 'Sarah Johnson',
      type: 'Technical Round',
      status: 'Scheduled',
    },
    {
      id: 2,
      candidate: 'Maria Garcia',
      position: 'Marketing Manager',
      date: '2024-03-26',
      time: '2:00 PM',
      interviewer: 'Mike Johnson',
      type: 'HR Round',
      status: 'Scheduled',
    },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Screening':
        return 'bg-blue-100 text-blue-700';
      case 'Interview':
        return 'bg-purple-100 text-purple-700';
      case 'Offer':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AppLayout>
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 recruitment-item">
          <div>
            <h1 className="text-3xl font-bold font-['Montserrat']">Recruitment</h1>
            <p className="text-gray-600 mt-1">Manage job postings and candidates</p>
          </div>
          <button
            onClick={() => setShowJobForm(true)}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
          >
            + Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 recruitment-item">
          {recruitmentStats.map((stat, index) => (
            <div key={index} className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold mb-1 font-['Montserrat']">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Job Form */}
        {showJobForm && (
          <div className="mb-8 recruitment-item">
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Montserrat']">Post New Job</h2>
                <button
                  onClick={() => setShowJobForm(false)}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <form className="space-y-6">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Cover Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition-colors">
                    {coverImagePreview ? (
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCoverImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          id="coverImage"
                        />
                        <label
                          htmlFor="coverImage"
                          className="cursor-pointer inline-flex flex-col items-center"
                        >
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-600">Click to upload cover image</span>
                          <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Job Title *</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Department *</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" required>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Human Resources</option>
                      <option>Finance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Location *</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Employment Type *</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" required>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Experience *</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" placeholder="e.g., 2+ years" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Salary Range</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black" placeholder="e.g., $60,000 - $80,000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Job Description *</label>
                  <textarea rows={6} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none" required />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                    Post Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 recruitment-item">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'jobs' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'candidates' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'interviews' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Interviews
            </button>
          </div>
        </div>

        {/* Job Postings */}
        {activeTab === 'jobs' && (
          <div className="recruitment-item">
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <div key={job.id} className="p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-black transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold font-['Montserrat']">{job.title}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{job.status}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{job.department} • {job.location}</p>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{job.type}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{job.experience}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">{job.salary}</span>
                      </div>
                      <p className="text-sm text-gray-500">Posted on {job.posted} • {job.applicants} applicants</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800">
                        View Applicants
                      </button>
                      <button className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold hover:border-black">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidates */}
        {activeTab === 'candidates' && (
          <div className="recruitment-item">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Candidate</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Experience</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Applied</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Stage</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            <p className="text-xs text-gray-500">{candidate.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{candidate.position}</td>
                        <td className="py-3 px-4">{candidate.experience}</td>
                        <td className="py-3 px-4">{candidate.appliedDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(candidate.stage)}`}>
                            {candidate.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600">
                              View
                            </button>
                            <button className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600">
                              Schedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Interviews */}
        {activeTab === 'interviews' && (
          <div className="recruitment-item">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {interviews.map((interview) => (
                <div key={interview.id} className="p-6 bg-white rounded-xl border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold font-['Montserrat']">{interview.candidate}</h3>
                      <p className="text-sm text-gray-600">{interview.position}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {interview.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{interview.date} at {interview.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interviewer:</span>
                      <span className="font-medium">{interview.interviewer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Round:</span>
                      <span className="font-medium">{interview.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">
                      Join Interview
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold hover:border-black">
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
