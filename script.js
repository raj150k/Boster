// --- Default Credentials ---
const DEFAULT_USER = "raj150k";
const DEFAULT_PASS = "raj150k"; 

// --- DOM Elements ---
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const passwordInput = document.getElementById('passwordInput');
const errorMsg = document.getElementById('errorMsg');
const videoLinkInput = document.getElementById('videoLink');
const multiplierSelect = document.getElementById('multiplier');
const videoGrid = document.getElementById('videoGrid');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const actionBtn = document.getElementById('actionBtn');
const adminPanel = document.getElementById('adminPanel');

// --- Admin Panel Elements ---
const newUsernameInput = document.getElementById('newUsername');
const newPasswordInput = document.getElementById('newPassword');
const userListDiv = document.getElementById('userList');

// --- Device Lock System Variables ---
// আমরা ডিভাইসের একটি ইউনিক আইডি তৈরি করব (User Agent + Screen Resolution)
function getDeviceId() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const screenRes = screen.width + "x" + screen.height;
    // একটি হ্যাশ তৈরি করা যা ডিভাইস আইডেন্টাফাই করে
    return btoa(userAgent + screenRes); 
}

// লোকাল স্টোরেজে সেভ করার জন্য কী (Key)
const DEVICE_LOCK_KEY = "vip_device_lock_id";

// --- Initialization: Load Users & Check Device Lock ---
let users = JSON.parse(localStorage.getItem('vipUsers')) || [
    { user: DEFAULT_USER, pass: DEFAULT_PASS }
];

// যদি আগে কোনো ডাটা না থাকে তবে ডিফল্ট সেভ করি
if (!localStorage.getItem('vipUsers')) {
    localStorage.setItem('vipUsers', JSON.stringify(users));
}

// --- Login Logic with Device Lock ---
function handleLogin() {
    const pass = passwordInput.value.trim();
    
    // ১. পাসওয়ার্ড চেক করা
    const validUser = users.find(u => u.pass === pass);

    if (!validUser) {
        errorMsg.innerText = "ভুল পাসওয়ার্ড!";
        errorMsg.style.animation = "shake 0.3s";
        setTimeout(() => errorMsg.style.animation = "", 300);
        return;
    }

    // ২. ডিভাইস লক চেক করা
    const currentDeviceId = getDeviceId();
    const savedDeviceId = localStorage.getItem(DEVICE_LOCK_KEY);

    if (savedDeviceId) {
        // যদি আগেই কোনো ডিভাইস সেভ থাকে, তবে বর্তমান ডিভাইসের সাথে মিলছে কিনা দেখা
        if (savedDeviceId !== currentDeviceId) {
            errorMsg.innerText = "⚠️ Device Locked! অন্য ডিভাইস থেকে ঢুকতে পারবেন না।";
            errorMsg.style.color = "#ffd700"; // Gold color for warning
            return; // লগইন বন্ধ
        }
    } else {
        // যদি আগে কোনো ডিভাইস সেভ না থাকে, তবে বর্তমান ডিভাইসকে 'প্রধান' হিসেবে সেভ করি
        localStorage.setItem(DEVICE_LOCK_KEY, currentDeviceId);
    }

    // ৩. সফল লগইন
    loginScreen.classList.remove('active');
    setTimeout(() => {
        loginScreen.style.display = 'none';
        dashboardScreen.classList.add('active');
        dashboardScreen.style.display = 'block';
        passwordInput.value = '';
        errorMsg.innerText = "";
        errorMsg.style.color = "#ff4757"; // Reset color
    }, 500);
}

function handleLogout() {
    dashboardScreen.classList.remove('active');
    setTimeout(() => {
        dashboardScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        loginScreen.classList.add('active');
    }, 500);
}

// --- Auto Boosting Logic (View Increase) ---
function extractYouTubeID(url) {
    if (!url) return null;
    if (url.includes('youtu.be')) return url.split('/').pop();
    if (url.includes('youtube.com')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v');
    }
    if (url.length === 11) return url;
    return null;
}

function startAutoBoosting() {
    const rawLink = videoLinkInput.value.trim();
    const multiplier = parseInt(multiplierSelect.value);
    
    const videoId = extractYouTubeID(rawLink);

    if (!videoId) {
        alert("দয়া করে সঠিক YouTube লিংক দিন!");
        return;
    }

    // UI Updates
    actionBtn.disabled = true;
    actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অটো চালু হচ্ছে...';
    videoGrid.innerHTML = ""; 
    statusText.innerText = `অটো প্লে শুরু হচ্ছে: ${videoId}`;
    
    // Progress Animation
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) clearInterval(interval);
    }, 100);

    // Generate Video Cards with Autoplay & Loop
    for (let i = 0; i < multiplier; i++) {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        // YouTube Embed Params: autoplay=1, loop=1, mute=1 (for auto play), controls=0
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1&controls=0&showinfo=0&rel=0`;

        card.innerHTML = `
            <div class="view-badge">#${i + 1}</div>
            <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
        
        videoGrid.appendChild(card);
    }

    // Finish Animation
    setTimeout(() => {
        statusText.innerText = `✅ অটো প্লে চলছে... ${multiplier}টি ভিউ লোড হয়েছে!`;
        actionBtn.disabled = false;
        actionBtn.innerHTML = '<i class="fas fa-magic"></i> আবার শুরু করুন';
        progressBar.style.width = '100%';
    }, 2000);
}

// --- Admin Panel Logic ---
function toggleAdminPanel() {
    if (adminPanel.style.display === 'block') {
        adminPanel.style.display = 'none';
    } else {
        adminPanel.style.display = 'block';
        renderUserList();
    }
}

function addNewUser() {
    const newUser = newUsernameInput.value.trim();
    const newPass = newPasswordInput.value.trim();

    if (newUser && newPass) {
        // Add to array
        users.push({ user: newUser, pass: newPass });
        // Save to LocalStorage
        localStorage.setItem('vipUsers', JSON.stringify(users));
        
        // Clear inputs
        newUsernameInput.value = '';
        newPasswordInput.value = '';
        
        alert(`ইউজার "${newUser}" সফলভাবে তৈরি হয়েছে!`);
        renderUserList();
    } else {
        alert("ইউজারনেম এবং পাসওয়ার্ড দিন!");
    }
}

function renderUserList() {
    userListDiv.innerHTML = "";
    users.forEach((u, index) => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <span><b>${u.user}</b>: ${u.pass}</span>
            <button onclick="deleteUser(${index})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button>
        `;
        userListDiv.appendChild(div);
    });
}

function deleteUser(index) {
    if (users[index].user === DEFAULT_USER && users[index].pass === DEFAULT_PASS) {
        alert("ডিফল্ট এডমিন ডিলিট করা যাবে না!");
        return;
    }
    users.splice(index, 1);
    localStorage.setItem('vipUsers', JSON.stringify(users));
    renderUserList();
}

// --- Helper: Clear Device Lock (Optional Debugging) ---
// যদি চাও যে অন্য ডিভাইস থেকে ঢুকতে পারো, তবে কনসোল থেকে এই লাইনটি রান করো:
// localStorage.removeItem('vip_device_lock_id');
// তারপর পেজ রিলোড দাও।

// Add Shake Animation CSS dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(styleSheet);
