import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

const SongEmbedPlayer = ({
  embedHtml,
  minHeight = 160,
  fallbackText = 'Embed not available for this track yet.',
  className = '',
  ...otherProps
}) => {
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [embedHtml]);

  useEffect(() => {
    if (!embedHtml) return;
    const container = containerRef.current;
    if (!container) return;
    const iframe = container.querySelector('iframe');
    if (!iframe) return;

    iframe.setAttribute('width', '100%');
    iframe.style.width = '100%';
    iframe.classList.add('rounded-2xl');

    if (!iframe.getAttribute('loading')) {
      iframe.setAttribute('loading', 'lazy');
    }

    if (!iframe.getAttribute('allow')) {
      iframe.setAttribute('allow', 'autoplay *; encrypted-media *; fullscreen *; clipboard-write');
    }

    // Handle load event
    const handleLoad = () => setIsLoading(false);
    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [embedHtml]);

  if (!embedHtml) {
    return (
      <div className={clsx(
        'rounded-2xl border border-dashed border-white/10 bg-black/30 px-4 py-6 text-center text-xs text-zinc-500',
        className
      )}>
        {fallbackText}
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
      style={{ minHeight: `${minHeight}px` }}
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
        className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:min-h-[160px]"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    </div>
  );
};

export default SongEmbedPlayer;
