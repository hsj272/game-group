<template>
  <div class="distance-car row-center">
    <div class="car-info">
      <img class="car-img" src="@/assets/events/Group9.png" />
      <p>NO.{{ carInfo.racingId }}</p>
    </div>
    <div class="distance-info center col-center">
      <p>{{ lang.v.sy_carRace_distancetostart }}</p>
      <div class="row-center">
        <img class="clock-img" src="@/assets/events/Frame.png" />
        <p class="distance-time">{{ timeLeft }}</p>
      </div>
    </div>
    <div class="bet-btn center" @click="startCar(carInfo.racingId)">
      {{ lang.v.sy_carRace_bet }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCountdown } from '@/manager/utensil';
import type { GetMatchInfoResp } from '@/views/api/protocol';
import { onMounted, onUnmounted } from 'vue';
import { ref, type PropType } from 'vue';
import { lang } from '@/lang';
const props = defineProps({
  carItem: {
    type: Object as PropType<GetMatchInfoResp>,
    default: () => ({}),
  },
});
const carInfo = ref(props.carItem);

const timeLeft = ref<string>('00:00:00'); // 倒计时显示的时间

const { startCountdown, stopCountdown } = useCountdown(
  carInfo.value.startTime, // 开始时间

  (formattedTime: string) => {
    timeLeft.value = formattedTime; // 每秒更新显示的时间
  },
  () => {
    timeLeft.value = '00:00:00'; // 倒计时完成时显示 00:00:00
  },
);

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  stopCountdown(); // 页面销毁时停止倒计时
});
const emit = defineEmits(['startCarId']);
const startCar = (racingId: number) => {
  emit('startCarId', racingId);
};
</script>
<style lang="less" scoped>
.distance-car {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 27px 82px 45px 51px;
  color: #ffffff;
  overflow: hidden;
  font-weight: 500;
  font-size: 36px;
  line-height: 42px;
  margin-top: 55px;
}

.car-info {
  flex: 1;
}

.car-img {
  width: 111.62px;
  height: 111.62px;
}

.distance-info {
  flex: 2;
  gap: 12px;
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
  color: #fdc057;
}

.bet-btn {
  width: 259.82px;
  height: 121.59px;
  background: rgba(255, 255, 255, 0.05);

  font-size: 40px;
  line-height: 46.88px;
  color: rgba(225, 61, 87, 1);

  border-radius: 20px;
  border: 3px solid rgba(225, 61, 87, 1);
}

@media (min-width: 768px) {
  .pc {
    .distance-car {
      border-radius: 10px;
      // padding: 17px 82px 45px 51px;
      padding: none;
      color: #ffffff;
      overflow: hidden;
      font-weight: 500;
      font-size: 26px;
      line-height: 22px;
      margin-top: 25px;
    }

    .car-img {
      width: 82px;
      height: 82px;
    }

    .distance-info {
      flex: 2;
      gap: 10px;
    }

    .clock-img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    .distance-time {
      font-weight: 500;
      font-size: 26px;
      color: #fdc057;
      line-height: 26px;
      color: #fdc057;
    }

    .bet-btn {
      width: 185.67px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);

      font-size: 24px;
      line-height: 26.88px;
      color: rgba(225, 61, 87, 1);

      border: 1px solid rgba(225, 61, 87, 1);
    }
  }
}
</style>
