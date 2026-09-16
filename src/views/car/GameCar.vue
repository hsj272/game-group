<template>
  <div class="game-car">
    <canvas id="simulator" width="1242" height="2533" v-if="dataCenter.layout.isMobile"></canvas>
    <canvas id="simulator" width="1242" height="496" v-if="!dataCenter.layout.isMobile"></canvas>
    <CarHeader :car-game="carGame" />
    <CarBottom :is-run-car="isStartCar" />
  </div>
</template>

<script setup lang="ts">
import CarHeader from '@/views/car/components/CarHeader.vue';
import CarBottom from '@/views/car/components/CarBottom.vue';
import { ref } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import RaceGame from './engine/RaceGame';
import { fetchRacingConfig, fetchStartCarGame, fetchStartGame } from '../api';
import { tip } from '@/components/notice/Notice';
import { convertTime, getCurrentTime } from '@/utils';
import { useRoute, useRouter } from 'vue-router';
import type { StartMatchResp } from '../api/protocol';
import { onUnmounted } from 'vue';
import { soundManager } from '@/manager/soundManager';
import backgroundMusic from '@/assets/events/car/gamy.mp3';
import xm3272 from '@/assets/events/car/xm3272.wav';
import { lang } from '@/lang';
import dataCenter from '@/dataCenter';
import { RacingSocket } from '@/manager/racingSocket';
const route = useRoute();
const router = useRouter();
const startGameData = ref<StartMatchResp>();
let animationFrameId: number | null = null;
const countdownTimer = ref(0);
const raceDurationMs = ref(300_000);
let pollTimer = 0;
let racingSocket: RacingSocket | undefined;
//游戏开始了
const isStartCar = ref(false);
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
  outTimeValue: '00:00',
  /**hash值 */
  hashValues: '',
  /**排行榜 */
  paihangValue: [],
  /**进度 */
  progress: 0,
});
/**
 * 倒计时
 *  lastSecond = 0;
 *  timer = 0;
 * threeSecondTriggered = false; // 记录是否触发过 3 秒倒计时
 */
const countdownData = reactive({
  lastSecond: 0,
  timer: 0,
  threeSecondTriggered: false,
});
const raceGame = ref<RaceGame>();
onMounted(async () => {
  const canvas = document.getElementById('simulator') as HTMLCanvasElement;
  if (!canvas) return;
  raceGame.value = new RaceGame(canvas);
  raceGame.value?.resetGame();
  const mask = ~(1 << 31);
  soundManager.play(backgroundMusic, mask, false);
  try {
    const config = await fetchRacingConfig();
    dataCenter.bettingConfig.update(config);
    raceDurationMs.value = config.racingTime;
    raceGame.value?.initTotalTime(config.racingTime);
    await refreshGame();
  } catch (error) {
    tip.error(error instanceof Error ? error.message : 'Failed to load race');
  }
  pollTimer = window.setInterval(pollCountdown, 1000);
  racingSocket = new RacingSocket({
    onReward: (payload) => tip.success(`Reward: ${payload.reward}`),
    onResult: (payload) => {
      if (payload.racingId !== Number(route.query.gameId)) return;
      carGame.paihangValue = payload.ranking.split(',').map(Number);
      window.setTimeout(goToNextRace, 3000);
    },
    onOpen: () => refreshGame(),
  });
  racingSocket.connect();
});

onUnmounted(() => {
  soundManager.stopAll();
  clearInterval(countdownData.timer);
  clearInterval(countdownTimer.value);
  clearInterval(pollTimer);
  racingSocket?.close();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// 刷新游戏
async function refreshGame() {
  try {
    const resp = await fetchStartGame(Number(route.query.gameId));
    startGameData.value = resp;

    carGame.hashValues = resp.hash
      ? resp.hash
      : `${import.meta.env.VITE_APP_KU}${resp.lastBlockNumber}`;
    if (resp.status === 2 && resp.racingCarRanking) {
      const diffTimer = convertTime(resp.endTime) - getCurrentTime();
      if (diffTimer > 0) {
        runCar(resp.endTime!, resp.remainingMillis ?? diffTimer, resp.racingCarRanking);
      } else {
        tip.error(lang.v.tip_message_ended);
        raceGame.value?.resetGame();
        goToNextRace();
      }
    } else {
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
  // 判断是否剩余 3 秒，并确保只触发一次
  if (leftSecond <= 3 && leftSecond > 0 && !countdownData.threeSecondTriggered) {
    countdownData.threeSecondTriggered = true;
    raceGame.value?.startCount();
    raceGame.value?.countDown(4000);
    startCar();
  }
  if (leftSecond <= 0) {
    clearInterval(countdownData.timer);
    countdownData.timer = 0; // 重置定时器为 0
    carGame.outTimeValue = '00:00'; // 显示 00:00
    runCar(
      startGameData.value.endTime!,
      startGameData.value.remainingMillis ?? 0,
      startGameData.value.racingCarRanking!,
    );
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
  distancesRatio: number[][],

  onEnd?: () => void,
) {
  const suduData = distancesRatio;
  const endTimestamp = convertTime(endTime); // 结束时间的时间戳
  const startTimestamp = convertTime(endTime) - remainingTime; // 当前时间戳
  const targetTimestamp = Math.min(endTimestamp, startTimestamp + remainingTime); // 实际倒计时结束时间

  function updateCountdown() {
    const now = getCurrentTime(); // 当前时间戳
    const timeLeft = Math.max(targetTimestamp - now, 0); // 实时计算剩余时间

    carGame.paihangValue = calculateRank(raceDurationMs.value, timeLeft, suduData);
    //当前进度
    carGame.progress = (1 - timeLeft / remainingTime) * 100;

    if (timeLeft > 0) {
      animationFrameId = requestAnimationFrame(updateCountdown); // 下一帧继续更新
    } else {
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
  const remainingSeconds = Math.max(0, remainingTimer);

  const suduData = ranking.distancesRatio;
  const frameDuration = raceDurationMs.value / Math.max(suduData[0]?.length || 1, 1);
  const elapsed = Math.max(0, raceDurationMs.value - remainingSeconds);
  const currentFrame = Math.min(Math.floor(elapsed / frameDuration), 7);
  raceGame.value?.setData(remainingSeconds, currentFrame, suduData);

  createAccurateCountdown(endTime, remainingSeconds, ranking.rankings, suduData, () => {
    //倒计时 2 秒
    countdownTimer.value = setTimeout(() => {
      // 清除定时器
      clearTimeout(countdownTimer.value as unknown as number);

      // 设置 isStartCar 为 false
      isStartCar.value = false;
      tip.error(lang.v.tip_message_ended);

      raceGame.value?.resetGame();

      goToNextRace();
    }, 2000) as unknown as number;
  });
  raceGame.value?.run(null);
}

/**
 * 请求开始比赛数据
 */
const startCar = () => {
  fetchStartCarGame(Number(route.query.gameId)).then((resp) => {
    startGameData.value = resp;
    carGame.hashValues = resp.hash ? resp.hash : resp.lastBlockNumber;
  });
};

async function pollCountdown() {
  try {
    const resp = await fetchStartCarGame(Number(route.query.gameId));
    startGameData.value = resp;
    if ((resp.remainingMillis ?? 1) <= 0 && resp.status === 3) goToNextRace();
  } catch (error: any) {
    if (error?.code === 3002) goToNextRace();
  }
}

function goToNextRace() {
  const nextGameId = startGameData.value?.nextRacingId;
  if (nextGameId) {
    router.replace({ name: 'GameCar', query: { gameId: nextGameId } }).then(() => {
      raceGame.value?.resetGame();
      countdownData.threeSecondTriggered = false;
      refreshGame();
    });
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
      height: 496px;
      max-width: 1000px;
      display: block;
    }
  }
}
</style>
