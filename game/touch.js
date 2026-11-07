(function () {
  "use strict";
  const api = window.ironhold;
  if (!api || !api.mobile) return;

  const root = document.getElementById("touch");
  const stick = document.getElementById("stick");
  const knob = document.getElementById("stickKnob");
  const look = document.getElementById("look");
  const shift = { sprint: false, breath: false };
  let crouch = false;
  let lookId = null;
  let lookX = 0;
  let lookY = 0;
  let stickId = null;

  function syncShift() {
    api.setKey("ShiftLeft", shift.sprint || shift.breath);
  }

  function resetStick() {
    stickId = null;
    knob.style.transform = "translate(0px, 0px)";
    api.setKey("KeyW", false);
    api.setKey("KeyA", false);
    api.setKey("KeyS", false);
    api.setKey("KeyD", false);
    shift.sprint = false;
    syncShift();
  }

  function moveStick(e) {
    const rect = stick.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const max = rect.width * 0.32;
    const len = Math.hypot(x, y) || 1;
    const clamped = Math.min(len, max);
    const nx = (x / len) * clamped;
    const ny = (y / len) * clamped;
    knob.style.transform = "translate(" + nx + "px, " + ny + "px)";
    const ax = nx / max;
    const ay = ny / max;
    const dead = 0.22;
    api.setKey("KeyD", ax > dead);
    api.setKey("KeyA", ax < -dead);
    api.setKey("KeyS", ay > dead);
    api.setKey("KeyW", ay < -dead);
    shift.sprint = ay < -0.72 && Math.abs(ax) < 0.62;
    syncShift();
  }

  stick.addEventListener("pointerdown", function (e) {
    stick.setPointerCapture(e.pointerId);
    stickId = e.pointerId;
    moveStick(e);
    e.preventDefault();
  });
  stick.addEventListener("pointermove", function (e) {
    if (e.pointerId !== stickId) return;
    moveStick(e);
  });
  function endStick(e) {
    if (e.pointerId !== stickId) return;
    resetStick();
  }
  stick.addEventListener("pointerup", endStick);
  stick.addEventListener("pointercancel", endStick);

  look.addEventListener("pointerdown", function (e) {
    if (e.target !== look) return;
    look.setPointerCapture(e.pointerId);
    lookId = e.pointerId;
    lookX = e.clientX;
    lookY = e.clientY;
    e.preventDefault();
  });
  look.addEventListener("pointermove", function (e) {
    if (e.pointerId !== lookId) return;
    api.look((e.clientX - lookX) * 2.35, (e.clientY - lookY) * 2.35);
    lookX = e.clientX;
    lookY = e.clientY;
  });
  function endLook(e) {
    if (e.pointerId !== lookId) return;
    lookId = null;
  }
  look.addEventListener("pointerup", endLook);
  look.addEventListener("pointercancel", endLook);

  function hold(id, down, up) {
    const el = document.getElementById(id);
    el.addEventListener("pointerdown", function (e) {
      el.setPointerCapture(e.pointerId);
      el.classList.add("held");
      down();
      e.preventDefault();
      e.stopPropagation();
    });
    function finish() {
      el.classList.remove("held");
      if (up) up();
    }
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
  }

  hold("btnFire", function () { api.fire(true); }, function () { api.fire(false); });
  hold("btnJump", function () { api.jump(true); }, function () { api.jump(false); });
  hold("btnBreath", function () {
    shift.breath = true;
    syncShift();
  }, function () {
    shift.breath = false;
    syncShift();
  });

  function tap(id, fn) {
    document.getElementById(id).addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fn(e.currentTarget);
    });
  }

  tap("btnAim", function () { api.aim(); });
  tap("btnReload", function () { api.reload(); });
  tap("btnMode", function () { api.fireMode(); });
  tap("btnPause", function () { api.pause(); });
  tap("btnCrouch", function (el) {
    crouch = !crouch;
    el.classList.toggle("on", crouch);
    api.setKey("ControlLeft", crouch);
  });
  document.querySelectorAll("[data-weapon]").forEach(function (el) {
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      api.weapon(Number(el.dataset.weapon));
    });
  });

  window.ironholdTouch = {
    setVisible: function (on) {
      root.hidden = !on;
      if (!on) window.ironholdTouch.release();
    },
    release: function () {
      resetStick();
      lookId = null;
      shift.breath = false;
      crouch = false;
      document.getElementById("btnCrouch").classList.remove("on");
      api.setKey("ControlLeft", false);
      syncShift();
      api.fire(false);
      api.jump(false);
    }
  };

  setInterval(function () {
    if (root.hidden) return;
    const weapon = api.weaponIndex();
    document.querySelectorAll("[data-weapon]").forEach(function (el) {
      el.classList.toggle("on", Number(el.dataset.weapon) === weapon);
    });
    document.getElementById("btnAim").classList.toggle("on", api.aiming());
  }, 200);
})();
