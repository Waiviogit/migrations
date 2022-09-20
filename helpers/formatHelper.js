const { LANGUAGE_LIST } = require('../contants/language');
// если первый английский других не принимаем языков
exports.getFormattedLanguages = ({ languages = [] }) => {
  let addMore = true;
  if (!languages.length) return [];
  const result = languages.reduce((acc, el, i) => {
    const [lang] = el;
    if (lang === 'crt') return acc;
    const supportedLang = LANGUAGE_LIST[lang];
    if (!supportedLang || !addMore) return acc;
    acc.push(supportedLang);
    if (lang === 'eng' && !i) addMore = false;
    return acc;
  }, []);
  if (!result.length) return result;
  if (!result.includes(LANGUAGE_LIST.eng)) {
    return [result[0]];
  }
  return result;
};
