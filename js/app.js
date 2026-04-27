// ── 常量 ──────────────────────────────────────────────────
const LABELS = ['','至暗','低谷','沉郁','平淡','尚可','普通','不错','良好','美好','极致'];
const EMOJIS = ['','😔','😞','😕','😐','🙂','😊','😄','🌟','✨','🌈'];

function scoreColor(s) {
  if (s <= 3) return 'var(--s-low)';
  if (s <= 6) return 'var(--s-mid)';
  if (s <= 8) return 'var(--s-good)';
  return 'var(--s-best)';
}
function dotClass(s) {
  if (!s && s !== 0) return 'none';
  if (s <= 3) return 'low';
  if (s <= 6) return 'mid';
  if (s <= 8) return 'good';
  return 'best';
}
function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── 全局状态 ───────────────────────────────────────────────
var TODAY_STR = GanZhi.formatDate(new Date());
var STATE = {
  tab: 'today',
  calYear:  new Date().getFullYear(),
  calMonth: new Date().getMonth() + 1,
  todayEditing: false,
  detailDate: null,
  detailEditing: false
};

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(function() { el.classList.add('hidden'); }, 1800);
}

// ── Tab 切换 ───────────────────────────────────────────────
function switchTab(tab) {
  STATE.tab = tab;
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.getElementById('view-today').classList.toggle('hidden', tab !== 'today');
  document.getElementById('view-calendar').classList.toggle('hidden', tab !== 'calendar');
  if (tab === 'today')    renderToday();
  if (tab === 'calendar') renderCalendar();
}

// ── Today view ─────────────────────────────────────────────
function renderToday() {
  var el = document.getElementById('view-today');
  if (!el) return;

  var date   = GanZhi.parseDate(TODAY_STR);
  var gz     = GanZhi.getFullGanZhi(date);
  var rec    = Storage.getRecord(TODAY_STR);
  var score  = rec ? rec.score : 7;
  var note   = rec ? rec.note  : '';
  var hasRec = !!rec;
  var editing = STATE.todayEditing;

  // 近期记录
  var allRecs = Storage.getAllRecords();
  var recents = Object.keys(allRecs)
    .sort(function(a,b){ return b < a ? -1 : b > a ? 1 : 0; })
    .slice(0, 8);

  var html = '<div class="date-header">'
    + '<div class="solar-date">' + TODAY_STR + '</div>'
    + '<div class="ganzhi-full">' + gz.full + '</div>'
    + '<div class="ganzhi-pills">'
    + '<span class="pill">' + gz.year.ganzhi + '年（' + gz.year.sx + '）</span>'
    + '<span class="pill">' + gz.month.ganzhi + '月</span>'
    + '<span class="pill">' + gz.day.ganzhi + '日</span>'
    + '</div></div>';

  if (hasRec && !editing) {
    html += '<div class="card">'
      + '<div class="record-row">'
      + '<span class="big-emoji">' + EMOJIS[score] + '</span>'
      + '<div><div class="record-score" style="color:' + scoreColor(score) + '">' + score + ' 分</div>'
      + '<div class="record-sub">' + LABELS[score] + '</div></div>'
      + '</div>'
      + (note ? '<div class="note-display">' + esc(note) + '</div>' : '')
      + '<div class="btn-row">'
      + '<button class="btn-outline" id="t-edit">修改</button>'
      + '<button class="btn-ghost" id="t-del">删除</button>'
      + '</div></div>';
  } else {
    html += '<div class="card">'
      + '<div class="score-form-top">'
      + '<span class="score-emoji" id="t-emoji">' + EMOJIS[score] + '</span>'
      + '<span class="score-number" id="t-num" style="color:' + scoreColor(score) + '">' + score + '</span>'
      + '<span class="score-word" id="t-word">' + LABELS[score] + '</span>'
      + '</div>'
      + '<input type="range" id="t-slider" class="score-slider" min="1" max="10" value="' + score + '">'
      + '<div class="slider-labels"><span>至暗</span><span class="gold">极致</span></div>'
      + '<textarea id="t-note" class="note-input" placeholder="记录今日感受（选填）" maxlength="300">' + esc(note) + '</textarea>'
      + '<div class="btn-row">'
      + '<button class="btn-primary" id="t-save">' + (editing ? '保存修改' : '记录今日') + '</button>'
      + (editing ? '<button class="btn-ghost" id="t-cancel">取消</button>' : '')
      + '</div></div>';
  }

  if (recents.length > 0) {
    html += '<div class="section-title">最近记录</div>';
    recents.forEach(function(ds) {
      var r  = allRecs[ds];
      var dz = GanZhi.getDayGanZhi(GanZhi.parseDate(ds));
      html += '<div class="recent-item" data-ds="' + ds + '">'
        + '<div><div class="recent-date">' + ds + (ds === TODAY_STR ? ' · 今日' : '') + '</div>'
        + '<div class="recent-gz">' + dz.ganzhi + '日</div></div>'
        + '<div class="recent-right">'
        + '<span class="recent-emoji">' + EMOJIS[r.score] + '</span>'
        + '<span class="recent-score" style="color:' + scoreColor(r.score) + '">' + r.score + '分</span>'
        + '</div></div>';
    });
  }

  el.innerHTML = html;

  // 绑定事件
  var slider = document.getElementById('t-slider');
  if (slider) {
    slider.addEventListener('input', function() {
      var s = +this.value;
      var emoji = document.getElementById('t-emoji');
      if (emoji) { emoji.textContent = EMOJIS[s]; emoji.classList.add('pop'); setTimeout(function(){ emoji.classList.remove('pop'); }, 150); }
      var num = document.getElementById('t-num');
      if (num) { num.textContent = s; num.style.color = scoreColor(s); }
      var word = document.getElementById('t-word');
      if (word) word.textContent = LABELS[s];
    });
  }

  var btnSave = document.getElementById('t-save');
  if (btnSave) {
    btnSave.addEventListener('click', function() {
      var s = +(document.getElementById('t-slider').value);
      var n = document.getElementById('t-note').value;
      Storage.saveRecord(TODAY_STR, s, n);
      STATE.todayEditing = false;
      showToast('已记录 ✓');
      renderToday();
    });
  }

  var btnEdit = document.getElementById('t-edit');
  if (btnEdit) btnEdit.addEventListener('click', function() { STATE.todayEditing = true; renderToday(); });

  var btnCancel = document.getElementById('t-cancel');
  if (btnCancel) btnCancel.addEventListener('click', function() { STATE.todayEditing = false; renderToday(); });

  var btnDel = document.getElementById('t-del');
  if (btnDel) btnDel.addEventListener('click', function() {
    if (confirm('确定删除今日记录？')) {
      Storage.deleteRecord(TODAY_STR);
      STATE.todayEditing = false;
      renderToday();
    }
  });

  el.querySelectorAll('.recent-item').forEach(function(item) {
    item.addEventListener('click', function() { showDetail(item.dataset.ds); });
  });
}

// ── Calendar view ──────────────────────────────────────────
function renderCalendar() {
  var el = document.getElementById('view-calendar');
  if (!el) return;

  var year    = STATE.calYear;
  var month   = STATE.calMonth;
  var records = Storage.getMonthRecords(year, month);
  var firstDay = new Date(year, month - 1, 1);
  var gz = GanZhi.getFullGanZhi(firstDay);

  var recList = Object.values(records);
  var count = recList.length;
  var avg = count
    ? (recList.reduce(function(s,r){ return s + r.score; }, 0) / count).toFixed(1)
    : null;

  // 格子
  var daysInMonth = new Date(year, month, 0).getDate();
  var startWday = (firstDay.getDay() + 6) % 7; // 周一=0
  var cells = [];
  for (var i = 0; i < startWday; i++) cells.push(null);
  for (var d = 1; d <= daysInMonth; d++) {
    var date = new Date(year, month - 1, d);
    var ds   = GanZhi.formatDate(date);
    var gzd  = GanZhi.getDayGanZhi(date);
    var rec  = records[ds] || null;
    cells.push({ d: d, ds: ds, gz: gzd.ganzhi, score: rec ? rec.score : null, today: ds === TODAY_STR });
  }
  while (cells.length % 7) cells.push(null);

  var weeks = [];
  for (var j = 0; j < cells.length; j += 7) weeks.push(cells.slice(j, j + 7));

  var statsHtml = count
    ? '<div class="month-stats">'
      + '<div class="stat-item"><div class="stat-val">' + count + '</div><div class="stat-lbl">已记录</div></div>'
      + '<div class="stat-div"></div>'
      + '<div class="stat-item"><div class="stat-val" style="color:' + scoreColor(Math.round(+avg)) + '">' + avg + '</div><div class="stat-lbl">月均分</div></div>'
      + '<div class="stat-div"></div>'
      + '<div class="stat-item" id="cal-today-btn"><div class="stat-val" style="font-size:13px;color:var(--dim)">回今月</div></div>'
      + '</div>'
    : '<div class="month-stats">'
      + '<div class="stat-item"><div class="stat-val" style="font-size:15px;color:var(--dim)">本月暂无记录</div></div>'
      + '<div class="stat-div"></div>'
      + '<div class="stat-item" id="cal-today-btn"><div class="stat-val" style="font-size:13px;color:var(--dim)">回今月</div></div>'
      + '</div>';

  var gridHtml = weeks.map(function(week) {
    return '<div class="cal-week">' + week.map(function(cell) {
      if (!cell) return '<div class="day-cell empty"></div>';
      return '<div class="day-cell' + (cell.today ? ' today' : '') + '" data-ds="' + cell.ds + '">'
        + '<div class="day-num">' + cell.d + '</div>'
        + '<div class="day-gz">' + cell.gz + '</div>'
        + '<div class="score-dot ' + dotClass(cell.score) + '"></div>'
        + '</div>';
    }).join('') + '</div>';
  }).join('');

  el.innerHTML = '<div class="month-nav">'
    + '<button class="nav-btn" id="cal-prev">‹</button>'
    + '<div class="month-center">'
    + '<div class="month-solar">' + year + '年' + month + '月</div>'
    + '<div class="month-ganzhi">' + gz.year.ganzhi + '（' + gz.year.sx + '）年 · ' + gz.month.ganzhi + '月</div>'
    + '</div>'
    + '<button class="nav-btn" id="cal-next">›</button>'
    + '</div>'
    + statsHtml
    + '<div class="weekdays">'
    + ['一','二','三','四','五','六','日'].map(function(d,i){ return '<div class="weekday' + (i>=5?' weekend':'') + '">' + d + '</div>'; }).join('')
    + '</div>'
    + '<div class="cal-grid">' + gridHtml + '</div>'
    + '<div class="legend">'
    + '<div class="legend-item"><div class="legend-dot" style="background:var(--s-low)"></div>低(1-3)</div>'
    + '<div class="legend-item"><div class="legend-dot" style="background:var(--s-mid)"></div>中(4-6)</div>'
    + '<div class="legend-item"><div class="legend-dot" style="background:var(--s-good)"></div>好(7-8)</div>'
    + '<div class="legend-item"><div class="legend-dot" style="background:var(--s-best)"></div>极(9-10)</div>'
    + '</div>';

  document.getElementById('cal-prev').addEventListener('click', function() {
    STATE.calMonth--;
    if (STATE.calMonth < 1) { STATE.calMonth = 12; STATE.calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', function() {
    STATE.calMonth++;
    if (STATE.calMonth > 12) { STATE.calMonth = 1; STATE.calYear++; }
    renderCalendar();
  });
  var todayBtn = document.getElementById('cal-today-btn');
  if (todayBtn) todayBtn.addEventListener('click', function() {
    var now = new Date();
    STATE.calYear  = now.getFullYear();
    STATE.calMonth = now.getMonth() + 1;
    renderCalendar();
  });
  el.querySelectorAll('.day-cell:not(.empty)').forEach(function(cell) {
    cell.addEventListener('click', function() { showDetail(cell.dataset.ds); });
  });
}

// ── Detail 弹窗 ────────────────────────────────────────────
function showDetail(dateStr) {
  STATE.detailDate    = dateStr;
  STATE.detailEditing = !Storage.getRecord(dateStr);
  renderDetail();
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function hideDetail() {
  document.getElementById('modal-overlay').classList.add('hidden');
  if (STATE.tab === 'today')    renderToday();
  if (STATE.tab === 'calendar') renderCalendar();
}

function renderDetail() {
  var dateStr = STATE.detailDate;
  var date    = GanZhi.parseDate(dateStr);
  var gz      = GanZhi.getFullGanZhi(date);
  var rec     = Storage.getRecord(dateStr);
  var score   = rec ? rec.score : 7;
  var note    = rec ? rec.note  : '';
  var editing = STATE.detailEditing;
  var isToday = dateStr === TODAY_STR;

  var headerHtml = '<div class="modal-date-header">'
    + '<div class="modal-solar">' + dateStr + (isToday ? ' · 今日' : '') + '</div>'
    + '<div class="modal-ganzhi">' + gz.full + '</div>'
    + '<div class="modal-pills">'
    + '<span class="pill">' + gz.year.ganzhi + '年（' + gz.year.sx + '）</span>'
    + '<span class="pill">' + gz.month.ganzhi + '月</span>'
    + '<span class="pill">' + gz.day.ganzhi + '日</span>'
    + '</div></div>';

  var bodyHtml = '';
  if (rec && !editing) {
    bodyHtml = '<div class="record-row" style="margin-bottom:14px">'
      + '<span class="big-emoji">' + EMOJIS[score] + '</span>'
      + '<div><div class="record-score" style="color:' + scoreColor(score) + '">' + score + ' 分</div>'
      + '<div class="record-sub">' + LABELS[score] + '</div></div>'
      + '</div>'
      + (note ? '<div class="note-display">' + esc(note) + '</div>' : '')
      + '<div class="btn-row">'
      + '<button class="btn-outline" id="d-edit">修改</button>'
      + '<button class="btn-ghost" id="d-del">删除</button>'
      + '</div>';
  } else {
    bodyHtml = '<div class="score-form-top">'
      + '<span class="score-emoji" id="d-emoji">' + EMOJIS[score] + '</span>'
      + '<span class="score-number" id="d-num" style="color:' + scoreColor(score) + '">' + score + '</span>'
      + '<span class="score-word" id="d-word">' + LABELS[score] + '</span>'
      + '</div>'
      + '<input type="range" id="d-slider" class="score-slider" min="1" max="10" value="' + score + '">'
      + '<div class="slider-labels"><span>至暗</span><span class="gold">极致</span></div>'
      + '<textarea id="d-note" class="note-input" placeholder="记录这天的感受（选填）" maxlength="300">' + esc(note) + '</textarea>'
      + '<div class="btn-row">'
      + '<button class="btn-primary" id="d-save">保存</button>'
      + '<button class="btn-ghost" id="d-cancel">取消</button>'
      + '</div>';
  }

  document.getElementById('modal-content').innerHTML = headerHtml + bodyHtml;

  var dSlider = document.getElementById('d-slider');
  if (dSlider) {
    dSlider.addEventListener('input', function() {
      var s = +this.value;
      var emoji = document.getElementById('d-emoji');
      if (emoji) { emoji.textContent = EMOJIS[s]; emoji.classList.add('pop'); setTimeout(function(){ emoji.classList.remove('pop'); }, 150); }
      var num = document.getElementById('d-num');
      if (num) { num.textContent = s; num.style.color = scoreColor(s); }
      var word = document.getElementById('d-word');
      if (word) word.textContent = LABELS[s];
    });
  }

  var dSave = document.getElementById('d-save');
  if (dSave) dSave.addEventListener('click', function() {
    var s = +(document.getElementById('d-slider').value);
    var n = document.getElementById('d-note').value;
    Storage.saveRecord(dateStr, s, n);
    STATE.detailEditing = false;
    showToast('已保存 ✓');
    renderDetail();
  });

  var dEdit = document.getElementById('d-edit');
  if (dEdit) dEdit.addEventListener('click', function() { STATE.detailEditing = true; renderDetail(); });

  var dCancel = document.getElementById('d-cancel');
  if (dCancel) dCancel.addEventListener('click', function() {
    if (rec) { STATE.detailEditing = false; renderDetail(); }
    else hideDetail();
  });

  var dDel = document.getElementById('d-del');
  if (dDel) dDel.addEventListener('click', function() {
    if (confirm('确定删除这天的记录？')) {
      Storage.deleteRecord(dateStr);
      hideDetail();
    }
  });
}

// ── 启动 ───────────────────────────────────────────────────
// 脚本在 body 末尾，DOM 已就绪，直接初始化，无需等 DOMContentLoaded
(function init() {
  try {
    // Tab 点击（pointer-events:none 已加到 SVG，点击会冒泡到 button）
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
    });

    // 点遮罩关闭弹窗
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target.id === 'modal-overlay') hideDetail();
    });

    // 首屏渲染
    renderToday();

    // Service Worker（需 HTTPS 或 localhost）
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    }

  } catch(err) {
    // 把错误显示在页面上，方便调试
    var errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#1a1a2e;color:#e05c5c;padding:40px;font-size:14px;z-index:9999;overflow:auto;white-space:pre-wrap';
    errDiv.textContent = '初始化错误:\n' + err.message + '\n\n' + (err.stack || '');
    document.body.appendChild(errDiv);
  }
})();
