class Behavior {
  constructor(character, animation) {
    this.character = character;
    this.animation = animation;

    this.state = 'idle';
    this.targetX = null;
    this.moveSpeed = 75;
    this.idleTimer = 0;
    this.idleDuration = 0;
    this.actionTimer = 0;
    this.actionDuration = 0;

    this.patrolDirection = 1;
    this.isPatrolling = false;

    this.setRandomIdleDuration();
  }

  setRandomIdleDuration() {
    this.idleDuration = 2000 + Math.random() * 5000;
  }

  setRandomActionDuration() {
    this.actionDuration = 3000 + Math.random() * 7000;
  }

  update(deltaTime) {
    if (this.character.isDragging) {
      this.state = 'idle';
      this.animation.setAnimation('idle');
      this.isPatrolling = false;
      return;
    }

    switch (this.state) {
      case 'idle':
        this.updateIdle(deltaTime);
        break;
      case 'walk':
        this.updateWalk(deltaTime);
        break;
      case 'run':
        this.updateRun(deltaTime);
        break;
      case 'sleep':
        this.updateSleep(deltaTime);
        break;
    }
  }

  updateIdle(deltaTime) {
    this.idleTimer += deltaTime;

    if (this.idleTimer >= this.idleDuration) {
      this.startPatrol();
    }
  }

  updateWalk(deltaTime) {
    if (this.targetX === null) {
      this.state = 'idle';
      this.animation.setAnimation('idle');
      this.setRandomIdleDuration();
      this.idleTimer = 0;
      this.isPatrolling = false;
      return;
    }

    const currentX = this.character.getPosition().x;
    const distance = this.targetX - currentX;
    const absDistance = Math.abs(distance);

    if (absDistance < 5) {
      this.character.setPosition(this.targetX, this.character.getPosition().y);
      this.targetX = null;
      
      if (this.isPatrolling) {
        this.reversePatrolDirection();
        this.setNextPatrolTarget();
      } else {
        this.state = 'idle';
        this.animation.setAnimation('idle');
        this.setRandomIdleDuration();
        this.idleTimer = 0;
      }
      return;
    }

    const direction = distance > 0 ? 1 : -1;
    const newX = currentX + direction * this.moveSpeed * (deltaTime / 1000);

    this.character.setFacingRight(direction > 0);
    this.character.setPosition(newX, this.character.getPosition().y);
  }

  updateRun(deltaTime) {
    this.updateWalk(deltaTime);
  }

  updateSleep(deltaTime) {
    // 잠든 상태에서는 자동으로 깨지 않음 - 클릭으로만 깨움
    this.actionTimer += deltaTime;
  }

  startPatrol() {
    this.state = 'walk';
    this.animation.setAnimation('walk');
    this.isPatrolling = true;
    this.moveSpeed = 75;
    this.setNextPatrolTarget();
  }

  setNextPatrolTarget() {
    const bounds = this.character.getBounds();
    const screenWidth = this.character.screenBounds.width;
    const margin = this.character.margin;
    const charWidth = bounds.width;

    const minX = margin;
    const maxX = screenWidth - charWidth - margin;

    if (this.patrolDirection > 0) {
      this.targetX = maxX;
    } else {
      this.targetX = minX;
    }
  }

  reversePatrolDirection() {
    this.patrolDirection *= -1;
  }

  startRun() {
    this.state = 'run';
    this.animation.setAnimation('run');
    this.moveSpeed = 200;
    this.isPatrolling = false;
    this.setRandomRunTarget();
    this.actionTimer = 0;
    this.actionDuration = 2000 + Math.random() * 2000;
  }

  setRandomRunTarget() {
    const bounds = this.character.getBounds();
    const screenWidth = this.character.screenBounds.width;
    const margin = this.character.margin;
    const charWidth = bounds.width;
    const currentX = this.character.getPosition().x;

    const minX = margin;
    const maxX = screenWidth - charWidth - margin;

    const goLeft = currentX > (minX + maxX) / 2;
    this.targetX = goLeft ? minX : maxX;
    this.character.setFacingRight(!goLeft);
  }

  startSleep() {
    this.state = 'sleep';
    this.animation.setAnimation('sleep');
    this.isPatrolling = false;
    this.actionTimer = 0;
    this.setRandomActionDuration();
  }

  onClick() {
    // 잠든 상태면 깨우기 (idle로 복귀)
    if (this.state === 'sleep') {
      this.state = 'idle';
      this.animation.setAnimation('idle');
      this.setRandomIdleDuration();
      this.idleTimer = 0;
      return;
    }

    const reactions = ['run', 'sleep'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    if (reaction === 'run') {
      this.startRun();
    } else {
      this.startSleep();
    }
  }

  onContextMenu(x, y) {
    window.dispatchEvent(new CustomEvent('show-context-menu', { detail: { x, y } }));
  }
}

window.Behavior = Behavior;