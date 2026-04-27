/**
 * 天干地支计算（浏览器版）
 * 参考日：2026-04-24 = 丙午年壬辰月戊辰日（已验证）
 */

const GanZhi = (() => {
  const TG = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const DZ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const SX = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

  // 参考日：2026-04-24 = 戊辰（六十甲子序号4）
  const REF_MS = new Date(2026, 3, 24).getTime();
  const REF_IDX = 4; // 戊辰

  function daysDiff(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((d.getTime() - REF_MS) / 86400000);
  }

  // 立春近似日（21世纪公式用2位年份，精度±1天）
  function lichunDay(year) {
    const y = year - 2000;
    return Math.floor(y * 0.2422 + 3.87) - Math.floor(y / 4);
  }

  // 四柱年份（立春换年）
  function ganzhiYear(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const ly = (m < 2 || (m === 2 && d < lichunDay(y))) ? y - 1 : y;
    const idx = ((ly - 4) % 60 + 60) % 60;
    return { tg: TG[idx % 10], dz: DZ[idx % 12], sx: SX[idx % 12], ganzhi: TG[idx%10]+DZ[idx%12] };
  }

  // 各月节对应的地支序号（小寒=1丑, 立春=2寅, 惊蛰=3卯, ...）
  const TERM_DZ   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]; // 过节后
  const TERM_DAYS = [6, 4, 6, 5, 6, 6, 7, 7,  8,  8,  7, 7]; // 各月节近似日

  function monthDZIdx(date) {
    const m = date.getMonth(); // 0-based
    const d = date.getDate();
    return d >= TERM_DAYS[m] ? TERM_DZ[m] : TERM_DZ[(m - 1 + 12) % 12];
  }

  // 五虎遁年起月：年干 -> 寅月天干序号
  const YINMONTH_TG = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];

  function monthTGIdx(date) {
    const yz = ganzhiYear(date);
    const ytgIdx = TG.indexOf(yz.tg);
    const dzIdx = monthDZIdx(date);
    const advance = ((dzIdx - 2) + 12) % 12;
    return (YINMONTH_TG[ytgIdx] + advance) % 10;
  }

  // ── 公开 API ──────────────────────────────────────

  function getYearGanZhi(date) { return ganzhiYear(date); }

  function getMonthGanZhi(date) {
    const tg = monthTGIdx(date);
    const dz = monthDZIdx(date);
    return { tg: TG[tg], dz: DZ[dz], ganzhi: TG[tg]+DZ[dz] };
  }

  function getDayGanZhi(date) {
    const diff = daysDiff(date);
    const idx = ((REF_IDX + diff) % 60 + 60) % 60;
    return { tg: TG[idx%10], dz: DZ[idx%12], ganzhi: TG[idx%10]+DZ[idx%12] };
  }

  function getFullGanZhi(date) {
    const y = getYearGanZhi(date);
    const m = getMonthGanZhi(date);
    const d = getDayGanZhi(date);
    return {
      year: y, month: m, day: d,
      full: `${y.ganzhi}年${m.ganzhi}月${d.ganzhi}日`
    };
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m-1, d);
  }

  return { getYearGanZhi, getMonthGanZhi, getDayGanZhi, getFullGanZhi, formatDate, parseDate };
})();
