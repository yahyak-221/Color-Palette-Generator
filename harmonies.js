function hexToHSL(hex) {
  let r = parseInt(hex.substr(1, 2), 16) / 255;
  let g = parseInt(hex.substr(3, 2), 16) / 255;
  let b = parseInt(hex.substr(5, 2), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
    );
  return (
    "#" +
    [f(0), f(8), f(4)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function showColorHarmonies(baseHex) {
  const [h, s, l] = hexToHSL(baseHex);
  const schemes = {
    Complementary: [HSLToHex((h + 180) % 360, s, l)],
    Triadic: [HSLToHex((h + 120) % 360, s, l), HSLToHex((h + 240) % 360, s, l)],
    Analogous: [
      HSLToHex((h + 30) % 360, s, l),
      HSLToHex((h + 330) % 360, s, l),
    ],
  };

  const container = document.getElementById("harmony-schemes");
  container.innerHTML = "";

  Object.entries(schemes).forEach(([name, colors]) => {
    const scheme = document.createElement("div");
    scheme.className = "harmony-scheme";
    scheme.innerHTML = `<h4>${name}</h4>`;

    const colorRow = document.createElement("div");
    colorRow.className = "harmony-colors";

    [baseHex, ...colors].forEach((col) => {
      const div = document.createElement("div");
      div.style.background = col;
      div.title = col;
      div.onclick = () => navigator.clipboard.writeText(col);
      colorRow.appendChild(div);
    });

    scheme.appendChild(colorRow);
    container.appendChild(scheme);
  });
}

function generateGradient() {
  const c1 = document.getElementById("grad-color-1").value;
  const c2 = document.getElementById("grad-color-2").value;
  const gradient = `linear-gradient(to right, ${c1}, ${c2})`;

  document.getElementById("gradient-preview").style.background = gradient;
  document.getElementById(
    "gradient-code"
  ).innerText = `background: ${gradient};`;
}
