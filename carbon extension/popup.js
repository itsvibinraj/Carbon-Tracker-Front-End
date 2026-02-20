let timerInterval;
let startTime;
let isTracking = false;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Show Current Domain
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) document.getElementById('domain').innerText = new URL(tab.url).hostname;

  // 2. Restore State (Handle popup closing/reopening)
  chrome.storage.local.get(['isTracking', 'startTime'], (result) => {
    isTracking = result.isTracking || false;
    startTime = result.startTime || null;
    updateUI();
    if (isTracking) startTimerTick();
  });
});

// 3. Button Click Handler
document.getElementById('toggleBtn').addEventListener('click', () => {
  isTracking = !isTracking;
  
  if (isTracking) {
    // START
    startTime = Date.now();
    chrome.storage.local.set({ isTracking: true, startTime: startTime });
    chrome.runtime.sendMessage({ action: "START" }); // Tell background to work
    startTimerTick();
  } else {
    // STOP
    chrome.storage.local.set({ isTracking: false, startTime: null });
    chrome.runtime.sendMessage({ action: "STOP" }); // Tell background to stop
    clearInterval(timerInterval);
    document.getElementById('timerDisplay').innerText = "00:00:00";
  }
  updateUI();
});


document.addEventListener('DOMContentLoaded', () => {
  
  const dashboardBtn = document.getElementById('dashboardBtn');
  
  // If the button exists, attach the click event
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173' });
    });
  }
  
});
// Helper: Update Button Color/Text
function updateUI() {
  const btn = document.getElementById('toggleBtn');
  const msg = document.getElementById('statusMsg');
  const bod=document.getElementById('boddy');
  if (isTracking) {
    btn.innerText = "Stop Tracking";
    btn.className = "btn-stop";
    msg.innerText = "Tracking active...";
    bod.className="stop-body";
  } else {
    btn.innerText = "Start Tracking";
    btn.className = "btn-start";
    msg.innerText = "Ready to track";
    bod.className="start-body";
  }
}

// Helper: Update Timer Numbers
function startTimerTick() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!startTime) return;
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `${h}:${m}:${s}`;
  }, 1000);
}