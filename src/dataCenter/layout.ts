import { reactive } from 'vue';

export enum RightSideBarState {
  CLOSE,
  /**全站通知 */
  NOTICE,
}

class Layout {
  currentState = RightSideBarState.CLOSE;
  /**左边的是否折叠 */
  leftMenuFold = true;
  /**是否是手机模式 */
  isMobile = false;

  constructor() {
    this.checkSize();
  }
  startListen() {
    window.addEventListener('resize', this.checkSize.bind(this));
  }
  checkSize() {
    this.isMobile = window.innerWidth < 768;
  }

  /**内部使用，切换某个右边状态 */
  private toggle(state: RightSideBarState) {
    if (this.currentState === state) {
      this.currentState = RightSideBarState.CLOSE;
    } else {
      this.currentState = state;
    }
  }

  /**切换左边栏菜单 */
  toggleLeft() {
    this.leftMenuFold = !this.leftMenuFold;
  }

  /**快捷使用，通知栏是否打开 */
  isNotifyOpen() {
    return this.currentState === RightSideBarState.NOTICE;
  }

  /**切换通知栏 */
  toggleNotify() {
    this.toggle(RightSideBarState.NOTICE);
  }
}

export const layout = reactive(new Layout());
layout.startListen();
