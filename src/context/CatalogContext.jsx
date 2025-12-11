import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ACHIEVEMENTS as initialAchievements, ARTISTS as initialArtists, SONGS as initialSongs } from '../data/catalog.js';
import { useAuth } from './AuthContext.jsx';

const CatalogContext = createContext(null);

const createId = (prefix) => `${prefix}_${Date.now()}`;

export const CatalogProvider = ({ children }) => {
  const [songs, setSongs] = useState(initialSongs);
  const [artists, setArtists] = useState(initialArtists);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [songFilter, setSongFilter] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ---- SONG OPERATIONS ----
  const addSong = useCallback((song) => {
    setSongs((prev) => [
      {
        id: song.id || createId('song'),
        artistId: song.artistId || null,
        streaming: song.streaming || {},
        genres: song.genres || [],
        ...song,
      },
      ...prev,
    ]);
  }, []);

  const updateSong = useCallback((id, updates) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, ...updates } : song)));
  }, []);

  const deleteSong = useCallback((id) => {
    setSongs((prev) => prev.filter((song) => song.id !== id));
  }, []);

  const applySongFilter = useCallback((filter) => {
    setSongFilter(filter);
  }, []);

  const clearSongFilter = useCallback(() => setSongFilter(null), []);

  // ---- ARTIST OPERATIONS ----
  const addArtist = useCallback((artist) => {
    setArtists((prev) => [
      {
        id: artist.id || createId('artist'),
        genres: artist.genres || [],
        honors: artist.honors || [],
        notableWorks: artist.notableWorks || [],
        ...artist,
      },
      ...prev,
    ]);
  }, []);

  const updateArtist = useCallback((id, updates) => {
    setArtists((prev) => prev.map((artist) => (artist.id === id ? { ...artist, ...updates } : artist)));
  }, []);

  const deleteArtist = useCallback((id) => {
    setArtists((prev) => prev.filter((artist) => artist.id !== id));
    setSongs((prev) => prev.map((song) => (song.artistId === id ? { ...song, artistId: null } : song)));
  }, []);

  // ---- ACHIEVEMENT OPERATIONS ----
  const addAchievement = useCallback((achievement) => {
    setAchievements((prev) => [
      {
        id: achievement.id || createId('achievement'),
        ...achievement,
      },
      ...prev,
    ]);
  }, []);

  const updateAchievement = useCallback((id, updates) => {
    setAchievements((prev) => prev.map((achievement) => (achievement.id === id ? { ...achievement, ...updates } : achievement)));
  }, []);

  const deleteAchievement = useCallback((id) => {
    setAchievements((prev) => prev.filter((achievement) => achievement.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      songs,
      artists,
      achievements,
      addSong,
      updateSong,
      deleteSong,
      songFilter,
      applySongFilter,
      clearSongFilter,
      addArtist,
      updateArtist,
      deleteArtist,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      isAdmin,
      currentUser: user,
    }),
    [songs, artists, achievements, songFilter, isAdmin, user, addSong, updateSong, deleteSong, applySongFilter, clearSongFilter, addArtist, updateArtist, deleteArtist, addAchievement, updateAchievement, deleteAchievement]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
