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

    const lockIcon = document.createElement("div");
    lockIcon.className = "lock-icon";
    lockIcon.innerHTML = colors[i].locked ? "🔒" : "🛅";

    lockIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      colors[i].locked = !colors[i].locked;
      lockIcon.innerHTML = colors[i].locked ? "🔒" : "🛅";
      lockIcon.classList.toggle("locked", colors[i].locked);
      savePalette();
    });

    const code = document.createElement("div");
    code.className = "color-code";
    code.innerText = color;

    box.appendChild(lockIcon);
    box.appendChild(code);

    box.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      alert(`Copied: ${color}`);
    });

    palette.appendChild(box);
  }

  savePalette();
}

function savePalette() {
  localStorage.setItem("palette", JSON.stringify(colors));
}
