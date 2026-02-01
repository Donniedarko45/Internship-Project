import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { ApiError } from '../lib/api';
import { PageLoader, ButtonSpinner } from '../components/LoadingSpinner';

// Types
interface Internship {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  location: string;
  mode: string;
  duration_weeks: number;
}

interface Application {
  id: number;
  student_id: number;
  internship_id: number;
  status: string;
  applied_at: string;
}

interface InternshipForm {
  title: string;
  description: string;
  location: string;
  mode: string;
  duration_weeks: number;
}

const initialForm: InternshipForm = {
  title: '',
  description: '',
  location: '',
  mode: 'remote',
  duration_weeks: 8,
};

export function EmployerDashboard() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  // State
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Record<number, Application[]>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InternshipForm>(initialForm);
  
  // Selected internship for viewing applications
  const [selectedInternship, setSelectedInternship] = useState<number | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<Internship[]>('/employers/my-internships');
        setInternships(response.data);
        
        // Fetch applications for each internship
        const appsMap: Record<number, Application[]> = {};
        for (const internship of response.data) {
          try {
            const appsRes = await api.get<Application[]>(`/employers/internships/${internship.id}/applications`);
            appsMap[internship.id] = appsRes.data;
          } catch {
            appsMap[internship.id] = [];
          }
        }
        setApplications(appsMap);
      } catch (err) {
        const error = err as ApiError;
        toast.error(error.message || 'Failed to load internships');
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'duration_weeks' ? parseInt(value) || 0 : value,
    }));
  };

  // Create internship
  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!form.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setPosting(true);
    try {
      const response = await api.post<Internship>('/employers/internships', form);
      setInternships(prev => [response.data, ...prev]);
      setApplications(prev => ({ ...prev, [response.data.id]: [] }));
      setForm(initialForm);
      setShowForm(false);
      toast.success('Internship posted successfully!');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to post internship');
    } finally {
      setPosting(false);
    }
  };

  // Update application status
  const handleUpdateStatus = async (applicationId: number, status: string, internshipId: number) => {
    setUpdatingId(applicationId);
    try {
      await api.put(`/employers/applications/${applicationId}/status`, { status });
      
      // Update local state
      setApplications(prev => ({
        ...prev,
        [internshipId]: prev[internshipId].map(app =>
          app.id === applicationId ? { ...app, status } : app
        ),
      }));
      
      toast.success(`Application ${status}`);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (pageLoading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
          <p className="text-slate-600">Manage your internship postings and applications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 
            transition-colors font-medium"
        >
          + Post New Internship
        </button>
      </div>

      {/* Create Internship Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Post New Internship</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Bangalore"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                  <select
                    name="mode"
                    value={form.mode}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (weeks)</label>
                <input
                  type="number"
                  name="duration_weeks"
                  value={form.duration_weeks}
                  onChange={handleFormChange}
                  min="1"
                  max="52"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg
                    hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800
                    transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {posting && <ButtonSpinner />}
                  {posting ? 'Posting...' : 'Post Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internships List */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Your Internships ({internships.length})
        </h2>

        {internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">You haven't posted any internships yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Post your first internship
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {internships.map((internship) => {
              const apps = applications[internship.id] || [];
              const isExpanded = selectedInternship === internship.id;

              return (
                <div
                  key={internship.id}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Internship Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedInternship(isExpanded ? null : internship.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{internship.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">
                            {internship.mode}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">
                            {internship.location}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700">
                            {internship.duration_weeks} weeks
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700">
                          {apps.length} applicant{apps.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Applications List */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 p-4">
                      <h4 className="font-medium text-slate-700 mb-3">Applications</h4>
                      {apps.length === 0 ? (
                        <p className="text-sm text-slate-500">No applications yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {apps.map((app) => (
                            <div
                              key={app.id}
                              className="bg-white rounded-lg p-3 border border-slate-200 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium text-slate-900">Student #{app.student_id}</p>
                                <p className="text-xs text-slate-500">
                                  Applied {formatDate(app.applied_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize
                                    ${app.status === 'pending'
                                      ? 'bg-amber-50 text-amber-700'
                                      : app.status === 'accepted'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : app.status === 'shortlisted'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-red-50 text-red-700'
                                    }`}
                                >
                                  {app.status}
                                </span>
                                {app.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'shortlisted', internship.id)}
                                      disabled={updatingId === app.id}
                                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700
                                        disabled:opacity-50"
                                    >
                                      Shortlist
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'rejected', internship.id)}
                                      disabled={updatingId === app.id}
                                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700
                                        disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {app.status === 'shortlisted' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'accepted', internship.id)}
                                    disabled={updatingId === app.id}
                                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700
                                      disabled:opacity-50"
                                  >
                                    Accept
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default EmployerDashboard;
