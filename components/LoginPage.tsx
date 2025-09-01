
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './common/Button';

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M24 9.5c3.13 0 5.9 1.08 7.97 3.02l6.07-6.07C34.37 2.66 29.56 0 24 0 14.2 0 6.13 5.4 2.5 13.04l7.35 5.7C11.53 12.9 17.15 9.5 24 9.5z"></path>
      <path fill="#34A853" d="M46.24 25.13c0-1.63-.15-3.2-.42-4.69H24v8.88h12.44c-.54 2.87-2.15 5.3-4.62 6.94l7.02 5.43c4.1-3.78 6.55-9.35 6.55-16.56z"></path>
      <path fill="#FBBC05" d="M9.85 28.74c-.5-1.48-.78-3.04-.78-4.69s.28-3.2.78-4.69l-7.35-5.7C1.15 16.5 0 20.1 0 24s1.15 7.5 2.5 10.34l7.35-5.6z"></path>
      <path fill="#EA4335" d="M24 48c5.56 0 10.37-1.84 13.84-4.93l-7.02-5.43c-1.84 1.24-4.2 1.95-6.82 1.95-6.85 0-12.47-3.4-14.15-8.22l-7.35 5.7C6.13 42.6 14.2 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        <h1 className="text-4xl font-extrabold text-white mb-2">AI Photo Editor Pro</h1>
        <p className="text-gray-400 mb-8">Unleash your creativity. Edit photos with the power of AI.</p>
        <Button onClick={signInWithGoogle} disabled={loading} size="lg" className="w-full justify-center">
            <GoogleIcon />
            {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
