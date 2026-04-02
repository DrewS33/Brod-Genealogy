// ============================================================
//  MODAL — Person Detail Panel
//  Opens when a person card is clicked.
//  Displays photo, name, dates, bio, and family relations.
// ============================================================

function openModal(memberId) {
  const member = MEMBER_MAP[memberId];
  if (!member) return;

  // --- Photo ---
  const photoEl = document.getElementById("modal-photo");
  photoEl.innerHTML = member.photo
    ? `<img src="${member.photo}" alt="Photo of ${member.firstName}" />`
    : `<span class="photo-placeholder"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="27" r="15" fill="currentColor"/><path d="M10 74c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="currentColor"/></svg></span>`;

  // --- Badge ---
  const badgeEl = document.getElementById("modal-badge");
  badgeEl.textContent = member.status === "alive"
    ? "Living"
    : member.status === "deceased"
    ? "Deceased"
    : "Unknown";
  badgeEl.style.background =
    member.status === "alive"    ? "rgba(106,184,103,0.12)" :
    member.status === "deceased" ? "rgba(212,168,67,0.12)"  :
    "rgba(255,255,255,0.06)";
  badgeEl.style.color =
    member.status === "alive"    ? "#6ab867" :
    member.status === "deceased" ? "#d4a843" :
    "#9a8d72";
  badgeEl.style.borderColor =
    member.status === "alive"    ? "rgba(106,184,103,0.35)" :
    member.status === "deceased" ? "rgba(212,168,67,0.35)"  :
    "rgba(255,255,255,0.12)";

  // --- Name ---
  document.getElementById("modal-name").textContent =
    `${member.firstName} ${member.lastName}`;

  // --- Dates ---
  const datesEl = document.getElementById("modal-dates");
  if (member.born || member.died) {
    let datesHtml = "";
    if (member.born) datesHtml += `<span>Born:</span> ${member.born}`;
    if (member.died) datesHtml += `&ensp;|&ensp;<span>Died:</span> ${member.died}`;
    if (member.born && !member.died && member.status === "alive") {
      const birthYear = parseInt(member.born);
      const now = new Date();
      const age = now.getFullYear() - birthYear;
      datesHtml += `&ensp;(Age ${age - 1}–${age})`;
    }
    datesEl.innerHTML = datesHtml;
    datesEl.style.display = "";
  } else {
    datesEl.textContent = "Birth and death dates unknown";
  }

  // --- Lifespan Timeline ---
  const timelineEl = document.getElementById("modal-timeline");
  if (member.born && timelineEl) {
    const TSTART = 1895, TEND = 2030, TRANGE = TEND - TSTART;
    const bornY  = parseInt(member.born);
    const endY   = member.died ? parseInt(member.died) : new Date().getFullYear();
    const leftPct  = Math.max(0, ((bornY - TSTART) / TRANGE) * 100);
    const widthPct = Math.min(((endY - bornY) / TRANGE) * 100, 100 - leftPct);
    document.getElementById("modal-timeline-bar").style.left  = leftPct + "%";
    document.getElementById("modal-timeline-bar").style.width = widthPct + "%";
    document.getElementById("modal-timeline-born").textContent = member.born;
    document.getElementById("modal-timeline-end").textContent  = member.died || "Present";
    timelineEl.style.display = "";
  } else if (timelineEl) {
    timelineEl.style.display = "none";
  }

  // --- Location ---
  const locEl = document.getElementById("modal-location");
  if (member.birthplace) {
    locEl.innerHTML = `📍 ${member.birthplace}`;
    locEl.style.display = "";
  } else {
    locEl.style.display = "none";
  }

  // --- Bio ---
  document.getElementById("modal-bio").textContent =
    member.bio || "No biography recorded yet.";

  // --- Family Relations ---
  const relEl = document.getElementById("modal-relations");
  const lines = [];

  if (member.spouse) {
    lines.push(`<strong>Spouse:</strong> ${member.spouse}`);
  }

  if (member.parents && member.parents.length > 0) {
    const parentNames = member.parents
      .map(pid => MEMBER_MAP[pid])
      .filter(Boolean)
      .map(p => `${p.firstName} ${p.lastName}`)
      .join(" &amp; ");
    if (parentNames) lines.push(`<strong>Parents:</strong> ${parentNames}`);
  }

  if (member.children && member.children.length > 0) {
    const childNames = member.children
      .map(cid => MEMBER_MAP[cid])
      .filter(Boolean)
      .map(c => `${c.firstName} ${c.lastName}`)
      .join(", ");
    if (childNames) lines.push(`<strong>Children:</strong> ${childNames}`);
  }

  if (member.role) {
    lines.push(`<strong>Family Role:</strong> ${member.role}`);
  }

  if (lines.length > 0) {
    relEl.innerHTML = lines.join("<br />");
    relEl.style.display = "";
  } else {
    relEl.style.display = "none";
  }

  // --- Show modal ---
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // Focus the close button for accessibility
  setTimeout(() => {
    document.querySelector(".modal-close")?.focus();
  }, 100);
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Close on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
