import { notification } from 'ant-design-vue';
import Notice from './Notice.vue';
import { h } from 'vue';
export const tip = {
  success: (text: string) => openNotification('success', text),
  info: (text: string) => openNotification('info', text),
  warning: (text: string) => openNotification('warning', text),
  error: (text: string) => openNotification('error', text),
};
export const openNotification = (status: string, text: string) => {
  const key = `open${Date.now()}`;

  notification.config({
    duration: 3,
    maxCount: 1,
  });
  // 定义关闭函数
  const closeNotification = () => {
    notification.close(key);
  };
  notification.open({
    message: null,
    description: h(Notice, {
      close: closeNotification,
      status: status,
      text: text,
    }),
    placement: 'topRight',
    style: {
      background: 'rgba(0, 0, 0, 0)',
      padding: '0',
      margin: '0',
      zIndex: 9999,
    },
    top: '64px',

    key,
    closeIcon: h('span', {
      style: {
        display: 'none',
      },
    }),
    onClick: () => {
      notification.close(key); // 关闭当前通知
    },
  });
};
