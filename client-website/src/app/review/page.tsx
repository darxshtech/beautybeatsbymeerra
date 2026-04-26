"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = searchParams.get('appId');
  
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId) { setError('Invalid review link. No appointment ID found.'); return; }
    if (rating === 0) { setError('Please select a star rating.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/feedback`, {
        appointment: appId,
        rating,
        comment
      });
      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-6">
        <div className="glass premium-shadow rounded-3xl p-12 max-w-md text-center">
          <div className="text-6xl mb-6">🌸</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Thank You!</h1>
          <p className="text-gray-500 mb-6">Your review has been submitted and will be reviewed by our team. We truly appreciate your feedback!</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-6">
      <div className="glass premium-shadow rounded-3xl p-10 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Rate Your Experience</h1>
          <p className="text-gray-500 text-sm">Your honest feedback helps us serve you better ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-all duration-200 transform hover:scale-110"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <svg
                  width="48" height="48" viewBox="0 0 24 24"
                  fill={star <= (hoveredStar || rating) ? '#FBBF24' : 'none'}
                  stroke={star <= (hoveredStar || rating) ? '#FBBF24' : '#D1D5DB'}
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-bold text-gray-400">
            {rating === 0 ? 'Tap a star to rate' : 
             rating <= 2 ? "We're sorry to hear that" : 
             rating === 3 ? 'Average experience' : 
             rating === 4 ? 'Great experience!' : 'We love to hear that! 🎉'}
          </p>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Your Feedback (Optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us what you loved or what we can improve..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none text-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReviewForm />
    </Suspense>
  );
}
