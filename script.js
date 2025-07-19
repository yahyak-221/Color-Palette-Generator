const colors = [];
let numColors = 5;

window.onload = function () {
  const savedNum = localStorage.getItem("numColors");
  if (savedNum) {
    numColors = parseInt(savedNum);
    document.getElementById("colorCount").value = numColors;
    document.getElementById("colorCountValue").textContent = numColors;
  }

  const saved = localStorage.getItem("palette");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (let i = 0; i < parsed.length; i++) {
      colors[i] = parsed[i];
    }
  }

  const colorSlider = document.getElementById("colorCount");
  const colorCountValue = document.getElementById("colorCountValue");
  colorSlider.addEventListener("input", () => {
    numColors = parseInt(colorSlider.value);
    colorCountValue.textContent = numColors;
    colors.length = numColors;
    localStorage.setItem("numColors", numColors);
    generatePalette();
  });

  generatePalette();
  const urlParams = new URLSearchParams(window.location.search);
  const urlColors = urlParams.get("colors");

  if (urlColors) {
    const decodedColors = urlColors
      .split("-")
      .map((c) => `#${c.toUpperCase()}`);
    for (let i = 0; i < decodedColors.length; i++) {
      colors[i] = { color: decodedColors[i], locked: false };
    }
    numColors = decodedColors.length;
    document.getElementById("colorCount").value = numColors;
    document.getElementById("colorCountValue").textContent = numColors;
  }
};

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#1f1f1f" : "#f4f4f4";
}

function generatePalette() {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";

  for (let i = 0; i < numColors; i++) {
    let color;
    if (colors[i] && colors[i].locked) {
      color = colors[i].color;
    } else {
      color = generateRandomColor();
    }

    colors[i] = {
      color,
      locked: colors[i] ? colors[i].locked : false,
    };

    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = color;

    const textColor = getContrastColor(color);

    const lockIcon = document.createElement("div");
    lockIcon.className = "lock-icon";
    lockIcon.innerHTML = colors[i].locked ? "🔒" : "🔓";
    lockIcon.style.color = textColor;
    if (colors[i].locked) lockIcon.classList.add("locked");

    lockIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      colors[i].locked = !colors[i].locked;
      lockIcon.innerHTML = colors[i].locked ? "🔒" : "🔓";
      lockIcon.classList.toggle("locked", colors[i].locked);
      savePalette();
    });

    const refreshIcon = document.createElement("div");
    refreshIcon.className = "refresh-icon";
    refreshIcon.innerHTML = "🔁";
    refreshIcon.style.color = textColor;

    refreshIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!colors[i].locked) {
        const newColor = generateRandomColor();
        updateColor(i, newColor);
      }
    });

    const code = document.createElement("div");
    code.className = "color-code";
    code.innerText = color;
    code.style.color = textColor;

    box.addEventListener("click", () => {
      const currentColor = colors[i].color;
      const toastTextColor = getContrastColor(currentColor);

      navigator.clipboard.writeText(currentColor);
      Toastify({
        text: `${currentColor} copied!`,
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: currentColor,
        stopOnFocus: true,
        style: {
          color: toastTextColor,
        },
      }).showToast();
    });

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = color;
    picker.style.position = "absolute";
    picker.style.bottom = "8px";
    picker.style.left = "50%";
    picker.style.transform = "translateX(-50%)";
    picker.style.border = "none";
    picker.style.cursor = "pointer";
    picker.style.opacity = "0.7";

    picker.addEventListener("input", (e) => {
      const pickedColor = e.target.value.toUpperCase();
      updateColor(i, pickedColor);
    });

    box.appendChild(lockIcon);
    box.appendChild(refreshIcon);
    box.appendChild(code);
    box.appendChild(picker);
    palette.appendChild(box);
  }

  savePalette();
  palette.appendChild(box);
}

function initSortable() {
  const palette = document.getElementById("palette");

  Sortable.create(palette, {
    animation: 150,
    onEnd: function (evt) {
      const newOrder = [];
      const boxes = document.querySelectorAll(".color-box");
      boxes.forEach((box) => {
        const colorCode = box.querySelector(".color-code").innerText;
        const original = colors.find((c) => c.color === colorCode);
        newOrder.push({ ...original });
      });
      for (let i = 0; i < newOrder.length; i++) {
        colors[i] = newOrder[i];
      }
      savePalette();
    },
  });
}

initSortable();
savePalette();

function updateColor(index, newColor) {
  const box = document.getElementsByClassName("color-box")[index];
  const lockIcon = box.querySelector(".lock-icon");
  const refreshIcon = box.querySelector(".refresh-icon");
  const code = box.querySelector(".color-code");
  const picker = box.querySelector("input[type='color']");

  colors[index].color = newColor;
  box.style.backgroundColor = newColor;
  picker.value = newColor;
  code.innerText = newColor;

  const textColor = getContrastColor(newColor);
  lockIcon.style.color = textColor;
  refreshIcon.style.color = textColor;
  code.style.color = textColor;

  savePalette();
}

function savePalette() {
  localStorage.setItem("palette", JSON.stringify(colors));
}

function saveCurrentPalette() {
  const saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");
  saved.push([...colors]); // Clone the current palette
  localStorage.setItem("savedPalettes", JSON.stringify(saved));
  Toastify({
    text: "Palette saved!",
    duration: 2000,
    gravity: "top",
    position: "center",
    backgroundColor: "#333",
    style: { color: "#fff" },
  }).showToast();
}

function showSavedPalettes() {
  const modal = document.getElementById("savedPalettesModal");
  modal.innerHTML = "";
  modal.style.display = "block";
  modal.style.position = "fixed";
  modal.style.top = "20%";
  modal.style.left = "50%";
  modal.style.transform = "translateX(-50%)";
  modal.style.background = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "10px";
  modal.style.zIndex = "999";

  const saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");

  if (saved.length === 0) {
    modal.innerHTML = "<p>No saved palettes.</p>";
    return;
  }

  saved.forEach((palette, index) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.marginBottom = "10px";
    row.style.cursor = "pointer";

    palette.forEach((c) => {
      const preview = document.createElement("div");
      preview.style.backgroundColor = c.color;
      preview.style.width = "30px";
      preview.style.height = "30px";
      preview.style.marginRight = "5px";
      preview.style.borderRadius = "5px";
      row.appendChild(preview);
    });

    palette.forEach((c) => {
      const preview = document.createElement("div");
      preview.style.backgroundColor = c.color;
      preview.style.width = "30px";
      preview.style.height = "30px";
      preview.style.marginRight = "5px";
      preview.style.borderRadius = "5px";
      preview.title = c.color;

      preview.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(c.color);
        Toastify({
          text: `${c.color} copied!`,
          duration: 2000,
          gravity: "top",
          position: "center",
          backgroundColor: c.color,
          style: {
            color: getContrastColor(c.color),
          },
        }).showToast();
      });

      row.appendChild(preview);
    });

    modal.appendChild(row);
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.onclick = () => (modal.style.display = "none");
  modal.appendChild(closeBtn);
}

document.getElementById("downloadImage").addEventListener("click", () => {
  html2canvas(document.getElementById("palette")).then((canvas) => {
    const link = document.createElement("a");
    link.download = "palette.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById("downloadJSON").addEventListener("click", () => {
  const paletteData = colors.map((c) => c.color);
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(paletteData, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "palette.json");
  dlAnchor.click();
});

document.getElementById("shareBtn").addEventListener("click", () => {
  const colorCodes = colors.map((c) => c.color.replace("#", "")).join("-");
  const shareURL = `${window.location.origin}${window.location.pathname}?colors=${colorCodes}`;

  navigator.clipboard.writeText(shareURL).then(() => {
    Toastify({
      text: "Link copied to clipboard!",
      duration: 2000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4CAF50",
      style: { color: "#fff" },
    }).showToast();
  });
});

function fetchSmartPalette() {
  fetch("https://www.thecolorapi.com/scheme?mode=random&count=5")
    .then((res) => res.json())
    .then((data) => {
      const paletteData = data.colors.map((c) => c.hex.value.toUpperCase());

      numColors = paletteData.length;
      document.getElementById("colorCount").value = numColors;
      document.getElementById("colorCountValue").textContent = numColors;

      for (let i = 0; i < numColors; i++) {
        colors[i] = {
          color: paletteData[i],
          locked: false,
        };
      }

      generatePalette();

      Toastify({
        text: "Smart Palette Loaded!",
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#333",
        style: { color: "#fff" },
      }).showToast();
    })
    .catch((err) => {
      console.error("ColorAPI error:", err);
      Toastify({
        text: "Failed to fetch smart palette",
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: "#e74c3c",
        style: { color: "#fff" },
      }).showToast();
    });
}
