/**
 * Development configuration helper
 * Handles missing API keys gracefully in development mode
 */

export const isDevelopment = process.env.NODE_ENV === 'development';

export const getApiKey = (keyName: string, fallback?: string): string => {
  const key = process.env[keyName];
  
  if (!key) {
    if (isDevelopment) {
      console.warn(`[DEV MODE] ${keyName} not found in environment variables. Using fallback.`);
      return fallback || 'dev-key-not-configured';
    } else {
      throw new Error(`${keyName} is required in production mode`);
    }
  }
  
  return key;
};

export const hasApiKey = (keyName: string): boolean => {
  const key = process.env[keyName];
  return !!key && key !== 'your_api_key_here';
};

export const mockApiResponse = (message: string, data?: any) => ({
  success: false,
  message: `[DEV MODE] ${message}`,
  data: data || null
});

export const checkRequiredServices = () => {
  const requiredServices = [
    'ELEVENLABS_API_KEY',
    'D_ID_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'MONGODB_URI'
  ];

  const missingServices = requiredServices.filter(service => !hasApiKey(service));

  if (missingServices.length > 0) {
    console.warn('⚠️  Missing API keys for services:', missingServices);
    
    if (isDevelopment) {
      console.warn('🔧 Running in development mode - services will use mock responses');
    } else {
      console.error('❌ Production mode requires all API keys to be configured');
      throw new Error(`Missing required API keys: ${missingServices.join(', ')}`);
    }
  }

  return {
    allConfigured: missingServices.length === 0,
    missingServices,
    isDevelopment
  };
};
