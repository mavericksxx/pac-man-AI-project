const gameBoard = document.getElementById('game-board');
const pacman = document.createElement('div');
pacman.id = 'pacman';
gameBoard.appendChild(pacman);

// creating ghost
const ghost = document.createElement('div');
ghost.id = 'ghost';
gameBoard.appendChild(ghost);

const gameOverMessage = document.getElementById('game-over');

// defining board size and initial positions
const boardSize = 20;
let pacmanPosition = { x: 1, y: 1 };

let ghostPosition = { x: 17, y: 17 };  
console.log('Initial ghost position:', ghostPosition);  

const walls = [];
const pellets = [];
let score = 0;
const scoreDisplay = document.getElementById('score');

// grid, wall = 1, pellet = 2, empty space = 0
const grid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 2, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1],
  [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// wall and pellet and generation
function createBoard() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = grid[y][x];

      if (cell === 1) {
        const wall = document.createElement('div');
        wall.classList.add('wall');
        wall.style.top = y * 40 + 'px';
        wall.style.left = x * 40 + 'px';
        gameBoard.appendChild(wall);
        walls.push({ x, y });
      } else if (cell === 2) {
        const pellet = document.createElement('div');
        pellet.classList.add('pellet');
        pellet.style.top = (y * 40 + 20) + 'px';
        pellet.style.left = (x * 40 + 20) + 'px';
        gameBoard.appendChild(pellet);
        pellets.push({ x, y });
      }
    }
  }
}

// updating position of pac man and ghost
function updatePosition(entity, position) {
  entity.style.left = position.x * 40 + 'px';
  entity.style.top = position.y * 40 + 'px';
  console.log(`${entity.id} moved to:`, position);  
}

// movement check
function canMove(x, y) {
  return grid[y] && grid[y][x] !== 1;
}

// move pac man
document.addEventListener('keydown', (event) => {
  let newX = pacmanPosition.x;
  let newY = pacmanPosition.y;

  if (event.key === 'ArrowUp') newY -= 1;
  else if (event.key === 'ArrowDown') newY += 1;
  else if (event.key === 'ArrowLeft') newX -= 1;
  else if (event.key === 'ArrowRight') newX += 1;

  if (canMove(newX, newY)) {
    pacmanPosition.x = newX;
    pacmanPosition.y = newY;
    updatePosition(pacman, pacmanPosition);
    checkPelletCollision();
    checkCollisionWithGhost();
  }
});

// pellet collision check
function checkPelletCollision() {
  pellets.forEach((pellet, index) => {
    if (pacmanPosition.x === pellet.x && pacmanPosition.y === pellet.y) {
      pellets.splice(index, 1);
      const pelletElement = document.querySelector(`.pellet[style*="top: ${(pellet.y * 40 + 20)}px;"][style*="left: ${(pellet.x * 40 + 20)}px;"]`);
      if (pelletElement) pelletElement.remove();
      score += 10;
      scoreDisplay.textContent = score;
    }
  });
}

// ghost collision check
function checkCollisionWithGhost() {
  if (pacmanPosition.x === ghostPosition.x && pacmanPosition.y === ghostPosition.y) {
    gameOver();
  }
}

// game over
function gameOver() {
  gameOverMessage.style.display = 'block';
  clearInterval(ghostMovementInterval);
}

// ghost BFS
function bfs(start, target) {
  const queue = [[start]];
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const path = queue.shift();
    const { x, y } = path[path.length - 1];

    if (x === target.x && y === target.y) return path;

    const directions = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (let dir of directions) {
      if (canMove(dir.x, dir.y) && !visited.has(`${dir.x},${dir.y}`)) {
        visited.add(`${dir.x},${dir.y}`);
        queue.push([...path, dir]);
      }
    }
  }
  return null;
}

// ghost to pac man
function moveGhost() {
  const path = bfs(ghostPosition, pacmanPosition);
  if (path && path.length > 1) {
    ghostPosition = path[1]; 
    updatePosition(ghost, ghostPosition);
    checkCollisionWithGhost();
  } else {
    console.log('No valid path found');  
  }
}

// ghost movement interval
const ghostMovementInterval = setInterval(moveGhost, 500);

// setup
createBoard();
updatePosition(pacman, pacmanPosition);
updatePosition(ghost, ghostPosition);