
     const databaseURL = "https://mamun-4relay-off-default-rtdb.firebaseio.com/";
        const databaseSecret = "qRvvjyq1hWfswNHqIzGG2x1iwou6h4iYzYtwdGfH";

        // Dummy Login Credentials
        const validEmail = "afrinakhatun6037@gmail.com";
        const validPassword = "2323";

        // Login Function
        function login() {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (email === validEmail && password === validPassword) {
                document.querySelector(".login-container").classList.add("hidden");
                document.querySelector(".control-container").classList.remove("hidden");
                fetchRelayStates();
            } else {
                alert("Invalid email or password!");
            }
        }

// Toggle Relay Function
async function toggleRelay(relayNumber) {
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);
    const isChecked = relaySwitch.checked;
    const newState = isChecked ? "on" : "off";

    try {
        // Update Relay State in Firebase 
              await fetch(`${databaseURL}/firebase25july/relay${relayNumber}.json?auth=${databaseSecret}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newState),
        });

        console.log(`Relay ${relayNumber} is now ${newState}`);
    } catch (error) {
        console.error("Failed to update relay state:", error);
        alert("Could not update relay state.");
    }
}

// Fetch Relay States from Firebase
async function fetchRelayStates() {
    try {
        const response = await fetch(`${databaseURL}/firebase25july.json?auth=${databaseSecret}`);
        const data = await response.json();

        for (let i = 1; i <= 4; i++) {
            const relaySwitch = document.getElementById(`relay${i}Switch`);
            const state = data[`relay${i}`] || "Off";
            relaySwitch.checked = state === "on";
        }
    } catch (error) {
        console.error("Failed to fetch relay states:", error);
        alert("Could not fetch relay states.");
    }
}


function setTimer(relayNumber) {
    const timeInput = document.getElementById(`timeInput${relayNumber}`);
    const actionSelect = document.getElementById(`actionSelect${relayNumber}`);
    const timerDisplay = document.getElementById(`timer${relayNumber}`);
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);
    const button = document.getElementById(`timerButton${relayNumber}`); // বাটনের রেফারেন্স

    const action = actionSelect.value;

    if (action === "reset") {
        resetTimer(relayNumber);
        button.classList.remove("on");
        button.classList.add("off");
        return;
    }

    const minutes = parseInt(timeInput.value);
    if (isNaN(minutes) || minutes <= 0) {
        alert("Please enter a valid time!");
        return;
    }

    let timeLeft = minutes * 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:00`;
    timerDisplay.classList.add("on");
    timerDisplay.classList.remove("off");

    // বাটনের রঙ পরিবর্তন
    button.classList.add(action === "on" ? "on" : "off");
    button.classList.remove(action === "on" ? "off" : "on");

    const interval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            timerDisplay.classList.remove("on");
            timerDisplay.classList.add("off");

            // বাটনের রঙ অফ করার জন্য পরিবর্তন
            button.classList.remove("on");
            button.classList.add("off");

            relaySwitch.checked = action === "on";
            toggleRelay(relayNumber);
            console.log(`Timer for relay ${relayNumber} completed. Action: ${action}`);
        }
        timeLeft--;
    }, 1000);

    timerDisplay.dataset.interval = interval;
}

function resetTimer(relayNumber) {
    const timerDisplay = document.getElementById(`timer${relayNumber}`);
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);
    const button = document.getElementById(`timerButton${relayNumber}`); // বাটন রেফারেন্স

    const existingInterval = timerDisplay.dataset.interval;
    if (existingInterval) {
        clearInterval(existingInterval);
    }

    timerDisplay.textContent = "00:00";
    timerDisplay.classList.remove("on");
    timerDisplay.classList.add("off");

    // বাটন রঙ পরিবর্তন
    button.classList.remove("on");
    button.classList.add("off");

    relaySwitch.checked = false;
    console.log(`Timer for relay ${relayNumber} has been reset.`);
}



// Alarm Function with Reset Option
function setAlarm(relayNumber) {
    const alarmTimeInput = document.getElementById(`alarmTime${relayNumber}`);
    const alarmActionSelect = document.getElementById(`alarmAction${relayNumber}`);
    const countdownDisplay = document.getElementById(`countdownDisplay${relayNumber}`);
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);

    const alarmTime = alarmTimeInput.value;
    const action = alarmActionSelect.value;

    if (action === "resetalarm") {
        // Reset Alarm Logic
        resetAlarm(relayNumber);
        button.classList.remove("on");
        button.classList.add("off");
        return;
    }

    if (!alarmTime) {
        alert("Please set a valid alarm time!");
        return;
    }

    const alarmDate = new Date();
    const [hours, minutes] = alarmTime.split(":").map(Number);
    alarmDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (alarmDate <= now) {
        alert("Alarm time must be in the future!");
        return;
    }

    // Calculate remaining time
    const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = alarmDate - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            countdownDisplay.textContent = "00:00:00";

            // Perform the action (turn relay ON/OFF)
            relaySwitch.checked = action === "on";
            toggleRelay(relayNumber);
            alert(`Alarm triggered for relay ${relayNumber}: ${action.toUpperCase()}`);

 // রঙ ডিফল্টে ফিরিয়ে আনুন
            button.classList.remove("on");
            button.classList.add("off");

        } else {
            const hrs = String(Math.floor(timeLeft / 3600000)).padStart(2, "0");
            const mins = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(2, "0");
            const secs = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");
            countdownDisplay.textContent = `${hrs}:${mins}:${secs}`;
        }
    }, 1000);

    // Save interval ID for reset functionality
    countdownDisplay.dataset.interval = interval;
// বাটনের রঙ পরিবর্তন
    button.classList.add("on");
    button.classList.remove("off");
    console.log(`Alarm set for relay ${relayNumber} at ${alarmTime}, action: ${action}`);
}

// Reset Alarm Function
function resetAlarm(relayNumber) {
    const countdownDisplay = document.getElementById(`countdownDisplay${relayNumber}`);
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);

    const existingInterval = countdownDisplay.dataset.interval;
    if (existingInterval) {
        clearInterval(existingInterval); // Clear the existing timer
    }

    countdownDisplay.textContent = "--:--:--"; // Reset countdown display
    relaySwitch.checked = false; // Turn off the relay

// বাটনের রঙ ডিফল্টে ফিরিয়ে আনুন
    button.classList.remove("on");
    button.classList.add("off");

    console.log(`Alarm for relay ${relayNumber} has been reset.`);
}



 function updateClock() {
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const ampmEl = document.getElementById('ampm');

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
            ampmEl.textContent = ampm;
        }

        setInterval(updateClock, 1000);
        updateClock(); // Initialize clock immediately

