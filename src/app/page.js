// src/app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import RequestCard from '@/components/RequestCard';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Map, 
  Plus, 
  AlertCircle, 
  Zap, 
  HelpCircle, 
  RotateCcw,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function HomeFeed() {
  const { 
    requests, 
    activeCategory, 
    setActiveCategory, 
    activeUrgency, 
    setActiveUrgency,
    userLocation,
    calculateDistance,
    raiseRequest
  } = useApp();
  const { user, loginWithGoogle } = useAuth();
  
  const [distanceLimit, setDistanceLimit] = useState(10); // default 10km filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = ['All', 'Water', 'Medicine', 'Electronics', 'Emergency', 'Grocery'];
  const urgencies = ['All', 'Normal', 'High', 'Emergency'];

  // Filter requests
  const filteredRequests = requests.filter(req => {
    // 1. Category Filter
    if (activeCategory !== 'All' && req.category !== activeCategory) return false;
    
    // 2. Urgency Filter
    if (activeUrgency !== 'All' && req.urgency !== activeUrgency) return false;
    
    // 3. Distance Filter
    const distance = calculateDistance(userLocation.lat, userLocation.lng, req.lat, req.lng);
    if (distance > distanceLimit) return false;

    // 4. Search Title/Description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    
    return true;
  });

  // Sort: Emergency & Open first, then newer
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // Open requests first
    if (a.status === 'Open' && b.status === 'Solved') return -1;
    if (a.status === 'Solved' && b.status === 'Open') return 1;

    // Urgency rank
    const getUrgencyRank = (urg) => {
      if (urg === 'Emergency') return 3;
      if (urg === 'High') return 2;
      return 1;
    };
    const rankDiff = getUrgencyRank(b.urgency) - getUrgencyRank(a.urgency);
    if (rankDiff !== 0) return rankDiff;

    // Recency
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Infinite Scroll simulation
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  // Simulation Tool: triggers random request
  const handleSimulateRequest = () => {
    const mockTitles = [
      'Need standard O2 canister nearby',
      'Need iPhone charging cable in Mylapore',
      'Need milk packets and bread packets urgently',
      'Need mechanic to jumpstart car battery near main road',
      'Need fresh drinking water cans'
    ];
    const mockCats = ['Medicine', 'Electronics', 'Grocery', 'Emergency', 'Water'];
    const mockUrgencies = ['Normal', 'High', 'Emergency'];
    
    const randomIdx = Math.floor(Math.random() * mockTitles.length);
    const title = mockTitles[randomIdx];
    const category = mockCats[randomIdx];
    const urgency = mockUrgencies[Math.floor(Math.random() * mockUrgencies.length)];
    
    // Random offsets from user coordinate
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;

    raiseRequest({
      title,
      category,
      urgency,
      description: `Simulated community request: We need this item or service as soon as possible. Thanks for replying!`,
      area: userLocation.areaName,
      lat: userLocation.lat + latOffset,
      lng: userLocation.lng + lngOffset,
      neededTimeline: Math.random() > 0.5 ? 'Now' : 'Tomorrow'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-tr from-amber-500/10 to-rose-600/10 border border-amber-500/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <span className="text-[10px] font-bold tracking-widest text-rose-500 dark:text-rose-400 uppercase bg-rose-500/10 px-2.5 py-1 rounded-full">
            ✨ Neighbor-to-Neighbor Help
          </span>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-3 leading-tight">
            Need something urgently? Ask local people or shop owners.
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            Raise requests for immediate supplies or respond to help others and earn community karma badges.
          </p>
          <div className="flex gap-2 mt-4">
            <Link 
              href="/raise"
              className="text-xs font-extrabold px-4 py-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Raise Request
            </Link>
            {/* <button 
              onClick={handleSimulateRequest}
              className="text-xs font-bold px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors border border-rose-500/10 flex items-center gap-1"
            >
              <Sparkles size={12} /> Simulate Nearby Request
            </button> */}
          </div>
        </div>
      </div>

      {/* Search and Filter panel */}
      <div className="space-y-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search local requests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showFilters 
                ? 'border-rose-500 bg-rose-500/5 text-rose-500'
                : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="pt-3 border-t border-zinc-50 dark:border-zinc-850 space-y-4 animate-in fade-in duration-200">
            {/* Distance Slider */}
            <div>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                <span>Distance Range</span>
                <span className="text-rose-500">{distanceLimit} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="25" 
                value={distanceLimit} 
                onChange={e => setDistanceLimit(parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Urgency selection */}
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Urgency Level</span>
              <div className="flex flex-wrap gap-1.5">
                {urgencies.map(urg => (
                  <button
                    key={urg}
                    onClick={() => setActiveUrgency(urg)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      activeUrgency === urg
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Carousel */}
        <div>
          <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Categories</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10'
                    : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {cat === 'All' ? '📦 All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-4">
        {sortedRequests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6">
            <AlertCircle className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
            <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">No requests found</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
              Try adjusting your category, urgency or distance filters to see more requests.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sortedRequests.slice(0, visibleCount).map(req => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>

            {/* Load More/Infinite Scroll Simulation */}
            {sortedRequests.length > visibleCount && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Requests'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button for Mobile-First screen */}
      <Link 
        href="/raise" 
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 flex items-center justify-center text-white shadow-xl hover:shadow-rose-500/20 active:scale-95 transition-all md:hidden"
        title="Raise Request"
      >
        <Plus size={28} className="stroke-[2.5]" />
      </Link>
    </div>
  );
}
