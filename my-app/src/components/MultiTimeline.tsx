import React, { useEffect, useRef, useState } from 'react';
import { BaseObject } from '../common/types';

interface MultiTimelineProps {
  objects: BaseObject[];
  duration: number;
  time: number;
  onTimeChange: (t: number) => void;
  onUpdateKeyframe: (objId: number, keyIndex: number, x: number, y: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onDelete: (id: number) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  keyFrameActive: { objId: number; keyIndex: number } | null;
  setKeyFrameActive: React.Dispatch<React.SetStateAction<{ objId: number; keyIndex: number } | null>>;
  onSelectKeyframe: (objId: number, keyIndex: number) => void;
}

const HEADER_WIDTH = 140;
const TRACK_HEIGHT = 10;

const MultiTimeline: React.FC<MultiTimelineProps> = ({
  objects,
  duration,
  time,
  onTimeChange,
  onUpdateKeyframe,
  onMoveUp,
  onMoveDown,
  onDelete,
  selectedId,
  setSelectedId,
  keyFrameActive,
  setKeyFrameActive,
  onSelectKeyframe,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<{ objId: number; keyIndex: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Keep containerWidth updated (mount + resize)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    // cleanup
    return () => ro.disconnect();
  }, [containerRef.current]);

  const timelineWidth = Math.max(containerWidth - HEADER_WIDTH, 1);
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - HEADER_WIDTH;
    if (x < 0) x = 0;
    if (x > timelineWidth) x = timelineWidth;

    const newTime = (x / timelineWidth) * duration;
    const obj = objects.find((o) => o.id === dragging.objId);
    if (!obj || !obj.keyframes) return;

    const newKFs = [...obj.keyframes];
    newKFs[dragging.keyIndex] = { ...newKFs[dragging.keyIndex], time: newTime };

    onUpdateKeyframe(dragging.objId, dragging.keyIndex, newKFs[dragging.keyIndex].x, newKFs[dragging.keyIndex].y);
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // cleanup when dragging becomes null
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, timelineWidth, duration, objects]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        border: '1px solid #ccc',
        background: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: TRACK_HEIGHT,
      }}
      onClick={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - HEADER_WIDTH;
        const newTime = (Math.min(Math.max(clickX, 0), timelineWidth) / timelineWidth) * duration;
        onTimeChange(Math.min(Math.max(newTime, 0), duration));
      }}
    >
      {/* Playhead - compute left safely */}
      <div
        style={{
          position: 'absolute',
          left: HEADER_WIDTH + (time / duration) * timelineWidth,
          top: 0,
          bottom: 0,
          width: 4,
          background: 'red',
          pointerEvents: 'none',
        }}
      />

      {/* Tracks */}
      {objects.map((obj, idx) => (
        <div
          key={obj.id}
          style={{
            position: 'relative',
            height: 36,
            marginTop: TRACK_HEIGHT,
            background: idx % 2 === 0 ? '#eaeaea' : '#dddddd',
            borderTop: '1px solid #bbb',
            borderBottom: '1px solid #bbb',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Track header */}
          <div
            style={{
              width: HEADER_WIDTH,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 13,
              fontWeight: 500,
              color: '#333',
              borderRight: '1px solid #bbb',
              background: '#fafafa',
              height: '100%',
            }}
          >
            <span
              onClick={() => setSelectedId(obj.id)}
              style={{
                cursor: 'pointer',
                fontWeight: selectedId === obj.id ? 'bold' : 'normal',
              }}
            >
              {obj.name}
            </span>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp(obj.id);
                }}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown(obj.id);
                }}
              >
                ↓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(obj.id);
                }}
                style={{ color: 'red' }}
              >
                🗑
              </button>
            </div>
          </div>

          {/* Timeline track */}
          <div style={{ position: 'relative', flexGrow: 1, height: '100%' }}>
            {obj.keyframes?.map((kf, keyIndex) => {
              const leftPx = (kf.time / duration) * timelineWidth;

              return (
                <div
                  key={keyIndex}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDragging({ objId: obj.id, keyIndex });
                    setSelectedId(obj.id);
                    setKeyFrameActive({ objId: obj.id, keyIndex });
                    onSelectKeyframe(obj.id, keyIndex);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${leftPx}px`,
                    top: '50%',
                    width: 12,
                    height: 12,
                    background:
                      keyFrameActive?.objId === obj.id && keyFrameActive.keyIndex === keyIndex ? 'red' : 'blue',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    cursor: 'grab',
                  }}
                  title={`${obj.name} @ ${kf.time.toFixed(2)}s`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiTimeline;
