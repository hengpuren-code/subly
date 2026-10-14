// Subly —— 应用 UI 逻辑（依赖 logic.js，纯前端，无后端）
import {
  PERIODS, toMonthly, daysUntilDue, summarize, sortSubs,
  validateSub, isOverFreeLimit, FREE_LIMIT,
  upcoming, overdue, dueLabel,
} from './logic.js';

const STORAGE_KEY = 'subly.subs.v1';
const REMINDER_KEY = 'subly.reminderDays.v1';
const REMINDER_CHOICES = [3, 7, 14, 30];
const CATEGORIES = ['影音', '软件', '云盘', '音乐', '健身', '新闻', '其他'];

let state = {
  subs: load(),
  sortKey: 'due',
  editingId: null,
  reminderDays: loadReminderDays(),
};

/* ---------------- 持久化 ---------------- */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.subs));
}
function loadReminderDays() {
  const v = parseInt(localStorage.getItem(REMINDER_KEY), 10);
  return REMINDER_CHOICES.includes(v) ? v : 7;
}
function saveReminderDays() {
  localStorage.setItem(REMINDER_KEY, String(state.reminderDays));
}

/* ---------------- 工具 ---------------- */
function uid() {
  return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function money(n) {
  return '$' + Number(n).toFixed(2);
}
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------------- 渲染 ---------------- */
function render() {
  renderStats();
  renderNotice();
  renderReminders();
  renderTable();
}

function renderStats() {
  const s = summarize(state.subs);
  document.getElementById('stat-monthly').textContent = money(s.monthly);
  document.getElementById('stat-yearly').textContent = money(s.yearly);
  document.getElementById('stat-due').textContent =
    s.dueSoon > 0 ? `${s.dueSoon} 项` : '无';
  document.getElementById('stat-due-label').textContent = `未来 ${s.dueSoonWindow} 天内续费`;
}

function renderNotice() {
  const el = document.getElementById('notice');
  if (isOverFreeLimit(state.subs)) {
    el.className = 'notice warn';
    el.style.display = 'block';
    el.innerHTML = `已达到免费版上限（${FREE_LIMIT} 个订阅）。升级 Pro 解锁无限订阅、续费提醒与多币种。`;
  } else if (state.subs.length > 0) {
    el.className = 'notice';
    el.style.display = 'block';
    el.innerHTML = `免费版还可添加 <strong>${FREE_LIMIT - state.subs.length}</strong> 个订阅。数据只保存在本机浏览器。`;
  } else {
    el.style.display = 'none';
  }
}

function reminderItems() {
  return [
    ...overdue(state.subs).map((x) => ({ ...x, isOverdue: true })),
    ...upcoming(state.subs, new Date(), state.reminderDays),
  ];
}

function renderReminders() {
  const panel = document.getElementById('reminders');
  const list = document.getElementById('reminder-list');
  const items = reminderItems();
  if (items.length === 0) {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'block';
  list.innerHTML = items.map(({ sub, days }) => `
    <li>
      <span>${esc(sub.name)}<span class="amt">${money(sub.amount)} / ${PERIODS[sub.period]?.label || sub.period}</span></span>
      <span class="when">${dueLabel(days)} · ${esc(sub.nextDue)}</span>
    </li>`).join('');
}

function renderTable() {
  const body = document.getElementById('rows');
  const empty = document.getElementById('empty');
  const table = document.getElementById('table');

  if (state.subs.length === 0) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  table.style.display = 'table';
  empty.style.display = 'none';

  const rows = sortSubs(state.subs, state.sortKey);
  body.innerHTML = rows.map((s) => {
    const d = daysUntilDue(s.nextDue);
    let dueClass = '';
    let dueText = s.nextDue;
    if (Number.isFinite(d)) {
      if (d < 0) { dueClass = 'due-soon'; dueText = `${s.nextDue}（已过期）`; }
      else if (d <= 7) { dueClass = 'due-soon'; dueText = `${s.nextDue}（${d} 天后）`; }
    }
    return `<tr>
      <td>
        <span class="name">${esc(s.name)}</span>
        <span class="cat">${esc(s.category || '其他')}</span>
      </td>
      <td>${money(s.amount)} <span class="hide-sm" style="color:var(--muted)">/ ${PERIODS[s.period]?.label || s.period}</span></td>
      <td>${money(toMonthly(s.amount, s.period))}</td>
      <td class="${dueClass}">${dueText}</td>
      <td style="text-align:right; white-space:nowrap">
        <button class="btn btn-sm btn-ghost" data-edit="${s.id}">编辑</button>
        <button class="btn btn-sm btn-danger" data-del="${s.id}">删除</button>
      </td>
    </tr>`;
  }).join('');
}

/* ---------------- 弹窗 ---------------- */
const backdrop = () => document.getElementById('backdrop');

function openModal(sub) {
  state.editingId = sub ? sub.id : null;
  document.getElementById('modal-title').textContent = sub ? '编辑订阅' : '添加订阅';
  document.getElementById('f-name').value = sub ? sub.name : '';
  document.getElementById('f-amount').value = sub ? sub.amount : '';
  document.getElementById('f-period').value = sub ? sub.period : 'month';
  document.getElementById('f-due').value = sub ? sub.nextDue : todayStr();
  document.getElementById('f-category').value = sub ? (sub.category || '其他') : '其他';
  document.getElementById('f-error').textContent = '';
  backdrop().classList.add('open');
  document.getElementById('f-name').focus();
}

function closeModal() {
  backdrop().classList.remove('open');
  state.editingId = null;
}

function submitModal() {
  const draft = {
    name: document.getElementById('f-name').value.trim(),
    amount: parseFloat(document.getElementById('f-amount').value),
    period: document.getElementById('f-period').value,
    nextDue: document.getElementById('f-due').value,
    category: document.getElementById('f-category').value,
  };
  const errors = validateSub(draft);
  if (errors.length) {
    document.getElementById('f-error').textContent = errors.join('；');
    return;
  }
  if (!state.editingId && isOverFreeLimit(state.subs)) {
    document.getElementById('f-error').textContent = `免费版最多 ${FREE_LIMIT} 个订阅，请先升级 Pro 或删除一些。`;
    return;
  }
  if (state.editingId) {
    const i = state.subs.findIndex((s) => s.id === state.editingId);
    if (i >= 0) state.subs[i] = { ...state.subs[i], ...draft };
  } else {
    state.subs.push({ id: uid(), ...draft });
  }
  save();
  closeModal();
  render();
}

/* ---------------- 导入 / 导出 ---------------- */
function exportJSON() {
  const blob = new Blob([JSON.stringify(state.subs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subly-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw new Error('不是数组');
      const clean = arr.filter((s) => validateSub(s).length === 0);
      state.subs = clean.map((s) => ({ id: s.id || uid(), ...s }));
      save();
      render();
      alert(`已导入 ${clean.length} 条订阅。`);
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  };
  reader.readAsText(file);
}

/* ---------------- 浏览器通知 ---------------- */
function notifySupported() {
  return typeof Notification !== 'undefined';
}

function updateNotifyButton() {
  const btn = document.getElementById('btn-notify');
  if (!btn) return;
  if (!notifySupported()) { btn.style.display = 'none'; return; }
  const p = Notification.permission;
  if (p === 'granted') {
    btn.textContent = '通知已开启';
    btn.disabled = true;
  } else if (p === 'denied') {
    btn.textContent = '通知已被浏览器阻止';
    btn.disabled = true;
  } else {
    btn.textContent = '开启浏览器通知';
    btn.disabled = false;
  }
}

function fireDueNotifications() {
  if (!notifySupported() || Notification.permission !== 'granted') return;
  const items = upcoming(state.subs, new Date(), state.reminderDays);
  if (items.length === 0) return;
  const body = items.map((x) => `${x.sub.name}（${dueLabel(x.days)}）`).join('\n');
  try {
    new Notification('Subly · 有订阅即将续费', { body, tag: 'subly-due' });
  } catch { /* 某些浏览器需要 Service Worker，忽略 */ }
}

async function enableNotifications() {
  if (!notifySupported()) { alert('当前浏览器不支持通知。'); return; }
  const perm = await Notification.requestPermission();
  updateNotifyButton();
  if (perm === 'granted') fireDueNotifications();
  else alert('你拒绝了通知权限，可在浏览器设置里重新开启。');
}

/* ---------------- 事件绑定 ---------------- */
function bind() {
  document.getElementById('btn-add').addEventListener('click', () => openModal(null));
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-save').addEventListener('click', submitModal);
  document.getElementById('sort').addEventListener('change', (e) => {
    state.sortKey = e.target.value;
    renderTable();
  });
  document.getElementById('btn-export').addEventListener('click', exportJSON);
  document.getElementById('file-import').addEventListener('change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });
  document.getElementById('reminder-days').addEventListener('change', (e) => {
    state.reminderDays = parseInt(e.target.value, 10);
    saveReminderDays();
    renderReminders();
  });
  document.getElementById('btn-notify').addEventListener('click', enableNotifications);
  document.getElementById('rows').addEventListener('click', (e) => {
    const editId = e.target.getAttribute('data-edit');
    const delId = e.target.getAttribute('data-del');
    if (editId) {
      const sub = state.subs.find((s) => s.id === editId);
      if (sub) openModal(sub);
    } else if (delId) {
      state.subs = state.subs.filter((s) => s.id !== delId);
      save();
      render();
    }
  });
  backdrop().addEventListener('click', (e) => {
    if (e.target === backdrop()) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop().classList.contains('open')) closeModal();
    if (e.key === 'Enter' && backdrop().classList.contains('open')) submitModal();
  });
}

document.getElementById('reminder-days').value = String(state.reminderDays);
updateNotifyButton();
bind();
render();
fireDueNotifications();
