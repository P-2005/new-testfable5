import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGalleryStore, mobileInput } from "../../store/galleryStore";
import { ARTWORKS } from "../../data/artworks";

const WALK = 4.2;
const RUN = 7.2;
const EYE = 1.6;
const BOUNDS = { x: 12.7, z: 8.7 };
const LOOK_SENS = 0.0023;
const DRAG_SENS = 0.0032;

const clamp = THREE.MathUtils.clamp;

/**
 * First-person controller with two look modes:
 * 1. Native pointer lock (full browser tabs / deployed site)
 * 2. Drag-to-look fallback (sandboxed iframes where pointer lock is blocked)
 * Look and movement are exponentially smoothed for a fluid walking-sim feel.
 */
export const Player = () => {
  const { camera, scene, gl } = useThree();
  const isMobile = useGalleryStore((s) => s.isMobile);

  const keys = useRef({});
  const yVel = useRef(0);
  const jumpH = useRef(0);
  const grounded = useRef(true);
  const bob = useRef(0);
  const rayTimer = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const center = useRef(new THREE.Vector2(0, 0));
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  // Smoothed look state
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Smoothed movement velocity
  const vel = useRef(new THREE.Vector3());

  // Pointer-lock state
  const plActive = useRef(false);
  const dragging = useRef(false);
  const dragDist = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  // Register lock/unlock controls in the store
  useEffect(() => {
    const el = gl.domElement;
    const controls = {
      lock: () => {
        useGalleryStore.getState().setLocked(true);
        try {
          const p = el.requestPointerLock();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              /* sandboxed iframe — drag-look fallback stays active */
            });
          }
        } catch (_e) {
          /* SecurityError in sandboxed iframe — fallback mode */
        }
      },
      unlock: () => {
        useGalleryStore.getState().setLocked(false);
        if (document.pointerLockElement) document.exitPointerLock();
      },
    };
    useGalleryStore.getState().setControls(controls);
    // Dev/test helper: teleport + face a direction
    window.__gallerySetView = (x, z, yawVal) => {
      camera.position.x = x;
      camera.position.z = z;
      targetYaw.current = yawVal;
      yaw.current = yawVal;
    };
  }, [gl, camera]);

  // Pointer lock change / error tracking
  useEffect(() => {
    const onChange = () => {
      const active = document.pointerLockElement === gl.domElement;
      const wasActive = plActive.current;
      plActive.current = active;
      // Browser-initiated exit (ESC) while exploring → show menu overlay
      if (!active && wasActive && useGalleryStore.getState().locked) {
        useGalleryStore.getState().setLocked(false);
      }
    };
    const onError = () => {
      plActive.current = false;
    };
    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("pointerlockerror", onError);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("pointerlockerror", onError);
    };
  }, [gl]);

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
      // ESC exits fallback exploring mode (pointer lock handles its own ESC)
      if (e.code === "Escape" && !plActive.current) {
        const s = useGalleryStore.getState();
        if (s.locked && !s.activeArtwork) s.setLocked(false);
      }
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Mouse look: pointer-lock movement + drag fallback + click-to-inspect
  useEffect(() => {
    if (isMobile) return;
    const el = gl.domElement;

    const onMouseMove = (e) => {
      const s = useGalleryStore.getState();
      if (!s.locked || s.activeArtwork) return;
      if (plActive.current) {
        // Chromium can fire a huge movement spike right after lock engages — ignore it
        if (Math.abs(e.movementX) > 200 || Math.abs(e.movementY) > 200) return;
        targetYaw.current -= e.movementX * LOOK_SENS;
        targetPitch.current = clamp(
          targetPitch.current - e.movementY * LOOK_SENS,
          -1.3,
          1.3
        );
      } else if (dragging.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        dragDist.current += Math.abs(dx) + Math.abs(dy);
        targetYaw.current += dx * DRAG_SENS;
        targetPitch.current = clamp(
          targetPitch.current + dy * DRAG_SENS,
          -1.3,
          1.3
        );
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseDown = (e) => {
      const s = useGalleryStore.getState();
      if (!s.locked || s.activeArtwork || plActive.current) return;
      if (e.target !== el) return;
      dragging.current = true;
      dragDist.current = 0;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e) => {
      const s = useGalleryStore.getState();
      const wasDragging = dragging.current;
      dragging.current = false;
      if (!s.locked || s.activeArtwork || plActive.current) return;
      if (!wasDragging || dragDist.current > 8) return;
      if (e.target !== el) return;
      // Treat as a click: raycast from actual cursor position
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.current.setFromCamera(ndc, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const first = hits.find((h) => h.object.isMesh && h.object.visible);
      if (first && first.object.userData?.artworkId && first.distance < 9) {
        const art = ARTWORKS.find((a) => a.id === first.object.userData.artworkId);
        if (art) s.openArtwork(art);
      }
    };

    // Pointer-lock mode: click inspects whatever the center reticle targets
    const onClick = () => {
      const s = useGalleryStore.getState();
      if (plActive.current && s.locked && s.hoveredId && !s.activeArtwork) {
        const art = ARTWORKS.find((a) => a.id === s.hoveredId);
        if (art) s.openArtwork(art);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("click", onClick);
    };
  }, [isMobile, gl, camera, scene]);

  // Mobile look — drag on canvas
  useEffect(() => {
    if (!isMobile) return;
    const el = gl.domElement;
    let last = null;
    const start = (e) => {
      last = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const move = (e) => {
      if (!last) return;
      const t = e.touches[0];
      mobileInput.look.x += t.clientX - last.x;
      mobileInput.look.y += t.clientY - last.y;
      last = { x: t.clientX, y: t.clientY };
    };
    const end = () => {
      last = null;
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
    };
  }, [isMobile, gl]);

  useFrame((_, dt) => {
    const s = useGalleryStore.getState();
    const delta = Math.min(dt, 0.05);
    const exploring = !s.activeArtwork && (s.locked || isMobile);

    // Mobile look feeds the same smoothed yaw/pitch system
    if (isMobile && exploring) {
      targetYaw.current -= mobileInput.look.x * 0.0042;
      targetPitch.current = clamp(
        targetPitch.current - mobileInput.look.y * 0.0042,
        -1.25,
        1.25
      );
    }
    mobileInput.look.x = 0;
    mobileInput.look.y = 0;

    // Smoothly ease current look toward target (fluid, no snapping)
    const lookEase = 1 - Math.exp(-22 * delta);
    yaw.current += (targetYaw.current - yaw.current) * lookEase;
    pitch.current += (targetPitch.current - pitch.current) * lookEase;
    euler.current.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler.current);

    // Movement input
    let f = 0;
    let r = 0;
    if (exploring) {
      if (keys.current.KeyW || keys.current.ArrowUp) f += 1;
      if (keys.current.KeyS || keys.current.ArrowDown) f -= 1;
      if (keys.current.KeyD || keys.current.ArrowRight) r += 1;
      if (keys.current.KeyA || keys.current.ArrowLeft) r -= 1;
      if (isMobile) {
        f -= mobileInput.move.y;
        r += mobileInput.move.x;
      }
    }

    const running = keys.current.ShiftLeft || keys.current.ShiftRight;
    const speed = running ? RUN : WALK;

    // Desired velocity in world space
    const desired = new THREE.Vector3();
    if (Math.abs(f) > 0.05 || Math.abs(r) > 0.05) {
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(0, yaw.current, 0)
      );
      const right = new THREE.Vector3().crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0)
      );
      desired.copy(forward.multiplyScalar(f).add(right.multiplyScalar(r)));
      if (desired.lengthSq() > 1) desired.normalize();
      desired.multiplyScalar(speed);
    }

    // Smooth acceleration / deceleration
    const moveEase = 1 - Math.exp(-10 * delta);
    vel.current.lerp(desired, moveEase);

    const moving = vel.current.lengthSq() > 0.04;
    if (moving) {
      camera.position.x = clamp(
        camera.position.x + vel.current.x * delta,
        -BOUNDS.x,
        BOUNDS.x
      );
      camera.position.z = clamp(
        camera.position.z + vel.current.z * delta,
        -BOUNDS.z,
        BOUNDS.z
      );
      bob.current += delta * vel.current.length() * 2.1;
    }

    // Jump
    if (exploring && keys.current.Space && grounded.current) {
      yVel.current = 4.4;
      grounded.current = false;
    }
    if (!grounded.current) {
      yVel.current -= 11.5 * delta;
      jumpH.current += yVel.current * delta;
      if (jumpH.current <= 0) {
        jumpH.current = 0;
        yVel.current = 0;
        grounded.current = true;
      }
    }

    const bobOff = moving && grounded.current ? Math.sin(bob.current) * 0.032 : 0;
    camera.position.y = EYE + jumpH.current + bobOff;
    if (typeof window !== "undefined") {
      window.__galleryDebug = {
        pos: [camera.position.x, camera.position.y, camera.position.z],
        locked: s.locked,
        plActive: plActive.current,
        hovered: s.hoveredId,
      };
    }

    // Center raycast for hover detection (throttled)
    rayTimer.current += delta;
    if (rayTimer.current > 0.12 && exploring) {
      rayTimer.current = 0;
      raycaster.current.setFromCamera(center.current, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const first = hits.find((hit) => hit.object.isMesh && hit.object.visible);
      const id =
        first && first.object.userData?.artworkId && first.distance < 8
          ? first.object.userData.artworkId
          : null;
      if (id !== s.hoveredId) s.setHovered(id);
    }
  });

  return null;
};
