class Animation {
  constructor() {
    this.animations = {
      idle: {
        frames: [
          'assets/dahaengi/idle/idle_01.png',
          'assets/dahaengi/idle/idle_02.png',
          'assets/dahaengi/idle/idle_03.png',
         // 'assets/dahaengi/idle/idle_04.png'
        ],
        frameRate: 8,
        loop: true
      },
      walk: {
        frames: [
          'assets/dahaengi/walk/walk_01.png',
        //  'assets/dahaengi/walk/walk_02.png',
          'assets/dahaengi/walk/walk_03.png',
          'assets/dahaengi/walk/walk_04.png',
          'assets/dahaengi/walk/walk_05.png',
          'assets/dahaengi/walk/walk_06.png',
        //  'assets/dahaengi/walk/walk_07.png',
          'assets/dahaengi/walk/walk_08.png'
        ],
        frameRate: 12,
        loop: true
      },
      run: {
        frames: [
          'assets/dahaengi/run/run_01.png',
          'assets/dahaengi/run/run_02.png',
          'assets/dahaengi/run/run_03.png',
          'assets/dahaengi/run/run_04.png',
          'assets/dahaengi/run/run_05.png',
        //  'assets/dahaengi/run/run_06.png',
        //  'assets/dahaengi/run/run_07.png',
          'assets/dahaengi/run/run_08.png'
        ],
        frameRate: 16,
        loop: true
      },
      sleep: {
        frames: [
        //  'assets/dahaengi/sleep/sleep_01.png',
        //  'assets/dahaengi/sleep/sleep_02.png',
        //  'assets/dahaengi/sleep/sleep_03.png',
          'assets/dahaengi/sleep/sleep_04.png',
          'assets/dahaengi/sleep/sleep_05.png',
          'assets/dahaengi/sleep/sleep_06.png'
        ],
        frameRate: 4,
        loop: true
      }
    };

    this.currentAnimation = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isPlaying = true;
    this.imageCache = new Map();
    this.onFrameChange = null;
  }

  preloadAll() {
    const promises = [];
    for (const animName in this.animations) {
      for (const frameSrc of this.animations[animName].frames) {
        promises.push(this.preloadImage(frameSrc));
      }
    }
    return Promise.all(promises);
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(this.imageCache.get(src));
        return;
      }
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  setAnimation(name) {
    if (this.animations[name] && this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }

  getCurrentAnimation() {
    return this.currentAnimation;
  }

  update(deltaTime) {
    if (!this.isPlaying) return;

    const anim = this.animations[this.currentAnimation];
    if (!anim) return;

    this.frameTimer += deltaTime;
    const frameDuration = 1000 / anim.frameRate;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = anim.frames.length - 1;
          this.isPlaying = false;
        }
      }

      if (this.onFrameChange) {
        this.onFrameChange(this.getCurrentFrameSrc());
      }
    }
  }

  getCurrentFrameSrc() {
    const anim = this.animations[this.currentAnimation];
    if (!anim) return null;
    return anim.frames[this.currentFrame];
  }

  getCurrentFrameImage() {
    const src = this.getCurrentFrameSrc();
    return src ? this.imageCache.get(src) : null;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  reset() {
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  flipHorizontal(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.drawImage(img, -img.width, 0);
    return canvas;
  }
}

window.Animation = Animation;