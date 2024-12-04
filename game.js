// game.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let balloons = [];
let score = 0;
let gameTime = 30; // Total game time in seconds
let gameInterval;  // Interval for the game timer
let gameRunning = false; // Flag to check if the game is running
let playerName = '';
let highScores = [];

const leaderboardList = document.getElementById('leaderboard-list');
const playerNameInput = document.getElementById('player-name');
const startButton = document.getElementById('start-button');
const timeDisplay = document.getElementById('time');


startButton.addEventListener('click', startGame);



function startGame() {
  if (gameRunning) return; // Prevent multiple game instances
  gameRunning = true;

  // Get the player's name
  playerName = playerNameInput.value.trim();
  

  // Hide the name input section and start button
  document.getElementById('name-input-section').style.display = 'none';
  startButton.style.display = 'none';

  // Show the canvas
  canvas.style.display = 'block';

  // Reset game variables
  score = 0;
  gameTime = 30;
  balloons = [];
  document.getElementById('score').textContent = score;
  timeDisplay.textContent = gameTime;

  initBalloons();
  animate();

  // Start the game timer
  gameInterval = setInterval(() => {
    gameTime--;
    timeDisplay.textContent = gameTime;
    if (gameTime <= 0) {
      endGame();
    }
  }, 1000);
}

// Balloon class definition
class Balloon {
  constructor(x, y, radius, speed, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.color = color;
    this.popped = false;
  }

  update() {
    this.y -= this.speed;
    if (this.y + this.radius < 0) {
      this.popped = true;
    }
  }

  draw() {
    if (!this.popped) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      // Draw balloon string
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.radius);
      ctx.lineTo(this.x, this.y + this.radius + 20);
      ctx.strokeStyle = '#555';
      ctx.stroke();
      ctx.closePath();
    }
  }
}

// Function to create a new balloon at random position
function createBalloon() {
  const radius = Math.random() * 20 + 15;
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = canvas.height + radius;
  const speed = Math.random() * 2.5 + 1.5;
  const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
  const balloon = new Balloon(x, y, radius, speed, color);
  balloons.push(balloon);
}

// Initialize balloons
function initBalloons() {
  balloons = [];
  for (let i = 0; i < 5; i++) {
    createBalloon();
  }
}

// Update and draw balloons
function handleBalloons() {
  for (let i = 0; i < balloons.length; i++) {
    balloons[i].update();
    balloons[i].draw();

    // Remove balloons that are popped or out of screen
    if (balloons[i].popped) {
      balloons.splice(i, 1);
      i--;
    }
  }

  // Ensure there are always 5 balloons
  while (balloons.length < 5) {
    createBalloon();
  }
}

// Animate the game
function animate() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleBalloons();
  requestAnimationFrame(animate);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameInterval);

  // Hide the canvas and show the start button and name input section
  canvas.style.display = 'none';
  startButton.style.display = 'block';
  document.getElementById('name-input-section').style.display = 'block';

  // Reset the name input and disable the start button
  playerNameInput.value = '';
  startButton.disabled = true;

  // Store the player's score in high scores
  const playerScore = { 
    name: playerName, 
    score: score, 
    date: new Date().toLocaleString() 
  };
  highScores.push(playerScore);

  // Sort the high scores in descending order
  highScores.sort((a, b) => b.score - a.score);

  // Keep only the top 10 scores
  highScores = highScores.slice(0, 10);

  // Save high scores to local storage
  saveHighScores();

  // Update the leaderboard display
  updateLeaderboardDisplay();

  // Display final score with player's name
  alert(`Time is up, ${playerName}! Your final score is: ${score}`);
}

function loadHighScores() {
  const storedScores = localStorage.getItem('highScores');
  
  if (storedScores) {
    highScores = JSON.parse(storedScores);
  } else {
    highScores = [];
  }
}

function saveHighScores() {
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function updateLeaderboardDisplay() {
  leaderboardList.innerHTML = ''; // Clear the current list

  highScores.forEach((entry) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${entry.name} - ${entry.score} (${entry.date})`;
    leaderboardList.appendChild(listItem);
  });
}

// Event listener for popping balloons
canvas.addEventListener('click', (event) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  for (let i = 0; i < balloons.length; i++) {
    const balloon = balloons[i];
    const distance = Math.hypot(clickX - balloon.x, clickY - balloon.y);

    if (distance < balloon.radius && !balloon.popped) {
      balloon.popped = true;
      score++;
      document.getElementById('score').textContent = score;
      break; // Prevent popping multiple balloons with one click
    }
  }
});

playerNameInput.addEventListener('input', () => {
  if (playerNameInput.value.trim() !== '') {
    startButton.disabled = false;
  } else {
    startButton.disabled = true;
  }
});


// Start the game
initBalloons();
animate();