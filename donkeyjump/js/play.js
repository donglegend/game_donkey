/**
 * fn: 游戏核心逻辑
 */
function Play() {
  this.cursors = null; // 接受键盘事件
  this.layerBgScene = null; // 背景层
  this.layerReady = null;
  this.layerCloud = null;
  this.layerStairs = null;
  this.layerProps = null;
  this.lastStairY = 350;
  this.stairHeight = 200;
  this.propChange = 4;
  this.virtualCursors = {
    left: {
      isDown: false,
    },
    right: {
      isDown: false,
    },
  };
}
window.donkeyScore = 0;
Play.prototype = {
  constructor: Play,
  /**
   * 游戏初始化
   */
  init: function() {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.cursors = this.cursors;

    this.layerBgScene = new BgScene(this.game);

    this.createStairs(10);

    this.cloud = new EffectCloud(this.game);
    this.cloud.init();
    this.game.cloud = this.cloud;

    this.layerReady = new ReadyGo(this.game);
    this.game.layerReady = this.layerReady;

    this.score = new Score(this.game);

    this.donkey = new Donkey(this.game);

    this.createVirtualKey();
    this.game.virtualCursors = this.virtualCursors;

    this.game.camera.bounds = true;
    window.donkeyScore = 0;
  },
  update: function() {
    this.updateDonkey();
    this.updateScore();
    this.updateObject();
    this.updateBgScene();
  },
  shutdown: function(params) {
    this.layerStairs && this.layerStairs.destroy();
    this.layerProps && this.layerProps.destroy();
    this.donkey.donkeyGroup.destroy();

    this.layerBgScene = null;
    this.cursors = null;
    this.layerReady = null;
    this.layerCloud = null;
    this.layerStairs = null;
    this.layerProps = null;
    this.lastStairY = 350;
    this.stairHeight = 200;
  },
  render: function() {
    // this.game.debug.body(this.donkey.donkey);
    // this.layerStairs.forEach(function(params) {
    //   this.game.debug.body(params);
    // }, this);
    // this.layerProps.forEach(function(params) {
    //   this.game.debug.body(params);
    // }, this);
  },
  /**
   * 创建云阶梯
   * @param {*} num 创建阶梯个数
   */
  createStairs: function(num) {
    if (!num) {
      return;
    }
    if (!this.layerStairs) {
      this.layerStairs = this.game.add.group();
      this.layerStairs._name = 'group_stairs';
      this.layerStairs.enableBody = true;
      this.layerStairs.enableBodyDebug = true;
      this.layerStairs.physicsBodyType = Phaser.Physics.ARCADE;
      this.game.layerStairs = this.layerStairs;
    }
    while (num--) {
      var stair = new Stair(this.game);
      stair.init({
        y: this.lastStairY,
      });
      this.createProp(stair);
      this.layerStairs.add(stair.stair);
      this.lastStairY -= this.stairHeight;
    }
  },
  /**
   * 随机创建道具
   * @param {*} stair
   */
  createProp: function(stair) {
    if (
      stair.name !== 'stair_moveable' &&
      this.game.rnd.between(1, 10) < this.propChange
    ) {
      if (!this.layerProps) {
        this.layerProps = this.game.add.group();
        this.layerProps.enableBody = true;
        this.layerProps.enableBodyDebug = true;
        this.layerProps.physicsBodyType = Phaser.Physics.ARCADE;
        this.game.layerProps = this.layerProps;
      }
      var prop = new Prop(this.game);
      prop.init({
        wx: stair.stair.body.sourceWidth,
        x: stair.stair.x,
        y: stair.stair.y,
      });
      this.layerProps.add(prop.prop);
    }
  },
  /**
   * 更新驴子信息
   */
  updateDonkey: function() {
    this.donkey.update();
  },
  /**
   * 更新得分
   */
  updateScore: function() {
    var score = Math.floor(Math.abs(this.camera.y));
    window.donkeyScore = score;
    this.score.update(score);
  },
  /**
   * 更新云阶梯和道具
   */
  updateObject: function() {
    var self = this;
    [this.layerStairs, this.layerProps].forEach(function(group) {
      if (group) {
        group.forEach(function(sprite) {
          if (
            !sprite.visible ||
            sprite.y - this.camera.y > this.camera.height
          ) {
            group.remove(sprite, true);
            if (group._name === 'group_stairs') this.createStairs(1);
          }
        }, self);
      }
    });
  },
  /**
   * 背景层视差移动
   */
  updateBgScene: function() {
    this.layerBgScene.update(this.camera.y);
  },
  isMobile: function() {
    const userAgent = window.navigator.userAgent;
    return userAgent.match(
      /(iPhone|iPod|Android|ios|iPad|AppleWebKit.*Mobile.*)/i
    );
  },
  createVirtualKey: function() {
    if (!this.isMobile()) {
      return;
    }
    this.layerKeyLeft = this.game.add.sprite(
      0,
      this.game.world.height - 200,
      'arrow_key'
    );
    this.layerKeyLeft.inputEnabled = true;
    this.layerKeyLeft.fixedToCamera = true;

    this.layerKeyLeft.events.onInputDown.add(function() {
      this.virtualCursors.left.isDown = true;
      this.layerKeyLeft.width = 250;
    }, this);
    this.layerKeyLeft.events.onInputUp.add(function() {
      this.virtualCursors.left.isDown = false;
      this.layerKeyLeft.width = 240;
    }, this);

    this.layerKeyRight = this.game.add.sprite(
      this.game.world.width / 2,
      this.game.world.height - 200,
      'arrow_key'
    );
    this.layerKeyRight.frame = 1;
    this.layerKeyRight.inputEnabled = true;
    this.layerKeyRight.fixedToCamera = true;
    this.layerKeyRight.events.onInputDown.add(function() {
      this.virtualCursors.right.isDown = true;
      this.layerKeyRight.width = 250;
    }, this);
    this.layerKeyRight.events.onInputUp.add(function() {
      this.virtualCursors.right.isDown = false;
      this.layerKeyRight.width = 240;
    }, this);
  },
};
