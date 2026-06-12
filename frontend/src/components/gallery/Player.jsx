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
 * Game-style first-person controller.
 * - Exploration starts immediately (WASD + drag-look always work).
 * - Clicking empty space engages native pointer lock (cursor disappears,
 *   raw mouselook). In sandboxed iframes where lock is blocked, drag-look
 *   remains the seamless fallback.
 * - L toggles pointer lock. P / ESC opens the pause menu.
 * - Look + movement are exponentially smoothed for fluidity.
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
  const suppressPause = useRef(false);
  const dragging = useRef(false);
  const dragDist = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  const tryLock = () => {
    const el = gl.domElement;
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
  };

  const releaseLock = () => {
    if (document.pointerLockElement) {
      suppressPause.current = true;
      document.exitPointerLock();
    }
  };

  // Register lock/unlock controls in the store
  useEffect(() => {
    useGalleryStore.getState().setControls({
      lock: tryLock,
      unlock: releaseLock,
    });
    // Dev/test helper: teleport + face a direction
    window.__gallerySetView = (x, z, yawVal) => {
      camera.position.x = x;
      camera.position.z = z;
      targetYaw.current = yawVal;
      yaw.current = yawVal;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera]);

  // Pointer lock change / error tracking
  useEffect(() => {
    const onChange = () => {
      const active = document.pointerLockElement === gl.domElement;
      const wasActive = plActive.current;
      plActive.current = active;
      useGalleryStore.getState().setPlActive(active);
      // Browser-initiated exit (native ESC) → open pause menu,
      // unless the exit was caused by a modal or an intentional toggle.
      if (!active && wasActive) {
        if (suppressPause.current) {
          suppressPause.current = false;
          return;
        }
        const s = useGalleryStore.getState();
        if (!s.activeArtwork && !s.paused) s.setPaused(true);
      }
    };
    const onError = () => {
      plActive.current = false;
      useGalleryStore.getState().setPlActive(false);
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
    const togglePause = () => {
      const s = useGalleryStore.getState();
      if (s.activeArtwork) return;
      if (!s.paused && plActive.current) releaseLock();
      s.setPaused(!s.paused);
    };
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
      if (e.code === "KeyP") togglePause();
      // Native ESC already exits pointer lock (handled by pointerlockchange);
      // this covers ESC while in drag-look mode.
      if (e.code === "Escape" && !plActive.current) togglePause();
      // L toggles pointer lock (game-style mouselook)
      if (e.code === "KeyL") {
        const s = useGalleryStore.getState();
        if (s.paused || s.activeArtwork) return;
        if (plActive.current) releaseLock();
        else tryLock();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse look: pointer-lock movement + drag fallback + click handling
  useEffect(() => {
    if (isMobile) return;
    const el = gl.domElement;

    const onMouseMove = (e) => {
      const s = useGalleryStore.getState();
      if (s.paused || s.activeArtwork) return;
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
      if (s.paused || s.activeArtwork || plActive.current) return;
      if (e.target !== el) return;
      dragging.current = true;
      dragDist.current = 0;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    const onClick = (e) => {
      const s = useGalleryStore.getState();
      if (s.paused || s.activeArtwork) return;
      if (plActive.current) {
        // Locked mode: click acts on whatever the centre circle targets
        if (s.hoveredSofa && !s.seated) {
          s.setSeated(true);
          return;
        }
        if (s.hoveredId) {
          const art = ARTWORKS.find((a) => a.id === s.hoveredId);
          if (art) s.openArtwork(art);
        }
        return;
      }
      // Unlocked mode: a clean click (not a drag) on empty space engages mouselook.
      // Clicks on artworks are handled by the Exhibit's own onClick.
      if (dragDist.current > 8) return;
      if (e.target !== el) return;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.current.setFromCamera(ndc, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const first = hits.find((h) => h.object.isMesh && h.object.visible);
      if (
        first &&
        first.distance < 9 &&
        (first.object.userData?.artworkId || first.object.userData?.sofa)
      )
        return;
      tryLock();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const exploring = !s.paused && !s.activeArtwork;

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

    // Seated: 360° free look, walking disabled; any movement input stands up
    let seatedActive = s.seated;
    if (seatedActive) {
      const wantsMove =
        Math.abs(f) > 0.05 || Math.abs(r) > 0.05 || keys.current.Space;
      if (wantsMove) {
        s.setSeated(false);
        seatedActive = false;
        camera.position.set(0, EYE, -1.6);
        vel.current.set(0, 0, 0);
      } else {
        const sitEase = 1 - Math.exp(-8 * delta);
        camera.position.x += (0 - camera.position.x) * sitEase;
        camera.position.y += (1.18 - camera.position.y) * sitEase;
        camera.position.z += (0.12 - camera.position.z) * sitEase;
        vel.current.set(0, 0, 0);
      }
    }

    if (!seatedActive) {
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

    // Solid sofa: push the player out of its footprint while walking
    const SOFA_X = 2.05;
    const SOFA_Z = 1.05;
    const px = camera.position.x;
    const pz = camera.position.z;
    if (Math.abs(px) < SOFA_X && Math.abs(pz) < SOFA_Z) {
      const depthX = SOFA_X - Math.abs(px);
      const depthZ = SOFA_Z - Math.abs(pz);
      if (depthX < depthZ) camera.position.x = Math.sign(px || 1) * SOFA_X;
      else camera.position.z = Math.sign(pz || 1) * SOFA_Z;
    }
    }

    if (typeof window !== "undefined") {
      window.__galleryDebug = {
        pos: [camera.position.x, camera.position.y, camera.position.z],
        paused: s.paused,
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
      const sofaHover =
        !s.seated && !!(first && first.object.userData?.sofa && first.distance < 5);
      if (id !== s.hoveredId) s.setHovered(id);
      if (sofaHover !== s.hoveredSofa) s.setHoveredSofa(sofaHover);
    }
  });

  return null;
};
