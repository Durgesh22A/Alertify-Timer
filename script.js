// DOM elements
const secondsInput = document.getElementById("secondsInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const enableNotificationsBtn = document.getElementById("enableNotificationsBtn");
const timeDisplay = document.getElementById("timeDisplay");
const messageEl = document.getElementById("message");
const notificationStatus = document.getElementById("notificationStatus");

// Timer state
let countdownInterval = null;
let remainingSeconds = 0;
let isRunning = false;

// ✅ Web Audio API context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// ✅ Generate beep sound using JS
function playBeep() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";      // sound wave type
    oscillator.frequency.value = 700; // frequency in Hz
    gainNode.gain.value = 0.2;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8); // 0.8 seconds beep
}

// Format seconds → MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// Update the displayed time
function updateDisplay() {
    timeDisplay.textContent = formatTime(remainingSeconds);
}

// Show a message
function showMessage(text, type = "") {
    messageEl.textContent = text;
    messageEl.className = "message " + type;
}

// Refresh notification status
function refreshNotificationStatus() {
    if (!("Notification" in window)) {
        notificationStatus.textContent = "Notifications: Not Supported";
        enableNotificationsBtn.disabled = true;
        return;
    }

    if (Notification.permission === "granted") {
        notificationStatus.textContent = "Notifications: Allowed ✅";
    } else if (Notification.permission === "denied") {
        notificationStatus.textContent = "Notifications: Blocked ❌";
    } else {
        notificationStatus.textContent = "Notifications: Not Requested";
    }
}

// Ask for notification permission
enableNotificationsBtn.addEventListener("click", () => {
    Notification.requestPermission().then(refreshNotificationStatus);
});

// ✅ Alarm Trigger (Notification + JS Beep)
function triggerAlarm() {
    playBeep(); // JS-generated sound

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Timer Finished!", {
            body: "⏰ Your countdown has reached zero!",
        });
    }
}

// Start Button
startBtn.addEventListener("click", () => {
    if (!isRunning && remainingSeconds === 0) {
        const value = Number(secondsInput.value);
        if (value <= 0) {
            showMessage("Enter valid seconds!", "error");
            return;
        }
        remainingSeconds = value;
        updateDisplay();
    }

    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    secondsInput.disabled = true;
    showMessage("");

    countdownInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            secondsInput.disabled = false;
            showMessage("Time Up!", "success");
            triggerAlarm();
        }
    }, 1000);
});

// Pause Button
pauseBtn.addEventListener("click", () => {
    clearInterval(countdownInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    showMessage("Paused", "success");
});

// Reset Button
resetBtn.addEventListener("click", () => {
    clearInterval(countdownInterval);
    remainingSeconds = 0;
    isRunning = false;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    secondsInput.disabled = false;
    showMessage("Reset", "success");
});

// On Load
window.addEventListener("load", () => {
    updateDisplay();
    refreshNotificationStatus();
});
