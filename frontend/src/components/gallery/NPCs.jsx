import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { NPCS } from "../../data/npcs";
import { useGalleryStore } from "../../store/galleryStore";

const BOUNDS = { x: 11, z: 7 };
const AVOID = { x: 3.0, z: 2.6 }; // sofa zone

const shortestAngle = (from, to) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

const randomPoint = () => {
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() * 2 - 1) * BOUNDS.x;
    const z = (Math.random() * 2 - 1) * BOUNDS.z;
    if (Math.abs(x) < AVOID.x && Math.abs(z) < AVOID.z) continue;
    return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(8, 0, 5);
};

const Npc = ({ npc, object, clips }) => {
  const group = useRef();
  const mixer = useMemo(() => new THREE.AnimationMixer(object), [object]);
  const actions = useMemo(
    () => ({
      idle: mixer.clipAction(THREE.AnimationClip.findByName(clips, "Idle")),
      walk: mixer.clipAction(THREE.AnimationClip.findByName(clips, "Walk")),
    }),
    [mixer, clips]
  );
  const state = useRef({
    mode: "idle",
    t: 1 + Math.random() * 4,
    target: null,
    yaw: Math.random() * Math.PI * 2,
  });

  useEffect(() => {
    actions.idle.play();
    return () => mixer.stopAllAction();
  }, [actions, mixer]);

  const handleClick = (e) => {
    e.stopPropagation();
    const s = useGalleryStore.getState();
    if (s.paused || s.activeArtwork || s.activeNpc) return;
    if (!s.isMobile && (s.plActive || s.simLock)) return; // centre-click flow handles
    if (typeof e.delta === "number" && e.delta > 8) return;
    s.openNpc(npc.id);
  };

  useFrame((rstate, dt) => {
    const delta = Math.min(dt, 0.05);
    const s = useGalleryStore.getState();
    const g = group.current;
    if (!g) return;
    const st = state.current;
    const talking = s.activeNpc === npc.id;

    const toIdle = () => {
      if (st.mode !== "idle") {
        actions.walk.fadeOut(0.35);
        actions.idle.reset().fadeIn(0.35).play();
        st.mode = "idle";
        st.t = 2 + Math.random() * 5;
      }
    };
    const toWalk = () => {
      if (st.mode !== "walk") {
        actions.idle.fadeOut(0.35);
        actions.walk.reset().fadeIn(0.35).play();
        st.mode = "walk";
      }
    };

    if (talking) {
      // Stop and face the player
      const cam = rstate.camera.position;
      const targetYaw = Math.atan2(cam.x - g.position.x, cam.z - g.position.z);
      st.yaw += shortestAngle(st.yaw, targetYaw) * (1 - Math.exp(-8 * delta));
      toIdle();
    } else if (!s.paused) {
      if (st.mode === "idle") {
        st.t -= delta;
        if (st.t <= 0) {
          st.target = randomPoint();
          toWalk();
        }
      } else if (st.target) {
        const dir = new THREE.Vector3().subVectors(st.target, g.position);
        dir.y = 0;
        const dist = dir.length();
        if (dist < 0.3) {
          toIdle();
        } else {
          dir.normalize();
          const targetYaw = Math.atan2(dir.x, dir.z);
          st.yaw += shortestAngle(st.yaw, targetYaw) * (1 - Math.exp(-6 * delta));
          g.position.x += dir.x * npc.speed * delta;
          g.position.z += dir.z * npc.speed * delta;
        }
      }
    }

    g.rotation.y = st.yaw;
    mixer.update(delta);
  });

  return (
    <group
      ref={group}
      position={npc.position}
      scale={npc.scale}
      onClick={handleClick}
    >
      <primitive object={object} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

export const NPCs = () => {
  const { scene, animations } = useGLTF("/models/Soldier.glb");

  const clones = useMemo(
    () =>
      NPCS.map((npc) => {
        const obj = SkeletonUtils.clone(scene);
        obj.traverse((c) => {
          if (c.isMesh || c.isSkinnedMesh) {
            c.userData.npcId = npc.id;
            c.frustumCulled = false;
            c.castShadow = false;
            if (c.material) {
              c.material = c.material.clone();
              c.material.color = new THREE.Color(npc.tint);
            }
          }
        });
        return obj;
      }),
    [scene]
  );

  return NPCS.map((npc, i) => (
    <Npc key={npc.id} npc={npc} object={clones[i]} clips={animations} />
  ));
};

useGLTF.preload("/models/Soldier.glb");
