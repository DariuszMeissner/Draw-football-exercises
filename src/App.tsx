import { MouseEvent, useEffect, useRef, useState } from 'react';
import MultiTimeline from './components/MultiTimeline';
import { ActiveKeyframe, BaseObject, Keyframe } from './common/types';

type ObjectType = 'circle' | 'rectangle';
type Mode = 'pointer' | 'circle' | 'rectangle';
type FormatType = 'mp4';
type ProjectMode = 'image' | 'animation';

const DURATION = 5; // seconds
const FORMAT: FormatType = 'mp4';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [appMode, setAppMode] = useState<ProjectMode>('image');
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [layers, setLayers] = useState<BaseObject[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [currentXY, setCurrentXY] = useState<{ x: number; y: number } | null>(null);
  const [keyFrameActive, setKeyFrameActive] = useState<ActiveKeyframe | null>(null);
  const [mode, setMode] = useState<Mode>('pointer');
  const idRef = useRef(0);
  const backgroundColor = 'green';

  // Animation state
  const [animationTime, setAnimationTime] = useState(0);
  const [duration, setDuration] = useState(DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const canvasWidth = 600;
  const canvasHeight = 600;

  useEffect(() => {
    if (canvasRef.current) {
      setCtx(canvasRef.current.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    if (ctx) redraw();
  }, [ctx, layers, selectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        setKeyFrameActive(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (appMode === 'image') {
      restoreFirstKeyframe();
    }
  }, [appMode]);

  const restoreFirstKeyframe = () => {
    // Reset all objects to their first keyframe (if any)
    setLayers((prev) =>
      prev.map((obj) => {
        if (obj.keyframes?.length > 0) {
          const first = obj.keyframes[0];
          return { ...obj, x: first.x, y: first.y };
        }
        return obj;
      })
    );
  };

  const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const getClickedObject = (x: number, y: number) => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const obj = layers[i];
      if (obj.type === 'circle' && obj.radius) {
        if (distance(x, y, obj.x, obj.y) <= obj.radius) return obj.id;
      } else if (obj.type === 'rectangle' && obj.width && obj.height) {
        if (
          x >= obj.x - obj.width / 2 &&
          x <= obj.x + obj.width / 2 &&
          y >= obj.y - obj.height / 2 &&
          y <= obj.y + obj.height / 2
        )
          return obj.id;
      }
    }
    return null;
  };

  const onMouseDown = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'pointer') {
      const clickedId = getClickedObject(x, y);
      if (clickedId !== null) {
        setSelectedId(clickedId);
        setDragging(true);
      } else {
        setSelectedId(null);
        setKeyFrameActive(null);
      }
    } else {
      addObject(mode, x, y);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || selectedId === null) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentXY({ x, y });
    setLayers((prev) => prev.map((obj) => (obj.id === selectedId ? { ...obj, x, y } : obj)));
  };

  const onMouseUp = () => setDragging(false);

  const addObject = (type: ObjectType, x: number, y: number) => {
    idRef.current += 1;
    let newObj: BaseObject;
    const initFirstKeyFrame: Keyframe = { time: 0, x, y };
    const initLastKeyFrame: Keyframe = { time: DURATION, x, y };

    switch (type) {
      case 'circle':
        newObj = {
          id: idRef.current,
          name: `Circle ${idRef.current}`,
          type,
          x,
          y,
          radius: 40,
          color: '#ffffff',
          keyframes: [initFirstKeyFrame, initLastKeyFrame],
        };
        break;
      case 'rectangle':
        newObj = {
          id: idRef.current,
          name: `Rectangle ${idRef.current}`,
          type,
          x,
          y,
          width: 80,
          height: 60,
          color: '#ffffff',
          keyframes: [initFirstKeyFrame, initLastKeyFrame],
        };
        break;
      default:
        break;
    }

    setLayers((prev) => [...prev, newObj]);
  };

  const redraw = () => {
    if (!ctx) return;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    layers.forEach((obj) => {
      if (obj.hidden) return; // skip invisible objects

      ctx.fillStyle = obj.color;
      ctx.beginPath();

      if (obj.type === 'circle' && obj.radius) {
        ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obj.type === 'rectangle' && obj.width && obj.height) {
        ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
      }

      if (obj.id === selectedId) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        if (obj.type === 'circle' && obj.radius) {
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius + 5, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (obj.type === 'rectangle' && obj.width && obj.height) {
          ctx.strokeRect(obj.x - obj.width / 2 - 5, obj.y - obj.height / 2 - 5, obj.width + 10, obj.height + 10);
        }
      }
    });
  };

  const addKeyframe = () => {
    if (!selectedId) return;
    setLayers((prev) =>
      prev.map((obj) =>
        obj.id === selectedId
          ? {
              ...obj,
              keyframes: [...(obj.keyframes || []), { time: animationTime, x: obj.x, y: obj.y }].sort(
                (a, b) => a.time - b.time
              ),
            }
          : obj
      )
    );
  };

  const applyPosition = () => {
    if (selectedId && keyFrameActive && currentXY) {
      const { objId, keyIndex } = keyFrameActive;

      setLayers((prev) =>
        prev.map((obj) => {
          if (obj.id !== objId) return obj;
          const keyframes = [...obj.keyframes];
          const newKeyFrames = keyframes.map((frame, index) => {
            if (keyIndex !== index) return frame;
            return { time: animationTime, x: currentXY.x, y: currentXY.y };
          });
          return { ...obj, keyframes: newKeyFrames };
        })
      );
      setKeyFrameActive(null);
    }
  };

  const cancelPosition = () => {
    if (selectedId && keyFrameActive && currentXY) {
      setKeyFrameActive(null);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    startTimeRef.current = performance.now();

    const animate = (t: number) => {
      const elapsed = (t - (startTimeRef.current || 0)) / 1000;
      setAnimationTime(elapsed);
      applyAnimation(elapsed);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationRef.current!);
        setIsPlaying(false);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
  };

  const applyAnimation = (time: number) => {
    setLayers((prev) =>
      prev.map((obj) => {
        const frames = obj.keyframes || [];
        if (frames.length === 0) {
          // No animation → always visible
          return { ...obj, hidden: false };
        }

        const firstFrame = frames[0];
        const lastFrame = frames[frames.length - 1];

        // 1️⃣ Before first keyframe → hidden
        if (time < firstFrame.time) {
          return { ...obj, hidden: true };
        }

        // 2️⃣ After last keyframe
        if (time > lastFrame.time) {
          // Hide if last keyframe does not reach timeline end
          if (lastFrame.time < duration) {
            return { ...obj, hidden: true };
          } else {
            // Stays visible at last position
            return { ...obj, x: lastFrame.x, y: lastFrame.y, hidden: false };
          }
        }

        // 3️⃣ Between keyframes → interpolate
        let before = firstFrame;
        let after = lastFrame;
        for (let i = 0; i < frames.length - 1; i++) {
          if (time >= frames[i].time && time <= frames[i + 1].time) {
            before = frames[i];
            after = frames[i + 1];
            break;
          }
        }

        const progress = (time - before.time) / (after.time - before.time || 1);
        const x = before.x + (after.x - before.x) * progress;
        const y = before.y + (after.y - before.y) * progress;

        return { ...obj, x, y, hidden: false };
      })
    );
  };

  const startRecording = async () => {
    if (!canvasRef.current) return;
    const stream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animation.${FORMAT}`;
      a.click();
    };

    recorder.start();
    setIsRecording(true);
    playAnimation();
    setTimeout(() => {
      recorder.stop();
      setIsRecording(false);
    }, duration * 1000);
  };

  // === File operations ===
  const saveProject = () => {
    const project = {
      version: 4,
      backgroundColor,
      objects: layers,
      lastId: idRef.current,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project.json';
    link.click();
  };

  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        if (project.objects) {
          setLayers(project.objects);
          idRef.current = project.lastId || project.objects.length;
        }
      } catch {
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
  };

  const exportToJPG = () => {
    redraw();
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = 'canvas.jpg';

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      },
      'image/jpeg',
      1.0
    );
  };

  const moveLayerUp = (id: number) => {
    setLayers((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev; // already top or not found
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const moveLayerDown = (id: number) => {
    setLayers((prev) => {
      const idx = prev.findIndex((o) => o.id === id);
      if (idx <= 0) return prev; // already bottom or not found
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  };

  const deleteLayer = (id: number) => {
    setLayers((prev) => prev.filter((o) => o.id !== id));
    setSelectedId((sel) => (sel === id ? null : sel));
  };

  const onUpdateKeyframe = (objId: number, keyIndex: number, x: number, y: number) => {
    setLayers((prev) =>
      prev.map((obj) => {
        if (obj.id !== objId || !obj.keyframes) return obj;

        const newKFs = [...obj.keyframes];
        newKFs[keyIndex] = { ...newKFs[keyIndex], x, y };

        return { ...obj, keyframes: newKFs };
      })
    );
  };

  const selectedObj = layers.find((o) => o.id === selectedId);

  const onSelectKeyframeSetFirstFrame = (objId: number, keyIndex: number) => {
    const obj = layers.find((o) => o.id === objId);
    if (obj?.keyframes?.[keyIndex]) {
      const { x, y } = obj.keyframes[keyIndex];
      setLayers((prevLayers) => prevLayers.map((layer) => (layer.id === objId ? { ...layer, x, y } : layer)));
    }
  };

  // const removeKeyFrame = (objId: number, time: number) => {
  //   setLayers((prevLayers) =>
  //     prevLayers.map((layer) => {
  //       if (objId !== layer.id) return layer;

  //       const updateKeyframes = layer.keyframes.filter((kf) => kf.time !== time);
  //       return { ...layer, keyframes: updateKeyframes };
  //     })
  //   );
  // };

  const onMoveKeyframeTime = (objId: number, keyIndex: number, newTime: number) => {
    setLayers((prev) =>
      prev.map((obj) => {
        if (obj.id !== objId) return obj;
        if (!obj.keyframes) return obj;

        const updated = [...obj.keyframes];
        const frame = { ...updated[keyIndex], time: newTime };
        updated[keyIndex] = frame;

        // Always sort after time change
        updated.sort((a, b) => a.time - b.time);

        return { ...obj, keyframes: updated };
      })
    );
  };

  return (
    <div>
      <div style={{ padding: '5px 10px', background: appMode === 'animation' ? '#222' : '#444', color: 'white' }}>
        Mode: {appMode === 'animation' ? '🎬 Animation' : '🖼 Draw Image'}
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Sidebar */}
        <div style={{ minWidth: '220px', border: '1px solid #ccc', padding: '10px' }}>
          <h4>Layers</h4>
          {selectedId === null && <div style={{ fontStyle: 'italic', color: '#888' }}>No object selected</div>}

          {layers.map((obj) => (
            <div
              key={obj.id}
              onClick={() => setSelectedId(obj.id)}
              style={{
                cursor: 'pointer',
                padding: 5,
                marginBottom: 5,
                border: obj.id === selectedId ? '1px solid red' : '1px solid #ccc',
                background: obj.id === selectedId ? '#eee' : '',
              }}
            >
              {obj.name}
            </div>
          ))}

          {selectedObj && (
            <div style={{ marginTop: 10 }}>
              <h4>Edit {selectedObj.name}</h4>
              <input
                type="color"
                value={selectedObj.color}
                onChange={(e) =>
                  setLayers((prev) => prev.map((o) => (o.id === selectedObj.id ? { ...o, color: e.target.value } : o)))
                }
              />
              <button onClick={() => selectedId !== null && moveLayerUp(selectedId)}>Up</button>
              <button onClick={() => selectedId !== null && moveLayerDown(selectedId)}>Down</button>
              <button onClick={() => selectedId !== null && deleteLayer(selectedId)}>Remove</button>
            </div>
          )}

          {appMode === 'animation' && (
            <div style={{ marginTop: 20 }}>
              <h4>Animation</h4>
              <button onClick={addKeyframe} style={{ marginLeft: 5 }}>
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
          )}
        </div>

        {/* Canvas + Toolbar */}
        <div>
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
                <button onClick={() => setMode('rectangle')}>Rectangle</button>
                <button onClick={exportToJPG}>Export to jpg</button>
              </>
            )}

            {appMode === 'animation' && (
              <>
                <button onClick={startRecording} disabled={isRecording}>
                  🎥 Export Video
                </button>
              </>
            )}

            <button onClick={saveProject}>Save</button>
            <label style={{ cursor: 'pointer', marginLeft: 5 }}>
              📂 Load
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={loadProject} />
            </label>
          </div>

          {/* Info deselect object on ESC */}
          {selectedId && <div style={{ fontStyle: 'italic', color: '#888' }}>Click Esc to deselect object</div>}

          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ border: '1px solid #aaa', background: backgroundColor }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>
      </div>

      {appMode === 'animation' && (
        <div>
          <h4>Animation Timeline</h4>

          <MultiTimeline
            keyFrameActive={keyFrameActive}
            setKeyFrameActive={setKeyFrameActive}
            objects={layers}
            duration={duration}
            time={animationTime}
            onTimeChange={setAnimationTime}
            onUpdateKeyframe={onUpdateKeyframe}
            onMoveKeyframeTime={onMoveKeyframeTime}
            onMoveUp={moveLayerUp}
            onMoveDown={moveLayerDown}
            onDelete={deleteLayer}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onSelectKeyframeSetFirstFrame={onSelectKeyframeSetFirstFrame}
          />
        </div>
      )}
    </div>
  );
}

export default App;
