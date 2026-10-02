class Character {
  constructor(container, animation, electronAPI) {
    this.container = container;
    this.animation = animation;
    this.electronAPI = electronAPI;
    this.imageElement = document.getElementById('pet-image');

    this.x = 100;
    this.y = 100;
    this.scale = 1;
    this.facingRight = true;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.screenBounds = { width: 1920, height: 1080 };
    this.margin = 50;
    this.charWidth = CHARACTER_SIZE;
    this.charHeight = CHARACTER_SIZE;

    this.animation.onFrameChange = (src) => this.updateImage(src);
    this.onDragStart = null;
    this.onDragEnd = null;
  }

  async init() {
    try {
      const bounds = await this.electronAPI.getWindowBounds();
      this.x = bounds.x;
      this.y = bounds.y;
      const primaryDisplay = screen.getPrimaryDisplay();
      this.screenBounds.width = primaryDisplay.workAreaSize.width;
      this.screenBounds.height = primaryDisplay.workAreaSize.height;
    } catch (e) {
      this.screenBounds.width = window.screen.width;
      this.screenBounds.height = window.screen.height;
    }

    this.updateImage(this.animation.getCurrentFrameSrc());
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.imageElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', () => this.onMouseUp());
    this.imageElement.addEventListener('contextmenu', (e) => this.onContextMenu(e));
    window.addEventListener('resize', () => this.onResize());
  }

  onMouseDown(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.dragOffset.x = e.clientX;
    this.dragOffset.y = e.clientY;
    this.imageElement.style.cursor = 'grabbing';
    this.animation.pause();
    if (this.onDragStart) this.onDragStart();
    e.preventDefault();
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragOffset.x;
    const dy = e.clientY - this.dragOffset.y;
    this.x += dx;
    this.y += dy;
    this.dragOffset.x = e.clientX;
    this.dragOffset.y = e.clientY;
    this.clampToScreen();
    this.sendWindowMove();
  }

  onMouseUp() {
    this.isDragging = false;
    this.imageElement.style.cursor = 'default';
    this.animation.play();
    if (this.onDragEnd) this.onDragEnd();
  }

  onContextMenu(e) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('pet-contextmenu', {
      detail: { x: e.screenX, y: e.screenY }
    }));
  }

  onResize() {
    this.screenBounds.width = window.screen.width;
    this.screenBounds.height = window.screen.height;
    this.clampToScreen();
    this.sendWindowMove();
  }

  clampToScreen() {
    this.x = Math.max(this.margin, Math.min(this.x, this.screenBounds.width - this.charWidth - this.margin));
    this.y = Math.max(this.margin, Math.min(this.y, this.screenBounds.height - this.charHeight - this.margin));
  }

  sendWindowMove() {
    if (this.electronAPI && !this._moveThrottled) {
      this._moveThrottled = true;
      requestAnimationFrame(() => {
        this.electronAPI.moveWindow(this.x, this.y);
        this._moveThrottled = false;
      });
    }
  }

  updateImage(src) {
    if (!src) return;
    const img = this.animation.getCurrentFrameImage();
    if (img) {
      this.imageElement.src = src;
      this.imageElement.style.transform = this.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.clampToScreen();
    this.sendWindowMove();
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  setFacingRight(facingRight) {
    this.facingRight = facingRight;
    this.updateImage(this.animation.getCurrentFrameSrc());
  }

  getFacingRight() {
    return this.facingRight;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.charWidth,
      height: this.charHeight
    };
  }
}

const CHARACTER_SIZE = 128;
window.Character = Character;