<template>
  <div class="navbar row-center">
    <img class="back-button" src="@/assets/changepass/Frame.png" @click="goBack" v-if="canGoBack" />
    <p class="title">{{ title }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
}>();

const canGoBack = computed(() => {
  return window.history.length > 1;
});

const goBack = () => {
  window.history.back();
};
</script>

<style lang="less" scoped>
.navbar {
  position: sticky;
  top: 0;
  height: 150px;
  background-color: rgb(13, 16, 21);
  padding: 0 45px;
  font-weight: bold;
  font-size: 50px;
  color: #fcfcfc;
  line-height: 59px;
  z-index: 998;
}

.back-button {
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.title {
  flex: 1;
  text-align: center;
}
</style>
