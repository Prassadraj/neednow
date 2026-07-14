// src/app/raise/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MapPin, Info, ArrowLeft, Send, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const EMERGENCY_CATEGORIES = ['Medicine', 'Water', 'Emergency'];

export default function RaiseRequest() {
  const { userLocation, detectLocation, raiseRequest } = useApp();
  const { user, loginWithGoogle, MAX_TOKENS, canRaiseRequest } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [neededTimeline, setNeededTimeline] = useState('Now');
  const [area, setArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokens = user?.tokens ?? MAX_TOKENS;
  const isEmergency = EMERGENCY_CATEGORIES.includes(category);
  const hasTokens = canRaiseRequest(category);

  // Sync default user location area name
  useEffect(() => {
    if (userLocation.areaName) {
      setArea(userLocation.areaName);
    }
  }, [userLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !area.trim()) return;

    setIsSubmitting(true);
    try {
      await raiseRequest({ title, category, description, urgency, neededTimeline, area, lat: userLocation.lat, lng: userLocation.lng });
      router.push('/');
    } catch (error) {
      if (error.message === 'NO_TOKENS') {
        alert('⚡ You have 0 energy tokens left. Close an existing request or help others to earn tokens back.');
      } else {
        console.error("Failed to raise request:", error);
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Water', 'Medicine', 'Electronics', 'Emergency', 'Grocery'];
  const urgencies = ['Normal', 'High', 'Emergency'];

  if (!user) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <Info size={24} />
        </div>
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Authentication Required</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          You need to login using Google to raise requests and get replies from nearby people.
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
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900 transition-colors border border-zinc-100 dark:border-zinc-800"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h2 className="font-black text-lg text-zinc-900 dark:text-white leading-tight">Raise New Request</h2>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Post to nearby community</span>
        </div>

        {/* Energy Token Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
          tokens === 0
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            : tokens <= 2
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
        }`}>
          <Zap size={12} className={tokens === 0 ? 'text-rose-500' : tokens <= 2 ? 'text-amber-500' : 'text-emerald-500'} />
          Need Energy {tokens}/{MAX_TOKENS}
        </div>
      </div>

      {/* No Token Warning Banner */}
      {tokens === 0 && !isEmergency && (
        <div className="flex items-start gap-3 bg-rose-500/[0.07] border border-rose-500/20 rounded-2xl p-4">
          <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">0 Energy Tokens Left</p>
            <p className="text-[10px] text-rose-500/80 mt-0.5">
              Close one of your open requests (+1⚡) or help others by replying to earn tokens back.
              Emergency categories (Medicine, Water) still work!
            </p>
          </div>
        </div>
      )}

      {/* Emergency Bypass Banner */}
      {tokens === 0 && isEmergency && (
        <div className="flex items-start gap-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-2xl p-4">
          <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Emergency Bypass Active ⚡</p>
            <p className="text-[10px] text-amber-500/80 mt-0.5">
              Emergency, Medicine & Water categories bypass the token limit. Please use this responsibly.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-5 rounded-3xl shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            What item or service do you need?
          </label>
          <input 
            type="text"
            placeholder='e.g. Need Bisleri 20L water can'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium"
            required
            maxLength={100}
          />
        </div>

        {/* Category & Needed Timeline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {EMERGENCY_CATEGORIES.includes(cat) ? `⚡ ${cat}` : cat}
                </option>
              ))}
            </select>
            {isEmergency && (
              <p className="text-[10px] text-amber-500 font-bold mt-1">⚡ Free – bypasses token limit</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              When do you need it?
            </label>
            <select
              value={neededTimeline}
              onChange={e => setNeededTimeline(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium"
            >
              <option value="Now">Needed Now</option>
              <option value="Tomorrow">Needed Tomorrow</option>
            </select>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Urgency Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {urgencies.map(urg => (
              <button
                key={urg}
                type="button"
                onClick={() => setUrgency(urg)}
                className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  urgency === urg
                    ? urg === 'Emergency'
                      ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold'
                      : urg === 'High'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-extrabold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Details & Description
          </label>
          <textarea 
            rows={3}
            placeholder="Add specific details. (e.g. My laptop is dead and I need to deploy my project, please specify if you have Type C)."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium resize-none"
            required
            maxLength={300}
          />
        </div>

        {/* Location Display */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Geographic Location
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
              <input 
                type="text"
                placeholder="Current Neighborhood Area"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200 font-medium"
                required
              />
            </div>
            <button 
              type="button"
              onClick={detectLocation}
              className="px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors shrink-0"
            >
              GPS Detect
            </button>
          </div>
          <span className="text-[10px] text-zinc-400 block mt-1">
            Selected coords: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        </div>

        {/* Token cost hint */}
        <div className={`flex items-center gap-2 p-3 rounded-2xl text-[10px] font-bold ${
          isEmergency
            ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400'
            : tokens > 0
            ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500'
            : 'bg-rose-500/5 text-rose-500'
        }`}>
          <Zap size={12} />
          {isEmergency
            ? 'Emergency request — no token will be deducted'
            : tokens > 0
            ? `This will use 1 energy token (${tokens - 1}/${MAX_TOKENS} remaining after)`
            : 'You have no tokens left — switch to an emergency category to proceed'}
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={isSubmitting || (!hasTokens)}
          className="w-full py-3 bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting ? 'Raising Request...' : (
            <>
              <Send size={14} />
              {isEmergency ? 'Raise Emergency Request ⚡' : 'Raise Request'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
