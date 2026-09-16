<template>
  <div class="car-header">
    <div class="car-content">
      <div class="row-center car-h-row">
        <p class="car-title">NO.{{ gameId }}</p>
        <p class="car-subtitle">100000m</p>
        <div class="row-center">
          <img
            class="record-img"
            src="@/assets/events/car/Vector.png"
            @click="openModal(Gameplay)"
          />
          <div class="row-center record-row" @click="openModal(Records)">
            <p>{{ lang.v.sy_ks_records }}</p>
          </div>
        </div>
      </div>
      <div class="car-info">
        <p class="car-info-title">
          {{ lang.v.sy_ks_previous }}
          <span v-for="(char, index) in formattedHash" :key="index" :style="getColorStyle(char)">
            {{ char.char }}
          </span>
        </p>
        <div class="row-center">
          <img class="car-img" src="@/assets/events/jinabei.png" />
          <div v-if="props.carGame.paihangValue.length > 0">
            <div class="row-center paint">
              <div class="jindutiao">
                <!-- 进度填充部分 -->
                <div class="progress-bar" :style="progressStyle"></div>
              </div>
              <img src="@/assets/events/car/qizi.png" class="paint-img" />
            </div>
            <div class="row-center">
              <div
                class="paihang-row center"
                v-for="(item, index) in props.carGame.paihangValue"
                :key="index"
                :style="{ backgroundColor: colors[item] }"
              >
                {{ item }}
              </div>
            </div>
          </div>
          <div v-else class="row-center">
            <p class="car-info-subtitle">{{ props.carGame.outTimeValue }}</p>
            <p class="later">{{ lang.v.sy_ks_start }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from 'vue';
import { useRoute } from 'vue-router';
import Records from '@/views/car/components/Records.vue';
import { openModal } from '@/manager/view';
import Gameplay from '@/views/car/components/widget/Gameplay.vue';
import { lang } from '@/lang';
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
const route = useRoute();
const gameId = ref(route.query.gameId);
const props = defineProps({
  carGame: {
    type: Object as () => CarGame,
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
// 计算进度条的宽度，取第一个车的进度作为进度条的参考
const progressStyle = computed(() => {
  const progress = props.carGame.progress;
  return {
    width: `${progress}%`,
    backgroundColor: '#005BE9', // 进度条颜色，可以根据需求改变
    transition: 'width 0.5s ease', // 平滑过渡
  };
});
// 计算属性：返回格式化后的 Hash 值
const formattedHash = computed(() => {
  let hashStr = props.carGame.hashValues;
  const ranks = props.carGame.paihangValue.map((item) => item + 1); // 获取排名数字

  // 使用 Set 来避免重复的排名数字
  const modifiedIndexes: Set<string> = new Set();
  const chars = hashStr.split(''); // 将 Hash 字符串拆分为字符数组

  // 遍历每个字符，检查是否为排名数字
  const formattedChars = chars.map((char) => {
    // 如果字符是排名数字，并且没有重复处理过，返回特殊标记
    if (ranks.includes(Number(char)) && !modifiedIndexes.has(char)) {
      modifiedIndexes.add(char); // 标记为已处理
      return { char, isRank: true };
    }
    //特别处理车号为 10的情况
    if (ranks.includes(10) && char === '0' && !modifiedIndexes.has('10')) {
      modifiedIndexes.add('10'); // 标记为已处理
      return { char: '0', isRank: true };
    }
    return { char, isRank: false };
  });

  return formattedChars;
});
const getColorStyle = (charObj: { char: string; isRank: boolean }) => {
  return charObj.isRank ? { color: '#5488ff' } : {};
};
</script>

<style lang="less" scoped>
.car-header {
  position: absolute;
  top: 0.6%;
  left: 0;
  right: 0;
}
.car-content {
  margin: 32px 45px;
  overflow: hidden;
}
.car-h-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.car-title {
  font-weight: 900;
  font-size: 48px;
  color: #fff093;
  line-height: 56px;
}
.car-subtitle {
  font-weight: bold;
  font-size: 40px;
  color: #ffffff;
  line-height: 47px;
}
.record-img {
  width: 35.71px;
  height: 43.1px;
  margin-right: 40px;
  cursor: pointer;
}
.record-row {
  font-weight: bold;
  font-size: 40px;
  color: #ffffff;
  line-height: 47px;
}
.car-info {
  border-radius: 21px;
  background: rgba(1, 1, 1, 0.54);
  padding: 75px 60px 30px 60px;
  color: #ffffff;
}
.car-info-title {
  font-weight: bold;
  font-size: 40px;
  line-height: 47px;
  margin-bottom: 34px;
  word-wrap: break-word;
}
.car-img {
  width: 142.99px;
  height: 182.5px;
  margin-right: 43px;
}
.car-info-subtitle {
  font-weight: bold;
  font-size: 96px;
  color: #fff093;
  line-height: 113px;
}
.later {
  font-weight: bold;
  font-size: 40px;
  color: #f8f8f8;
  line-height: 47px;
  margin-top: 30px;
  margin-left: 6px;
}

.jindutiao {
  width: 100%;
  height: 16.47px;
  background: #0d0d0d;
  border-radius: 11px;
  border: 3px solid #005be9;
  margin-bottom: 42px;
}
.paihang-row {
  width: 76px;
  height: 52px;
  border-radius: 8px 8px 8px 8px;
  color: #ffffff;
  font-size: 22.83px;
  margin-right: 6px;
}
.progress-bar {
  height: 100%; /* 填充父容器的高度 */
  transition: width 0.5s ease; /* 平滑过渡 */
}

.paint {
  position: relative;
  .paint-img {
    width: 70.15px;
    height: 79.32px;
    position: absolute;
    top: -25px;
    right: -35px;
  }
}

@media (min-width: 768px) {
  .pc {
    .car-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    .car-content {
      margin: 12px 15px;
      overflow: hidden;
    }
    .car-h-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .car-title {
      font-weight: 900;
      font-size: 18px;
      color: #fff093;
      line-height: 26px;
    }
    .car-subtitle {
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      line-height: 27px;
    }
    .record-img {
      width: 15.71px;
      height: 13.1px;
      margin-right: 10px;
      cursor: pointer;
    }
    .record-row {
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      line-height: 27px;
    }
    .car-info {
      border-radius: 10px;
      background: rgba(1, 1, 1, 0.54);
      padding: 5px 30px 10px 30px;
      color: #ffffff;
    }
    .car-info-title {
      font-weight: bold;
      font-size: 20px;
      line-height: 25px;
      margin-bottom: 8px;
      word-wrap: break-word;
    }
    .car-img {
      width: 20.99px;
      height: 30.5px;
      margin-right: 23px;
    }
    .car-info-subtitle {
      font-weight: bold;
      font-size: 26px;
      color: #fff093;
      line-height: 33px;
    }
    .later {
      font-weight: bold;
      font-size: 20px;
      color: #f8f8f8;
      line-height: 27px;
      margin-top: 0;
      margin-left: 6px;
    }

    .jindutiao {
      width: 100%;
      height: 8px;
      background: #0d0d0d;
      border-radius: 10px;
      border: 1px solid #005be9;
      margin-bottom: 8px;
    }
    .paihang-row {
      width: 60px;
      height: 22px;
      border-radius: 10px;
      color: #ffffff;
      font-size: 12px;
      margin-right: 6px;
    }
    .progress-bar {
      height: 100%; /* 填充父容器的高度 */
      transition: width 0.5s ease; /* 平滑过渡 */
    }

    .paint {
      position: relative;
      .paint-img {
        width: 50.15px;
        height: 59.32px;
        position: absolute;
        top: -25px;
        right: -35px;
      }
    }
  }
}
</style>
