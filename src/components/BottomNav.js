// src/components/BottomNav.js
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Store, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Raise', path: '/raise', icon: PlusCircle, highlight: true },
    { label: role === 'Shop Owner' ? 'My Shop' : 'Shop Mode', path: '/shop', icon: Store },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-100 dark:border-zinc-800/80 rounded-2xl shadow-xl px-4 py-2 flex items-center justify-around transition-all">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        if (item.highlight) {
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className="flex flex-col items-center justify-center -translate-y-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 flex items-center justify-center text-white shadow-lg hover:shadow-rose-500/20 active:scale-95 transition-all">
                <Icon size={24} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isActive 
                ? 'text-rose-500 scale-105 font-bold' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
