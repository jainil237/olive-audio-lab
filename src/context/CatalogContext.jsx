import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // --- ROBUST LOADING STATE ---
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [artistsLoaded, setArtistsLoaded] = useState(false);
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);
  
  const [songFilter, setSongFilter] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(!!currentUser); 
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Listeners (Songs, Artists, Achievements)
  useEffect(() => {
    // Songs Listener
    const unsubSongs = onSnapshot(collection(db, 'songs'), (snapshot) => {
      setSongs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSongsLoaded(true); // Mark songs as loaded
    }, (error) => {
        console.error("Error loading songs:", error);
        setSongsLoaded(true); // Stop loading even on error so app doesn't freeze
    });

    // Artists Listener
    const unsubArtists = onSnapshot(collection(db, 'artists'), (snapshot) => {
      setArtists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setArtistsLoaded(true); // Mark artists as loaded
    }, (error) => {
        console.error("Error loading artists:", error);
        setArtistsLoaded(true);
    });

    // Achievements Listener
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAchievementsLoaded(true); // Mark achievements as loaded
    }, (error) => {
        console.error("Error loading achievements:", error);
        setAchievementsLoaded(true);
    });

    return () => {
      unsubSongs();
      unsubArtists();
      unsubAchievements();
    };
  }, []);

  // 3. Queries Listener
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
      // Sort: Newest first
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setQueries(data);
    });

    return () => unsubQueries();
  }, [isAdmin, user]);

  // 4. Calculate Global Loading State
  // Loading is TRUE if ANY of the three parts are NOT loaded yet
  const loading = !songsLoaded || !artistsLoaded || !achievementsLoaded;

  // 5. Enrich Songs
  const enrichedSongs = useMemo(() => {
    if (loading) return []; // Don't compute until loaded
    return songs.map(song => {
      const artist = artists.find(a => a.id === song.artistId);
      return { ...song, artistName: artist ? artist.name : 'Unknown Artist' };
    });
  }, [songs, artists, loading]);

  // 6. Admin Helpers
  const safeWrite = async (operation, collectionName) => {
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
  };

  const addSong = (data) => safeWrite(() => addDoc(collection(db, 'songs'), data), 'songs');
  const updateSong = (id, data) => safeWrite(() => updateDoc(doc(db, 'songs', String(id)), data), 'songs');
  const deleteSong = (id) => safeWrite(() => deleteDoc(doc(db, 'songs', String(id))), 'songs');

  const addArtist = (data) => safeWrite(() => addDoc(collection(db, 'artists'), data), 'artists');
  const updateArtist = (id, data) => safeWrite(() => updateDoc(doc(db, 'artists', String(id)), data), 'artists');
  const deleteArtist = (id) => safeWrite(() => deleteDoc(doc(db, 'artists', String(id))), 'artists');

  const addAchievement = (data) => safeWrite(() => addDoc(collection(db, 'achievements'), data), 'achievements');
  const updateAchievement = (id, data) => safeWrite(() => updateDoc(doc(db, 'achievements', String(id)), data), 'achievements');
  const deleteAchievement = (id) => safeWrite(() => deleteDoc(doc(db, 'achievements', String(id))), 'achievements');
  
  const addQuery = async (queryData) => {
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
  };

  const updateQuery = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'queries', String(id)), data);
  };

  const deleteQuery = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'queries', String(id)));
  };

  const applySongFilter = (filter) => setSongFilter(filter);
  const clearSongFilter = () => setSongFilter(null);

  const value = useMemo(() => ({
    songs: enrichedSongs,
    artists,
    achievements,
    queries,        
    addQuery, updateQuery, deleteQuery,    
    addSong, updateSong, deleteSong,
    addArtist, updateArtist, deleteArtist,
    addAchievement, updateAchievement, deleteAchievement,
    songFilter, applySongFilter, clearSongFilter,
    isAdmin, currentUser: user,
    loading // Export the robust loading state
  }), [
    enrichedSongs, artists, achievements, queries, songFilter, isAdmin, user, 
    loading, // Add loading to dependency array
    // Include functions in dependency array or omit them if they are stable ref:
    // Ideally wrap functions in useCallback, but for now this is fine.
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
  return context;
}; 