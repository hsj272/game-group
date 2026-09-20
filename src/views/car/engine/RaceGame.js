import { XEngine, MapEntity, Sharp, Label } from './XEngine';
import RunEntity from './RunEntity';
import Car from './Car';
import Res from './RaceRes';
import CountDown from './CountDown';
import dataCenter from '@/dataCenter';
const SCALES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const STARTX = [78, 85, 93, 101.5, 110.5, 119, 128.5, 140, 152, 164];
class RaceGame {
  constructor(element) {
    this._data = [];
    this._totalTime = 1;
    this._leftTime = 0;
    this._timer = 0;
    this.minIndex = 0;
    this.raceCount = 0;
    this.isCount = false;
    this.engine = new XEngine(element);
    this.engine.run();
    this.callback = null;
    this.isInited = false;
    this.isDestoryed = false;
    this.isRunning = false;
    this.cityBg = null;
    this.seaBg = null;
    this.line0 = null;
    this.num0 = null;
    this.line1 = null;
    this.cars = [];
    this.sharper = null;
    this.delay = 0;
    this.userCarNumbers = new Set();
    this.engine.preload(Object.values(Res), this.onLoad.bind(this));
    this.lable = null;
  }
  initTotalTime(totalTime) {
    this._totalTime = totalTime;
  }
  setData(leftTime, minIndex, list) {
    if (this.isDestoryed) return;
    this._data = list;
    this.minIndex = minIndex;
    this._leftTime = leftTime;
    this._timer = performance.now();
  }
  startLaunch() {
    if (this.isDestoryed || this.isRunning) return;
    const launchData = Array.from({ length: 10 }, () =>
      Array.from({ length: 8 }, () => 0.125),
    );
    this.setData(this._totalTime, 7, launchData);
    this.run(null);
  }
  applyRaceData(leftTime, minIndex, list) {
    if (this.isDestoryed) return;
    if (this.isRunning) {
      this.resetData(leftTime, minIndex, list, null);
      return;
    }
    this.setData(leftTime, minIndex, list);
    this.run(null);
  }
  resetData(leftTime, minIndex, list, callback) {
    if (this.isDestoryed) return;
    this.callback = callback;
    this._data = list;
    this.minIndex = minIndex;
    this._leftTime = leftTime;
    this._timer = performance.now();
    if (this.isRunning) {
      let lefttime = this._leftTime - (performance.now() - this._timer);
      let sliceTime = this._totalTime / this._data[0].length;
      let firstRacerTime = (this.minIndex + 1) * sliceTime;
      for (let i = 0; i < 10; i++) {
        const car = this.cars[i];
        car.syncData(this._totalTime, lefttime, sliceTime, firstRacerTime, this._data[i]);
      }
      let realyLefttime = lefttime - (this._totalTime - firstRacerTime);
      let currentPos = 10; // 当前的位置
      let targetPos = -2.5 * firstRacerTime; // 目标位置

      // 平滑过渡，lerp的参数可以调整过渡的速度
      let lerpSpeed = 0.12;
      let newPos = currentPos + (targetPos - currentPos) * lerpSpeed;

      this.line0.setTargetPosition(newPos, firstRacerTime, realyLefttime);

      this.line1.initPosition(2.5 * firstRacerTime, dataCenter.layout.isMobile ? 140 : 30);
      this.line1.setTargetPosition(this.engine.stageWidth - 390, firstRacerTime, realyLefttime);
    } else {
      let sliceTime = this._totalTime / this._data[0].length;
      let firstRacerTime = (this.minIndex + 1) * sliceTime;
      for (let i = 0; i < 10; i++) {
        const car = this.cars[i];
        car.setData(this._totalTime, 0, sliceTime, firstRacerTime, this._data[i]);
        car.setRaceAt(this.minIndex);
      }
    }
  }
  onLoad() {
    if (this.isDestoryed) return;
    this.cityBg = new MapEntity(
      this.engine.getImage(dataCenter.layout.isMobile ? Res.city : Res.city_pc),
    );
    this.engine.addChild(this.cityBg);

    // PC 画布现在使用 1720px 高度，必须使用完整高度的赛道纹理。
    // street_pc 只有 396px 高，继续使用它会让车辆被排开后下方出现大片空白。
    this.seaBg = new MapEntity(this.engine.getImage(Res.street));
    this.engine.addChild(this.seaBg);
    this.seaBg.y = dataCenter.layout.isMobile ? 510 : 100;
    // 只缩放赛道纹理，不缩放车辆及其轮胎、喷气等子元素。
    if (!dataCenter.layout.isMobile) {
      this.seaBg.setContentScale(0.8);
    }
    this.seaBg.speed = 25;

    this.cityBg.speed = 0.6;

    // PC 的 line_pc 仅 400px 高，只能看到上方红白线；使用完整线表素材
    // 并缩放到 PC 画布比例，确保 1 到 10 号线贯穿整个赛道。
    this.line0 = new RunEntity(
      this.engine.getImage(dataCenter.layout.isMobile ? Res.line : Res.line),
    );
    if (!dataCenter.layout.isMobile) {
      this.line0.scalex = 0.65;
      this.line0.scaley = 0.85;
    }
    this.seaBg.addChild(this.line0);

    const lineY = dataCenter.layout.isMobile ? 140 : 0;

    this.line0.initPosition(0, lineY);

    this.num0 = new RunEntity(
      this.engine.getImage(dataCenter.layout.isMobile ? Res.numat : Res.numat),
    );
    if (!dataCenter.layout.isMobile) {
      this.num0.scalex = 0.65;
      this.num0.scaley = 0.85;
    }
    this.seaBg.addChild(this.num0);
    const numX = dataCenter.layout.isMobile ? 240 : 190;
    const numY = dataCenter.layout.isMobile ? 140 : 0;
    this.num0.initPosition(numX, numY);

    this.line1 = new RunEntity(
      this.engine.getImage(dataCenter.layout.isMobile ? Res.line : Res.line),
    );
    if (!dataCenter.layout.isMobile) {
      this.line1.scalex = 0.65;
      this.line1.scaley = 0.85;
    }
    this.seaBg.addChild(this.line1);

    const gap = (this.engine.stageHeight - this.seaBg.y) / 11; //计算每个车的间距
    for (let i = 0; i < 10; i++) {
      // let b = new Car(
      //   this.engine.getImage(Res['car' + i + (dataCenter.layout.isMobile ? '' : '_pc')]),
      // );

      let b = new Car(
        this.engine.getImage(Res['car' + i + (dataCenter.layout.isMobile ? '' : '_pc')]),
      );

      this.seaBg.addChild(b);
      const carY = dataCenter.layout.isMobile ? 190 : 20;
      b.initPosition(10, carY + gap * i); // 右侧边缘
      b.initDistance(750);
      b.onEnd(this.onCarEnd.bind(this));
      b.setUserCar(this.userCarNumbers.has(i + 1));
      this.cars.push(b);
    }

    this.sharper = new Sharp(this.engine.stageWidth, this.engine.stageHeight);
    this.engine.addChild(this.sharper);

    this.lable = new CountDown();
    this.lable.width = this.engine.stageWidth >> 1;
    this.lable.x = (this.engine.stageWidth - this.lable.width) >> 1;
    this.lable.height = Math.floor(this.engine.stageHeight / 3);
    this.lable.y = (this.engine.stageHeight - this.lable.height) >> 1;
    this.engine.addChild(this.lable);
    this.lable.font = dataCenter.layout.isMobile ? '200px PingFang SC' : '80px PingFang SC';
    this.lable.backgroundColor = '#E34059';
    this.lable.horAlign = Label.HOR_ALIGNS.center;
    this.lable.verAlign = Label.VER_ALIGNS.middle;
    this.lable.timecount = this.raceCount;
    this.lable.hidden = false;
    if (this.isCount) {
      this.lable.register();
    }
    this.isInited = true;
    if (this.isRunning) {
      this.start();
    }
  }
  run(fun) {
    if (this.isDestoryed) return;
    if (this.isRunning) return;
    this.isRunning = true;
    this.callback = fun;
    if (this.isInited) this.start();
  }
  start() {
    if (this.isDestoryed) return;
    this.lable.unregister();
    this.lable.hidden = true;
    this.isCount = false;
    let lefttime = this._leftTime - (performance.now() - this._timer);
    let sliceTime = this._totalTime / this._data[0].length;
    let firstRacerTime = (this.minIndex + 1) * sliceTime;
    let realyLefttime = lefttime - (this._totalTime - firstRacerTime);

    let currentPos = 10; // 当前的位置
    let targetPos = -2.5 * firstRacerTime; // 目标位置

    // 平滑过渡，lerp的参数可以调整过渡的速度
    let lerpSpeed = 0.12;
    let newPos = currentPos + (targetPos - currentPos) * lerpSpeed;

    this.line0.setTargetPosition(newPos, firstRacerTime, realyLefttime);
    this.line1.initPosition(2.5 * firstRacerTime, dataCenter.layout.isMobile ? 140 : 30);
    this.line1.setTargetPosition(this.engine.stageWidth - 390, firstRacerTime, realyLefttime);
    if (lefttime + firstRacerTime < this._totalTime) {
      this.isRunning = false;
      for (let i = 0; i < 10; i++) {
        const car = this.cars[i];
        car.setData(this._totalTime, 0, sliceTime, firstRacerTime, this._data[i]);
        car.setRaceAt(this.minIndex);
      }
      this.line0.x = 2.5 * firstRacerTime;
      this.line1.x = -1;

      return;
    }
    this.seaBg.register();
    this.cityBg.register();
    for (let i = 0; i < 10; i++) {
      const car = this.cars[i];
      car.setData(this._totalTime, lefttime, sliceTime, firstRacerTime, this._data[i]);
      car.water.hidden = false;
      car.register();
    }
    this.line0.register();
    this.num0.register();
    this.line1.register();
  }
  onCarEnd() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.seaBg.unregister();
    this.cityBg.unregister();

    this.line0.unregister();
    this.line1.unregister();
    for (let i = 0; i < 10; i++) {
      const car = this.cars[i];
      car.unregister();
    }
    this.sharper.start();
  }
  resetGame() {
    if (!this.isInited) return;
    // 切换场次时必须停止上一场的所有更新器，否则下一场 run() 会因
    // isRunning 仍为 true 而被跳过，车辆只会闪回起点却不会重新起跑。
    this.isRunning = false;
    this.seaBg.unregister();
    this.cityBg.unregister();
    this.line0.unregister();
    this.num0.unregister();
    this.line1.unregister();
    for (let i = 0; i < 10; i++) {
      const car = this.cars[i];
      car.unregister();
      car.resetPosition();
    }
    this.sharper.unregister();
    this.sharper.available = false;
    this.cityBg.resetPosition();
    this.line0.resetPosition();
    this.line1.resetPosition();
    this.lable.hidden = false;
    this.lable.register();
    this.isCount = true;
  }
  countDown(v) {
    this.raceCount = v;
    if (this.lable) this.lable.timecount = this.raceCount;
  }
  startCount() {
    this.isCount = true;
    if (this.lable) this.lable.register();
  }
  setUserCars(carNumbers) {
    this.userCarNumbers = new Set(carNumbers || []);
    for (let i = 0; i < this.cars.length; i++) {
      this.cars[i].setUserCar(this.userCarNumbers.has(i + 1));
    }
  }
  stopAndClear() {
    this.isDestoryed = true;
    this.engine.stop();
    if (this.delay) clearTimeout(this.delay);
  }
}
export default RaceGame;
