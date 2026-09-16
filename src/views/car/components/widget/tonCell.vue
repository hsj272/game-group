<template>
  <div class="car-cell row-center">
    <div class="records-right row-center">
      <div class="records-right-title center">
        <img :src="chips[props.cars!.id - 1 || 0]" />
      </div>
      <div class="ranking-icons row-center">
        <div class="icon-container">{{ props.cars?.firstPlaceCount }}</div>
        <div class="divider"></div>
        <div class="icon-container">{{ props.cars?.secondPlaceCount }}</div>
        <div class="divider"></div>

        <div class="icon-container">{{ props.cars?.thirdPlaceCount }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { GetStatisticsResp } from '@/views/api/protocol';
import cars from '@/views/car/components/cars';
import type { PropType } from 'vue';
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
  cars: {
    type: Object as PropType<GetStatisticsResp>,
  },
});
</script>
<style lang="less" scoped>
.car-cell {
  background: #1b212b;
  border-radius: 21px;
  margin: 10px 0;
  padding: 25px 15px;
  border: 2px solid #a3a8b3;
  border-radius: 10px;
  height: 212px;
}
.records-right {
  height: 118px;
  width: 100%;
}

.records-right-title {
  width: 269px;
  height: 159px;
  padding: 9px;
  background: #161b24;
  border-radius: 20px;
  object-fit: contain;

  img {
    width: 236.57px;
    height: 86px;
  }
}
.ranking-icons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-weight: 900;
  font-size: 40px;
  color: #ffffff;
  line-height: 47px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #ffffff;
  opacity: 0.5;
}

@media (min-width: 768px) {
  .pc {
    .car-cell {
      background: #1b212b;
      border-radius: 10px;
      margin: 10px 0;
      padding: 15px 5px;
      border: 2px solid #a3a8b3;
      border-radius: 10px;
      height: 100px;
    }
    .records-right {
      height: 118px;
      width: 100%;
    }

    .records-right-title {
      width: 139px;
      height: 109px;
      padding: 9px;
      background: #161b24;
      border-radius: 20px;
      object-fit: contain;

      img {
        width: 126.57px;
        height: 56px;
      }
    }
    .ranking-icons {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      font-weight: 900;
      font-size: 20px;
      color: #ffffff;
      line-height: 27px;
    }

    .divider {
      width: 1px;
      height: 24px;
      background-color: #ffffff;
      opacity: 0.5;
    }
  }
}
</style>
