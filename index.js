window.onload = init;

// width and height of the canvas
const canvasWH = 720;
// the size of each cell
const cellSize = 36;
// determine how many columns/rows
const colRows = canvasWH / cellSize;

const Direction = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

let canvas, ctx;
let pos = {
  x: 0,
  y: 0,
};
let direction = Direction.UP;
let segments = [];

function init() {
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvasWH;
  canvas.height = canvasWH;

  // set the fill color
  ctx.fillStyle = 'limegreen';

  // randomize position
  pos.x = Math.floor(Math.random() * colRows);
  pos.y = Math.floor(Math.random() * colRows);

  // add key press listener
  window.addEventListener('keypress', keyHandler, false);

  // setup our loop
  MainLoop.setUpdate(update)
    .setDraw(draw)
    .setSimulationTimestep(1000 / 2)
    .start();
}

function keyHandler(event) {
  switch (event.keyCode) {
    case 119: {
      // W
    }
    case 97: {
      // A
    }
    case 115: {
      // S
    }
    case 100: {
      // D
    }
  }
}

function update() {
  if (direction === Direction.UP) {
    pos.y -= 1;
  } else if (direction === Direction.RIGHT) {
    pos.x += 1;
  } else if (direction === Direction.DOWN) {
    pos.y += 1;
  } else if (direction === Direction.LEFT) {
    pos.x -= 1;
  }
}

function draw() {
  // clear the canvas
  ctx.clearRect(0, 0, canvasWH, canvasWH);
  // draw the snake head
  ctx.fillRect(pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
}
