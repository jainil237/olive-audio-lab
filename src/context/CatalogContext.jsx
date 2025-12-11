import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ACHIEVEMENTS as initialAchievements, ARTISTS as initialArtists, SONGS as initialSongs } from '../data/catalog.js';
import { useAuth } from './AuthContext.jsx';

const CatalogContext = createContext(null);

const SONG_FILTER_STORAGE_KEY = 'olive:song-filter';

const normalizeArtistIds = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value))
      .filter((value, index, self) => self.indexOf(value) === index);
  }
  if (input == null) return [];
  const single = Number(input);
  return Number.isInteger(single) ? [single] : [];
};

const readStoredSongFilter = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SONG_FILTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.artistIds)) return null;
    const artistIds = normalizeArtistIds(parsed.artistIds);
    return artistIds.length ? { artistIds } : null;
  } catch (error) {
    console.warn('Failed to read stored song filter', error);
    return null;
  }
};

const persistSongFilter = (filter) => {
  if (typeof window === 'undefined') return;
  try {
    if (filter?.artistIds?.length) {
      sessionStorage.setItem(SONG_FILTER_STORAGE_KEY, JSON.stringify({ artistIds: filter.artistIds }));
    } else {
      sessionStorage.removeItem(SONG_FILTER_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to persist song filter', error);
  }
};

const createId = (prefix) => `${prefix}_${Date.now()}`;

export const CatalogProvider = ({ children }) => {
  const [songs, setSongs] = useState(initialSongs.map((song) => ({ ...song, artistIds: normalizeArtistIds(song.artistIds ?? song.artistId) })));
  const [artists, setArtists] = useState(initialArtists);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [songFilter, setSongFilter] = useState(() => readStoredSongFilter());
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const enrichSong = useCallback(
    (input) => {
      const { artistId, artistIds, genres, streaming, ...rest } = input;
      const normalizedIds = normalizeArtistIds(artistIds ?? artistId);
      const artistNames = normalizedIds
        .map((id) => artists.find((artist) => artist.id === id)?.name)
        .filter(Boolean);

      return {
        id: rest.id ?? createId('song'),
        genres: Array.isArray(genres) ? genres : genres ? [genres].flat() : [],
        streaming: streaming ? { ...streaming } : {},
        artistIds: normalizedIds,
        artist: artistNames.length ? artistNames.join(' x ') : rest.artist || 'Independent artist',
        ...rest,
      };
    },
    [artists],
  );

  // ---- SONG OPERATIONS ----
  const addSong = useCallback(
    (song) => {
      setSongs((prev) => [enrichSong(song), ...prev]);
    },
    [enrichSong],
  );

  const updateSong = useCallback(
    (id, updates) => {
      setSongs((prev) => prev.map((song) => (song.id === id ? enrichSong({ ...song, ...updates }) : song)));
    },
    [enrichSong],
  );

  const deleteSong = useCallback((id) => {
    setSongs((prev) => prev.filter((song) => song.id !== id));
  }, []);

  const applySongFilter = useCallback((filter) => {
    if (filter?.artistIds) {
      const artistIds = normalizeArtistIds(filter.artistIds);
      if (artistIds.length === 0) {
        setSongFilter(null);
        persistSongFilter(null);
        return;
      }
      const next = { artistIds };
      setSongFilter(next);
      persistSongFilter(next);
      return;
    }
    setSongFilter(null);
    persistSongFilter(null);
  }, []);

  const clearSongFilter = useCallback(() => {
    setSongFilter(null);
    persistSongFilter(null);
  }, []);

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
    setSongs((prev) =>
      prev.map((song) => {
        if (!song.artistIds?.includes(id)) {
          return song;
        }
        const remainingIds = song.artistIds.filter((artistId) => artistId !== id);
        return enrichSong({ ...song, artistIds: remainingIds });
      }),
    );
  }, [enrichSong]);

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
