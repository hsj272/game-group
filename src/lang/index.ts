// 语言包
import { reactive } from 'vue';
import en from './en';
import zh from './zh';
import pt from './pt';
import sp from './sp';
import { getLocale } from '@/utils';
const languagePacks: Record<string, Record<string, string>> = {
  zh,
  en,
  pt,
  sp,
};

// 语言包
function getLanguageCode() {
  const langString = localStorage.getItem('language');
  if (!langString) {
    return 'zh';
  }
  // 曾经记录了错误的对象到localstorage
  if (langString.includes(':')) {
    const name = JSON.parse(langString).lan as string;
    // 修复一下
    localStorage.setItem('language', name);
    return languagePacks[name] ? name : 'zh';
  }
  return languagePacks[langString] ? langString : 'zh';
}
class Lang {
  v: Record<string, string> & typeof en = {
    ...en,
    ...languagePacks[getLanguageCode()],
  } as Record<string, string> & typeof en;
  m = getLanguageCode();

  change(key: string) {
    const language = languagePacks[key] ? key : 'zh';
    this.m = language;
    localStorage.setItem('language', language);
    this.v = { ...en, ...languagePacks[language] } as Record<string, string> & typeof en;
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
