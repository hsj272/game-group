<template>
  <div class="notification">
    <div class="notification-inner">
      <div class="notification-icon">
        <span :class="[`icon-inner ${status}`]"> </span>
      </div>
      <span class="notification-title"><span>
          <span class="name">
            {{ text }}
          </span>
        </span>
      </span>
    </div>
    <button class="btn-close" @click="myClick()">
      <span style="vertical-align: inherit">
        <span style="vertical-align: inherit">×</span>
      </span>
    </button>
  </div>
</template>
<script setup lang="ts">

// 定义 props
defineProps({
  close: {
    type: Function,
    required: true,
  },

  status: String,
  text: String,
});

// 定义关闭通知的方法
function myClick() {
  if (typeof close === 'function') {
    close();
  }
}
</script>

<style scoped lang="less">
.notification {
  background: #212d40;
  border-radius: 20px;
  box-shadow: 0 8px 16px #0d131ca3;
  overflow: hidden;
  transition: background-color 0.3s;
  width: 1147px;
  height: 196px;
  z-index: 9999;
}

.notification-inner {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 56px 1fr;
  grid-column-gap: 15px;
  margin-right: 45px;
  padding: 10px 0 10px 10px;
  text-decoration: none;
  /* background-color: red; */
  margin-left: 50px;
}

.notification-icon {
  align-items: center;
  align-self: center;
  display: flex;
  grid-column: 1/2;
  /* grid-row: 1/3; */
  height: 156px;
  justify-content: center;
  justify-self: center;
  position: relative;
  width: 156px;
}

.icon-inner {
  background-color: #0d131c;
  border: none;
  border-radius: 50%;
  display: block;

  height: 143.43px;

  width: 143.43px;
  position: relative;
  background-size: contain;
  /* 保持图片完整显示 */
  background-repeat: no-repeat;
  /* 避免图片重复 */
  background-position: center;
}

.success {
  background-image: url('@/assets/Notice/Group267.png');
}

.info {
  background-color: #2196f3;
}

.warning {
  background-color: #ffc107;
}

.error {
  background-image: url('@/assets/Notice/Group266.png');
}

.notification-subtitle,
.notification-title {
  align-self: center;
  font-weight: 500;
  grid-column: 2/3;
  margin: 0;
  margin-left: 96px;
  display: inline-block;

  max-width: 780px;

  white-space: wrap;
}

.notification-title {
  color: #2283f6;
  font-size: 36px;
  grid-row: 1/2;
}

.notification-subtitle {
  color: #838fac;
  font-size: 36px;
  grid-row: 2/3;
}

.btn-close {
  background-color: transparent;
  border: none;
  color: #788aa8;
  font-size: 57px;
  font-weight: 500;
  height: 80px;
  line-height: 45px;
  padding: 0;
  position: absolute;
  right: 55px;
  top: 10px;
  transition: color 0.3s;
  width: 80px;
}

.btn-close:hover {
  color: #fff;
}

.name {
  font-weight: 600;
  font-size: 40px;
  color: #838fad;
  line-height: 47px;
}

.liwuAllBox {
  position: absolute;
  top: 40px;
  left: 30px;
}

.liwuBox {
  font-size: 100px;
}

@media (min-width: 768px) {
  :global(.pc .game-car .ant-notification) {
    position: absolute !important;
    top: 64px !important;
    right: 0 !important;
  }

  .notification {
    border-radius: 10px;
    box-shadow: 0 8px 16px #0d131ca3;
    overflow: hidden;
    transition: background-color 0.3s;
    width: 100%;
    height: 100px;
    z-index: 9999;
  }

    .notification-inner {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 34px 1fr;
      grid-column-gap: 15px;
      margin-right: 0;
      padding: 0 56px 0 0;
    text-decoration: none;
    /* background-color: red; */
    margin-left: 20px;
  }

  .notification-icon {
    align-items: center;
    align-self: center;
    display: flex;
    grid-column: 1/2;
    /* grid-row: 1/3; */
    height: 64px;
    justify-content: center;
    justify-self: center;
    position: relative;
    width: 64px;
  }

  .icon-inner {
    background-color: #0d131c;
    border: none;
    border-radius: 50%;
    display: block;

    height: 64px;

    width: 64px;
    position: relative;
    background-size: contain;
    /* 保持图片完整显示 */
    background-repeat: no-repeat;
    /* 避免图片重复 */
    background-position: center;
  }

  .success {
    background-image: url('@/assets/Notice/Group267.png');
  }

  .info {
    background-color: #2196f3;
  }

  .warning {
    background-color: #ffc107;
  }

  .error {
    background-image: url('@/assets/Notice/Group266.png');
  }

  .notification-subtitle,
  .notification-title {
    align-self: center;
    font-weight: 500;
    grid-column: 2/3;
    margin: 0;
    margin-left: 10px;
    display: inline-block;

    max-width: 780px;

    white-space: wrap;
  }

    .notification-title {
      color: #2283f6;
      font-size: 24px;
    grid-row: 1/2;
  }

    .notification-subtitle {
      color: #838fac;
      font-size: 24px;
    grid-row: 2/3;
  }

    .btn-close {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 50%;
      color: #b8c4d8;
      font-size: 26px;
      font-weight: 500;
      height: 36px;
      line-height: 36px;
      padding: 0;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      transition: color 0.3s;
      width: 36px;
  }

  .btn-close:hover {
    color: #fff;
  }

    .name {
      font-weight: 600;
      font-size: 24px;
      color: #838fad;
      line-height: 30px;
  }
}
</style>
