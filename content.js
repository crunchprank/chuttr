let isEnabled = true;
let observer = null;

let activeRules = {
  caps:    true,
  repeat:  true,
  links:   true,
  emote:   false,
  keyword: false
};

let settings = {
  capsRatio:          0.6,
  capsIncludeNumbers: true,
  repeatCount:        4,
  linkPattern:        "com|net|xyz|ru|info|gg|top|click|win|link|tk",
  maxEmotes:          5,
  keywordPattern:     ""
};

const ruleDefinitions = {
  caps: {
    name: "Excessive Caps",
    test: (text) => {
      const pattern = settings.capsIncludeNumbers
        ? /[^A-Z0-9]/g
        : /[^A-Z]/g;
      const caps = text.replace(pattern, "").length;
      return caps > 5 && (caps / text.length) > settings.capsRatio;
    }
  },
  repeat: {
    name: "Repeated Characters",
    test: (text) => {
      const regex = new RegExp(`(.)\\1{${settings.repeatCount},}`);
      return regex.test(text);
    }
  },
  links: {
    name: "Link Spam",
    test: (text) => {
      const regex = new RegExp(
        `\\b(?:https?:\\/\\/)?\\S+\\.(${settings.linkPattern})(\\b|\\/|\\s|$)`,
        "i"
      );
      return regex.test(text);
    }
  },
  keyword: {
    name: "Keyword",
    test: (text) => {
      if (!settings.keywordPattern.trim()) return false;
      const regex = new RegExp(
        `\\b(?:${settings.keywordPattern})\\b`,
        "i"
      );
      return regex.test(text);
    }
  }
};

function getEnabledRuleTests() {
  return Object.entries(activeRules)
    .filter(([key, enabled]) => enabled && key !== "emote")
    .map(([key]) => ({ id: key, ...ruleDefinitions[key] }));
}

chrome.storage.local.get(
  ["filteringEnabled", "activeRules", "settings"],
  (data) => {
    isEnabled   = data.filteringEnabled ?? true;
    activeRules = { ...activeRules, ...(data.activeRules || {}) };
    settings    = { ...settings,    ...(data.settings    || {}) };
    startOrStop();
  }
);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.filteringEnabled) {
    isEnabled = changes.filteringEnabled.newValue;
    startOrStop();
  }
  if (changes.activeRules) {
    activeRules = { ...activeRules, ...changes.activeRules.newValue };
    if (isEnabled) filterExistingMessages();
  }
  if (changes.settings) {
    settings = { ...settings, ...changes.settings.newValue };
    if (isEnabled) filterExistingMessages();
  }
});

function startOrStop() {
  const chatLog = document.querySelector('[role="log"]');
  if (!chatLog) return;
  if (isEnabled) {
    startFiltering();
    filterExistingMessages();
  } else {
    if (observer) observer.disconnect();
    showAllFilteredMessages();
  }
}

function extractChatText(node) {
  const texts = Array.from(
    node.querySelectorAll("span[data-a-target='chat-message-text']")
  ).map(el => el.textContent.trim());
  const links = Array.from(
    node.querySelectorAll("a.link-fragment")
  ).map(el => el.href.trim());
  return [...texts, ...links].join(" ").trim();
}

function getUsernameFromNode(node) {
  const el = node.querySelector('[data-a-user]');
  return el ? el.getAttribute('data-a-user') : 'unknown';
}

function processMessageNode(node) {
  if (!node || node.nodeType !== 1) return;

  if (activeRules.emote) {
    const emoteCount = node.querySelectorAll(
      "img.chat-line__message--emote"
    ).length;
    if (emoteCount > settings.maxEmotes) {
      console.log(
        `Chuttr: Filtered [Emote Count] (count=${emoteCount}) from @${getUsernameFromNode(node)}`
      );
      node.classList.add("chuttr-hidden");
      node.style.display = "none";
      return;
    }
  }

  const text = extractChatText(node);
  if (!text) return;

  const tests = getEnabledRuleTests();
  const matched = tests.find(r => r.test(text));
  if (matched) {
    console.log(
      `Chuttr: Filtered [${matched.name}] from @${getUsernameFromNode(node)}: ${text}`
    );
    node.classList.add("chuttr-hidden");
    node.style.display = "none";
  } else {
    node.classList.remove("chuttr-hidden");
    node.style.display = "";
    node.style.borderLeft = '3px solid #1f8eed';
  }
}

function filterExistingMessages() {
  const chatLog = document.querySelector('[role="log"]');
  if (!chatLog) return;
  Array.from(chatLog.children).forEach(processMessageNode);
}

function showAllFilteredMessages() {
  document.querySelectorAll(".chuttr-hidden").forEach(node => {
    node.classList.remove("chuttr-hidden");
    node.style.display = "";
    node.style.borderLeft = "";
  });
}

function startFiltering() {
  const chatLog = document.querySelector('[role="log"]');
  if (!chatLog) return;
  if (observer) observer.disconnect();
  observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (isEnabled && node.nodeType === 1) {
          processMessageNode(node);
        }
      });
    });
  });
  observer.observe(chatLog, { childList: true });
}
