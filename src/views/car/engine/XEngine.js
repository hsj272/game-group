class XEngine {
  constructor(entitycvs) {
    this.entityLayer = entitycvs.getContext('2d');
    this.stageWidth = entitycvs.width;
    this.stageHeight = entitycvs.height;
    this.inolideRects = [];
    this.displayList = [];
    this.nexts = [];
    this.timer = 0;
    this.isRunning = false;
    this.updater = this.main.bind(this);
    this.updateList = [];
    this.resDict = {};
    this.rotate = 0;
  }
  run() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = window.performance.now();
    window.requestAnimationFrame(this.updater);
  }
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
  }
  main() {
    if (this.isRunning) {
      window.requestAnimationFrame(this.updater);
      var tNow = window.performance.now();
      this.update(tNow - this.timer);
      this.timer = tNow;
    }
  }
  update(dt) {
    let len = this.nexts.length;
    for (let i = 0; i < len; i++) {
      this.nexts[i]();
    }
    this.nexts.length = 0;

    let rectLen = this.inolideRects.length;
    if (rectLen > 0) {
      for (let j = 0; j < rectLen; j++) {
        let r = this.inolideRects[j];
        this.entityLayer.clearRect(r.x, r.y, r.width, r.height);
      }
      len = this.displayList.length;
      for (let i = 0; i < len; i++) {
        let displayobj = this.displayList[i];
        if (!displayobj.available) continue;
        for (let j = 0; j < rectLen; j++) {
          displayobj.beforeDraw(this.entityLayer);
          displayobj.draw(this.entityLayer, this.inolideRects[j]);
          displayobj.afterDraw(this.entityLayer);
        }
      }
      this.inolideRects.length = 0;
    }

    len = this.updateList.length;
    if (len > 0) {
      let list = this.updateList.concat();
      for (let i = 0; i < len; i++) {
        list[i](dt);
      }
    }
  }
  addInvolideRect(rect) {
    if (rect.x > this.stageWidth || rect.y > this.stageHeight) return;
    if (rect.x < 0) rect.x = 0;
    if (rect.y < 0) rect.y = 0;
    if (rect.maxx > this.stageWidth) rect.maxx = this.stageWidth;
    if (rect.maxy > this.stageHeight) rect.maxy = this.stageHeight;
    let index = -1;
    for (var i = this.inolideRects.length - 1; i >= 0; i--) {
      let r = this.inolideRects[i];
      if (r.isOverlap(rect)) {
        r.combine(rect);
        rect = r;
        if (index != -1)
          //曾经有过重叠，把上一个重叠的释放
          this.inolideRects.splice(index, 1);
        index = i;
      }
    }
    if (index == -1)
      //一个都没重叠
      this.inolideRects.push(rect);
  }
  addUpdater(fun) {
    if (!fun) return -1;
    let index = this.updateList.indexOf(fun);
    if (index != -1) return index;
    return this.updateList.push(fun);
  }
  removeUpdater(fun) {
    if (!fun) return;
    let index = this.updateList.indexOf(fun);
    if (index == -1) return;
    this.updateList.splice(index, 1);
  }
  addNext(fun) {
    if (!fun) return;
    return this.nexts.push(fun);
  }
  removeNext(index) {
    this.nexts.aplice(index, 1);
  }
  addChild(displayobject) {
    let index = this.displayList.indexOf(displayobject);
    if (index != -1) return index;
    displayobject.game = this;
    index = this.displayList.push(displayobject);
    displayobject.onAddToStage();
    return index;
  }
  removeChild(displayobject) {
    let index = this.displayList.indexOf(displayobject);
    if (index == -1) return;
    this.displayList.splice(index, 1);
    displayobject.onRemoveFromStage();
  }
  preload(list, fun) {
    let count = list.length;
    for (let i = 0, len = count; i < len; i++) {
      let img = new Image();
      img.src = list[i];
      img.onload = loadOver;
      img.onerror = loadOver;
      this.resDict[list[i]] = img;
    }
    function loadOver() {
      --count;
      if (count <= 0) {
        fun();
      }
    }
  }
  getImage(path) {
    return this.resDict[path];
  }
}
class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  get maxx() {
    return this.x + this.width;
  }
  set maxx(mx) {
    this.width = mx - this.x;
  }
  get maxy() {
    return this.y + this.height;
  }
  set maxy(my) {
    this.height = my - this.y;
  }
  set minx(mx) {
    this.width += this.x + this.width - mx;
    this.x = mx;
  }
  set miny(my) {
    this.height = this.y + this.height - my;
    this.y = my;
  }
  copy(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }
  combine(rect) {
    if (rect.maxx > this.maxx) this.maxx = rect.maxx;
    if (rect.maxy > this.maxy) this.maxy = rect.maxy;
    if (rect.x < this.x) this.minx = rect.x;
    if (rect.y < this.y) this.miny = rect.y;
    return this;
  }
  isOverlap(rect) {
    if (this.x >= rect.maxx) return false;
    if (this.y >= rect.maxy) return false;
    if (rect.x >= this.maxx) return false;
    if (rect.y >= this.maxy) return false;
    return true;
  }
  cut(rect) {
    let x = this.x < rect.x ? rect.x : this.x;
    let y = this.y < rect.y ? rect.y : this.y;
    let maxx = this.maxx > rect.maxx ? rect.maxx : this.maxx;
    let maxy = this.maxy > rect.maxy ? rect.maxy : this.maxy;
    let width = maxx - x;
    let height = maxy - y;
    if (width <= 0 || height <= 0) return new Rect(0, 0, 0, 0);
    return new Rect(x, y, width, height);
  }
  clip(rect, box, scalex, scaley) {
    let x = rect.x + box.x - this.x;
    let y = rect.y + box.y - this.y;
    return new Rect(x / scalex, y / scaley, box.width / scalex, box.height / scaley);
  }
}
class DisplayObject {
  constructor() {
    this.rect = new Rect(0, 0, 0, 0);
    this.rect0 = new Rect(0, 0, 0, 0);
    this.bound = new Rect(0, 0, 0, 0);
    this._scalex = 1;
    this._scaley = 1;
    this.realScalex = this.realScaley = 1;
    this._rotate = 0;
    this.available = false;
    this.waitInvolide = false;
    this._game = null;
    this.updater = this.update.bind(this);
    this.children = [];
    this.parent = null;
    this._hidden = false;
    this._isRegist = false;
    this.regx = 0;
    this.regy = 0;
  }
  set hidden(v) {
    if (v == this._hidden) return;
    this._hidden = v;
    this.involidate();
  }
  get hidden() {
    return this._hidden;
  }
  set game(v) {
    if (this._game == v) return;
    if (this._game) {
      if (!this._isRegist) this._game.removeUpdater(this.updater);
    }
    this._game = v;
    if (this._game) {
      if (this._isRegist) this._isRegist.addUpdater(this.updater);
    }
    let len = this.children.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        this.children[i].game = v;
      }
    }
  }
  get game() {
    return this._game;
  }
  set scalex(v) {
    if (v == this._scalex) return;
    this._scalex = v;
    this.updateChildScalex();
  }
  get scalex() {
    return this._scalex;
  }
  set scaley(v) {
    if (v == this._scaley) return;
    this._scaley = v;
    this.updateChildScaley();
  }
  updateChildScalex() {
    this.realScalex = this.parent ? this.parent.realScalex * this._scalex : this._scalex;
    this.involidate();
    let len = this.children.length;
    if (len <= 0) return;
    for (let i = 0; i < len; i++) {
      this.children[i].updateChildScalex();
    }
  }
  updateChildScaley() {
    this.realScaley = this.parent ? this.parent.realScaley * this._scaley : this._scaley;
    this.involidate();
    let len = this.children.length;
    if (len <= 0) return;
    for (let i = 0; i < len; i++) {
      this.children[i].updateChildScaley();
    }
  }
  set rotate(v) {
    if (v == this._rotate) return;
    this._rotate = v;
    this.involidate();
  }
  get rotate() {
    return this._rotate;
  }
  get scaley() {
    return this._scaley;
  }
  get orginx() {
    if (this.parent) return this.parent.orginx + this.rect.x;
    return this.rect.x;
  }
  get orginy() {
    if (this.parent) return this.parent.orginy + this.rect.y;
    return this.rect.y;
  }
  set x(v) {
    if (v == this.rect.x) return;
    this.rect.x = v;
    this.involidate();
  }
  get x() {
    return this.rect.x;
  }
  set y(v) {
    if (v == this.rect.y) return;
    this.rect.y = v;
    this.involidate();
  }
  get y() {
    return this.rect.y;
  }
  set width(v) {
    if (this.rect.width == v) return;
    this.rect.width = v;
    this.involidate();
  }
  get width() {
    return this.rect.width;
  }
  set height(v) {
    if (this.rect.height == v) return;
    this.rect.height = v;
    this.involidate();
  }
  get height() {
    return this.rect.height;
  }
  involidate() {
    if (this.waitInvolide) return;
    if (!this.game) return;
    this.waitInvolide = true;
    this.game.addNext(() => {
      let r = new Rect(
        this.rect0.x,
        this.rect0.y,
        this.rect0.width * this.realScalex,
        this.rect0.height * this.realScaley,
      );
      this.bound.copy(this.rect);
      this.bound.width *= this.realScalex;
      this.bound.height *= this.realScaley;
      if (this.parent) {
        r.x += this.parent.orginx;
        r.y += this.parent.orginy;
        if (this.parent) {
          //如果有父对象，需要基于父对象的缩放进行计算
          this.bound.x = this.parent.orginx + this.bound.x * this.parent.realScalex;
          this.bound.y = this.parent.orginy + this.bound.y * this.parent.realScaley;
        } else {
          this.bound.x += this.parent.orginx;
          this.bound.y += this.parent.orginy;
        }
      }
      this.regx = this.bound.x + this.bound.width * 0.5;
      this.regy = this.bound.y + this.bound.height * 0.5;
      this.game.addInvolideRect(r.combine(this.bound));
      this.rect0.copy(this.rect);
      this.waitInvolide = false;
    });

    let len = this.children.length;
    if (len <= 0) return;
    for (let i = 0; i < len; i++) {
      this.children[i].involidate();
    }
  }
  register() {
    if (this._isRegist) return;
    this._isRegist = true;
    if (this.game) {
      this.game.addUpdater(this.updater);
    }
  }
  unregister() {
    if (!this._isRegist) return;
    this._isRegist = false;
    if (this.game) {
      this.game.removeUpdater(this.updater);
    }
  }
  beforeDraw(ctx) {
    if (this._rotate) {
      ctx.translate(this.regx, this.regy);
      ctx.rotate(this._rotate);
      ctx.translate(-this.regx, -this.regy);
    }
  }
  draw(ctx, rect) {
    let len = this.children.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        let child = this.children[i];
        child.beforeDraw(ctx);
        child.draw(ctx, rect);
        child.afterDraw(ctx);
      }
    }
  }
  afterDraw(ctx) {
    if (this._rotate) {
      ctx.translate(this.regx, this.regy);
      ctx.rotate(-this._rotate);
      ctx.translate(-this.regx, -this.regy);
    }
  }
  addChild(displayobject) {
    if (!displayobject) return;
    let index = this.children.indexOf(displayobject);
    if (index != -1) return;
    displayobject.parent = this;
    displayobject.game = this.game;
    this.children.push(displayobject);
  }
  removeChild(displayobject) {
    if (!displayobject) return;
    let index = this.children.indexOf(displayobject);
    if (index == -1) return;
    displayobject.parent = null;
    this.children.splice(index, 1);
  }
  onAddToStage() {}
  onRemoveFromStage() {}
  update(dt) {}
}
const alphaValues = [
  0.1, 0.2, 0.4, 0.8, 1, 1, 1, 0.99, 0.97, 0.94, 0.9, 0.85, 0.79, 0.72, 0.64, 0.55, 0.45, 0.34,
  0.22, 0.09, 0,
];
let alphaLength = alphaValues.length;
class Sharp extends DisplayObject {
  constructor(width, height) {
    super();
    this.rect.width = width;
    this.rect.height = height;
    this.alphaIndex = 0;
    this.callback = null;
  }
  start(fun) {
    this.callback = fun;
    this.available = true;
    this.alphaIndex = 0;
    this.register();
  }
  update(dt) {
    ++this.alphaIndex;
    if (this.alphaIndex >= alphaLength) {
      this.unregister();
      this.available = false;
      if (this.callback) this.callback();
    } else this.involidate();
  }
  draw(ctx, rect) {
    ctx.fillStyle = 'rgba(255,255,255,' + alphaValues[this.alphaIndex] + ')';
    ctx.fillRect(0, 0, this.width, this.height);
    super.draw(ctx, rect);
  }
}
class Label extends DisplayObject {
  constructor(text) {
    super();
    if (text) this._text = text;
    else this._text = '';
    this._horAlign = 0;
    this._verAlign = 0;
    this.available = true;
    this._font = '';
    this._color = '#ffffff';
    this._backgroundColor = '#000000';
  }
  set backgroundColor(v) {
    if (v == this._backgroundColor) return;
    this._backgroundColor = v;
    this.involidate();
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set text(v) {
    if (v == this._text) return;
    this._text = v;
    this.involidate();
  }
  get text() {
    return this._text;
  }
  set color(v) {
    if (v == this._color) return;
    this._color = v;
    this.involidate();
  }
  get color() {
    return this._color;
  }
  set horAlign(v) {
    if (this._horAlign == v) return;
    this._horAlign = v;
    this.involidate();
  }
  get horAlign() {
    return this._horAlign;
  }
  set verAlign(v) {
    if (this._verAlign == v) return;
    this._verAlign = v;
    this.involidate();
  }
  get verAlign() {
    return this._verAlign;
  }
  set font(v) {
    if (this._font == v) return;
    this._font = v;
    this.involidate();
  }
  get font() {
    return this._font;
  }
  draw(ctx, rect) {
    if (!this.hidden) {
      if (this.bound.isOverlap(rect)) {
        ctx.font = this._font;
        ctx.fillStyle = this._color;
        let x = 0,
          y = 0;
        if (this._horAlign == Label.HOR_ALIGNS.center) {
          x = this.bound.x + (this.width >> 1);
          ctx.textAlign = 'center';
        } else if (this._horAlign == Label.HOR_ALIGNS.right) {
          x = this.width + this.bound.x;
          ctx.textAlign = 'right';
        } else {
          x = this.bound.x;
          ctx.textAlign = 'left';
        }
        if (this._verAlign == Label.VER_ALIGNS.middle) {
          y = (this.height >> 1) + this.bound.y;
          ctx.textBaseline = 'middle';
        } else if (this._verAlign == Label.VER_ALIGNS.bottom) {
          y = this.height + this.bound.y;
          ctx.textBaseline = 'bottom';
        } else {
          y = this.bound.y;
          ctx.textBaseline = 'top';
        }
        ctx.fillText(this._text, x, y);
        ctx.fillStyle = 'rgba(0,0,0,0)';
      }
    }
    super.draw(ctx, rect);
  }
}
Label.HOR_ALIGNS = { left: 0, center: 1, right: 2 };
Label.VER_ALIGNS = { top: 0, middle: 1, bottom: 2 };
class Sprite extends DisplayObject {
  constructor(param, offsetx, offsety, srcwidth, srcheight) {
    super();
    let image;
    if (typeof param == 'string') {
      image = new Image();
      image.src = param;
    } else {
      image = param;
    }
    this.image = image;
    this.rect.width = image.width;
    this.rect.height = image.height;
    this.srcRect = new Rect(
      offsetx ? offsetx : 0,
      offsety ? offsety : 0,
      srcwidth ? srcwidth : image.width,
      srcheight ? srcheight : image.height,
    );
    if (!image.complete) {
      image.onload = () => {
        this.available = true;
        this.involidate();
        image.onload = null;
      };
    } else {
      this.available = true;
      this.involidate();
    }
  }
}

class MapEntity extends Sprite {
  constructor(param) {
    super(param);
    this.speed = 0;
    this.dx = 0;
    this.startx = 0;
    this.mapScaleX = 1;
    this.mapScaleY = 1;
  }
  onAddToStage() {
    this.startx = this.dx = this.width - this.game.stageWidth;
  }
  draw(ctx, rect) {
    //mapentity直接放舞台
    if (this.rect.isOverlap(rect)) {
      let r = this.rect.cut(rect);
      let sr = this.rect.clip(this.srcRect, r, this.mapScaleX, this.mapScaleY);
      const imageWidth = this.image.width;
      const sx = ((sr.x + this.dx) % imageWidth + imageWidth) % imageWidth;
      const firstWidth = Math.min(sr.width, imageWidth - sx);
      ctx.drawImage(this.image, sx, sr.y, firstWidth, sr.height, r.x, r.y, firstWidth, r.height);
      if (firstWidth < sr.width) {
        ctx.drawImage(
          this.image,
          0,
          sr.y,
          sr.width - firstWidth,
          sr.height,
          r.x + firstWidth,
          r.y,
          sr.width - firstWidth,
          r.height,
        );
      }
    }
    super.draw(ctx, rect);
  }
  update(dt) {
    this.dx += (this.speed * dt) / 10;
    this.involidate();
  }
  resetPosition() {
    this.dx = this.startx;
    this.involidate();
  }
}

// PC 赛道独立使用缩放后的单向循环，不改变 MapEntity，也不缩放赛车子元素。
class PcRaceTrackEntity extends MapEntity {
  constructor(param, scale = 0.8) {
    super(param);
    this.trackScale = scale;
    this.rect.width = this.image.width * scale;
    this.rect.height = this.image.height * scale;
    this.loopWidth = 0;
  }
  onAddToStage() {
    this.loopWidth = this.image.width;
    this.startx = this.dx = 0;
  }
  draw(ctx, rect) {
    if (this.rect.isOverlap(rect)) {
      const r = this.rect.cut(rect);
      const sourceX =
        (((r.x - this.rect.x) / this.trackScale + this.dx) % this.image.width +
          this.image.width) %
        this.image.width;
      const sourceY = (r.y - this.rect.y) / this.trackScale;
      const sourceWidth = r.width / this.trackScale;
      const sourceHeight = r.height / this.trackScale;
      const firstWidth = Math.min(sourceWidth, this.image.width - sourceX);
      const destFirstWidth = firstWidth * this.trackScale;
      ctx.drawImage(this.image, sourceX, sourceY, firstWidth, sourceHeight, r.x, r.y, destFirstWidth, r.height);
      if (firstWidth < sourceWidth) {
        const secondWidth = sourceWidth - firstWidth;
        ctx.drawImage(this.image, 0, sourceY, secondWidth, sourceHeight, r.x + destFirstWidth, r.y, secondWidth * this.trackScale, r.height);
      }
    }
    DisplayObject.prototype.draw.call(this, ctx, rect);
  }
  update(dt) {
    this.dx += (this.speed * dt) / 10;
    if (this.dx >= this.image.width) this.dx %= this.image.width;
    this.involidate();
  }
}
class Entity extends Sprite {
  constructor(param, offsetx, offsety, srcwidth, srcheight) {
    super(param, offsetx, offsety, srcwidth, srcheight);
  }
  draw(ctx, rect) {
    if (!this.hidden) {
      if (this.bound.isOverlap(rect)) {
        let r = this.bound.cut(rect);
        let sr = this.bound.clip(this.srcRect, r, this.realScalex, this.realScaley);
        ctx.drawImage(this.image, sr.x, sr.y, sr.width, sr.height, r.x, r.y, r.width, r.height);
      }
    }
    super.draw(ctx, rect);
  }
}
export { XEngine, Rect, Sharp, Sprite, MapEntity, PcRaceTrackEntity, Entity, Label };
