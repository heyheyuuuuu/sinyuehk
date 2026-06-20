const header = document.querySelector("[data-header]");
const root = document.documentElement;
const canvas = document.querySelector("[data-particles]");
const ctx = canvas.getContext("2d");
const particles = [];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let dpr = 1;
let mouseX = -9999;
let mouseY = -9999;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedParticles() {
  particles.length = 0;
  const count = reducedMotion ? 42 : Math.min(150, Math.max(72, Math.floor((width * height) / 13500)));
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.28 + 0.08),
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.42 + 0.26,
      hue: Math.random() > 0.55 ? 306 : Math.random() > 0.45 ? 190 : 258,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) {
      particle.y = height + 20;
      particle.x = Math.random() * width;
    }
    if (particle.y > height + 20) particle.y = -20;

    const distanceToMouse = Math.hypot(particle.x - mouseX, particle.y - mouseY);
    if (distanceToMouse < 140) {
      particle.x += (particle.x - mouseX) * 0.0025;
      particle.y += (particle.y - mouseY) * 0.0025;
    }

    ctx.beginPath();
    ctx.fillStyle = `hsla(${particle.hue}, 100%, 68%, ${particle.alpha})`;
    ctx.shadowColor = `hsla(${particle.hue}, 100%, 68%, 0.74)`;
    ctx.shadowBlur = 10;
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 112) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(138, 85, 255, ${0.1 * (1 - distance / 112)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  ctx.shadowBlur = 0;
  requestAnimationFrame(draw);
}

function initParticles() {
  resize();
  seedParticles();
  draw();
}

window.addEventListener("resize", () => {
  resize();
  seedParticles();
});

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  const nx = (event.clientX / window.innerWidth - 0.5).toFixed(4);
  const ny = (event.clientY / window.innerHeight - 0.5).toFixed(4);
  root.style.setProperty("--parallax-x", nx);
  root.style.setProperty("--parallax-y", ny);
  root.style.setProperty("--network-x", `${Number(nx) * 10}px`);
  root.style.setProperty("--network-y", `${Number(ny) * 7}px`);
});

window.addEventListener("pointerleave", () => {
  mouseX = -9999;
  mouseY = -9999;
  root.style.setProperty("--parallax-x", "0");
  root.style.setProperty("--parallax-y", "0");
  root.style.setProperty("--network-x", "0px");
  root.style.setProperty("--network-y", "0px");
});

window.addEventListener(
  "scroll",
  () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  },
  { passive: true },
);

document
  .querySelectorAll(".capabilities article, .industry-grid article, .brand-wall span, .trust-grid article")
  .forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      item.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      item.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

initParticles();
