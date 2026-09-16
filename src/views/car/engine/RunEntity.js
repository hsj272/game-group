import { Entity } from './XEngine';
class RunEntity extends Entity {
  constructor(param) {
    super(param);
    this.ox = this.oy = 0;
    this.targetx = 0;
    this.totalTime = 0;
    this.leftTime = 0;
  }
  initPosition(x, y) {
    super.x = this.ox = x;
    super.y = this.oy = y;
  }
  setTargetPosition(x, totalTime, lefttime) {
    this.targetx = x;
    this.totalTime = totalTime;
    this.leftTime = lefttime;
  }
  resetPosition() {
    super.x = this.ox;
    super.y = this.oy;
  }
  update(dt) {
    this.leftTime -= dt;
    if (this.leftTime < 10) this.leftTime = 0;
    super.x =
      this.ox + ((this.targetx - this.ox) * (this.totalTime - this.leftTime)) / this.totalTime;
    //console.log(this.x);
  }
}
export default RunEntity;
