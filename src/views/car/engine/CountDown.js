import { Label } from './XEngine';

class CountDown extends Label {
  constructor(text) {
    super(text);
    this.timecount = 0;
    this.second = -1;
  }
  update(dt) {
    this.timecount -= dt;
    if (this.timecount < 0) this.timecount = 0;
    let second = Math.floor(this.timecount / 1000);
    if (second == this.second) return;
    this.second = second;
    let m = Math.floor(second / 60);
    let s = second % 60;
    this.text = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }
}
export default CountDown;
