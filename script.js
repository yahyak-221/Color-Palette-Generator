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
