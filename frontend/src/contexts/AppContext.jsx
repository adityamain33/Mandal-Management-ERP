import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { translations } from '../translations/locale.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('mandalsetu_lang') || 'mr');
  const [token, setToken] = useState(localStorage.getItem('mandalsetu_token') || null);
  const [user, setUser] = useState(null);
  const [activeMandalId, setActiveMandalId] = useState(localStorage.getItem('mandalsetu_mandal_id') || null);
  const [activeMandalName, setActiveMandalName] = useState('');
  const [activeFestivalId, setActiveFestivalId] = useState(null);
  const [activeFestivalYear, setActiveFestivalYear] = useState('');
  const [festivals, setFestivals] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup Axios default configuration
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    if (activeMandalId) {
      axios.defaults.headers.common['x-mandal-id'] = activeMandalId;
    } else {
      delete axios.defaults.headers.common['x-mandal-id'];
    }
  }, [token, activeMandalId]);

  // Load User Details, Festivals, and Settings if token is present
  const loadInitialData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch User profile (this populates roles and Mandals)
      const profileRes = await axios.get('/auth/profile');
      const userData = profileRes.data;
      setUser(userData);

      // Handle Mandal mapping
      const mappedMandals = userData.mandalRoles.map((mr) => mr.mandalId).filter(Boolean);
      setMandals(mappedMandals);

      let currentMId = activeMandalId;
      if (!currentMId && userData.activeMandalId) {
        currentMId = userData.activeMandalId._id || userData.activeMandalId;
        setActiveMandalId(currentMId);
        localStorage.setItem('mandalsetu_mandal_id', currentMId);
      }

      if (currentMId) {
        const currentMandal = mappedMandals.find((m) => {
          const mId = m._id || m.id;
          return mId && mId.toString() === currentMId.toString();
        });
        setActiveMandalName(currentMandal ? currentMandal.name : 'श्री गणेश मित्र मंडळ');

        // Set header scoped mandal
        axios.defaults.headers.common['x-mandal-id'] = currentMId;

        // Load active festival year
        const festRes = await axios.get('/festivals');
        setFestivals(festRes.data);
        
        const activeFest = festRes.data.find((f) => f.status === 'ACTIVE');
        if (activeFest) {
          setActiveFestivalId(activeFest._id || activeFest.id);
          setActiveFestivalYear(`${activeFest.name} (${activeFest.year})`);
        } else if (festRes.data.length > 0) {
          setActiveFestivalId(festRes.data[0]._id || festRes.data[0].id);
          setActiveFestivalYear(`${festRes.data[0].name} (${festRes.data[0].year})`);
        }

        // Load notifications
        const notifRes = await axios.get('/notifications');
        setNotifications(notifRes.data);

        // Load settings
        const settingsRes = await axios.get('/settings');
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [token, activeMandalId]);

  const loginUser = (data) => {
    localStorage.setItem('mandalsetu_token', data.token);
    setToken(data.token);
    if (data.activeMandalId) {
      localStorage.setItem('mandalsetu_mandal_id', data.activeMandalId);
      setActiveMandalId(data.activeMandalId);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('mandalsetu_token');
    localStorage.removeItem('mandalsetu_mandal_id');
    setToken(null);
    setUser(null);
    setActiveMandalId(null);
    setActiveMandalName('');
    setActiveFestivalId(null);
    setActiveFestivalYear('');
    setFestivals([]);
    setNotifications([]);
    setSettings(null);
  };

  const changeLanguage = (newLang) => {
    localStorage.setItem('mandalsetu_lang', newLang);
    setLang(newLang);
  };

  const switchMandal = (mandalId) => {
    localStorage.setItem('mandalsetu_mandal_id', mandalId);
    setActiveMandalId(mandalId);
  };

  const refreshNotifications = async () => {
    if (!token || !activeMandalId) return;
    try {
      const notifRes = await axios.get('/notifications');
      setNotifications(notifRes.data);
    } catch (e) {
      console.error('Error refreshing notifications:', e);
    }
  };

  // Translation function: supports dot notation (e.g. t('sidebar.dashboard'))
  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang] || translations['en'];

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path; // Return the path if key not found anywhere
          }
        }
        return fallback;
      }
    }
    return result;
  };

  // Determine role and custom permissions for active mandal
  const getActiveRoleAndPermissions = () => {
    if (!user || !activeMandalId) {
      return {
        role: 'MEMBER',
        permissions: user?.permissions || [],
        customPermissions: [],
      };
    }

    const mr = user.mandalRoles?.find((r) => {
      const id = r.mandalId?._id || r.mandalId;
      return id && id.toString() === activeMandalId.toString();
    });

    const currentRole = mr ? mr.role : (user.role || 'MEMBER');
    const customPermissions = mr?.customPermissions || user.customPermissions || [];
    
    // If backend already populated effective permissions
    let permissions = user.permissions || [];
    if (!permissions || permissions.length === 0) {
      if (currentRole === 'MANDAL_ADMIN' || currentRole === 'SUPER_ADMIN') {
        permissions = ['*'];
      } else if (customPermissions.length > 0) {
        permissions = customPermissions;
      }
    }

    return {
      role: currentRole,
      permissions,
      customPermissions,
    };
  };

  const activeInfo = getActiveRoleAndPermissions();
  const currentRole = activeInfo.role;
  const currentPermissions = activeInfo.permissions;

  // Permission Check Function
  const hasPermission = (requiredPermission) => {
    if (!currentRole) return false;
    if (currentRole === 'MANDAL_ADMIN' || currentRole === 'SUPER_ADMIN') return true;
    if (currentPermissions.includes('*')) return true;
    return currentPermissions.includes(requiredPermission);
  };

  // Multiple Permission Check (Any match)
  const hasAnyPermission = (permissionsList = []) => {
    if (!currentRole) return false;
    if (currentRole === 'MANDAL_ADMIN' || currentRole === 'SUPER_ADMIN') return true;
    return permissionsList.some((perm) => hasPermission(perm));
  };

  const isAdmin = currentRole === 'MANDAL_ADMIN' || currentRole === 'SUPER_ADMIN';
  const isMember = currentRole === 'MEMBER' || currentRole === 'VIEWER';
  const isTreasurer = currentRole === 'TREASURER' || currentRole === 'ACCOUNTANT';

  return (
    <AppContext.Provider
      value={{
        lang,
        token,
        user,
        activeMandalId,
        activeMandalName,
        activeFestivalId,
        activeFestivalYear,
        festivals,
        mandals,
        notifications,
        settings,
        loading,
        loginUser,
        logoutUser,
        changeLanguage,
        switchMandal,
        refreshNotifications,
        t,
        role: currentRole,
        permissions: currentPermissions,
        hasPermission,
        hasAnyPermission,
        isAdmin,
        isMember,
        isTreasurer,
        refetchUser: loadInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
