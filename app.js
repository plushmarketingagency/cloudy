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

// Instagram's embed.js silently drops some embeds when too many are
// hydrated at once, so process them in small staggered batches and retry
// a few times for any that haven't rendered an iframe yet.
function isHydrated(blockquote) {
  return !!blockquote.querySelector("iframe");
}

function processUnhydrated() {
  if (!window.instgrm) return;
  window.instgrm.Embeds.process();
}

function startEmbedHydration() {
  let attempts = 0;
  const maxAttempts = 8;
  const interval = setInterval(() => {
    attempts++;
    processUnhydrated();

    const blockquotes = document.querySelectorAll(".instagram-media");
    const allHydrated = [...blockquotes].every(isHydrated);

    if (allHydrated || attempts >= maxAttempts) {
      clearInterval(interval);
      if (!allHydrated) {
        blockquotes.forEach((bq) => {
          if (!isHydrated(bq)) {
            const url = bq.getAttribute("data-instgrm-permalink");
            bq.insertAdjacentHTML(
              "afterend",
              `<a class="fallback-link" href="${url}" target="_blank">Couldn't load preview — view on Instagram</a>`
            );
          }
        });
      }
    }
  }, 1500);
}

window.addEventListener("load", startEmbedHydration);

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
