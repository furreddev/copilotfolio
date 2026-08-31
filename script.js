const CONFIG = {
  displayName: "Epix",
  discordUserId: "PUT_YOUR_DISCORD_USER_ID_HERE",
  musicUrl: "https://files.catbox.moe/yg5n4h.mp3",
  socialLinks: [
    { icon: "fa-brands fa-x-twitter", label: "X", href: "https://x.com" },
    { icon: "fa-brands fa-github", label: "GitHub", href: "https://github.com" },
    { icon: "fa-brands fa-discord", label: "Discord", href: "https://discord.com" },
    { icon: "fa-brands fa-youtube", label: "YouTube", href: "https://youtube.com" },
    { icon: "fa-solid fa-envelope", label: "Email", href: "mailto:hello@example.com" }
  ]
};

const page = document.getElementById("page");
const parallaxItems = document.querySelectorAll(".parallax");
const linksRoot = document.getElementById("socialLinks");
const liquidSlider = document.getElementById("liquidSlider");
const secretHint = document.getElementById("secretHint");
const audio = document.getElementById("audio");
const musicToggle = document.getElementById("musicToggle");
const trackTime = document.getElementById("trackTime");

const statusText = document.getElementById("statusText");
const statusDot = document.querySelector(".status-dot");
const discordStatus = document.getElementById("discordStatus");
const displayName = document.getElementById("displayName");
const guildTag = document.getElementById("guildTag");
const avatar = document.getElementById("avatar");
const avatarDecoration = document.getElementById("avatarDecoration");
const activityText = document.getElementById("activityText");
const discordProfileLink = document.getElementById("discordProfileLink");

displayName.textContent = CONFIG.displayName;
audio.src = CONFIG.musicUrl;

function setupLinks() {
  CONFIG.socialLinks.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.className = "social-link";
    a.ariaLabel = link.label;
    a.innerHTML = `<i class="${link.icon}" aria-hidden="true"></i>`;

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

page.addEventListener("mousemove", (event) => {
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  parallaxItems.forEach((element) => {
    const depth = Number(element.dataset.depth || 0.08);
    const moveX = x * depth * 60;
    const moveY = y * depth * 60;
    element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
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
    return;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordUserId}`);
    const payload = await response.json();
    if (!payload.success) {
      throw new Error("Lanyard request failed");
    }

    const data = payload.data;
    const user = data.discord_user;
    const status = data.discord_status || "offline";

    const name = user.global_name || user.username || CONFIG.displayName;
    displayName.textContent = name;
    avatar.src = getAvatarUrl(user.id, user.avatar);
    discordProfileLink.href = `https://discord.com/users/${user.id}`;

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
  } catch (error) {
    discordStatus.textContent = "Couldn't load Discord status right now.";
  }
}

loadDiscordPresence();
setInterval(loadDiscordPresence, 45000);

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
