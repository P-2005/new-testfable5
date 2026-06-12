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
  seated: false,
  hoveredSofa: false,
  hoveredId: null,
  activeArtwork: null,
  viewCount: null,
  favorites: [],
  favOpen: false,
  controls: null,

  setControls: (controls) => set({ controls }),
  setPaused: (paused) => set({ paused }),
  setPlActive: (plActive) => set({ plActive }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setFavOpen: (favOpen) => set({ favOpen }),
  setSeated: (seated) => set({ seated, hoveredSofa: false }),
  setHoveredSofa: (hoveredSofa) => set({ hoveredSofa }),

  resetSession: () =>
    set({
      paused: false,
      activeArtwork: null,
      hoveredId: null,
      favOpen: false,
      seated: false,
      hoveredSofa: false,
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
