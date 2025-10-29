import { ProjectMode } from '../types/types';

type ObjectToolsPanelProps = {
  appMode: ProjectMode;
  addKeyframe: () => void;
  duration: number;
  animationTime: number;
  isPlaying: boolean;
  playAnimation: () => void;
  stopAnimation: () => void;
  selectedId: number | null;
};

export default function ObjectContextToolsPanel({
  appMode,
  addKeyframe,
  duration,
  animationTime,
  isPlaying,
  playAnimation,
  stopAnimation,
  selectedId,
}: ObjectToolsPanelProps) {
  return (
    <div id="object-context-tools">
      <div>Panel obiektu</div>

      {/* Info deselect object on ESC */}
      <div className="text-gray-400 italic" hidden={!selectedId}>
        <p>Click Esc to deselect object</p>
        <p>Click Delete to remove layer</p>
      </div>

      <div className="mt-5" hidden={appMode !== 'animation'}>
        <h4>Animation</h4>
        <button className="ml-1" onClick={addKeyframe}>
          + Add Keyframe
        </button>
        <div>
          Time: {animationTime.toFixed(2)}s / {duration}s
        </div>
        <button onClick={playAnimation} disabled={isPlaying}>
          ▶️ Play
        </button>
        <button onClick={stopAnimation} disabled={!isPlaying}>
          ⏹️ Stop
        </button>
      </div>
    </div>
  );
}
