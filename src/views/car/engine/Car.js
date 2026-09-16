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
    this.wheel1.rotate = this.wheel2.rotate = 0;
  }
  onEnd(fun) {
    this.onEndCallback = fun;
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

    this.x = this.ox + this.distance * rate * 4 - (espt * this.distance * 3) / this.firstRacerTime;

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
