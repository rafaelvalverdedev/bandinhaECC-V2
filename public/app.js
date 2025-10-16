// ======= ELEMENTOS =======
const gridEl = document.getElementById("grid");
const modal = document.getElementById("modal");
const audio = document.getElementById("audio");
const btnClose = document.getElementById("btnClose");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");

const rowById = new Map();
let currentTrack = null;

// ======= FUNÇÕES AUXILIARES =======
function resolveUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return new URL(url.replace(/^\/+/, ""), window.location.href).toString();
}

// ======= RENDER =======
function render() {
  gridEl.innerHTML = "";

  COLUMNS.forEach((col) => {
    const colEl = document.createElement("section");
    colEl.className = "column";

    const head = document.createElement("div");
    head.className = "col-header";
    head.textContent = col.title;
    colEl.appendChild(head);

    col.items.forEach((it, idx) => {
      // Seção (PÁTIO, PLENÁRIO, etc)
      if (it.type === "section") {
        const s = document.createElement("div");
        s.className = "section-row";
        s.innerHTML = `
          <div class="cell time">${it.time || ""}</div>
          <div class="cell title">${it.label}</div>
          <div class="cell right">${it.duration || ""}</div>
          <div class="cell right">${it.pagHead}</div>
        `;
        colEl.appendChild(s);
        return;
      }

      // Nota
      if (it.type === "note") {
        const n = document.createElement("div");
        n.className = "note-row";
        n.innerHTML = `<div class="cell title-note">${it.label}</div>`;
        colEl.appendChild(n);
        return;
      }

      // Música
      const r = document.createElement("div");
      r.className = "row";
      r.setAttribute("data-id", it.id);
      if (!it.url) r.classList.add("no-url");

      const playIcon = `<span class="play-icon">

      <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 1C2.79086 1 1 2.79086 1 5V19C1 21.2091 2.79086 23 5 23H19C21.2091 23 23 21.2091 23 19V5C23 2.79086 21.2091 1 19 1H5Z"
    fill="currentColor"
  />
  <path d="M16 12L10 16.3301V7.66987L16 12Z" fill="currentColor" />
</svg>

</span>`;
      const titleContent = it.lyrics
        ? `<div class="title-main">${it.title}</div><div class="title-lyrics">${it.lyrics}</div>`
        : `<div class="title-main">${it.title}</div>`;

      r.innerHTML = `
        <div class="cell time">${it.time}</div>
        <div class="cell titleContent"> ${playIcon} <span class="title-text">${titleContent}</span></div>
        <div class="cell right">${it.tone}</div>
        <div class="cell right">${it.page ?? ""}</div>
      `;

      // Evento de play
      if (it.url) {
        const playIconEl = r.querySelector(".play-icon");
        playIconEl.addEventListener("click", () => openModal(it));
      }

      rowById.set(it.id, r);
      colEl.appendChild(r);
    });

    gridEl.appendChild(colEl);
  });
}

// ======= PLAYER =======
function openModal(track) {
  currentTrack = track;

  trackTitle.textContent = track.title;
  const meta = [];
  if (track.time) meta.push(`Horário: ${track.time}`);
  if (track.tone) meta.push(`Tom: ${track.tone}`);
  if (track.page) meta.push(`Pág: ${track.page}`);
  trackMeta.textContent = meta.join(" · ");

  audio.src = resolveUrl(track.url);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  audio.play().then(() => {
    rowById.get(track.id)?.classList.add("playing");
  });
}

function closeModal() {
  audio.pause();
  audio.currentTime = 0;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  rowById.forEach(el => el.classList.remove("playing"));
}

// Eventos do modal
btnClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});



audio.addEventListener("play", () => {
  if (currentTrack) rowById.get(currentTrack.id)?.classList.add("playing");
});

audio.addEventListener("pause", () => {
});

audio.addEventListener("ended", () => {
  rowById.forEach(el => el.classList.remove("playing"));
});

// ======= INICIALIZAR =======
document.addEventListener("DOMContentLoaded", render);




// ======= EDIÇÃO =======
// ======= EDIÇÃO =======
// ======= EDIÇÃO =======

/*
document.addEventListener("dblclick", function (e) {
  const titleMain = e.target.closest(".title-main");
  const titleLyrics = e.target.closest(".title-lyrics");
  const row = e.target.closest(".row");

  if ((!titleMain && !titleLyrics) || !row) return;

  const trackId = row.dataset.id;
  const isLyrics = !!titleLyrics;
  const target = isLyrics ? titleLyrics : titleMain;
  const original = target.textContent.trim();

  if (target.querySelector("input")) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = original;
  input.className = "edit-input";
  input.placeholder = isLyrics ? "Como começa..." : "Título";

  target.textContent = "";
  target.appendChild(input);
  input.focus();
  input.select();

  const save = () => {
    const newValue = input.value.trim() || original;
    target.textContent = newValue;

    // Atualizar COLUMNS
    for (const col of COLUMNS) {
      for (const item of col.items) {
        if (item.id === trackId) {
          if (isLyrics) {
            item.lyrics = newValue;
          } else {
            item.title = newValue;
          }
        }
      }
    }

    // Salvar no servidor
    fetch("/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ COLUMNS })
    }).catch(err => console.error("Erro ao salvar:", err));
  };

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") target.textContent = original;
    if (ev.key === "Enter") save();
  });
  input.addEventListener("blur", save);
});

*/