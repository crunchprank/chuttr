// popup.js

document.addEventListener("DOMContentLoaded", () => {
  // Rule toggle switches
  const toggleElems = {
    caps:    document.getElementById("rule-caps"),
    repeat:  document.getElementById("rule-repeat"),
    links:   document.getElementById("rule-links"),
    emote:   document.getElementById("rule-emote"),
    keyword: document.getElementById("rule-keyword"),
  };

  // Inputs for each rule
  const inputElems = {
    capsThreshold:      document.getElementById("caps-threshold"),
    capsIncludeNumbers: document.getElementById("caps-include-numbers"),
    repeatThreshold:    document.getElementById("repeat-threshold"),
    linkPattern:        document.getElementById("link-pattern"),
    emoteThreshold:     document.getElementById("emote-threshold"),
    keywordPattern:     document.getElementById("keyword-pattern"),
  };

  const saveBtn  = document.getElementById("save");
  const resetBtn = document.getElementById("reset");

  // Default state
  const DEFAULTS = {
    activeRules: {
      caps:    false,
      repeat:  false,
      links:   false,
      emote:   false,
      keyword: false
    },
    settings: {
      capsRatio:          0.6,
      capsIncludeNumbers: false,
      repeatCount:        10,
      linkPattern:        "xyz|win|tk",
      maxEmotes:          10,
      keywordPattern:     "follow4follow|sub4sub|buy follows"
    }
  };

  // Show/hide and grey out each card based on its toggle
  function updateCardUI(rule) {
    const card   = document.querySelector(`.card[data-rule="${rule}"]`);
    const header = card.querySelector(".card-header");
    const body   = card.querySelector(".card-body");
    if (toggleElems[rule].checked) {
      header.classList.remove("disabled");
      body.classList.remove("collapsed");
    } else {
      header.classList.add("disabled");
      body.classList.add("collapsed");
    }
  }

  // Clicking a card header also toggles its switch
  document.querySelectorAll(".card-header").forEach(header => {
    const rule = header.parentElement.getAttribute("data-rule");
    header.addEventListener("click", () => {
      toggleElems[rule].checked = !toggleElems[rule].checked;
      updateCardUI(rule);
    });
  });

  // Load saved settings or apply defaults
  chrome.storage.local.get(["activeRules", "settings"], data => {
    const savedRules = data.activeRules || DEFAULTS.activeRules;
    Object.keys(toggleElems).forEach(rule => {
      toggleElems[rule].checked = savedRules[rule] ?? DEFAULTS.activeRules[rule];
      updateCardUI(rule);
    });

    const s = data.settings || DEFAULTS.settings;
    inputElems.capsThreshold.value        = s.capsRatio           ?? DEFAULTS.settings.capsRatio;
    inputElems.capsIncludeNumbers.checked = s.capsIncludeNumbers ?? DEFAULTS.settings.capsIncludeNumbers;
    inputElems.repeatThreshold.value      = s.repeatCount         ?? DEFAULTS.settings.repeatCount;
    inputElems.linkPattern.value          = s.linkPattern         ?? DEFAULTS.settings.linkPattern;
    inputElems.emoteThreshold.value       = s.maxEmotes           ?? DEFAULTS.settings.maxEmotes;
    inputElems.keywordPattern.value       = s.keywordPattern      ?? DEFAULTS.settings.keywordPattern;
  });

  // Save current UI state back to storage
  saveBtn.addEventListener("click", () => {
    const activeRules = {};
    Object.keys(toggleElems).forEach(rule => {
      activeRules[rule] = toggleElems[rule].checked;
    });

    const settings = {
      capsRatio:          parseFloat(inputElems.capsThreshold.value),
      capsIncludeNumbers: inputElems.capsIncludeNumbers.checked,
      repeatCount:        parseInt(inputElems.repeatThreshold.value),
      linkPattern:        inputElems.linkPattern.value,
      maxEmotes:          parseInt(inputElems.emoteThreshold.value),
      keywordPattern:     inputElems.keywordPattern.value
    };

    chrome.storage.local.set({ activeRules, settings });
  });

  // Reset UI fields to defaults (does not auto-save)
  resetBtn.addEventListener("click", () => {
    Object.entries(DEFAULTS.activeRules).forEach(([rule, val]) => {
      toggleElems[rule].checked = val;
      updateCardUI(rule);
    });

    inputElems.capsThreshold.value        = DEFAULTS.settings.capsRatio;
    inputElems.capsIncludeNumbers.checked = DEFAULTS.settings.capsIncludeNumbers;
    inputElems.repeatThreshold.value      = DEFAULTS.settings.repeatCount;
    inputElems.linkPattern.value          = DEFAULTS.settings.linkPattern;
    inputElems.emoteThreshold.value       = DEFAULTS.settings.maxEmotes;
    inputElems.keywordPattern.value       = DEFAULTS.settings.keywordPattern;
  });
});
