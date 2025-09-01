import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { checkRateLimitStatus } from '../lib/api';

interface RateLimitInfo {
  auth: { remaining: number; reset: number };
  payments: { remaining: number; reset: number };
  general: { remaining: number; reset: number };
}

const RateLimitMonitor: React.FC = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkRateLimits = async () => {
    try {
      const info = await checkRateLimitStatus();
      setRateLimitInfo(info);
      setLastCheck(new Date());
      
      // Show monitor if any limits are getting low
      if (info) {
        const isLow = info.auth.remaining < 10 || info.payments.remaining < 5 || info.general.remaining < 50;
        setIsVisible(isLow);
      }
    } catch (error) {
      console.error('Failed to check rate limits:', error);
    }
  };

  useEffect(() => {
    // Check on mount
    checkRateLimits();
    
    // Check every 5 minutes
    const interval = setInterval(checkRateLimits, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !rateLimitInfo) {
    return null;
  }

  const getStatusIcon = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage < 20) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (percentage < 50) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage < 20) return 'text-red-600';
    if (percentage < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">API Rate Limits</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Authentication:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(rateLimitInfo.auth.remaining, 50)}
            <span className={getStatusColor(rateLimitInfo.auth.remaining, 50)}>
              {rateLimitInfo.auth.remaining}/50
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Payments:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(rateLimitInfo.payments.remaining, 20)}
            <span className={getStatusColor(rateLimitInfo.payments.remaining, 20)}>
              {rateLimitInfo.payments.remaining}/20
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">General API:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon(rateLimitInfo.general.remaining, 300)}
            <span className={getStatusColor(rateLimitInfo.general.remaining, 300)}>
              {rateLimitInfo.general.remaining}/300
            </span>
          </div>
        </div>
      </div>
      
      {lastCheck && (
        <div className="mt-2 text-xs text-gray-500">
          Last updated: {lastCheck.toLocaleTimeString()}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        Limits reset every 15 minutes
      </div>
    </div>
  );
};

export default RateLimitMonitor;
