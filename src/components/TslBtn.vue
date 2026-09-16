<template>
  <div class="tsl-btn center">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>{{ lang.v.cp_loading }}</span>
    </div>

    <span v-else>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { lang } from '@/lang';
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false, // 默认不开启加载
  },
});
</script>

<style lang="less" scoped>
.tsl-btn {
  max-width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e34059 0%, #cc0a43 100%);
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: white;
  text-align: center;
  padding: 10px 20px;
  border-radius: 5px;
}

.tsl-btn:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.spinner {
  border: 6px solid rgba(255, 255, 255, 0.3);
  border-top: 6px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
