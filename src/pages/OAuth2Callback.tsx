import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * OAuth2 Callback Page
 * Handles the redirect from OAuth2 providers (Google, Microsoft)
 * Extracts tokens from URL and authenticates the user
 */
const OAuth2Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get tokens from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (token && refreshToken) {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          toast({
            title: 'Login Successful',
            description: 'You have been logged in successfully.',
          });

          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('No tokens received from OAuth provider');
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Failed to authenticate with OAuth provider',
          variant: 'destructive',
        });
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-foreground">Authenticating...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we complete your login
        </p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
