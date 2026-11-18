// projects.js
//
// Builds the Projects page at load time from content/projects/:
//
//   projects.json    one entry per tile, in display order:
//                      "Project name": {
//                        "thumbnail":   "thumbnails/name.jpg",   tile image (4:3)
//                        "description": "One line under the title",
//                        "tags":        ["research", "tools"],   filter + label
//                        "details":     "name.md",               dialog text
//                        "tint":        "#f2d6d3"                colour behind the image (optional)
//                      }
//   <name>.md        the full description shown when the tile is opened
//   thumbnails/      tile images
//
// Layout of a project's markdown file (every part is optional):
//
//   ---
//   status: Work in progress                  small label above the title
//   by: with A and B · *Venue*, 2026          byline; *italics* mark the venue
//   ---
//
//   # Title shown in the dialog
//
//   Summary paragraph(s).
//
//   ## Abstract                               each "##" section becomes a fold-out
//
//   Paragraphs...
//
//   - **Data** NFHS                           a bullet list at the very end
//   - **Link** [Journal article](https://…)   becomes the row of facts
//
// Requires components/markdown.js.

(function () {
  "use strict";

  const DIR = "content/projects/";

  // Label shown on the tile for each tag; other tags are shown capitalised.
  const TAG_LABELS = { research: "Research", tools: "Tools", applied: "Project" };

  const tiles = document.querySelector(".tiles");
  const store = document.getElementById("project-store");
  const dlg = document.getElementById("project-dialog");
  const dlgBody = document.getElementById("dialog-body");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const tagList = (tags) => (Array.isArray(tags) ? tags : String(tags || "").split(/[\s,]+/)).filter(Boolean);
  const tagLabel = (t) => TAG_LABELS[t] || t.charAt(0).toUpperCase() + t.slice(1);
  const slug = (path) => path.replace(/^.*\//, "").replace(/\.[^.]*$/, "");

  // ── Tiles ──────────────────────────────────────────────────────────────────
  function buildTile(name, p, id) {
    const tags = tagList(p.tags);
    const tile = el("a", "tile");
    tile.href = "#projects";
    tile.dataset.open = id;
    tile.dataset.cat = tags.join(" ");
    if (p.tint) tile.style.setProperty("--tint", p.tint);

    const box = el("div", "img");
    if (p.thumbnail) {
      const src = DIR + p.thumbnail;
      const img = el("img");
      img.alt = "";
      img.addEventListener("error", () => img.remove()); // missing file: show its path instead
      img.src = src;
      box.append(img, el("span", "ph-file", src));
    }
    box.append(el("span", "over", "View project"));

    tile.append(box, el("h3", "", name), el("p", "", p.description || ""),
                el("span", "kind", tags.map(tagLabel).join(" · ")));
    return tile;
  }

  // ── Project details (markdown -> <article class="work">) ───────────────────
  // Leading "---" block of "key: value" lines
  function splitFrontMatter(text) {
    const meta = {};
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta, body: text };
    m[1].split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    });
    return { meta, body: text.slice(m[0].length) };
  }

  // Swap an element for a different tag, keeping its contents
  function retag(node, tag, className) {
    const out = el(tag, className);
    out.append(...node.childNodes);
    node.replaceWith(out);
    return out;
  }

  function buildWork(name, id, text) {
    const { meta, body } = splitFrontMatter(text);
    const blocks = Array.from(Markdown.render(body).children);
    const work = el("article", "work");
    work.id = id;

    if (meta.status) work.append(el("span", "status", meta.status));

    const title = el("h3");
    if (blocks.length && blocks[0].tagName === "H1") title.append(...blocks.shift().childNodes);
    else title.textContent = name;
    work.append(title);

    if (meta.by) {
      const by = el("p", "by");
      by.append(Markdown.renderInline(meta.by));
      by.querySelectorAll("em").forEach((em) => retag(em, "span", "venue"));
      work.append(by);
    }

    // A bullet list that ends the file is the row of facts
    const facts = blocks.length && blocks[blocks.length - 1].tagName === "UL" ? blocks.pop() : null;

    // Paragraphs before the first "##" are the summary; each "##" opens a fold-out
    let section = null;
    blocks.forEach((block) => {
      if (block.tagName === "H2") {
        const details = el("details");
        const summary = el("summary");
        summary.append(...block.childNodes);
        section = el("div", "more");
        details.append(summary, section);
        work.append(details);
      } else if (section) {
        section.append(block);
      } else {
        if (block.tagName === "P") block.classList.add("gist");
        work.append(block);
      }
    });

    if (facts) {
      const row = el("div", "meta");
      Array.from(facts.children).forEach((li) => {
        const item = el("span");
        item.append(...li.childNodes);
        item.querySelectorAll("strong").forEach((s) => retag(s, "b"));
        row.append(item);
      });
      work.append(row);
    }
    return work;
  }

  // ── Load ───────────────────────────────────────────────────────────────────
  fetch(DIR + "projects.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load projects.json: ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      const entries = Object.entries(projects).map(([name, p], i) => ({
        name, p, id: "p-" + (p.details ? slug(p.details) : i + 1),
      }));

      entries.forEach(({ name, p, id }) => tiles.append(buildTile(name, p, id)));

      // Descriptions are small, so fetch them all up front: tiles then open instantly.
      // A missing file is not fatal; the dialog shows just the project name.
      return Promise.all(entries.map(({ name, p, id }) =>
        (p.details ? Markdown.fetchText(DIR + p.details) : Promise.resolve(""))
          .catch((err) => { console.error(err); return ""; })
          .then((text) => buildWork(name, id, text))
      )).then((works) => store.append(...works));
    })
    .catch((err) => console.error(err));

  // ── Tiles open the matching project in a dialog ────────────────────────────
  tiles.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-open]");
    if (!tile) return;
    e.preventDefault();
    const work = document.getElementById(tile.dataset.open);
    if (!work) return; // description still loading
    const entry = work.cloneNode(true);
    entry.removeAttribute("id");
    const d = entry.querySelector("details");
    if (d) d.open = true;
    dlgBody.replaceChildren(entry);
    dlg.showModal();
  });
  document.getElementById("dialog-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  // ── Tile filters ───────────────────────────────────────────────────────────
  document.querySelectorAll("[data-filter]").forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    tiles.querySelectorAll(".tile").forEach((t) => {
      t.hidden = !(f === "all" || t.dataset.cat.split(" ").includes(f));
    });
  }));
})();
