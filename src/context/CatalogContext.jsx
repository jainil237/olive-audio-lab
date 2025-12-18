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
  const [songFilter, setSongFilter] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(!!currentUser); // Replace with your actual Admin logic (e.g. check email)
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Public Data (Songs, Artists, Achievements)
  useEffect(() => {
    const unsubSongs = onSnapshot(collection(db, 'songs'), (snapshot) => {
      setSongs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubArtists = onSnapshot(collection(db, 'artists'), (snapshot) => {
      setArtists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubSongs();
      unsubArtists();
      unsubAchievements();
    };
  }, []);

  // 3. Fetch Queries (User Specific)
  // This logic ensures Viewers ONLY see their own queries.
  useEffect(() => {
    let q;

    if (!user) {
      setQueries([]);
      return;
    }

    if (isAdmin) {
      // NOTE: If you want Admin to see ONLY their own queries on the user-facing page, 
      // change this to use 'where userId' as well. 
      // Currently: Admin sees ALL queries (useful for the Admin Dashboard page).
      q = collection(db, 'queries');
    } else {
      // Regular User: Sees ONLY their own queries
      q = query(collection(db, 'queries'), where('userId', '==', user.uid));
    }

    const unsubQueries = onSnapshot(q, (snapshot) => {
      // Sort by createdAt descending (newest first)
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

  // 4. Helper to enrich songs
  const enrichedSongs = useMemo(() => {
    return songs.map(song => {
      const artist = artists.find(a => a.id === song.artistId);
      return { ...song, artistName: artist ? artist.name : 'Unknown Artist' };
    });
  }, [songs, artists]);

  // 5. Admin Safe Write Helper
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

  // 6. CRUD Operations (Admin)
  const addSong = (data) => safeWrite(() => addDoc(collection(db, 'songs'), data), 'songs');
  const updateSong = (id, data) => safeWrite(() => updateDoc(doc(db, 'songs', String(id)), data), 'songs');
  const deleteSong = (id) => safeWrite(() => deleteDoc(doc(db, 'songs', String(id))), 'songs');

  const addArtist = (data) => safeWrite(() => addDoc(collection(db, 'artists'), data), 'artists');
  const updateArtist = (id, data) => safeWrite(() => updateDoc(doc(db, 'artists', String(id)), data), 'artists');
  const deleteArtist = (id) => safeWrite(() => deleteDoc(doc(db, 'artists', String(id))), 'artists');

  const addAchievement = (data) => safeWrite(() => addDoc(collection(db, 'achievements'), data), 'achievements');
  const updateAchievement = (id, data) => safeWrite(() => updateDoc(doc(db, 'achievements', String(id)), data), 'achievements');
  const deleteAchievement = (id) => safeWrite(() => deleteDoc(doc(db, 'achievements', String(id))), 'achievements');
  
  // 7. QUERY OPERATIONS (User & Admin)
  
  // Create
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

  // Update (User can update own query)
  const updateQuery = async (id, data) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'queries', String(id)), data);
    } catch (error) {
      console.error("Error updating query:", error);
      throw error;
    }
  };

  // Delete (User can delete own query)
  const deleteQuery = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'queries', String(id)));
    } catch (error) {
      console.error("Error deleting query:", error);
      throw error;
    }
  };

  const applySongFilter = (filter) => setSongFilter(filter);
  const clearSongFilter = () => setSongFilter(null);

  const value = useMemo(() => ({
    songs: enrichedSongs,
    artists,
    achievements,
    queries,        
    addQuery,       
    updateQuery,    // <--- Added
    deleteQuery,    // <--- Added
    addSong, updateSong, deleteSong,
    addArtist, updateArtist, deleteArtist,
    addAchievement, updateAchievement, deleteAchievement,
    songFilter, applySongFilter, clearSongFilter,
    isAdmin, currentUser: user,
  }), [enrichedSongs, artists, achievements, queries, songFilter, isAdmin, user]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within a CatalogProvider');
  return context;
};