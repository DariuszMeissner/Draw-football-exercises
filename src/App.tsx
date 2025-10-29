import { MouseEvent, useEffect, useRef, useState } from 'react';
import MultiTimeline from './components/MultiTimeline';
import {
  ActiveKeyframe,
  BaseObject,
  Project,
  Keyframe,
  Mode,
  ObjectSize,
  ObjectType,
  ProjectMode,
} from './types/types';
import CanvasStage from './components/CanvasStage';
import CanvasContextMenu from './components/CanvasContextMenu';
import LayerSidebar from './components/LayerSidebar';
import ObjectToolsPanel from './components/ObjectContextToolsPanel';
import Toolbar from './components/Toolbar';
import useResponsiveCanvas from './hooks/useResponsiveCanvas';
import {
  directionAngles,
  findClosestFrame,
  getClickedObject,
  isClickOnRing,
  normalizeAngle,
  playerNamesHelper,
} from './helpers/helpers';
import { getPlayerRingGeometry } from './utils/playerGeometry';
import { DEFAULT_SIZE, DURATION, FORMAT, HEIGHT_INIT, RADIUS_INIT, STEP_SIZE, WIDTH_INIT } from './config/config';

function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idRef = useRef(0);

  const [appMode, setAppMode] = useState<ProjectMode>('image');
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [layers, setLayers] = useState<BaseObject[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<BaseObject>();
  const [dragging, setDragging] = useState(false);
  const [currentXY, setCurrentXY] = useState<{ x: number; y: number } | null>(null);
  const [keyFrameActive, setKeyFrameActive] = useState<ActiveKeyframe | null>(null);
  const [mode, setMode] = useState<Mode>('pointer');
  const backgroundColor = 'green';

  // rotation state
  const [isRotating, setIsRotating] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<number | null>(null);

  // Animation state
  const [animationTime, setAnimationTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DURATION);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [playerFrames, setPlayerFrames] = useState<HTMLImageElement[]>([]);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [pitchFrames, setPitchFrames] = useState<HTMLImageElement[]>([]);
  const [currentPitch, setCurrentPitch] = useState<string>();

  const { canvasWidth, canvasHeight } = useResponsiveCanvas((scaleRatio) => {
    setLayers((prev) =>
      prev.map((obj) => ({
        ...obj,
        x: obj.x * scaleRatio,
        y: obj.y * scaleRatio,
        radius: obj.radius ? obj.radius * scaleRatio : obj.radius,
        width: obj.width ? obj.width * scaleRatio : obj.width,
        height: obj.height ? obj.height * scaleRatio : obj.height,
        keyframes: obj.keyframes?.map((kf) => ({
          ...kf,
          x: kf.x * scaleRatio,
          y: kf.y * scaleRatio,
        })),
      }))
    );
  });

  useEffect(() => {
    const sourcesPlayerRun = [
      './src/assets/players/player-run-l.svg',
      './src/assets/players/player-run-bl.svg',
      './src/assets/players/player-run-b.svg',
      './src/assets/players/player-run-br.svg',
      './src/assets/players/player-run-r.svg',
      './src/assets/players/player-run-fr.svg',
      './src/assets/players/player-run-f.svg',
      './src/assets/players/player-run-fl.svg',
    ];

    const sourcesPitch = ['./src/assets/bgs/green-depth-cert-half-back.svg'];

    const imgsPLayerRun: HTMLImageElement[] = [];
    const imgsPitch: HTMLImageElement[] = [];

    sourcesPlayerRun.forEach((src, index, array) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (index === array.length - 1) setPlayerFrames(imgsPLayerRun);
      };
      imgsPLayerRun.push(img);
    });

    sourcesPitch.forEach((src, index, array) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (index === array.length - 1) setPitchFrames(imgsPitch);
      };
      imgsPitch.push(img);
    });

    setCurrentPitch(imgsPitch[0].src);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setContextMenuPos(null);
      return;
    }

    const debounce = setTimeout(() => {
      const selectedObj = layers.find((o) => o.id === selectedId);
      if (selectedObj) {
        setContextMenuPos({
          x: selectedObj.x,
          y: selectedObj.y + 50, // menu below object
        });
      }
      clearTimeout(debounce);
    }, 20);
  }, [selectedId, layers]);

  useEffect(() => {
    if (canvasRef.current) {
      setCtx(canvasRef.current.getContext('2d'));
    }
  }, []);

  useEffect(() => {
    if (ctx) redraw();
  }, [ctx, layers, selectedId, canvasWidth, canvasHeight]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedId(null);
      setKeyFrameActive(null);
      setContextMenuPos(null);
    }

    if (e.key === 'Delete' && selectedId) {
      deleteLayer(selectedId);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

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

  const onMouseDown = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'pointer') {
      const clickedId = getClickedObject(x, y, layers);
      let currObj = layers.find((obj) => obj.id === clickedId);

      // FIX: if no direct hit but selected player exists → check if ring was clicked
      if (!currObj && selectedObject?.type === 'player' && isClickOnRing(x, y, selectedObject)) {
        currObj = selectedObject;
      }

      if (currObj) {
        // If player ring clicked → rotation mode
        if (currObj.type === 'player' && isClickOnRing(x, y, currObj)) {
          setSelectedId(currObj.id);
          setSelectedObject(currObj);
          setIsRotating(true);
          setDragging(true);

          // Compute start angle relative to ring center
          const cx = currObj.x;
          const cy = currObj.y + (currObj.height ?? 0) / 2;
          const startAngle = Math.atan2(y - cy, x - cx);
          setRotationAngle(startAngle);

          // Optional: snap frame immediately for visual feedback
          const { frameName } = findClosestFrame(startAngle);
          setLayers((prev) => prev.map((o) => (o.id === currObj.id ? { ...o, frameName } : o)));

          return; // stop here (don’t trigger drag)
        }

        // 🟩 Otherwise, normal dragging logic
        setSelectedId(currObj.id);
        setDragging(true);
        setSelectedObject(currObj);
      } else {
        // Nothing clicked → deselect
        setSelectedId(null);
        setSelectedObject(undefined);
        setContextMenuPos(null);
      }
    } else {
      addObject(mode, x, y);
      setContextMenuPos(null);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ROTATION: live update
    if (isRotating && selectedId !== null) {
      const player = layers.find((obj) => obj.id === selectedId);
      if (!player) return;

      const cx = player.x;
      const cy = player.y + (player.height ?? 0) / 2;
      const angle = Math.atan2(y - cy, x - cx);
      const norm = normalizeAngle(angle);
      setRotationAngle(norm);

      // Live snap: set frameName every mousemove for immediate feedback
      const { frameName, imageFrame } = findClosestFrame(norm);
      setLayers((prev) => prev.map((o) => (o.id === selectedId ? { ...o, frameName, imageFrame } : o)));

      // we do not process normal dragging while rotating
      return;
    }

    // DRAGGING: move object (keep your debounce)
    if (!dragging || selectedId === null) return;

    const debounce = setTimeout(() => {
      setCurrentXY({ x, y });
      setLayers((prev) => prev.map((obj) => (obj.id === selectedId ? { ...obj, x, y } : obj)));
      clearTimeout(debounce);
    }, 20);
  };

  const onMouseUp = () => {
    if (isRotating) {
      setIsRotating(false);
      setRotationAngle(null);
    }

    setDragging(false);
  };

  const addObject = (type: ObjectType, x: number, y: number) => {
    idRef.current += 1;
    let newObj: BaseObject;
    const initFirstKeyFrame: Keyframe = { time: 0, x, y };
    const initLastKeyFrame: Keyframe = { time: DURATION, x, y };

    switch (type) {
      case 'player':
        newObj = {
          id: idRef.current,
          name: `Player ${idRef.current}`,
          type,
          x,
          y,
          width: WIDTH_INIT,
          height: HEIGHT_INIT,
          color: '#ffffff',
          keyframes: [initFirstKeyFrame, initLastKeyFrame],
          imageFrame: 0,
          size: DEFAULT_SIZE,
          frameName: 'player-run-left',
        };
        break;
      default:
        newObj = {
          id: idRef.current,
          name: `Circle ${idRef.current}`,
          type,
          x,
          y,
          radius: RADIUS_INIT,
          width: RADIUS_INIT,
          height: RADIUS_INIT,
          color: '#ffffff',
          keyframes: [initFirstKeyFrame, initLastKeyFrame],
          imageFrame: 0,
          size: DEFAULT_SIZE,
        };
        break;
    }

    setSelectedObject(newObj);
    setLayers((prev) => [...prev, newObj]);
    setSelectedId(newObj.id);
    setMode('pointer');
    setContextMenuPos({ x, y: y + 50 }); // show menu immediately
  };

  const redraw = () => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    layers.forEach((obj) => {
      // skip invisible objects
      if (obj.hidden) return;

      // draw ring/oval
      if (obj.type === 'player' && obj.id === selectedId) {
        const frameIndex = obj.imageFrame ?? 0;
        const playerDir = playerNamesHelper[frameIndex] || 'player-run-front';
        const { centerX, centerY, radiusX, radiusY } = getPlayerRingGeometry(obj);

        // === Draw elliptical ring ===
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
        ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        // === Draw direction arrow ===
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1, radiusY / radiusX); // flatten to match ellipse

        // Arrow parameters
        const angle = directionAngles[playerDir];
        const arrowRadius = radiusX;
        const baseRadius = 12;
        const baseAngleLeft = angle + Math.PI * 0.6;
        const baseAngleRight = angle - Math.PI * 0.6;

        //arrow
        ctx.beginPath();
        ctx.moveTo(arrowRadius * Math.cos(angle), arrowRadius * Math.sin(angle));
        ctx.lineTo(
          (arrowRadius - baseRadius) * Math.cos(baseAngleLeft),
          (arrowRadius - baseRadius) * Math.sin(baseAngleLeft)
        );
        ctx.lineTo(
          (arrowRadius - baseRadius) * Math.cos(baseAngleRight),
          (arrowRadius - baseRadius) * Math.sin(baseAngleRight)
        );
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 238, 0, 1)';
        ctx.fill();

        ctx.restore();
      } else if (obj.type === 'circle' && obj.radius) {
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.restore();
      }

      // draw object
      ctx.fillStyle = obj.color;
      ctx.beginPath();

      if (obj.type === 'circle' && obj.radius) {
        ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obj.type === 'player') {
        const frame = playerFrames[obj.imageFrame];
        ctx.drawImage(frame, obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
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

  const exportVideo = async () => {
    if (!canvasRef.current) return;
    const stream = canvasRef.current.captureStream(20);
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

  const saveProject = () => {
    const project: Project = {
      version: idRef.current,
      backgroundColor,
      backgroundImage: currentPitch,
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
        const project: Project = JSON.parse(e.target?.result as string);
        if (project.objects) {
          setLayers(project.objects);
          setCurrentPitch(project.backgroundImage);
          idRef.current = project.lastId || project.objects.length;
        }
      } catch {
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
  };

  const exportToJPG = async () => {
    setSelectedId(null);
    setSelectedObject(undefined);
    setMode('pointer');

    redraw();
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;

    // Create offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw background image (or color)
    const bgDiv = bgRef.current;
    const bgStyle = bgDiv ? window.getComputedStyle(bgDiv) : null;
    const bgUrl = bgStyle?.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

    if (bgUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = bgUrl;

      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = resolve;
      });

      exportCtx.drawImage(bgImg, 0, 0, width, height);
    } else {
      exportCtx.fillStyle = backgroundColor;
      exportCtx.fillRect(0, 0, width, height);
    }

    // Draw the main canvas layer
    exportCtx.drawImage(canvas, 0, 0);

    // Export to JPEG
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = 'project-export.jpg';
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
    setSelectedObject(undefined);
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

  const onSelectKeyframeSetFirstFrame = (objId: number, keyIndex: number) => {
    const obj = layers.find((o) => o.id === objId);
    if (obj?.keyframes?.[keyIndex]) {
      const { x, y } = obj.keyframes[keyIndex];
      setLayers((prevLayers) => prevLayers.map((layer) => (layer.id === objId ? { ...layer, x, y } : layer)));
    }
  };

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

  const handleFrameChange = (delta: number) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== selectedId || layer.type !== 'player') return layer;

        const frameCount = playerFrames.length;
        const currentFrame = layer.imageFrame ?? 0;
        const newFrame = (currentFrame + delta + frameCount) % frameCount;

        const newObjFrame = { ...layer, imageFrame: newFrame, frameName: playerNamesHelper[newFrame] };
        setSelectedObject(newObjFrame);
        return newObjFrame;
      })
    );
  };

  const handleObjectSizeChange = (delta: number) => {
    setLayers((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedId) return obj;

        const currentSize = (obj.size ?? 3) as ObjectSize;
        let newSize = (currentSize + delta) as number;

        if (newSize > 5) newSize = 1;
        if (newSize < 1) newSize = 5;

        const adjustedSize = newSize as ObjectSize;

        const newWidth = adjustedSize * STEP_SIZE;
        const newHeight = adjustedSize * STEP_SIZE;

        if (obj.type === 'circle') {
          const newObjCircle = { ...obj, radius: newWidth, size: adjustedSize };
          setSelectedObject(newObjCircle);
          return newObjCircle;
        }

        const newObjPlayer = { ...obj, width: newWidth, height: newHeight, size: adjustedSize };
        setSelectedObject(newObjPlayer);
        return newObjPlayer;
      })
    );
  };

  return (
    <>
      <div style={{ padding: '5px 10px', background: appMode === 'animation' ? '#222' : '#444', color: 'white' }}>
        Mode: {appMode === 'animation' ? '🎬 Animation' : '🖼 Draw Image'}
      </div>

      <Toolbar
        appMode={appMode}
        setAppMode={setAppMode}
        applyPosition={applyPosition}
        cancelPosition={cancelPosition}
        keyFrameActive={keyFrameActive}
        isRecording={isRecording}
        setMode={setMode}
        exportToJPG={exportToJPG}
        exportVideo={exportVideo}
        saveProject={saveProject}
        loadProject={loadProject}
      />

      <div className="flex justify-between">
        <ObjectToolsPanel
          appMode={appMode}
          addKeyframe={addKeyframe}
          duration={duration}
          animationTime={animationTime}
          isPlaying={isPlaying}
          playAnimation={playAnimation}
          stopAnimation={stopAnimation}
          selectedId={selectedId}
        />

        <div id="stage" ref={stageRef} style={{ width: canvasWidth, height: canvasHeight }}>
          <CanvasStage
            canvasRef={canvasRef}
            bgRef={bgRef}
            currentPitch={currentPitch || 'green'}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            width={canvasWidth}
            height={canvasHeight}
          />

          <CanvasContextMenu
            contextMenuPos={contextMenuPos}
            handleObjectSizeChange={handleObjectSizeChange}
            handleFrameChange={handleFrameChange}
            deleteLayer={deleteLayer}
            selectedObject={selectedObject}
          />
        </div>

        <LayerSidebar
          selectedId={selectedId}
          layers={layers}
          setSelectedId={setSelectedId}
          selectedObject={selectedObject}
          moveLayerUp={moveLayerUp}
          moveLayerDown={moveLayerDown}
          deleteLayer={deleteLayer}
        />
      </div>

      <div hidden={appMode !== 'animation'}>
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
    </>
  );
}

export default App;
