<template>
  <div class="records flex-col">
    <div class="row-center">
      <div
        v-for="(item, index) in hedBtns"
        :key="index"
        class="records-item center"
        @click="selectBtnId = item.id"
        :class="{ actives: selectBtnId === item.id }"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="sanjiao" :class="{ twosan: selectBtnId === 2 }"></div>
    <div class="records-content">
      <div v-if="selectBtnId === 1">
        <div class="records-num-row">
          <div
            class="records-num records-title center"
            v-for="index in 10"
            :key="index"
            :class="{ actives: selectedRecordNum.includes(index) }"
            @click="
              selectedRecOvedId === 5
                ? selectedRecordNum.includes(index)
                  ? ''
                  : (selectedRecordNum = [index])
                : ''
            "
          >
            {{ index }}
          </div>
        </div>
        <div class="records-num-row">
          <div
            class="records-oved records-title center"
            v-for="(item, index) in recOved"
            :key="index"
            :class="{ actives: selectedRecOvedId === item.id }"
            @click="filteredRecOved.includes(item) ? selectRecOved(item.id) : ''"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="records-num-row">
          <div
            class="records-oved records-title center"
            v-for="(item, index) in Tracks"
            :key="index"
            :class="{ actives: selectedTrackId === item.id }"
            @click="selectedTrackId = item.id"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="records-car flex-col">
          <carCell v-for="(item, index) in recordsDatas" :key="index" :car-data="item" />
        </div>
      </div>
      <div v-else>
        <div class="records-right row-center">
          <div class="records-right-title">{{ lang.v.sy_jy_car }}</div>
          <div class="ranking-icons row-center">
            <div class="icon-container">
              <img src="@/assets/events/MaskThree.png" class="ranking-icon" />
            </div>
            <div class="divider"></div>
            <div class="icon-container">
              <img src="@/assets/events/MaskTwo.png" class="ranking-icon" />
            </div>
            <div class="divider"></div>

            <div class="icon-container">
              <img src="@/assets/events/MaskOne.png" class="ranking-icon" />
            </div>
          </div>
        </div>
        <div class="right-content flex-col">
          <tonCell v-for="(item, index) in statisticsCar" :key="index" :cars="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import carCell from '@/views/car/components/widget/carCell.vue';

import tonCell from '@/views/car/components/widget/tonCell.vue';
import { fetchHistoryRacing, fetchStatistics } from '@/views/api';
import type { GetRacingHistoryRespItem, GetStatisticsResp } from '@/views/api/protocol';
import { onMounted } from 'vue';
import { lang } from '@/lang';
const selectBtnId = ref(1);
const hedBtns = [
  {
    id: 1,
    get name() {
      return lang.v.sy_jy_records;
    },
  },
  {
    id: 2,
    get name() {
      return lang.v.sy_jy_stat;
    },
  },
];
/** 一级：） */
const selectedTrackId = ref(1);
/** 二级 */
const selectedRecOvedId = ref<number | null>(5);
const selectedRecordNum = ref<number[]>([1]);
const recOved = [
  {
    id: 1,
    get name() {
      return lang.v.sy_jy_big;
    },
    trackId: 2,
  },
  {
    id: 2,
    get name() {
      return lang.v.sy_jy_small;
    },
    trackId: 2,
  },
  {
    id: 3,
    get name() {
      return lang.v.sy_jy_odd;
    },
    trackId: 3,
  },
  {
    id: 4,
    get name() {
      return lang.v.sy_jy_even;
    },
    trackId: 3,
  },
  {
    id: 5,
    get name() {
      return lang.v.sy_jy_reset;
    },
    trackId: 1,
  },
];
const Tracks = [
  {
    id: 1,
    get name() {
      return lang.v.sy_jy_track;
    },
  },
  {
    id: 2,
    get name() {
      return `${lang.v.sy_jy_big}/${lang.v.sy_jy_small}`;
    },
    // name: 'Big/Small',
  },
  {
    id: 3,
    get name() {
      return `${lang.v.sy_jy_odd}/${lang.v.sy_jy_even}`;
    },
    // name: 'Odd/Even',
  },
];
const filteredRecOved = computed(() =>
  recOved.filter((item) => item.trackId === selectedTrackId.value),
);
watch(filteredRecOved, (newList) => {
  if (newList.length > 0) {
    selectedRecOvedId.value = newList[0].id; // 默认选中第一个
  } else {
    selectedRecOvedId.value = null; // 如果没有可选项，清空选择
  }
});
/** 切换 recOved */
const selectRecOved = (id: number) => {
  if (selectedRecOvedId.value === id) return;
  selectedRecOvedId.value = id;
  // 重置 records-num 的选择
  selectedRecordNum.value = [];
};
watch(selectedRecOvedId, (newId) => {
  selectedRecordNum.value = [];
  if (newId === 5) {
    selectedRecordNum.value = [1];
  }
  if (newId === 1) {
    selectedRecordNum.value.push(6, 7, 8, 9, 10);
  }
  if (newId === 2) {
    selectedRecordNum.value.push(1, 2, 3, 4, 5);
  }
  if (newId === 3) {
    selectedRecordNum.value.push(1, 3, 5, 7, 9);
  }
  if (newId === 4) {
    selectedRecordNum.value.push(2, 4, 6, 8, 10);
  }
});

const recordsDatas = ref<GetRacingHistoryRespItem[]>([]);
/**
 * 获取Records数据
 */
const getRecordsData = () => {
  //加载

  fetchHistoryRacing(selectedRecordNum.value, 1).then((resp) => {
    if (!resp) return;
    recordsDatas.value = resp.data;
  });
};
watch(selectedRecordNum, (newList) => {
  if (newList.length > 0) {
    getRecordsData();
  }
});
onMounted(() => {
  getRecordsData();
});
const statisticsCar = ref<GetStatisticsResp[]>([]);
/**
 * 赛车统计
 */
function carCount() {
  fetchStatistics().then((resp) => {
    if (!resp) return;
    statisticsCar.value = resp;
  });
}
watch(selectBtnId, (newId) => {
  if (newId === 1) {
    getRecordsData();
  }
  if (newId === 2) {
    carCount();
  }
});
</script>

<style lang="less" scoped>
.records {
  width: 1045.89px;
  height: 1402.94px;
  padding: 55px 50px 39px 50px;
  border-radius: 50px;
  border: 3px solid #ffffff;
  background: #1b212b;
  overflow: hidden;
}
.records-item {
  width: 385.88px;
  height: 133.41px;
  background: #0e131b;
  border: 1px solid #ffffff;
  border-radius: 20px;
  font-weight: 900;
  font-size: 48px;
  color: #c8c6c6;
  line-height: 56px;
  margin-right: 53px;
}
.actives {
  border: none;
  background: linear-gradient(90deg, #e34059 0%, #cc0a43 100%);
}

.sanjiao {
  width: 100px;
  height: 100px;
  background: #0e131b;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  margin-top: 35px;
  margin-left: 100px;
}
.twosan {
  transform: translateX(500px);
}

.records-content {
  width: 100%;
  height: 100%;
  background: #0e131b;
  margin-top: -30px;
  border-radius: 43px;
  padding: 55px 30px;
}

.records-num-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 16px;
  .records-title {
    border: 2px solid #a3a8b3;
    border-radius: 7px;
    font-weight: bold;
    font-size: 48px;
    color: #a3a8b3;
    line-height: 56px;
  }
  .records-num {
    width: 78px;
    height: 78px;
  }
  .records-oved {
    padding: 15px 37px;
    font-weight: bold;
    font-size: 40px;
    color: #a3a8b3;
    line-height: 47px;
  }
}

.records-car {
  margin-top: 80px;
  height: 620px;
  overflow: hidden;
  overflow-y: auto;
}

.records-right {
  height: 118px;
  width: 100%;
  border: 2px solid #a3a8b3;
  border-radius: 10px;
}

.records-right-title {
  width: 410px;
  font-weight: bold;
  font-size: 40px;
  color: #a3a8b3;
  line-height: 47px;
  text-align: center;
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
}

.ranking-icon {
  width: 72.38px;
  height: 63.17px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #ffffff;
  opacity: 0.5;
}

.right-content {
  margin-top: 12px;
  height: 940px;
  overflow: hidden;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .pc {
    .records {
      width: 467px;
      height: 413px;
      padding: 25px 20px 39px 20px;
      border-radius: 10px;
      border: 3px solid #ffffff;
      background: #1b212b;
      overflow: hidden;
    }
    .records-item {
      width: 185.88px;
      height: 61px;
      background: #0e131b;
      border: 1px solid #ffffff;
      border-radius: 10px;
      font-weight: 900;
      font-size: 18px;
      color: #c8c6c6;
      line-height: 26px;
      margin-right: 23px;
    }
    .actives {
      border: none;
      background: linear-gradient(90deg, #e34059 0%, #cc0a43 100%);
    }

    .sanjiao {
      width: 100px;
      height: 100px;
      background: #0e131b;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      margin-top: 35px;
      margin-left: 100px;
    }
    .twosan {
      transform: translateX(500px);
    }

    .records-content {
      width: 100%;
      height: 100%;
      background: #0e131b;
      margin-top: -10px;
      border-radius: 10px;
      padding: 25px 15px;
      box-sizing: border-box;
    }

    .records-num-row {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      margin-top: 10px;
      .records-title {
        border: 2px solid #a3a8b3;
        border-radius: 7px;
        font-weight: bold;
        font-size: 12px;
        color: #a3a8b3;
        line-height: 16px;
      }
      .records-num {
        width: 28px;
        height: 28px;
      }
      .records-oved {
        padding: 2px 10px;
        font-weight: bold;
        font-size: 15px;
        color: #a3a8b3;
        line-height: 20px;
      }
    }

    .records-car {
      margin-top: 10px;
      height: 120px;
      overflow: hidden;
      overflow-y: auto;
    }

    .records-right {
      height: 58px;
      width: 100%;
      border: 2px solid #a3a8b3;
      border-radius: 10px;
    }

    .records-right-title {
      width: 210px;
      font-weight: bold;
      font-size: 20px;
      color: #a3a8b3;
      line-height: 27px;
      text-align: center;
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
    }

    .ranking-icon {
      width: 42.38px;
      height: 33.17px;
    }

    .divider {
      width: 1px;
      height: 24px;
      background-color: #ffffff;
      opacity: 0.5;
    }

    .right-content {
      margin-top: 12px;
      height: 240px;
      overflow: hidden;
      overflow-y: auto;
    }
  }
}
</style>
