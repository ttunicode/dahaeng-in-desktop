let animation = null;
let character = null;
let behavior = null;
let lastTime = 0;

async function init() {
  animation = new Animation();
  await animation.preloadAll();

  const container = document.getElementById('pet-container');
  character = new Character(container, animation, window.electronAPI);
  await character.init();

  behavior = new Behavior(character, animation);

  character.onDragStart = () => {
    behavior.isPatrolling = false;
    behavior.targetX = null;
  };
  character.onDragEnd = () => {
    behavior.setRandomIdleDuration();
    behavior.idleTimer = 0;
  };

  setupEventListeners();

  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  animation.update(deltaTime);
  behavior.update(deltaTime);

  requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
  const petImage = document.getElementById('pet-image');

  petImage.addEventListener('click', (e) => {
    if (e.detail === 2) return;
    behavior.onClick();
  });

  petImage.addEventListener('dblclick', (e) => {
    behavior.onClick();
  });

  petImage.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electronAPI.showContextMenu();
  });

  window.electronAPI.onAppQuit(() => {
    window.close();
  });
}

document.addEventListener('DOMContentLoaded', init);