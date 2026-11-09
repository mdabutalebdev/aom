'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '@/config/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Placeholder: site settings will be fetched from the backend in later phases.
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      // Backend not available yet during Phase 1 — fail silently.
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount placeholder; setState runs post-await (deferred), not a cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  // Helper to read a setting value (Bangla-only project).
  const getSetting = (key) => {
    if (!settings) return '';
    return settings[key] || '';
  };

  const value = {
    settings,
    loading,
    getSetting,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
