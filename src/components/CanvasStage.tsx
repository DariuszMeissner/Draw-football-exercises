import { Ref } from 'react';

interface CanvasStageProps {
  canvasRef: Ref<HTMLCanvasElement>;
  bgRef: Ref<HTMLDivElement>;
  currentPitch: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  width: number;
  height: number;
}

export default function CanvasStage({
  canvasRef,
  bgRef,
  currentPitch,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  width,
  height,
}: CanvasStageProps) {
  return (
    <>
      <canvas
        id="exercise-layer"
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      <div id="background-layer" ref={bgRef} style={{ width, height, backgroundImage: `url(${currentPitch})` }} />
    </>
  );
}
