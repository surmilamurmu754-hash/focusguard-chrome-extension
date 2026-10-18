
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const duration = Number(request.duration);
    const domain = request.domain.trim().toLowerCase();

    if (!Number.isFinite(duration) || duration <= 0 || !domain) {
      sendResponse({ success: false });
      return;
    }

    // Clear an earlier session's alarm.
    chrome.alarms.clear("focusTimer");

    // Store the focus session.
    chrome.storage.local.set({
      isFocusing: true,
      blockedDomain: domain
    });

    // Start the timer.
    chrome.alarms.create("focusTimer", {
      delayInMinutes: duration
    });

    sendResponse({ success: true });
  }
});

// Disable focus mode when the timer ends.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer") {
    chrome.storage.local.set({ isFocusing: false });
  }
});

// Check updated tabs.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  chrome.storage.local.get(
    ["isFocusing", "blockedDomain"],
    (data) => {
      if (!data.isFocusing || !data.blockedDomain || !tab.url) {
        return;
      }

      try {
        const url = new URL(tab.url);
        const host = url.hostname.toLowerCase();
        const domain = data.blockedDomain
          .replace(/^https?:\/\//, "")
          .split("/")[0]
          .split(":")[0];

        if (host === domain || host.endsWith("." + domain)) {
          chrome.tabs.remove(tabId);
        }
      } catch (error) {
        // Ignore URLs that cannot be parsed.
      }
    }
  );
});
