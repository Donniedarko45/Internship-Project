import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UnauthorizedPage() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this page.
            {role && (
              <span className="block mt-2 text-sm">
                Your role: <strong className="capitalize">{role}</strong>
              </span>
            )}
          </p>

          <div className="space-y-3">
            {isAuthenticated && role && (
              <Link
                to={`/${role}`}
                className="block w-full px-6 py-2.5 bg-slate-900 text-white rounded-lg 
                  hover:bg-slate-800 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            )}
            
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="block w-full px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg 
                  hover:bg-slate-50 transition-colors font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/"
                className="block w-full px-6 py-2.5 bg-slate-900 text-white rounded-lg 
                  hover:bg-slate-800 transition-colors font-medium"
              >
                Go to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default UnauthorizedPage;
