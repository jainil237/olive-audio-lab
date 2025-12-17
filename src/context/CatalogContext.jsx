import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext.jsx';

const CatalogContext = createContext(null);

// Reuse your existing helper for song artists
const normalizeArtistIds = (input) => {
  if (Array.isArray(input)) return input.map(String); // Ensure IDs are strings for Firestore
  if (input == null) return [];
  return [String(input)];
};

export const CatalogProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [songFilter, setSongFilter] = useState(null);
  const { user, isAdmin } = useAuth();

  // 1. REAL-TIME DATA SYNC
  useEffect(() => {
    const unsubSongs = onSnapshot(collection(db, 'songs'), (snap) => 
      setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubArtists = onSnapshot(collection(db, 'artists'), (snap) => 
      setArtists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snap) => 
      setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubSongs(); unsubArtists(); unsubAchievements(); };
  }, []);

  // 2. HELPER TO ENRICH SONGS (Join with Artists)
  const enrichSong = useCallback((songData) => {
     // Your existing logic, adapted for real data
     const normalizedIds = normalizeArtistIds(songData.artistIds);
     const artistNames = normalizedIds
        .map((id) => artists.find((a) => String(a.id) === id)?.name)
        .filter(Boolean);
      
     return {
       ...songData,
       artistIds: normalizedIds,
       artist: artistNames.length ? artistNames.join(' x ') : songData.artist || 'Independent',
     };
  }, [artists]);

  const enrichedSongs = useMemo(() => songs.map(enrichSong), [songs, enrichSong]);

  // 3. DATABASE ACTIONS
  // We check isAdmin here, but Firestore Rules provide the real security.
  const addSong = async (data) => isAdmin && addDoc(collection(db, 'songs'), data);
  const updateSong = async (id, data) => isAdmin && updateDoc(doc(db, 'songs', id), data);
  const deleteSong = async (id) => isAdmin && deleteDoc(doc(db, 'songs', id));

  const addArtist = async (data) => isAdmin && addDoc(collection(db, 'artists'), data);
  const updateArtist = async (id, data) => isAdmin && updateDoc(doc(db, 'artists', id), data);
  const deleteArtist = async (id) => isAdmin && deleteDoc(doc(db, 'artists', id));

  const addAchievement = async (data) => isAdmin && addDoc(collection(db, 'achievements'), data);
  const updateAchievement = async (id, data) => isAdmin && updateDoc(doc(db, 'achievements', id), data);
  const deleteAchievement = async (id) => isAdmin && deleteDoc(doc(db, 'achievements', id));

  const applySongFilter = (filter) => setSongFilter(filter);
  const clearSongFilter = () => setSongFilter(null);

  const value = useMemo(() => ({
    songs: enrichedSongs,
    artists,
    achievements,
    addSong, updateSong, deleteSong,
    addArtist, updateArtist, deleteArtist,
    addAchievement, updateAchievement, deleteAchievement,
    songFilter, applySongFilter, clearSongFilter,
    isAdmin, currentUser: user,
  }), [enrichedSongs, artists, achievements, songFilter, isAdmin, user]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
  return context;
};