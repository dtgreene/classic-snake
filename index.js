window.onload = init;

// width and height of the canvas
const canvasWH = 720;
// the size of each cell
const cellSize = 36;
const cellSizeHalf = cellSize * 0.5;
// determine how many columns/rows
const colRows = canvasWH / cellSize;
const cellImage = new Image();
const twoPI = Math.PI * 2;

const Direction = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

let background;
let scoreElement;
let canvas, ctx;
let pos = {
  x: 0,
  y: 0,
};
let direction = Direction.UP;
let nextDirection = Direction.UP;
let segments = [];
let foodPos = {
  x: 0,
  y: 0,
};
let score = 0;

function createBackground() {
  ctx.strokeStyle = '#333';

  // draw cols
  for(let i = 0; i < colRows; i++) {
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvasWH);
  }
  // draw rows
  for(let i = 0; i < colRows; i++) {
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvasWH, i * cellSize);
  }

  // stroke the lines
  ctx.stroke();

  // create an image
  const image = new Image();
  image.src = canvas.toDataURL('image/png');
  return image;
}

function init() {
  scoreElement = document.getElementById('score');
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvasWH;
  canvas.height = canvasWH;

  background = createBackground();

  // randomize head position
  randomRowCol(pos);
  // randomize food position
  randomRowCol(foodPos);

  // add key press listener
  window.addEventListener('keypress', keyHandler, false);

  // start once the image is loaded
  cellImage.onload = () => {
    // setup our loop
    MainLoop.setUpdate(update)
      .setDraw(draw)
      .setSimulationTimestep(1000 / 4)
      .start();
  };
  // set the source of the image
  cellImage.src = 'cell.png';
}

function randomRowCol(position) {
  // randomize position
  position.x = Math.floor(Math.random() * colRows);
  position.y = Math.floor(Math.random() * colRows);
}

function keyHandler(event) {
  switch (event.keyCode) {
    case 119: {
      // W
      if(direction === Direction.LEFT || direction === Direction.RIGHT) {
        nextDirection = Direction.UP;
      }
      break;
    }
    case 97: {
      // A
      if(direction === Direction.UP || direction === Direction.DOWN) {
        nextDirection = Direction.LEFT;
      }
      break;
    }
    case 115: {
      // S
      if(direction === Direction.LEFT || direction === Direction.RIGHT) {
        nextDirection = Direction.DOWN;
      }
      break;
    }
    case 100: {
      // D
      if(direction === Direction.UP || direction === Direction.DOWN) {
        nextDirection = Direction.RIGHT;
      }
      break;
    }
  }
}

function setScore(value) {
  score = value;
  scoreElement.innerHTML = `Score: ${score}`;
}

function update() {
  // set direction
  direction = nextDirection;

  // check for segment collision
  for(let i = 0; i < segments.length; i++) {
    if(pos.x === segments[i].x && pos.y === segments[i].y) {
      segments = [];
      setScore(0);
      break;
    }
  }

  // check for food collision
  if(pos.x === foodPos.x && pos.y === foodPos.y) {
     // add segment
    if(segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      segments.push({ x: lastSegment.x, y: lastSegment.y });
    } else {
      segments.push({ x: pos.x, y: pos.y });      
    }
    // randomize food position
    randomRowCol(foodPos);
    setScore(score + 1);
  }

  // move segments
  for(let i = segments.length - 1; i > 0; i--) {
    segments[i].x = segments[i - 1].x;
    segments[i].y = segments[i - 1].y;
  }

  // move the first segment
  if(segments.length > 0) {
    segments[0].x = pos.x;
    segments[0].y = pos.y;    
  }
  
  // move snake head
  if (direction === Direction.UP) {
    pos.y -= 1;
  } else if (direction === Direction.RIGHT) {
    pos.x += 1;
  } else if (direction === Direction.DOWN) {
    pos.y += 1;
  } else if (direction === Direction.LEFT) {
    pos.x -= 1;
  }

  // wrap horizontally
  if(pos.x >= colRows) {
    pos.x = 0;
  } else if(pos.x < 0) {
    pos.x = colRows - 1;
  }

  // wrap vertically
  if(pos.y >= colRows) {
    pos.y = 0;
  } else if(pos.y < 0) {
    pos.y = colRows - 1;
  }
}

function draw() {
  // clear the canvas
  ctx.clearRect(0, 0, canvasWH, canvasWH);
  // draw the background
  ctx.drawImage(background, 0, 0);
  // draw the food
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(
    foodPos.x * cellSize + cellSizeHalf,
    foodPos.y * cellSize + cellSizeHalf,
    cellSizeHalf,
    0,
    twoPI
  );
  ctx.fill();
  // draw the snake head
  ctx.drawImage(
    cellImage,
    pos.x * cellSize,
    pos.y * cellSize,
    cellSize,
    cellSize
  );
  // draw the segments
  for(let i = 0; i < segments.length; i++) {
    ctx.drawImage(
      cellImage,
      segments[i].x * cellSize,
      segments[i].y * cellSize,
      cellSize,
      cellSize
    );
  }
}
