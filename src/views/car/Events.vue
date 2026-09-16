<template>
  <div class="lteia">
    <TslNav :title="lang.v.sy_carRace_carRace" v-if="dataCenter.layout.isMobile" />

    <div class="lteia-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <p class="title">{{ lang.v.sy_carRace_carRace }}</p>
        <div v-if="list.length > 0">
          <FistDistanceCar
            :carItem="list[0]"
            v-if="list.length > 0"
            @upbet="onUpbet"
            @start-car-id="selectGame"
          />
          <DistanceCar
            v-for="(item, index) in list.slice(1)"
            :key="index"
            :carItem="item"
            @start-car-id="selectGame"
          />
        </div>
        <NoData v-else />
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import TslNav from '@/components/TslNav.vue';
import DistanceCar from '@/views/car/components/DistanceCar.vue';
import FistDistanceCar from '@/views/car/components/FistDistanceCar.vue';
import { fetchMatchInfo, fetchRacingConfig } from '../api';
import type { GetMatchInfoResp } from '../api/protocol';
import { onMounted, nextTick, ref } from 'vue';
import { showLoadingToast, closeToast } from 'vant';
import { useRouter } from 'vue-router';
import NoData from '@/components/NoData.vue';
import { soundManager } from '@/manager/soundManager';
import backgroundMusic from '@/assets/events/car/gamy.mp3';
import { lang } from '@/lang';
import dataCenter from '@/dataCenter';
const router = useRouter();
const list = ref<GetMatchInfoResp[]>([]);
const loading = ref(false); // 控制普通加载
const refreshing = ref(false); // 控制下拉刷新
//获取开赛信息
const onLoad = (isRefresh: boolean) => {
  if (!isRefresh) {
    // 仅在普通加载时显示加载提示
    showLoadingToast({
      message: lang.v.loading,
      forbidClick: true,
    });
  }
  const loadingState = isRefresh ? refreshing : loading;

  // 设置加载状态
  loadingState.value = true;
  Promise.all([fetchRacingConfig(), fetchMatchInfo()])
    .then(async ([config, res]) => {
      dataCenter.bettingConfig.update(config);
      list.value = [];
      await nextTick();
      list.value = [...res].sort((a, b) => b.racingId - a.racingId);
    })
    .catch((error) => {
      console.error('Failed to load racing lobby', error);
    })
    .finally(() => {
      loadingState.value = false;
      closeToast();
    });
};
onMounted(() => {
  onLoad(false);
});
const onUpbet = () => {
  onLoad(false);
};
const onRefresh = () => {
  onLoad(true); // true 表示下拉刷新，不显示加载提示
};
const selectGame = (value: number) => {
  soundManager.play(backgroundMusic, 1, true);
  const routeData = {
    name: 'GameCar',
    query: {
      gameId: value,
    },
  };
  router.push(routeData);
};
</script>

<style lang="less" scoped>
.lteia {
  width: 100%;
  height: 100%;
}

.lteia-content {
  padding: 45px;
  color: #ffffff;
}

.title {
  font-weight: 900;
  font-size: 64px;
  color: #ffffff;
  line-height: 75px;
  margin-bottom: 60px;
}
@media (min-width: 768px) {
  .pc {
    .lteia-content {
      padding: 35px;
    }

    .title {
      font-weight: 600;
      font-size: 35px;
      color: #ffffff;
      line-height: 45px;
      margin-bottom: 30px;
    }
  }
}
</style>
