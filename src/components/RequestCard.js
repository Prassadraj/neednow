// src/components/RequestCard.js
'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function RequestCard({ request }) {
  const { userLocation, calculateDistance, responses } = useApp();

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    request.lat,
    request.lng
  );

  const replyCount = responses.filter(r => r.requestId === request.id).length;

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-950/50';
      case 'High':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-950/50';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/30 dark:border-zinc-800/30';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'Water': return '💧';
      case 'Medicine': return '💊';
      case 'Electronics': return '🔌';
      case 'Emergency': return '🚨';
      case 'Grocery': return '🛒';
      default: return '📦';
    }
  };

  // Format date to a friendly relative format
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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      {/* Urgency Overlay for Emergency */}
      {request.urgency === 'Emergency' && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 animate-pulse" />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-base shrink-0">{getCategoryEmoji(request.category)}</span>
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {request.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getUrgencyStyles(request.urgency)}`}>
            {request.urgency}
          </span>
          {request.status === 'Solved' ? (
            <span className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-950/50 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <CheckCircle size={10} /> Solved
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-950/50 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Open
            </span>
          )}
        </div>
      </div>

      {/* Request Content */}
      <Link href={`/request/${request.id}`} className="block group">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors leading-snug mb-1">
          {request.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {request.description}
        </p>
      </Link>

      {/* Footer Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-50 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          {/* User profile pic */}
          <div className="flex items-center gap-1.5">
            <img 
              src={request.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={request.userName} 
              className="w-4 h-4 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userName || 'User')}&background=random`;
              }}
            />
            <span className="text-[10px] truncate max-w-[80px]">{request.userName}</span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-rose-500" />
            <span className="truncate max-w-[100px]">{request.area.split(',')[0]}</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-normal">({distance} km)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{getRelativeTime(request.createdAt)}</span>
          </div>
          <Link href={`/request/${request.id}`} className="flex items-center gap-1 text-rose-500 dark:text-rose-400 hover:opacity-80">
            <MessageSquare size={12} />
            <span>{replyCount} replies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
