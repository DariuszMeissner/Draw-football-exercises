import { BaseObject } from '../types/types';

type CanvasContextMenuProps = {
  contextMenuPos: { x: number; y: number } | null;
  handleObjectSizeChange: (delta: number) => void;
  handleFrameChange: (delta: number) => void;
  handleDuplicateObject: (id: number) => void;
  deleteLayer: (id: number) => void;
  selectedObject?: BaseObject;
};

export default function CanvasContextMenu({
  contextMenuPos,
  handleObjectSizeChange,
  handleFrameChange,
  handleDuplicateObject,
  deleteLayer,
  selectedObject,
}: CanvasContextMenuProps) {
  return (
    <div
      className="absolute z-10 bg-white p-1.5 translate-x-[-50%] translate-y-0"
      style={{
        left: contextMenuPos ? `${contextMenuPos.x}px` : undefined,
        top: contextMenuPos ? `${contextMenuPos.y}px` : undefined,
      }}
      hidden={!selectedObject && !contextMenuPos}
    >
      <div>
        <button onClick={() => handleObjectSizeChange(-1)}>-</button>
        <span>Rozmiar {selectedObject?.size}</span>
        <button onClick={() => handleObjectSizeChange(1)}>+</button>
      </div>

      {/* <div hidden={selectedObject?.type === 'circle'}>
        <button onClick={() => handleFrameChange(-1)}>-</button>
        <button onClick={() => handleFrameChange(1)}>+</button>
        </div> */}

      <div>
        <button onClick={() => selectedObject && handleDuplicateObject(selectedObject.id)}>Powiel</button>
      </div>

      <div>
        <button onClick={() => selectedObject && deleteLayer(selectedObject.id)}>Usuń</button>
      </div>
    </div>
  );
}
