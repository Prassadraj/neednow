// src/context/AppContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from '@/configs/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  setDoc,
  where
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const AppContext = createContext();

// Preloaded mock data for a rich out-of-the-box experience
const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    userId: 'user-mock-2',
    userName: 'Priya Sharma',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Need Bisleri 20L water can in Mylapore now',
    category: 'Water',
    description: 'No supply in my building today and guests are coming. Delivery apps showing 3 hrs delivery time.',
    area: 'Mylapore, Chennai',
    lat: 13.0330,
    lng: 80.2690,
    urgency: 'High',
    status: 'Open',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
  },
  {
    id: 'req-2',
    userId: 'user-mock-3',
    userName: 'Rohan Mehta',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Need pharmacy open nearby',
    category: 'Medicine',
    description: 'Looking for a pharmacy that has insulin cartridge in stock nearby. URGENT.',
    area: 'Mylapore, Chennai',
    lat: 13.0360,
    lng: 80.2640,
    urgency: 'Emergency',
    status: 'Open',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 mins ago
  },
  {
    id: 'req-3',
    userId: 'user-mock-4',
    userName: 'David Miller',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Need laptop charger urgently',
    category: 'Electronics',
    description: 'Lenovo ThinkPad type C charger. My charger stopped working and I have a deployment in an hour.',
    area: 'Adyar, Chennai',
    lat: 13.0063,
    lng: 80.2574,
    urgency: 'Normal',
    status: 'Solved',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString() // 2 hours ago
  }
];

const INITIAL_RESPONSES = [
  {
    id: 'res-1',
    requestId: 'req-1',
    userId: 'shop-mock-1',
    userName: 'Mylapore Supermarket (Shop)',
    userPhoto: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150',
    isShopOwner: true,
    message: 'We have 20L Bisleri cans in stock right now. You can pick it up or we can deliver in 15 mins to Mylapore. Call us at 9876543210.',
    upvotes: 4,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'res-2',
    requestId: 'req-1',
    userId: 'user-mock-5',
    userName: 'Karthik S.',
    userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isShopOwner: false,
    message: 'Just saw water cans delivery truck near Madhava Perumal temple, they are heading towards the main street.',
    upvotes: 1,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'res-3',
    requestId: 'req-2',
    userId: 'shop-mock-2',
    userName: 'City Chemist (Shop)',
    userPhoto: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=150',
    isShopOwner: true,
    message: 'Yes, Rohan. We have the insulin cartridge available. We are open till 11:00 PM today. Corner of Luz Church Road.',
    upvotes: 3,
    upvotedBy: [],
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
];

const INITIAL_SHOPS = [
  {
    id: 'shop-mock-1',
    ownerId: 'mock-user-123', // links to current user if role is toggled
    name: 'Mylapore Supermarket',
    ownerName: 'Alex LocalHero',
    isOpen: true,
    lat: 13.0340,
    lng: 80.2680,
    area: 'Mylapore, Chennai',
    products: [
      { id: 'p1', name: 'Bisleri 20L Water Can', price: '₹90', inStock: true },
      { id: 'p2', name: 'Fresh Milk 1L', price: '₹60', inStock: true },
      { id: 'p3', name: 'Basmati Rice 5kg', price: '₹450', inStock: false }
    ]
  },
  {
    id: 'shop-mock-2',
    ownerId: 'shop-owner-2',
    name: 'City Chemist',
    ownerName: 'Suresh Kumar',
    isOpen: true,
    lat: 13.0365,
    lng: 80.2635,
    area: 'Luz, Chennai',
    products: [
      { id: 'p4', name: 'Insulin Cartridge', price: '₹850', inStock: true },
      { id: 'p5', name: 'N95 Masks (Pack of 5)', price: '₹150', inStock: true }
    ]
  }
];

export function AppProvider({ children }) {
  const { user, updatePoints, updateTokens, canRaiseRequest, incrementHelpStreak } = useAuth();
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState({
    lat: 13.0330, // Default to Mylapore, Chennai
    lng: 80.2690,
    areaName: 'Mylapore, Chennai'
  });
  const [locationPermission, setLocationPermission] = useState('prompt');

  // DB Collections state
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [shops, setShops] = useState([]);
  
  // App UI state
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeUrgency, setActiveUrgency] = useState('All');
  const [notifications, setNotifications] = useState([]);

  // Local Storage Utility
  const getLocalStorage = (key, fallback) => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(key);
      try {
        return val ? JSON.parse(val) : fallback;
      } catch {
        return val || fallback;
      }
    }
    return fallback;
  };

  const setLocalStorage = (key, val) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  // Sync / Initialize state
  useEffect(() => {
    // Attempt automatic geolocation check
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
      });
    }

    if (isFirebaseConfigured && db) {
      // Setup live listeners
      const qRequests = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      const unsubRequests = onSnapshot(qRequests, (snapshot) => {
        const reqList = [];
        snapshot.forEach((doc) => {
          reqList.push({ id: doc.id, ...doc.data() });
        });
        setRequests(reqList.length > 0 ? reqList : INITIAL_REQUESTS);
      });

      const qResponses = query(collection(db, 'responses'), orderBy('createdAt', 'desc'));
      const unsubResponses = onSnapshot(qResponses, (snapshot) => {
        const respList = [];
        snapshot.forEach((doc) => {
          respList.push({ id: doc.id, ...doc.data() });
        });
        setResponses(respList.length > 0 ? respList : INITIAL_RESPONSES);
      });

      const qShops = query(collection(db, 'shops'));
      const unsubShops = onSnapshot(qShops, (snapshot) => {
        const shopList = [];
        snapshot.forEach((doc) => {
          shopList.push({ id: doc.id, ...doc.data() });
        });
        setShops(shopList.length > 0 ? shopList : INITIAL_SHOPS);
      });

      return () => {
        unsubRequests();
        unsubResponses();
        unsubShops();
      };
    } else {
      // Mock mode: load from LocalStorage or preload defaults
      const localRequests = getLocalStorage('neednow_requests', INITIAL_REQUESTS);
      const localResponses = getLocalStorage('neednow_responses', INITIAL_RESPONSES);
      const localShops = getLocalStorage('neednow_shops', INITIAL_SHOPS);
      const localNotifications = getLocalStorage('neednow_notifications', [
        { id: 'notif-1', title: 'Welcome to NeedNow!', message: 'Earn points and badges by answering nearby requests.', read: false, createdAt: new Date().toISOString() }
      ]);

      setRequests(localRequests);
      setResponses(localResponses);
      setShops(localShops);
      setNotifications(localNotifications);
    }
  }, []);

  // Geolocation detection handler
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Simulating reverse-geocoding area name based on Mylapore coordinates
        const distanceToMylapore = calculateDistance(latitude, longitude, 13.0330, 80.2690);
        let area = 'Chennai Local Area';
        if (distanceToMylapore < 2) area = 'Mylapore, Chennai';
        else if (calculateDistance(latitude, longitude, 13.0063, 80.2574) < 2) area = 'Adyar, Chennai';

        setUserLocation({ lat: latitude, lng: longitude, areaName: area });
        setLocationPermission('granted');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationPermission('denied');
        alert('Could not auto-detect location. Please select area manually.');
      }
    );
  };

  const selectManualLocation = (areaName, lat, lng) => {
    setUserLocation({ lat, lng, areaName });
  };

  // Helper: Haversine distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  };

  // Actions: Requests
  const raiseRequest = async (requestData) => {
    const category = requestData.category || '';
    if (!canRaiseRequest(category)) {
      throw new Error('NO_TOKENS');
    }

    const newRequest = {
      ...requestData,
      userId: user?.uid || 'anonymous-user',
      userName: user?.name || 'Anonymous User',
      userPhoto: user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, 'requests'), newRequest);
    } else {
      const updated = [ { id: 'req-' + Date.now(), ...newRequest }, ...requests ];
      setRequests(updated);
      setLocalStorage('neednow_requests', updated);
    }

    // Deduct 1 energy token (emergencies bypass the check but still log)
    const EMERGENCY_CATEGORIES = ['Medicine', 'Water', 'Emergency'];
    if (!EMERGENCY_CATEGORIES.includes(category)) {
      await updateTokens(-1);
    }

    // Trigger local push notification simulation
    addNotification({
      id: 'notif-' + Date.now(),
      title: 'New Nearby Request!',
      message: `A new ${newRequest.urgency.toLowerCase()} urgency request has been raised in ${newRequest.area}: "${newRequest.title}"`,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  const markRequestSolved = async (requestId) => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'requests', requestId);
      await updateDoc(docRef, { status: 'Solved' });
    } else {
      const updated = requests.map(r => r.id === requestId ? { ...r, status: 'Solved' } : r);
      setRequests(updated);
      setLocalStorage('neednow_requests', updated);
    }

    // Reward points + refund 1 token for closing a request
    updatePoints(5);
    await updateTokens(+1);

    // Notify request owner
    const request = requests.find(r => r.id === requestId);
    if (request) {
      addNotification({
        id: 'notif-' + Date.now(),
        title: 'Request Solved!',
        message: `Your request "${request.title}" has been marked solved. +1 ⚡ token refunded!`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Actions: Responses
  const replyToRequest = async (requestId, message, isShopResponse = false) => {
    const newResponse = {
      requestId,
      userId: user?.uid || 'mock-user-123',
      userName: isShopResponse ? `${user?.name || 'Local Shop'} (Shop)` : (user?.name || 'Alex LocalHelper'),
      userPhoto: user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isShopOwner: isShopResponse,
      message,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, 'responses'), newResponse);
    } else {
      const updated = [ { id: 'res-' + Date.now(), ...newResponse }, ...responses ];
      setResponses(updated);
      setLocalStorage('neednow_responses', updated);
    }

    // Reward responder points + increment help streak (may give bonus token)
    updatePoints(15); // rich reward for responding
    await incrementHelpStreak();

    // Add notification to request owner
    const request = requests.find(r => r.id === requestId);
    if (request && request.userId !== user?.uid) {
      addNotification({
        id: 'notif-' + Date.now(),
        title: 'New Reply Received',
        message: `${newResponse.userName} replied to your request: "${message.substring(0, 40)}..."`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  };

  const upvoteResponse = async (responseId) => {
    const currentUserId = user?.uid || 'mock-user-123';
    
    if (isFirebaseConfigured && db) {
      // Implementation for live Firestore upvote
      const responseRef = doc(db, 'responses', responseId);
      const response = responses.find(r => r.id === responseId);
      if (response) {
        const upvotedBy = response.upvotedBy || [];
        const isUpvoted = upvotedBy.includes(currentUserId);
        const newUpvotes = isUpvoted ? response.upvotes - 1 : response.upvotes + 1;
        const newUpvotedBy = isUpvoted 
          ? upvotedBy.filter(id => id !== currentUserId)
          : [...upvotedBy, currentUserId];

        await updateDoc(responseRef, { upvotes: newUpvotes, upvotedBy: newUpvotedBy });
      }
    } else {
      // Mock mode
      const updated = responses.map(res => {
        if (res.id === responseId) {
          const upvotedBy = res.upvotedBy || [];
          const isUpvoted = upvotedBy.includes(currentUserId);
          return {
            ...res,
            upvotes: isUpvoted ? res.upvotes - 1 : res.upvotes + 1,
            upvotedBy: isUpvoted ? upvotedBy.filter(id => id !== currentUserId) : [...upvotedBy, currentUserId]
          };
        }
        return res;
      });
      setResponses(updated);
      setLocalStorage('neednow_responses', updated);
      
      // Update score of the replier
      const resObj = responses.find(r => r.id === responseId);
      if (resObj && resObj.userId !== currentUserId) {
        // Points rewarded to responder due to upvote
        updatePoints(5);
      }
    }
  };

  // Actions: Shop Owners
  const addShopProduct = async (shopId, product) => {
    const productWithId = { id: 'prod-' + Date.now(), ...product };
    if (isFirebaseConfigured && db) {
      const shopRef = doc(db, 'shops', shopId);
      const shopObj = shops.find(s => s.id === shopId);
      if (shopObj) {
        const updatedProducts = [...(shopObj.products || []), productWithId];
        await updateDoc(shopRef, { products: updatedProducts });
      }
    } else {
      const updated = shops.map(s => {
        if (s.id === shopId) {
          return { ...s, products: [...(s.products || []), productWithId] };
        }
        return s;
      });
      setShops(updated);
      setLocalStorage('neednow_shops', updated);
    }
  };

  const toggleProductStock = async (shopId, productId) => {
    if (isFirebaseConfigured && db) {
      const shopRef = doc(db, 'shops', shopId);
      const shopObj = shops.find(s => s.id === shopId);
      if (shopObj) {
        const updatedProducts = shopObj.products.map(p => 
          p.id === productId ? { ...p, inStock: !p.inStock } : p
        );
        await updateDoc(shopRef, { products: updatedProducts });
      }
    } else {
      const updated = shops.map(s => {
        if (s.id === shopId) {
          return {
            ...s,
            products: s.products.map(p => p.id === productId ? { ...p, inStock: !p.inStock } : p)
          };
        }
        return s;
      });
      setShops(updated);
      setLocalStorage('neednow_shops', updated);
    }
  };

  const toggleShopStatus = async (shopId, isOpen) => {
    if (isFirebaseConfigured && db) {
      const shopRef = doc(db, 'shops', shopId);
      await updateDoc(shopRef, { isOpen });
    } else {
      const updated = shops.map(s => s.id === shopId ? { ...s, isOpen } : s);
      setShops(updated);
      setLocalStorage('neednow_shops', updated);
    }
  };

  // Push local notification simulation helper
  const addNotification = (notif) => {
    const updated = [notif, ...notifications];
    setNotifications(updated);
    setLocalStorage('neednow_notifications', updated);
  };

  const markNotificationRead = (notifId) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    setNotifications(updated);
    setLocalStorage('neednow_notifications', updated);
  };

  return (
    <AppContext.Provider value={{
      userLocation,
      locationPermission,
      detectLocation,
      selectManualLocation,
      calculateDistance,
      requests,
      responses,
      shops,
      activeCategory,
      setActiveCategory,
      activeUrgency,
      setActiveUrgency,
      raiseRequest,
      markRequestSolved,
      replyToRequest,
      upvoteResponse,
      addShopProduct,
      toggleProductStock,
      toggleShopStatus,
      notifications,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
