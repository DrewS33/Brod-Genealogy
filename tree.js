// ============================================================
//  RADIAL FAMILY TREE RENDERER
//  - Full radial view  (default)
//  - Focus view        (click any node to center on that person)
// ============================================================

const SVG_SIZE   = 880;
const CX         = SVG_SIZE / 2;
const CY         = SVG_SIZE / 2;
const PORTRAIT_R = 17;
const DOT_R      = 5;
const YEAR_MIN   = 1888;
const YEAR_MAX   = 2032;
const R_INNER    = 38;
const R_OUTER    = 415;

// ── Global refs (rebuilt each render) ────────────────────────
const NODE_GROUPS = {};  // memberId → <g>
const CONN_PATHS  = {};  // "parentId|childId" → <path>
let   focusMemberId = null;
let   panX = 0, panY = 0;

// ──────────────────────────────────────────────────────────────
//  Coordinate helpers
// ──────────────────────────────────────────────────────────────
function yearToR(yearStr) {
  const y = parseInt(yearStr) || 1950;
  const c = Math.max(YEAR_MIN, Math.min(YEAR_MAX, y));
  return R_INNER + (c - YEAR_MIN) / (YEAR_MAX - YEAR_MIN) * (R_OUTER - R_INNER);
}

// 0° = top, clockwise  →  SVG x,y
function polar(angleDeg, r) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function getStatusColor(s) {
  return s === "alive" ? "#6ab867" : s === "deceased" ? "#d4a843" : "#666666";
}
function getStatusBg(s) {
  return s === "alive" ? "#0d1f0d" : s === "deceased" ? "#1f1a08" : "#141414";
}

// Label rotation so names radiate outward, always readable
function getLabelStyle(angleDeg, nodeR) {
  const gap = nodeR + 5;
  return angleDeg <= 180
    ? { rot: angleDeg - 90, anchor: "end",   offset: -gap }
    : { rot: angleDeg + 90, anchor: "start",  offset:  gap };
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ──────────────────────────────────────────────────────────────
//  Angle assignments for full tree
// ──────────────────────────────────────────────────────────────
const MEMBER_ANGLES = {
  p03: 16,  p07: 22,  p13: 354, p14: 36,
  p04: 91,  p08: 97,  p15: 65,  p16: 92,  p17: 120,
  p05: 160, p18: 146, p19: 178,
  p06: 207, p20: 213,
  p09: 246, p10: 254, p21: 239, p22: 261,
  p11: 299, p12: 308, p23: 292, p24: 319,
};

function getMemberXY(member) {
  if (member.id === "p01" || member.id === "p02") return { x: CX, y: CY };
  const angle = MEMBER_ANGLES[member.id];
  if (angle == null) return { x: CX, y: CY };
  return polar(angle, yearToR(member.born));
}

// ──────────────────────────────────────────────────────────────
//  Lineage highlight helpers
// ──────────────────────────────────────────────────────────────
function getLineage(id) {
  const ancestors = new Set(), descendants = new Set();
  function walkUp(mid) {
    const m = MEMBER_MAP[mid]; if (!m?.parents) return;
    m.parents.forEach(pid => { if (!ancestors.has(pid)) { ancestors.add(pid); walkUp(pid); } });
  }
  function walkDown(mid) {
    const m = MEMBER_MAP[mid]; if (!m?.children) return;
    m.children.forEach(cid => { if (!descendants.has(cid)) { descendants.add(cid); walkDown(cid); } });
  }
  walkUp(id); walkDown(id);
  return new Set([id, ...ancestors, ...descendants]);
}

function highlightLineage(hoveredId) {
  const lineage = getLineage(hoveredId);
  Object.entries(NODE_GROUPS).forEach(([id, g]) => {
    g.style.opacity = lineage.has(id) ? "1" : "0.1";
    g.style.filter  = id === hoveredId ? "url(#node-glow)" : "";
  });
  Object.entries(CONN_PATHS).forEach(([key, path]) => {
    const [pid, cid] = key.split("|");
    const on = lineage.has(pid) && lineage.has(cid);
    path.setAttribute("stroke",       on ? "#6ab867" : "rgba(212,168,67,0.3)");
    path.setAttribute("stroke-width", on ? "3"       : "1.5");
    path.setAttribute("opacity",      on ? "1"       : "0.05");
  });
}

function resetHighlight() {
  Object.values(NODE_GROUPS).forEach(g => { g.style.opacity = "1"; g.style.filter = ""; });
  Object.values(CONN_PATHS).forEach(path => {
    path.setAttribute("stroke",       "rgba(212,168,67,0.35)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("opacity",      "0.75");
  });
}

// ──────────────────────────────────────────────────────────────
//  Focus mode state
// ──────────────────────────────────────────────────────────────
function enterFocusMode(id) {
  focusMemberId = id;
  buildRadialTree();
  showBackButton();
}

function exitFocusMode() {
  focusMemberId = null;
  buildRadialTree();
  hideBackButton();
}

function showBackButton() {
  if (document.getElementById("focus-back-btn")) return;
  const btn = document.createElement("button");
  btn.id        = "focus-back-btn";
  btn.className = "focus-back-btn";
  btn.innerHTML = "&#8592; Full Tree";
  btn.addEventListener("click", exitFocusMode);
  document.getElementById("tree-section").prepend(btn);
}

function hideBackButton() {
  document.getElementById("focus-back-btn")?.remove();
}

// ──────────────────────────────────────────────────────────────
//  Build dispatcher
// ──────────────────────────────────────────────────────────────
function buildRadialTree() {
  Object.keys(NODE_GROUPS).forEach(k => delete NODE_GROUPS[k]);
  Object.keys(CONN_PATHS).forEach(k  => delete CONN_PATHS[k]);
  panX = 0; panY = 0;
  focusMemberId ? buildFocusView(focusMemberId) : buildFullTree();
}

// ──────────────────────────────────────────────────────────────
//  Canvas / SVG setup (shared)
// ──────────────────────────────────────────────────────────────
function createCanvas() {
  const canvas = document.getElementById("tree-canvas");
  canvas.innerHTML = "";
  canvas.style.cssText = `position:relative;width:${SVG_SIZE}px;height:${SVG_SIZE}px;min-width:${SVG_SIZE}px;min-height:${SVG_SIZE}px;`;

  const svg = svgEl("svg", {
    viewBox: `0 0 ${SVG_SIZE} ${SVG_SIZE}`,
    width: SVG_SIZE, height: SVG_SIZE, style: "display:block",
  });
  canvas.appendChild(svg);
  svg.appendChild(svgEl("rect", { width: SVG_SIZE, height: SVG_SIZE, fill: "#0f1117" }));

  // Glow filter
  const defs  = svgEl("defs");
  const glow  = svgEl("filter", { id: "node-glow", x: "-60%", y: "-60%", width: "220%", height: "220%" });
  const blur  = svgEl("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "5", result: "b" });
  const merge = svgEl("feMerge");
  merge.appendChild(svgEl("feMergeNode", { in: "b" }));
  merge.appendChild(svgEl("feMergeNode", { in: "SourceGraphic" }));
  glow.appendChild(blur); glow.appendChild(merge); defs.appendChild(glow);
  svg.appendChild(defs);

  return { svg, defs };
}

// ──────────────────────────────────────────────────────────────
//  Shared node builder
// ──────────────────────────────────────────────────────────────
function buildMemberNode(member, pos, defs, { nodeR, onClick, angle = null, fontSize = 11 }) {
  const color = getStatusColor(member.status);
  const bg    = getStatusBg(member.status);

  const nodeG = svgEl("g", { class: "radial-node", style: "cursor:pointer" });
  nodeG.addEventListener("click", onClick);

  // Generous hit area
  nodeG.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: nodeR + 8, fill: "transparent" }));

  if (member.photo) {
    const clipId = `clip-${member.id}`;
    const clip = svgEl("clipPath", { id: clipId });
    clip.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: nodeR }));
    defs.appendChild(clip);
    nodeG.appendChild(svgEl("image", {
      href: member.photo,
      x: pos.x - nodeR, y: pos.y - nodeR, width: nodeR * 2, height: nodeR * 2,
      "clip-path": `url(#${clipId})`, preserveAspectRatio: "xMidYMid slice",
    }));
  } else {
    nodeG.appendChild(svgEl("circle", { cx: pos.x, cy: pos.y, r: nodeR, fill: bg }));
    if (member.emoji) {
      const em = svgEl("text", {
        x: pos.x, y: pos.y, "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": Math.round(nodeR * 0.95),
        style: "pointer-events:none;user-select:none;",
      });
      em.textContent = member.emoji;
      nodeG.appendChild(em);
    }
  }

  // Status ring
  const ring = svgEl("circle", {
    cx: pos.x, cy: pos.y, r: nodeR, fill: "none", stroke: color, "stroke-width": 2,
  });
  nodeG.appendChild(ring);

  // Rotated name label (only when angle is provided)
  if (angle != null) {
    const ls = getLabelStyle(angle, nodeR);
    const txt = svgEl("text", {
      x: pos.x, y: pos.y,
      "text-anchor": ls.anchor, "dominant-baseline": "middle",
      "font-size": fontSize, fill: "#c8b88a",
      "font-family": "Playfair Display, Georgia, serif",
      style: "pointer-events:none;user-select:none;",
      transform: `rotate(${ls.rot}, ${pos.x}, ${pos.y}) translate(${ls.offset}, 0)`,
    });
    txt.textContent = member.firstName;
    nodeG.appendChild(txt);
  }

  // Hover: thicken ring + lineage highlight
  nodeG.addEventListener("mouseenter", () => {
    ring.setAttribute("stroke-width", "3.5");
    highlightLineage(member.id);
  });
  nodeG.addEventListener("mouseleave", () => {
    ring.setAttribute("stroke-width", "2");
    resetHighlight();
  });

  return nodeG;
}

// ──────────────────────────────────────────────────────────────
//  Connection path helper
// ──────────────────────────────────────────────────────────────
function addConnection(svg, parentPos, childPos, key, opts = {}) {
  const mx  = (parentPos.x + childPos.x) / 2;
  const my  = (parentPos.y + childPos.y) / 2;
  const cpx = mx + (CX - mx) * 0.45;
  const cpy = my + (CY - my) * 0.45;
  const path = svgEl("path", {
    d: `M ${parentPos.x} ${parentPos.y} Q ${cpx} ${cpy} ${childPos.x} ${childPos.y}`,
    fill: "none",
    stroke:           opts.stroke       ?? "rgba(212,168,67,0.35)",
    "stroke-width":   opts.strokeWidth  ?? "2",
    "stroke-linecap": "round",
    opacity:          opts.opacity      ?? "0.75",
    ...(opts.dash ? { "stroke-dasharray": opts.dash } : {}),
  });
  CONN_PATHS[key] = path;
  svg.appendChild(path);
  return path;
}

// ──────────────────────────────────────────────────────────────
//  Full radial tree
// ──────────────────────────────────────────────────────────────
function buildFullTree() {
  const { svg, defs } = createCanvas();

  // Year rings
  const ringsG = svgEl("g");
  for (let year = 1900; year <= 2020; year += 10) {
    const r = yearToR(year);
    ringsG.appendChild(svgEl("circle", {
      cx: CX, cy: CY, r, fill: "none", stroke: "rgba(212,168,67,0.15)",
      "stroke-width": 0.8, "stroke-dasharray": "3,6", opacity: 1,
    }));
    const lp  = polar(0, r);
    const lbl = svgEl("text", {
      x: lp.x, y: lp.y - 5, "text-anchor": "middle",
      "font-size": 9, fill: "rgba(212,168,67,0.4)", opacity: 1,
      "font-family": "Playfair Display, Georgia, serif",
    });
    lbl.textContent = year;
    ringsG.appendChild(lbl);
  }
  svg.appendChild(ringsG);

  // Connection lines
  const connG = svgEl("g");
  FAMILY_DATA.members.forEach(member => {
    if (!member.parents?.length) return;
    const cp = getMemberXY(member);
    member.parents.forEach(pid => {
      const parent = MEMBER_MAP[pid];
      if (!parent) return;
      addConnection(connG, getMemberXY(parent), cp, `${pid}|${member.id}`);
    });
  });
  svg.appendChild(connG);

  // Person nodes
  const nodesG = svgEl("g");
  let nodeIdx = 0;
  FAMILY_DATA.members.forEach(member => {
    if (member.id === "p01" || member.id === "p02") return;
    const angle = MEMBER_ANGLES[member.id];
    if (angle == null) return;
    const pos   = getMemberXY(member);
    const nodeR = (member.photo || member.emoji) ? PORTRAIT_R : DOT_R;
    const nodeG = buildMemberNode(member, pos, defs, {
      nodeR, angle,
      onClick: () => enterFocusMode(member.id),
    });
    nodeG.style.animationDelay = `${(nodeIdx * 0.04).toFixed(2)}s`;
    nodeIdx++;
    NODE_GROUPS[member.id] = nodeG;
    nodesG.appendChild(nodeG);
  });
  svg.appendChild(nodesG);

  // Center couple
  const R = 23;
  [["p01", CX - R * 0.82], ["p02", CX + R * 0.82]].forEach(([id, cx], i) => {
    const member = MEMBER_MAP[id];
    if (!member) return;
    const nodeG = buildMemberNode(member, { x: cx, y: CY }, defs, {
      nodeR: R,
      onClick: () => enterFocusMode(id),
    });
    nodeG.style.animationDelay = `${((nodeIdx + i) * 0.04).toFixed(2)}s`;
    NODE_GROUPS[id] = nodeG;
    svg.appendChild(nodeG);
  });

  // Shared label for center couple
  const lblG = svgEl("g", { style: "pointer-events:none" });
  const n = svgEl("text", {
    x: CX, y: CY - R - 12, "text-anchor": "middle",
    "font-size": 13, "font-weight": "bold", fill: "#d4a843",
    "font-family": "Playfair Display, Georgia, serif",
  });
  n.textContent = "James & Clara";
  lblG.appendChild(n);
  const s = svgEl("text", {
    x: CX, y: CY + R + 18, "text-anchor": "middle",
    "font-size": 10, fill: "rgba(212,168,67,0.6)",
    "font-family": "Inter, sans-serif",
  });
  s.textContent = "Hartwell";
  lblG.appendChild(s);
  svg.appendChild(lblG);
}

// ──────────────────────────────────────────────────────────────
//  Focus view
//  Parents/spouse → inner ring (below center, "roots" direction)
//  Children       → outer ring (above center, "branches" direction)
// ──────────────────────────────────────────────────────────────
function buildFocusView(memberId) {
  const member = MEMBER_MAP[memberId];
  if (!member) return;

  const { svg, defs } = createCanvas();

  const INNER_R   = 170;
  const OUTER_R   = 300;
  const CENTER_R  = 30;

  // Guide rings
  [INNER_R, OUTER_R].forEach(r => {
    svg.appendChild(svgEl("circle", {
      cx: CX, cy: CY, r, fill: "none", stroke: "rgba(212,168,67,0.18)",
      "stroke-width": 1, "stroke-dasharray": "6,6", opacity: 1,
    }));
  });

  // Collect people
  const innerPeople = [];
  const outerPeople = [];

  (member.parents || []).forEach(pid => {
    const p = MEMBER_MAP[pid];
    if (p) innerPeople.push({ m: p, isSpouse: false });
  });
  if (member.spouseId) {
    const sp = MEMBER_MAP[member.spouseId];
    if (sp && !innerPeople.find(x => x.m.id === sp.id)) {
      innerPeople.push({ m: sp, isSpouse: true });
    }
  }
  (member.children || []).forEach(cid => {
    const c = MEMBER_MAP[cid]; if (c) outerPeople.push(c);
  });

  // Evenly spread angles around a center angle with adaptive spread
  function spread(count, center, max = 160) {
    if (count === 0) return [];
    if (count === 1) return [center];
    const arc  = Math.min(max, count * 44);
    const step = arc / (count - 1);
    return Array.from({ length: count }, (_, i) => center - arc / 2 + i * step);
  }

  // Inner ring — centered at 180° (below center = "roots")
  const innerAngles = spread(innerPeople.length, 180, 150);
  innerPeople.forEach(({ m, isSpouse }, i) => {
    const pos = polar(innerAngles[i], INNER_R);
    addConnection(svg, { x: CX, y: CY }, pos, `${m.id}|${memberId}`, {
      stroke:      isSpouse ? "rgba(212,168,67,0.5)" : "rgba(212,168,67,0.35)",
      dash:        isSpouse ? "5,4"                  : undefined,
    });
    const nodeG = buildMemberNode(m, pos, defs, {
      nodeR: PORTRAIT_R, angle: innerAngles[i],
      onClick: () => enterFocusMode(m.id),
    });
    nodeG.style.animationDelay = `${(i * 0.08).toFixed(2)}s`;
    NODE_GROUPS[m.id] = nodeG;
    svg.appendChild(nodeG);
  });

  // Outer ring — centered at 0° (above center = "branches")
  const outerAngles = spread(outerPeople.length, 0, 180);
  outerPeople.forEach((m, i) => {
    const pos = polar(outerAngles[i], OUTER_R);
    addConnection(svg, { x: CX, y: CY }, pos, `${memberId}|${m.id}`);
    const nodeG = buildMemberNode(m, pos, defs, {
      nodeR: PORTRAIT_R, angle: outerAngles[i],
      onClick: () => enterFocusMode(m.id),
    });
    nodeG.style.animationDelay = `${(i * 0.08).toFixed(2)}s`;
    NODE_GROUPS[m.id] = nodeG;
    svg.appendChild(nodeG);
  });

  // Center node (large) — click opens profile modal
  const centerG = buildMemberNode(member, { x: CX, y: CY }, defs, {
    nodeR: CENTER_R,
    onClick: () => openModal(member.id),
  });
  NODE_GROUPS[member.id] = centerG;
  svg.appendChild(centerG);

  // Center labels
  const clbls = svgEl("g", { style: "pointer-events:none" });

  const nm = svgEl("text", {
    x: CX, y: CY + CENTER_R + 18, "text-anchor": "middle",
    "font-size": 14, "font-weight": "bold", fill: "#d4a843",
    "font-family": "Playfair Display, Georgia, serif",
  });
  nm.textContent = member.firstName + " " + member.lastName;
  clbls.appendChild(nm);

  const hint = svgEl("text", {
    x: CX, y: CY + CENTER_R + 34, "text-anchor": "middle",
    "font-size": 10, fill: "rgba(212,168,67,0.5)", "font-family": "Inter, sans-serif",
  });
  hint.textContent = "Click to view profile";
  clbls.appendChild(hint);

  svg.appendChild(clbls);

  // Ring labels
  function ringLabel(text, y) {
    const lbl = svgEl("text", {
      x: CX, y, "text-anchor": "middle",
      "font-size": 9, fill: "rgba(212,168,67,0.45)", "letter-spacing": "1",
      "font-family": "Inter, sans-serif", style: "pointer-events:none",
    });
    lbl.textContent = text.toUpperCase();
    svg.appendChild(lbl);
  }
  if (innerPeople.length) ringLabel("Parents & Spouse", CY + INNER_R + 16);
  if (outerPeople.length) ringLabel("Children",         CY - OUTER_R - 8);
}

// ──────────────────────────────────────────────────────────────
//  Scroll helper
// ──────────────────────────────────────────────────────────────
function scrollToTree() {
  document.getElementById("tree-section").scrollIntoView({ behavior: "smooth" });
}

// ============================================================
//  ZOOM
// ============================================================
let zoomLevel = 1.0;
const ZOOM_MIN = 0.3, ZOOM_MAX = 2.0, ZOOM_STEP = 0.1;

function applyTransform() {
  const canvas = document.getElementById("tree-canvas");
  if (!canvas) return;
  canvas.style.transformOrigin = "top center";
  canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  const wrapper = document.querySelector(".tree-scroll-wrapper");
  if (wrapper) wrapper.style.height = (SVG_SIZE * zoomLevel + 60) + "px";
  updateZoomLabel();
}

function applyZoom() { applyTransform(); }

function updateZoomLabel() {
  const el = document.getElementById("zoom-label");
  if (el) el.textContent = Math.round(zoomLevel * 100) + "%";
}

function zoomIn()    { zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2)); applyZoom(); }
function zoomOut()   { zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2)); applyZoom(); }
function zoomReset() { zoomLevel = 1.0; applyZoom(); }

function initZoom() {
  const section = document.getElementById("tree-section");
  if (!section) return;
  section.addEventListener("wheel", e => { e.preventDefault(); e.deltaY < 0 ? zoomIn() : zoomOut(); }, { passive: false });

  let lastDist = null;
  section.addEventListener("touchmove", e => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastDist !== null) {
      zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoomLevel + (dist - lastDist) * 0.003).toFixed(3)));
      applyZoom();
    }
    lastDist = dist;
  }, { passive: false });
  section.addEventListener("touchend", () => { lastDist = null; });

  const controls = document.createElement("div");
  controls.className = "zoom-controls";
  controls.innerHTML = `
    <button class="zoom-btn" onclick="zoomOut()">−</button>
    <span class="zoom-label" id="zoom-label">100%</span>
    <button class="zoom-btn" onclick="zoomIn()">+</button>
    <button class="zoom-btn zoom-reset" onclick="zoomReset()">⊙</button>
  `;
  section.style.position = "relative";
  section.appendChild(controls);
}

// ============================================================
//  PAN  (transform-based — works regardless of overflow/flex)
// ============================================================
function initPan() {
  const wrapper = document.querySelector(".tree-scroll-wrapper");
  if (!wrapper) return;
  let isDragging = false, dragMoved = false, startX, startY, startPanX, startPanY;
  const DRAG_THRESHOLD = 5;

  const isInteractable = el =>
    el.closest(".radial-node") || el.closest(".zoom-controls") || el.closest(".focus-back-btn");

  wrapper.addEventListener("mousedown", e => {
    if (isInteractable(e.target)) return;
    isDragging = true; dragMoved = false;
    startX = e.clientX; startY = e.clientY;
    startPanX = panX; startPanY = panY;
    wrapper.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!dragMoved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    dragMoved = true;
    panX = startPanX + dx;
    panY = startPanY + dy;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.cursor = "grab";
  });

  wrapper.style.cursor = "grab";
  wrapper.addEventListener("click", e => {
    if (dragMoved && !isInteractable(e.target)) e.stopPropagation();
  }, true);
}

// ============================================================
//  INIT
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
  buildRadialTree();
  initZoom();
  initPan();
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && focusMemberId) exitFocusMode();
  });
});

window.addEventListener("resize", () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(() => { buildRadialTree(); applyZoom(); }, 250);
});
