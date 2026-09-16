import { createApp, type DefineComponent } from 'vue';
import { lang } from '@/lang/index';
let zIndex = 999;
/**
 * 打开位于顶层的弹窗
 * @param app vue模块
 * @param options 传给vuem模块的参数
 * @returns {vm,close,container} vnode为vue生成的虚拟节点，
 * 可以调用函数.close为外部可以主动调用的关闭函数；
 * container是弹窗的容器，可以调用classList.add来动态增加样式
 */
export function openModal<T extends Record<string, any>>(
  app: DefineComponent<T, any, any>,
  options?: T,
) {
  if (app.__isOpen) return;
  const vm = createApp(app, options); // 创建vue实例
  const div = document.createElement('div'); // 创建弹窗容器
  document.body.appendChild(div); // 追加到body

  //补充蒙版样式，居中效果
  div.className = 'top-layer center';
  div.style.zIndex = `${zIndex}`;
  const container = document.createElement('div');
  container.className = 'container fade-in';
  div.appendChild(container);
  const box = document.createElement('div');
  container.appendChild(box);
  const close = (
    event?: MouseEvent | undefined,
    isanim?: boolean,
    time?: number,
    mount?: boolean,
  ) => {
    if (isanim) {
      div.style.transition = 'background 0.3s';
      div.style.background = 'rgba(0, 0, 0, 0)';
      container.classList.remove('fade-in'); // 移除进入动画类
      container.classList.add('fade-out'); // 添加退出动画类
      setTimeout(() => {
        vm.unmount();
        div.remove();
        app.__isOpen = false;
      }, time);
    } else {
      div.remove();
      if (!mount) {
        vm.unmount();
      }
      app.__isOpen = false;
    }
  };
  app.__isOpen = true;
  //隐藏关闭按钮
  if (!options?.hideClose) {
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close btn center';
    closeBtn.innerHTML = `${lang.v.tc_colse}`;
    container.appendChild(closeBtn);
    closeBtn.onclick = close;
  }
  vm.provide('close', close);
  const vnode = vm.mount(box) as any;
  return {
    vnode,
    close,
    container,
  };
}

export type ModalCloseFun = (
  event?: MouseEvent | undefined,
  isanim?: boolean,
  time?: number,
  mount?: boolean,
) => void | undefined;
