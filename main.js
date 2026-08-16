/* 丁奕禛 · EasonWheng — A320 玻璃座舱:UTC 时钟 + PFD / ND / ECAM 平滑微动 */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var NS = "http://www.w3.org/2000/svg";

  /* ══════════ 真实 UTC 时钟 ══════════ */
  var zulu = $("zulu");
  if (zulu) {
    var tickClock = function () {
      var d = new Date();
      var p = function (n) { return String(n).padStart(2, "0"); };
      zulu.textContent = p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + ":" + p(d.getUTCSeconds()) + "Z";
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ══════════ 元素 ══════════ */
  var adiWorld = $("adiWorld"), adiRoll = $("adiRoll");
  var speedTape = $("pfdSpeedTape"), altTape = $("pfdAltTape"), hdgTape = $("pfdHdgTape");
  var speedVal = $("pfdSpeedVal"), altVal = $("pfdAltVal"), hdgVal = $("pfdHdgVal"), vsVal = $("pfdVsVal");
  var ndRose = $("ndRose"), ndHdgVal = $("ndHdgVal");
  var ecam = {
    n1a: $("ecamN1a"), n1b: $("ecamN1b"), egta: $("ecamEGTa"), egtb: $("ecamEGTb"),
    n2a: $("ecamN2a"), n2b: $("ecamN2b"), ffa: $("ecamFFa"), ffb: $("ecamFFb")
  };

  /* ══════════ SVG 构建助手 ══════════ */
  function mk(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function mkText(x, y, str, cls, extra) {
    var t = mk("text", { x: x, y: y, "text-anchor": "middle", fill: "#ffffff", "font-size": 9 });
    if (cls) t.setAttribute("class", cls);
    if (extra) for (var k in extra) t.setAttribute(k, extra[k]);
    t.textContent = str;
    return t;
  }

  /* ══════════ 构建磁带刻度(间隔取 FlyByWire 精确值) ══════════ */
  function buildSpeedTape() {
    if (!speedTape) return;
    var cy = 118, px = 5, base = 260;
    for (var v = 200; v <= 320; v += 10) {
      var y = cy - (v - base) * px;
      if (y < -20 || y > 256) continue;
      var major = (v % 20 === 0);
      speedTape.appendChild(mk("line", { x1: major ? 22 : 42, x2: 56, y1: y, y2: y, stroke: major ? "#ffffff" : "rgba(255,255,255,0.35)", "stroke-width": major ? 1.5 : 1 }));
      if (major) {
        var t = mkText(18, y + 3, String(v), null, { "text-anchor": "end", "font-size": 9 });
        speedTape.appendChild(t);
      }
    }
  }
  function buildAltTape() {
    if (!altTape) return;
    var cy = 118, px = 0.2, base = 10200;
    for (var f = 9800; f <= 10600; f += 100) {
      var y = cy - (f - base) * px;
      if (y < -20 || y > 256) continue;
      var major = (f % 500 === 0);
      altTape.appendChild(mk("line", { x1: 0, x2: major ? 34 : 14, y1: y, y2: y, stroke: major ? "#ffffff" : "rgba(255,255,255,0.35)", "stroke-width": major ? 1.5 : 1 }));
      if (major) {
        var t = mkText(40, y + 3, String(Math.round(f / 100)), null, { "text-anchor": "start", "font-size": 9 });
        altTape.appendChild(t);
      }
    }
  }
  function buildHdgTape() {
    if (!hdgTape) return;
    var cx = 160, px = 2, base = 180;
    for (var d = 0; d < 360; d += 5) {
      var x = cx + ((d - base + 540) % 360 - 180) * px;
      if (x < -30 || x > 350) continue;
      var major = (d % 10 === 0);
      hdgTape.appendChild(mk("line", { x1: x, x2: x, y1: major ? 4 : 10, y2: 14, stroke: major ? "#ffffff" : "rgba(255,255,255,0.35)", "stroke-width": major ? 1.5 : 1 }));
      if (major) {
        var lbl = String(Math.round(d / 10));
        hdgTape.appendChild(mkText(x, 30, lbl, null, { "font-size": (d % 30 === 0) ? 12 : 9, fill: (d % 30 === 0) ? "#ffffff" : "rgba(255,255,255,0.75)" }));
      }
    }
  }
  function buildNdRose() {
    if (!ndRose) return;
    var cx = 150, cy = 150;
    for (var d = 0; d < 360; d += 5) {
      var major = (d % 10 === 0);
      var a = (d - 90) * Math.PI / 180;
      var r1 = major ? 114 : 120, r2 = 128;
      ndRose.appendChild(mk("line", {
        x1: cx + r1 * Math.cos(a), y1: cy + r1 * Math.sin(a),
        x2: cx + r2 * Math.cos(a), y2: cy + r2 * Math.sin(a),
        stroke: major ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.22)", "stroke-width": major ? 1.4 : 1
      }));
    }
    for (var dd = 0; dd < 360; dd += 10) {
      var aa = (dd - 90) * Math.PI / 180;
      var rx = cx + 104 * Math.cos(aa), ry = cy + 104 * Math.sin(aa);
      var card = dd === 0 ? "N" : dd === 90 ? "E" : dd === 180 ? "S" : dd === 270 ? "W" : null;
      if (card) {
        var ct = mkText(rx, ry, card, null, { fill: "#00ffff", "font-size": 12, "font-weight": "bold" });
        ndRose.appendChild(ct);
      } else {
        var num = String(dd).padStart(3, "0");
        ndRose.appendChild(mkText(rx, ry, num, null, { fill: "rgba(255,255,255,0.85)", "font-size": 8.5 }));
      }
    }
  }

  buildSpeedTape(); buildAltTape(); buildHdgTape(); buildNdRose();

  /* ══════════ 动画 ══════════ */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasAny = adiWorld || adiRoll || speedTape || altTape || hdgTape || ndRose || speedVal || altVal || hdgVal || ecam.n1a;

  if (!reduceMotion && hasAny) {
    var TAU = 0.8; // 一阶低通时间常数:真机陀螺式平滑(研究给出的 0.5–2s 取中)
    var st = { roll: 0, pitch: 0, speed: 260, alt: 10200, hdg: 180, vs: 0, n1: 58.4, egt: 612, n2: 88.7, ff: 1180 };
    var base = { speed: 260, alt: 10200, hdg: 180 };
    var t0 = performance.now(), lastNow = null, rafId = null;
    var shown = {};

    function setNum(el, key, value, dec) {
      if (!el) return;
      var v = value.toFixed(dec === undefined ? 0 : dec);
      if (v !== shown[key]) { shown[key] = v; el.textContent = v; }
    }

    function frame(now) {
      if (lastNow === null) lastNow = now;
      var dt = Math.min((now - lastNow) / 1000, 0.1);
      lastNow = now;
      var t = (now - t0) / 1000;

      var tg = {
        roll: 11 * Math.sin(t * 0.08),
        pitch: 5 * Math.sin(t * 0.06 + 1.3),
        speed: 260 + 4 * Math.sin(t * 0.05 + 0.7),
        alt: 10200 + 40 * Math.sin(t * 0.09 + 2.1),
        hdg: 180 + 9 * Math.sin(t * 0.07 + 4.0),
        vs: 60 * Math.sin(t * 0.11 + 1.0),
        n1: 58.4 + 0.4 * Math.sin(t * 0.13 + 0.3),
        egt: 612 + 8 * Math.sin(t * 0.10 + 1.1),
        n2: 88.7 + 0.3 * Math.sin(t * 0.12 + 2.0),
        ff: 1180 + 30 * Math.sin(t * 0.09 + 0.6)
      };

      var k = 1 - Math.exp(-dt / TAU);
      for (var key in tg) st[key] += (tg[key] - st[key]) * k;

      if (adiWorld) adiWorld.style.transform = "translateY(" + (st.pitch * 3).toFixed(2) + "px)";
      if (adiRoll) adiRoll.style.transform = "rotate(" + st.roll.toFixed(2) + "deg)";
      if (speedTape) speedTape.style.transform = "translateY(" + ((st.speed - base.speed) * 5).toFixed(2) + "px)";
      if (altTape) altTape.style.transform = "translateY(" + ((st.alt - base.alt) * 0.2).toFixed(2) + "px)";
      if (hdgTape) hdgTape.style.transform = "translateX(" + (-(st.hdg - base.hdg) * 2).toFixed(2) + "px)";
      if (ndRose) ndRose.style.transform = "rotate(" + (-st.hdg).toFixed(2) + "deg)";

      setNum(speedVal, "spd", st.speed);
      setNum(altVal, "alt", st.alt);
      setNum(hdgVal, "hdg", st.hdg);
      setNum(vsVal, "vs", (st.vs >= 0 ? "+" : "") + Math.abs(Math.round(st.vs)));
      setNum(ndHdgVal, "ndhdg", st.hdg);

      setNum(ecam.n1a, "n1a", st.n1, 1); setNum(ecam.n1b, "n1b", st.n1, 1);
      setNum(ecam.egta, "egta", st.egt); setNum(ecam.egtb, "egtb", st.egt);
      setNum(ecam.n2a, "n2a", st.n2, 1); setNum(ecam.n2b, "n2b", st.n2, 1);
      setNum(ecam.ffa, "ffa", st.ff); setNum(ecam.ffb, "ffb", st.ff);

      rafId = requestAnimationFrame(frame);
    }

    function start() { if (rafId === null) { lastNow = null; rafId = requestAnimationFrame(frame); } }
    function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastNow = null; } }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  }
})();
