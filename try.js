const colors = [];

window.onload = function () {
  const saved = localStorage.getItem("palette");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (let i = 0; i < parsed.length; i++) {
      colors[i] = parsed[i];
    }
  }
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

  for (let i = 0; i < 5; i++) {
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
        colors[i].color = newColor;
        box.style.backgroundColor = newColor;
        code.innerText = newColor;

        const newTextColor = getContrastColor(newColor);
        lockIcon.style.color = newTextColor;
        refreshIcon.style.color = newTextColor;
        code.style.color = newTextColor;

        savePalette();
      }
    });

    const code = document.createElement("div");
    code.className = "color-code";
    code.innerText = color;
    code.style.color = textColor;

    box.appendChild(lockIcon);
    box.appendChild(refreshIcon);
    box.appendChild(code);

    box.addEventListener("click", () => {
      navigator.clipboard.writeText(color);

      const toastTextColor = getContrastColor(color);

      Toastify({
        text: `${color} copied!`,
        duration: 2000,
        gravity: "top",
        position: "center",
        backgroundColor: color,
        style: {
          color: toastTextColor,
        },
        stopOnFocus: true,
      }).showToast();
    });

    palette.appendChild(box);
  }

  savePalette();
}

function savePalette() {
  localStorage.setItem("palette", JSON.stringify(colors));
}
