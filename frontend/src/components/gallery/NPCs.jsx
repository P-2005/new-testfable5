import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { NPCS } from "../../data/npcs";
import { useGalleryStore } from "../../store/galleryStore";

const BOUNDS = { x: 11, z: 7 };
const AVOID = { x: 3.0, z: 2.6 }; // sofa zone

// Human visitor models (Ready-Player-Me style casual avatars)
// f1: woman in casual top/jeans · f2: woman with glasses · m1: man in shirt
const MODEL_CONFIG = {
  f1: { url: "/models/visitor_f1.glb", prefix: "", tintMat: "Wolf3D_Outfit_Top", keepHipsPos: true },
  f2: { url: "/models/visitor_f2.glb", prefix: "", tintMat: "costume", keepHipsPos: true },
  m1: { url: "/models/visitor_m1.glb", prefix: "mixamorig2:", tintMat: "MAT-Body", keepHipsPos: false },
};

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

// Retarget an RPM animation clip onto a (possibly bone-prefixed) rig.
// Keeps rotation tracks (+ optional Hips position) so different body
// proportions don't distort.
const retargetClip = (clip, prefix, keepHipsPos) => {
  const c = clip.clone();
  c.tracks = c.tracks.filter((t) => {
    if (t.name.endsWith(".quaternion")) return true;
    if (keepHipsPos && t.name.endsWith(".position") && t.name.startsWith("Hips.")) return true;
    return false;
  });
  if (prefix) {
    c.tracks.forEach((t) => {
      t.name = prefix + t.name;
    });
  }
  return c;
};

const Npc = ({ npc, object, clips }) => {
  const group = useRef();
  const mixer = useMemo(() => new THREE.AnimationMixer(object), [object]);
  const actions = useMemo(
    () => ({
      idle: mixer.clipAction(clips.idle),
      walk: mixer.clipAction(clips.walk),
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
      <primitive object={object} />
    </group>
  );
};

export const NPCs = () => {
  const f1 = useGLTF(MODEL_CONFIG.f1.url);
  const f2 = useGLTF(MODEL_CONFIG.f2.url);
  const m1 = useGLTF(MODEL_CONFIG.m1.url);
  const fWalk = useGLTF("/models/F_Walk.glb");
  const fIdle = useGLTF("/models/F_Idle.glb");
  const mWalk = useGLTF("/models/M_Walk.glb");
  const mIdle = useGLTF("/models/M_Idle.glb");

  const scenes = useMemo(() => ({ f1: f1.scene, f2: f2.scene, m1: m1.scene }), [f1, f2, m1]);

  const clipSets = useMemo(() => {
    const sets = {};
    for (const key of Object.keys(MODEL_CONFIG)) {
      const cfg = MODEL_CONFIG[key];
      const walkSrc = key === "m1" ? mWalk.animations[0] : fWalk.animations[0];
      const idleSrc = key === "m1" ? mIdle.animations[0] : fIdle.animations[0];
      sets[key] = {
        walk: retargetClip(walkSrc, cfg.prefix, cfg.keepHipsPos),
        idle: retargetClip(idleSrc, cfg.prefix, cfg.keepHipsPos),
      };
    }
    return sets;
  }, [fWalk, fIdle, mWalk, mIdle]);

  const clones = useMemo(
    () =>
      NPCS.map((npc) => {
        const cfg = MODEL_CONFIG[npc.model] || MODEL_CONFIG.m1;
        const obj = SkeletonUtils.clone(scenes[npc.model] || scenes.m1);
        obj.traverse((c) => {
          if (c.isMesh || c.isSkinnedMesh) {
            c.userData.npcId = npc.id;
            c.frustumCulled = false;
            c.castShadow = false;
            if (c.material && c.material.name === cfg.tintMat) {
              c.material = c.material.clone();
              c.material.color = new THREE.Color(npc.tint);
            }
          }
        });
        return obj;
      }),
    [scenes]
  );

  return NPCS.map((npc, i) => (
    <Npc
      key={npc.id}
      npc={npc}
      object={clones[i]}
      clips={clipSets[npc.model] || clipSets.m1}
    />
  ));
};

useGLTF.preload(MODEL_CONFIG.f1.url);
useGLTF.preload(MODEL_CONFIG.f2.url);
useGLTF.preload(MODEL_CONFIG.m1.url);
useGLTF.preload("/models/F_Walk.glb");
useGLTF.preload("/models/F_Idle.glb");
useGLTF.preload("/models/M_Walk.glb");
useGLTF.preload("/models/M_Idle.glb");
