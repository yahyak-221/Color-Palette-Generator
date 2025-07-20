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
};

function generateRandomColor(theme = "random") {
  const h = () => Math.floor(Math.random() * 360); // Hue: 0–359
  const s = () => Math.floor(Math.random() * 30) + 70; // Saturation: 70–100%
  const l = () => Math.floor(Math.random() * 20) + 40; // Lightness: 40–60%

  let hue;

  switch (theme) {
    case "warm":
      hue = Math.floor(Math.random() * 60) + 0; // Red–Orange (0–60)
      break;
    case "cool":
      hue = Math.floor(Math.random() * 120) + 180; // Cyan–Blue (180–300)
      break;
    case "earthy":
      hue = [25, 30, 35, 40, 90, 120, 150][Math.floor(Math.random() * 7)]; // Browns/Greens
      break;
    case "pastel":
      return hslToHex(
        h(),
        Math.floor(Math.random() * 30) + 40,
        Math.floor(Math.random() * 20) + 75
      );
    case "monochrome":
      const step = Math.floor(200 / (numColors - 1));
      const gray = 30 + step * i;
      return rgbToHex(gray, gray, gray);

    default:
      hue = h();
  }

  return hslToHex(hue, s(), l());
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  g = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  b = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`.toUpperCase();
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
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
  const selectedTheme =
    document.getElementById("themeSelector")?.value || "random";
  palette.innerHTML = "";

  for (let i = 0; i < numColors; i++) {
    let color;

    if (colors[i] && colors[i].locked) {
      color = colors[i].color;
    } else {
      if (selectedTheme === "monochrome") {
        const minGray = 20;
        const maxGray = 235;
        const gray = Math.round(
          maxGray - ((maxGray - minGray) * i) / (numColors - 1)
        );
        color = rgbToHex(gray, gray, gray);
      } else {
        color = generateRandomColor(selectedTheme);
      }
    }

    colors[i] = {
      color,
      locked: colors[i]?.locked || false,
    };

    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = color;
    box.setAttribute("data-aos", "zoom-in");

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
        const newColor =
          selectedTheme === "monochrome"
            ? (() => {
                const minGray = 20;
                const maxGray = 235;
                const step = Math.floor((maxGray - minGray) / (numColors - 1));
                const gray = maxGray - step * i;
                return rgbToHex(gray, gray, gray);
              })()
            : generateRandomColor(selectedTheme);
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
      showColorHarmonies(pickedColor);
    });

    box.appendChild(lockIcon);
    box.appendChild(refreshIcon);
    box.appendChild(code);
    box.appendChild(picker);
    palette.appendChild(box);
  }

  savePalette();
  AOS.refresh();
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
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
  saved.push([...colors]);
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
  const randomColor = generateRandomColor().replace("#", "");

  fetch(
    `https://www.thecolorapi.com/scheme?hex=${randomColor}&mode=triad&count=5`
    // `mode=analogic,monochrome,monochrome-dark,monochrome-light,analogic-complement,complement,triad,quad`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const paletteData = data.colors.map((color) =>
        color.hex.value.toUpperCase()
      );

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
    .catch((error) => {
      console.error("Color API fetch failed:", error);
      Toastify({
        text: "Failed to fetch smart palette 😓",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#e74c3c",
        style: { color: "#fff" },
      }).showToast();
    });
}

function saveCurrentPalette() {
  const paletteColors = Array.from(document.querySelectorAll(".color-box")).map(
    (box) => box.style.backgroundColor
  );

  const saved = JSON.parse(localStorage.getItem("saved-palettes")) || [];
  saved.push({ colors: paletteColors, date: new Date().toISOString() });
  localStorage.setItem("saved-palettes", JSON.stringify(saved));

  Toastify({
    text: "Palette saved!",
    duration: 2000,
    gravity: "bottom",
    backgroundColor: "#4caf50",
  }).showToast();
}

function showSavedPalettes() {
  const saved = JSON.parse(localStorage.getItem("saved-palettes")) || [];
  const modal = document.getElementById("savedPalettesModal");
  modal.innerHTML = `<h3>Saved Palettes</h3>`;

  saved.reverse().forEach((palette) => {
    const preview = document.createElement("div");
    preview.style.display = "flex";
    preview.style.margin = "10px 0";
    preview.style.justifyContent = "center";
    preview.innerHTML = palette.colors
      .map(
        (c) =>
          `<div style="width:30px;height:30px;margin:2px;border-radius:4px;background:${c}"></div>`
      )
      .join("");
    preview.style.cursor = "pointer";
    preview.onclick = () => applyPalette(palette.colors);
    modal.appendChild(preview);
  });

  modal.style.display = "block";
}

function applyPalette(colors) {
  const paletteContainer = document.getElementById("palette");
  paletteContainer.innerHTML = "";
  colors.forEach((color) => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = color;
    box.innerHTML = `<div class="color-code">${color}</div>`;
    paletteContainer.appendChild(box);
  });
}

function exportAsCSSVars() {
  const colors = Array.from(document.querySelectorAll(".color-box"))
    .map((box, i) => `--color-${i + 1}: ${box.style.backgroundColor};`)
    .join("\n");

  const output = `:root {\n${colors}\n}`;
  downloadText("palette-vars.css", output);
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
}

function loadPaletteFromURL() {
  const params = new URLSearchParams(window.location.search);
  const colorParam = params.get("colors");
  if (colorParam) {
    const colors = colorParam.split("-").map((c) => `#${c}`);
    renderPalette(colors);
  }
}

function renderPalette(colors) {
  const paletteContainer = document.getElementById("palette");
  paletteContainer.innerHTML = "";

  colors.forEach((hex, index) => {
    const box = document.createElement("div");
    box.className = "palette-box";
    box.style.backgroundColor = hex;

    const label = document.createElement("span");
    label.className = "color-label";
    label.textContent = hex.toUpperCase();

    box.appendChild(label);
    paletteContainer.appendChild(box);
  });
}

function isPaletteDark(colors) {
  let darkCount = 0;
  colors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    if (luminance < 0.5) darkCount++;
  });
  return darkCount > colors.length / 2;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
