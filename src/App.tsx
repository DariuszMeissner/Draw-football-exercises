import React, { useCallback, useState, useEffect } from "react";
import "./App.css";
import { Layer } from "./features/canvas/layer/layer";
import { CanvasObject } from "./features/canvas/canvas-object/canvas-object";
import { TYPES } from "./features/canvas/enums";
import { BaseDrawOptionsInterface } from "./features/canvas/canvas-object/type";
import { TextDrawOptionsInterface } from "./features/canvas/canvas-text/type";

function App() {
  const [isMousePressed, setMousePressed] = useState<boolean>(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const [layers, setLayers] = useState<Array<Layer>>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);

  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    reDraw();
  }, [layers]);

  const setCanvasRef = useCallback((element: HTMLCanvasElement) => {
    element.width = window.innerWidth;
    element.height = window.innerHeight;

    const canvasContext = element.getContext("2d");

    if (canvasContext !== null) {
      setContext(canvasContext);
    }
  }, []);

  const reDraw = () => {
    if (context) {
      context?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      layers.forEach((layer) => {
        const children = layer.getChildren();

        children.forEach((child) => {
          const options: BaseDrawOptionsInterface = child.getOptions();

          // add condition for text and shape
          if (layer.isActive()) {
            context.lineWidth = 4;
            context.strokeStyle = "#70d6ff";
            context.strokeRect(options.x - 4, options.y - 4, options.w + 8, options.h + 8);
          } else {
            context.fillStyle = "#ffd670";
            context.lineWidth = 0;
          }

          const type = child.getType();

          if (type === TYPES.RECT) {
            const options: BaseDrawOptionsInterface = child.getOptions();

            context.fillRect(options.x, options.y, options.w, options.h);
          }

          if (type === TYPES.TEXT) {
            const options: TextDrawOptionsInterface = child.getOptions();

            context.save();
            context.fillStyle = options.color;
            context.font = `${options.h}px monospace`;
            context.fillText(options.text, options.x, options.y);
            context.restore();
          }
        });
      });
    }
  };

  const onMouseDown = (event: React.MouseEvent) => {
    setMousePressed(true);
    console.log(event);

    if (context) {
      const detectedLayer = layers.find((layer) => layer.isPointInside(event.pageX, event.pageY));

      if (detectedLayer) {
        if (selectedLayer) {
          selectedLayer.setActive(false);
        }

        detectedLayer.setActive(true);
        setSelectedLayer(detectedLayer);
        reDraw();
      } else {
        selectedLayer?.setActive(false);
        setSelectedLayer(null);

        // add condition for shape and text
        const options: BaseDrawOptionsInterface = {
          x: event.pageX,
          y: event.pageY,
          w: 100,
          h: 100,
        };
        const rect = new CanvasObject(options);
        const layer = new Layer(options);
        layer.addChild(rect);
        setLayers([...layers, layer]);
      }
    }
  };

  const onMouseMove = (event: React.MouseEvent) => {
    if (isMousePressed && selectedLayer) {
      selectedLayer.move(event.movementX, event.movementY);
      reDraw();
    }
  };

  const onMouseUp = () => {
    setMousePressed(false);
  };

  const download = (e: React.MouseEvent) => {
    const link = e.currentTarget;
    link.setAttribute("download", "canvas.jpeg");
    let imageUrl = context?.canvas.toDataURL("image/jpeg", 1.0);
    setDataUrl(imageUrl);

    if (imageUrl) {
      link.setAttribute("href", imageUrl);
    }

    // // let blob = new Blob([dataUrl], {type: dataUrl.})
    // if (e.target) {
    //   const target = e.target as HTMLAnchorElement;
    // }
  };

  return (
    <div>
      <a href="download_link" onClick={download}>
        download
      </a>
      <canvas
        id="canvas-layer"
        ref={setCanvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      <canvas id="background-layer" />

      {/* insert dataurl into img tag */}
      {/* <img src={dataUrl} width={400} height={"auto"} /> */}
    </div>
  );
}

export default App;
