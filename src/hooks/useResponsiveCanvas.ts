import { useLayoutEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH_INIT, CANVAS_HEIGHT_INIT } from '../config/config';

type Return = {
  canvasWidth: number;
  canvasHeight: number;
};

export default function useResponsiveCanvas(
  onScaleChange?: (scaleRatio: number) => void,
  debounceMs: number = 50
): Return {
  const [canvasWidth, setCanvasWidth] = useState<number>(CANVAS_WIDTH_INIT);
  const [canvasHeight, setCanvasHeight] = useState<number>(CANVAS_HEIGHT_INIT);

  const aspectRatio = CANVAS_WIDTH_INIT / CANVAS_HEIGHT_INIT;
  const prevScaleRef = useRef<number>(1);
  const timeoutRef = useRef<number | null>(null);

  const handleResize = () => {
    const newWidth = Math.min(window.innerWidth - 100, CANVAS_WIDTH_INIT);
    const newHeight = newWidth / aspectRatio;
    const newScale = newWidth / CANVAS_WIDTH_INIT;
    const scaleRatio = newScale / prevScaleRef.current;

    // Notify parent about scale change (for rescaling objects)
    if (onScaleChange && scaleRatio !== 1) {
      onScaleChange(scaleRatio);
    }

    // Update internal state
    prevScaleRef.current = newScale;
    setCanvasWidth(Math.round(newWidth));
    setCanvasHeight(Math.round(newHeight));
  };

  const handleEventResize = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleResize, debounceMs);
  };

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener('resize', handleEventResize);
    return () => window.removeEventListener('resize', handleEventResize);
  }, []);

  return { canvasWidth, canvasHeight };
}
