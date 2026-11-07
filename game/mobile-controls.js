(function () {
  'use strict';
  const api = window.ironhold;
  if (!api || !api.mobile) return;

  const STORAGE_KEY = 'breachline.mobile.settings.v1';
  const defaults = () => ({ look: 100, aim: 100, size: 100, opacity: 50, quality: 'balanced', positions: {} });
  const bound = (n, min, max) => Math.max(min, Math.min(max, n));
  const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? bound(Number(value), min, max) : fallback;
  let storageAvailable = true;
  function load() {
    const result = defaults();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      result.look = number(saved.look, result.look, 40, 220);
      result.aim = number(saved.aim, result.aim, 40, 220);
      result.size = number(saved.size, result.size, 80, 125);
      result.opacity = number(saved.opacity, result.opacity, 25, 85);
      if (['smooth', 'balanced', 'clear'].includes(saved.quality)) result.quality = saved.quality;
      if (saved.positions && typeof saved.positions === 'object') {
        for (const [key, pos] of Object.entries(saved.positions)) {
          if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
            result.positions[key] = { x: bound(pos.x, 0, 1), y: bound(pos.y, 0, 1) };
          }
        }
      }
    } catch (_) { storageAvailable = false; }
    return result;
  }
  let prefs = load();
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    document.querySelector('.settings-footer span').textContent = storageAvailable ? '设置保存在本机' : '当前无法保存，设置仅本次有效';
  }

  const root = document.getElementById('touch');
  const stick = document.getElementById('stick');
  const knob = document.getElementById('stickKnob');
  const look = document.getElementById('look');
  const settings = document.getElementById('mobileSettings');
  const toolbar = document.getElementById('layoutToolbar');
  const layoutElements = Array.from(root.querySelectorAll('[data-layout]'));
  const shift = { sprint: false, breath: false };
  let crouch = false;
  let lookId = null, lookX = 0, lookY = 0, stickId = null;
  let editing = false, drag = null;
  const releaseHolds = [];

  function syncShift() { api.setKey('ShiftLeft', shift.sprint || shift.breath); }
  function resetStick() {
    stickId = null;
    knob.style.transform = 'translate(0px, 0px)';
    ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach(code => api.setKey(code, false));
    shift.sprint = false;
    syncShift();
  }
  function moveStick(e) {
    const rect = stick.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const max = rect.width * .32, len = Math.hypot(x, y) || 1;
    const clamped = Math.min(len, max), nx = x / len * clamped, ny = y / len * clamped;
    knob.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
    const ax = nx / max, ay = ny / max, dead = .22;
    api.setKey('KeyD', ax > dead); api.setKey('KeyA', ax < -dead);
    api.setKey('KeyS', ay > dead); api.setKey('KeyW', ay < -dead);
    shift.sprint = ay < -.72 && Math.abs(ax) < .62;
    syncShift();
  }
  stick.addEventListener('pointerdown', e => {
    if (stickId !== null) return;
    stick.setPointerCapture(e.pointerId); stickId = e.pointerId; moveStick(e); e.preventDefault();
  });
  stick.addEventListener('pointermove', e => { if (e.pointerId === stickId) moveStick(e); });
  function endStick(e) { if (e.pointerId === stickId) resetStick(); }
  stick.addEventListener('pointerup', endStick);
  stick.addEventListener('pointercancel', endStick);
  stick.addEventListener('lostpointercapture', endStick);

  function turn(dx, dy) {
    const sensitivity = (api.aiming() ? prefs.aim : prefs.look) / 100;
    api.look(dx * 2.35 * sensitivity, dy * 2.35 * sensitivity);
  }
  look.addEventListener('pointerdown', e => {
    if (e.target !== look || lookId !== null) return;
    look.setPointerCapture(e.pointerId); lookId = e.pointerId; lookX = e.clientX; lookY = e.clientY; e.preventDefault();
  });
  look.addEventListener('pointermove', e => {
    if (e.pointerId !== lookId) return;
    turn(e.clientX - lookX, e.clientY - lookY); lookX = e.clientX; lookY = e.clientY;
  });
  function endLook(e) { if (e.pointerId === lookId) lookId = null; }
  look.addEventListener('pointerup', endLook);
  look.addEventListener('pointercancel', endLook);
  look.addEventListener('lostpointercapture', endLook);

  function hold(id, down, up, dragToLook) {
    const el = document.getElementById(id);
    let pointer = null, x = 0, y = 0;
    el.addEventListener('pointerdown', e => {
      if (pointer !== null) return;
      pointer = e.pointerId; x = e.clientX; y = e.clientY;
      el.setPointerCapture(pointer); el.classList.add('held'); down();
      e.preventDefault(); e.stopPropagation();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== pointer || !dragToLook) return;
      turn(e.clientX - x, e.clientY - y); x = e.clientX; y = e.clientY; e.preventDefault();
    });
    function finish(e) {
      if (e.pointerId !== pointer) return;
      pointer = null; el.classList.remove('held'); if (up) up();
    }
    releaseHolds.push(() => { pointer = null; el.classList.remove('held'); if (up) up(); });
    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
    el.addEventListener('lostpointercapture', finish);
  }
  hold('btnFire', () => api.fire(true), () => api.fire(false), true);
  hold('btnJump', () => api.jump(true), () => api.jump(false), false);
  hold('btnBreath', () => { shift.breath = true; syncShift(); }, () => { shift.breath = false; syncShift(); }, false);
  function tap(id, fn) {
    document.getElementById(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(e.currentTarget); });
  }
  tap('btnAim', () => api.aim());
  tap('btnReload', () => api.reload());
  tap('btnMode', () => api.fireMode());
  tap('btnPause', () => api.pause());
  tap('btnCrouch', el => { crouch = !crouch; el.classList.toggle('on', crouch); api.setKey('ControlLeft', crouch); });
  root.querySelectorAll('[data-weapon]').forEach(el => el.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation(); api.weapon(Number(el.dataset.weapon));
  }));

  function clearPositions() {
    layoutElements.forEach(el => { ['left', 'top', 'right', 'bottom', 'transform'].forEach(name => { el.style[name] = ''; }); });
  }
  function position(el, value) {
    const maxX = Math.max(0, innerWidth - el.offsetWidth), maxY = Math.max(0, innerHeight - el.offsetHeight);
    el.style.left = Math.round(value.x * maxX) + 'px'; el.style.top = Math.round(value.y * maxY) + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transform = 'none';
  }
  function applyPositions() {
    clearPositions();
    layoutElements.forEach(el => { const pos = prefs.positions[el.dataset.layout]; if (pos) position(el, pos); });
  }
  function applySizes() {
    const unit = Math.min(innerWidth, innerHeight), scale = prefs.size / 100;
    document.body.style.setProperty('--control-size', Math.round(bound(unit * .115, 42, 54) * scale) + 'px');
    document.body.style.setProperty('--fire-size', Math.round(bound(unit * .17, 60, 78) * scale) + 'px');
    document.body.style.setProperty('--stick-size', Math.round(bound(unit * .27, 88, 125) * scale) + 'px');
    document.body.style.setProperty('--control-alpha', (prefs.opacity / 100).toFixed(2));
    applyPositions();
  }
  const ranges = [
    ['lookSensitivity', 'lookValue', 'look'], ['aimSensitivity', 'aimValue', 'aim'],
    ['buttonSize', 'sizeValue', 'size'], ['buttonOpacity', 'opacityValue', 'opacity']
  ];
  const qualityHints = {
    smooth: '优先流畅，画面分辨率会随设备负载调整。',
    balanced: '兼顾清晰和流畅，负载较高时会适度调整分辨率。',
    clear: '固定较高清晰度；如果卡顿或发热，请切换到均衡。'
  };
  function refreshSettings() {
    document.querySelector('.settings-footer span').textContent = storageAvailable ? '设置保存在本机' : '当前无法保存，设置仅本次有效';
    ranges.forEach(([input, output, key]) => { document.getElementById(input).value = prefs[key]; document.getElementById(output).textContent = prefs[key] + '%'; });
    settings.querySelectorAll('[data-quality]').forEach(el => { const selected = el.dataset.quality === prefs.quality; el.classList.toggle('on', selected); el.setAttribute('aria-pressed', String(selected)); });
    document.getElementById('qualityHint').textContent = qualityHints[prefs.quality];
  }
  ranges.forEach(([input, , key]) => document.getElementById(input).addEventListener('input', e => {
    prefs[key] = Number(e.target.value); applySizes(); refreshSettings(); save();
  }));
  settings.querySelectorAll('[data-quality]').forEach(el => el.addEventListener('click', () => {
    prefs.quality = el.dataset.quality; api.setQuality(prefs.quality); refreshSettings(); save();
  }));
  function openSettings(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (api.started()) api.pause();
    refreshSettings(); settings.hidden = false;
  }
  function closeSettings() { settings.hidden = true; }
  document.querySelectorAll('[data-open-settings]').forEach(el => el.addEventListener('click', openSettings));
  document.getElementById('settingsClose').addEventListener('click', closeSettings);
  document.getElementById('resetSettings').addEventListener('click', () => {
    prefs = defaults(); applySizes(); api.setQuality(prefs.quality); refreshSettings(); save();
  });

  function beginLayout() {
    settings.hidden = true; editing = true; root.hidden = false;
    document.body.classList.add('layout-edit'); toolbar.hidden = false; applySizes();
  }
  function finishLayout() {
    drag = null; editing = false; toolbar.hidden = true; document.body.classList.remove('layout-edit');
    root.hidden = !api.started(); settings.hidden = false; refreshSettings(); save();
  }
  document.getElementById('editLayout').addEventListener('click', beginLayout);
  document.getElementById('finishLayout').addEventListener('click', finishLayout);
  document.getElementById('resetLayout').addEventListener('click', () => { prefs.positions = {}; applyPositions(); save(); });
  root.addEventListener('pointerdown', e => {
    if (!editing) return;
    const el = e.target.closest('[data-layout]');
    e.preventDefault(); e.stopPropagation();
    if (!el || drag) return;
    const rect = el.getBoundingClientRect();
    drag = { el, id: e.pointerId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    el.setPointerCapture(e.pointerId);
  }, true);
  root.addEventListener('pointermove', e => {
    if (!editing || !drag || e.pointerId !== drag.id) return;
    e.preventDefault(); e.stopPropagation();
    const maxX = Math.max(1, innerWidth - drag.el.offsetWidth), maxY = Math.max(1, innerHeight - drag.el.offsetHeight);
    const pos = { x: bound((e.clientX - drag.offsetX) / maxX, 0, 1), y: bound((e.clientY - drag.offsetY) / maxY, 0, 1) };
    prefs.positions[drag.el.dataset.layout] = pos; position(drag.el, pos);
  }, true);
  function endDrag(e) {
    if (!editing || !drag || e.pointerId !== drag.id) return;
    e.preventDefault(); e.stopPropagation(); drag = null; save();
  }
  root.addEventListener('pointerup', endDrag, true);
  root.addEventListener('pointercancel', endDrag, true);
  addEventListener('resize', applySizes);

  window.ironholdTouch = {
    setVisible(on) { if (!editing) { root.hidden = !on; if (on) applyPositions(); } if (!on) this.release(); },
    release() {
      resetStick(); lookId = null; shift.breath = false; crouch = false;
      releaseHolds.forEach(release => release());
      document.getElementById('btnCrouch').classList.remove('on');
      root.querySelectorAll('.held').forEach(el => el.classList.remove('held'));
      api.setKey('ControlLeft', false); syncShift(); api.fire(false); api.jump(false);
    },
    handleBack() { if (editing) { finishLayout(); return true; } if (!settings.hidden) { closeSettings(); return true; } return false; }
  };

  applySizes(); api.setQuality(prefs.quality); refreshSettings();
  setInterval(() => {
    if (root.hidden || editing) return;
    const weapon = api.weaponIndex();
    root.querySelectorAll('[data-weapon]').forEach(el => el.classList.toggle('on', Number(el.dataset.weapon) === weapon));
    document.getElementById('btnAim').classList.toggle('on', api.aiming());
    document.getElementById('btnMode').textContent = api.fireModeLabel();
  }, 200);
})();
