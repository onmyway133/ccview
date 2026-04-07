import { useEffect } from 'react';

type ScrollCallback = (direction: 'up' | 'down') => void;

/**
 * Enables terminal mouse reporting and calls `onScroll` on wheel/trackpad scroll.
 *
 * Uses SGR extended mouse mode (\x1b[?1006h) with any-event tracking (\x1b[?1003h).
 * Cleans up and restores normal mode on unmount.
 */
export function useMouseScroll(onScroll: ScrollCallback) {
  useEffect(() => {
    // Enable mouse tracking: any-event mode + SGR extended coordinates
    process.stdout.write('\x1b[?1003h\x1b[?1006h');

    function handleData(chunk: Buffer) {
      const str = chunk.toString('binary');

      // SGR format: \x1b[<button;col;rowM (press) or \x1b[<button;col;rowm (release)
      // Button 64 = scroll up, 65 = scroll down
      const sgr = str.match(/\x1b\[<(\d+);\d+;\d+[Mm]/g);
      if (sgr) {
        for (const seq of sgr) {
          const m = seq.match(/\x1b\[<(\d+)/);
          if (!m) continue;
          const btn = parseInt(m[1]);
          if (btn === 64) onScroll('up');
          if (btn === 65) onScroll('down');
        }
        return;
      }

      // X10 fallback: \x1b[M + 3 raw bytes, button byte = charCode - 32
      let i = 0;
      while (i < str.length) {
        const idx = str.indexOf('\x1b[M', i);
        if (idx === -1 || idx + 5 >= str.length) break;
        const btn = str.charCodeAt(idx + 3) - 32;
        if (btn === 64) onScroll('up');
        if (btn === 65) onScroll('down');
        i = idx + 6;
      }
    }

    process.stdin.on('data', handleData);

    return () => {
      process.stdout.write('\x1b[?1003l\x1b[?1006l');
      process.stdin.off('data', handleData);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
