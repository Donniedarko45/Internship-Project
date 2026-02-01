import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { ApiError } from '../lib/api';
import { ButtonSpinner } from '../components/LoadingSpinner';
import { config } from '../config';

type Role = 'student' | 'employer' | 'institute';

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: Role;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated, role: currentRole } = useAuth();
  const toast = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      navigate(`/${currentRole}`);
    }
  }, [isAuthenticated, currentRole, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      await login(response.data.access_token, response.data.role);
      
      toast.success('Login successful!');
      
      // Navigate based on role
      const redirectPath = `/${response.data.role}`;
      navigate(redirectPath);
      
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{config.app.name}</h1>
          <p className="text-slate-600 mt-1">Campus-to-Career Ecosystem</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-lg space-y-6"
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-600 mt-1">Sign in to your account</p>
          </div>

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

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                placeholder:text-slate-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm 
                focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent
                placeholder:text-slate-400"
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-slate-900 hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
