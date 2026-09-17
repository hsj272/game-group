import { lang } from '@/lang';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Locale } from 'vant';
// 引入英文语言包
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';
import VN from 'vant/es/locale/lang/vi-VN';
import { tip } from '@/components/notice/Notice';
dayjs.extend(duration);
/**
 * 倒计时
 */
export function countdown(time: string): string {
  const now = dayjs()
  const target = dayjs(time);
  const diff = target.diff(now);

  if (diff < 0) {
    return '已结束';
  }

  const dur = dayjs.duration(diff);
  const hours = Math.floor(dur.asHours()).toString().padStart(2, '0'); // 改动 1: 添加小时
  const minutes = dur.minutes().toString().padStart(2, '0');
  const seconds = dur.seconds().toString().padStart(2, '0');

  // 根据是否有小时返回不同格式
  return parseInt(hours) > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function countdownTwo(time: string): string {
  const now = dayjs();
  const target = dayjs(time);
  const diff = target.diff(now);

  if (diff < 0) {
    return '已结束';
  }

  const dur = dayjs.duration(diff);
  const hours = Math.floor(dur.asHours()).toString().padStart(2, '0'); // 改动 1: 添加小时
  const minutes = dur.minutes().toString().padStart(2, '0');
  const seconds = dur.seconds().toString().padStart(2, '0');

  // 根据是否有小时返回不同格式
  return parseInt(hours) > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}
/**
 * 计算时间差
 */
export function getTimeDifferenceInMs(startTime: string, endTime: string) {
  const start = dayjs(startTime).subtract(1, 'hour');
  const end = dayjs(endTime).subtract(1, 'hour');
  const diff = end.diff(start); // 返回毫秒差
  return diff;
}

/**
 * 转换为时间戳
 * 晚1个小时，毫秒级时间戳
 */
export function convertTime(time: string) {
  const date = dayjs(time);
  return date.valueOf();
}

/**
 * 获取当前时间 时间戳 毫秒
 */
export function getCurrentTime() {
  const date = dayjs();
  return date.valueOf();
}

export function getLocale() {
  if (lang.m === 'en') {
    Locale.use('en-US', enUS);
  } else if (lang.m === 'vn') {
    Locale.use('vi-VN', VN);
  } else {
    Locale.use('zh-CN', zhCN);
  }
}

export function formatNumber(num: number) {
  if (!num) return '0';
  // // 转换为字符串，并使用正则表达式添加千位分隔符
  // let formatted = Math.floor(num)
  //   .toString()
  //   .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // // 如果数字长度大于等于3，替换最后三位为000
  // if (formatted.length > 3) {
  //   formatted = formatted.slice(0, -3) + '000';
  // }

  return num;
}

export function formatNumberInput(num: number) {
  if (!num) return '0';
  // // 转换为字符串，并使用正则表达式添加千位分隔符
  // let formatted = Math.floor(num)
  //   .toString()
  //   .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return num;
}

export function metaTuanId() {
  let queryString = '';
  // 优先从 hash 中取，例如：#/page?kode=37
  if (window.location.hash.includes('?')) {
    queryString = window.location.hash.split('?')[1];
  }
  // 否则从 search 中取，例如：/pc?kode=37#/
  else if (window.location.search.includes('?')) {
    queryString = window.location.search.slice(1); // 去掉 '?'
  }

  const params = new URLSearchParams(queryString);
  const kodeId = params.get('kode');
  const client = params.get('client');
  const historyId = params.get('historyId');
  const channel = params.get('channel');
  if (kodeId) {
    localStorage.setItem('kode', kodeId);
  }
  if (client) {
    localStorage.setItem('client', client);
  }
  if (historyId) {
    localStorage.setItem('historyId', historyId);
  }
  if (channel) {
    localStorage.setItem('channel', channel);
  }
}

/**
 * 判断是否是iOS设备
 * @returns {boolean} - 如果是iOS设备返回true，否则返回false
 */
export function isIOS() {
  const isInWebView = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isInWebView;
}

/**
 * 提现
 */
export const withdrawTypes = [
  {
    id: 0,
    key: 'VIETCOM BANK',
    value: '10001',
  },
  {
    id: 1,
    key: 'AGRI BANK',
    value: '10002',
  },
  {
    id: 2,
    key: 'BIDV',
    value: '10003',
  },
  {
    id: 3,
    key: 'VIETIN BANK',
    value: '10004',
  },
  {
    id: 4,
    key: 'VP BANK',
    value: '10005',
  },
  {
    id: 5,
    key: 'ABBANK',
    value: '10006',
  },
  {
    id: 6,
    key: 'ACB',
    value: '10007',
  },
  {
    id: 7,
    key: 'BAC A BANK',
    value: '10009',
  },
  {
    id: 8,
    key: 'BAO VIET BANK',
    value: '10011',
  },
  {
    id: 9,
    key: 'CBBANK',
    value: '10013',
  },
  {
    id: 10,
    key: 'CIMB BANK',
    value: '10014',
  },
  {
    id: 11,
    key: 'COOPBANK',
    value: '10015',
  },
  {
    id: 12,
    key: 'DBS BANK',
    value: '10016',
  },
  {
    id: 13,
    key: 'DONG A BANK',
    value: '10017',
  },
  {
    id: 14,
    key: 'Eximbank',
    value: '10018',
  },
  {
    id: 15,
    key: 'GPBank',
    value: '10019',
  },
  {
    id: 16,
    key: 'HDBank',
    value: '10020',
  },
  {
    id: 17,
    key: 'HongLeong',
    value: '10021',
  },
  {
    id: 18,
    key: 'HSBC',
    value: '10022',
  },
  {
    id: 19,
    key: 'IBK BANK',
    value: '10023',
  },
  {
    id: 20,
    key: 'IndovinaBank',
    value: '10024',
  },
  {
    id: 21,
    key: 'KOOKMIN HN',
    value: '10025',
  },
  {
    id: 22,
    key: 'KBANK',
    value: '10026',
  },
  {
    id: 23,
    key: 'KIEN LONG BANK',
    value: '10027',
  },
  {
    id: 24,
    key: 'LIEN VIET POST',
    value: '10028',
  },
  {
    id: 25,
    key: 'MB BANK',
    value: '10029',
  },
  {
    id: 26,
    key: 'MARITIME BANK',
    value: '10030',
  },
  {
    id: 27,
    key: 'NAM A BANK',
    value: '10031',
  },
  {
    id: 28,
    key: 'NCB',
    value: '10032',
  },
  {
    id: 29,
    key: 'NONGHYUP BANK',
    value: '10033',
  },
  {
    id: 30,
    key: 'OCB',
    value: '10034',
  },
  {
    id: 31,
    key: 'OCEAN BANK',
    value: '10035',
  },
  {
    id: 32,
    key: 'PUBLIC BANK',
    value: '10036',
  },
  {
    id: 33,
    key: 'PG BANK',
    value: '10037',
  },
  {
    id: 34,
    key: 'PVCOMBANK',
    value: '10038',
  },
  {
    id: 35,
    key: 'SACOM BANK',
    value: '10039',
  },
  {
    id: 36,
    key: 'SAIGONBANK',
    value: '10040',
  },
  {
    id: 37,
    key: 'SAIGON BANK',
    value: '10041',
  },
  {
    id: 38,
    key: 'StandardChartered',
    value: '10042',
  },
  {
    id: 39,
    key: 'SEABANK',
    value: '10043',
  },
  {
    id: 40,
    key: 'SAIGON HANOI',
    value: '10044',
  },
  {
    id: 41,
    key: 'TPBANK',
    value: '10046',
  },
  {
    id: 42,
    key: 'Ubank',
    value: '10047',
  },
  {
    id: 43,
    key: 'UnitedOverseas',
    value: '10048',
  },
  {
    id: 44,
    key: 'VIB',
    value: '10049',
  },
  {
    id: 45,
    key: 'VIET A BANK',
    value: '10050',
  },
  {
    id: 46,
    key: 'VIET CAPITAL BANK',
    value: '10051',
  },
  {
    id: 47,
    key: 'VIET BANK',
    value: '10052',
  },
  {
    id: 48,
    key: 'VRB',
    value: '10053',
  },
  {
    id: 49,
    key: 'WOORI BANK',
    value: '10054',
  },
  {
    id: 50,
    key: 'KOOKMIN HCM',
    value: '10055',
  },
  {
    id: 51,
    key: 'TECHCOMBANK',
    value: '10056',
  },
];

/**复制 */
export function copyToClipb(text: string | undefined) {
  if (!text) {
    tip.error(lang.v.tip_message_copy);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;

  // 彻底移出可视区域，不使用 fixed，避免 iOS 触发滚动
  textarea.style.position = 'absolute';
  textarea.style.opacity = '0';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';

  document.body.appendChild(textarea);
  textarea.setAttribute('readonly', 'true'); // 防止键盘弹出
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      tip.success(`${lang.v.tip_message_replicatingsuccess}`);
    } else {
      tip.error(lang.v.ji_zyi);
    }
  } catch (err) {
    tip.error(lang.v.ji_zyi);
  }

  document.body.removeChild(textarea);
}
