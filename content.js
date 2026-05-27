console.log("MUTATION: Gamblit+ content script has started!");

function getOptimalMove(playerTotal, dealerTotal) {
  if (playerTotal >= 17) return "Stand";
  if (playerTotal <= 11) {
    if (playerTotal === 11) return "Double / Hit";
    if (playerTotal === 10 && dealerTotal < 10) return "Double / Hit";
    if (playerTotal === 9 && dealerTotal >= 3 && dealerTotal <= 6) return "Double / Hit";
    return "Hit";
  }

  // Hard totals table lookup (12 - 16)
  const strategyTable = {
    12: { 2: "H", 3: "H", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
    13: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
    14: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
    15: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" },
    16: { 2: "S", 3: "S", 4: "S", 5: "S", 6: "S", 7: "H", 8: "H", 9: "H", 10: "H", 11: "H" }
  };

  const choice = strategyTable[playerTotal]?.[dealerTotal] || "H";
  return choice === "S" ? "Stand" : "Hit";
}

function renderAssistantBox(move, player, dealer) {
  let box = document.getElementById('gamblit-plus-bj-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'gamblit-plus-bj-box';
    box.style.position = 'fixed';
    box.style.bottom = '85px';
    box.style.left = '20px';
    box.style.backgroundColor = '#111827';
    box.style.border = '2px solid #7c3aed';
    box.style.borderRadius = '8px';
    box.style.padding = '12px 16px';
    box.style.color = '#ffffff';
    box.style.fontFamily = 'sans-serif';
    box.style.zIndex = '99999';
    box.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    document.body.appendChild(box);
  }

  let actionColor = "#ef4444"; // Red for Stand
  if (move.includes("Hit")) actionColor = "#22c55e"; // Green for Hit
  if (move.includes("Double")) actionColor = "#eab308"; // Yellow for Double

  box.innerHTML = `
    <div style="font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 2px;">Gamblit+ Advisor</div>
    <div style="font-size: 22px; font-weight: bold; color: ${actionColor};">${move}</div>
    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Your Hand: ${player} | Dealer Upcard: ${dealer}</div>
  `;
}

function updateBlackjackAssistant() {
  const isBjEnabled = localStorage.getItem('gplus_bj_assistant') !== 'false';
  
  if (!isBjEnabled) {
    const existingUi = document.getElementById('gamblit-plus-bj-box');
    if (existingUi) existingUi.remove();
    return;
  }

  // Find all score badges matching the layout classes
  const scoreBadges = document.querySelectorAll('div[class*="rounded-full"][class*="bg-dark-2"]');
  
  // FIXED: Added [0] and [1] to pull text from the separate list elements correctly
  if (scoreBadges.length >= 2) {
    const dealerTotal = parseInt(scoreBadges[0].innerText || scoreBadges[0].textContent);
    const playerTotal = parseInt(scoreBadges[1].innerText || scoreBadges[1].textContent);

    if (!isNaN(dealerTotal) && !isNaN(playerTotal)) {
      const recommendation = getOptimalMove(playerTotal, dealerTotal);
      renderAssistantBox(recommendation, playerTotal, dealerTotal);
      return;
    }
  }

  // If cards aren't fully loaded or numbers are missing, clear old boxes
  const existingUi = document.getElementById('gamblit-plus-bj-box');
  if (existingUi) existingUi.remove();
}

// ==========================================
// 2. LOGO REPLACEMENT LOGIC
// ==========================================
function replaceLogo() {
  const logoImg = document.querySelector('img[src*="/assets/logo-"]') || document.querySelector('img[alt="logo"]');
  if (logoImg) {
    const newLogoUrl = browser.runtime.getURL("logo-plus.png");
    if (logoImg.src !== newLogoUrl) {
      logoImg.src = newLogoUrl;
      console.log("MUTATION: Logo replaced successfully!");
    }
  }
}

// ==========================================
// 3. GAMBLIT+ TAB & TOGGLE CONTROLS
// ==========================================
function createToggleSwitch(storageKey, defaultValue = false) {
  const label = document.createElement('label');
  label.className = "gplus-switch";
  label.style.display = "inline-block";
  label.style.position = "relative";
  label.style.width = "40px";
  label.style.height = "24px";
  label.style.cursor = "pointer";

  const checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.style.opacity = "0";
  checkbox.style.width = "0";
  checkbox.style.height = "0";
  
  const savedState = localStorage.getItem(storageKey);
  checkbox.checked = savedState !== null ? savedState === "true" : defaultValue;

  const slider = document.createElement('span');
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
      slider.style.backgroundColor = "#7c3aed"; // Violet accent
      slider.innerHTML = `<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 19px; bottom: 3px; background-color: white; transition: 0.2s; border-radius: 50%;"></span>`;
    } else {
      slider.style.backgroundColor = "#374151"; // Charcoal dark accent
      slider.innerHTML = `<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.2s; border-radius: 50%;"></span>`;
    }
  }

  checkbox.addEventListener('change', () => {
    localStorage.setItem(storageKey, checkbox.checked);
    updateSliderStyle();
    console.log(`MUTATION: Setting ${storageKey} changed to: ${checkbox.checked}`);
  });

  updateSliderStyle();
  label.appendChild(checkbox);
  label.appendChild(slider);
  return label;
}

function createSettingsRow(titleText, descriptionText, storageKey, defaultValue = false) {
  const row = document.createElement('div');
  row.className = "flex items-center justify-between p-3 border-b font-proxima_reg border-gray-700";
  row.style.borderBottom = "1px solid #2d3748";

  const textContainer = document.createElement('div');
  textContainer.className = "flex flex-col text-left";
  
  const title = document.createElement('div');
  title.style.color = '#fff';
  title.style.fontSize = '14px';
  title.style.fontWeight = '500';
  title.innerText = titleText;
  
  const desc = document.createElement('div');
  desc.style.fontSize = '12px';
  desc.style.color = '#9ca3af';
  desc.style.marginTop = '2px';
  desc.innerText = descriptionText;
  
  textContainer.appendChild(title);
  textContainer.appendChild(desc);
  
  const toggleSwitch = createToggleSwitch(storageKey, defaultValue);
  row.appendChild(textContainer);
  row.appendChild(toggleSwitch);
  return row;
}

function loadGamblitPlusSettings(contentContainer) {
  contentContainer.innerHTML = '';
  
  const bjAssistantRow = createSettingsRow(
    "Blackjack Assistant", 
    "Displays mathematically optimal basic strategy advice live on screen.", 
    "gplus_bj_assistant", 
    true
  );
  
  const allInButtonRow = createSettingsRow(
    "The All In Button", 
    "Creates a quick button that sets your entire balance as the bet with one click.", 
    "gplus_all_in_btn", 
    true
  );

  const customLogoRow = createSettingsRow(
    "Custom Gamblit+ Logo", 
    "Replaces the default platform logo with your customized purple variant.", 
    "gplus_custom_logo", 
    true
  );
  
  contentContainer.appendChild(bjAssistantRow);
  contentContainer.appendChild(allInButtonRow);
  contentContainer.appendChild(customLogoRow);
}

function injectGamblitCategory() {
  if (document.getElementById('gamblit-plus-category-btn')) return;

  const settingsNav = document.querySelector('.flex.flex-wrap.gap-1.pb-2');
  if (settingsNav) {
    const btn = document.createElement('button');
    btn.id = 'gamblit-plus-category-btn';
    btn.className = "px-2 py-1 rounded-lg bg-dark-1 text-white font-proxima_reg transition-all";
    btn.innerText = "Gamblit+";
    btn.style.cursor = "pointer";

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("MUTATION: Gamblit+ category tab clicked!");
      
      const contentContainer = document.querySelector('.flex.flex-wrap.gap-1.pb-2')?.nextElementSibling;
      if (contentContainer) {
        loadGamblitPlusSettings(contentContainer);
        settingsNav.querySelectorAll('button').forEach(b => b.style.brightness = '100%');
        btn.style.brightness = '75%';
      }
    });

    settingsNav.appendChild(btn);
  }
}

// ==========================================
// 4. BALANCE HARVESTING & ALL-IN BUTTON
// ==========================================
function getAvailableBalance() {
  const divs = document.querySelectorAll('div');
  for (let div of divs) {
    if (div.children.length === 1 && div.firstElementChild.tagName === 'DIV') {
      const text = div.firstElementChild.innerText.trim();
      if (/^[0-9.]+$/.test(text)) {
        const hasImgNearby = div.parentElement?.querySelector('img');
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

function createAllInButton() {
  if (document.getElementById('gamblit-plus-allin')) return null;

  const btn = document.createElement('button');
  btn.id = 'gamblit-plus-allin';
  btn.className = "flex rounded-md bg-dark-1 px-2 py-1 laptop:py-0.5 shadow-md transition-all active:scale-[0.95] border border-gray-600 active:translate-y-px hover:translate-y-[0.5px] laptop:px-3 opacity-100";
  btn.innerText = "All"; 
  btn.style.cursor = "pointer";

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    

    const betInput = document.querySelector('input[type="number"]') || document.querySelector('input');
    const maxBalance = getAvailableBalance();

    if (betInput && maxBalance) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(betInput, maxBalance);
        betInput.dispatchEvent(new Event('input', { bubbles: true }));
        betInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    });
    return btn;
}
function injectAllInButton() {
  if (document.getElementById('gamblit-plus-allin')) return;
  
  // FIXED: Using an attribute selector completely avoids the colon (:) syntax error
  const targetContainer = document.querySelector('div[class*="flex gap-1 text-xs laptop:text-sm"]');
  
  if (targetContainer) {
    const allInBtn = createAllInButton();
    if (allInBtn) targetContainer.appendChild(allInBtn);
  }
}


const observer = new MutationObserver(() => {
    injectGamblitCategory();
    updateBlackjackAssistant();
    renderAssistantBox(); // Clear box if not needed
    const isLogoEnabled = localStorage.getItem('gplus_custom_logo') !== 'false';
    if (isLogoEnabled) replaceLogo();
    const isAllInEnabled = localStorage.getItem('gplus_all_in_btn') !== 'false';
    if (isAllInEnabled) injectAllInButton();
});
if (document.body ) {
    observer.observe(document.body, { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
    });
}