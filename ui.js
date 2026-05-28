
function replaceWelcomeText() {
  const isEnabled = localStorage.getItem("gplus_custom_welcome") !== "false";
  if (!isEnabled) return;

  const welcomeText = document.querySelector('p.font-unbounded');
  if (welcomeText) {
    const targetText = "Welcome to Gamblit+, "; 
    const targetColor = "#d4b909";       // gold

    
    if (welcomeText.textContent !== targetText || welcomeText.style.color !== targetColor) {
      safeMutate(() => {
        // Vaihdetaan väri
        welcomeText.style.color = targetColor;
        
        
        welcomeText.replaceChildren(document.createTextNode(targetText));
        
        console.log("g+ -> Welcome text replaced.");
      });
    }
  }
}





function replaceLogo() {
  const logoImg = document.querySelector('img[src*="/assets/logo-"]') || 
                  document.querySelector('img[src^="data:image/svg+xml"]') ||
                  document.querySelector('img[alt="Logo"]') || 
                  document.querySelector('img[alt="logo"]');
  if (logoImg) {
    const newLogoUrl = browser.runtime.getURL("logo-plus.png");
    if (logoImg.src !== newLogoUrl) {
      logoImg.src = newLogoUrl;
      
      // Override using hardcoded pixel dimensions (40% of the original scale)
      logoImg.style.setProperty('width', '50px', 'important');
      logoImg.style.setProperty('height', '65px', 'important');
      logoImg.style.setProperty('max-width', '50px', 'important');
      
      console.log("G+ : Logo replaced and shrunk to fixed pixel size!");
    }
  }
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