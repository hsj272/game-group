<template>
  <div class="fisrt-distance-car">
    <div class="car-header">
      <p class="car-no">NO.{{ carInfo.racingId }}</p>
      <div class="clock-time row-center center">
        <img class="clock-img" src="@/assets/events/Frame.png" />
        <p class="distance-time">{{ timeLeft }}</p>
      </div>
      <TslBtn :text="lang.v.sy_carRace_bet" class="bet-btn" @click="startCar(carInfo.racingId)" />
    </div>
    <div class="car-body">
      <div class="car-body-img">
        <img class="car-img" :src="chips[0]" />
      </div>
      <div class="car-body-img">
        <img class="car-img" :src="chips[1]" />
      </div>
      <div class="car-body-img">
        <img class="car-img" :src="chips[2]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GetMatchInfoResp } from '@/views/api/protocol';
import { ref, type PropType, onMounted, onUnmounted } from 'vue';
import { countdown } from '@/utils/index';
import TslBtn from '@/components/TslBtn.vue';
import cars from '@/views/car/components/cars';
import { lang } from '@/lang';
const chips = Object.freeze([
  cars.car0,
  cars.car1,
  cars.car2,
  cars.car3,
  cars.car4,
  cars.car5,
  cars.car6,
  cars.car7,
  cars.car8,
  cars.car9,
]);
const props = defineProps({
  carItem: {
    type: Object as PropType<GetMatchInfoResp>,
    default: () => ({}),
  },
});
const carInfo = ref(props.carItem);
const emit = defineEmits(['upbet', 'startCarId']); // 定义事件
const timeLeft = ref<string>('00:00'); // 倒计时显示的时间

let intervalId = 0;
let endTimeIntervalId = 0;
onMounted(() => {
  intervalId = setInterval(() => {
    const timeStr = countdown(carInfo.value.startTime);
    timeLeft.value = timeStr;
    if (timeStr === '已结束') {
      clearInterval(intervalId);
      timeLeft.value = 'live';

      endTimeIntervalId = setInterval(() => {
        const endTimeStr = countdown(carInfo.value.endTime);
        if (endTimeStr === '已结束') {
          clearInterval(endTimeIntervalId);
          emit('upbet');
        }
      }, 1000) as unknown as number;
    }
  }, 1000) as unknown as number;
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(endTimeIntervalId);
});
//选择比赛
const startCar = (racingId: number) => {
  emit('startCarId', racingId);
};
</script>

<style scoped>
.fisrt-distance-car {
  background-color: #0e131b;
  border-radius: 10px;
  padding: 51px 63px 51px 60px;
  color: #ffffff;
  overflow: hidden;
  font-size: 36px;
  line-height: 42.19px;
}
.car-header {
  display: flex;
  flex-direction: row;
}
.car-no {
  flex: 1;
  font-weight: 900;
  font-size: 48px;
  color: #fdc057;
  line-height: 56px;
}
.clock-time {
  flex: 2;
  height: 57px;
}
.clock-img {
  width: 42px;
  height: 42px;
  margin-right: 17px;
}
.distance-time {
  font-weight: 500;
  font-size: 48px;
  color: #fdc057;
  line-height: 56px;
}
.bet-btn {
  width: 285.67px;
  height: 133.69px;
  border-radius: 23px;
  font-weight: bold;
  font-size: 48px;
  color: #ffffff;
  line-height: 70px;
}
.car-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 162.13px;
  gap: 48px;
  margin-top: 36px;
}
.car-body-img {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 10px;
  background: #1b1b1b;
  border-radius: 10px;
  border: 3px solid rgba(255, 255, 255, 0.2);
}
.car-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
@media (min-width: 768px) {
  .pc {
    .fisrt-distance-car {
      background-color: #1b1b1b;
      border-radius: 10px;
      padding: none;
      font-size: 16px;
      line-height: 22.19px;
    }
    .car-no {
      font-weight: 500;
      font-size: 18px;
      line-height: 26px;
    }
    .clock-time {
      height: 27px;
    }
    .clock-img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    .distance-time {
      font-weight: 500;
      font-size: 18px;
      line-height: 26px;
    }
    .bet-btn {
      width: 185.67px;
      height: 40px;
      border-radius: 10px;
      font-weight: bold;
      font-size: 18px;
      color: #ffffff;
      line-height: 20px;
    }
    .car-body {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      height: 102.13px;
      gap: 28px;
      margin-top: 26px;
    }
    .car-body-img {
      padding: 10px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
