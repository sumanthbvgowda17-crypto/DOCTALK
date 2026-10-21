import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { GlassCard } from '../components/common/GlassCard';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import {
  MessageSquareHeart,
  Star,
  Send,
  Trash2,
  Search,
  ShieldCheck
} from 'lucide-react';
import type { FeedbackEntry } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const FeedbackPage: React.FC = () => {
  const { feedback, addFeedback, deleteFeedback, profile } = useDemo();

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackEntry['category']>('Connectivity Experience');
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Deletion Dialog State
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const categories: FeedbackEntry['category'][] = [
    'Ease of Use',
    'Connectivity Experience',
    'Language Support',
    'Consultation Flow',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please enter a brief comment before submitting.');
      return;
    }

    const newEntry: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      rating,
      category,
      comment: comment.trim(),
      isAnonymous,
      userName: isAnonymous ? undefined : profile.name,
      createdAt: new Date().toISOString()
    };

    addFeedback(newEntry);
    setComment('');
    setRating(5);
  };

  // Calculations
  const totalCount = feedback.length;
  const avgRating = totalCount > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  // Distribution Data
  const ratingDistribution = [
    { stars: '5 Stars', count: feedback.filter(f => f.rating === 5).length, color: '#10b981' },
    { stars: '4 Stars', count: feedback.filter(f => f.rating === 4).length, color: '#06b6d4' },
    { stars: '3 Stars', count: feedback.filter(f => f.rating === 3).length, color: '#f59e0b' },
    { stars: '2 Stars', count: feedback.filter(f => f.rating === 2).length, color: '#f97316' },
    { stars: '1 Star', count: feedback.filter(f => f.rating === 1).length, color: '#ef4444' },
  ];

  const filteredList = feedback.filter(f => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.comment.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.userName && f.userName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquareHeart className="w-4 h-4" />
            <span>Reliability & Experience Hub</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            User Feedback & Network Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collecting rural patient reviews, network degradation experiences, and vernacular suggestions.
          </p>
        </div>
      </div>

      {/* Top Summary & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Summary Card (4 cols) */}
        <GlassCard className="p-6 lg:col-span-4 flex flex-col justify-between border-cyan-200/80 dark:border-cyan-800/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Overall Patient Rating
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
                {avgRating}
              </span>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1 my-3 text-amber-400">
              {[1, 2, 3, 4, 5].map(st => (
                <Star
                  key={st}
                  className={`w-5 h-5 ${st <= Math.round(Number(avgRating)) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on {totalCount} verified demonstration feedbacks stored in local storage.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>98.2% positive sentiment on zero-drop audio transition</span>
          </div>
        </GlassCard>

        {/* Rating Distribution Chart (8 cols) */}
        <GlassCard className="p-6 lg:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Rating Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of user satisfaction across all categories
              </p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="stars" stroke="#94a3b8" fontSize={11} tickLine={false} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`fb-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Feedback Form + Recent Reviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Submit Feedback Form */}
        <GlassCard className="p-6 lg:col-span-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              Share Your Experience
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How did the consultation and network fallback perform for you?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Overall Satisfaction Rating:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Category:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Feedback:
                </label>
                <span className="text-[10px] text-slate-400">
                  {comment.length} / 400
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={400}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe your audio clarity, language intake, or how well the offline sync worked..."
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 leading-relaxed"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
              />
              <label htmlFor="anon" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                Submit as Anonymous Demo Review
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Demo Feedback</span>
            </button>
          </form>
        </GlassCard>

        {/* Right Column (7 cols): Feedback History & Search */}
        <GlassCard className="p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Recent User Reviews ({filteredList.length})
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search reviews..."
                    className="pl-8 pr-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-36 sm:w-44"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="py-1 px-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No feedback reviews match your filter.
                </div>
              ) : (
                filteredList.map(entry => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              className={`w-3.5 h-3.5 ${st <= entry.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                          {entry.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => setEntryToDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      "{entry.comment}"
                    </p>

                    <div className="text-[11px] text-slate-400 font-medium">
                      By {entry.userName || 'Anonymous Patient Demo'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={!!entryToDelete}
        title="Delete Feedback Entry?"
        message="Are you sure you want to remove this feedback review from your local demo storage?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={() => {
          if (entryToDelete) {
            deleteFeedback(entryToDelete);
            setEntryToDelete(null);
          }
        }}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
};
