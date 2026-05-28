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