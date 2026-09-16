// 语言包
import { reactive } from 'vue';
import en from './en';
import { getLocale } from '@/utils';
const modules: Record<string, () => Promise<any>> = {
  en: () => import('./en'),
  pt: () => import('./pt'),
  sp: () => import('./sp'),
  // 添加其他语言模块
};

// 语言包
function getLanguageCode() {
  const langString = localStorage.getItem('language');
  if (!langString) {
    return 'en';
  }
  // 曾经记录了错误的对象到localstorage
  if (langString.includes(':')) {
    const name = JSON.parse(langString).lan as string;
    // 修复一下
    localStorage.setItem('language', name);
    return name;
  }
  return langString;
}
class Lang {
  v: Record<string, string> & typeof en = en; // 设置默认语言
  m = getLanguageCode();

  change(key: string) {
    this.m = key;
    localStorage.setItem('language', key);
    const importModule = modules[key];
    importModule().then((module) => {
      this.v = module.default;
    });
    getLocale();
  }
}

export const lang = reactive(new Lang());

/**真PG & 三方游戏 语言映射 */
export const PgLangMap: Record<string, string> = {
  en: 'EN',
  zh: 'ZH_CN',
  es: 'ES_ES',
  ina: 'ID_ID',
  pt_br: 'PT_PT',
  vn: 'VI_VN',
};

/**假PG 语言映射 */
export const fakePgMap: Record<string, string> = {
  en: 'en',
  zh: 'zh',
  es: 'es',
  ina: 'id',
  pt_br: 'pt',
  vn: 'vi',
};
