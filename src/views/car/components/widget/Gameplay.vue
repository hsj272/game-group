<template>
  <div class="gameplay col-center">
    <div class="gameplay-tip center">{{ lang.v.sy_zl_gam }}</div>
    <div class="gameplay-content">
      <p>{{ lang.v.sy_zl_der }}</p>
      {{ lang.v.sy_zl_wec }}
      <p>{{ lang.v.sy_zl_bet }}</p>
      {{ lang.v.sy_zl_cli }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { lang } from '@/lang';
</script>

<style lang="less" scoped>
.gameplay {
  width: 1045.89px;
  height: 1402.94px;
  background: #1b212b;
  border: 5px solid #ffffff;
  border-radius: 50px;
}

.gameplay-tip {
  width: 757px;
  height: 189px;
  background: linear-gradient(90deg, #e34059 0%, #cc0a43 100%), #e52126;
  border-radius: 40px;
  border: 3px solid #ffffff;
  margin-top: -100px;
  font-weight: 900;
  font-size: 50px;
  color: #ffffff;
  line-height: 59px;
}

.gameplay-content {
  padding: 53px;
  font-weight: 600;
  font-size: 40px;
  color: #ffffff;
  line-height: 56px;

  p {
    font-family: bold;
    font-size: 50px;
    margin-top: 40px;
    margin-bottom: 40px;
  }
}

@media (min-width: 768px) {
  .pc {
    .gameplay {
      width: 467px;
      height: 430px;
      background: #1b212b;
      border: 2px solid #ffffff;
      border-radius: 16px;
    }

    .gameplay-tip {
      width: 250px;
      height: 52px;
      background: linear-gradient(90deg, #e34059 0%, #cc0a43 100%), #e52126;
      border-radius: 10px;
      border: 2px solid #ffffff;
      margin-top: -20px;
      font-weight: 900;
      font-size: 16px;
      color: #ffffff;
      line-height: 22px;
    }

    .gameplay-content {
      padding: 22px 23px;
      font-weight: 600;
      font-size: 16px;
      color: #ffffff;
      line-height: 21px;

      p {
        font-family: bold;
        font-size: 20px;
        margin-top: 12px;
        margin-bottom: 14px;
      }
    }
  }
}
</style>
