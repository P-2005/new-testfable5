import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useGalleryStore, mobileInput } from "../../store/galleryStore";
import { ARTWORKS } from "../../data/artworks";

const WALK = 4.2;
const RUN = 7.2;
const EYE = 1.6;
const BOUNDS = { x: 12.7, z: 8.7 };

const clamp = THREE.MathUtils.clamp;

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

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === "Space") e.preventDefault();
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

  // Click-to-inspect while pointer-locked (desktop)
  useEffect(() => {
    const onClick = () => {
      const s = useGalleryStore.getState();
      if (s.locked && s.hoveredId && !s.activeArtwork) {
        const art = ARTWORKS.find((a) => a.id === s.hoveredId);
        if (art) s.openArtwork(art);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

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
    const canMove = !s.activeArtwork && (s.locked || isMobile);

    // Mobile look
    if (isMobile && canMove) {
      camera.rotation.order = "YXZ";
      camera.rotation.y -= mobileInput.look.x * 0.0042;
      camera.rotation.x = clamp(camera.rotation.x - mobileInput.look.y * 0.0042, -1.25, 1.25);
      camera.rotation.z = 0;
    }
    mobileInput.look.x = 0;
    mobileInput.look.y = 0;

    // Movement input
    let f = 0;
    let r = 0;
    if (canMove) {
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
    const moving = Math.abs(f) > 0.05 || Math.abs(r) > 0.05;

    if (moving) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
      const dir = forward.multiplyScalar(f).add(right.multiplyScalar(r));
      if (dir.lengthSq() > 1) dir.normalize();
      camera.position.x = clamp(camera.position.x + dir.x * speed * delta, -BOUNDS.x, BOUNDS.x);
      camera.position.z = clamp(camera.position.z + dir.z * speed * delta, -BOUNDS.z, BOUNDS.z);
      bob.current += delta * (running ? 13 : 9);
    }

    // Jump
    if (canMove && keys.current.Space && grounded.current) {
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

    const bobOff = moving && grounded.current ? Math.sin(bob.current) * 0.035 : 0;
    camera.position.y = EYE + jumpH.current + bobOff;

    // Center raycast for hover detection (throttled)
    rayTimer.current += delta;
    if (rayTimer.current > 0.12 && (s.locked || isMobile) && !s.activeArtwork) {
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

  if (isMobile) return null;

  return (
    <PointerLockControls
      makeDefault
      ref={(c) => {
        if (c) useGalleryStore.getState().setControls(c);
      }}
      onLock={() => useGalleryStore.getState().setLocked(true)}
      onUnlock={() => useGalleryStore.getState().setLocked(false)}
    />
  );
};
