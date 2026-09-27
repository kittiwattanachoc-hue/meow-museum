const state = {
  facts: [],
  filtered: [],
  category: "ทั้งหมด",
  stack: [],
  modalFact: null
};

const els = {
  cards: document.querySelector("#cards"),
  search: document.querySelector("#searchInput"),
  sort: document.querySelector("#sortSelect"),
  filters: document.querySelector("#filters"),
  factCount: document.querySelector("#factCount"),
  categoryCount: document.querySelector("#categoryCount"),
  stackCount: document.querySelector("#stackCount"),
  visibleCount: document.querySelector("#visibleCount"),
  totalCount: document.querySelector("#totalCount"),
  stackSize: document.querySelector("#stackSize"),
  stackPreview: document.querySelector("#stackPreview"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#factModal"),
  modalCategory: document.querySelector("#modalCategory"),
  modalCat: document.querySelector("#modalCat"),
  modalName: document.querySelector("#modalName"),
  modalEnglish: document.querySelector("#modalEnglish"),
  modalDetails: document.querySelector("#modalDetails"),
  modalClose: document.querySelector("#modalClose")
};

const categoryClass = {
  "การนอน": "sleep",
  "พฤติกรรม": "behavior",
  "ร่างกาย": "body",
  "ประสาทสัมผัส": "sense",
  "ประวัติศาสตร์": "history",
  "ทั่วไป": "behavior"
};

const catEmoji = ["🐱", "😺", "😸", "😻", "😼", "😽", "🙀", "😿"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeFact(fact) {
  if (!fact) return fact;

  const text = fact.text || fact.th || fact.title || "ข้อเท็จจริงแมว";
  const detail = fact.detail || fact.summary || text;

  return {
    ...fact,
    text,
    th: fact.th || text,
    title: fact.title || text,
    category: fact.category || "ทั่วไป",
    detail,
    image: fact.image || buildCatImage(fact.id ?? 1, fact.category || "ทั่วไป", fact.cat || "🐱")
  };
}

function buildCatImage(id, category, cat) {
  const palette = {
    "การนอน": ["#ffd7a6", "#f6b771"],
    "พฤติกรรม": ["#d9c5ff", "#b39ae9"],
    "ร่างกาย": ["#ffc1cf", "#faa1b9"],
    "ประสาทสัมผัส": ["#cfe2ff", "#a5c7ff"],
    "ประวัติศาสตร์": ["#c7f2d3", "#8ad9a4"],
    "ทั่วไป": ["#d8d9ff", "#b7b8f7"]
  };

  const [light, dark] = palette[category] || palette["ทั่วไป"];
  const accent = cat || "🐱";
  const patternX = (id * 73) % 180;
  const patternY = (id * 53) % 130;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${light}"/>
          <stop offset="100%" stop-color="${dark}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#g)"/>
      <circle cx="${120 + patternX}" cy="${100 + patternY}" r="110" fill="rgba(255,255,255,0.15)"/>
      <circle cx="${620 - patternX}" cy="${110 + patternY}" r="130" fill="rgba(255,255,255,0.10)"/>
      <path d="M0 360 Q180 300 360 360 T800 355 L800 480 L0 480 Z" fill="rgba(255,255,255,0.16)"/>
      <text x="400" y="255" text-anchor="middle" font-size="180" dominant-baseline="middle">${accent}</text>
      <text x="40" y="420" font-size="28" fill="rgba(26,26,58,0.75)" font-family="Arial, Helvetica, sans-serif">${category}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function loadFacts() {
  try {
    const algo = els.sort.value;
    const res = await fetch(`/facts?sort=${algo}`);
    if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

    const data = await res.json();
    state.facts = (data.data || []).map(normalizeFact);
    applyFilters();

    const algorithmNames = {
      selection: "เรียงแบบเลือก",
      insertion: "เรียงแบบแทรก",
      bubble: "เรียงแบบฟองสบู่"
    };

    document.querySelector("#sortInfo").textContent =
      `${algorithmNames[data.algorithm] || "เรียงข้อมูล"} · ${data.count} ข้อเท็จจริง · ${data.ms} มิลลิวินาที`;
  } catch (error) {
    showError(error.message);
  }
}

function applyFilters() {
  const query = els.search.value.trim().toLowerCase();

  state.filtered = state.facts.filter(fact => {
    const categoryOK = state.category === "ทั้งหมด" || fact.category === state.category;
    const combinedText = `${fact.text || ""} ${fact.th || ""} ${fact.category || ""}`.toLowerCase();
    const searchOK = !query || combinedText.includes(query);
    return categoryOK && searchOK;
  });

  renderCards();
  updateStats();
}

function renderCards() {
  if (!state.filtered.length) {
    els.cards.innerHTML = '<div class="empty">ไม่พบข้อเท็จจริงที่ตรงกับคำค้นหา</div>';
    return;
  }

  els.cards.innerHTML = state.filtered.map((fact, index) => {
    const added = state.stack.some(x => x.id === fact.id);
    const text = fact.th || fact.text || "ข้อเท็จจริงแมว";
    const category = fact.category || "ทั่วไป";
    const image = fact.image || buildCatImage(fact.id ?? index, category, fact.cat || "🐱");

    return `
      <article class="card" data-id="${fact.id}">
        <div class="card-top ${categoryClass[category] || "behavior"}">
          <span class="badge">${escapeHtml(category)}</span>
          <div class="cat-illustration">
            <img
              src="${escapeHtml(image)}"
              alt="รูปน้องแมวเกี่ยวกับ ${escapeHtml(category)}"
              loading="lazy"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >
            <span class="cat-fallback">${fact.cat || catEmoji[index % catEmoji.length]}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-title">${escapeHtml(text)}</div>

          <div class="card-footer">
            <span class="meta">${text.length} ตัวอักษร</span>
            <button
              class="stack-add ${added ? "added" : ""}"
              type="button"
              onclick="event.stopPropagation(); addToStack(${fact.id})">
              ${added ? "อยู่ในกอง" : "ใส่ในกอง"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("click", () => openFactModal(state.filtered[index]));
  });
}

function updateStats() {
  const factCount = state.facts.length;
  const categorySet = new Set(state.facts.map(x => x.category));

  els.factCount.textContent = factCount;
  els.totalCount.textContent = factCount;
  els.visibleCount.textContent = state.filtered.length;
  els.stackCount.textContent = state.stack.length;
  els.stackSize.textContent = state.stack.length;
  els.categoryCount.textContent = categorySet.size;

  const top = state.stack[state.stack.length - 1];
  els.stackPreview.innerHTML = top
    ? `<strong>${escapeHtml(top.th || top.text || "ข้อมูล")}</strong>`
    : 'Stack ว่าง กด “ใส่ในกอง” ที่การ์ดได้เลย';
}

function openFactModal(fact) {
  if (!fact) return;

  state.modalFact = fact;
  const title = fact.th || fact.text || "ข้อเท็จจริงแมว";
  const category = fact.category || "ทั่วไป";
  const summary = fact.detail || fact.text || "รายละเอียด";
  const brief = summary.length > 120 ? `${summary.slice(0, 120).trim()}…` : summary;

  els.modalCategory.textContent = category;
  els.modalCat.innerHTML = fact.image
    ? `<img src="${escapeHtml(fact.image)}" alt="รูปน้องแมว" onerror="this.outerHTML='🐱';">`
    : (fact.cat || "🐱");
  els.modalName.textContent = title;
  els.modalEnglish.textContent = brief;

  const fragment = document.createElement("ul");
  const detailExtra = document.createElement("li");
  detailExtra.className = "detail-extra";
  detailExtra.hidden = true;
  detailExtra.innerHTML = `<strong>ข้อมูลเต็ม:</strong> ${escapeHtml(summary)}`;

  const briefItem = document.createElement("li");
  briefItem.innerHTML = `<strong>สรุปย่อ:</strong> ${escapeHtml(brief)}`;

  const categoryItem = document.createElement("li");
  categoryItem.innerHTML = `<strong>หมวดหมู่:</strong> ${escapeHtml(category)}`;

  const toggleWrap = document.createElement("li");
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.textContent = "ดูข้อมูลเต็ม";
  toggleButton.style.cssText = "margin-top: 6px; width: 100%; border: 0; border-radius: 10px; background: linear-gradient(135deg,#8c7bff,#ba77f8); color: white; padding: 10px 12px; font-weight: 700; cursor: pointer;";

  toggleButton.addEventListener("click", () => {
    const hidden = detailExtra.hidden;
    detailExtra.hidden = !hidden;
    toggleButton.textContent = hidden ? "ซ่อนข้อมูลเต็ม" : "ดูข้อมูลเต็ม";
  });

  fragment.append(categoryItem, briefItem, detailExtra, toggleWrap);
  toggleWrap.appendChild(toggleButton);
  els.modalDetails.replaceChildren(...fragment.children);

  els.modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeFactModal() {
  els.modal.classList.remove("show");
  document.body.style.overflow = "";
}

async function addToStack(id) {
  try {
    const res = await fetch("/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "เพิ่มข้อมูลไม่สำเร็จ");

    await refreshStack();
    showToast("เพิ่มข้อมูลลง Stack แล้ว 🐾");
  } catch (error) {
    showError(error.message);
  }
}

async function popStack() {
  try {
    const res = await fetch("/watchlist/process", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ไม่สามารถหยิบออกจาก Stack ได้");

    await refreshStack();
    showToast(data.message || "หยิบออกจาก Stack แล้ว");
  } catch (error) {
    showError(error.message);
  }
}

async function undo() {
  try {
    const res = await fetch("/undo", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ย้อนกลับไม่สำเร็จ");

    await refreshStack();
    showToast(data.message || "ย้อนกลับการทำงานแล้ว");
  } catch (error) {
    showError(error.message);
  }
}

async function refreshStack() {
  const res = await fetch("/watchlist");
  const data = await res.json();
  state.stack = data.items || [];
  updateStats();
  renderCards();
}

function shuffleFacts() {
  const next = [...state.facts].sort(() => Math.random() - 0.5);
  state.facts = next;
  applyFilters();
  showToast("สุ่มลำดับแล้ว ✨");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function showError(message) {
  const error = document.querySelector("#error");
  error.textContent = message || "";
  error.classList.toggle("show", Boolean(message));
}

els.search.addEventListener("input", applyFilters);
els.sort.addEventListener("change", loadFacts);

els.filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
  button.classList.add("active");
  state.category = button.dataset.category;
  applyFilters();
});

document.querySelector("#shuffleBtn").addEventListener("click", shuffleFacts);
document.querySelector("#popBtn").addEventListener("click", popStack);
document.querySelector("#undoBtn").addEventListener("click", undo);
document.querySelector("#clearBtn").addEventListener("click", async () => {
  while (state.stack?.length) await popStack();
  showToast("ล้าง Stack แล้ว");
});

document.querySelector("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

els.modalClose.addEventListener("click", closeFactModal);

els.modal.addEventListener("click", event => {
  if (event.target.id === "factModal") closeFactModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeFactModal();
});

window.addEventListener("load", async () => {
  await loadFacts();
  await refreshStack();
});
