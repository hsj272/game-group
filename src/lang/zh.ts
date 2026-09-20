import en from './en';
import zhBase from './zh-base';

// 中文包缺少的旧字段回退到英文，避免页面出现 undefined。
export default {
  ...en,
  ...zhBase,
};
