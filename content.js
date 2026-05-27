console.log("G+ -> Starting...");

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
      // UUSI RIVI TERVETULOTEKSTILLE
      const customWelcomeRow = createSettingsRow(
        "Custom Welcome Text",
        "Our cool welcome text",
        "gplus_custom_welcome",
        true,
        () => { replaceWelcomeText(); }
      );
    
    wrapper.appendChild(allInButtonRow);
    wrapper.appendChild(customLogoRow);
    wrapper.appendChild(hideChallengesRow);
    wrapper.appendChild(customWelcomeRow);

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

const observer = new MutationObserver(() => {
  if (isInactivating) return;

  injectGamblitCategory();
  updateChallengesVisibility();
  replaceWelcomeText(); // Varmista että tämä rivi on tässä kohtaa koodia

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

