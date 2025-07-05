import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        let errorMessage = 'Authentication failed';
        switch (error) {
          case 'oauth_error':
            errorMessage = 'Google authentication error occurred';
            break;
          case 'oauth_failed':
            errorMessage = 'Google authentication was cancelled or failed';
            break;
        }
        toast.error(errorMessage);
        navigate('/login');
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          await loginWithToken(token, user);
          toast.success('Successfully signed in with Google!');
          navigate('/dashboard');
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Failed to complete authentication');
          navigate('/login');
        }
      } else {
        toast.error('Invalid authentication response');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;