import { BaseObject } from '../types/types';

type SideBarProps = {
  selectedId: number | null;
  layers: BaseObject[];
  selectedObject?: BaseObject;
  setSelectedId: (id: number) => void;
  moveLayerUp: (id: number) => void;
  moveLayerDown: (id: number) => void;
  deleteLayer: (id: number) => void;
};

export default function LayerSidebar({
  selectedId,
  layers,
  setSelectedId,
  selectedObject,
  moveLayerUp,
  moveLayerDown,
  deleteLayer,
}: SideBarProps) {
  return (
    <div id="layers" style={{ minWidth: '220px', border: '1px solid #ccc', padding: '10px' }}>
      <h4>Warstwy</h4>
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

      {selectedObject && (
        <div style={{ marginTop: 10 }} hidden={!selectedObject}>
          <button onClick={() => selectedId && moveLayerUp(selectedId)}>Up</button>
          <button onClick={() => selectedId && moveLayerDown(selectedId)}>Down</button>
          <button onClick={() => selectedId && deleteLayer(selectedId)}>Remove</button>
        </div>
      )}
    </div>
  );
}
