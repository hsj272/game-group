<template>
  <div class="car-cell flex-col">
    <p class="car-cell-title">NO.{{ carData.id }}</p>
    <div class="car-cell-status-container flex-row">
      <div
        class="car-cell-status center"
        v-for="(item, index) in carData.ranking"
        :key="index"
        :style="item !== 0 ? 'background-color:' + colors[item] : ''"
      >
        {{ item === 0 ? 'x' : item }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GetRacingHistoryRespItem } from '@/views/api/protocol';
import type { PropType } from 'vue';

const props = defineProps({
  carData: {
    type: Object as PropType<GetRacingHistoryRespItem>,
    default: () => ({}),
  },
});

const colors = [
  '#812022',
  '#1F2123',
  '#D2D4D5',
  '#383B44',
  '#C5C5C5',
  '#F2A31F',
  '#111425',
  '#17266F',
  '#75797C',
  '#8A0B0B',
];
</script>

<style lang="less" scoped>
.car-cell {
  border-bottom: 1px dashed #ffffff;
  margin: 10px 0;
}
.car-cell-title {
  font-weight: bold;
  font-size: 32px;
  color: #fff093;
  line-height: 38px;
  margin-bottom: 22px;
}
.car-cell-status-container {
  justify-content: space-around;
}
.car-cell-status {
  width: 81px;
  height: 55px;
  border-radius: 8px;
  background: #0e131b;
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 22.83px;
  margin-bottom: 32px;
}
.active {
  background-color: red;
}

@media (min-width: 768px) {
  .pc {
    .car-cell {
      border-bottom: 1px dashed #ffffff;
      margin: 10px 0;
    }
    .car-cell-title {
      font-weight: bold;
      font-size: 12px;
      color: #fff093;
      line-height: 18px;
      margin-bottom: 12px;
    }
    .car-cell-status-container {
      justify-content: space-around;
    }
    .car-cell-status {
      width: 51px;
      height: 25px;
      border-radius: 8px;
      background: #0e131b;
      border: 2px solid #ffffff;
      color: #ffffff;
      font-size: 12.83px;
      margin-bottom: 12px;
    }
    .active {
      background-color: red;
    }
  }
}
</style>
