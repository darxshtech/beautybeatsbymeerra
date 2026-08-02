const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beautybeatsbymeerra-bdk7.onrender.com/api';

/**
 * Enhanced fetch wrapper for API calls with Auth
 */
export async function apiRequest(endpoint: string, options: any = {}) {
  const { method = 'GET', body = null } = options;
  const token = typeof window !== 'undefined' ? localStorage.getItem('bb_token') : null;
  const branch = typeof window !== 'undefined' ? localStorage.getItem('bb_admin_branch') || 'SALON' : 'SALON';

  const headers = {
    'Content-Type': 'application/json',
    'x-branch': branch,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Server error occurred');
  }

  return response.json();
}
