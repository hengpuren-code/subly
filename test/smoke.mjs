// Subly 核心逻辑冒烟测试 —— 用 Node 内置 test runner
// 运行：node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toMonthly, daysUntilDue, summarize, sortSubs,
  validateSub, isOverFreeLimit, FREE_LIMIT,
  upcoming, overdue, dueLabel,
} from '../site/logic.js';

test('toMonthly 把各周期折算到每月', () => {
  assert.equal(toMonthly(10, 'month'), 10);
  assert.equal(toMonthly(120, 'year'), 10);
  assert.equal(toMonthly(10, 'quarter'), 10 / 3);
  assert.equal(toMonthly(1, 'week'), 52 / 12);
  assert.equal(toMonthly('abc', 'month'), 0);
  assert.throws(() => toMonthly(1, 'nope'));
});

test('daysUntilDue 计算到期天数，支持负数', () => {
  const now = new Date('2025-01-01T00:00:00');
  assert.equal(daysUntilDue('2025-01-08', now), 7);
  assert.equal(daysUntilDue('2024-12-30', now), -2);
});

test('summarize 汇总数量/月均/年均/近期到期', () => {
  const now = new Date('2025-01-01T00:00:00');
  const subs = [
    { name: 'Netflix', amount: 15, period: 'month', nextDue: '2025-01-03' },
    { name: 'iCloud', amount: 120, period: 'year', nextDue: '2025-02-01' },
    { name: 'GitHub', amount: 4, period: 'month', nextDue: '2025-01-05' },
  ];
  const s = summarize(subs, now);
  assert.equal(s.count, 3);
  assert.equal(s.monthly, 29);
  assert.equal(s.yearly, 348);
  assert.equal(s.dueSoon, 2);
});

test('summarize 空列表安全', () => {
  const s = summarize([], new Date('2025-01-01'));
  assert.equal(s.count, 0);
  assert.equal(s.monthly, 0);
  assert.equal(s.yearly, 0);
});

test('sortSubs 支持按日期与按金额', () => {
  const subs = [
    { name: 'Netflix', amount: 15, period: 'month', nextDue: '2025-01-03' },
    { name: 'iCloud', amount: 120, period: 'year', nextDue: '2025-02-01' },
  ];
  assert.equal(sortSubs(subs, 'due')[0].name, 'Netflix');
  assert.equal(sortSubs(subs, 'amount')[0].name, 'Netflix');
});

test('validateSub 拦截非法输入', () => {
  assert.equal(validateSub({ name: '', amount: 1, period: 'month', nextDue: '2025-01-01' }).length, 1);
  assert.equal(validateSub({ name: 'A', amount: -1, period: 'month', nextDue: '2025-01-01' }).length, 1);
  assert.equal(validateSub({ name: 'A', amount: 1, period: 'bogus', nextDue: '2025-01-01' }).length, 1);
  assert.equal(validateSub({ name: 'A', amount: 1, period: 'month', nextDue: '2025-01-01' }).length, 0);
});

test('upcoming 列出窗口内即将到期的项，按天数升序', () => {
  const now = new Date('2025-01-01T00:00:00');
  const subs = [
    { name: 'A', amount: 1, period: 'month', nextDue: '2025-01-05' },
    { name: 'B', amount: 1, period: 'month', nextDue: '2025-01-03' },
    { name: 'C', amount: 1, period: 'month', nextDue: '2025-02-01' },
    { name: 'D', amount: 1, period: 'month', nextDue: '2024-12-30' },
  ];
  const u = upcoming(subs, now, 7);
  assert.equal(u.length, 2);
  assert.equal(u[0].sub.name, 'B');
  assert.equal(u[1].sub.name, 'A');
  assert.equal(upcoming(subs, now, 30).length, 2);
  assert.equal(upcoming(subs, now, 31).length, 3);
});

test('overdue 列出已逾期项', () => {
  const now = new Date('2025-01-01T00:00:00');
  const o = overdue([{ name: 'D', amount: 1, period: 'month', nextDue: '2024-12-30' }], now);
  assert.equal(o.length, 1);
  assert.equal(o[0].days, -2);
});

test('dueLabel 人类可读', () => {
  assert.equal(dueLabel(0), '今天到期');
  assert.equal(dueLabel(1), '明天到期');
  assert.equal(dueLabel(5), '5 天后');
  assert.equal(dueLabel(-3), '已逾期 3 天');
});

test('free limit 在达到 FREE_LIMIT 时触发', () => {
  assert.equal(isOverFreeLimit(Array.from({ length: FREE_LIMIT })), true);
  assert.equal(isOverFreeLimit([{}]), false);
});
