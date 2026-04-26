const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Enhanced fetch wrapper for API calls with Auth
 */
export async function apiRequest(endpoint: string, options: any = {}) {
  const { method = 'GET', body = null } = options;
  const token = typeof window !== 'undefined' ? localStorage.getItem('bb_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Server error occurred');
  }

  return response.json();
}
