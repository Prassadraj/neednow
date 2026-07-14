// src/app/shop/page.js
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { 
  Store, 
  Plus, 
  MapPin, 
  AlertCircle, 
  Check, 
  PlusCircle, 
  Clock, 
  MessageSquare,
  BookmarkCheck,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function ShopMode() {
  const { user, loginWithGoogle, role, toggleRole, shopStatus, setShopOpenClose } = useAuth();
  const { 
    shops, 
    addShopProduct, 
    toggleProductStock, 
    toggleShopStatus, 
    requests, 
    replyToRequest,
    calculateDistance,
    userLocation
  } = useApp();

  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState({});

  // Find shop matching active user. For mock mode fallback, map to shop-mock-1.
  const myShop = shops.find(s => s.ownerId === user?.uid || (user && s.id === 'shop-mock-1'));

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice.trim() || !myShop) return;

    addShopProduct(myShop.id, {
      name: newProductName,
      price: newProductPrice.startsWith('₹') ? newProductPrice : `₹${newProductPrice}`,
      inStock: newProductStock
    });

    setNewProductName('');
    setNewProductPrice('');
    setNewProductStock(true);
  };

  const handleReplySubmit = async (e, requestId) => {
    e.preventDefault();
    const replyText = replyTextMap[requestId];
    if (!replyText || !replyText.trim()) return;

    await replyToRequest(requestId, replyText, true);
    setReplyTextMap(prev => ({ ...prev, [requestId]: '' }));
    alert("Reply posted successfully as Shop Verified!");
  };

  if (!user) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <Store size={24} />
        </div>
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Shop Portal Login</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sign in using Google to open your store, add inventory, and reply to community requests immediately.
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

  // If role is user, prompt to toggle role
  if (role !== 'Shop Owner') {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-6 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Store size={24} />
        </div>
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Activate Shop Owner Mode</h3>
        <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed">
          Unlock your local merchant dashboard. You can mark your storefront open/closed, manage your product inventory, and reply to local requests with official pricing details.
        </p>
        <button 
          onClick={toggleRole}
          className="w-full py-3 bg-gradient-to-tr from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md"
        >
          Switch to Shop Owner
        </button>
      </div>
    );
  }

  // If no shop exists for owner, auto simulate/create one
  const shopToDisplay = myShop || {
    id: 'shop-mock-1',
    name: 'My Store',
    ownerName: user.name,
    isOpen: shopStatus,
    lat: userLocation.lat,
    lng: userLocation.lng,
    area: userLocation.areaName,
    products: []
  };

  const activeRequests = requests.filter(r => r.status === 'Open');

  return (
    <div className="space-y-6">
      {/* Shop Info card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Store className="text-amber-500 shrink-0" size={20} />
              {shopToDisplay.name}
            </h2>
            <p className="text-xs text-zinc-500 flex items-center gap-0.5">
              <MapPin size={12} className="text-rose-500" />
              {shopToDisplay.area}
            </p>
          </div>

          {/* Toggle status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Store status:</span>
            <button 
              onClick={() => {
                const updatedStatus = !shopStatus;
                setShopOpenClose(updatedStatus);
                toggleShopStatus(shopToDisplay.id, updatedStatus);
              }}
              className={`text-xs font-extrabold px-4 py-2 rounded-full border transition-all ${
                shopStatus
                  ? 'bg-green-500/10 text-green-600 border-green-200/50 dark:border-green-950/50'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              {shopStatus ? '🟢 OPEN' : '🔴 CLOSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Products Inventory */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-zinc-850 dark:text-zinc-200">Manage Inventory</h3>
        
        {/* Product list */}
        <div className="space-y-2">
          {shopToDisplay.products?.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">No products in inventory yet.</p>
          ) : (
            shopToDisplay.products?.map(p => (
              <div key={p.id} className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-850 py-2 text-xs">
                <div className="text-left">
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{p.name}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">{p.price}</span>
                </div>
                <button 
                  onClick={() => toggleProductStock(shopToDisplay.id, p.id)}
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border transition-colors ${
                    p.inStock
                      ? 'bg-green-500/10 text-green-600 border-green-200/30'
                      : 'bg-red-500/10 text-red-600 border-red-200/30'
                  }`}
                >
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Product Form */}
        <form onSubmit={handleCreateProduct} className="pt-4 border-t border-zinc-50 dark:border-zinc-800 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder="Product Name"
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-200"
              required
            />
            <input 
              type="text" 
              placeholder="Price (e.g. 90)"
              value={newProductPrice}
              onChange={e => setNewProductPrice(e.target.value)}
              className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl text-xs focus:outline-none text-zinc-800 dark:text-zinc-200"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Add to Stock
          </button>
        </form>
      </div>

      {/* Answer Nearby Open Requests */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-zinc-850 dark:text-zinc-200 flex items-center gap-1">
          <PlusCircle size={16} className="text-amber-500" />
          Reply to Nearby Open Requests ({activeRequests.length})
        </h3>

        <div className="space-y-3">
          {activeRequests.length === 0 ? (
            <p className="text-xs text-center text-zinc-400 py-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl">
              No open requests nearby. Check back soon!
            </p>
          ) : (
            activeRequests.map(req => {
              const distance = calculateDistance(userLocation.lat, userLocation.lng, req.lat, req.lng);
              const replyText = replyTextMap[req.id] || '';
              return (
                <div key={req.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-4 rounded-3xl shadow-sm space-y-3 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest">{req.category}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{distance} km away</span>
                  </div>
                  <div>
                    <Link href={`/request/${req.id}`} className="font-extrabold text-xs text-zinc-850 dark:text-white hover:underline leading-snug">
                      {req.title}
                    </Link>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{req.description}</p>
                  </div>

                  {/* Shop verified reply form */}
                  <form onSubmit={(e) => handleReplySubmit(e, req.id)} className="flex items-center gap-2 pt-2 border-t border-zinc-50 dark:border-zinc-850">
                    <input 
                      type="text" 
                      placeholder="Offer product, price, or pickup time..."
                      value={replyText}
                      onChange={e => setReplyTextMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[11px] focus:outline-none text-zinc-800 dark:text-zinc-200"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={!replyText.trim() || !shopStatus}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40 whitespace-nowrap"
                    >
                      Reply Verified
                    </button>
                  </form>
                  {!shopStatus && (
                    <span className="text-[9px] text-red-500 block font-semibold">⚠️ Open store status to reply to requests.</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
