// src/hooks/useCachedImage.js
import { useEffect, useState } from 'react';
import { loadImage } from '../util/ChatImageCache';

export function useCachedImage(file) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    let active = true;
    setLoading(true);

    loadImage(file)
      .then(blobUrl => {
        if (active) {
          setSrc(blobUrl);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [file]);

  return { src, loading, error };
}
