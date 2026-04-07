// ============================================================
// NASA Space Explorer — script.js
// Features: gallery, modal, loading state, video handling,
//           random space fact, hover zoom effect
// ============================================================

const API_KEY = 'DEMO_KEY'; // Replace with your own key from api.nasa.gov

// ── Space Facts (LevelUp: Random Space Fact) ────────────────
const spaceFacts = [
  "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate once, but only 225 days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tons on Earth.",
  "The footprints left by Apollo astronauts on the Moon will likely remain there for at least 10 million years.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "The largest known star, UY Scuti, is so enormous that it would take over 1,700 years to travel around it at the speed of light.",
  "One million Earths could fit inside the Sun, yet the Sun is considered only a medium-sized star.",
  "The Olympus Mons volcano on Mars is nearly three times the height of Mount Everest.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Saturn's rings are mostly made of ice and rock, and are only about 30 feet thick in some places.",
  "The Andromeda Galaxy is on a collision course with the Milky Way — but the crash won't happen for about 4.5 billion years.",
  "Jupiter's Great Red Spot is a storm that has been raging for over 350 years.",
  "Space is completely silent — sound waves need a medium to travel through, and there is no air in space.",
  "The core of the Sun reaches temperatures of about 27 million degrees Fahrenheit.",
  "Black holes don't actually suck things in — objects have to cross the event horizon to be captured.",
  "The International Space Station travels at about 17,500 mph and orbits Earth every 90 minutes.",
];

// ── Display a random space fact ──────────────────────────────
function showRandomFact() {
  const factSection = document.getElementById('fact-section');
  if (!factSection) return;
  const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factSection.innerHTML = `
    <div class="fact-card">
      <span class="fact-label">🌌 Did You Know?</span>
      <p class="fact-text">${fact}</p>
    </div>
  `;
}

// ── Inject fact section & modal into the DOM ─────────────────
function injectElements() {
  // Fact section — above the gallery
  const gallery = document.getElementById('gallery');
  const factSection = document.createElement('div');
  factSection.id = 'fact-section';
  gallery.parentNode.insertBefore(factSection, gallery);

  // Modal
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-overlay" id="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close" id="modal-close" aria-label="Close modal">&times;</button>
      <div id="modal-media"></div>
      <div class="modal-info">
        <h2 id="modal-title"></h2>
        <p id="modal-date"></p>
        <p id="modal-explanation"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── Modal helpers ────────────────────────────────────────────
function openModal(item) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-date').textContent = formatDate(item.date);
  document.getElementById('modal-explanation').textContent = item.explanation;

  const mediaContainer = document.getElementById('modal-media');
  mediaContainer.innerHTML = '';

  if (item.media_type === 'video') {
    // Embed YouTube iframe if possible, otherwise show link
    const videoSrc = getYouTubeEmbedUrl(item.url);
    if (videoSrc) {
      mediaContainer.innerHTML = `<iframe class="modal-video" src="${videoSrc}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      mediaContainer.innerHTML = `
        <div class="modal-video-link">
          <p>📽️ This entry is a video.</p>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">Watch Video ↗</a>
        </div>`;
    }
  } else {
    const imgSrc = item.hdurl || item.url;
    mediaContainer.innerHTML = `<img class="modal-image" src="${imgSrc}" alt="${item.title}" loading="lazy" />`;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Utility: Convert any YouTube URL to a clean embed URL ────
function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let videoId = null;

    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        // Already an embed URL — extract the ID and rebuild cleanly
        videoId = u.pathname.split('/embed/')[1].split('/')[0];
      } else if (u.pathname.startsWith('/v/')) {
        videoId = u.pathname.split('/v/')[1].split('/')[0];
      } else {
        // Standard watch?v= format
        videoId = u.searchParams.get('v');
      }
    } else if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('/')[0];
    }

    // Strip any extra params (like ?rel=0) that can cause 400 errors,
    // and add sensible defaults
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Utility: Format date string ──────────────────────────────
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Build a single gallery card ──────────────────────────────
function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${item.title}`);

  let mediaThumbnail;
  if (item.media_type === 'video') {
    // Show a play-button placeholder for videos
    mediaThumbnail = `
      <div class="video-thumb">
        <span class="play-icon">▶</span>
        <span class="video-badge">VIDEO</span>
      </div>`;
  } else {
    mediaThumbnail = `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;
  }

  card.innerHTML = `
    ${mediaThumbnail}
    <p class="card-title">${item.title}</p>
    <p class="card-date">${formatDate(item.date)}</p>
  `;

  card.addEventListener('click', () => openModal(item));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openModal(item);
  });

  return card;
}

// ── Fetch & render gallery ───────────────────────────────────
async function fetchAndRender() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const gallery = document.getElementById('gallery');

  if (!startDate || !endDate) {
    gallery.innerHTML = '<p class="gallery-message">⚠️ Please select both a start and end date.</p>';
    return;
  }
  if (startDate > endDate) {
    gallery.innerHTML = '<p class="gallery-message">⚠️ Start date must be before or equal to end date.</p>';
    return;
  }

  // Loading state
  gallery.innerHTML = '<p class="gallery-message loading-message">🔄 Loading space photos…</p>';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
    const response = await fetch(url);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.msg || `HTTP error ${response.status}`);
    }

    let data = await response.json();

    // API returns a single object when only one date is queried
    if (!Array.isArray(data)) data = [data];

    gallery.innerHTML = '';

    if (data.length === 0) {
      gallery.innerHTML = '<p class="gallery-message">No images found for that date range.</p>';
      return;
    }

    data.forEach((item, i) => {
      const card = buildCard(item);
      // Staggered entrance animation
      card.style.animationDelay = `${i * 60}ms`;
      gallery.appendChild(card);
    });

  } catch (error) {
    console.error('NASA API error:', error);
    gallery.innerHTML = `<p class="gallery-message">❌ Something went wrong: ${error.message}</p>`;
  }
}

// ── Wire up the button ───────────────────────────────────────
document.querySelector('.filters button').addEventListener('click', fetchAndRender);

// ── Inject dynamic styles (hover zoom + modal + fact card) ───
const style = document.createElement('style');
style.textContent = `
  /* ── Fact Card ── */
  #fact-section {
    margin-bottom: 24px;
    padding: 0 20px;
  }
  .fact-card {
    background: linear-gradient(135deg, #0b3d91 0%, #1a1a2e 100%);
    border-left: 4px solid #fc3d21;
    border-radius: 8px;
    padding: 16px 20px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  .fact-label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #aac4f5;
    margin-bottom: 6px;
    font-weight: bold;
  }
  .fact-text {
    font-size: 15px;
    line-height: 1.6;
    color: #e8eeff;
    margin: 0;
  }

  /* ── Gallery message ── */
  .gallery-message {
    flex: 1 1 100%;
    text-align: center;
    padding: 40px;
    font-size: 16px;
    color: #555;
  }
  .loading-message {
    animation: pulse 1.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ── Gallery card entrance animation ── */
  .gallery-item {
    animation: fadeSlideUp 0.4s ease both;
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Hover zoom effect (LevelUp) ── */
  .gallery-item {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    overflow: hidden;
  }
  .gallery-item:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
  }
  .gallery-item img {
    transition: transform 0.4s ease;
  }
  .gallery-item:hover img {
    transform: scale(1.08);
  }

  /* ── Card title & date ── */
  .card-title {
    font-weight: 600;
    font-size: 14px;
    color: #111;
    margin-top: 10px;
    padding: 0 4px;
    line-height: 1.3;
  }
  .card-date {
    font-size: 12px;
    color: #888;
    padding: 2px 4px 6px;
  }

  /* ── Video thumbnail placeholder ── */
  .video-thumb {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #0b3d91, #1a1a2e);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    gap: 8px;
  }
  .play-icon {
    font-size: 42px;
    color: rgba(255,255,255,0.85);
  }
  .video-badge {
    background: #fc3d21;
    color: #fff;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 3px 8px;
    border-radius: 3px;
  }

  /* ── Modal ── */
  #modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }
  #modal.open {
    display: flex;
  }
  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.82);
  }
  .modal-content {
    position: relative;
    background: #fff;
    border-radius: 10px;
    max-width: 780px;
    width: 92%;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1001;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: modalIn 0.25s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  .modal-close {
    position: absolute;
    top: 12px;
    right: 14px;
    background: rgba(0,0,0,0.65);
    border: none;
    color: #fff;
    font-size: 22px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background 0.2s;
  }
  .modal-close:hover {
    background: #fc3d21;
  }
  .modal-image {
    width: 100%;
    max-height: 460px;
    object-fit: contain;
    background: #000;
    border-radius: 10px 10px 0 0;
    display: block;
  }
  .modal-video {
    width: 100%;
    height: 420px;
    border-radius: 10px 10px 0 0;
    display: block;
    background: #000;
  }
  .modal-video-link {
    padding: 40px;
    text-align: center;
    background: #0b3d91;
    border-radius: 10px 10px 0 0;
    color: #fff;
  }
  .modal-video-link a {
    display: inline-block;
    margin-top: 12px;
    background: #fc3d21;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
  }
  .modal-info {
    padding: 20px 24px 28px;
  }
  #modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #111;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  #modal-date {
    font-size: 13px;
    color: #888;
    margin-bottom: 14px;
  }
  #modal-explanation {
    font-size: 15px;
    line-height: 1.7;
    color: #333;
  }
`;
document.head.appendChild(style);

// ── Init ─────────────────────────────────────────────────────
injectElements();
showRandomFact();