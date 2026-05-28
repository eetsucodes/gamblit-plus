// helpers.js
let isInactivating = false;

function safeMutate(callback) {
  if (isInactivating) return;
  isInactivating = true;
  callback();
  setTimeout(() => { isInactivating = false; }, 0);
}

function getAvailableBalance() { // getBal()
  const divs = document.querySelectorAll("div");
  for (let div of divs) {
    if (div.children.length === 1 && div.firstElementChild.tagName === "DIV") {
      const text = div.firstElementChild.innerText.trim();
      if (/^[0-9.]+$/.test(text)) {
        const hasImgNearby = div.parentElement?.querySelector("img");
        if (hasImgNearby) return text;
      }
    }
  }
  for (let div of divs) {
    const text = div.innerText.trim();
    if (/^\d+\.\d{2}$/.test(text)) return text;
  }
  return null;
}
function getBal() {
  return getAvailableBalance();
}