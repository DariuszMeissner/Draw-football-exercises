import React, { useEffect, useRef, useState } from 'react'

const Canvas = (props) => {
  let isDragging = false;
  let startX = null;
  let startY = null;
  const [activeShape, setActveShape] = useState([{ index: null }])
  let currentShapeRef = useRef(null)
  let currentShapeIndexRef = useRef(null);
  let canvasWidthRef = useRef(null);
  let canvasHeightRef = useRef(null);
  let contextRef = useRef(null);
  const canvasRef = useRef(null)
  const [shapes, setSahpes] = useState([
    {
      index: 0,
      active: false,
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      color: 'red'
    },
    {
      index: 1,
      active: false,
      x: 100,
      y: 0,
      width: 200,
      height: 200,
      color: 'blue',
    },
  ]);

  function addElement(type, x, y, width, height) {
    setSahpes([...shapes, { index: shapes.length, x, y, width, height, color: 'green' }])
    switch (type) {
      case 'rect':
        contextRef.current.clearRect(0, 0, canvasWidthRef.current, canvasHeightRef.current)

        shapes.forEach(shape => {
          contextRef.current.fillStyle = shape.color;
          contextRef.current.fillRect(x, y, width, height);
        })
        break;

      default:
        break;
    }
  }

  function onMouseClick(e) {
    e.preventDefault();
    // addElement('rect', e.clientX, e.clientY, 100, 100)

    console.log(e);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drawShapes = (context, shapes, canvasWidth, canvasHeight) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight)

    shapes.forEach(shape => {
      context.fillStyle = shape.color;
      context.fillRect(shape.x, shape.y, shape.width, shape.height);
    })
  }

  const isMouseInShape = (x, y, shape) => {
    let shapeLeft = shape.x;
    let shapeRight = shape.x + shape.width;
    let shapeTop = shape.y;
    let shapeBottom = shape.y + shape.height;

    if (x > shapeLeft && x < shapeRight && y > shapeTop && y < shapeBottom) {
      return true
    }

    return false
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMouseDown = (e, shapes) => {
    e.preventDefault();

    startX = parseInt(e.clientX);
    startY = parseInt(e.clientY);

    shapes.forEach((shape) => {
      if (isMouseInShape(startX, startY, shape)) {
        currentShapeIndexRef.current = shape.index;
        isDragging = true;

        contextRef.current.strokeStyle = 'black';
        contextRef.current.lineWidth = 6;
        contextRef.current.strokeRect(shape.x, shape.y, shape.width, shape.height)
      } else {


      }
    })
  }

  const onMouseUp = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    isDragging = false;
  }


  const onMouseOut = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    isDragging = false;
  }

  const onMouseMove = (e, shapes, context, canvasWidth, canvasHeight) => {
    if (!isDragging) {
      return
    } else if (isDragging) {
      e.preventDefault();
      let mouseX = parseInt(e.clientX);
      let mouseY = parseInt(e.clientY);

      let dx = mouseX - startX;
      let dy = mouseY - startY;

      currentShapeRef.current = shapes[currentShapeIndexRef.current];

      currentShapeRef.current.x += dx;
      currentShapeRef.current.y += dy;

      drawShapes(context, [...shapes, currentShapeRef.current], canvasWidth, canvasHeight)

      startX = mouseX;
      startY = mouseY;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    contextRef.current = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasWidthRef.current = canvas.width;
    canvasHeightRef.current = canvas.height;

    drawShapes(contextRef.current, shapes, canvasWidthRef.current, canvasHeightRef.current);

  }, [drawShapes, shapes, onMouseDown, startX, startY, isDragging])


  return (
    <>
      {/* <button>Export as svg</button> */}
      <canvas
        ref={canvasRef}
        {...props}
        onMouseDown={e => onMouseDown(e, shapes)}
        onMouseUp={e => onMouseUp(e)}
        onMouseOut={e => onMouseOut(e)}
        onMouseMove={e => onMouseMove(e, shapes, contextRef.current, canvasWidthRef.current, canvasHeightRef.current)}
        onClick={e => onMouseClick(e)}
      />
    </>
  )


}

export default Canvas