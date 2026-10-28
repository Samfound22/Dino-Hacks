
const getRunner = () => {
  const r = window.Runner?.getInstance?.();

  if (!r) {
    console.error(
      "Dino game not found. Open chrome://dino and paste this code in that tab's Console."
    );
    return null;
  }

  return r;
};

const cheats = [
  {
    id: "god",
    name: "God Mode",
    icon: "🛡️",
    category: "survival",
    description: "Prevent obstacle collisions.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r) return console.error("Dino not found");

  if (window.dinoGodMode) {
    console.log("God Mode is already enabled!");
    return;
  }

  window.dinoOriginalCollision = r.checkForCollision;
  r.checkForCollision = () => false;
  window.dinoGodMode = true;

  console.log("🛡️ God Mode enabled!");
  console.log("Disable with: r.checkForCollision = window.dinoOriginalCollision; window.dinoGodMode = false");
})();`
  },
 
{
  id: "speed",
  name: "Super Speed",
  icon: "⚡",
  category: "physics",
  description: "Toggle Super Speed on or off.",
  code: `(() => {
  const r = Runner.getInstance();
  if (!r) return console.error("Dino not found");

  if (window.dinoSuperSpeed) {
    r.setSpeed(window.dinoOriginalSpeed || 6);
    window.dinoSuperSpeed = false;
    console.log("🐢 Super Speed OFF");
  } else {
    window.dinoOriginalSpeed = r.currentSpeed || 6;
    r.setSpeed(15);
    window.dinoSuperSpeed = true;
    console.log("⚡ Super Speed ON");
  }
})();`
},

  {
    id: "score",
    name: "Score Boost",
    icon: "🏆",
    category: "chaos",
    description: "Set the run's distance score.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r) return console.error("Dino not found");

  r.distanceRan = 100000;
  if (r.distanceMeter) {
    r.distanceMeter.update(100000);
  }

  console.log("🏆 Score updated. The displayed score may change again as the game runs.");
})();`
  },
  {
    id: "jump",
    name: "Super Jump",
    icon: "🚀",
    category: "physics",
    description: "Increase jump velocity.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r?.tRex) return console.error("Dino not found");

  r.tRex.setJumpVelocity(18);
  console.log("🚀 Super Jump velocity set!");
})();`
  },
  {
    id: "gravity",
    name: "Moon Gravity",
    icon: "🌙",
    category: "physics",
    description: "Inspect jump physics before changing gravity.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r?.tRex) return console.error("Dino not found");

  console.log("🌙 T-Rex physics object:", r.tRex.config);
  console.log("Jump-related properties:", Object.keys(r.tRex).filter(k => /jump|gravity|velocity/i.test(k)));
  console.log("This Chrome version may require a custom physics patch.");
})();`
  },
  {
    id: "float",
    name: "Levitation",
    icon: "🪶",
    category: "physics",
    description: "Inspect the Dino's vertical movement properties.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r?.tRex) return console.error("Dino not found");

  console.log("🪶 T-Rex object:", r.tRex);
  console.log("Vertical movement properties:", Object.keys(r.tRex).filter(k => /yPos|jump|duck|velocity/i.test(k)));
  console.log("Levitation needs a version-specific movement patch.");
})();`
  },
  {
    id: "auto",
    name: "Auto Play",
    icon: "🤖",
    category: "automation",
    description: "Automatically jump over approaching obstacles.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r?.tRex || !r?.horizon) {
    return console.error("Dino game objects not found!");
  }

  clearInterval(window.dinoAutoPlayTimer);

  window.dinoAutoPlayTimer = setInterval(() => {
    if (!r.playing || r.crashed) return;

    const trex = r.tRex;
    const obstacles = r.horizon.obstacles || [];
    const obstacle = obstacles[0];

    if (!obstacle || trex.jumping || trex.ducking) return;

    const distance = obstacle.xPos - trex.xPos;
    const speed = r.currentSpeed || 6;
    const jumpDistance = Math.max(90, speed * 12);

    if (distance > 0 && distance < jumpDistance) {
      trex.startJump(speed);
    }
  }, 20);

  console.log("🤖 Auto Play enabled!");
  console.log("Stop with: clearInterval(window.dinoAutoPlayTimer)");
})();`
  },
  {
    id: "night",
    name: "Night Mode",
    icon: "🌃",
    category: "chaos",
    description: "Toggle the game's color inversion.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r) return console.error("Dino not found");

  if (typeof r.invert !== "function") {
    return console.error("Color inversion isn't supported by this game instance.");
  }

  r.invert(true, 1);
  console.log("🌃 Night inversion requested!");
})();`
  },
  {
    id: "gameover",
    name: "Instant Game Over",
    icon: "💥",
    category: "chaos",
    description: "End the current run immediately.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r) return console.error("Dino not found");

  r.gameOver();
  console.log("💥 Game Over!");
})();`
  },
  {
    id: "empty",
    name: "Empty Desert",
    icon: "🏜️",
    category: "chaos",
    description: "Clear current obstacles.",
    code: `(() => {
  const r = Runner.getInstance();
  if (!r?.horizon?.obstacles) {
    return console.error("Obstacle manager not found");
  }

  r.horizon.obstacles.length = 0;
  console.log("🏜️ Current obstacles cleared!");
  console.log("New obstacles may still spawn.");
})();`
  }
];

const cheatList = document.getElementById("cheatList");
const searchInput = document.getElementById("searchInput");
const cheatCount = document.getElementById("cheatCount");
const toast = document.getElementById("toast");

let activeFilter = "all";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();

    const successful = document.execCommand("copy");
    area.remove();

    if (!successful) {
      showToast("Copy failed — select and copy the code manually.");
      return;
    }
  }

  showToast("Copied! Paste into the Dino Console 🦖");
}

function renderCheats() {
  if (!cheatList) return;

  const query = (searchInput?.value || "").toLowerCase().trim();

  const filtered = cheats.filter(cheat => {
    const matchesFilter =
      activeFilter === "all" || cheat.category === activeFilter;

    const matchesSearch =
      `${cheat.name} ${cheat.description} ${cheat.category}`
        .toLowerCase()
        .includes(query);

    return matchesFilter && matchesSearch;
  });

  if (cheatCount) {
    cheatCount.textContent = `${filtered.length} CHEATS`;
  }

  cheatList.innerHTML = filtered.map(cheat => `
    <article class="cheat-card" data-id="${escapeHTML(cheat.id)}">
      <div class="cheat-card-main">
        <div class="cheat-icon">${escapeHTML(cheat.icon)}</div>
        <div class="cheat-info">
          <h3>${escapeHTML(cheat.name)}</h3>
          <p>${escapeHTML(cheat.description)}</p>
        </div>
      </div>
      <div class="cheat-actions">
        <button class="preview-btn" data-preview="${escapeHTML(cheat.id)}">
          Code
        </button>
        <button class="copy-btn" data-copy="${escapeHTML(cheat.id)}">
          Copy Cheat
        </button>
      </div>
      <pre class="code-preview" id="preview-${escapeHTML(cheat.id)}"><code>${escapeHTML(cheat.code)}</code></pre>
    </article>
  `).join("");

  if (!filtered.length) {
    cheatList.innerHTML = `<p class="empty-state">No cheats found. Try another search.</p>`;
  }
}

searchInput?.addEventListener("input", renderCheats);

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderCheats();
  });
});

cheatList?.addEventListener("click", event => {
  const copyButton = event.target.closest("[data-copy]");
  const previewButton = event.target.closest("[data-preview]");

  if (copyButton) {
    const cheat = cheats.find(item => item.id === copyButton.dataset.copy);
    if (cheat) copyText(cheat.code);
  }

  if (previewButton) {
    const preview = document.getElementById(
      `preview-${previewButton.dataset.preview}`
    );

    if (preview) {
      preview.classList.toggle("open");
      previewButton.textContent =
        preview.classList.contains("open") ? "Hide Code" : "Code";
    }
  }
});

document.getElementById("copyGuide")?.addEventListener("click", () => {
  copyText(
    "1. Open chrome://dino in Chrome.\n" +
    "2. Press F12 and open Console.\n" +
    "3. Copy a cheat from Dino Hacks and paste it into the Console.\n" +
    "4. Press Enter to run it.\n" +
    "Note: Cheats are experimental and may behave differently across Chrome versions."
  );
});

renderCheats();
