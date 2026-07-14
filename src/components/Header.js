// src/components/Header.js
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Bell, Sun, Moon, LogOut, CheckCircle, Award } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { userLocation, selectManualLocation, detectLocation, notifications, markNotificationRead } = useApp();
  const { user, loginWithGoogle, logout, role } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [manualArea, setManualArea] = useState('');
  const [manualLat, setManualLat] = useState('13.0330');
  const [manualLng, setManualLng] = useState('80.2690');

  const unreadNotifs = notifications.filter(n => !n.read);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (!manualArea) return;
    selectManualLocation(manualArea, parseFloat(manualLat), parseFloat(manualLng));
    setShowLocationModal(false);
  };

  // Quick select Chennai areas
  const CHENNAI_NEIGHBORHOODS = [
    { name: 'Mylapore, Chennai', lat: 13.0330, lng: 80.2690 },
    { name: 'Adyar, Chennai', lat: 13.0063, lng: 80.2574 },
    { name: 'Nungambakkam, Chennai', lat: 13.0607, lng: 80.2462 },
    { name: 'T. Nagar, Chennai', lat: 13.0405, lng: 80.2337 }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-md">
          <span className="text-white font-extrabold text-lg">N</span>
        </div>
        <div>
          <span className="font-black text-xl bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">NeedNow</span>
          <span className="hidden sm:inline text-[10px] block font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-[-4px]">Community Feed</span>
        </div>
      </Link>

      {/* Location Selector Trigger */}
      <button 
        onClick={() => setShowLocationModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all max-w-[160px] sm:max-w-xs truncate"
      >
        <MapPin size={14} className="text-rose-500 shrink-0" />
        <span className="truncate">{userLocation.areaName}</span>
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifModal(!showNotifModal)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors relative"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-zinc-800 dark:text-zinc-200">
              <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-50 dark:border-zinc-800 mb-2">
                <span className="font-bold text-sm">Notifications</span>
                <span className="text-[10px] text-zinc-400">{unreadNotifs.length} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center text-zinc-400 py-6">No notifications yet</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer text-left ${notif.read ? 'opacity-60 bg-transparent' : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100/50'}`}
                    >
                      <div className="flex items-start gap-1.5 justify-between">
                        <span className={`text-xs font-semibold ${!notif.read && 'text-amber-600 dark:text-amber-400'}`}>{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{notif.message}</p>
                      <span className="text-[9px] text-zinc-400 block mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile / Login */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <img 
                src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/20"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
                }}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{user.name}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  <Award size={10} /> {user.points || 0} pts
                </span>
              </div>
            </Link>
            <button 
              onClick={logout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="text-xs font-bold px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Login
          </button>
        )}
      </div>

      {/* Geolocation selector modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">Change Location</h3>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <CheckCircle size={20} className="text-zinc-500" />
              </button>
            </div>

            {/* Auto Detect Button */}
            <button 
              onClick={() => {
                detectLocation();
                setShowLocationModal(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-sm rounded-2xl transition-colors border border-rose-200/50 dark:border-rose-950/50"
            >
              <MapPin size={16} />
              Auto-Detect My Location
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100 dark:border-zinc-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">Or Select Neighborhood</span></div>
            </div>

            {/* Quick selections */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {CHENNAI_NEIGHBORHOODS.map(n => (
                <button
                  key={n.name}
                  onClick={() => {
                    selectManualLocation(n.name, n.lat, n.lng);
                    setShowLocationModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    userLocation.areaName === n.name
                      ? 'border-rose-500 bg-rose-500/5 text-rose-600 dark:text-rose-400 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {n.name.split(',')[0]}
                </button>
              ))}
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100 dark:border-zinc-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">Or Custom Coords</span></div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualLocationSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Area Name</label>
                <input 
                  type="text" 
                  value={manualArea}
                  onChange={e => setManualArea(e.target.value)}
                  placeholder="e.g. Mylapore Main Street" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full mt-2 py-3 bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-sm rounded-2xl transition-colors shadow-md"
              >
                Apply Location
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
