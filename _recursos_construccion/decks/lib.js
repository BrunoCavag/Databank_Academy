// Librería de diapositivas DataBank Academy - Riesgo de Crédito Minorista
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require("/root/.claude/skills/synced/80ec27f9-734b-48fe-b9dd-24005b6f0cbc_71d46920-e796-4608-a32a-59ea7b0ef256/pptx/scripts/apply_theme.js");

const HEX = {
  navy: "0B2545", navy2: "13315C", ice: "EEF2F7", white: "FFFFFF", ink: "1F2933",
  crimson: "C8102E", gold: "E0A100", green: "2E8B57", slate: "8D99AE", teal: "1B998B", grid: "E2E8F0", muted: "5B6B7F",
};
const THEME = {
  name: "DataBank Riesgo",
  headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.ice,
    accent1: HEX.crimson, accent2: HEX.gold, accent3: HEX.green, accent4: HEX.navy2, accent5: HEX.slate, accent6: HEX.teal,
    hlink: HEX.navy2, folHlink: HEX.slate },
};
const W = 13.333, H = 7.5, MX = 0.6;

function newDeck(meta) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = "DataBank Academy"; pres.company = "DataBank Academy"; pres.title = meta.title;
  const C = pres.SchemeColor;
  const footer = meta.footer;

  pres.defineSlideMaster({ title: "PORTADA", background: { color: HEX.navy },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 1.2, w: 10, h: 0.5, fontSize: 14, bold: true, color: C.accent2, charSpacing: 2 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 1.8, w: 11.5, h: 2.2, fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: MX, y: 4.2, w: 11, h: 1.2, fontSize: 20, color: "CADCFC", valign: "top" }, text: "" } },
      { placeholder: { options: { name: "meta", type: "body", x: MX, y: 6.2, w: 12, h: 0.6, fontSize: 13, color: C.accent5 }, text: "" } },
    ] });
  pres.defineSlideMaster({ title: "SECCION", background: { color: HEX.navy },
    objects: [
      { placeholder: { options: { name: "num", type: "body", x: MX, y: 1.6, w: 3, h: 1.5, fontSize: 80, bold: true, color: C.accent2, fontFace: "Cambria" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 3.2, w: 11.5, h: 1.3, fontSize: 38, bold: true, color: C.background1, valign: "top", align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: MX, y: 4.6, w: 11, h: 1.2, fontSize: 18, color: "CADCFC", valign: "top" }, text: "" } },
      { text: { text: footer, options: { x: MX, y: 6.85, w: 9, h: 0.35, fontSize: 10, color: C.accent5 } } },
    ], slideNumber: { x: 12.2, y: 6.85, w: 0.6, h: 0.35, fontSize: 10, color: HEX.slate, align: "right" } });
  pres.defineSlideMaster({ title: "CONTENIDO", background: { color: HEX.white },
    margin: [0.5, 0.6, 0.7, 0.6],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.35, w: W - 2 * MX, h: 0.95, fontSize: 30, bold: true, color: C.text2, valign: "middle", margin: 0, align: "left" }, text: "" } },
      { text: { text: footer, options: { x: MX, y: 6.95, w: 9, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
    ], slideNumber: { x: 12.2, y: 6.95, w: 0.55, h: 0.3, fontSize: 10, color: HEX.slate, align: "right" } });
  pres.defineSlideMaster({ title: "OSCURO", background: { color: HEX.navy },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.35, w: W - 2 * MX, h: 0.95, fontSize: 30, bold: true, color: C.background1, valign: "middle", margin: 0, align: "left" }, text: "" } },
      { text: { text: footer, options: { x: MX, y: 6.95, w: 9, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
    ], slideNumber: { x: 12.2, y: 6.95, w: 0.55, h: 0.3, fontSize: 10, color: HEX.slate, align: "right" } });

  let section = "Inicio";
  const D = {
    pres, C,
    sec(t) { section = t; pres.addSection({ title: t }); },
    slide(master) { return pres.addSlide({ masterName: master || "CONTENIDO", sectionTitle: section }); },
  };
  return D;
}

// -------------------------------------------------------------- utilidades
const circle = (s, D, x, y, d, txt, fill, color) => {
  s.addShape(D.pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill || D.C.text2 }, line: { type: "none" }, objectName: "circulo" });
  s.addText(String(txt), { x, y, w: d, h: d, fontSize: d > 0.6 ? 18 : 14, bold: true, color: color || D.C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, fontFace: "Cambria" });
};
const card = (s, D, x, y, w, h, fill) => s.addShape(D.pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || D.C.background2 }, line: { type: "none" }, objectName: "tarjeta" });
const bullets = (items, size, color) => items.map((t, i) => {
  const runs = typeof t === "string" ? [{ text: t }] : t;
  return runs.map((r, j) => ({ text: r.text, options: { ...(r.options || {}), bullet: j === 0 ? { indent: 16 } : undefined, fontSize: size || 16, color: color, breakLine: j === runs.length - 1 && i < items.length - 1, paraSpaceAfter: 8 } }));
}).flat();

// -------------------------------------------------------------- tipos de diapositiva
function sTitle(D, o) {
  const s = D.slide("PORTADA");
  s.addText(o.kicker, { placeholder: "kicker" });
  s.addText(o.title, { placeholder: "title" });
  s.addText(o.subtitle, { placeholder: "body" });
  s.addText(o.meta, { placeholder: "meta" });
  if (o.notes) s.addNotes(o.notes);
}

function sSection(D, o) {
  D.sec(o.sectionName || o.title);
  const s = D.slide("SECCION");
  s.addText(String(o.num).padStart(2, "0"), { placeholder: "num" });
  s.addText(o.title, { placeholder: "title" });
  if (o.sub) s.addText(o.sub, { placeholder: "body" });
  if (o.notes) s.addNotes(o.notes);
}

function sAgenda(D, o) {
  const s = D.slide(); s.addText(o.title || "Agenda de la sesión", { placeholder: "title" });
  const n = o.items.length, top = 1.55, rowH = Math.min(0.85, 5.1 / n);
  o.items.forEach((it, i) => {
    const y = top + i * rowH;
    circle(s, D, MX, y + 0.08, 0.55, i + 1);
    s.addText(it.t, { x: MX + 0.8, y, w: 7.2, h: rowH * 0.5, fontSize: 18, bold: true, color: D.C.text2, margin: 0, valign: "bottom", isTextBox: true });
    s.addText(it.d, { x: MX + 0.8, y: y + rowH * 0.5, w: 8.6, h: rowH * 0.45, fontSize: 13, color: HEX.muted, margin: 0, valign: "top", isTextBox: true });
    s.addShape(D.pres.shapes.ROUNDED_RECTANGLE, { x: 11.0, y: y + 0.12, w: 1.6, h: 0.45, rectRadius: 0.1, fill: { color: it.lab ? D.C.accent2 : D.C.background2 }, line: { type: "none" }, objectName: "tiempo" });
    s.addText(`${it.min} min${it.lab ? " · lab" : ""}`, { x: 11.0, y: y + 0.12, w: 1.6, h: 0.45, fontSize: 12, bold: true, align: "center", valign: "middle", color: D.C.text2, margin: 0, isTextBox: true });
  });
  if (o.notes) s.addNotes(o.notes);
}

function sCards(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  let top = 1.5;
  if (o.lead) { s.addText(o.lead, { x: MX, y: 1.35, w: W - 2 * MX, h: 0.6, fontSize: 16, color: HEX.muted, margin: 0, isTextBox: true, italic: true }); top = 2.05; }
  const cols = o.cols || Math.min(o.cards.length, 3), rows = Math.ceil(o.cards.length / cols);
  const gap = 0.3, cw = (W - 2 * MX - gap * (cols - 1)) / cols, ch = (6.65 - top - gap * (rows - 1)) / rows;
  o.cards.forEach((c, i) => {
    const x = MX + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap);
    card(s, D, x, y, cw, ch);
    circle(s, D, x + 0.25, y + 0.25, 0.5, c.icon || i + 1, c.color);
    s.addText(c.h, { x: x + 0.9, y: y + 0.2, w: cw - 1.1, h: 0.6, fontSize: 17, bold: true, color: D.C.text2, margin: 0, valign: "middle", isTextBox: true });
    const maxLen = Math.max(...o.cards.map(k => (Array.isArray(k.t) ? k.t.join(" ") : k.t).length));
    const auto = rows === 1 ? (maxLen < 140 ? 18 : 16) : (maxLen < 100 ? 18 : maxLen < 170 ? 16 : 14);
    const body = Array.isArray(c.t) ? bullets(c.t, c.size || o.size || auto, D.C.text1) : [{ text: c.t, options: { fontSize: c.size || o.size || auto, color: D.C.text1 } }];
    s.addText(body, { x: x + 0.25, y: y + 0.9, w: cw - 0.5, h: ch - 1.05, valign: "top", margin: 0, isTextBox: true });
  });
  if (o.notes) s.addNotes(o.notes);
}

function sFlow(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  const n = o.steps.length, gap = 0.15, w = (W - 2 * MX - gap * (n - 1)) / n, y = o.lead ? 2.2 : 1.7, h = o.note ? 3.6 : 4.4;
  if (o.lead) s.addText(o.lead, { x: MX, y: 1.35, w: W - 2 * MX, h: 0.6, fontSize: 16, color: HEX.muted, italic: true, margin: 0, isTextBox: true });
  o.steps.forEach((st, i) => {
    const x = MX + i * (w + gap);
    s.addShape(i === 0 ? D.pres.shapes.PENTAGON : D.pres.shapes.CHEVRON, { x, y, w, h: 0.8, fill: { color: i % 2 ? D.C.accent4 : D.C.text2 }, line: { type: "none" }, objectName: "paso" });
    s.addText(st.h, { x: x + 0.25, y, w: w - 0.45, h: 0.8, fontSize: (st.h.length > 14 && n >= 5) ? 12 : (st.h.length > 18 ? 13 : 15), bold: true, color: D.C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    card(s, D, x, y + 1.0, w - 0.1, h - 1.0);
    const fl = Math.max(...o.steps.map(k => k.t.join(" ").length));
    s.addText(bullets(st.t, st.size || o.size || (n <= 4 && fl < 110 ? 16 : n <= 5 && fl < 70 ? 15 : 14), D.C.text1), { x: x + 0.15, y: y + 1.15, w: w - 0.4, h: h - 1.3, valign: "top", margin: 0, isTextBox: true });
  });
  if (o.note) {
    s.addShape(D.pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 5.85, w: W - 2 * MX, h: 0.8, rectRadius: 0.08, fill: { color: "FFF4D6" }, line: { type: "none" }, objectName: "nota" });
    s.addText([{ text: "Clave: ", options: { bold: true, color: D.C.text2 } }, { text: o.note, options: { color: D.C.text1 } }], { x: MX + 0.25, y: 5.85, w: W - 2 * MX - 0.5, h: 0.8, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  }
  if (o.notes) s.addNotes(o.notes);
}

function sFormula(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  card(s, D, MX, 1.5, W - 2 * MX, 1.6, D.C.text2);
  s.addText(o.formula, { x: MX + 0.3, y: 1.5, w: W - 2 * MX - 0.6, h: 1.6, fontSize: o.fsize || 30, color: D.C.background1, align: "center", valign: "middle", fontFace: "Cambria", margin: 0, isTextBox: true });
  const lw = o.example ? 7.3 : W - 2 * MX;
  const rows = o.where.map(([sym, desc]) => [{ text: sym, options: { bold: true, color: D.C.accent1, fontFace: "Cambria", fontSize: 17 } }, { text: desc, options: { fontSize: 15, color: D.C.text1 } }]);
  s.addTable(rows, { x: MX, y: 3.4, w: lw, colW: [1.7, lw - 1.7], border: { type: "none" }, rowH: 0.48, valign: "middle", margin: [2, 6, 2, 0] });
  if (o.example) {
    card(s, D, 8.3, 3.4, W - MX - 8.3, 3.2);
    s.addText(o.example.h, { x: 8.55, y: 3.55, w: W - MX - 8.8, h: 0.45, fontSize: 16, bold: true, color: D.C.text2, margin: 0, isTextBox: true });
    s.addText(bullets(o.example.t, 14, D.C.text1), { x: 8.55, y: 4.05, w: W - MX - 8.8, h: 2.45, valign: "top", margin: 0, isTextBox: true });
  }
  if (o.notes) s.addNotes(o.notes);
}

const PCT = "0%", PCT1 = "0.0%";
function chartOpts(D, extra) {
  return Object.assign({
    showLegend: false, legendPos: "b", legendFontSize: 12, legendFontFace: "+mn-lt", legendColor: HEX.muted,
    catAxisLabelColor: HEX.muted, valAxisLabelColor: HEX.muted, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: HEX.grid, size: 0.75 }, catGridLine: { style: "none" },
    dataLabelFontSize: 10, dataLabelFontFace: "+mn-lt", dataLabelColor: HEX.ink,
    showTitle: false, titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.navy,
    catAxisTitleFontSize: 12, valAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted, valAxisTitleColor: HEX.muted,
    chartColors: [HEX.navy, HEX.crimson, HEX.gold, HEX.green, HEX.slate, HEX.teal],
  }, extra || {});
}

function sChart(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  const cw = o.points ? 7.9 : W - 2 * MX;
  const t = o.chart.type === "bar" ? D.pres.charts.BAR : o.chart.type === "line" ? D.pres.charts.LINE : D.pres.charts[o.chart.type.toUpperCase()];
  const data = o.chart.series.map(se => ({ name: se.name, labels: o.chart.labels, values: se.values }));
  if (o.chart.combo) {
    const cols = (o.chart.opts && o.chart.opts.chartColors) || [HEX.navy, HEX.crimson];
    const types = data.map((d, i) => ({ type: t, data: [d], options: Object.assign({ chartColors: [cols[i]], lineSize: 3, lineDataSymbol: "none" }, i ? { secondaryValAxis: true, secondaryCatAxis: true } : {}) }));
    const base = chartOpts(D, o.chart.opts); delete base.chartColors;
    s.addChart(types, Object.assign(base, { x: MX, y: 1.45, w: cw, h: 5.25, objectName: "grafico" }));
  } else {
    s.addChart(t, data, Object.assign(chartOpts(D, o.chart.opts), { x: MX, y: 1.45, w: cw, h: 5.25, objectName: "grafico" }));
  }
  if (o.points) {
    const x = MX + cw + 0.35, w = W - MX - x;
    let y = 1.5;
    if (o.kpi) {
      s.addText(o.kpi.v, { x, y, w, h: 0.9, fontSize: 44, bold: true, color: D.C.accent1, margin: 0, fontFace: "Cambria", isTextBox: true });
      s.addText(o.kpi.l, { x, y: y + 0.9, w, h: 0.45, fontSize: 13, color: HEX.muted, margin: 0, isTextBox: true });
      y += 1.55;
    }
    s.addText(bullets(o.points, o.psize || 15, D.C.text1), { x, y, w, h: 6.65 - y, valign: "top", margin: 0, isTextBox: true });
  }
  if (o.source) s.addText(o.source, { x: MX, y: 6.62, w: 8, h: 0.3, fontSize: 10, color: HEX.slate, italic: true, margin: 0, isTextBox: true });
  if (o.notes) s.addNotes(o.notes);
}

function sTable(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  let top = 1.5;
  if (o.lead) { s.addText(o.lead, { x: MX, y: 1.35, w: W - 2 * MX, h: 0.55, fontSize: 16, color: HEX.muted, italic: true, margin: 0, isTextBox: true }); top = 2.0; }
  const tw = o.w || W - 2 * MX;
  const fs = o.fsize || 14;
  const head = o.header.map(h => ({ text: h, options: { bold: true, color: HEX.white, fill: { color: HEX.navy }, fontSize: fs } }));
  const body = o.rows.map((r, i) => r.map((c, j) => {
    const cell = typeof c === "object" && c !== null ? c : { text: String(c) };
    return { text: cell.text, options: Object.assign({ fontSize: fs, color: HEX.ink, fill: { color: i % 2 ? HEX.white : HEX.ice }, bold: j === 0 }, cell.options || {}) };
  }));
  s.addTable([head, ...body], { x: MX, y: top, w: tw, colW: o.colW, border: { type: "solid", pt: 0.5, color: HEX.grid }, margin: [4, 8, 4, 8], valign: "middle", rowH: o.rowH || 0.42, autoPage: false });
  if (o.side) {
    const x = MX + tw + 0.35, w = W - MX - x;
    s.addText(bullets(o.side, 14, D.C.text1), { x, y: top, w, h: 6.6 - top, valign: "top", margin: 0, isTextBox: true });
  }
  if (o.note) s.addText(o.note, { x: MX, y: 6.25, w: W - 2 * MX, h: 0.55, fontSize: 12, color: HEX.muted, italic: true, margin: 0, isTextBox: true, valign: "bottom" });
  if (o.notes) s.addNotes(o.notes);
}

function sCompare(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  const gap = 0.4, cw = (W - 2 * MX - gap) / 2, y = 1.55, h = o.verdict ? 4.0 : 5.0;
  [[o.left, D.C.text2], [o.right, D.C.accent1]].forEach(([c, col], i) => {
    const x = MX + i * (cw + gap);
    card(s, D, x, y, cw, h);
    circle(s, D, x + 0.25, y + 0.22, 0.55, c.icon || (i ? "B" : "A"), col);
    s.addText(c.h, { x: x + 0.95, y: y + 0.2, w: cw - 1.2, h: 0.6, fontSize: 19, bold: true, color: D.C.text2, margin: 0, valign: "middle", isTextBox: true });
    s.addText(bullets(c.items, c.size || 15, D.C.text1), { x: x + 0.3, y: y + 1.0, w: cw - 0.6, h: h - 1.15, valign: "top", margin: 0, isTextBox: true });
  });
  if (o.verdict) {
    s.addShape(D.pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 5.8, w: W - 2 * MX, h: 0.85, rectRadius: 0.08, fill: { color: "FFF4D6" }, line: { type: "none" }, objectName: "nota" });
    s.addText([{ text: "Conclusión: ", options: { bold: true, color: D.C.text2 } }, { text: o.verdict, options: { color: D.C.text1 } }], { x: MX + 0.25, y: 5.8, w: W - 2 * MX - 0.5, h: 0.85, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  }
  if (o.notes) s.addNotes(o.notes);
}

function sStats(D, o) {
  const s = D.slide(); s.addText(o.title, { placeholder: "title" });
  const n = o.stats.length, gap = 0.3, cw = (W - 2 * MX - gap * (n - 1)) / n;
  o.stats.forEach((st, i) => {
    const x = MX + i * (cw + gap);
    card(s, D, x, 1.6, cw, 2.3);
    s.addText(st.v, { x: x + 0.2, y: 1.75, w: cw - 0.4, h: 1.15, fontSize: st.size || 48, bold: true, color: st.color || D.C.accent1, align: "center", valign: "middle", margin: 0, fontFace: "Cambria", isTextBox: true });
    s.addText(st.l, { x: x + 0.2, y: 2.95, w: cw - 0.4, h: 0.85, fontSize: 14, color: D.C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  if (o.points) s.addText(bullets(o.points, 16, D.C.text1), { x: MX, y: 4.25, w: W - 2 * MX, h: 2.4, valign: "top", margin: 0, isTextBox: true });
  if (o.notes) s.addNotes(o.notes);
}

function sQuestion(D, o) {
  const s = D.slide("OSCURO"); s.addText(o.title || "Pregunta para la clase", { placeholder: "title" });
  s.addText("?", { x: MX, y: 1.6, w: 1.6, h: 2.2, fontSize: 130, bold: true, color: D.C.accent2, fontFace: "Cambria", margin: 0, isTextBox: true, valign: "top" });
  s.addText(o.q, { x: 2.5, y: 1.7, w: 10.2, h: 2.6, fontSize: 26, color: D.C.background1, margin: 0, valign: "top", isTextBox: true, fontFace: "Cambria" });
  if (o.hint) s.addText([{ text: "Para discutir: ", options: { bold: true, color: D.C.accent2 } }, { text: o.hint, options: { color: "CADCFC" } }], { x: 2.5, y: 4.6, w: 10.2, h: 1.9, fontSize: 16, margin: 0, valign: "top", isTextBox: true });
  if (o.notes) s.addNotes(o.notes);
}

function sLab(D, o) {
  const s = D.slide(); s.addText(o.title || "Laboratorio en Python", { placeholder: "title" });
  card(s, D, MX, 1.5, 4.4, 5.1, D.C.text2);
  s.addText("NOTEBOOK", { x: MX + 0.3, y: 1.75, w: 3.8, h: 0.35, fontSize: 12, bold: true, color: D.C.accent2, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText(o.notebook, { x: MX + 0.3, y: 2.15, w: 3.8, h: 1.6, fontSize: 16, bold: true, color: D.C.background1, margin: 0, valign: "top", isTextBox: true, fontFace: "Consolas" });
  s.addText("DATOS", { x: MX + 0.3, y: 3.9, w: 3.8, h: 0.35, fontSize: 12, bold: true, color: D.C.accent2, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText(o.data.map((d, i) => ({ text: d, options: { breakLine: i < o.data.length - 1 } })), { x: MX + 0.3, y: 4.3, w: 3.8, h: 2.1, fontSize: 13, color: "CADCFC", margin: 0, valign: "top", isTextBox: true });
  const x0 = MX + 4.8, n = o.steps.length, rh = Math.min(0.95, 5.1 / n);
  o.steps.forEach((st, i) => {
    const y = 1.5 + i * rh;
    circle(s, D, x0, y + 0.05, 0.5, i + 1, D.C.accent2, D.C.text2);
    s.addText([{ text: st.h, options: { bold: true, color: D.C.text2, breakLine: true } }, { text: st.t, options: { color: HEX.muted, fontSize: 13 } }],
      { x: x0 + 0.7, y, w: W - MX - x0 - 0.7, h: rh - 0.05, fontSize: 15, margin: 0, valign: "top", isTextBox: true });
  });
  if (o.notes) s.addNotes(o.notes);
}

function sTakeaways(D, o) {
  const s = D.slide("OSCURO"); s.addText(o.title || "Ideas para llevarse", { placeholder: "title" });
  const n = o.items.length, rh = Math.min(1.0, 4.7 / n);
  o.items.forEach((it, i) => {
    const y = 1.55 + i * rh;
    circle(s, D, MX, y + 0.05, 0.55, i + 1, D.C.accent2, D.C.text2);
    s.addText(it, { x: MX + 0.85, y, w: W - 2 * MX - 0.85, h: rh - 0.05, fontSize: 18, color: D.C.background1, margin: 0, valign: "middle", isTextBox: true });
  });
  if (o.next) s.addText([{ text: "Próxima sesión: ", options: { bold: true, color: D.C.accent2 } }, { text: o.next, options: { color: "CADCFC" } }], { x: MX, y: 6.3, w: W - 2 * MX, h: 0.5, fontSize: 15, margin: 0, isTextBox: true });
  if (o.notes) s.addNotes(o.notes);
}

async function save(D, file) {
  await D.pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  console.log("OK", file);
}

module.exports = { newDeck, sTitle, sSection, sAgenda, sCards, sFlow, sFormula, sChart, sTable, sCompare, sStats, sQuestion, sLab, sTakeaways, save, HEX, PCT, PCT1 };
