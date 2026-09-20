<template>
  <div>
    <div class="car-bottom row-center">
      <TslBtn
        v-if="currentUserId"
        class="bet-btn"
        :class="{ locked: props.isRunCar }"
        @click="openBetPanel"
        :text="props.isRunCar ? '下注已关闭' : lang.v.sy_ks_bet"
      />
      <div class="out-btn col-center col-middle" @click="goBack()">
        <img class="out-btn-img" src="@/assets/events/tuic.png" />
      </div>
    </div>

    <van-popup v-model:show="showBottom" round position="bottom" class="bet-popup">
      <div class="bet-po-content">
        <p>
          {{ lang.v.sy_ks_totalbets }}
          <span class="bet-num">{{ totalAmount }}</span>
        </p>
        <!-- <p>My Record</p> -->
      </div>

      <div class="bet-po-record">
        <div class="bet-po-record-item col-center">
          <div
            v-for="(item, index) in dataCenter.bettingConfig.betRatesConfig"
            :key="index"
            class="bet-po-record-item-item col-center col-middle"
            :class="{ active: index === currentIndex }"
            @click="selctCar(index)"
          >
            <p class="bet-po-record-item-item-num">X{{ item.betRate }}</p>
            <p class="bet-po-record-item-item-name">{{ item.betType }}</p>
          </div>
        </div>
        <div class="bet-po-record-item-right">
          <div
            v-for="(item, index) in 10"
            :key="item"
            class="bet-po-record-item-right-item col-center col-middle"
            @click="rightCar(item)"
          >
            <img :src="selectedCars.includes(item) ? duil : kont" class="kont-icon" />
            <img
              :src="chips[index]"
              class="car-icon"
              :class="{ rightCarItem: selectedCars.includes(item) }"
            />
            <p :class="{ txtactive: selectedCars.includes(item) }">{{ item }}</p>
          </div>
        </div>
      </div>
      <div class="bet-summary">
        <div>
          <span>玩法</span>
          <strong>{{ currentBetConfig?.betType || '-' }}</strong>
        </div>
        <div>
          <span>赛车</span>
          <strong>{{ selectedCars.length ? selectedCars.join(', ') : '-' }}</strong>
        </div>
        <div>
          <span>下注金额</span>
          <strong>{{ moneyData || '-' }}</strong>
        </div>
        <div>
          <span>预计收益</span>
          <strong class="potential">{{ expectedPayout }}</strong>
        </div>
      </div>
      <p v-if="props.isRunCar" class="bet-locked-tip">比赛已经开始，下注已关闭</p>
      <div class="row-center bom-po">
        <div class="select-pop row-center" v-if="!props.isRunCar">
          <div class="select-pop-item row-center row-middle" @click="isMoney = !isMoney">
            <img class="money-icon" src="@/assets/events/icomey.png" />
            <p>{{ moneyData }}</p>
          </div>

          <TslBtn
            class="select-btn"
            :class="{ disabled: !canSubmitBet }"
            @click="betCar()"
            :text="submitting ? '提交中...' : lang.v.sy_ks_bet"
          />
        </div>
        <div class="out-btn col-center col-middle" @click="showBottom = false">
          <img class="out-btn-img" src="@/assets/events/tuic.png" />
        </div>
      </div>
      <div v-if="isMoney" class="amount-selection">
        <div class="amount-options">
          <p
            v-for="item in dataCenter.bettingConfig.betAmountConfig"
            :key="item"
            @click="onSelect(item)"
          >
            {{ item }}
          </p>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import dataCenter from '@/dataCenter';
import { fetchBetting } from '@/views/api';
import type { BetReq, BetTypeKey } from '@/views/api/protocol';
import { getRacingUserId } from '@/api/auth';
import { reactive, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import router from '@/router';
import TslBtn from '@/components/TslBtn.vue';
import kont from '@/assets/events/kont.png';
import duil from '@/assets/events/duil.png';
import cars from '@/views/car/components/cars';
import { tip } from '@/components/notice/Notice';
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
const route = useRoute();
const emit = defineEmits<{
  selectionChange: [cars: number[]];
  betConfirmed: [cars: number[]];
}>();
const currentUserId = getRacingUserId();
const betData = reactive<BetReq>({
  betType: 'Champion',
  betAmount: 0,
  carNumbers: [],
  racingId: 0,
  paymentType: 1,
});
const submitting = ref(false);
const showBottom = ref(false);
const currentIndex = ref(0);
const selectedCars = ref<number[]>([]); // 右侧选中的车辆
//总金额
const totalAmount = computed(() => {
  return moneyData.value || 0;
});
// 选择金额
const isMoney = ref(false);
const moneyData = ref(dataCenter.bettingConfig.betAmountConfig[0]);
const currentBetConfig = computed(
  () => dataCenter.bettingConfig.betRatesConfig[currentIndex.value],
);
const expectedPayout = computed(() => {
  if (!moneyData.value || !currentBetConfig.value) return '0.00';
  return (Number(moneyData.value) * Number(currentBetConfig.value.betRate)).toFixed(2);
});
const requiredCarCount = computed(() =>
  currentBetConfig.value?.betType === 'Guess Three' ? 3 : 1,
);
const canSubmitBet = computed(
  () =>
    !props.isRunCar &&
    !submitting.value &&
    Boolean(moneyData.value) &&
    selectedCars.value.length === requiredCarCount.value,
);
watch(
  () => dataCenter.bettingConfig.betAmountConfig,
  (amounts) => {
    if (!moneyData.value && amounts.length) moneyData.value = amounts[0];
  },
  { deep: true, immediate: true },
);
watch(
  selectedCars,
  (cars) => emit('selectionChange', [...cars]),
  { deep: true, immediate: true },
);
const goBack = () => {
  router.go(-1);
};
const openBetPanel = () => {
  if (props.isRunCar) {
    tip.info('比赛已经开始，下注已关闭');
    return;
  }
  showBottom.value = true;
};
const onSelect = (money: number) => {
  moneyData.value = money;
  isMoney.value = false;
};

const props = defineProps({
  isRunCar: {
    type: Boolean,
    default: false,
  },
});

//下注
async function betCar() {
  if (!canSubmitBet.value) {
    if (props.isRunCar) tip.info('比赛已经开始，下注已关闭');
    return;
  }
  const config = dataCenter.bettingConfig.betRatesConfig[currentIndex.value];
  if (!config || !moneyData.value) return;
  const requiredCount = config.betType === 'Guess Three' ? 3 : 1;
  if (selectedCars.value.length !== requiredCount) {
    tip.error(requiredCount === 3 ? '请选择3辆赛车' : '请选择1辆赛车');
    return;
  }
  submitting.value = true;
  try {
    betData.betAmount = moneyData.value;
    betData.betType = config.betType as BetTypeKey;
    betData.racingId = Number(route.query.gameId);
    betData.carNumbers = [...selectedCars.value];
    const resp = await fetchBetting(betData);
    emit('betConfirmed', [...selectedCars.value]);
    tip.success(`${lang.v.car_tip}: ${dataCenter.conform}${moneyData.value} (#${resp.betId})`);
    showBottom.value = false;
  } catch (error) {
    tip.error(error instanceof Error ? error.message : '下注失败');
  } finally {
    window.setTimeout(() => (submitting.value = false), 500);
  }
}
enum BetType {
  /**
   * 冠军
   */
  FIRST = 6,
  /**
   * 单双
   */
  SINGLE_DOUBLE = 7,
  /**
   * 大小
   */
  BIG_SMALL = 8,
  /**
   * 前三
   */
  FIRST_THREE = 9,
  /**
   * 选择3个
   */
  SELECT_THREE = 10,
}
//选择车号
function selctCar(value: number) {
  currentIndex.value = value;
  selectedCars.value = [];
}
function rightCar(index: number) {
  const betId = dataCenter.bettingConfig.betRatesConfig[currentIndex.value].betTypeId;

  // 判断如果是 Champion，只允许选择一个
  if (betId === BetType.FIRST) {
    selectedCars.value = [index]; // 只允许选择一个
  } else if (betId === BetType.SINGLE_DOUBLE) {
    selectedCars.value = [index];
  } else if (betId === BetType.BIG_SMALL) {
    selectedCars.value = [index];
  } else if (betId === BetType.FIRST_THREE) {
    selectedCars.value = [index];
  } else if (betId === BetType.SELECT_THREE) {
    //不能超过3个
    if (selectedCars.value.length >= 3) {
      if (selectedCars.value.includes(index)) {
        selectedCars.value = selectedCars.value.filter((car) => car !== index);
      }
      return;
    }
    // 不能重复选择
    if (selectedCars.value.includes(index)) {
      selectedCars.value = selectedCars.value.filter((car) => car !== index);
      return;
    }
    selectedCars.value.push(index); // 添加选择
  }
}
</script>

<style lang="less" scoped>
.car-bottom {
  padding: 58px 46px;
  gap: 12px;
}

.input-container {
  width: 567px;
  height: 134px;
  background: #2d2d2d;
  border-radius: 23px;
  overflow: hidden;
  margin-right: 36px;

  .icon {
    width: 40.94px;
    height: 40.94px;
    margin-left: 51px;
    margin-right: 40px;
  }

  .bet-input-value {
    border: none;
    outline: none;
    background: transparent;
    font-weight: bold;
    font-size: 40px;
    color: #767575;
    line-height: 47px;
  }
}

.bet-btn {
  width: 286px;
  height: 134px;

  border-radius: 23px;
  color: #fff;
  font-size: 40px;
  line-height: 46.88px;
}
.bet-btn.locked,
.select-btn.disabled {
  opacity: 0.5;
  filter: grayscale(0.5);
  cursor: not-allowed;
}

.bet-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);

  div {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  span {
    color: #8f96a3;
  }

  strong {
    color: #fff;
    text-align: right;
  }

  .potential {
    color: #fdc057;
  }
}

.bet-locked-tip {
  margin-top: 20px;
  padding: 18px 24px;
  border-radius: 14px;
  color: #ffdf8a;
  background: rgba(227, 64, 89, 0.16);
  text-align: center;
}

.bet-popup {
  height: 1555.32px;
  background: #1b212b;
  border-top-left-radius: 36px;
  border-top-right-radius: 36px;
  border: 3px solid #ffffff;
  padding: 117px 44px 58px 44px;
  color: #fff;
  font-size: 40px;
  line-height: 56.25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* van-popup 会 teleport 到 body，桌面端不能依赖 .pc 的宽度继承。 */
@media only screen and (min-width: 768px) {
  :global(.bet-popup) {
    left: 50% !important;
    width: 486px !important;
    max-width: calc(100vw - 16px) !important;
    box-sizing: border-box;
    transform: translateX(-50%) !important;
  }
}

.bet-po-content {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 48px;
  color: #ffffff;
  line-height: 56px;
  .bet-num {
    font-weight: 900;
    font-size: 48px;
    color: #f7b836;
    line-height: 56px;
    vertical-align: bottom;
  }
}

.bet-po-record {
  display: flex;
  flex-direction: row;
  gap: 25px;
  margin: 40px 0;
  flex: 1;

  .bet-po-record-item {
    width: 270.19px;

    .bet-po-record-item-item {
      width: 100%;
      height: 184px;
      border-radius: 20px;

      background: #161b24;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .bet-po-record-item-item-num {
        font-weight: 600;
        font-size: 40px;
        color: #ffffff;
        line-height: 47px;
        margin-bottom: 27px;
      }
      .bet-po-record-item-item-name {
        font-weight: 600;
        font-size: 30px;
        color: #797878;
        line-height: 46px;
      }
    }
    .active {
      background: #0e131b;
      border: 1px solid #000000;
    }
  }

  .bet-po-record-item-right {
    flex: 2;
    display: grid;
    flex-wrap: wrap;
    gap: 24px;
    height: 560px;
    grid-template-columns: repeat(3, 1fr);
    .car-icon {
      width: 100%;
      object-fit: contain;
      height: 159.18px;
      border: 2px solid #6d6b68;
      border-radius: 20px;
      background: #161b24;
      padding: 0 10px;
      margin-bottom: 19px;
    }
    .rightCarItem {
      border: 2px solid #fabc46;
    }
    .bet-po-record-item-right-item {
      align-items: center;
      font-weight: 900;
      font-size: 32px;
      color: #ffffff;
      line-height: 38px;
      position: relative;
    }
    .txtactive {
      color: #f7b835;
    }
    .kont-icon {
      width: 40px;
      height: 40px;
      position: absolute;
      top: -10px;
      right: -10px;
    }
  }
}

.bom-po {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  gap: 40px;

  .select-pop {
    flex: 2;
    background-color: #2d2d2d;
    border-radius: 23px;

    .select-pop-item {
      font-weight: 900;
      font-size: 48px;
      color: #ffffff;
      line-height: 56px;
      display: flex;
      align-items: center;
      .money-icon {
        width: 69px;
        height: 69px;
        margin-right: 25px;
        margin-left: 25px;
      }
    }

    .select-btn {
      font-weight: 900;
      font-size: 48px;
      color: #ffffff;
      line-height: 56px;
      margin-left: auto;
      width: 461px;
      height: 134px;
      border-radius: 23px;
    }
  }
}
.out-btn {
  width: 222px;
  height: 134px;
  background-color: #2d2d2d;
  border-radius: 23px;
  display: flex;
  justify-content: center;
  align-items: center;

  .out-btn-img {
    width: 80px;
    height: 81px;
  }
}

.amount-selection {
  position: absolute;
  bottom: 13.5%;
  left: 11.5%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  z-index: 1000;
}

.amount-options {
  margin: 20px 0;

  p {
    margin: 20px;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
}
@media (min-width: 768px) {
  .pc {
    .car-bottom {
      padding: 28px 16px;
      gap: 12px;
    }

    .input-container {
      width: 667px;
      height: 90px;
      border-radius: 10px;
      overflow: hidden;
      margin-right: 16px;

      .icon {
        width: 20.94px;
        height: 20.94px;
        margin-left: 21px;
        margin-right: 20px;
      }

      .bet-input-value {
        border: none;
        outline: none;
        background: transparent;
        font-weight: bold;
        font-size: 20px;
        color: #767575;
        line-height: 27px;
      }
    }

    .bet-btn {
      width: 186px;
      height: 60px;

      border-radius: 10px;
      color: #fff;
      font-size: 20px;
      line-height: 27px;
    }

    .bet-popup {
      height: 555.32px;
      background: #1b212b;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border: 3px solid #ffffff;
      padding: 50px 24px 28px 24px;
      color: #fff;
      font-size: 20px;
      line-height: 27px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .bet-po-content {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 18px;
      color: #ffffff;
      line-height: 27px;
      .bet-num {
        font-weight: 900;
        font-size: 18px;
        color: #f7b836;
        line-height: 27px;
        vertical-align: bottom;
      }
    }

    .bet-po-record {
      display: flex;
      flex-direction: row;
      gap: 15px;
      margin: 20px 0;
      flex: 1;

      .bet-po-record-item {
        width: 200.19px;

        .bet-po-record-item-item {
          width: 100%;
          height: 124px;
          border-radius: 10px;

          background: #161b24;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .bet-po-record-item-item-num {
            font-weight: 600;
            font-size: 20px;
            color: #ffffff;
            line-height: 27px;
            margin-bottom: 17px;
          }
          .bet-po-record-item-item-name {
            font-weight: 600;
            font-size: 20px;
            color: #797878;
            line-height: 26px;
          }
        }
        .active {
          background: #0e131b;
          border: 1px solid #000000;
        }
      }

      .bet-po-record-item-right {
        flex: 2;
        display: grid;
        flex-wrap: wrap;
        gap: 34px;
        height: 560px;
        grid-template-columns: repeat(4, 1fr);
        .car-icon {
          width: 100%;
          object-fit: contain;
          height: 159.18px;
          border: 2px solid #6d6b68;
          border-radius: 10px;
          background: #161b24;
          padding: 0 10px;
          margin-bottom: 10px;
        }
        .rightCarItem {
          border: 2px solid #fabc46;
        }
        .bet-po-record-item-right-item {
          align-items: center;
          font-weight: 900;
          font-size: 22px;
          color: #ffffff;
          line-height: 28px;
          position: relative;
        }
        .txtactive {
          color: #f7b835;
        }
        .kont-icon {
          width: 30px;
          height: 30px;
          position: absolute;
          top: -10px;
          right: -12px;
        }
      }
    }

    .bom-po {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      gap: 20px;

      .select-pop {
        flex: 2;
        background-color: #2d2d2d;
        border-radius: 10px;

        .select-pop-item {
          font-weight: 900;
          font-size: 18px;
          color: #ffffff;
          line-height: 26px;
          display: flex;
          align-items: center;
          .money-icon {
            width: 39px;
            height: 39px;
            margin-right: 15px;
            margin-left: 15px;
          }
        }

        .select-btn {
          font-weight: 900;
          font-size: 18px;
          color: #ffffff;
          line-height: 26px;
          margin-left: auto;
          width: 361px;
          height: 70px;
          border-radius: 10px;
        }
      }
    }
    .out-btn {
      width: 122px;
      height: 90px;
      background-color: #2d2d2d;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;

      .out-btn-img {
        width: 40px;
        height: 40px;
      }
    }

    .amount-selection {
      position: absolute;
      bottom: -48%;
      left: 8%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 10px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
    }

    .amount-options {
      margin: 20px 0;

      p {
        margin: 20px;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
