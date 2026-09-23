<template>
  <div class="game-car" :class="{ 'final-sprint': isFinalSprint }">
    <canvas id="simulator" width="1242" height="2533" v-if="dataCenter.layout.isMobile"></canvas>
    <canvas id="simulator" width="1242" height="1720" v-if="!dataCenter.layout.isMobile"></canvas>
    <CarHeader :car-game="carGame" />
    <div v-if="raceTopThree.length" class="live-ranking">
      <p class="live-ranking-title"><i></i> 实时前三名</p>
      <div v-for="(carNumber, index) in raceTopThree" :key="carNumber" class="live-ranking-row"
        :class="{ selected: selectedCars.includes(carNumber) }">
        <span class="position">{{ index + 1 }}</span>
        <strong>{{ carNumber }}号车</strong>
        <em v-if="selectedCars.includes(carNumber)">我的车</em>
      </div>
    </div>
    <Transition name="race-notice">
      <div v-if="raceNotice" :key="raceNotice" class="race-notice">{{ raceNotice }}</div>
    </Transition>
    <Transition name="race-notice">
      <div v-if="isFinalSprint" class="sprint-notice">最后冲刺</div>
    </Transition>
    <Transition name="countdown-pop">
      <div v-if="preStartText" :key="preStartText" class="pre-start-overlay" :class="{ go: preStartText === '开始' }">
        <span>{{ preStartText }}</span>
        <small v-if="/^\d$/.test(preStartText)">准备开始</small>
      </div>
    </Transition>
    <Transition name="result-pop">
      <section v-if="isResultVisible" class="race-result">
        <p class="result-eyebrow">比赛结束</p>
        <h2>{{ rewardAmount !== null ? '恭喜中奖' : '最终排名' }}</h2>
        <p v-if="rewardAmount !== null" class="reward-amount">+{{ rewardAmount }}</p>
        <div class="result-podium">
          <div v-for="(carNumber, index) in finalTopThree" :key="carNumber" class="result-podium-item"
            :class="[`place-${index + 1}`, { selected: selectedCars.includes(carNumber) }]">
            <span>#{{ index + 1 }}</span>
            <strong>{{ carNumber }}号车</strong>
            <small v-if="selectedCars.includes(carNumber)">我的车</small>
          </div>
        </div>
        <p class="result-message">{{ resultMessage }}</p>
        <button type="button" class="play-again-btn" @click="goToNextRace">
          立即进入下一场
        </button>
        <p class="next-race-tip">{{ resultSeconds }}秒后进入下一场</p>
      </section>
    </Transition>
    <CarBottom :is-run-car="isStartCar || isBettingLocked" @bet-confirmed="markUserCars" />
  </div>
</template>

<script setup lang="ts">
import CarHeader from '@/views/car/components/CarHeader.vue';
import CarBottom from '@/views/car/components/CarBottom.vue';
import { computed, ref } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import RaceGame from './engine/RaceGame';
import { fetchMyBets, fetchRacingConfig, fetchStartCarGame, fetchStartGame } from '../api';
import { tip } from '@/components/notice/Notice';
import { convertTime, getCurrentTime } from '@/utils';
import { useRoute, useRouter } from 'vue-router';
import type { StartMatchResp } from '../api/protocol';
import { onUnmounted } from 'vue';
import { soundManager } from '@/manager/soundManager';
import backgroundMusic from '@/assets/events/car/gamy.mp3';
import xm3272 from '@/assets/events/car/xm3272.wav';
import dataCenter from '@/dataCenter';
import { RacingSocket } from '@/manager/racingSocket';
const route = useRoute();
const router = useRouter();
const startGameData = ref<StartMatchResp>();
let animationFrameId: number | null = null;
const countdownTimer = ref(0);
const preStartText = ref('');
const isBettingLocked = ref(false);
let preStartHideTimer = 0;
let raceNoticeTimer = 0;
let resultRevealTimer = 0;
let pollTimer = 0;
let racingSocket: RacingSocket | undefined;
let isChangingRace = false;
let isStartingRace = false;
let raceStartRetryTimer = 0;
//游戏开始了
const isStartCar = ref(false);
const isFinalSprint = ref(false);
const isResultVisible = ref(false);
const resultSeconds = ref(3);
const rewardAmount = ref<number | null>(null);
const selectedCars = ref<number[]>([]);
const raceNotice = ref('');
const raceTopThree = computed(() => carGame.paihangValue.slice(0, 3));
let previousRanking: number[] = [];
interface CarGame {
  /**倒计时 */
  outTimeValue: string;
  /**hash值 */
  hashValues: string;
  /**排行榜 */
  paihangValue: number[];
  /**进度 */
  progress: number;
}
const carGame = reactive<CarGame>({
  /**倒计时 */
  outTimeValue: '',
  /**hash值 */
  hashValues: '',
  /**排行榜 */
  paihangValue: [],
  /**进度 */
  progress: 0,
});
const finalTopThree = computed(() => carGame.paihangValue.slice(0, 3));
const resultMessage = computed(() => {
  if (rewardAmount.value !== null) return '奖励已到账，准备再赢一场吧！';
  if (!selectedCars.value.length) return '下一场比赛即将开始';

  const positions = selectedCars.value
    .map((carNumber) => carGame.paihangValue.indexOf(carNumber) + 1)
    .filter((position) => position > 0);
  if (!positions.length) return '下一场比赛即将开始';
  const bestPosition = Math.min(...positions);
  if (bestPosition === 2) return '只差一名，下一场继续冲！';
  return `你选择的赛车最好成绩是第${bestPosition}名`;
});
/**
 * 倒计时
 *  lastSecond = 0;
 *  timer = 0;
 * threeSecondTriggered = false; // 记录是否触发过 3 秒倒计时
 */
const countdownData = reactive({
  lastSecond: Number.NaN,
  timer: 0,
  threeSecondTriggered: false,
});
const raceGame = ref<RaceGame>();
onMounted(async () => {
  const canvas = document.getElementById('simulator') as HTMLCanvasElement;
  if (!canvas) return;
  raceGame.value = new RaceGame(canvas);
  raceGame.value?.resetGame();
  raceGame.value?.initTotalTime(21579);
  const mask = ~(1 << 31);
  soundManager.play(backgroundMusic, mask, false);
  try {
    const config = await fetchRacingConfig();
    dataCenter.bettingConfig.update(config);
    await refreshGame();
  } catch (error) {
    tip.error(error instanceof Error ? error.message : 'Failed to load race');
  }
  pollTimer = window.setInterval(pollCountdown, 1000);
  racingSocket = new RacingSocket({
    onReward: (payload) => {
      if (payload.racingId !== Number(route.query.gameId)) return;
      rewardAmount.value = payload.reward;
      tip.success(`获得奖励：${payload.reward}`);
      playVictorySound();
    },
    onResult: (payload) => {
      if (payload.racingId !== Number(route.query.gameId)) return;
      showRaceResult(payload.ranking.split(',').map(Number));
    },
    onOpen: () => void pollCountdown(),
  });
  racingSocket.connect();
});

onUnmounted(() => {
  soundManager.stopAll();
  clearInterval(countdownData.timer);
  clearInterval(countdownTimer.value);
  clearInterval(pollTimer);
  clearTimeout(preStartHideTimer);
  clearTimeout(raceNoticeTimer);
  clearTimeout(resultRevealTimer);
  clearTimeout(raceStartRetryTimer);
  racingSocket?.close();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// 刷新游戏
async function refreshGame() {
  const racingId = Number(route.query.gameId);
  try {
    const resp = await fetchStartGame(racingId);
    if (racingId !== Number(route.query.gameId)) return;
    startGameData.value = resp;
    isBettingLocked.value = resp.status !== 1;
    void restoreUserCars(racingId);

    carGame.hashValues = resp.hash
      ? resp.hash
      : `${import.meta.env.VITE_APP_KU}${resp.lastBlockNumber}`;
    if (resp.status === 2 && resp.racingCarRanking) {
      const diffTimer = convertTime(resp.endTime) - getCurrentTime();
      if (diffTimer > 0) {
        runCar(resp.endTime!, resp.remainingMillis ?? diffTimer, resp.racingCarRanking);
      } else {
        showRaceResult(resp.racingCarRanking.rankings);
      }
    } else {
      updateTimes();
      if (countdownData.timer === 0)
        countdownData.timer = setInterval(updateTimes, 100) as unknown as number;
    }
  } catch (error) {
    tip.error(error instanceof Error ? error.message : 'Failed to load race');
  }
}

/**
 * 倒计时
 */
function updateTimes() {
  if (!startGameData.value) return;
  let leftSecond = Math.floor(
    (convertTime(startGameData.value.startTime!) - getCurrentTime()) / 1000,
  );

  if (countdownData.lastSecond === leftSecond) return;
  countdownData.lastSecond = leftSecond;
  if (leftSecond <= 3 && leftSecond > 0) {
    preStartText.value = String(leftSecond);
  }
  // 判断是否剩余 3 秒，并确保只触发一次
  if (leftSecond <= 3 && leftSecond > 0 && !countdownData.threeSecondTriggered) {
    countdownData.threeSecondTriggered = true;
    // 旧版画布 3、2、1 倒计时，暂时停用；需要恢复时取消下面两行注释。
    // raceGame.value?.startCount();
    // raceGame.value?.countDown(4000);
    soundManager.play(xm3272, 1, false);
    startCar();
  }
  if (leftSecond <= 0) {
    clearInterval(countdownData.timer);
    countdownData.timer = 0; // 重置定时器为 0
    carGame.outTimeValue = '';
    isBettingLocked.value = true;
    preStartText.value = '开始';
    clearTimeout(preStartHideTimer);
    raceGame.value?.startLaunch();
    isStartCar.value = true;
    preStartHideTimer = window.setTimeout(() => {
      preStartText.value = '';
    }, 300);
    void startRaceAfterCountdown();
    return;
  }
  let minutes = Math.floor(leftSecond / 60);
  let seconds = leftSecond % 60;
  carGame.outTimeValue =
    (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}
/**
 * 根据这个写一个倒计时函数
 *
 * 结束时间 string
 * 剩余时间 number （毫秒）
 * 倒计时函数（回调）
 */
function createAccurateCountdown(
  endTime: string,
  remainingTime: number,
  paihang: number[],

  onEnd?: () => void,
) {
  const suduData = generateSpeedArray(paihang);
  const endTimestamp = convertTime(endTime); // 结束时间的时间戳
  const startTimestamp = convertTime(endTime) - remainingTime; // 当前时间戳
  const targetTimestamp = Math.min(endTimestamp, startTimestamp + remainingTime); // 实际倒计时结束时间

  function updateCountdown() {
    const now = getCurrentTime(); // 当前时间戳
    const timeLeft = Math.max(targetTimestamp - now, 0); // 实时计算剩余时间

    const liveRanking = calculateRank(21579, timeLeft, suduData);
    carGame.paihangValue = liveRanking;
    updateRaceFeedback(liveRanking);
    isFinalSprint.value = timeLeft > 0 && timeLeft <= 5000;
    //当前进度
    carGame.progress = (1 - timeLeft / remainingTime) * 100;

    if (timeLeft > 0) {
      animationFrameId = requestAnimationFrame(updateCountdown); // 下一帧继续更新
    } else {
      isFinalSprint.value = false;
      cancelAnimationFrame(animationFrameId!); // 取消下一帧刷新
      if (onEnd) onEnd(); // 如果提供了结束回调，调用它
    }
  }

  updateCountdown(); // 启动倒计时
}

/**
 *
 * @param endTime - 比赛结束时间
 * @param remainingTimer - 剩余时间
 * @param paihang - 排名数组
 */
function runCar(
  endTime: string,
  remainingTimer: number,
  ranking: NonNullable<StartMatchResp['racingCarRanking']>,
) {
  isStartCar.value = true;
  isBettingLocked.value = true;
  const remainingSeconds = Math.min(remainingTimer, 21579);

  const suduData = generateSpeedArray(ranking.rankings);
  raceGame.value?.applyRaceData(remainingSeconds, 7, suduData);

  createAccurateCountdown(endTime, remainingSeconds, ranking.rankings, () => {
    showRaceResult(ranking.rankings);
  });
}

function updateRaceFeedback(ranking: number[]) {
  if (!previousRanking.length) {
    previousRanking = [...ranking];
    return;
  }

  const improvedCar = selectedCars.value.find((carNumber) => {
    const previousPosition = previousRanking.indexOf(carNumber);
    const currentPosition = ranking.indexOf(carNumber);
    return previousPosition >= 0 && currentPosition >= 0 && currentPosition < previousPosition;
  });

  if (improvedCar) {
    const position = ranking.indexOf(improvedCar) + 1;
    raceNotice.value = `${improvedCar}号车升至第${position}名`;
    clearTimeout(raceNoticeTimer);
    raceNoticeTimer = window.setTimeout(() => {
      raceNotice.value = '';
    }, 1800);
  }
  previousRanking = [...ranking];
}

function markUserCars(carNumbers: number[]) {
  selectedCars.value = [...new Set([...selectedCars.value, ...carNumbers])];
  raceGame.value?.setUserCars(selectedCars.value);
}

async function restoreUserCars(racingId: number) {
  try {
    const bets = await fetchMyBets({ pageNum: 1, pageSize: 50 });
    if (racingId !== Number(route.query.gameId)) return;
    const carNumbers = bets.record
      .filter((bet) => bet.racingId === racingId)
      .flatMap((bet) => bet.carNumbers);
    if (carNumbers.length) markUserCars(carNumbers);
  } catch {
    // 标记恢复失败不影响比赛正常运行。
  }
}

/**
 * 请求开始比赛数据
 */
const startCar = () => {
  const racingId = Number(route.query.gameId);
  fetchStartCarGame(racingId).then((resp) => {
    if (racingId !== Number(route.query.gameId)) return;
    startGameData.value = resp;
    carGame.hashValues = resp.hash ? resp.hash : resp.lastBlockNumber;
  });
};

async function startRaceAfterCountdown() {
  if (isStartingRace) return;
  const racingId = Number(route.query.gameId);
  isStartingRace = true;

  try {
    const resp = await fetchStartCarGame(racingId);
    if (racingId !== Number(route.query.gameId)) return;
    if (resp.status !== 2 || !resp.endTime || !resp.racingCarRanking) {
      throw new Error('比赛数据尚未准备完成');
    }

    startGameData.value = resp;
    carGame.hashValues = resp.hash ? resp.hash : resp.lastBlockNumber || '';
    clearTimeout(preStartHideTimer);
    const timeUntilEnd = convertTime(resp.endTime) - getCurrentTime();
    const remainingTime = Math.max(
      resp.remainingMillis === undefined ? timeUntilEnd : resp.remainingMillis,
      0,
    );
    if (remainingTime <= 0) {
      isStartingRace = false;
      raceStartRetryTimer = window.setTimeout(() => void startRaceAfterCountdown(), 100);
      return;
    }

    runCar(resp.endTime, remainingTime, resp.racingCarRanking);
  } catch (error) {
    if (racingId !== Number(route.query.gameId)) return;
    isStartingRace = false;
    clearTimeout(raceStartRetryTimer);
    raceStartRetryTimer = window.setTimeout(() => void startRaceAfterCountdown(), 100);
  }
}

async function pollCountdown() {
  const racingId = Number(route.query.gameId);
  try {
    const resp = await fetchStartCarGame(racingId);
    if (racingId !== Number(route.query.gameId)) return;
    startGameData.value = resp;
    if ((resp.remainingMillis ?? 1) <= 0 && resp.status === 3) {
      showRaceResult(resp.racingCarRanking?.rankings);
    }
  } catch (error: any) {
    if (racingId !== Number(route.query.gameId)) return;
    if (error?.code === 3002) showRaceResult();
  }
}

function goToNextRace() {
  if (isChangingRace) return;
  const currentGameId = Number(route.query.gameId);
  const nextGameId =
    startGameData.value?.nextRacingId ||
    (Number.isFinite(currentGameId) ? currentGameId + 1 : undefined);
  if (!nextGameId) {
    resultSeconds.value = 0;
    return;
  }

  isChangingRace = true;
  clearInterval(countdownTimer.value);
  clearInterval(countdownData.timer);
  countdownData.timer = 0;
  clearTimeout(preStartHideTimer);
  clearTimeout(raceNoticeTimer);
  clearTimeout(resultRevealTimer);
  clearTimeout(raceStartRetryTimer);
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  router
    .replace({ name: 'GameCar', query: { gameId: nextGameId } })
    .then(() => {
      raceGame.value?.resetGame();
      previousRanking = [];
      isFinalSprint.value = false;
      isResultVisible.value = false;
      resultSeconds.value = 3;
      rewardAmount.value = null;
      isStartCar.value = false;
      isStartingRace = false;
      isBettingLocked.value = false;
      preStartText.value = '';
      raceNotice.value = '';
      selectedCars.value = [];
      raceGame.value?.setUserCars([]);
      carGame.paihangValue = [];
      carGame.outTimeValue = '';
      carGame.progress = 0;
      countdownData.lastSecond = Number.NaN;
      countdownData.threeSecondTriggered = false;
      return refreshGame();
    })
    .finally(() => {
      isChangingRace = false;
    });
}

function showRaceResult(ranking?: number[]) {
  if (ranking?.length) carGame.paihangValue = [...ranking];
  if (isResultVisible.value || resultRevealTimer) return;

  // RaceGame 会先执行冲线闪光，再显示结果面板，避免面板提前盖住冲线效果。
  resultRevealTimer = window.setTimeout(() => {
    resultRevealTimer = 0;
    if (isResultVisible.value) return;
    isResultVisible.value = true;
    isStartCar.value = false;
    isFinalSprint.value = false;
    carGame.progress = 100;
    resultSeconds.value = 3;
    clearInterval(countdownTimer.value);
    countdownTimer.value = window.setInterval(() => {
      resultSeconds.value -= 1;
      if (resultSeconds.value <= 0) {
        clearInterval(countdownTimer.value);
        goToNextRace();
      }
    }, 1000);
  }, 800);
}

function playVictorySound() {
  try {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.8);
    gain.connect(context.destination);
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + 0.8);
    });
    window.setTimeout(() => void context.close(), 1000);
  } catch {
    // 浏览器阻止自动音频时，结果动画仍正常展示。
  }
}

/**
 * 计算实时排名
 * @param {number} totalTimer - 总时间
 * @param {number} remainingTimer - 剩余时间
 * @param {number[][]} distancesRatio - 所有车辆的距离比例数据
 * @returns {number[]} - 当前排名的车辆索引数组（从高到低）
 */
function calculateRank(totalTimer: number, remainingTimer: number, distancesRatio: number[][]) {
  const elapsedTime = totalTimer - remainingTimer;
  const numberOfSlices = distancesRatio[0].length;
  const sliceDuration = totalTimer / numberOfSlices;

  //确定当前的时间片段索引（从0开始）
  let currentSliceIndex = Math.floor(elapsedTime / sliceDuration);
  if (currentSliceIndex >= numberOfSlices) {
    currentSliceIndex = numberOfSlices - 1; //如果已经超过最后一片，则取最后一片
  }
  // 计算每辆车的累计距离
  const cumulativeDistances = distancesRatio.map((carRatios) => {
    return carRatios.slice(0, currentSliceIndex + 1).reduce((acc, ratio) => acc + ratio, 0);
  });

  //计算当前排名
  const ranking = [...cumulativeDistances]
    .map((distance, index) => ({ distance, index }))
    .sort((a, b) => b.distance - a.distance)
    .map((item) => item.index + 1);

  return ranking;
}

/** 根据排名生成速度数组 */
function generateSpeedArray(rank: number[]): number[][] {
  const baseScores = [
    [0.2, 0.06, 0.05, 0.02, 0.01, 0.03, 0.24, 0.29],
    [0.21, 0.13, 0.18, 0.01, 0.24, 0.17, 0.02, 0.04],
    [0.22, 0.05, 0.2, 0.17, 0.01, 0.01, 0.06, 0.03],
    [0.21, 0.01, 0.02, 0.25, 0.07, 0.24, 0.14, 0.01],
    [0.18, 0.04, 0.11, 0.01, 0.22, 0.15, 0.07, 0.11],
    [0.14, 0.17, 0.14, 0.04, 0.06, 0.12, 0.06, 0.19],
    [0.13, 0.17, 0, 0.05, 0.11, 0.12, 0.06, 0.09],
    [0.03, 0.03, 0.15, 0.09, 0.03, 0.01, 0.15, 0.41],
    [0.23, 0.08, 0.05, 0.01, 0.13, 0.06, 0.07, 0.23],
    [0.05, 0.12, 0.02, 0.09, 0.22, 0.13, 0.07, 0.27],
  ];

  const scores = [...baseScores];
  const totalSpeed = baseScores.map((carScores) => {
    return carScores.reduce((acc, score) => acc + score, 0);
  });
  const carRanked = totalSpeed.map((speed, index) => ({
    index,
    speed,
  }));
  carRanked.sort((a, b) => b.speed - a.speed);
  rank.forEach((rankIndex, i) => {
    const sortedIndex = carRanked[i].index;
    scores[rankIndex - 1] = baseScores[sortedIndex];
  });
  return scores;
}

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    soundManager.stopAll();
    clearInterval(countdownData.timer);
    clearInterval(countdownTimer.value);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  } else {
    soundManager.pauseAll();
    window.location.reload();
  }
});
</script>

<style lang="less" scoped>
.game-car {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.game-car.final-sprint::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 12;
  pointer-events: none;
  box-shadow: inset 0 0 100px rgba(227, 64, 89, 0.65);
  animation: sprintGlow 0.55s ease-in-out infinite alternate;
}

.live-ranking {
  position: absolute;
  z-index: 25;
  top: 370px;
  right: 42px;
  width: 300px;
  padding: 20px;
  border: 2px solid rgba(255, 240, 147, 0.45);
  border-radius: 20px;
  color: #fff;
  background: rgba(8, 12, 18, 0.78);
  backdrop-filter: blur(8px);
}

.live-ranking-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 24px;
  font-weight: 900;
  color: #fff093;

  i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e34059;
    box-shadow: 0 0 16px #e34059;
    animation: livePulse 0.8s infinite alternate;
  }
}

.live-ranking-row {
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: center;
  min-height: 52px;
  padding: 6px 10px;
  border-radius: 10px;

  .position {
    color: #9ba3af;
    font-weight: 900;
  }

  strong {
    font-size: 24px;
  }

  em {
    grid-column: 2;
    font-size: 16px;
    font-style: normal;
    color: #fdc057;
  }

  &.selected {
    background: rgba(253, 192, 87, 0.14);
    box-shadow: inset 3px 0 #fdc057;
  }
}

.race-notice,
.sprint-notice {
  position: absolute;
  left: 50%;
  z-index: 30;
  transform: translateX(-50%);
  padding: 18px 38px;
  border-radius: 999px;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  background: linear-gradient(90deg, rgba(227, 64, 89, 0.94), rgba(204, 10, 67, 0.94));
  box-shadow: 0 8px 30px rgba(227, 64, 89, 0.4);
}

.race-notice {
  top: 32%;
}

.sprint-notice {
  top: 45%;
  color: #fff093;
}

.race-notice-enter-active,
.race-notice-leave-active {
  transition: all 0.25s ease;
}

.race-notice-enter-from {
  opacity: 0;
  transform: translate(-50%, 30px) scale(0.9);
}

.race-notice-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@keyframes livePulse {
  to {
    opacity: 0.35;
  }
}

@keyframes sprintGlow {
  to {
    box-shadow: inset 0 0 150px rgba(227, 64, 89, 0.9);
  }
}

.race-result {
  position: absolute;
  z-index: 40;
  top: 50%;
  left: 50%;
  width: min(82%, 720px);
  padding: 42px 38px 34px;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 240, 147, 0.75);
  border-radius: 32px;
  color: #fff;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0, rgba(227, 64, 89, 0.35), transparent 45%),
    rgba(9, 13, 20, 0.94);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55), 0 0 45px rgba(227, 64, 89, 0.3);
  backdrop-filter: blur(12px);

  h2 {
    margin: 8px 0 20px;
    color: #fff093;
    font-size: 66px;
    line-height: 1;
    text-shadow: 0 0 24px rgba(255, 240, 147, 0.5);
  }
}

.result-eyebrow {
  color: #9ba3af;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 7px;
}

.reward-amount {
  margin-bottom: 24px;
  color: #70ef9f;
  font-size: 58px;
  font-weight: 900;
  animation: rewardPulse 0.7s ease-in-out infinite alternate;
}

.result-podium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: 14px;
  margin: 28px 0;
}

.result-podium-item {
  display: flex;
  min-height: 150px;
  padding: 20px 10px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  animation: podiumRise 0.45s both;

  span {
    color: #fff093;
    font-size: 26px;
    font-weight: 900;
  }

  strong {
    margin-top: 8px;
    font-size: 29px;
  }

  small {
    margin-top: 8px;
    color: #fdc057;
    font-weight: 900;
  }

  &.place-1 {
    min-height: 190px;
    border-color: rgba(255, 240, 147, 0.7);
    background: linear-gradient(180deg, rgba(255, 240, 147, 0.18), rgba(255, 255, 255, 0.04));
  }

  &.selected {
    box-shadow: inset 0 0 0 3px #fdc057;
  }
}

.result-message {
  min-height: 42px;
  margin: 12px 0 24px;
  color: #d7dbe2;
  font-size: 27px;
  font-weight: 700;
}

.play-again-btn {
  width: 100%;
  min-height: 82px;
  border: 0;
  border-radius: 18px;
  color: #fff;
  font-size: 29px;
  font-weight: 900;
  background: linear-gradient(90deg, #e34059, #cc0a43);
  box-shadow: 0 12px 28px rgba(227, 64, 89, 0.32);
}

.next-race-tip {
  margin-top: 16px;
  color: #8f96a3;
  font-size: 21px;
}

.result-pop-enter-active,
.result-pop-leave-active {
  transition: all 0.28s ease;
}

.result-pop-enter-from,
.result-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -44%) scale(0.92);
}

@keyframes podiumRise {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rewardPulse {
  to {
    transform: scale(1.07);
  }
}

.pre-start-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #fff093;
  text-shadow: 0 0 20px #e34059, 0 0 60px rgba(227, 64, 89, 0.9);
  background: radial-gradient(circle, rgba(227, 64, 89, 0.2), transparent 42%);

  span {
    font-family: 'AlfaSlabOne', Arial, sans-serif;
    font-size: 280px;
    line-height: 1;
    animation: countdownPulse 0.72s ease-out;
  }

  small {
    margin-top: 30px;
    font-size: 42px;
    font-weight: 900;
    letter-spacing: 14px;
    color: #fff;
  }

  &.go span {
    font-size: 190px;
    color: #fff;
  }

}

.countdown-pop-enter-active,
.countdown-pop-leave-active {
  transition: opacity 0.18s ease;
}

.countdown-pop-enter-from,
.countdown-pop-leave-to {
  opacity: 0;
}

@keyframes countdownPulse {
  from {
    transform: scale(1.5);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

#simulator {
  width: 1242px;
  height: 2533px;
  display: block;
}

@media only screen and (max-width: 768px) {
  #simulator {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .pc {
    .race-notice {
      padding: 10px 22px;
      font-size: 20px;
      letter-spacing: 1px;
    }

    .sprint-notice {
      padding: 10px 22px;
      font-size: 22px;
      letter-spacing: 1px;
    }

    .pre-start-overlay span {
      font-size: 150px;
    }

    .pre-start-overlay small {
      margin-top: 16px;
      font-size: 24px;
      letter-spacing: 8px;
    }

    .pre-start-overlay.go span {
      font-size: 110px;
    }

    .live-ranking {
      top: 120px;
      right: 16px;
      width: 220px;
      padding: 12px;
      border-radius: 14px;
    }

    .live-ranking-title {
      gap: 8px;
      margin-bottom: 8px;
      font-size: 18px;
    }

    .live-ranking-title i {
      width: 8px;
      height: 8px;
    }

    .live-ranking-row {
      grid-template-columns: 30px 1fr;
      min-height: 36px;
      padding: 4px 8px;
    }

    .live-ranking-row strong {
      font-size: 18px;
    }

    .live-ranking-row em {
      font-size: 12px;
    }

    .race-result {
      width: min(60%, 520px);
      padding: 26px 24px 22px;
      border-width: 2px;
      border-radius: 22px;
    }

    .race-result h2 {
      margin: 5px 0 12px;
      font-size: 42px;
    }

    .result-eyebrow {
      font-size: 16px;
      letter-spacing: 4px;
    }

    .reward-amount {
      margin-bottom: 14px;
      font-size: 38px;
    }

    .result-podium {
      gap: 8px;
      margin: 18px 0;
    }

    .result-podium-item {
      min-height: 94px;
      padding: 12px 8px;
      border-radius: 12px;
    }

    .result-podium-item.place-1 {
      min-height: 120px;
    }

    .result-podium-item span {
      font-size: 18px;
    }

    .result-podium-item strong {
      margin-top: 5px;
      font-size: 20px;
    }

    .result-podium-item small {
      margin-top: 5px;
    }

    .result-message {
      min-height: 28px;
      margin: 8px 0 16px;
      font-size: 18px;
    }

    .play-again-btn {
      min-height: 54px;
      border-radius: 12px;
      font-size: 20px;
    }

    .next-race-tip {
      margin-top: 10px;
      font-size: 15px;
    }

    .game-car {
      position: relative;
      width: 100%;
      max-width: 1000px;
      height: 100%;
      overflow: hidden;
      margin: auto;
    }

    #simulator {
      width: 100%;
      height: 1720px;
      max-width: 1000px;
      display: block;
    }
  }
}
</style>
