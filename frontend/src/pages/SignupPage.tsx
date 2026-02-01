import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api, { ApiError } from '../lib/api';
import { ButtonSpinner } from '../components/LoadingSpinner';
import { config } from '../config';

type Role = 'student' | 'employer' | 'institute';

export function SignupPage() {
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  
  // Common fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Employer specific
  const [companyName, setCompanyName] = useState('');
  const [companyContact, setCompanyContact] = useState('');
  
  // Institute specific
  const [instituteName, setInstituteName] = useState('');
  const [aisheCode, setAisheCode] = useState('');
  const [instituteContact, setInstituteContact] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = (): boolean => {
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return false;
    }
    
    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return false;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    
    if (role === 'employer') {
      if (!companyName.trim()) {
        toast.error('Please enter your company name.');
        return false;
      }
      if (!companyContact.trim() || companyContact.length !== 10) {
        toast.error('Please enter a valid 10-digit contact number.');
        return false;
      }
    }
    
    if (role === 'institute') {
      if (!instituteName.trim()) {
        toast.error('Please enter your institute name.');
        return false;
      }
      if (!aisheCode.trim()) {
        toast.error('Please enter your AISHE code.');
        return false;
      }
      if (!instituteContact.trim() || instituteContact.length !== 10) {
        toast.error('Please enter a valid 10-digit contact number.');
        return false;
      }
    }
    
    return true;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      let endpoint = '/auth/signup';
      let payload: Record<string, string> = {
        email: email.trim(),
        full_name: fullName.trim(),
        password,
      };

      if (role === 'student') {
        endpoint = '/auth/signup';
        payload.role = 'student';
      } else if (role === 'employer') {
        endpoint = '/auth/signup/employer';
        payload.company_name = companyName.trim();
        payload.contact_number = companyContact.trim();
      } else if (role === 'institute') {
        endpoint = '/auth/signup/institute';
        payload.institute_name = instituteName.trim();
        payload.aishe_code = aisheCode.trim();
        payload.contact_number = instituteContact.trim();
      }

      await api.post(endpoint, payload);
      
      toast.success('Account created successfully! Please login.');
      navigate('/');
      
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{config.app.name}</h1>
          <p className="text-slate-600 mt-1">Create your account</p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-lg space-y-5"
        >
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              I am a
            </label>
            <div className="flex gap-2">
              {(['student', 'employer', 'institute'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`
                    flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all
                    ${role === r
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Employer Specific Fields */}
          {role === 'employer' && (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyContact" className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">
                    +91
                  </span>
                  <input
                    id="companyContact"
                    type="tel"
                    value={companyContact}
                    onChange={(e) => setCompanyContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full rounded-r-lg border border-slate-300 px-4 py-2.5 text-sm 
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Institute Specific Fields */}
          {role === 'institute' && (
            <>
              <div>
                <label htmlFor="instituteName" className="block text-sm font-medium text-slate-700 mb-1">
                  Institute Name
                </label>
                <input
                  id="instituteName"
                  type="text"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="ABC University"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="aisheCode" className="block text-sm font-medium text-slate-700 mb-1">
                  AISHE Code
                </label>
                <input
                  id="aisheCode"
                  type="text"
                  value={aisheCode}
                  onChange={(e) => setAisheCode(e.target.value.toUpperCase())}
                  placeholder="C-12345"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="instituteContact" className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-slate-300 rounded-l-lg bg-slate-50 text-slate-500 text-sm">
                    +91
                  </span>
                  <input
                    id="instituteContact"
                    type="tel"
                    value={instituteContact}
                    onChange={(e) => setInstituteContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full rounded-r-lg border border-slate-300 px-4 py-2.5 text-sm 
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white 
              hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default SignupPage;
