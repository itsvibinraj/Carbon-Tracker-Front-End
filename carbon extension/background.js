let tracking = false;
let currentTabId = null;
let tabStartTime = null;
let currentUrl = "";

// 1. Listen for Start/Stop commands from Popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "START") {
    tracking = true;
    console.log("Tracker Started");
    initializeCurrentTab();
  } else if (msg.action === "STOP") {
    tracking = false;
    console.log("Tracker Stopped");
  }
});

// 2. Detect Tab Switching
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!tracking) return;
  
  const endTime = Date.now();
  
  // A. Log Previous Tab Data
  if (currentUrl && tabStartTime) {
    const duration = (endTime - tabStartTime) / 1000; // seconds
    if (duration > 2) { // Filter short clicks
      sendData(currentUrl, duration);
    }
  }

  // B. Start New Tab Timer
  currentTabId = activeInfo.tabId;
  tabStartTime = Date.now();
  
  try {
    const tab = await chrome.tabs.get(currentTabId);
    if (tab.url.startsWith('http')) {
       currentUrl = new URL(tab.url).hostname;
    } else {
       currentUrl = "System Page";
    }
  } catch (e) { currentUrl = ""; }
});

// Helper: Get tab info when Tracking Starts
async function initializeCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentTabId = tab.id;
    tabStartTime = Date.now();
    currentUrl = new URL(tab.url).hostname;
  }
}

// 3. Send Data to Backend (Member 2's Job)
function sendData(domain, seconds) {
  console.log(`[LOG] ${domain}: ${seconds}s`);
  
  // UNCOMMENT THIS WHEN BACKEND IS READY:
  /*
  fetch("http://localhost:5000/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, duration: seconds })
  }).catch(err => console.log("Backend offline"));
  */

}
