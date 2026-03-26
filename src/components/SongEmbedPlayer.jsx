import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';

const LOAD_TIMEOUT_MS = 15000;

/**
 * Extract Apple Music song ID from embed HTML.
 * Embed URLs look like: https://embed.music.apple.com/us/album/name/albumId?i=songId
 * or: https://embed.music.apple.com/us/song/name/songId
 */
const extractAppleMusicId = (html) => {
  if (!html || !html.includes('music.apple.com')) return null;
  // Match ?i=DIGITS (song within an album embed)
  const paramMatch = html.match(/[?&]i=(\d+)/);
  if (paramMatch) return paramMatch[1];
  // Match /song/name/DIGITS or /album/name/DIGITS at end of URL
  const pathMatch = html.match(/music\.apple\.com\/[a-z]{2}\/(?:song|album)\/[^/]+\/(\d+)/);
  if (pathMatch) return pathMatch[1];
  return null;
};

/**
 * Extract SoundCloud track URL from embed HTML to validate it.
 * Embed URLs contain: url=https%3A//api.soundcloud.com/tracks/TRACK_ID
 */
const extractSoundCloudUrl = (html) => {
  if (!html || !html.includes('soundcloud.com')) return null;
  const match = html.match(/url=([^&"]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Validate an Apple Music song ID via the public iTunes Lookup API.
 * Returns true if valid, false if the song doesn't exist.
 */
const validateAppleMusicId = async (songId) => {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${songId}&entity=song`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.resultCount > 0;
  } catch {
    // Network error — don't block, assume OK
    return true;
  }
};

/**
 * Validate a SoundCloud track URL by checking if the page resolves.
 * Uses a HEAD request with no-cors as fallback.
 */
const validateSoundCloudUrl = async (trackUrl) => {
  try {
    const res = await fetch(trackUrl, { method: 'HEAD', mode: 'no-cors' });
    // no-cors returns opaque response (status 0), which is fine — just means it's reachable
    return true;
  } catch {
    // Network error = the URL is unreachable
    return false;
  }
};

const SongEmbedPlayer = ({
  embedHtml,
  providerLabel = 'this source',
  minHeight = 160,
  fixedHeight,
  fallbackText = 'Embed not available for this track yet.',
  className = '',
  onError,
  ...otherProps
}) => {
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [validated, setValidated] = useState(false); // pre-validation complete?

  // Reset states when embed changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setValidated(false);
  }, [embedHtml]);

  // Pre-validate embed URL before rendering iframe
  useEffect(() => {
    if (!embedHtml) {
      setValidated(true);
      return;
    }

    let cancelled = false;

    const validate = async () => {
      // Check Apple Music
      const appleId = extractAppleMusicId(embedHtml);
      if (appleId) {
        const isValid = await validateAppleMusicId(appleId);
        if (!cancelled && !isValid) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
        if (!cancelled) setValidated(true);
        return;
      }

      // Check SoundCloud
      const scUrl = extractSoundCloudUrl(embedHtml);
      if (scUrl) {
        const isValid = await validateSoundCloudUrl(scUrl);
        if (!cancelled && !isValid) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
        if (!cancelled) setValidated(true);
        return;
      }

      // Unknown provider — skip validation
      if (!cancelled) setValidated(true);
    };

    validate();
    return () => { cancelled = true; };
  }, [embedHtml, onError]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle iframe setup, load detection, and error detection (only after validation passes)
  useEffect(() => {
    if (!embedHtml || !validated || hasError) return;
    const container = containerRef.current;
    if (!container) return;

    const setupTimer = setTimeout(() => {
      const iframe = container.querySelector('iframe');
      if (!iframe) {
        setHasError(true);
        setIsLoading(false);
        onError?.();
        return;
      }

      iframe.setAttribute('width', '100%');
      iframe.style.width = '100%';
      iframe.classList.add('rounded-2xl');

      if (!iframe.getAttribute('title')) {
        iframe.setAttribute('title', `${providerLabel} Audio Player`);
      }
      if (!iframe.getAttribute('loading')) {
        iframe.setAttribute('loading', 'lazy');
      }
      if (!iframe.getAttribute('allow')) {
        iframe.setAttribute('allow', 'autoplay *; encrypted-media *; fullscreen *; clipboard-write');
      }

      const handleLoad = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsLoading(false);
      };

      const handleError = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, LOAD_TIMEOUT_MS);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, 50);

    return () => clearTimeout(setupTimer);
  }, [embedHtml, providerLabel, validated, hasError, onError]);

  // Compute the height style
  const heightStyle = fixedHeight
    ? { height: `${fixedHeight}px` }
    : { minHeight: `${minHeight}px` };

  // No embed provided
  if (!embedHtml) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 px-4 py-6 text-center text-xs text-zinc-500',
          className
        )}
        style={heightStyle}
      >
        {fallbackText}
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-6 text-center',
          className
        )}
        style={heightStyle}
        role="alert"
      >
        <AlertTriangle className="w-8 h-8 text-red-400/70 mb-3" />
        <p className="text-sm font-medium text-red-300/80">
          Song not available from {providerLabel}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          This track may have been removed or the embed is no longer valid.
        </p>
      </div>
    );
  }

  // Still validating — show placeholder
  if (!validated) {
    return (
      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-inner',
          className
        )}
        style={heightStyle}
      >
        {otherProps.placeholder}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-inner',
        className
      )}
      style={heightStyle}
    >
      {/* Placeholder overlay (visible while loading) */}
      <div
        className={clsx(
          "absolute inset-0 z-10 transition-opacity duration-500",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {otherProps.placeholder}
      </div>

      <div
        className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    </div>
  );
};

export default SongEmbedPlayer;
