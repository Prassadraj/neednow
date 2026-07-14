// src/app/request/[id]/page.js
'use client';

import React, { useState, use } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  ThumbsUp, 
  Send,
  Store,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function RequestDetails({ params }) {
  const { id } = use(params);
  const { 
    requests, 
    responses, 
    userLocation, 
    calculateDistance, 
    replyToRequest, 
    upvoteResponse, 
    markRequestSolved 
  } = useApp();
  
  const { user, loginWithGoogle, role } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [replyAsShop, setReplyAsShop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const request = requests.find(r => r.id === id);
  const requestResponses = responses.filter(res => res.requestId === id);

  if (!request) {
    return (
      <div className="text-center py-16">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Request not found</h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">This request might have been removed or doesn't exist.</p>
        <Link href="/" className="text-xs font-bold text-rose-500 hover:underline mt-4 inline-block">Go Back Home</Link>
      </div>
    );
  }

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    request.lat,
    request.lng
  );

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await replyToRequest(request.id, replyText, role === 'Shop Owner' && replyAsShop);
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50';
      case 'High':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50';
      default:
        return 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  // Format date to friendly relative format
  const getRelativeTime = (isoString) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const currentUserId = user?.uid || 'mock-user-123';

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900 transition-colors border border-zinc-100 dark:border-zinc-800"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="font-black text-lg text-zinc-900 dark:text-white leading-tight">Request Details</h2>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Response Panel</span>
        </div>
      </div>

      {/* Main Request Card details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={request.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={request.userName} 
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userName || 'User')}&background=random`;
              }}
            />
            <div className="text-left">
              <h4 className="text-xs font-extrabold text-zinc-850 dark:text-zinc-200">{request.userName}</h4>
              <span className="text-[10px] text-zinc-400 font-bold">Trust Score: 100/100</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getUrgencyStyles(request.urgency)}`}>
              {request.urgency}
            </span>
            {request.status === 'Solved' ? (
              <span className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle size={10} /> Solved
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Open
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
            Needed: {request.neededTimeline === 'Now' ? '🔥 Now' : '📅 Tomorrow'} ({request.category})
          </span>
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-snug">{request.title}</h3>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-2 leading-relaxed whitespace-pre-line">{request.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-rose-500" />
            <span>{request.area}</span>
            <span className="text-zinc-300 dark:text-zinc-700">({distance} km away)</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Posted {getRelativeTime(request.createdAt)}</span>
          </div>
        </div>

        {/* Mark solved button for owner */}
        {user && user.uid === request.userId && request.status !== 'Solved' && (
          <button 
            onClick={() => markRequestSolved(request.id)}
            className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-1"
          >
            <CheckCircle size={14} />
            Mark Request as Solved
          </button>
        )}
      </div>

      {/* Responses Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <MessageSquare size={16} />
          Responses ({requestResponses.length})
        </h3>

        <div className="space-y-3">
          {requestResponses.length === 0 ? (
            <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 py-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl">
              No replies yet. Be the first to help!
            </p>
          ) : (
            requestResponses.map(res => {
              const isUpvotedByMe = res.upvotedBy?.includes(currentUserId);
              return (
                <div 
                  key={res.id} 
                  className={`bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-sm space-y-3 transition-all ${
                    res.isShopOwner 
                      ? 'border-amber-500/20 bg-amber-500/[0.01]' 
                      : 'border-zinc-100 dark:border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={res.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt={res.userName} 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(res.userName || 'User')}&background=random`;
                        }}
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          {res.userName}
                          {res.isShopOwner && (
                            <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase">
                              <Store size={8} /> Shop Verified
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] text-zinc-400 block">{getRelativeTime(res.createdAt)}</span>
                      </div>
                    </div>

                    {/* Upvote button */}
                    <button 
                      onClick={() => upvoteResponse(res.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        isUpvotedByMe
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-400'
                      }`}
                    >
                      <ThumbsUp size={12} className={isUpvotedByMe ? 'fill-current' : ''} />
                      <span>{res.upvotes}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-755 dark:text-zinc-350 leading-relaxed font-medium">
                    {res.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply input form */}
      {user ? (
        <form onSubmit={handleReplySubmit} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-4 rounded-3xl shadow-md space-y-3">
          <textarea 
            rows={2.5}
            placeholder="Type your response or availability details..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium resize-none"
            required
            maxLength={200}
          />
          <div className="flex items-center justify-between">
            {role === 'Shop Owner' ? (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={replyAsShop}
                  onChange={e => setReplyAsShop(e.target.checked)}
                  className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-0.5">
                  <Store size={12} className="text-amber-500" />
                  Reply as Shop Owner
                </span>
              </label>
            ) : (
              <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-0.5">
                <Award size={10} className="text-amber-500" />
                Helped before? Build your karma points.
              </span>
            )}
            <button 
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="py-2 px-5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-2xl transition-all flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? 'Posting...' : (
                <>
                  <Send size={12} />
                  Reply
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-4">
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-3">Login to respond to this request</p>
          <button 
            onClick={loginWithGoogle}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-2xl transition-colors shadow-sm"
          >
            Login with Google
          </button>
        </div>
      )}
    </div>
  );
}
