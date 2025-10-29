import { ActiveKeyframe, Mode, ProjectMode } from '../types/types';

type ToolbarProps = {
  appMode: ProjectMode;
  setAppMode: (mode: ProjectMode) => void;
  applyPosition: () => void;
  cancelPosition: () => void;
  keyFrameActive: ActiveKeyframe | null;
  isRecording: boolean;
  setMode: (mode: Mode) => void;
  exportToJPG: () => void;
  exportVideo: () => void;
  saveProject: () => void;
  loadProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Toolbar({
  appMode,
  setAppMode,
  applyPosition,
  cancelPosition,
  keyFrameActive,
  isRecording,
  setMode,
  exportToJPG,
  exportVideo,
  saveProject,
  loadProject,
}: ToolbarProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div>
        <button
          onClick={() => setAppMode('animation')}
          style={{ background: '#333', color: 'white', marginRight: 10 }}
          hidden={appMode !== 'image'}
        >
          🎬 Enter Animation Mode
        </button>
        <button
          onClick={() => setAppMode('image')}
          style={{ background: '#555', color: 'white', marginRight: 10 }}
          hidden={appMode !== 'animation'}
        >
          🖼 Exit Animation Mode
        </button>
      </div>

      <button onClick={applyPosition} style={{ marginLeft: 5 }} hidden={!keyFrameActive}>
        Apply new position
      </button>
      <button onClick={cancelPosition} style={{ marginLeft: 5 }} hidden={!keyFrameActive}>
        Cancel new position
      </button>

      <button onClick={() => setMode('pointer')}>Pointer</button>

      {appMode === 'image' && (
        <>
          <button onClick={() => setMode('circle')}>Circle</button>
          <button onClick={() => setMode('player')}>Player</button>
          <button onClick={exportToJPG}>Export to jpg</button>
        </>
      )}

      <button onClick={exportVideo} disabled={isRecording} hidden={appMode !== 'animation'}>
        🎥 Export Video
      </button>

      <button onClick={saveProject}>Save</button>
      <label className="cursor-pointer ml-1">
        📂 Load
        <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadProject} />
      </label>
    </div>
  );
}
