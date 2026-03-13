import { $ } from "../utils/dom.js";

let particlesLoopId = null;
let particles = [];
let particlesInitialized = false;
const mouse = { x: -500, y: -500 };
const adaptivePaletteCache = new Map();

function drawParticles(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      p.vx += dx * 0.00035;
      p.vy += dy * 0.00035;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(125, 211, 252, 0.75)";
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(125, 211, 252, ${0.18 - dist / 900})`;
        ctx.stroke();
      }
    }
  }

  particlesLoopId = requestAnimationFrame(() => drawParticles(canvas, ctx));
}

const backgroundEls = {
  gradient: $("#bg-gradient"),
  particles: $("#bg-particles"),
  aurora: $("#bg-aurora"),
  image: $("#bg-image"),
  video: $("#bg-video"),
  youtube: $("#bg-youtube"),
  youtubeFrame: $("#bg-youtube-frame"),
  overlay: $("#bg-overlay"),
  waves: $("#bg-waves")
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseYouTubeInput(input) {
  if (!input) {
    return null;
  }

  const value = input.trim();
  const directMatch = value.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directMatch) {
    return { videoId: directMatch[0], startSeconds: 0 };
  }

  let startSeconds = 0;
  const startMatch = value.match(/[?&](?:t|start)=([0-9]+)/);
  if (startMatch) {
    startSeconds = Number(startMatch[1]) || 0;
  }

  const patterns = [/youtu\.be\/([a-zA-Z0-9_-]{11})/, /[?&]v=([a-zA-Z0-9_-]{11})/, /embed\/([a-zA-Z0-9_-]{11})/];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      return { videoId: match[1], startSeconds };
    }
  }

  return null;
}

function buildYouTubeEmbedUrl(videoId, startSeconds = 0) {
  if (!videoId) {
    return "";
  }
  const start = Math.max(0, Number(startSeconds) || 0);
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&showinfo=0&rel=0&start=${start}`;
}

function setOverlayOpacity(opacityPercent) {
  const opacity = clamp(Number(opacityPercent || 0), 0, 85) / 100;
  document.documentElement.style.setProperty("--bg-overlay-opacity", String(opacity));
}

function rgbToString(color) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function shiftColor(color, amount) {
  return {
    r: clamp(Math.round(color.r + amount), 0, 255),
    g: clamp(Math.round(color.g + amount), 0, 255),
    b: clamp(Math.round(color.b + amount), 0, 255)
  };
}

function applyAdaptivePalette(color) {
  const accent = shiftColor(color, 10);
  const accentStrong = shiftColor(color, -35);
  document.documentElement.style.setProperty("--accent", rgbToString(accent));
  document.documentElement.style.setProperty("--accent-strong", rgbToString(accentStrong));
  document.documentElement.style.setProperty("--card", `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.18)`);
}

function extractDominantColorFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < pixels.length; i += 16) {
        const alpha = pixels[i + 3];
        if (alpha < 120) {
          continue;
        }
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count += 1;
      }

      if (!count) {
        reject(new Error("No valid pixels"));
        return;
      }

      resolve({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
      });
    };

    image.onerror = () => reject(new Error("Image color extraction failed"));
    image.src = imageUrl;
  });
}

function extractDominantColorFromVideo(videoElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = 64;
  canvas.height = 64;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < pixels.length; i += 16) {
    const alpha = pixels[i + 3];
    if (alpha < 120) {
      continue;
    }
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
    count += 1;
  }

  if (!count) {
    throw new Error("No valid video pixels");
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}

function applyAdaptiveColorFromImage(url) {
  if (!url) {
    return;
  }

  const key = `img:${url}`;
  const cached = adaptivePaletteCache.get(key);
  if (cached) {
    applyAdaptivePalette(cached);
    return;
  }

  extractDominantColorFromImage(url)
    .then((color) => {
      adaptivePaletteCache.set(key, color);
      applyAdaptivePalette(color);
    })
    .catch(() => {
      // Ignore extraction failures due to CORS or invalid media URLs.
    });
}

function applyAdaptiveColorFromVideo(videoEl, sourceUrl) {
  if (!sourceUrl) {
    return;
  }

  const key = `video:${sourceUrl}`;
  const cached = adaptivePaletteCache.get(key);
  if (cached) {
    applyAdaptivePalette(cached);
    return;
  }

  const sample = () => {
    try {
      const color = extractDominantColorFromVideo(videoEl);
      adaptivePaletteCache.set(key, color);
      applyAdaptivePalette(color);
    } catch {
      // Ignore extraction failures due to CORS constraints.
    }
  };

  if (videoEl.readyState >= 2) {
    sample();
    return;
  }

  videoEl.addEventListener("loadeddata", sample, { once: true });
}

function hideAll() {
  [
    backgroundEls.gradient,
    backgroundEls.particles,
    backgroundEls.aurora,
    backgroundEls.image,
    backgroundEls.video,
    backgroundEls.youtube,
    backgroundEls.waves
  ].forEach((el) => el.classList.add("hidden"));
  stopParticles();
}

function setupWaves() {
  const waves = backgroundEls.waves;
  if (waves.dataset.ready === "1") {
    return;
  }

  waves.innerHTML = `
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" class="h-full w-full">
      <defs>
        <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(56,189,248,0.35)"></stop>
          <stop offset="100%" stop-color="rgba(15,23,42,0.0)"></stop>
        </linearGradient>
      </defs>
      <path fill="url(#waveGradient)">
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
          M0,128L60,138.7C120,149,240,171,360,186.7C480,203,600,213,720,192C840,171,960,117,1080,96C1200,75,1320,85,1380,90.7L1440,96L1440,320L0,320Z;
          M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,170.7C840,192,960,192,1080,176C1200,160,1320,128,1380,112L1440,96L1440,320L0,320Z;
          M0,128L60,138.7C120,149,240,171,360,186.7C480,203,600,213,720,192C840,171,960,117,1080,96C1200,75,1320,85,1380,90.7L1440,96L1440,320L0,320Z"
        ></animate>
      </path>
    </svg>
  `;
  waves.dataset.ready = "1";
}

function initParticles() {
  const canvas = backgroundEls.particles;
  const ctx = canvas.getContext("2d");

  if (particlesLoopId) {
    return;
  }

  if (particlesInitialized) {
    drawParticles(canvas, ctx);
    return;
  }

  const setSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  setSize();
  window.addEventListener("resize", setSize);

  particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: Math.random() * 2.2 + 0.8
  }));

  window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  drawParticles(canvas, ctx);
  particlesInitialized = true;
}

function stopParticles() {
  if (particlesLoopId) {
    cancelAnimationFrame(particlesLoopId);
    particlesLoopId = null;
  }
}

function setupParallax() {
  const imageLayer = backgroundEls.image;
  if (imageLayer.dataset.parallax === "1") {
    return;
  }

  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 14;
    imageLayer.style.transform = `scale(1.08) translate(${x}px, ${y}px)`;
  });

  imageLayer.dataset.parallax = "1";
}

export function applyBackground(config) {
  hideAll();
  backgroundEls.overlay.classList.remove("hidden");
  setOverlayOpacity(config.overlayOpacity ?? 45);

  if (config.background === "gradient") {
    backgroundEls.gradient.classList.remove("hidden");
    return;
  }

  if (config.background === "particles") {
    backgroundEls.particles.classList.remove("hidden");
    initParticles();
    return;
  }

  if (config.background === "waves") {
    backgroundEls.waves.classList.remove("hidden");
    setupWaves();
    return;
  }

  if (config.background === "aurora") {
    backgroundEls.aurora.classList.remove("hidden");
    return;
  }

  if (config.background === "video") {
    backgroundEls.video.classList.remove("hidden");
    if (config.bgVideo && backgroundEls.video.src !== config.bgVideo) {
      backgroundEls.video.src = config.bgVideo;
    }
    if (config.adaptiveColors) {
      applyAdaptiveColorFromVideo(backgroundEls.video, config.bgVideo);
    }
    return;
  }

  if (config.background === "youtube") {
    backgroundEls.youtube.classList.remove("hidden");
    const youtubeInput = parseYouTubeInput(config.bgYouTube);
    const videoId = youtubeInput?.videoId || null;
    const embedUrl = buildYouTubeEmbedUrl(videoId, youtubeInput?.startSeconds || 0);
    if (embedUrl && backgroundEls.youtubeFrame.dataset.src !== embedUrl) {
      backgroundEls.youtubeFrame.src = embedUrl;
      backgroundEls.youtubeFrame.dataset.src = embedUrl;
    }

    if (config.adaptiveColors && videoId) {
      applyAdaptiveColorFromImage(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
    return;
  }

  if (config.background === "image") {
    backgroundEls.image.classList.remove("hidden");
    backgroundEls.image.style.backgroundImage = `url('${config.bgImage}')`;
    setupParallax();
    if (config.adaptiveColors) {
      applyAdaptiveColorFromImage(config.bgImage);
    }
    return;
  }

  backgroundEls.gradient.classList.remove("hidden");
}
