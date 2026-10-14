// Subly —— 纯计算逻辑。无 DOM 依赖，浏览器与 Node 测试共用。

/** 支持的计费周期 -> 折算到"月"的系数 */
export const PERIODS = {
  week: { label: '每周', perYear: 52 },
  month: { label: '每月', perYear: 12 },
  quarter: { label: '每季', perYear: 4 },
  year: { label: '每年', perYear: 1 },
};

/** 把某周期的金额折算成"每月等价支出" */
export function toMonthly(amount, period) {
  const p = PERIODS[period];
  if (!p) throw new Error(`unknown period: ${period}`);
  const a = Number(amount);
  if (!Number.isFinite(a)) return 0;
  return (a * p.perYear) / 12;
}

/** 两个日期相差的天数（to - from），按自然日计算 */
export function daysBetween(from, to) {
  const MS = 24 * 60 * 60 * 1000;
  const f = new Date(from);
  const t = new Date(to);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return NaN;
  const a = Date.UTC(f.getFullYear(), f.getMonth(), f.getDate());
  const b = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((b - a) / MS);
}

/** 距离下次续费还有几天（可为负数，表示已过期） */
export function daysUntilDue(nextDue, now = new Date()) {
  return daysBetween(now, nextDue);
}

/**
 * 汇总统计。
 * @returns {{count:number, monthly:number, yearly:number, dueSoon:number, dueSoonWindow:number}}
 */
export function summarize(subs, now = new Date(), dueSoonWindow = 7) {
  let monthly = 0;
  let dueSoon = 0;
  for (const s of subs) {
    monthly += toMonthly(s.amount, s.period);
    const d = daysUntilDue(s.nextDue, now);
    if (Number.isFinite(d) && d >= 0 && d <= dueSoonWindow) dueSoon += 1;
  }
  return {
    count: subs.length,
    monthly: round2(monthly),
    yearly: round2(monthly * 12),
    dueSoon,
    dueSoonWindow,
  };
}

/** 排序：'due' 按下一次续费日期升序；'amount' 按每月等价支出降序 */
export function sortSubs(subs, key = 'due') {
  const copy = subs.slice();
  if (key === 'amount') {
    copy.sort((a, b) => toMonthly(b.amount, b.period) - toMonthly(a.amount, a.period));
  } else {
    copy.sort((a, b) => {
      const da = new Date(a.nextDue).getTime();
      const db = new Date(b.nextDue).getTime();
      return da - db;
    });
  }
  return copy;
}

/**
 * 即将到期的订阅（含还有几天），按剩余天数升序。
 * @returns {Array<{sub:object, days:number}>}
 */
export function upcoming(subs, now = new Date(), windowDays = 7) {
  return subs
    .map((sub) => ({ sub, days: daysUntilDue(sub.nextDue, now) }))
    .filter((x) => Number.isFinite(x.days) && x.days >= 0 && x.days <= windowDays)
    .sort((a, b) => a.days - b.days);
}

/** 已过期（续费日已过）的订阅，按逾期天数降序 */
export function overdue(subs, now = new Date()) {
  return subs
    .map((sub) => ({ sub, days: daysUntilDue(sub.nextDue, now) }))
    .filter((x) => Number.isFinite(x.days) && x.days < 0)
    .sort((a, b) => a.days - b.days);
}

/** 人类可读的剩余天数文案 */
export function dueLabel(days) {
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  return `${days} 天后`;
}

/** 免费额度：超过这个数就需要 Pro */
export const FREE_LIMIT = 8;

export function isOverFreeLimit(subs) {
  return subs.length >= FREE_LIMIT;
}

/** 校验一条订阅记录，返回错误信息数组（空数组表示合法） */
export function validateSub(sub) {
  const errors = [];
  if (!sub || typeof sub.name !== 'string' || sub.name.trim() === '') {
    errors.push('名称不能为空');
  }
  const amt = Number(sub.amount);
  if (!Number.isFinite(amt) || amt < 0) errors.push('金额必须是非负数');
  if (!PERIODS[sub.period]) errors.push('计费周期不合法');
  if (!sub.nextDue || Number.isNaN(new Date(sub.nextDue).getTime())) {
    errors.push('请填写合法的下次续费日期');
  }
  return errors;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
