/**
 * ANTWRE — Fast Community Feedback & Bug Report Modal
 * Created & Developed by Nikhilesh H. Chavda
 */

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CommunityService, FeedbackType } from '../community/community_service';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
  defaultModelVersion?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'SIMULATION',
  defaultModelVersion = '1.0.0',
}) => {
  const [type, setType] = useState<FeedbackType>('FEATURE_REQUEST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setResult(null);

    const communityService = CommunityService.getInstance();
    const res = await communityService.submitFeedback({
      type,
      title,
      description,
      category: defaultCategory,
      modelVersion: defaultModelVersion,
    });

    setSubmitting(false);
    if (res.success) {
      setResult({ text: res.message, isError: false });
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setResult(null);
        onClose();
      }, 2000);
    } else {
      setResult({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111622] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d121a]">
          <div className="flex items-center gap-2 text-gray-100 font-semibold text-sm">
            <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
            Submit Feedback or Report Issue
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-gray-300 block mb-1 font-medium">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as FeedbackType)}
              className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="FEATURE_REQUEST">Feature Request / Task Idea</option>
              <option value="BUG">Bug Report / Simulation Loop</option>
              <option value="IDEA">Biological Simulation Idea</option>
              <option value="PERFORMANCE">Performance Observation</option>
              <option value="GENERAL">General Feedback</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Summary of feedback..."
              required
              maxLength={150}
              className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide specific details or biological observations..."
              required
              rows={4}
              maxLength={2000}
              className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                result.isError
                  ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              }`}
            >
              {result.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span>{result.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg font-medium shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
