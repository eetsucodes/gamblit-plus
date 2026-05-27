console.log("G+ -> Starting...");
let isInactivating = false;
function safeMutate(callback) {
  if (isInactivating) return;
  isInactivating = true;
  callback();
  setTimeout(() => { isInactivating = false; }, 0);
}

function replaceLogo() {
  const logoImg =
    document.querySelector('img[src*="/assets/logo-"]') ||
    document.querySelector('img[alt="logo"]');
  if (logoImg) {
    const newLogoUrl = browser.runtime.getURL("logo-plus.png");
    if (logoImg.src !== newLogoUrl) {
      logoImg.src = newLogoUrl;
      console.log("G+ : Logo replaced successfully!");
    }
  }
}

function updateChallengesVisibility() {
  const shouldHide = localStorage.getItem('gplus_hide_challenges') === 'true';
  let styleEl = document.getElementById('gplus-hide-challenges-style');
  
  if (shouldHide) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'gplus-hide-challenges-style';
      styleEl.textContent = `
        div.grid[class*="[grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]"] {
          display: none !important;
        }
      `;
      safeMutate(() => {
        document.head.appendChild(styleEl);
      });
      console.log("g+ : Challenges hidden.");
    }
  } else {
    if (styleEl) {
      safeMutate(() => {
        styleEl.remove();
      });
      console.log("g+ : Challenges shown.");
    }
  }
}


// g+ settings tab
function createToggleSwitch(storageKey, defaultValue = false) {
  const label = document.createElement("label");
  label.className = "gplus-switch";
  label.style.display = "inline-block";
  label.style.position = "relative";
  label.style.width = "40px";
  label.style.height = "24px";
  label.style.cursor = "pointer";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.opacity = "0";
  checkbox.style.width = "0";
  checkbox.style.height = "0";

  const savedState = localStorage.getItem(storageKey);
  checkbox.checked = savedState !== null ? savedState === "true" : defaultValue;

  const slider = document.createElement("span");
  slider.className = "gplus-slider";
  slider.style.position = "absolute";
  slider.style.top = "0";
  slider.style.left = "0";
  slider.style.right = "0";
  slider.style.bottom = "0";
  slider.style.borderRadius = "24px";
  slider.style.transition = "0.2s";

  function updateSliderStyle() {
    if (checkbox.checked) {
      slider.style.backgroundColor = "#7c3aed"; 
      slider.innerHTML = `<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 19px; bottom: 3px; background-color: white; transition: 0.2s; border-radius: 50%;"></span>`;
    } else {
      slider.style.backgroundColor = "#374151"; 
      slider.innerHTML = `<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.2s; border-radius: 50%;"></span>`;
    }
  }

  checkbox.addEventListener("change", () => {
    localStorage.setItem(storageKey, checkbox.checked);
    updateSliderStyle();
    console.log(
      `g+ : Setting ${storageKey} changed to: ${checkbox.checked}`,
    );
  });

  updateSliderStyle();
  label.appendChild(checkbox);
  label.appendChild(slider);
  return label;
}

function createSettingsRow(
  titleText,
  descriptionText,
  storageKey,
  defaultValue = false,
) {
  const row = document.createElement("div");
  row.className =
    "flex items-center justify-between p-3 border-b font-proxima_reg border-gray-700";
  row.style.borderBottom = "1px solid #2d3748";

  const textContainer = document.createElement("div");
  textContainer.className = "flex flex-col text-left";

  const title = document.createElement("div");
  title.style.color = "#fff";
  title.style.fontSize = "14px";
  title.style.fontWeight = "500";
  title.innerText = titleText;

  const desc = document.createElement("div");
  desc.style.fontSize = "12px";
  desc.style.color = "#9ca3af";
  desc.style.marginTop = "2px";
  desc.innerText = descriptionText;

  textContainer.appendChild(title);
  textContainer.appendChild(desc);

  const toggleSwitch = createToggleSwitch(storageKey, defaultValue);
  row.appendChild(textContainer);
  row.appendChild(toggleSwitch);
  return row;
}

function loadGamblitPlusSettings(contentContainer) {
  // block re-creates
  if (contentContainer.querySelector('[data-gplus-settings]')) return;

  safeMutate(() => {
    contentContainer.innerHTML = "";

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-gplus-settings', 'true');
    wrapper.className = "w-full";


    const allInButtonRow = createSettingsRow(
      "The All In Button",
      "All-In button Good Luck!",
      "gplus_all_in_btn",
      true,
    );

    const customLogoRow = createSettingsRow(
      "Custom Gamblit+ Logo",
      "Replaces Logos.",
      "gplus_custom_logo",
      true,
    );

    const hideChallengesRow = createSettingsRow(
      "Hide Challenges", 
      "Hide the useless challenges from every game", 
      "gplus_hide_challenges", 
      false,
      () => { updateChallengesVisibility(); }
    );

    
    wrapper.appendChild(allInButtonRow);
    wrapper.appendChild(customLogoRow);
    wrapper.appendChild(hideChallengesRow);
    contentContainer.appendChild(wrapper);
  });
}


function injectGamblitCategory() {
  if (document.getElementById("gamblit-plus-category-btn")) return;

  const settingsNav = document.querySelector(".flex.flex-wrap.gap-1.pb-2");
  if (settingsNav) {
    const btn = document.createElement("button");
    btn.id = "gamblit-plus-category-btn";
    btn.className =
      "px-2 py-1 rounded-lg bg-dark-1 text-white font-proxima_reg transition-all";
    btn.innerText = "Gamblit+";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("g+ :  category tab clicked!");

      const contentContainer = document.querySelector(
        ".flex.flex-wrap.gap-1.pb-2",
      )?.nextElementSibling;
      if (contentContainer) {
        loadGamblitPlusSettings(contentContainer);
        settingsNav
          .querySelectorAll("button")
          .forEach((b) => (b.style.brightness = "100%"));
        btn.style.brightness = "75%";
      }
    });

    settingsNav.appendChild(btn);
  }
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


function createAllInButton() {
  if (document.getElementById("gamblit-plus-allin")) return null;

  const btn = document.createElement("button");
  btn.id = "gamblit-plus-allin";
  btn.className =
    "flex rounded-md bg-dark-1 px-2 py-1 laptop:py-0.5 shadow-md transition-all active:scale-[0.95] border border-gray-600 active:translate-y-px hover:translate-y-[0.5px] laptop:px-3 opacity-100";
  btn.innerText = "All";
  btn.style.cursor = "pointer";

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const betInput =
      document.querySelector('input[type="number"]') ||
      document.querySelector("input");
    const maxBalance = getBal(); // gets balance using wrapper

    if (betInput && maxBalance) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      nativeInputValueSetter.call(betInput, maxBalance);
      betInput.dispatchEvent(new Event("input", { bubbles: true }));
      betInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  return btn;
}
function injectAllInButton() {
  if (document.getElementById("gamblit-plus-allin")) return;

  const targetContainer = document.querySelector(
    'div[class*="flex gap-1 text-xs laptop:text-sm"]',
  );

  if (targetContainer) {
    safeMutate(() => {
      const allInBtn = createAllInButton();
      if (allInBtn) targetContainer.appendChild(allInBtn);
    });
  }
}


const observer = new MutationObserver(() => {
  if (isInactivating) return; // block loops

  injectGamblitCategory(); 
  updateChallengesVisibility();

  const isLogoEnabled = localStorage.getItem("gplus_custom_logo") !== "false";
  if (isLogoEnabled) replaceLogo();
  
  const isAllInEnabled = localStorage.getItem("gplus_all_in_btn") !== "false";
  if (isAllInEnabled) injectAllInButton();
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

