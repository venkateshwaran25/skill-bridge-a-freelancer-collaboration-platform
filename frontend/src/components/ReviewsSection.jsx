import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Star, MessageSquare, Plus, Send } from 'lucide-react';

const ReviewsSection = ({ targetUserId, userId, workplaceId, isOwnProfile }) => {
  const effectiveUserId = targetUserId || userId;

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    if (effectiveUserId) {
      fetchReviews();
    }
  }, [effectiveUserId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/reviews/user/${effectiveUserId}`);
      if (response.data.reviews) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating || 5.0);
        setTotalReviews(response.data.totalReviews || response.data.reviews.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/reviews', {
        toUserId: effectiveUserId,
        workplaceId,
        ...formData,
        reviewerType: 'client',
      });
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center shrink-0">
            <span className="text-2xl font-extrabold text-amber-600 block">{averageRating.toFixed(1)}</span>
            <div className="flex justify-center text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(averageRating) ? "fill-amber-400" : "text-slate-300"}`} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Client Reviews & Rating</h3>
            <p className="text-xs text-slate-500">{totalReviews} verified project reviews</p>
          </div>
        </div>

        {!isOwnProfile && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-saas-primary text-xs py-2 px-4 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmitReview} className="saas-card p-5 space-y-3 bg-slate-50 border-slate-200">
          <h4 className="text-xs font-bold text-slate-900">Leave a Verified Review</h4>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 border-none bg-transparent cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= formData.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Review Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Excellent communication and milestone delivery"
              className="form-control-custom w-full text-xs"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Detailed Feedback</label>
            <textarea
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share details about project execution..."
              className="form-control-custom w-full text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-saas-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary text-xs py-1.5 px-4">
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="saas-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-xs">
                  {rev.reviewer?.name?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.reviewer?.name || "Client"}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? "fill-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
            </div>

            {rev.title && <h5 className="text-xs font-bold text-slate-800 pt-1">{rev.title}</h5>}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
