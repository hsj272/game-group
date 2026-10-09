import { XEngine, MapEntity, PcRaceTrackEntity, Sharp, Label } from './XEngine';
import RunEntity from './RunEntity';
import Car from './Car';
import Res from './RaceRes';
import CountDown from './CountDown';
import dataCenter from '@/dataCenter';
const SCALES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const STARTX = [78, 85, 93, 101.5, 110.5, 119, 128.5, 140, 152, 164];
const PC_TRACK_SCALE = 0.75;
const PC_SCENE = {
  ambienceScaleY: 1.8,
  // street 原图高 2030；缩放后可在放大的看台下完整显示到底部红白线。
  trackScale: PC_TRACK_SCALE,
  trackY: 160,
  // 车辆独立于赛道缩放，保持车道坐标不变的同时略微放大车身。
  carScale: 0.84,
  // 所有位置都由赛道原始坐标按同一比例换算，保证赛车与车道对齐。
  lineY: 140 * PC_TRACK_SCALE,
  numberX: 240 * PC_TRACK_SCALE,
  carY: 200 * PC_TRACK_SCALE,
  laneGap: ((2030 - 2) / 11) * PC_TRACK_SCALE,
};
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
    // 每次发车随机加入轻微差异，避免每一局都是相同的起步顺序；后端数据到达后会平滑接管。
    const launchVariance = dataCenter.layout.isMobile ? 0.035 : 0.02;
    const launchOffsets = Array.from(
      { length: 10 },
      () => (Math.random() * 2 - 1) * launchVariance,
    );
    const launchData = launchOffsets.map((offset) => [
      0.125 + offset,
      0.125 - offset,
      0.125,
      0.125,
      0.125,
      0.125,
      0.125,
      0.125,
    ]);
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

      this.line1.initPosition(
        2.5 * firstRacerTime,
        dataCenter.layout.isMobile ? 140 : PC_SCENE.lineY,
      );
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
    // PC 端扩大看台与闪光灯的纵向存在感，同时把赛道整体向下让出空间。
    const pcScene = dataCenter.layout.isMobile ? null : PC_SCENE;
    if (pcScene) {
      this.cityBg.mapScaleY = pcScene.ambienceScaleY;
      this.cityBg.height = this.cityBg.image.height * pcScene.ambienceScaleY;
    }
    this.engine.addChild(this.cityBg);

    this.seaBg = dataCenter.layout.isMobile
      ? new MapEntity(this.engine.getImage(Res.street))
      : new PcRaceTrackEntity(this.engine.getImage(Res.street), pcScene.trackScale);
    this.engine.addChild(this.seaBg);
    this.seaBg.y = dataCenter.layout.isMobile ? 510 : pcScene.trackY;
    this.seaBg.speed = 25;

    this.cityBg.speed = 0.6;

    this.line0 = new RunEntity(this.engine.getImage(Res.line));
    if (!dataCenter.layout.isMobile) {
      this.line0.scalex = pcScene.trackScale;
      this.line0.scaley = pcScene.trackScale;
    }
    this.seaBg.addChild(this.line0);

    const lineY = dataCenter.layout.isMobile ? 140 : pcScene.lineY;

    this.line0.initPosition(0, lineY);

    this.num0 = new RunEntity(this.engine.getImage(Res.numat));
    if (!dataCenter.layout.isMobile) {
      this.num0.scalex = pcScene.trackScale;
      this.num0.scaley = pcScene.trackScale;
    }
    this.seaBg.addChild(this.num0);
    const numX = dataCenter.layout.isMobile ? 240 : pcScene.numberX;
    const numY = dataCenter.layout.isMobile ? 140 : pcScene.lineY;
    this.num0.initPosition(numX, numY);

    this.line1 = new RunEntity(this.engine.getImage(Res.line));
    if (!dataCenter.layout.isMobile) {
      this.line1.scalex = pcScene.trackScale;
      this.line1.scaley = pcScene.trackScale;
    }
    this.seaBg.addChild(this.line1);

    // PC 端使用固定的紧凑间距，避免看台放大后最后一条车道落到画布之外。
    const gap = dataCenter.layout.isMobile
      ? (this.engine.stageHeight - this.seaBg.y) / 11
      : pcScene.laneGap;
    for (let i = 0; i < 10; i++) {
      // let b = new Car(
      //   this.engine.getImage(Res['car' + i + (dataCenter.layout.isMobile ? '' : '_pc')]),
      // );

      let b = new Car(
        this.engine.getImage(Res['car' + i + (dataCenter.layout.isMobile ? '' : '_pc')]),
      );

      this.seaBg.addChild(b);
      if (!dataCenter.layout.isMobile) {
        // PC 车辆使用独立比例放大，轮胎、喷气等子元素会同步缩放。
        b.scalex = pcScene.carScale;
        b.scaley = pcScene.carScale;
      } else {
        // 新赛车素材高度较薄，移动端按原车辆高度纵向拉伸，避免车身显得扁平。
        b.scaley = 1.35;
      }
      const carY = dataCenter.layout.isMobile ? 210 : pcScene.carY;
      // 移动端起步线更靠近车头，使用 x=0 避免赛车初始时越过线；PC 保持原位置。
      b.initPosition(dataCenter.layout.isMobile ? 0 : 10, carY + gap * i); // 右侧边缘
      // PC 终点线相对更靠右，增加终点行驶距离，确保结束时车身能碰到线。
      b.initDistance(dataCenter.layout.isMobile ? 780 : 845);
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
    this.line1.initPosition(
      2.5 * firstRacerTime,
      dataCenter.layout.isMobile ? 140 : PC_SCENE.lineY,
    );
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
    this.num0.unregister();
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
    this.num0.resetPosition();
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
