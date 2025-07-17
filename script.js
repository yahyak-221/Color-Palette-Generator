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
  palette.innerHTML = ""; // Clear previous

  for (let i = 0; i < 5; i++) {
    const color = generateRandomColor();
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = color;

    const code = document.createElement("div");
    code.className = "color-code";
    code.innerText = color;

    box.appendChild(code);
    box.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      alert(`Copied: ${color}`);
    });

    palette.appendChild(box);
  }
}

// Generate on load
generatePalette();
