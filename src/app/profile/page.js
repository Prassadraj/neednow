// src/app/profile/page.js
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { 
  Award, 
  MapPin, 
  Settings, 
  User, 
  ShieldCheck, 
  Flame, 
  Moon, 
  Zap, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function UserProfile() {
  const { user, loginWithGoogle, logout, role, toggleRole, loading, MAX_TOKENS } = useAuth();
  const { requests, calculateDistance, userLocation } = useApp();

  const userRequests = requests.filter(r => r.userId === user?.uid);
  const userPoints = user?.points || 0;

  // Define badges
  const BADGES = [
    { 
      id: 'local-hero', 
      name: 'Local Hero', 
      description: 'Helped the neighborhood by answering at least one request.', 
      reqPoints: 20, 
      icon: ShieldCheck, 
      color: 'from-blue-500 to-indigo-600' 
    },
    { 
      id: 'night-helper', 
      name: 'Night Helper', 
      description: 'Answered a request after 9:00 PM.', 
      reqPoints: 60, 
      icon: Moon, 
      color: 'from-purple-500 to-indigo-900' 
    },
    { 
      id: 'fast-responder', 
      name: 'Fast Responder', 
      description: 'Highly active user with fast replies and helpful upvotes.', 
      reqPoints: 120, 
      icon: Zap, 
      color: 'from-amber-500 to-rose-600' 
    }
  ];

  // Trigger celebration when user visits profile and has unlocked a new badge
  useEffect(() => {
    if (userPoints >= 20) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#EF4444', '#3B82F6']
      });
    }
  }, [userPoints]);

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-xs text-zinc-400">Loading profile data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <Award size={24} />
        </div>
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Profile Access Required</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sign in using Google to check your Trust Score, view active karma points, and unlock helper badges.
        </p>
        <button 
          onClick={loginWithGoogle}
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-sm rounded-2xl transition-colors shadow-md"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-500/10 to-rose-600/10 rounded-bl-full" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img 
            src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt={user.name} 
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-amber-500/10"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
            }}
          />
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{user.name}</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 text-[11px] font-extrabold uppercase tracking-wide">
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-500/25">
                <Flame size={12} /> {userPoints} karma points
              </span>
              <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border border-green-500/25">
                <Award size={12} /> Trust Score: {user.trustScore || 100}
              </span>
            </div>

            {/* Energy Token Bar */}
            {(() => {
              const tokens = user?.tokens ?? MAX_TOKENS;
              const pct = (tokens / MAX_TOKENS) * 100;
              const color = tokens === 0 ? 'bg-rose-500' : tokens <= 2 ? 'bg-amber-500' : 'bg-emerald-500';
              const textColor = tokens === 0 ? 'text-rose-600 dark:text-rose-400' : tokens <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
              return (
                <div className="mt-3 w-full max-w-[260px]">
                  <div className={`flex items-center justify-between text-[10px] font-extrabold mb-1.5 ${textColor}`}>
                    <span className="flex items-center gap-1"><Zap size={11} /> Need Energy</span>
                    <span>{tokens}/{MAX_TOKENS}</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {Array.from({ length: MAX_TOKENS }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] transition-all ${
                          i < tokens
                            ? `${color} text-white shadow-sm`
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        ⚡
                      </div>
                    ))}
                  </div>
                  {tokens === 0 && (
                    <p className="text-[9px] text-rose-500/80 mt-1.5 font-medium">
                      Close a request or help others to earn tokens back.
                    </p>
                  )}
                  {user?.helpStreak > 0 && (
                    <p className="text-[9px] text-zinc-400 mt-1 font-medium">
                      🔥 Help streak: {user.helpStreak} people helped {user.helpStreak % 5 !== 0 ? `(${5 - (user.helpStreak % 5)} more for +1⚡)` : ''}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Role Toggle Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/85 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">App Workspace Role</span>
          <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
            {role === 'Shop Owner' ? '🏪 Shop Owner Mode' : '👤 Local Helper Mode'}
          </span>
        </div>
        <button 
          onClick={toggleRole}
          className="text-zinc-500 dark:text-zinc-400 hover:opacity-85 transition-opacity"
          title="Toggle role"
        >
          {role === 'Shop Owner' ? (
            <ToggleRight size={40} className="text-rose-500" />
          ) : (
            <ToggleLeft size={40} className="text-zinc-300 dark:text-zinc-700" />
          )}
        </button>
      </div>

      {/* Gamification Badge collection */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
          <Award size={16} className="text-amber-500" />
          Karma Badge Collection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BADGES.map(badge => {
            const isUnlocked = userPoints >= badge.reqPoints;
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`border rounded-3xl p-4 flex flex-col items-center text-center space-y-2.5 transition-all ${
                  isUnlocked 
                    ? 'bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900 border-zinc-150 dark:border-zinc-800 opacity-100' 
                    : 'border-zinc-100 dark:border-zinc-850 opacity-40 bg-zinc-50/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${isUnlocked ? badge.color : 'from-zinc-300 to-zinc-400'} flex items-center justify-center text-white shadow-md`}>
                  <Icon size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white leading-snug">{badge.name}</h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal mt-0.5">{badge.description}</p>
                </div>
                {!isUnlocked && (
                  <span className="text-[9px] font-extrabold uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">
                    Needs {badge.reqPoints} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active requests raise history */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
          <CheckCircle size={16} className="text-rose-500" />
          My Raised Requests ({userRequests.length})
        </h3>

        <div className="space-y-2">
          {userRequests.length === 0 ? (
            <p className="text-xs text-center text-zinc-400 py-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl">
              You haven't raised any requests yet.
            </p>
          ) : (
            userRequests.map(req => {
              const distance = calculateDistance(userLocation.lat, userLocation.lng, req.lat, req.lng);
              return (
                <div key={req.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-left min-w-0 flex-1">
                    <Link href={`/request/${req.id}`} className="font-bold text-xs hover:text-rose-500 dark:hover:text-rose-400 truncate block">
                      {req.title}
                    </Link>
                    <span className="text-[9px] text-zinc-400 block mt-0.5">
                      {req.category} • {req.area} ({distance} km away)
                    </span>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    req.status === 'Solved' 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 animate-pulse'
                  }`}>
                    {req.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Logout button */}
      <button 
        onClick={logout}
        className="w-full py-3 border border-rose-200 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors flex items-center justify-center gap-1.5"
      >
        <LogOut size={14} />
        Logout Session
      </button>
    </div>
  );
}
