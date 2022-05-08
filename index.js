window.onload = init;

// width and height of the canvas
const canvasWH = 768;
// the size of each cell
const cellSize = 32;
const cellSizeHalf = cellSize * 0.5;
const cells = [];
// determine how many columns/rows
const colRows = canvasWH / cellSize;
const cellImage = new Image();
const foodImage = new Image();
const twoPI = Math.PI * 2;

const Direction = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

let background;
let scoreElement;
let buttonElement;
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
let gameReady = false;

function createBackground() {
  ctx.strokeStyle = '#222';

  // draw cols
  for (let i = 0; i < colRows; i++) {
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvasWH);
  }
  // draw rows
  for (let i = 0; i < colRows; i++) {
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
  buttonElement = document.getElementById('play-btn');
  scoreElement = document.getElementById('score');
  canvas = document.getElementById('main-canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvasWH;
  canvas.height = canvasWH;

  // important to set this after setting the canvas size
  // this keeps the pixel art apple image from being blurry
  ctx.imageSmoothingEnabled = false;

  background = createBackground();

  // create an array of [row, col] pairs
  for (let i = 0; i < colRows; i++) {
    for (let j = 0; j < colRows; j++) {
      cells.push([i, j]);
    }
  }

  // reset the game
  resetGame();

  // add key press listener
  window.addEventListener('keydown', keyDownHandler, false);
  // add play button click listener
  buttonElement.addEventListener('click', playClickHandler, false);

  // start once the images are loaded
  loadImages([cellImage, foodImage]).then(() => {
    gameReady = true;
  });
  // set the source of our images
  cellImage.src = 'cell.png';
  foodImage.src = 'apple.png';
}

function playClickHandler() {
  // show the score element
  scoreElement.style.display = 'block';
  // remove the play button
  buttonElement.parentElement.removeChild(buttonElement);
  // start the game
  MainLoop.setUpdate(update)
    .setDraw(draw)
    .setSimulationTimestep(1000 / 4)
    .start();
}

function loadImages(images) {
  return new Promise((res) => {
    let loaded = 0;
    // function for handling image onload event
    const loadHandler = () => {
      // increment each time an image is loaded
      loaded++;
      // check if we've loaded all the images
      if (loaded === images.length) {
        // resolve the promise
        res();
      }
    };
    // set the onload event for each image
    images.forEach((image) => {
      image.onload = loadHandler;
    });
  });
}

function randomizeSnake() {
  pos.x = Math.floor(Math.random() * colRows);
  pos.y = Math.floor(Math.random() * colRows);
}

function randomizeFood() {
  // copy our cells array
  let selection = cells.concat();

  // remove cells where segments are located
  selection = selection.filter((cell) => {
    let keep = true;
    for (let i = 0; i < segments.length; i++) {
      if (
        (cell[0] === pos.x && cell[1] === pos.y) ||
        (cell[0] === segments[i].x && cell[1] === segments[i].y)
      ) {
        keep = false;
      }
    }
    return keep;
  });

  // this would only happen if someone beat the game
  if (selection.length === 0) {
    resetGame();
    return;
  }

  // randomly select a position
  const index = Math.floor(Math.random() * selection.length);
  foodPos.x = selection[index][0];
  foodPos.y = selection[index][1];
}

function keyDownHandler(event) {
  switch (event.keyCode) {
    case 87:
    case 38: {
      // W
      if (direction === Direction.LEFT || direction === Direction.RIGHT) {
        nextDirection = Direction.UP;
      }
      break;
    }
    case 65:
    case 37: {
      // A
      if (direction === Direction.UP || direction === Direction.DOWN) {
        nextDirection = Direction.LEFT;
      }
      break;
    }
    case 83:
    case 40: {
      // S
      if (direction === Direction.LEFT || direction === Direction.RIGHT) {
        nextDirection = Direction.DOWN;
      }
      break;
    }
    case 68:
    case 39: {
      // D
      if (direction === Direction.UP || direction === Direction.DOWN) {
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

function resetGame() {
  segments = [];
  direction = Direction.UP;
  nextDirection = Direction.UP;
  randomizeSnake();
  randomizeFood();
  setScore(0);
}

function update() {
  // set direction
  direction = nextDirection;

  // check for segment collision
  for (let i = 0; i < segments.length; i++) {
    if (pos.x === segments[i].x && pos.y === segments[i].y) {
      resetGame();
      break;
    }
  }

  // check for food collision
  if (pos.x === foodPos.x && pos.y === foodPos.y) {
    // add segment
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      segments.push({ x: lastSegment.x, y: lastSegment.y });
    } else {
      segments.push({ x: pos.x, y: pos.y });
    }
    // randomize food position
    randomizeFood();
    // increment the score
    setScore(score + 1);
  }

  // move segments
  for (let i = segments.length - 1; i > 0; i--) {
    segments[i].x = segments[i - 1].x;
    segments[i].y = segments[i - 1].y;
  }

  // move the first segment
  if (segments.length > 0) {
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
  if (pos.x >= colRows) {
    pos.x = 0;
  } else if (pos.x < 0) {
    pos.x = colRows - 1;
  }

  // wrap vertically
  if (pos.y >= colRows) {
    pos.y = 0;
  } else if (pos.y < 0) {
    pos.y = colRows - 1;
  }
}

function draw() {
  // clear the canvas
  ctx.clearRect(0, 0, canvasWH, canvasWH);
  // draw the background
  ctx.drawImage(background, 0, 0);
  // draw the food
  ctx.drawImage(
    foodImage,
    foodPos.x * cellSize,
    foodPos.y * cellSize,
    cellSize,
    cellSize
  );
  // draw the snake head
  ctx.drawImage(
    cellImage,
    pos.x * cellSize,
    pos.y * cellSize,
    cellSize,
    cellSize
  );
  // draw the segments
  for (let i = 0; i < segments.length; i++) {
    ctx.drawImage(
      cellImage,
      segments[i].x * cellSize,
      segments[i].y * cellSize,
      cellSize,
      cellSize
    );
  }
}
