import {
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { muscleDisplayLabels } from "../domain/exerciseMuscleMap";
import { getMuscleKeyForModelObject } from "../domain/muscleModelMap";
import type { MuscleSvgActivation, MuscleView, MuscleVisualRole } from "../domain/muscleAssetTypes";
import type { MuscleMapKey } from "../types/appTypes";

type MuscleModelViewerProps = {
  view: MuscleView;
  activations: MuscleSvgActivation[];
  selectedMuscleId?: MuscleMapKey | null;
  onMuscleSelect?: (muscleId: MuscleMapKey) => void;
  className?: string;
};

type MuscleMesh = {
  mesh: THREE.Mesh;
  muscle: MuscleMapKey;
  label: string;
};

type ViewerResources = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  muscleMeshes: MuscleMesh[];
  materialCache: Map<string, THREE.MeshStandardMaterial>;
  animationFrameId: number;
  resizeObserver: ResizeObserver;
};

type LoadState = "loading" | "ready" | "error";

const modelPath = "/assets/anatomy/body.glb";
const dracoPath = "/assets/anatomy/draco/";

const roleColors: Record<MuscleVisualRole, { color: string; opacity: number }> = {
  primary: { color: "#DC2626", opacity: 0.92 },
  secondary: { color: "#F97316", opacity: 0.82 },
  supporting: { color: "#FACC15", opacity: 0.72 },
  inactive: { color: "#D8DEE4", opacity: 0.28 },
};

function getActivationRoleMap(activations: MuscleSvgActivation[]) {
  return activations.reduce<Partial<Record<MuscleMapKey, MuscleVisualRole>>>((map, activation) => {
    map[activation.muscle] = activation.role;
    return map;
  }, {});
}

function createMaterial(
  cache: Map<string, THREE.MeshStandardMaterial>,
  role: MuscleVisualRole,
  selected: boolean,
) {
  const cacheKey = `${role}:${selected ? "selected" : "normal"}`;
  const cachedMaterial = cache.get(cacheKey);
  if (cachedMaterial) return cachedMaterial;

  const style = roleColors[role];
  const material = new THREE.MeshStandardMaterial({
    color: style.color,
    emissive: selected ? style.color : "#000000",
    emissiveIntensity: selected ? 0.12 : 0,
    metalness: 0.05,
    opacity: selected ? Math.min(1, style.opacity + 0.08) : style.opacity,
    roughness: 0.78,
    transparent: role === "inactive" || style.opacity < 1,
  });

  cache.set(cacheKey, material);
  return material;
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh;
}

function getObjectUserData(object: THREE.Object3D) {
  return object.userData as Record<string, unknown>;
}

function getObjectDisplayLabel(object: THREE.Object3D) {
  const userData = getObjectUserData(object);
  return typeof userData.nameDetail === "string"
    ? userData.nameDetail
    : object.name;
}

function normalizeModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  model.position.sub(center);
  if (maxDimension > 0) {
    model.scale.setScalar(2.3 / maxDimension);
  }
}

function setCameraView(resources: ViewerResources, view: MuscleView, zoom: number) {
  const distance = 3.15 / zoom;
  const z = view === "front" ? distance : -distance;

  resources.camera.position.set(0, 0.15, z);
  resources.camera.lookAt(0, 0.05, 0);
  resources.controls.target.set(0, 0.05, 0);
  resources.controls.update();
}

function applyActivationStyles(
  resources: ViewerResources,
  activations: MuscleSvgActivation[],
  selectedMuscleId?: MuscleMapKey | null,
) {
  const roleMap = getActivationRoleMap(activations);

  resources.muscleMeshes.forEach(({ mesh, muscle }) => {
    const role = roleMap[muscle] ?? "inactive";
    mesh.material = createMaterial(
      resources.materialCache,
      role,
      selectedMuscleId === muscle,
    );
  });
}

export function MuscleModelViewer({
  view,
  activations,
  selectedMuscleId,
  onMuscleSelect,
  className,
}: MuscleModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<ViewerResources | null>(null);
  const activationsRef = useRef(activations);
  const onMuscleSelectRef = useRef(onMuscleSelect);
  const selectedMuscleIdRef = useRef(selectedMuscleId);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    onMuscleSelectRef.current = onMuscleSelect;
  }, [onMuscleSelect]);

  useEffect(() => {
    activationsRef.current = activations;
    selectedMuscleIdRef.current = selectedMuscleId;

    if (resourcesRef.current) {
      applyActivationStyles(resourcesRef.current, activations, selectedMuscleId);
    }
  }, [activations, selectedMuscleId]);

  useEffect(() => {
    if (resourcesRef.current) {
      setCameraView(resourcesRef.current, view, zoom);
    }
  }, [view, zoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.4;
    controls.maxDistance = 6;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa0b8, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 3, 3);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-2, 1.5, -2);
    scene.add(fillLight);

    const resources: ViewerResources = {
      renderer,
      scene,
      camera,
      controls,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      muscleMeshes: [],
      materialCache: new Map(),
      animationFrameId: 0,
      resizeObserver: new ResizeObserver(() => {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }),
    };

    resources.resizeObserver.observe(container);
    resourcesRef.current = resources;
    setCameraView(resources, view, zoom);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      modelPath,
      (gltf) => {
        if (disposed) return;

        const model = gltf.scene;
        normalizeModel(model);
        scene.add(model);

        const availableMuscleLabels: string[] = [];
        model.traverse((object) => {
          if (!isMesh(object)) return;

          const userData = getObjectUserData(object);
          const isMuscle = userData.type === "muscle";
          object.castShadow = false;
          object.receiveShadow = false;

          if (!isMuscle) {
            object.visible = false;
            return;
          }

          const muscle = getMuscleKeyForModelObject(object.name, userData);
          if (!muscle) {
            object.material = createMaterial(resources.materialCache, "inactive", false);
            availableMuscleLabels.push(getObjectDisplayLabel(object));
            return;
          }

          object.userData.liftBatteryMuscle = muscle;
          object.material = createMaterial(resources.materialCache, "inactive", false);
          resources.muscleMeshes.push({
            mesh: object,
            muscle,
            label: getObjectDisplayLabel(object),
          });
          availableMuscleLabels.push(getObjectDisplayLabel(object));
        });

        applyActivationStyles(resources, activationsRef.current, selectedMuscleIdRef.current);
        setLoadState("ready");

        if (import.meta.env.DEV) {
          const mappedMuscleIds = new Set(resources.muscleMeshes.map((item) => item.muscle));
          const missingMuscleIds = activationsRef.current
            .filter((activation) => activation.role !== "inactive")
            .map((activation) => activation.muscle)
            .filter((muscle) => !mappedMuscleIds.has(muscle));
          console.info("Anatomy GLB diagnostics", {
            missingMuscleIds,
            highlightedMeshLabels: resources.muscleMeshes.map((item) => item.label),
            availableMuscleLabels,
          });
        }
      },
      undefined,
      (error) => {
        if (disposed) return;

        if (import.meta.env.DEV) {
          console.warn("Failed to load anatomy GLB model.", error);
        }
        setLoadState("error");
      },
    );

    function animate() {
      resources.animationFrameId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    function handlePointerDown(event: PointerEvent) {
      if (!resourcesRef.current || !onMuscleSelectRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      resources.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      resources.mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      resources.raycaster.setFromCamera(resources.mouse, camera);

      const intersections = resources.raycaster.intersectObjects(
        resources.muscleMeshes.map((item) => item.mesh),
        false,
      );
      const selected = intersections[0]?.object.userData.liftBatteryMuscle;

      if (typeof selected === "string") {
        onMuscleSelectRef.current(selected as MuscleMapKey);
      }
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      disposed = true;
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      window.cancelAnimationFrame(resources.animationFrameId);
      resources.resizeObserver.disconnect();
      controls.dispose();
      dracoLoader.dispose();
      resources.materialCache.forEach((material) => material.dispose());
      scene.traverse((object) => {
        if (!isMesh(object)) return;
        object.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      resourcesRef.current = null;
    };
  }, []);

  function zoomOut() {
    setZoom((currentZoom) => Math.max(0.75, Number((currentZoom - 0.15).toFixed(2))));
  }

  function zoomIn() {
    setZoom((currentZoom) => Math.min(2.2, Number((currentZoom + 0.15).toFixed(2))));
  }

  function resetZoom() {
    setZoom(1);
  }

  const rootClassName = className ? `muscle-model-viewer ${className}` : "muscle-model-viewer";

  return (
    <div className={rootClassName}>
      <div className="muscle-svg-toolbar" aria-label="3D 人体肌肉图缩放">
        <button type="button" onClick={zoomOut} aria-label="缩小 3D 人体肌肉图">−</button>
        <button type="button" onClick={resetZoom} aria-label="重置 3D 人体肌肉图缩放">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={zoomIn} aria-label="放大 3D 人体肌肉图">＋</button>
      </div>
      <div className="muscle-model-canvas" ref={containerRef}>
        {loadState === "loading" ? (
          <div className="muscle-svg-loading">正在加载 3D 人体肌肉模型…</div>
        ) : null}
        {loadState === "error" ? (
          <div className="muscle-svg-empty" role="status">
            <span className="muscle-svg-empty-icon" aria-hidden="true">⌁</span>
            <strong>3D 人体模型加载失败</strong>
            <p>请确认 body.glb 和 DRACO 解码器资产存在。</p>
          </div>
        ) : null}
      </div>
      {selectedMuscleId ? (
        <p className="muscle-model-selected">已选中：{muscleDisplayLabels[selectedMuscleId]}</p>
      ) : null}
    </div>
  );
}
