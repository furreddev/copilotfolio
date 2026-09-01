import { MUSIC_TRACK } from "./music/track-config.js";

const CONFIG = {
  displayName: "Epix",
  discordUserId: "1279029563846033414",
  socialLinks: [
    { emoji: "▶️", label: "YouTube", href: "https://youtube.com/furreddev" },
    { emoji: "✖️", label: "X", href: "https://x.com/epixonx" },
    { emoji: "🎮", label: "Roblox", href: "https://roblox.com/users/2201444586/profile" },
    { emoji: "🐙", label: "GitHub", href: "https://github.com/furreddev" },
    { emoji: "✈️", label: "Telegram", href: "https://t.me/purringcat" },
    { emoji: "📧", label: "Email", href: "mailto:yay@sillycat.tech" },
    { emoji: "📸", label: "Instagram", href: "https://instagram.com/furreddev" }
  ]
};

const page = document.getElementById("page");
const parallaxItems = document.querySelectorAll(".parallax");
const bootOverlay = document.getElementById("bootOverlay");
const bootTerminal = document.getElementById("bootTerminal");
const bootLog = document.getElementById("bootLog");
const bootStatus = document.getElementById("bootStatus");
const bootPrompt = document.getElementById("bootPrompt");
const linksRoot = document.getElementById("socialLinks");
const liquidSlider = document.getElementById("liquidSlider");
const secretHint = document.getElementById("secretHint");
const audio = document.getElementById("audio");
const musicToggle = document.getElementById("musicToggle");
const trackTitle = document.getElementById("trackTitle");
const trackTime = document.getElementById("trackTime");

const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");
const discordStatus = document.getElementById("discordStatus");
const displayName = document.getElementById("displayName");
const guildTag = document.getElementById("guildTag");
const avatar = document.getElementById("avatar");
const avatarDecoration = document.getElementById("avatarDecoration");
const activityText = document.getElementById("activityText");
const discordProfileButton = document.getElementById("discordProfileButton");
const discordInspector = document.getElementById("discordInspector");
const closeInspector = document.getElementById("closeInspector");
const inspectorCommand = document.getElementById("inspectorCommand");
const inspectorOutput = document.getElementById("inspectorOutput");

let latestDiscordData = null;
let inspectorRun = 0;
let bootAwaitingEnter = false;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches
  || "ontouchstart" in window
  || navigator.maxTouchPoints > 0;

const BOOT_TOTAL_DURATION_MS = 10000;
const BOOT_COMMANDS = [
  "init --profile epix.main",
  "load_kernel --theme orange-purple",
  "mount /presence/discord",
  "sync --social-links --emoji",
  "attach --music-driver /music",
  "calibrate --tilt-engine",
  "open --inspector-panel",
  "verify --identity Epix",
  "start --copilotfolio"
];

displayName.textContent = CONFIG.displayName;

function resolveTrackUrl(filename) {
  return `./music/${filename
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

if (MUSIC_TRACK.filename) {
  audio.src = resolveTrackUrl(MUSIC_TRACK.filename);
  trackTitle.textContent = `Now playing: ${MUSIC_TRACK.displayName || MUSIC_TRACK.filename}`;
} else {
  trackTitle.textContent = "No track configured";
  musicToggle.disabled = true;
  musicToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
}

function setupLinks() {
  CONFIG.socialLinks.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.className = "social-link";
    a.ariaLabel = link.label;
    a.innerHTML = `<span class="social-link-icon" aria-hidden="true">${link.emoji || "🔗"}</span>`;

    a.addEventListener("mouseenter", () => {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = a;
      liquidSlider.style.opacity = "1";
      liquidSlider.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
      liquidSlider.style.width = `${offsetWidth}px`;
      liquidSlider.style.height = `${offsetHeight}px`;
    });

    linksRoot.appendChild(a);
  });

  linksRoot.addEventListener("mouseleave", () => {
    liquidSlider.style.opacity = "0";
  });
}

setupLinks();

function unlockMainSite() {
  if (!bootAwaitingEnter) return;
  bootAwaitingEnter = false;
  page.classList.remove("boot-hidden");
  bootOverlay.classList.add("done");
  setTimeout(() => {
    bootOverlay.remove();
  }, 360);
}

async function runMainBoot() {
  const stepDelay = Math.floor(BOOT_TOTAL_DURATION_MS / BOOT_COMMANDS.length);

  for (let i = 0; i < BOOT_COMMANDS.length; i += 1) {
    const line = document.createElement("p");
    line.className = "boot-log-line";
    line.textContent = BOOT_COMMANDS[i];
    bootLog.appendChild(line);

    const percent = Math.round(((i + 1) / BOOT_COMMANDS.length) * 100);
    bootStatus.textContent = `Booting profile shell... ${percent}%`;
    bootTerminal.scrollTop = bootTerminal.scrollHeight;
    await sleep(stepDelay);
  }

  bootStatus.textContent = "Boot complete. Awaiting input.";
  bootPrompt.textContent = isTouchDevice ? "Tap to continue" : "Press Enter to continue";
  bootPrompt.classList.remove("hidden");
  bootTerminal.scrollTop = bootTerminal.scrollHeight;
  bootAwaitingEnter = true;
}

runMainBoot();

page.addEventListener("mousemove", (event) => {
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  parallaxItems.forEach((element) => {
    const depth = Number(element.dataset.depth || 0.08);
    const rotateX = -y * depth * 30;
    const rotateY = x * depth * 30;
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
});

page.addEventListener("mouseleave", () => {
  parallaxItems.forEach((element) => {
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
});

const statusColors = {
  online: "#43b581",
  idle: "#faa61a",
  dnd: "#f04747",
  offline: "#747f8d"
};

function decorationUrl(asset) {
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240&passthrough=false`;
}

function getAvatarUrl(id, avatarHash) {
  if (!avatarHash) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const format = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${format}?size=256`;
}

function statusLabel(status) {
  return status === "dnd" ? "do not disturb" : status;
}

async function loadDiscordPresence() {
  if (!CONFIG.discordUserId || CONFIG.discordUserId.includes("PUT_YOUR")) {
    discordStatus.textContent = "Add your Discord user ID in script.js to enable live status.";
    return null;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordUserId}`);
    const payload = await response.json();
    if (!payload.success) {
      throw new Error("Lanyard request failed");
    }

    const data = payload.data;
    latestDiscordData = data;
    const user = data.discord_user;
    const status = data.discord_status || "offline";

    const name = user.global_name || user.username || CONFIG.displayName;
    displayName.textContent = name;
    avatar.src = getAvatarUrl(user.id, user.avatar);

    if (user.avatar_decoration_data?.asset) {
      avatarDecoration.src = decorationUrl(user.avatar_decoration_data.asset);
      avatarDecoration.classList.remove("hidden");
    }

    const clanTag = user.clan?.tag ? `Guild tag: ${user.clan.tag}` : "Guild tag unavailable";
    guildTag.textContent = clanTag;

    statusDot.style.background = statusColors[status] || statusColors.offline;
    statusText.textContent = statusLabel(status);
    discordStatus.textContent = `${name} is ${statusLabel(status)}`;

    if (Array.isArray(data.activities) && data.activities.length > 0) {
      const custom = data.activities.find((activity) => activity.type === 4);
      const current = custom || data.activities[0];
      const details = [current.state, current.details].filter(Boolean).join(" • ");
      activityText.textContent = details || "No activity";
    }
    return data;
  } catch (error) {
    discordStatus.textContent = "Couldn't load Discord status right now.";
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDiscordInspectorData(data) {
  const user = data?.discord_user || {};
  const normalized = {
    userId: user.id || null,
    username: user.username || null,
    globalName: user.global_name || null,
    discriminator: user.discriminator || null,
    avatarHash: user.avatar || null,
    avatarDecorationAsset: user.avatar_decoration_data?.asset || null,
    bannerColor: user.banner_color || null,
    accentColor: user.accent_color || null,
    clan: user.clan || null,
    publicFlags: user.public_flags ?? null,
    status: data?.discord_status || "offline",
    activeOnWeb: data?.active_on_discord_web ?? null,
    activeOnDesktop: data?.active_on_discord_desktop ?? null,
    activeOnMobile: data?.active_on_discord_mobile ?? null,
    activities: Array.isArray(data?.activities) ? data.activities : [],
    spotify: data?.spotify || null,
    listeningToSpotify: Boolean(data?.listening_to_spotify),
    kv: data?.kv || null
  };

  return JSON.stringify(normalized, null, 2);
}

async function openDiscordInspector() {
  discordInspector.classList.add("open");
  discordInspector.setAttribute("aria-hidden", "false");
  inspectorCommand.textContent = "";
  inspectorOutput.textContent = "";
  const runId = ++inspectorRun;
  const command = `lanyard inspect --user ${CONFIG.discordUserId}`;

  for (const char of command) {
    if (runId !== inspectorRun) return;
    inspectorCommand.textContent += char;
    await sleep(22);
  }

  if (!latestDiscordData) {
    await loadDiscordPresence();
  }

  if (runId !== inspectorRun) return;
  inspectorOutput.textContent = latestDiscordData
    ? formatDiscordInspectorData(latestDiscordData)
    : "Failed to pull Discord account info.";
}

function closeDiscordInspector() {
  inspectorRun += 1;
  discordInspector.classList.remove("open");
  discordInspector.setAttribute("aria-hidden", "true");
}

loadDiscordPresence();
setInterval(loadDiscordPresence, 45000);

discordProfileButton.addEventListener("click", () => {
  openDiscordInspector();
});

closeInspector.addEventListener("click", () => {
  closeDiscordInspector();
});

musicToggle.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      await audio.play();
      musicToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      audio.pause();
      musicToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
  } catch {
    musicToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
  }
});

audio.addEventListener("timeupdate", () => {
  const minutes = Math.floor(audio.currentTime / 60);
  const seconds = Math.floor(audio.currentTime % 60)
    .toString()
    .padStart(2, "0");
  trackTime.textContent = `${minutes}:${seconds}`;
});

const secretSequence = ["E", "P", "I", "X"];
let entered = [];
let sequenceStart = null;

window.addEventListener("keydown", (event) => {
  if (!isTouchDevice && bootAwaitingEnter && event.key === "Enter") {
    unlockMainSite();
    return;
  }

  const key = event.key.toUpperCase();
  if (!secretSequence.includes(key)) return;

  const now = Date.now();
  if (!sequenceStart || now - sequenceStart > 10000) {
    entered = [];
    sequenceStart = now;
  }

  const expected = secretSequence[entered.length];
  if (key === expected) {
    entered.push(key);
    if (entered.length === secretSequence.length) {
      secretHint.classList.remove("hidden");
      entered = [];
      sequenceStart = null;
    }
  } else {
    entered = key === "E" ? ["E"] : [];
    sequenceStart = key === "E" ? now : null;
  }
});

if (isTouchDevice) {
  bootOverlay.addEventListener("pointerdown", () => {
    unlockMainSite();
  });
}
