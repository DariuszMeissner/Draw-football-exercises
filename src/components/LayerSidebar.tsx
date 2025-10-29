import { BaseObject } from '../types/types';

type SideBarProps = {
  layers: BaseObject[];
  selectedId: number | null;
  handleDuplicateObject: () => void;
  setSelectedId: (id: number) => void;
  moveLayerUp: (id: number) => void;
  moveLayerDown: (id: number) => void;
  deleteLayer: (id: number) => void;
};

export default function LayerSidebar({
  selectedId,
  layers,
  setSelectedId,
  moveLayerUp,
  moveLayerDown,
  deleteLayer,
  handleDuplicateObject,
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

      {selectedId && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => moveLayerUp(selectedId)}>Up</button>
          <button onClick={() => moveLayerDown(selectedId)}>Down</button>
          <button onClick={() => deleteLayer(selectedId)}>Usuń</button>
          <button onClick={handleDuplicateObject}>Powiel</button>
        </div>
      )}
    </div>
  );
}
