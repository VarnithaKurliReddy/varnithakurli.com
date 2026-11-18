// markdown.js
//
// Site copy lives in markdown files under content/ and is rendered in the
// browser with marked (https://marked.js.org), loaded from the CDN in index.html.
//
//   <div data-md="content/home/bio.md"></div>   filled with the rendered file
//
// Other components use Markdown.fetchText / render / renderInline directly.

const Markdown = (function () {
  "use strict";

  const escapeHtml = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Links that leave the site open in a new tab, as they did in the hand-written HTML.
  function externalLinks(root) {
    root.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener";
    });
    return root;
  }

  function toFragment(html) {
    const t = document.createElement("template");
    t.innerHTML = html;
    return externalLinks(t.content);
  }

  // Markdown text -> DocumentFragment of block elements (<p>, <h2>, <ul>, ...)
  function render(text) {
    if (window.marked) return toFragment(marked.parse(text));
    // marked did not load (CDN blocked/offline): fall back to plain paragraphs
    console.error("marked.js is not loaded; showing markdown as plain text");
    return toFragment(
      text.trim().split(/\n{2,}/).map((p) => `<p>${escapeHtml(p)}</p>`).join("")
    );
  }

  // One line of markdown -> DocumentFragment of inline content (no <p> wrapper)
  function renderInline(text) {
    return toFragment(window.marked ? marked.parseInline(text) : escapeHtml(text));
  }

  function fetchText(path) {
    return fetch(path).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      return res.text();
    });
  }

  // Fill every [data-md] element with its markdown file
  document.querySelectorAll("[data-md]").forEach((el) => {
    fetchText(el.dataset.md)
      .then((text) => el.replaceChildren(render(text)))
      .catch((err) => console.error(err));
  });

  return { render, renderInline, fetchText };
})();
