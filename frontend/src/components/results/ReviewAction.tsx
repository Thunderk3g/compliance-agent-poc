import React, { useState } from 'react';
import { api } from '../../lib/api';

interface ReviewActionProps {
  submissionId: string;
  onReviewComplete: () => void;
}

export const ReviewAction: React.FC<ReviewActionProps> = ({ submissionId, onReviewComplete }) => {
  const [decision, setDecision] = useState<'approve' | 'reevaluate' | 'reject'>('approve');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await api.resumeSubmission(submissionId, decision, feedback);
      
      onReviewComplete();
    } catch (err: any) {
      console.error('Review failed:', err);
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-yellow-200 shadow-sm p-4 w-full flex flex-col md:flex-row items-start md:items-center gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 md:w-64 flex-shrink-0">
        <div className="p-2 bg-yellow-100 rounded-full">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Review Required</h3>
          <p className="text-xs text-gray-600">Approve to finalize.</p>
        </div>
      </div>

      <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
        <div className="flex gap-2 w-full md:w-auto">
            <label className={`cursor-pointer border rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors ${decision === 'approve' ? 'bg-green-50 border-green-500 text-green-700 font-medium' : 'hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="decision" 
                value="approve" 
                checked={decision === 'approve'} 
                onChange={() => setDecision('approve')}
                className="hidden"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </label>

            <label className={`cursor-pointer border rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors ${decision === 'reject' ? 'bg-red-50 border-red-500 text-red-700 font-medium' : 'hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="decision" 
                value="reject" 
                checked={decision === 'reject'} 
                onChange={() => setDecision('reject')}
                className="hidden"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </label>
        </div>

        <div className="w-full md:flex-1">
           <input
             type="text"
             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
             placeholder="Optional feedback..."
             value={feedback}
             onChange={(e) => setFeedback(e.target.value)}
           />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex-shrink-0 py-2 px-6 rounded-lg text-sm font-medium text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
            submitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
          }`}
        >
          {submitting ? 'Sending...' : 'Submit'}
        </button>
      </div>

      {error && (
         <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm border border-red-200">
            {error}
         </div>
      )}
    </div>
  );
};
