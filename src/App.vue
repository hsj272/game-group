<template>
  <div class="app-shell pc">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* 桌面端按原始设计尺寸排版后等比例放入固定 486px 容器。 */
@media only screen and (min-width: 768px) {
  #app>.app-shell.pc {
    width: 1000px;
    zoom: 0.486;
    /* zoom changes the visual size, but not the layout viewport. Keep the
       scaled game surface at least as tall as the browser window. */
    min-height: calc(100vh / 0.486);
  }
}

@media only screen and (max-width: 767px) {
  #app>.app-shell {
    width: 100%;
  }
}
</style>
