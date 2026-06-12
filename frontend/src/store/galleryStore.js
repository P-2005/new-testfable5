import { create } from "zustand";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getVisitorId = () => {
  let id = localStorage.getItem("gallery_visitor_id");
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("gallery_visitor_id", id);
  }
  return id;
};

// Mutable input channel for mobile controls (avoids re-renders each frame)
export const mobileInput = { move: { x: 0, y: 0 }, look: { x: 0, y: 0 } };

export const useGalleryStore = create((set, get) => ({
  isMobile: typeof window !== "undefined" && "ontouchstart" in window,
  paused: false,
  plActive: false, // native pointer lock engaged
  simLock: false, // simulated lock (cursor hidden, delta mouselook) for sandboxed frames
  seated: false,
  seatTarget: { x: 0, y: 1.18, z: -0.5 },
  standTarget: { x: 0, z: -2.4 },
  hoveredSofa: null, // null | { seat, stand }
  hoveredId: null,
  hoveredNpc: null,
  activeArtwork: null,
  activeNpc: null,
  viewCount: null,
  favorites: [],
  favOpen: false,
  controls: null,

  setControls: (controls) => set({ controls }),
  setPaused: (paused) => set({ paused }),
  setPlActive: (plActive) => set({ plActive }),
  setSimLock: (simLock) => set({ simLock }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setHoveredNpc: (hoveredNpc) => set({ hoveredNpc }),
  setHoveredSofa: (hoveredSofa) => set({ hoveredSofa }),
  setFavOpen: (favOpen) => set({ favOpen }),

  sitDown: (seat, stand) =>
    set({ seated: true, seatTarget: seat, standTarget: stand, hoveredSofa: null }),
  setSeated: (seated) => set({ seated, hoveredSofa: null }),

  openNpc: (npcId) => {
    set({ activeNpc: npcId, hoveredNpc: null, hoveredId: null, favOpen: false });
    const { controls, isMobile } = get();
    if (!isMobile && controls) controls.unlock();
  },
  closeNpc: () => set({ activeNpc: null }),

  resetSession: () =>
    set({
      paused: false,
      activeArtwork: null,
      activeNpc: null,
      hoveredId: null,
      hoveredNpc: null,
      favOpen: false,
      seated: false,
      hoveredSofa: null,
      simLock: false,
    }),

  openArtwork: async (artwork) => {
    // Set state BEFORE unlocking so the pointerlockchange handler
    // knows this exit was modal-initiated (no pause menu).
    set({ activeArtwork: artwork, viewCount: null, hoveredId: null, favOpen: false });
    const { controls, isMobile } = get();
    if (!isMobile && controls) controls.unlock();
    try {
      const res = await axios.post(`${API}/artworks/${artwork.id}/view`);
      if (get().activeArtwork?.id === artwork.id) {
        set({ viewCount: res.data.views });
      }
    } catch (e) {
      console.error("view tracking failed", e);
    }
  },

  closeArtwork: () => set({ activeArtwork: null }),

  loadFavorites: async () => {
    try {
      const res = await axios.get(`${API}/favorites/${getVisitorId()}`);
      set({ favorites: res.data.artwork_ids || [] });
    } catch (e) {
      console.error("favorites load failed", e);
    }
  },

  toggleFavorite: async (artworkId) => {
    const { favorites } = get();
    const isFav = favorites.includes(artworkId);
    set({
      favorites: isFav
        ? favorites.filter((f) => f !== artworkId)
        : [...favorites, artworkId],
    });
    try {
      if (isFav) {
        await axios.delete(`${API}/favorites/${getVisitorId()}/${artworkId}`);
      } else {
        await axios.post(`${API}/favorites`, {
          visitor_id: getVisitorId(),
          artwork_id: artworkId,
        });
      }
    } catch (e) {
      console.error("favorite sync failed", e);
    }
  },
}));

// Dev/test helper
if (typeof window !== "undefined") {
  window.__galleryStore = useGalleryStore;
}
