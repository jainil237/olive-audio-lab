import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  setDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const CatalogContext = createContext();

const LANDING_CONFIG_DOC_ID = 'default';

const normalizeLandingSelection = (data = {}) => ({
  songIds: Array.isArray(data.songIds) ? data.songIds.map(String) : [],
  artistIds: Array.isArray(data.artistIds) ? data.artistIds.map(String) : [],
  achievementIds: Array.isArray(data.achievementIds) ? data.achievementIds.map(String) : [],
});

const normalizeSong = (song = {}) => {
  const streaming = Object.fromEntries(
    Object.entries(song.streaming || {}).filter(([, url]) => typeof url === 'string' && url.trim())
  );

  const artistIds = Array.isArray(song.artistIds)
    ? song.artistIds.map(String)
    : song.artistId
      ? [String(song.artistId)]
      : [];

  const primaryArtistId = artistIds[0] ?? (song.artistId ? String(song.artistId) : null);

  const rawEmbeds = (song.embeds && typeof song.embeds === 'object') ? song.embeds : {};
  const normalizedEmbeds = Object.entries(rawEmbeds).reduce((acc, [provider, html]) => {
    if (typeof html === 'string') {
      const trimmed = html.trim();
      if (trimmed) {
        acc[provider] = trimmed;
      }
    }
    return acc;
  }, {});

  if (typeof song.embed === 'string') {
    const legacy = song.embed.trim();
    if (legacy) {
      if (legacy.includes('soundcloud') && !normalizedEmbeds.soundcloud) {
        normalizedEmbeds.soundcloud = legacy;
      } else if (legacy.includes('apple') && !normalizedEmbeds.apple) {
        normalizedEmbeds.apple = legacy;
      } else if (!normalizedEmbeds.primary) {
        normalizedEmbeds.primary = legacy;
      }
    }
  }

  const primaryEmbed = normalizedEmbeds.apple
    || normalizedEmbeds.soundcloud
    || normalizedEmbeds.primary
    || '';

  return {
    ...song,
    streaming,
    embeds: normalizedEmbeds,
    embed: primaryEmbed,
    artistIds,
    ...(primaryArtistId ? { artistId: primaryArtistId } : {}),
  };
};

export const CatalogProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [landingSelection, setLandingSelection] = useState(() => normalizeLandingSelection());

  // --- ROBUST LOADING STATE ---
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [artistsLoaded, setArtistsLoaded] = useState(false);
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const [songFilter, setSongFilter] = useState(null);
  const [queries, setQueries] = useState([]);

  // Use AuthContext instead of local state
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const landingDocRef = doc(db, 'landingConfig', LANDING_CONFIG_DOC_ID);
    const unsubscribe = onSnapshot(landingDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setLandingSelection(normalizeLandingSelection(snapshot.data()));
      } else {
        setLandingSelection(normalizeLandingSelection());
      }
    }, (error) => {
      console.error('Error loading landing selections:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubSongs = onSnapshot(collection(db, 'songs'), (snapshot) => {
      setSongs(snapshot.docs.map(doc => ({ id: doc.id, ...normalizeSong(doc.data()) })));
      setSongsLoaded(true);
    }, (error) => {
      console.error("Error loading songs:", error);
      setSongsLoaded(true);
    });

    const unsubArtists = onSnapshot(collection(db, 'artists'), (snapshot) => {
      setArtists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setArtistsLoaded(true);
    }, (error) => {
      console.error("Error loading artists:", error);
      setArtistsLoaded(true);
    });

    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAchievementsLoaded(true);
    }, (error) => {
      console.error("Error loading achievements:", error);
      setAchievementsLoaded(true);
    });

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTestimonialsLoaded(true);
    }, (error) => console.error("Error loading testimonials:", error));

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReviewsLoaded(true);
    }, (error) => console.error("Error loading reviews:", error));

    return () => {
      unsubSongs();
      unsubArtists();
      unsubAchievements();
      unsubTestimonials();
      unsubReviews();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setQueries([]);
      return;
    }

    let q = isAdmin
      ? collection(db, 'queries')
      : query(collection(db, 'queries'), where('userId', '==', user.uid));

    const unsubQueries = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setQueries(data);
    });

    return () => unsubQueries();
  }, [isAdmin, user]);

  const loading = !songsLoaded || !artistsLoaded || !achievementsLoaded || !testimonialsLoaded || !reviewsLoaded;

  const enrichedSongs = useMemo(() => {
    if (loading) return [];
    return songs.map(song => {
      const artist = song.artistId ? artists.find(a => a.id === song.artistId) : null;
      return { ...song, artistName: artist ? artist.name : song.artistName || 'Unknown Artist' };
    });
  }, [songs, artists, loading]);

  const safeWrite = useCallback(async (operation, collectionName) => {
    if (!isAdmin) {
      alert("Permission denied. Admin only.");
      return null;
    }
    try {
      return await operation();
    } catch (error) {
      console.error(`Error writing to ${collectionName}:`, error);
      throw error;
    }
  }, [isAdmin]);

  const addSong = useCallback((data) => safeWrite(
    () => addDoc(collection(db, 'songs'), normalizeSong(data)),
    'songs'
  ), [safeWrite]);

  const updateSong = useCallback((id, data) => safeWrite(
    () => updateDoc(doc(db, 'songs', String(id)), normalizeSong(data)),
    'songs'
  ), [safeWrite]);

  const deleteSong = useCallback((id) => safeWrite(
    () => deleteDoc(doc(db, 'songs', String(id))),
    'songs'
  ), [safeWrite]);

  const addArtist = useCallback((data) => safeWrite(
    () => addDoc(collection(db, 'artists'), data),
    'artists'
  ), [safeWrite]);

  const updateArtist = useCallback((id, data) => safeWrite(
    () => updateDoc(doc(db, 'artists', String(id)), data),
    'artists'
  ), [safeWrite]);

  const deleteArtist = useCallback((id) => safeWrite(
    () => deleteDoc(doc(db, 'artists', String(id))),
    'artists'
  ), [safeWrite]);

  const addAchievement = useCallback((data) => safeWrite(
    () => addDoc(collection(db, 'achievements'), data),
    'achievements'
  ), [safeWrite]);

  const updateAchievement = useCallback((id, data) => safeWrite(
    () => updateDoc(doc(db, 'achievements', String(id)), data),
    'achievements'
  ), [safeWrite]);

  const deleteAchievement = useCallback((id) => safeWrite(
    () => deleteDoc(doc(db, 'achievements', String(id))),
    'achievements'
  ), [safeWrite]);

  const addTestimonial = useCallback((data) => safeWrite(
    () => addDoc(collection(db, 'testimonials'), data),
    'testimonials'
  ), [safeWrite]);

  const updateTestimonial = useCallback((id, data) => safeWrite(
    () => updateDoc(doc(db, 'testimonials', String(id)), data),
    'testimonials'
  ), [safeWrite]);

  const deleteTestimonial = useCallback((id) => safeWrite(
    () => deleteDoc(doc(db, 'testimonials', String(id))),
    'testimonials'
  ), [safeWrite]);

  const addReview = useCallback((data) => safeWrite(
    () => addDoc(collection(db, 'reviews'), data),
    'reviews'
  ), [safeWrite]);

  const updateReview = useCallback((id, data) => safeWrite(
    () => updateDoc(doc(db, 'reviews', String(id)), data),
    'reviews'
  ), [safeWrite]);

  const deleteReview = useCallback((id) => safeWrite(
    () => deleteDoc(doc(db, 'reviews', String(id))),
    'reviews'
  ), [safeWrite]);

  const updateLandingSelection = useCallback((data) => safeWrite(
    () => setDoc(doc(db, 'landingConfig', LANDING_CONFIG_DOC_ID), normalizeLandingSelection(data), { merge: true }),
    'landingConfig'
  ), [safeWrite]);

  const addQuery = useCallback(async (queryData) => {
    try {
      await addDoc(collection(db, 'queries'), {
        ...queryData,
        userId: user ? user.uid : null,
        userEmail: user ? user.email : queryData.email,
        createdAt: new Date(),
        read: false,
      });
    } catch (error) {
      console.error("Error submitting query:", error);
      throw error;
    }
  }, [user]);

  const updateQuery = useCallback(async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'queries', String(id)), data);
  }, [user]);

  const deleteQuery = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'queries', String(id)));
  }, [user]);

  const applySongFilter = useCallback((filter) => setSongFilter(filter), []);
  const clearSongFilter = useCallback(() => setSongFilter(null), []);

  const value = useMemo(() => ({
    songs: enrichedSongs,
    artists,
    achievements,
    testimonials,
    reviews,
    queries,
    addQuery, updateQuery, deleteQuery,
    addSong, updateSong, deleteSong,
    addArtist, updateArtist, deleteArtist,
    addAchievement, updateAchievement, deleteAchievement,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addReview, updateReview, deleteReview,
    landingSelection, updateLandingSelection,
    songFilter, applySongFilter, clearSongFilter,
    isAdmin, currentUser: user,
    loading
  }), [
    enrichedSongs, artists, achievements, testimonials, reviews, queries, landingSelection,
    songFilter, applySongFilter, clearSongFilter,
    addQuery, updateQuery, deleteQuery,
    addSong, updateSong, deleteSong,
    addArtist, updateArtist, deleteArtist,
    addAchievement, updateAchievement, deleteAchievement,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addReview, updateReview, deleteReview,
    updateLandingSelection,
    isAdmin, user, loading
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
  return context;
};