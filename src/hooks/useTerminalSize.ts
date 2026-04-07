import { useState, useEffect } from 'react';

export function useTerminalSize() {
  const [size, setSize] = useState({
    cols: process.stdout.columns ?? 100,
    rows: process.stdout.rows ?? 30,
  });

  useEffect(() => {
    function onResize() {
      setSize({
        cols: process.stdout.columns ?? 100,
        rows: process.stdout.rows ?? 30,
      });
    }
    process.stdout.on('resize', onResize);
    return () => { process.stdout.off('resize', onResize); };
  }, []);

  return size;
}
