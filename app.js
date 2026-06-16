const grid = document.getElementById("grid");
const shortlist = new Set();

function cardFor(url, index) {
  const card = document.createElement("div");
  card.className = "card";

  const embedWrap = document.createElement("div");
  embedWrap.className = "embed-wrap";
  embedWrap.innerHTML = `
    <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>
  `;

  const actions = document.createElement("div");
  actions.className = "actions";

  const btn = document.createElement("button");
  btn.textContent = "Shortlist";
  btn.addEventListener("click", () => {
    if (shortlist.has(url)) {
      shortlist.delete(url);
      btn.textContent = "Shortlist";
      btn.classList.remove("active");
    } else {
      shortlist.add(url);
      btn.textContent = "Shortlisted ✓";
      btn.classList.add("active");
    }
  });

  actions.appendChild(btn);
  card.appendChild(embedWrap);
  card.appendChild(actions);
  return card;
}

IG_LINKS.forEach((url, i) => grid.appendChild(cardFor(url, i)));

// Re-process embeds once Instagram's embed.js loads (it scans the DOM on load,
// but cards are added dynamically so we trigger it manually too).
window.addEventListener("load", () => {
  if (window.instgrm) window.instgrm.Embeds.process();
});

document.getElementById("export-btn").addEventListener("click", () => {
  const output = document.getElementById("shortlist-output");
  if (shortlist.size === 0) {
    output.textContent = "No reels shortlisted yet.";
    return;
  }
  output.innerHTML =
    "<h3>Shortlisted links:</h3><ul>" +
    [...shortlist].map((u) => `<li><a href="${u}" target="_blank">${u}</a></li>`).join("") +
    "</ul>";
});
