"use client";

import { useEffect, useRef } from 'react';
import Delaunator from 'delaunator';
import {
  BufferGeometry,
  ColorManagement,
  DoubleSide,
  Float32BufferAttribute,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Camera,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LchValue } from '../type';
import { AnyRgb, build, rgb, toTarget } from '@/lib/colors';
import { C_MAX, L_MAX_COLOR } from '@/lib/config';
import { useOklchContext } from '../context/OklchContext';

// --- Type Definitions ---

export type RgbMode = 'p3' | 'rec2020' | 'rgb';

interface UpdateSlice {
  (color: LchValue): void;
}

export interface ModelProps {
  /**
   * Whether the user can interact with the model (pan, zoom, rotate).
   * @default false
   */
  isInteractive?: boolean;
  /**
   * Optional class name for the container.
   */
  className?: string;
}

// --- Helper Functions (from original codebase, correctly ported) ---

function onGamutEdge(r: number, g: number, b: number): boolean {
  return r === 0 || g === 0 || b === 0 || r > 0.99 || g > 0.99 || b > 0.99;
}

function getModelData(mode: RgbMode): [Vector3[], number[]] {
  const coordinates: Vector3[] = [];
  const colors: number[] = [];

  for (let x = 0; x <= 1; x += 0.01) {
    for (let y = 0; y <= 1; y += 0.01) {
      for (let z = 0; z <= 1; z += 0.01) {
        if (onGamutEdge(x, y, z)) {
          const edgeRgb: AnyRgb = { b: z, g: y, mode, r: x };
          const to = toTarget(edgeRgb);
          if (to.h) {
            colors.push(edgeRgb.r, edgeRgb.g, edgeRgb.b);
            coordinates.push(
              new Vector3(to.l / L_MAX_COLOR, to.c / (C_MAX * 2), to.h / 360)
            );
          }
        }
      }
    }
  }

  const bounds = [
    [0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 1, 0],
    [1, 0, 1], [1, 0, 1], [1, 1, 1],
  ];
  for (const i of bounds) {
    coordinates.push(new Vector3(...i));
    colors.push(i[0], i[0], i[0]);
  }

  return [coordinates, colors];
}

function generateMesh(scene: Scene, mode: RgbMode): UpdateSlice {
  scene.clear();

  const [coordinates, colors] = getModelData(mode);
  const top = new BufferGeometry().setFromPoints(coordinates);
  top.setAttribute('color', new Float32BufferAttribute(colors, 3));
  top.center();
  top.setIndex(
    Array.from(Delaunator.from(coordinates.map(c => [c.x, c.z])).triangles)
  );
  top.computeVertexNormals();

  const material = new MeshBasicMaterial({ side: DoubleSide, vertexColors: true });
  const l = new Vector2(0, 1);
  const c = new Vector2(0, 1);
  const h = new Vector2(0, 1);
  material.onBeforeCompile = shader => {
    shader.uniforms.sliceL = { value: l };
    shader.uniforms.sliceC = { value: c };
    shader.uniforms.sliceH = { value: h };
    shader.vertexShader = `
      varying vec3 vPos;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      vPos = transformed;`
    );
    shader.fragmentShader = `
      #define ss(a, b, c) smoothstep(a, b, c)
      uniform vec2 sliceL, sliceC, sliceH;
      varying vec3 vPos;
      ${shader.fragmentShader}
    `.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
        vec3 col = vec3(0.5, 0.5, 0.5);
        float width = 0.0025;
        float l_slice = ss(width, 0., abs(vPos.x + sliceL.y));
        float c_slice = ss(width, 0., abs(vPos.y + sliceC.y));
        float h_slice = ss(width, 0., abs(vPos.z - sliceH.y));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, col, l_slice);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, col, c_slice);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, col, h_slice);`
    );
  };

  const topMesh = new Mesh(top, material);
  topMesh.translateY(0.3);
  scene.add(topMesh);

  const bottom = new PlaneGeometry(1, 1, 1, 20);
  const bottomColors = [];
  if ('array' in bottom.attributes.position) {
    const bottomSteps = bottom.attributes.position.array.length / 6;
    for (let i = 0; i <= bottomSteps; i += 1) {
      const lchL = (L_MAX_COLOR * i) / bottomSteps;
      const rgbL = rgb(build(lchL, 0, 0)).r;
      bottomColors.push(rgbL, rgbL, rgbL, rgbL, rgbL, rgbL);
    }
  }
  bottom.setAttribute('color', new Float32BufferAttribute(bottomColors, 3));
  bottom.translate(0, 0, -0.2);
  bottom.rotateZ(Math.PI * 0.5);
  bottom.rotateX(-Math.PI * 0.5);
  const bottomMesh = new Mesh(bottom, material);
  scene.add(bottomMesh);

  return color => {
    l.set(0, -color.l + 0.5);
    c.set(0, (0.5 * -color.c) / C_MAX + 0.5);
    h.set(0, 0.0028 * color.h - (color.h > 350 ? 0.51 : 0.5));
  };
}

function initScene(
  canvas: HTMLCanvasElement,
  fullControl: boolean
): [Scene, Camera, WebGLRenderer, OrbitControls] {
  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
  const renderer = new WebGLRenderer({ alpha: true, canvas });

  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  camera.position.set(0.79, 0, 0.79);
  camera.lookAt(new Vector3(0, 1, 0));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = fullControl;
  controls.enableZoom = fullControl;
  if (fullControl) {
    controls.minDistance = 0.9;
    controls.maxDistance = 3;
  } else {
    // For non-interactive, allow rotation but not pan/zoom
    controls.enablePan = false;
    controls.enableZoom = false;
  }

  return [scene, camera, renderer, controls];
}

// --- React Component ---

/**
 * A React component that renders an interactive 3D model of an OKLCH color space.
 */
export default function Model({ isInteractive = false, className }: ModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { value: colorValue, showP3, showRec2020 } = useOklchContext();

  const rgbMode = showP3 ? 'p3' : showRec2020 ? 'rec2020' : 'rgb';

  const stateRef = useRef<{
    renderer?: WebGLRenderer;
    scene?: Scene;
    camera?: Camera;
    controls?: OrbitControls;
    updateSlice?: UpdateSlice;
    animationFrameId?: number;
  }>({});

  // Effect for initial setup, animation loop, and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ColorManagement.enabled = false;
    const [scene, camera, renderer, controls] = initScene(canvas, isInteractive);
    stateRef.current = { renderer, scene, camera, controls };

    const animate = () => {
      stateRef.current.animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (stateRef.current.animationFrameId) {
        cancelAnimationFrame(stateRef.current.animationFrameId);
      }
      controls.dispose();
      renderer.dispose();
      scene.traverse(object => {
        if (object instanceof Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    };
  }, [isInteractive]);

  // Effect to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const { camera, renderer } = stateRef.current;
      const canvas = canvasRef.current;
      if (camera instanceof PerspectiveCamera && renderer && canvas) {
        const { clientWidth: width, clientHeight: height } = canvas;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to regenerate the mesh when the color gamut (rgbMode) changes
  useEffect(() => {
    const { scene } = stateRef.current;
    if (!scene) return;

    const updateSliceFn = generateMesh(scene, rgbMode);
    stateRef.current.updateSlice = updateSliceFn;

    // After regenerating, immediately update the slices to the current color
    if (colorValue) {
      updateSliceFn(colorValue);
    }
  }, [rgbMode, colorValue]); // Rerun if mode changes

  // Effect to update the slice lines when the color value changes
  useEffect(() => {
    const { updateSlice } = stateRef.current;
    if (updateSlice && colorValue) {
      updateSlice(colorValue);
    }
  }, [colorValue]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}