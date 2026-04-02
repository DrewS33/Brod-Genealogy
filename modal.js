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
    : `<span class="photo-placeholder">${member.emoji}</span>`;

  // --- Badge ---
  const badgeEl = document.getElementById("modal-badge");
  badgeEl.textContent = member.status === "alive"
    ? "Living"
    : member.status === "deceased"
    ? "Deceased"
    : "Unknown";
  badgeEl.style.background =
    member.status === "alive"    ? "rgba(125,184,122,0.35)" :
    member.status === "deceased" ? "rgba(201,169,110,0.35)" :
    "rgba(180,180,180,0.35)";

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
