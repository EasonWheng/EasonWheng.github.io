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

  /*
   * Original simplified A320 PFD recreation. The information zones follow
   * the Airbus layout instead of using a generic artificial horizon.
   */
  function installPfd() {
    var pfd = document.querySelector(".display.pfd");
    if (!pfd) return;
    pfd.innerHTML = [
      '<svg class="pfd-layout" viewBox="0 0 158.75 158.75" aria-label="A320 primary flight display">',
      '<defs><clipPath id="attitudeClip"><path d="M32.2 60.4C39.6 47 53.7 38.7 68.9 38.7S98.2 47 105.6 60.4v40.9c-7.4 13.3-21.5 21.6-36.7 21.6s-29.3-8.3-36.7-21.6z"/></clipPath><clipPath id="speedClip"><rect x="1" y="25" width="28" height="96"/></clipPath><clipPath id="altClip"><rect x="114.5" y="25" width="21.5" height="96"/></clipPath><clipPath id="hdgClip"><rect x="31.8" y="139" width="74.2" height="19.75"/></clipPath></defs>',
      '<rect width="158.75" height="158.75" fill="#040404"/>',
      '<g class="pfd-fma-svg"><path d="M0 18.5h158.75M31 0v18.5M61 0v18.5M96 0v18.5M126 0v18.5"/><g class="fma-green"><text x="15.5" y="6.2">SPEED</text><text x="46" y="6.2">ALT CRZ</text><text x="78.5" y="6.2">NAV</text></g><g class="fma-white"><text x="111" y="6.2">AP1</text><text x="142.3" y="6.2">1 FD 2</text></g><g class="fma-magenta"><text x="15.5" y="13.2">A/THR</text><text x="46" y="13.2">ALT</text><text x="78.5" y="13.2">RWY</text></g></g>',
      '<g clip-path="url(#attitudeClip)"><g id="adiWorld" class="adi-world"><g id="adiRoll" class="adi-roll"><rect x="-55" y="-75" width="248" height="155.8" fill="#0698ff"/><rect x="-55" y="80.8" width="248" height="170" fill="#9c480c"/><path d="M-55 80.8H193" stroke="#fff" stroke-width=".72"/><g class="pitch-ladder"><path d="M59.4 49.8h19M62.8 57.3h12.2M55.8 64.8H82M62.8 72.3H75M62.8 89.3H75M55.8 96.8H82M62.8 104.3H75M59.4 111.8h19"/><text x="52.3" y="66.3">20</text><text x="85.5" y="66.3">20</text><text x="56.2" y="74">10</text><text x="81.8" y="74">10</text><text x="56.2" y="98.4">10</text><text x="81.8" y="98.4">10</text><text x="52.3" y="113.5">20</text><text x="85.5" y="113.5">20</text></g></g></g></g>',
      '<g class="bank-scale"><path d="M39.2 51.1l2.8 2M47 43.5l2.3 3.1M58.8 38.9l1.2 3.8M68.9 37.5v4M79 38.9l-1.2 3.8M90.8 43.5l-2.3 3.1M98.6 51.1l-2.8 2"/></g><g id="pfdBankPointer"><path d="M66.4 38.6h5l-2.5 3.7z" class="yellow-fill"/><path d="M66.8 45.2h4.2l-2.1-3.2z" class="white-fill"/></g>',
      '<g class="fixed-aircraft"><path d="M34.15 79.56h15.11v6.55h-2.52v-4.03H34.15zM103.66 79.56H88.55v6.55h2.52v-4.03h12.59z"/><path d="M67.65 79.56h2.52v2.52h-2.52z"/></g><g id="pfdFd" class="flight-director"><path d="M68.9 62v15.5M49.3 80.8h39.3"/></g>',
      '<g clip-path="url(#speedClip)" id="pfdSpeedTape" class="pfd-speed-tape"></g><path d="M1 58h8v45H1M29 78.3h-6.2l3.1-2.8" class="green-stroke"/><path d="M29 64.5h-5l2.6-2.5" class="magenta-fill"/><path d="M1 76.2h27.7v9.3H1z" class="readout-box"/><text x="14.8" y="83" id="pfdSpeedVal" class="readout-green">260</text>',
      '<g clip-path="url(#altClip)" id="pfdAltTape" class="pfd-alt-tape"></g><path d="M135.8 58h-7v45h7M114.5 78.3h6.2l-3.1-2.8" class="green-stroke"/><path d="M114.5 63.5h5l-2.6-2.5" class="magenta-fill"/><path d="M114.5 76.2h21.3v9.3h-21.3z" class="readout-box"/><text x="125.1" y="82.6" id="pfdAltVal" class="readout-green pfd-alt-value">10200</text>',
      '<g class="vs-scale"><path d="M140 25h5l10 55.8-10 55.8h-5"/><path d="M140 31h6M140 53h4M140 80.8h7M140 108.6h4M140 130.6h6"/><text x="149" y="31">6</text><text x="147" y="53">2</text><text x="147" y="111">2</text><text x="149" y="134">6</text></g><g id="pfdVsNeedle" class="vs-needle"><path d="M140 80.8h15"/><circle cx="140" cy="80.8" r="1"/></g><text x="151" y="79" id="pfdVsVal" class="vs-value">+0</text>',
      '<g clip-path="url(#hdgClip)" id="pfdHdgTape" class="pfd-hdg-tape"></g><path d="M68.9 139l-2.2 3.2h4.4z" class="yellow-fill"/><path d="M60.5 147h16.8v8.5H60.5z" class="readout-box"/><text x="68.9" y="153.2" id="pfdHdgVal" class="readout-green">180</text>',
      '<g class="pfd-offtape"><text x="1.5" y="127" class="cyan">MACH</text><text x="1.5" y="133.5">.785</text><text x="32.5" y="132" class="cyan">LS</text><text x="93" y="132" class="cyan">V/S</text><text x="114.5" y="127" class="cyan">QNH</text><text x="114.5" y="133.5">1013</text><text x="44" y="136.5" class="cyan">ILS</text><text x="82" y="136.5" class="cyan">HDG</text></g>',
      '</svg>'
    ].join("");
  }
  installPfd();

  /* ══════════ 元素 ══════════ */
  var adiWorld = $("adiWorld"), adiRoll = $("adiRoll");
  var speedTape = $("pfdSpeedTape"), altTape = $("pfdAltTape"), hdgTape = $("pfdHdgTape");
  var speedVal = $("pfdSpeedVal"), altVal = $("pfdAltVal"), hdgVal = $("pfdHdgVal"), vsVal = $("pfdVsVal");
  var pfdFd = $("pfdFd"), pfdBankPointer = $("pfdBankPointer"), pfdVsNeedle = $("pfdVsNeedle"), ecamFob = $("ecamFOB");
  var fcuSpeed = $("fcuSpeed"), fcuHdg = $("fcuHdg"), fcuAlt = $("fcuAlt");
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
    var cy = 80.8, px = 1.15, base = 260;
    for (var v = 200; v <= 320; v += 10) {
      var y = cy - (v - base) * px;
      if (y < 15 || y > 130) continue;
      var major = (v % 20 === 0);
      speedTape.appendChild(mk("line", { x1: major ? 22 : 25, x2: 29, y1: y, y2: y, stroke: major ? "#ffffff" : "rgba(255,255,255,0.5)", "stroke-width": major ? 0.65 : 0.4 }));
      if (major) {
        var t = mkText(12.5, y + 1.5, String(v), null, { "text-anchor": "middle", "font-size": 4.3 });
        speedTape.appendChild(t);
      }
    }
  }
  function buildAltTape() {
    if (!altTape) return;
    var cy = 80.8, px = 0.035, base = 10200;
    for (var f = 9800; f <= 10600; f += 100) {
      var y = cy - (f - base) * px;
      if (y < 15 || y > 130) continue;
      var major = (f % 200 === 0);
      altTape.appendChild(mk("line", { x1: 114.5, x2: major ? 121 : 118, y1: y, y2: y, stroke: major ? "#ffffff" : "rgba(255,255,255,0.4)", "stroke-width": major ? 0.7 : 0.45 }));
      if (major) {
        var t = mkText(128.5, y + 1.4, String(Math.round(f / 100)), null, { "text-anchor": "middle", "font-size": 4.1 });
        altTape.appendChild(t);
      }
    }
  }
  function buildHdgTape() {
    if (!hdgTape) return;
    var cx = 68.9, px = 0.75, base = 180;
    for (var d = 0; d < 360; d += 5) {
      var x = cx + ((d - base + 540) % 360 - 180) * px;
      if (x < 20 || x > 117) continue;
      var major = (d % 10 === 0);
      hdgTape.appendChild(mk("line", { x1: x, x2: x, y1: major ? 140 : 142, y2: 145, stroke: major ? "#ffffff" : "rgba(255,255,255,0.45)", "stroke-width": major ? 0.7 : 0.45 }));
      if (major) {
        var lbl = String(Math.round(d / 10));
        hdgTape.appendChild(mkText(x, 149.2, lbl, null, { "font-size": (d % 30 === 0) ? 4.8 : 4, fill: "#ffffff" }));
      }
    }
  }
  function buildNdRose() {
    if (!ndRose) return;
    // In ARC mode the compass is a full rotating rose whose centre sits below
    // the visible map. The display clips it to the upper arc, like an A320 ND.
    var cx = 150, cy = 255;
    for (var d = 0; d < 360; d += 5) {
      var major = (d % 10 === 0);
      var a = (d - 90) * Math.PI / 180;
      var r1 = major ? 126 : 131, r2 = 138;
      ndRose.appendChild(mk("line", {
        x1: cx + r1 * Math.cos(a), y1: cy + r1 * Math.sin(a),
        x2: cx + r2 * Math.cos(a), y2: cy + r2 * Math.sin(a),
        stroke: major ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.22)", "stroke-width": major ? 1.4 : 1
      }));
    }
    for (var dd = 0; dd < 360; dd += 10) {
      var aa = (dd - 90) * Math.PI / 180;
      var rx = cx + 116 * Math.cos(aa), ry = cy + 116 * Math.sin(aa);
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

  function installMainInstrumentPanel() {
    if (document.querySelector(".hero-pfd")) return;
    var panel = document.querySelector(".cockpit-inner");
    var captainPfd = document.querySelector(".display.pfd");
    var captainNd = document.querySelector(".display.nd");
    var centre = document.querySelector(".center-stack");
    if (!panel || !captainPfd || !captainNd || !centre) return;
    captainPfd.classList.add("capt-pfd");
    captainNd.classList.add("capt-nd");
    centre.classList.add("centre-displays");
    function replica(source, name) {
      var copy = source.cloneNode(true);
      copy.classList.add(name);
      copy.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(copy.querySelectorAll("[id]"), function (node) {
        node.removeAttribute("id");
      });
      return copy;
    }
    var captainRose = captainNd.querySelector("#ndRose");
    if (captainRose) captainRose.classList.add("nd-rose");
    panel.appendChild(replica(captainPfd, "fo-pfd"));
    panel.appendChild(replica(captainNd, "fo-nd"));
    var system = document.createElement("div");
    system.className = "display system-display";
    system.setAttribute("aria-hidden", "true");
    system.innerHTML = '<div class="sd-title">SD · F/CTL</div><svg viewBox="0 0 250 250"><g fill="none" stroke="#00ff00" stroke-width="2"><path d="M125 33v170M42 132h166M57 122l68-34 68 34M92 156l33 47 33-47"/><path d="M39 70h42M169 70h42M39 190h42M169 190h42"/></g><g fill="#00ff00" font-size="10" font-family="monospace"><text x="26" y="62">GREEN</text><text x="177" y="62">GREEN</text><text x="20" y="212">ELAC 1</text><text x="176" y="212">ELAC 2</text><text x="100" y="238">ALL NORMAL</text></g></svg>';
    centre.insertBefore(system, centre.querySelector(".system-label"));
  }
  installMainInstrumentPanel();

  var mirrors = {
    pfdWorld: document.querySelector(".fo-pfd .adi-world"),
    pfdRoll: document.querySelector(".fo-pfd .adi-roll"),
    pfdFd: document.querySelector(".fo-pfd .fd"),
    speedTape: document.querySelector(".fo-pfd .pfd-speed-tape"),
    altTape: document.querySelector(".fo-pfd .pfd-alt-tape"),
    hdgTape: document.querySelector(".fo-pfd .pfd-hdg-tape"),
    speedVal: document.querySelector(".fo-pfd .pfd-speed-value"),
    altVal: document.querySelector(".fo-pfd .pfd-alt-value"),
    hdgVal: document.querySelector(".fo-pfd .pfd-hdg-value"),
    ndRose: document.querySelector(".fo-nd .nd-rose"),
    ndRoute: document.querySelector(".fo-nd .nd-route"),
    captRoute: document.querySelector(".capt-nd .nd-route"),
    captGs: document.querySelector(".capt-nd .nd-gs b"),
    foGs: document.querySelector(".fo-nd .nd-gs b"),
    captWind: document.querySelector(".capt-nd .nd-wind b"),
    foWind: document.querySelector(".fo-nd .nd-wind b"),
    sdPath: document.querySelector(".system-display svg > g:first-of-type")
  };

  /* ══════════ 动画 ══════════ */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasAny = adiWorld || adiRoll || speedTape || altTape || hdgTape || ndRose || speedVal || altVal || hdgVal || ecam.n1a;

  if (!reduceMotion && hasAny) {
    var TAU = 0.8; // 一阶低通时间常数:真机陀螺式平滑(研究给出的 0.5–2s 取中)
    var st = { roll: 0, pitch: 0, speed: 260, alt: 10200, hdg: 180, vs: 0, n1: 58.4, egt: 612, n2: 88.7, ff: 1180, fob: 6.4, gs: 450, wind: 240 };
    var base = { speed: 260, alt: 10200, hdg: 180 };
    var t0 = performance.now(), lastNow = null, rafId = null;
    var shown = {};

    function setNum(el, key, value, dec) {
      if (!el) return;
      var v = typeof value === "number"
        ? value.toFixed(dec === undefined ? 0 : dec)
        : String(value);
      if (v !== shown[key]) { shown[key] = v; el.textContent = v; }
    }
    function setEcamValue(el, key, value, limit, dec) {
      setNum(el, key, value, dec);
      if (el && el.parentElement) {
        el.parentElement.style.setProperty("--level", Math.max(0, Math.min(1, value / limit)).toFixed(3));
      }
    }
    function setMirror(el, value, dec) {
      if (el) el.textContent = typeof value === "number" ? value.toFixed(dec === undefined ? 0 : dec) : String(value);
    }

    function frame(now) {
      if (lastNow === null) lastNow = now;
      var dt = Math.min((now - lastNow) / 1000, 0.1);
      lastNow = now;
      var t = (now - t0) / 1000;

      var tg = {
        roll: 12 * Math.sin(t * 0.32),
        pitch: 4 * Math.sin(t * 0.24 + 1.3),
        speed: 260 + 4 * Math.sin(t * 0.18 + 0.7),
        alt: 10200 + 40 * Math.sin(t * 0.28 + 2.1),
        hdg: 180 + 9 * Math.sin(t * 0.20 + 4.0),
        vs: 180 * Math.sin(t * 0.30 + 1.0),
        n1: 58.4 + 2.8 * Math.sin(t * 0.33 + 0.3),
        egt: 612 + 24 * Math.sin(t * 0.27 + 1.1),
        n2: 88.7 + 1.6 * Math.sin(t * 0.32 + 2.0),
        ff: 1180 + 110 * Math.sin(t * 0.25 + 0.6),
        fob: 6.4 - (t / 1800),
        gs: 450 + 7 * Math.sin(t * 0.18 + 1.8),
        wind: 240 + 12 * Math.sin(t * 0.16 + 2.6)
      };

      var k = 1 - Math.exp(-dt / TAU);
      for (var key in tg) st[key] += (tg[key] - st[key]) * k;

      if (adiWorld) adiWorld.style.transform = "translateY(" + (st.pitch * 1.15).toFixed(2) + "px)";
      if (adiRoll) adiRoll.style.transform = "rotate(" + st.roll.toFixed(2) + "deg)";
      if (speedTape) speedTape.style.transform = "translateY(" + ((st.speed - base.speed) * 1.15).toFixed(2) + "px)";
      if (altTape) altTape.style.transform = "translateY(" + ((st.alt - base.alt) * 0.035).toFixed(2) + "px)";
      if (hdgTape) hdgTape.style.transform = "translateX(" + (-(st.hdg - base.hdg) * 0.75).toFixed(2) + "px)";
      if (ndRose) ndRose.style.transform = "rotate(" + (-st.hdg).toFixed(2) + "deg)";
      if (pfdFd) pfdFd.style.transform = "translate(" + (-st.roll * 0.18).toFixed(2) + "px," + (-st.pitch * 0.7).toFixed(2) + "px)";
      if (pfdBankPointer) pfdBankPointer.setAttribute("transform", "rotate(" + st.roll.toFixed(2) + " 68.9 80.8)");
      if (pfdVsNeedle) pfdVsNeedle.setAttribute("transform", "rotate(" + Math.max(-42, Math.min(42, st.vs / 24)).toFixed(2) + " 140 80.8)");

      if (mirrors.pfdWorld) mirrors.pfdWorld.style.transform = "translateY(" + (st.pitch * 3).toFixed(2) + "px)";
      if (mirrors.pfdRoll) mirrors.pfdRoll.style.transform = "rotate(" + st.roll.toFixed(2) + "deg)";
      if (mirrors.pfdFd) mirrors.pfdFd.style.transform = "translate(" + (-st.roll * 0.45).toFixed(2) + "px," + (-st.pitch * 2).toFixed(2) + "px)";
      if (mirrors.speedTape) mirrors.speedTape.style.transform = "translateY(" + ((st.speed - base.speed) * 5).toFixed(2) + "px)";
      if (mirrors.altTape) mirrors.altTape.style.transform = "translateY(" + ((st.alt - base.alt) * 0.2).toFixed(2) + "px)";
      if (mirrors.hdgTape) mirrors.hdgTape.style.transform = "translateX(" + (-(st.hdg - base.hdg) * 2).toFixed(2) + "px)";
      if (mirrors.ndRose) mirrors.ndRose.style.transform = "rotate(" + (-st.hdg).toFixed(2) + "deg)";
      if (mirrors.captRoute) mirrors.captRoute.style.strokeDashoffset = (-t * 9).toFixed(1);
      if (mirrors.ndRoute) mirrors.ndRoute.style.strokeDashoffset = (-t * 9).toFixed(1);
      if (mirrors.sdPath) mirrors.sdPath.style.strokeDashoffset = (t * 9).toFixed(1);

      setNum(speedVal, "spd", st.speed);
      setNum(altVal, "alt", st.alt);
      setNum(hdgVal, "hdg", st.hdg);
      setNum(vsVal, "vs", (st.vs >= 0 ? "+" : "") + Math.abs(Math.round(st.vs)));
      setNum(ndHdgVal, "ndhdg", st.hdg);
      setNum(fcuSpeed, "fcuspd", st.speed);
      setNum(fcuHdg, "fcuhdg", st.hdg);
      setNum(fcuAlt, "fcualt", 35000 + st.alt - base.alt);
      setMirror(mirrors.speedVal, st.speed);
      setMirror(mirrors.altVal, st.alt);
      setMirror(mirrors.hdgVal, st.hdg);
      setMirror(mirrors.captGs, st.gs);
      setMirror(mirrors.foGs, st.gs);
      setMirror(mirrors.captWind, st.wind);
      setMirror(mirrors.foWind, st.wind);

      setEcamValue(ecam.n1a, "n1a", st.n1, 100, 1); setEcamValue(ecam.n1b, "n1b", st.n1, 100, 1);
      setEcamValue(ecam.egta, "egta", st.egt, 900); setEcamValue(ecam.egtb, "egtb", st.egt, 900);
      setEcamValue(ecam.n2a, "n2a", st.n2, 100, 1); setEcamValue(ecam.n2b, "n2b", st.n2, 100, 1);
      setEcamValue(ecam.ffa, "ffa", st.ff, 2000); setEcamValue(ecam.ffb, "ffb", st.ff, 2000);
      setNum(ecamFob, "fob", st.fob, 1);

      rafId = requestAnimationFrame(frame);
    }

    function start() { if (rafId === null) { lastNow = null; rafId = requestAnimationFrame(frame); } }
    function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastNow = null; } }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  }
})();
