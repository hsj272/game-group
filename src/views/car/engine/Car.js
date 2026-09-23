import { Entity } from './XEngine';
import Res from './RaceRes';
import dataCenter from '@/dataCenter';
class Car extends Entity {
  constructor(param) {
    super(param);
    this.aviDistance = 10000000;
    this.ox = this.oy = 0;
    this.dy = 2.5;
    this.onEndCallback = null;
    this.isFinished = false;
    this.totalTime = 0;
    this.leftTime = 0;
    this.firstRacerTime = 0;
    this.slices = null;
    this.sliceCount = 0;
    this.sliceTime = 0;
    this.timer = 0;
    this.syncOffsetX = 0;
    this.syncTimeLeft = 0;
    this.syncDuration =  1200;
    this.isUserCar = false;

    this.wheel1 = new Entity(dataCenter.layout.isMobile ? Res.wheel : Res.wheel_pc);

    this.wheel1.x = dataCenter.layout.isMobile ? 33 : 13;
    this.wheel1.y = dataCenter.layout.isMobile ? 55 : 21;
    this.addChild(this.wheel1);
    this.wheel2 = new Entity(dataCenter.layout.isMobile ? Res.wheel : Res.wheel_pc);
    this.wheel2.x = dataCenter.layout.isMobile ? 198 : 84;
    this.wheel2.y = dataCenter.layout.isMobile ? 54 : 22;
    this.addChild(this.wheel2);

    this.water = new Entity(Res.going);
    this.water.hidden = true;
    this.water.y = dataCenter.layout.isMobile ? 68 : 22;
    this.water.x = dataCenter.layout.isMobile ? -30 : -38;
    this.addChild(this.water);
    this.quick = new Entity(Res.running);
    this.quick.hidden = true;
    this.quick.y = dataCenter.layout.isMobile ? 70 : 30;
    this.quick.x = dataCenter.layout.isMobile ? -28 : -28;
    this.addChild(this.quick);
  }
  initDistance(distance) {
    this.distance = distance;
  }
  setData(totalTime, leftTime, sliceTime, firstRacerTime, slices) {
    this.totalTime = totalTime;
    this.leftTime = leftTime;
    this.slices = slices;
    this.sliceCount = slices.length;
    this.sliceTime = sliceTime;
    this.aviDistance = 1 / this.sliceCount;
    this.firstRacerTime = firstRacerTime;
    this.syncOffsetX = 0;
    this.syncTimeLeft = 0;
  }
  syncData(totalTime, leftTime, sliceTime, firstRacerTime, slices) {
    const currentX = this.x;
    this.setData(totalTime, leftTime, sliceTime, firstRacerTime, slices);

    let elapsedTime = Math.min(totalTime - leftTime, firstRacerTime);
    const sliceIndex = Math.min(Math.floor(elapsedTime / sliceTime), slices.length - 1);
    let rate = 0;
    for (let index = 0; index < sliceIndex; index++) rate += slices[index];
    rate += (slices[sliceIndex] * (elapsedTime % sliceTime)) / sliceTime;
    const officialX =
      this.ox + this.distance * rate * 4 - (elapsedTime * this.distance * 3) / firstRacerTime;

    this.syncOffsetX = currentX - officialX;
    this.syncTimeLeft = this.syncDuration;
  }
  initPosition(x, y) {
    this.x = this.ox = x;
    this.y = this.oy = y;
  }
  resetPosition() {
    this.x = this.ox;
    this.y = this.oy;
    this.water.hidden = true;
    this.quick.hidden = true;
    this.isFinished = false;
    this.syncOffsetX = 0;
    this.syncTimeLeft = 0;
    this.wheel1.rotate = this.wheel2.rotate = 0;
  }
  onEnd(fun) {
    this.onEndCallback = fun;
  }
  setUserCar(value) {
    const nextValue = Boolean(value);
    if (this.isUserCar === nextValue) return;
    this.isUserCar = nextValue;
    this.involidate();
  }
  draw(ctx, rect) {
    super.draw(ctx, rect);
    if (!this.isUserCar || this.hidden || !this.bound.isOverlap(rect)) return;

    const isMobile = dataCenter.layout.isMobile;
    const pulse = (Math.sin(performance.now() / 180) + 1) * 0.5;
    const centerX = this.bound.x + this.bound.width * 0.5;
    const carBottom = this.bound.y + this.bound.height;
    const haloRadius = this.bound.width * (0.54 + pulse * 0.04);
    const markerY = this.bound.y - (isMobile ? 20 : 8) - pulse * (isMobile ? 7 : 3);
    const chevronWidth = isMobile ? 24 : 10;
    const chevronHeight = isMobile ? 14 : 6;
    const chevronGap = isMobile ? 11 : 5;

    ctx.save();

    // 车底能量光晕：突出车辆但不遮挡车身细节。
    ctx.translate(centerX, carBottom - (isMobile ? 8 : 3));
    ctx.scale(1, 0.28);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, haloRadius);
    halo.addColorStop(0, `rgba(255, 226, 105, ${0.42 + pulse * 0.14})`);
    halo.addColorStop(0.48, `rgba(255, 190, 57, ${0.2 + pulse * 0.08})`);
    halo.addColorStop(1, 'rgba(255, 170, 30, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 悬浮双箭头：在高速移动时也能快速定位自己的车辆。
    ctx.save();
    ctx.strokeStyle = '#FFE66D';
    ctx.lineWidth = isMobile ? 7 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#FFB72E';
    ctx.shadowBlur = isMobile ? 18 : 8;
    ctx.globalAlpha = 0.78 + pulse * 0.22;
    for (let index = 0; index < 2; index++) {
      const y = markerY - index * chevronGap;
      ctx.beginPath();
      ctx.moveTo(centerX - chevronWidth, y);
      ctx.lineTo(centerX, y + chevronHeight);
      ctx.lineTo(centerX + chevronWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  update(dt) {
    if (this.isFinished) {
      this.onEndCallback();
      return;
    }
    this.leftTime -= dt;
    let espt = this.totalTime - this.leftTime;
    if (espt >= this.firstRacerTime) {
      espt = this.firstRacerTime;
    }

    let index = Math.floor(espt / this.sliceTime);
    let rate = 0;
    let i = 0;
    for (; i < index; i++) {
      rate += this.slices[i];
    }
    rate += (this.slices[i] * (espt % this.sliceTime)) / this.sliceTime;

    if (rate > 0.999) {
      this.isFinished = true;
    }

    let nextX =
      this.ox + this.distance * rate * 4 - (espt * this.distance * 3) / this.firstRacerTime;
    if (this.syncTimeLeft > 0) {
      this.syncTimeLeft = Math.max(this.syncTimeLeft - dt, 0);
      const weight = this.syncTimeLeft / this.syncDuration;
      const smoothWeight = weight * weight * (3 - 2 * weight);
      nextX += this.syncOffsetX * smoothWeight;
    }
    this.x = nextX;

    this.wheel1.rotate += 0.8;
    this.wheel2.rotate += 0.8;

    this.quick.hidden = this.slices[index] <= this.aviDistance;
  }
  setRaceAt(index) {
    let rate = 0;
    let i = 0;
    for (; i < index; i++) {
      rate += this.slices[i];
    }
    let espt = index * this.sliceTime;
    this.x = this.ox + this.distance * rate * 4 - (espt * this.distance * 3) / this.firstRacerTime;
    this.quick.hidden = this.slices[index] <= this.aviDistance;
  }
}
export default Car;
