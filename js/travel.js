// =====================================================
// TRAVEL DATA - Edit this section to add your locations
// =====================================================
const travelLocations = [
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    coords: [35.6762, 139.6503],
    date: 'March 2024',
    description: 'Explored the vibrant streets of Shibuya, visited ancient temples in Asakusa, and experienced the perfect blend of traditional and modern Japanese culture. The cherry blossoms were in full bloom during our visit.',
    photos: [
      { thumb: 'images/photos/tokyo/tokyo1-thumb.jpg', full: 'images/photos/tokyo/tokyo1.jpg', caption: 'Shibuya Crossing at night' },
      { thumb: 'images/photos/tokyo/tokyo2-thumb.jpg', full: 'images/photos/tokyo/tokyo2.jpg', caption: 'Senso-ji Temple in Asakusa' },
      { thumb: 'images/photos/tokyo/tokyo3-thumb.jpg', full: 'images/photos/tokyo/tokyo3.jpg', caption: 'Cherry blossoms in Ueno Park' },
    ]
  },
  {
    id: 'paris',
    name: 'Paris, France',
    coords: [48.8566, 2.3522],
    date: 'June 2023',
    description: 'A week in the City of Light, wandering through charming neighborhoods, visiting world-class museums, and enjoying countless croissants and café au laits.',
    photos: [
      { thumb: 'images/photos/paris/paris1-thumb.jpg', full: 'images/photos/paris/paris1.jpg', caption: 'Eiffel Tower at sunset' },
      { thumb: 'images/photos/paris/paris2-thumb.jpg', full: 'images/photos/paris/paris2.jpg', caption: 'Louvre Museum' },
      { thumb: 'images/photos/paris/paris3-thumb.jpg', full: 'images/photos/paris/paris3.jpg', caption: 'Montmartre streets' },
    ]
  },
  {
    id: 'nyc',
    name: 'New York City, USA',
    coords: [40.7128, -74.0060],
    date: 'December 2023',
    description: 'Experienced the magic of NYC during the holiday season. Central Park in the snow, Broadway shows, and the iconic skyline views from Top of the Rock.',
    photos: [
      { thumb: 'images/photos/nyc/nyc1-thumb.jpg', full: 'images/photos/nyc/nyc1.jpg', caption: 'Manhattan skyline' },
      { thumb: 'images/photos/nyc/nyc2-thumb.jpg', full: 'images/photos/nyc/nyc2.jpg', caption: 'Central Park in winter' },
      { thumb: 'images/photos/nyc/nyc3-thumb.jpg', full: 'images/photos/nyc/nyc3.jpg', caption: 'Times Square lights' },
    ]
  },
  // Add more locations following this pattern:
  // {
  //   id: 'unique-id',
  //   name: 'City, Country',
  //   coords: [latitude, longitude],
  //   date: 'Month Year',
  //   description: 'Description of the trip...',
  //   photos: [
  //     { thumb: 'path/to/thumb.jpg', full: 'path/to/full.jpg', caption: 'Photo caption' },
  //   ]
  // },
];

// =====================================================
// MAP INITIALIZATION
// =====================================================
let map;
let markers = [];
let currentLocation = null;
let currentTileLayer = null;

// Theme-aware tile layers
const tileLayers = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

// Theme-aware pin colors
const pinColors = {
  light: { pin: '#3498db', dot: 'white' },
  dark: { pin: '#4fc3f7', dot: '#1a1a2e' }
};

function isDarkMode() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function getPinIcon() {
  const colors = isDarkMode() ? pinColors.dark : pinColors.light;
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.4 18.6 0 12 0Z" fill="${colors.pin}"/>
      <circle cx="12" cy="12" r="5" fill="${colors.dot}"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
}

function updateMapTheme() {
  if (!map) return;

  const theme = isDarkMode() ? 'dark' : 'light';
  const tileConfig = tileLayers[theme];

  // Remove current tile layer and add new one
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }

  currentTileLayer = L.tileLayer(tileConfig.url, {
    attribution: tileConfig.attribution,
    maxZoom: 18
  }).addTo(map);

  // Update all marker icons
  const newIcon = getPinIcon();
  markers.forEach(({ marker }) => {
    marker.setIcon(newIcon);
  });
}

function initMap() {
  const mapElement = document.getElementById('travel-map');
  if (!mapElement) return;

  // Initialize the map centered on the world
  map = L.map('travel-map', {
    scrollWheelZoom: false // Prevent accidental zooming while scrolling page
  }).setView([20, 0], 2);

  // Add initial tile layer based on current theme
  const theme = isDarkMode() ? 'dark' : 'light';
  const tileConfig = tileLayers[theme];
  currentTileLayer = L.tileLayer(tileConfig.url, {
    attribution: tileConfig.attribution,
    maxZoom: 18
  }).addTo(map);

  // Custom marker icon
  const pinIcon = getPinIcon();

  // Add markers for each location
  travelLocations.forEach(location => {
    const marker = L.marker(location.coords, { icon: pinIcon })
      .addTo(map)
      .bindPopup(`<strong>${location.name}</strong><br>${location.date}`);

    marker.on('click', () => selectLocation(location));
    markers.push({ marker, location });
  });

  // Fit map to show all markers if there are any
  if (travelLocations.length > 0) {
    const group = L.featureGroup(markers.map(m => m.marker));
    map.fitBounds(group.getBounds().pad(0.1));
  }

  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        updateMapTheme();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// =====================================================
// LOCATION SELECTION
// =====================================================
function selectLocation(location) {
  currentLocation = location;

  // Update location info panel
  const infoPanel = document.getElementById('location-info');
  const placeholder = document.getElementById('location-placeholder');
  const photoGrid = document.getElementById('photo-grid');

  document.getElementById('location-title').textContent = location.name;
  document.getElementById('location-date').textContent = location.date;
  document.getElementById('location-description').textContent = location.description;

  // Show info panel, hide placeholder
  infoPanel.classList.add('active');
  placeholder.style.display = 'none';

  // Populate and show photo grid
  populatePhotoGrid(location.photos);
  photoGrid.classList.remove('hidden');

  // Scroll to info panel
  infoPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================================================
// PHOTO GRID
// =====================================================
function populatePhotoGrid(photos) {
  const photoGrid = document.getElementById('photo-grid');
  photoGrid.innerHTML = '';

  if (!photos || photos.length === 0) {
    photoGrid.innerHTML = '<p class="no-photos-message">No photos available for this location yet.</p>';
    return;
  }

  photos.forEach((photo, index) => {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.dataset.caption = photo.caption;
    photoItem.dataset.index = index;

    // Create image with lazy loading
    const img = document.createElement('img');
    img.className = 'lazy';
    img.dataset.src = photo.thumb;
    img.dataset.full = photo.full;
    img.alt = photo.caption;

    // Use a tiny placeholder or leave blank
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    photoItem.appendChild(img);
    photoGrid.appendChild(photoItem);

    // Click handler for lightbox
    photoItem.addEventListener('click', () => openLightbox(index));
  });

  // Trigger lazy loading
  lazyLoadImages();
}

// =====================================================
// LAZY LOADING
// =====================================================
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => {
            img.classList.remove('lazy');
            img.classList.add('loaded');
          };
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.onload = () => {
        img.classList.remove('lazy');
        img.classList.add('loaded');
      };
    });
  }
}

// =====================================================
// LIGHTBOX FOR TRAVEL PHOTOS
// =====================================================
let currentPhotoIndex = 0;

function openLightbox(index) {
  if (!currentLocation || !currentLocation.photos) return;

  currentPhotoIndex = index;
  const photo = currentLocation.photos[index];

  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-content img');
  const lightboxCaption = document.querySelector('.lightbox-caption');

  // Load the full-size image
  lightboxImg.src = photo.full;
  lightboxImg.alt = photo.caption;
  lightboxCaption.textContent = photo.caption;

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.querySelector('.lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  if (!currentLocation || !currentLocation.photos) return;

  const photos = currentLocation.photos;
  currentPhotoIndex = (currentPhotoIndex + direction + photos.length) % photos.length;

  const photo = photos[currentPhotoIndex];
  const lightboxImg = document.querySelector('.lightbox-content img');
  const lightboxCaption = document.querySelector('.lightbox-caption');

  lightboxImg.src = photo.full;
  lightboxImg.alt = photo.caption;
  lightboxCaption.textContent = photo.caption;
}

// =====================================================
// EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize map
  initMap();

  // Lightbox controls (only if we're on the travel page)
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && document.getElementById('travel-map')) {
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }
});

// Add custom pin styles
const style = document.createElement('style');
style.textContent = `
  .custom-pin {
    background: none;
    border: none;
  }
  .custom-pin svg {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    transition: transform 0.2s ease;
  }
  .custom-pin:hover svg {
    transform: scale(1.1);
  }
`;
document.head.appendChild(style);
