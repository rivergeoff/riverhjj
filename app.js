(() => {
  const data = window.PORTFOLIO;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const p = data.profile;

  // ── Image slot: shows the image, or a labelled placeholder if the file is missing
  function media(src, label) {
    const box = el("div", "media");
    const ph = el("div", "media-ph");
    ph.append(el("span", "media-ph-icon", "＋"), el("span", null, "Add " + src));
    box.append(ph);
    const img = new Image();
    img.alt = label;
    img.loading = "lazy";
    img.onload = () => box.classList.add("loaded");
    img.src = src;
    box.append(img);
    return box;
  }

  function avatar(node) {
    const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
    node.textContent = initials;
    const img = new Image();
    img.alt = p.name;
    img.onload = () => { node.textContent = ""; node.append(img); };
    img.src = p.photo;
  }

  // ── Profile / overview
  document.title = `${p.name} — Portfolio '26`;
  $("#hero-name").textContent = p.name;
  $("#hero-tagline").textContent = p.tagline;
  $("#hero-status").textContent = p.status;
  $("#status-text").textContent = p.status;
  avatar($("#hero-avatar"));
  avatar($("#about-avatar"));

  data.stats.forEach((s) => {
    const c = el("div", "card stat");
    c.append(el("strong", null, s.value), el("span", "muted", s.label));
    $("#stats").append(c);
  });

  // ── About
  $("#about-name").textContent = p.name;
  $("#about-role").textContent = `${p.role} · ${p.location}`;
  data.about.forEach((t) => $("#about-copy").append(el("p", null, t)));
  data.details.forEach((d) => {
    const row = el("div");
    row.append(el("dt", null, d.label), el("dd", null, d.value));
    $("#details").append(row);
  });
  data.experience.forEach((x) => {
    const li = el("li");
    const body = el("div");
    body.append(el("strong", null, x.title), el("span", "muted", x.org));
    li.append(el("span", "year", x.years), body);
    $("#experience").append(li);
  });
  data.skills.work.forEach((s) => $("#skills-work").append(el("span", "chip", s)));
  data.skills.soft.forEach((s) => $("#skills-soft").append(el("span", "chip ghost", s)));

  // ── Contact
  $("#c-email").textContent = p.email;
  $("#c-phone").textContent = p.phone;
  $("#c-location").textContent = p.location;
  p.links.forEach((l) => {
    const a = el("a", "chip", l.label + " ↗");
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener";
    $("#socials").append(a);
  });
  $("#copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      $("#copy-hint").textContent = "Copied";
    } catch (e) {
      location.href = "mailto:" + p.email;
    }
    setTimeout(() => ($("#copy-hint").textContent = "Copy"), 1600);
  });
  $("#year").textContent = new Date().getFullYear();
  $("#foot-name").textContent = p.name;

  // ── Work grid
  const projects = data.projects;
  let filter = "All";
  let query = "";
  let visible = projects;

  function card(pr, big) {
    const c = el("button", "card project" + (big ? " big" : ""));
    c.type = "button";
    const bar = el("div", "window-bar");
    const dots = el("span", "dots");
    dots.innerHTML = "<i></i><i></i><i></i>";
    bar.append(dots, el("span", "file", pr.id + ".jpg"));
    const meta = el("div", "project-meta");
    const left = el("div");
    left.append(el("strong", null, pr.title), el("span", "muted", `${pr.client} · ${pr.year}`));
    meta.append(left, el("span", "tag", pr.category));
    c.append(bar, media(pr.image, pr.title), meta);
    c.addEventListener("click", () => open(projects.indexOf(pr)));
    return c;
  }

  projects.filter((x) => x.featured).forEach((x) => $("#featured").append(card(x, true)));

  ["All", ...data.categories].forEach((cat) => {
    const b = el("button", "tab", cat);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => { filter = cat; renderGrid(); });
    $("#filters").append(b);
  });

  function renderGrid() {
    const q = query.trim().toLowerCase();
    visible = projects.filter((x) =>
      (filter === "All" || x.category === filter) &&
      (!q || [x.title, x.client, x.category, x.summary, ...x.tags].join(" ").toLowerCase().includes(q))
    );
    $("#grid").replaceChildren(...visible.map((x) => card(x)));
    $("#work-count").textContent = visible.length;
    $("#empty").hidden = visible.length > 0;
    document.querySelectorAll(".tab").forEach((t) =>
      t.setAttribute("aria-selected", String(t.textContent === filter))
    );
  }
  renderGrid();

  const search = $("#search");
  search.addEventListener("input", () => {
    query = search.value;
    renderGrid();
    if (query) $("#work").scrollIntoView({ behavior: "smooth" });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search && !viewer.open) {
      e.preventDefault();
      search.focus();
    }
  });

  // ── Viewer
  const viewer = $("#viewer");
  let current = 0;
  function open(i) {
    current = (i + projects.length) % projects.length;
    const pr = projects[current];
    $("#v-file").textContent = pr.image.split("/").pop();
    $("#v-media").replaceChildren(media(pr.image, pr.title));
    $("#v-cat").textContent = pr.category;
    $("#v-title").textContent = pr.title;
    $("#v-summary").textContent = pr.summary;
    $("#v-client").textContent = pr.client;
    $("#v-year").textContent = pr.year;
    $("#v-tags").replaceChildren(...pr.tags.map((t) => el("span", "chip ghost", t)));
    if (!viewer.open) viewer.showModal();
  }
  $("#v-close").addEventListener("click", () => viewer.close());
  $("#v-prev").addEventListener("click", () => open(current - 1));
  $("#v-next").addEventListener("click", () => open(current + 1));
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") open(current - 1);
    if (e.key === "ArrowRight") open(current + 1);
  });

  // ── Theme
  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : !matchMedia("(prefers-color-scheme: light)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // ── Active nav + breadcrumb
  const links = document.querySelectorAll("[data-nav]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      $("#crumb").textContent = id;
      links.forEach((l) => l.classList.toggle("active", l.dataset.nav === id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll(".section").forEach((s) => io.observe(s));
})();
