import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { CFG, GLOW_FRAGMENT_SHADER, GLOW_VERTEX_SHADER, PHOTO_FRAGMENT_SHADER, PHOTO_VERTEX_SHADER } from '../constants';
import { AppMode, HandState, ModelType, ParticleImage, GestureType } from '../types';
import { calculateShapes } from '../utils/geometry';

interface SceneProps {
  mode: AppMode;
  selectedModel: ModelType;
  images: ParticleImage[];
  color: string;
  handState: React.MutableRefObject<HandState>;
  backgroundTexture: THREE.Texture | null;
  onGalleryLayoutUpdate: (layout: Float32Array) => void;
}

const Scene: React.FC<SceneProps> = React.memo(({ mode, selectedModel, images, color, handState, backgroundTexture, onGalleryLayoutUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js Objects Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  
  // Particle Systems
  const sysGlowRef = useRef<THREE.Points | null>(null);
  const sysGoldRef = useRef<THREE.Points | null>(null);
  const sysPurpleRef = useRef<THREE.Points | null>(null);
  const sysWineRef = useRef<THREE.Points | null>(null); 
  const sysPhotoRef = useRef<THREE.Points | null>(null);
  const sysFirefliesRef = useRef<THREE.Points | null>(null); 
  
  const bgMeshRef = useRef<THREE.Mesh | null>(null);
  
  // Physics & Animation Refs
  const particleAlphasRef = useRef<Float32Array | null>(null);
  const shapesRef = useRef<any>(null);
  
  // Main System Physics
  const posRef = useRef<Float32Array | null>(null);
  const velRef = useRef<Float32Array | null>(null);
  
  // Gold System Physics
  const goldPosRef = useRef<Float32Array | null>(null);
  const goldVelRef = useRef<Float32Array | null>(null);

  // Purple System Physics
  const purplePosRef = useRef<Float32Array | null>(null);
  const purpleVelRef = useRef<Float32Array | null>(null);

  // Wine System Physics
  const winePosRef = useRef<Float32Array | null>(null);
  const wineVelRef = useRef<Float32Array | null>(null);
  
  // Firefly Physics 
  const fireflyPosRef = useRef<Float32Array | null>(null);
  const fireflyVelRef = useRef<Float32Array | null>(null);

  const galleryVelRef = useRef<Float32Array | null>(null);
  
  // Textures
  const atlasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const atlasTexRef = useRef<THREE.CanvasTexture | null>(null);

  // Animation Loop State
  const reqIdRef = useRef<number>(0);
  const opacityGlowRef = useRef(1.0);
  const opacityPhotoRef = useRef(0.0);
  const handOpenLevelRef = useRef(0.0); // 0.0 to 1.0 smooth transition for hand open gesture
  const clockRef = useRef(new THREE.Clock());

  // Keep props in refs to avoid stale closures in the animation loop
  const modeRef = useRef(mode);
  const selectedModelRef = useRef(selectedModel);
  const imagesRef = useRef(images);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { selectedModelRef.current = selectedModel; }, [selectedModel]);
  useEffect(() => { imagesRef.current = images; }, [images]);

  // --- Initialization ---
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020005, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 85;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post Processing - Bloom
    // Threshold moved to 0.85 so Photos (clamped to 0.8) DO NOT glow, 
    // but particles (brightness > 2.0) DO glow.
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composerRef.current = composer;

    // Background - Unit Plane for easier scaling
    const bgGeo = new THREE.PlaneGeometry(1, 1);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, fog: false });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -900;
    scene.add(bgMesh);
    bgMeshRef.current = bgMesh;

    // Physics Arrays Setup
    const pos = new Float32Array(CFG.count * 3);
    const vel = new Float32Array(CFG.count * 3);
    const goldPos = new Float32Array(CFG.count * 3);
    const goldVel = new Float32Array(CFG.count * 3);
    const purplePos = new Float32Array(CFG.count * 3);
    const purpleVel = new Float32Array(CFG.count * 3);
    const winePos = new Float32Array(CFG.count * 3);
    const wineVel = new Float32Array(CFG.count * 3);
    const galleryVel = new Float32Array(CFG.count * 3);
    
    // Firefly Arrays
    const fireflyCount = 3000; 
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyVel = new Float32Array(fireflyCount * 3);

    for(let i=0; i<CFG.count; i++) {
        const x = (Math.random()-0.5)*350;
        const y = (Math.random()-0.5)*250;
        const z = (Math.random()-0.5)*150;
        
        pos[i*3] = x; 
        pos[i*3+1] = y; 
        pos[i*3+2] = z;

        goldPos[i*3] = x;
        goldPos[i*3+1] = y;
        goldPos[i*3+2] = z;

        purplePos[i*3] = x;
        purplePos[i*3+1] = y;
        purplePos[i*3+2] = z;

        winePos[i*3] = x;
        winePos[i*3+1] = y;
        winePos[i*3+2] = z;

        galleryVel[i*3] = (Math.random() - 0.5) * 0.2; 
        galleryVel[i*3+1] = (Math.random() - 0.5) * 0.2; 
        galleryVel[i*3+2] = (Math.random() - 0.5) * 0.05; 
    }
    
    // Initialize Fireflies (Background)
    for(let i=0; i<fireflyCount; i++) {
        fireflyPos[i*3] = (Math.random()-0.5) * 700; // Wider
        fireflyPos[i*3+1] = (Math.random()-0.5) * 500; // Taller
        fireflyPos[i*3+2] = -50 - Math.random() * 500; // Deep background Z
        
        fireflyVel[i*3] = (Math.random() - 0.5) * 0.15;
        fireflyVel[i*3+1] = 0.05 + Math.random() * 0.15; // Slowly rising
        fireflyVel[i*3+2] = (Math.random() - 0.5) * 0.15;
    }

    posRef.current = pos;
    velRef.current = vel;
    goldPosRef.current = goldPos;
    goldVelRef.current = goldVel;
    purplePosRef.current = purplePos;
    purpleVelRef.current = purpleVel;
    winePosRef.current = winePos;
    wineVelRef.current = wineVel;
    galleryVelRef.current = galleryVel;
    
    fireflyPosRef.current = fireflyPos;
    fireflyVelRef.current = fireflyVel;

    // Calculate Shapes
    shapesRef.current = calculateShapes();

    // Visuals Initialization
    const cvs = document.createElement('canvas'); 
    cvs.width = CFG.atlas; 
    cvs.height = CFG.atlas;
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    if (ctx) {
        // Transparent initialization
        ctx.clearRect(0,0,CFG.atlas,CFG.atlas);
        atlasCtxRef.current = ctx;
        const tex = new THREE.CanvasTexture(cvs); 
        tex.flipY = true; 
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter; // Linear for better photo quality
        tex.generateMipmaps = false;
        atlasTexRef.current = tex;
    }

    // --- Main Glow Particles ---
    const idx = new Float32Array(CFG.count); 
    const sz = new Float32Array(CFG.count);
    const col = new Float32Array(CFG.count * 3); 
    const isPhoto = new Float32Array(CFG.count); 
    const pAlphas = new Float32Array(CFG.count);
    particleAlphasRef.current = pAlphas;

    // --- Auxiliary Particles Attributes ---
    const goldColAttr = new Float32Array(CFG.count * 3);
    const goldSzAttr = new Float32Array(CFG.count);
    const purpleColAttr = new Float32Array(CFG.count * 3);
    const purpleSzAttr = new Float32Array(CFG.count);
    const wineColAttr = new Float32Array(CFG.count * 3);
    const wineSzAttr = new Float32Array(CFG.count);

    const colorDeep = new THREE.Color(0x380058); 
    const colorLight = new THREE.Color(0xd896ff); 
    const goldColor = new THREE.Color(0xFFD700); 
    const purpleColor = new THREE.Color(0x5500AB);
    const wineColor = new THREE.Color(0x900020);
    const tempCol = new THREE.Color();

    for(let i=0; i<CFG.count; i++) {
        idx[i] = 0; 
        isPhoto[i] = 0.0; 
        sz[i] = 0.5 + Math.random();
        
        // Main colors
        const alpha = Math.random(); 
        pAlphas[i] = alpha; 
        tempCol.copy(colorDeep).lerp(colorLight, alpha);
        col[i*3] = tempCol.r; col[i*3+1] = tempCol.g; col[i*3+2] = tempCol.b;

        // Gold colors & Size
        goldColAttr[i*3] = goldColor.r; 
        goldColAttr[i*3+1] = goldColor.g; 
        goldColAttr[i*3+2] = goldColor.b;
        goldSzAttr[i] = (0.5 + Math.random()) * 0.8;

        // Purple colors & Size
        purpleColAttr[i*3] = purpleColor.r; 
        purpleColAttr[i*3+1] = purpleColor.g; 
        purpleColAttr[i*3+2] = purpleColor.b;
        purpleSzAttr[i] = (0.4 + Math.random()) * 0.9;

        // Wine colors & Size
        wineColAttr[i*3] = wineColor.r; 
        wineColAttr[i*3+1] = wineColor.g; 
        wineColAttr[i*3+2] = wineColor.b;
        wineSzAttr[i] = (0.6 + Math.random()) * 0.75;
    }

    // Firefly Attributes
    const fireflyCol = new Float32Array(fireflyCount * 3);
    const fireflySz = new Float32Array(fireflyCount);
    const fireflyColorBase = new THREE.Color(0xccff66); // Yellow-Green
    for(let i=0; i<fireflyCount; i++) {
        fireflyCol[i*3] = fireflyColorBase.r;
        fireflyCol[i*3+1] = fireflyColorBase.g;
        fireflyCol[i*3+2] = fireflyColorBase.b;
        fireflySz[i] = 1.5 + Math.random() * 2.0;
    }

    // Geometry Construction
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); 
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('imgIndex', new THREE.BufferAttribute(idx, 1)); 
    geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));
    geo.setAttribute('isPhoto', new THREE.BufferAttribute(isPhoto, 1));

    const goldGeo = new THREE.BufferGeometry();
    goldGeo.setAttribute('position', new THREE.BufferAttribute(goldPos, 3));
    goldGeo.setAttribute('color', new THREE.BufferAttribute(goldColAttr, 3));
    goldGeo.setAttribute('size', new THREE.BufferAttribute(goldSzAttr, 1));

    const purpleGeo = new THREE.BufferGeometry();
    purpleGeo.setAttribute('position', new THREE.BufferAttribute(purplePos, 3));
    purpleGeo.setAttribute('color', new THREE.BufferAttribute(purpleColAttr, 3));
    purpleGeo.setAttribute('size', new THREE.BufferAttribute(purpleSzAttr, 1));

    const wineGeo = new THREE.BufferGeometry();
    wineGeo.setAttribute('position', new THREE.BufferAttribute(winePos, 3));
    wineGeo.setAttribute('color', new THREE.BufferAttribute(wineColAttr, 3));
    wineGeo.setAttribute('size', new THREE.BufferAttribute(wineSzAttr, 1));

    const fireflyGeo = new THREE.BufferGeometry();
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyCol, 3));
    fireflyGeo.setAttribute('size', new THREE.BufferAttribute(fireflySz, 1));

    // Glow System Material
    const matGlow = new THREE.ShaderMaterial({
        uniforms: { 
            uOpacity: { value: 1.0 }, 
            uRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTime: { value: 0 } 
        },
        vertexShader: GLOW_VERTEX_SHADER,
        fragmentShader: GLOW_FRAGMENT_SHADER,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const matGold = new THREE.ShaderMaterial({
        uniforms: { 
            uOpacity: { value: 0.6 }, 
            uRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTime: { value: 0 }
        },
        vertexShader: GLOW_VERTEX_SHADER, 
        fragmentShader: GLOW_FRAGMENT_SHADER,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const matPurple = new THREE.ShaderMaterial({
        uniforms: { 
            uOpacity: { value: 0.5 }, 
            uRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTime: { value: 0 }
        },
        vertexShader: GLOW_VERTEX_SHADER, 
        fragmentShader: GLOW_FRAGMENT_SHADER,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const matWine = new THREE.ShaderMaterial({
        uniforms: { 
            uOpacity: { value: 0.55 }, 
            uRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTime: { value: 0 }
        },
        vertexShader: GLOW_VERTEX_SHADER, 
        fragmentShader: GLOW_FRAGMENT_SHADER,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    
    const matFirefly = new THREE.ShaderMaterial({
        uniforms: { 
            uOpacity: { value: 0.8 }, 
            uRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTime: { value: 0 }
        },
        vertexShader: GLOW_VERTEX_SHADER, 
        fragmentShader: GLOW_FRAGMENT_SHADER,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const sysGlow = new THREE.Points(geo, matGlow);
    scene.add(sysGlow);
    sysGlowRef.current = sysGlow;

    const sysGold = new THREE.Points(goldGeo, matGold);
    scene.add(sysGold);
    sysGoldRef.current = sysGold;

    const sysPurple = new THREE.Points(purpleGeo, matPurple);
    scene.add(sysPurple);
    sysPurpleRef.current = sysPurple;

    const sysWine = new THREE.Points(wineGeo, matWine);
    scene.add(sysWine);
    sysWineRef.current = sysWine;

    const sysFireflies = new THREE.Points(fireflyGeo, matFirefly);
    scene.add(sysFireflies);
    sysFirefliesRef.current = sysFireflies;

    // Photo System
    if (atlasTexRef.current) {
        const matPhoto = new THREE.ShaderMaterial({
            uniforms: { 
                tex: { value: atlasTexRef.current }, 
                uOpacity: { value: 0.0 }, 
                cols: { value: CFG.cols }, 
                uRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uHandOpen: { value: 0.0 },
            },
            vertexShader: PHOTO_VERTEX_SHADER,
            fragmentShader: PHOTO_FRAGMENT_SHADER,
            transparent: true, depthWrite: false, blending: THREE.NormalBlending
        });
        const sysPhoto = new THREE.Points(geo, matPhoto); 
        scene.add(sysPhoto);
        sysPhotoRef.current = sysPhoto;
    }

    // Helper for background scaling
    const updateBgScale = () => {
        if (!bgMeshRef.current || !cameraRef.current || !backgroundTexture) return;
        const img = backgroundTexture.image as HTMLImageElement;
        if (!img) return;

        const bgAspect = img.width / img.height;
        const cam = cameraRef.current;
        const dist = cam.position.z - bgMeshRef.current.position.z; 
        const vFOV = THREE.MathUtils.degToRad(cam.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
        const visibleWidth = visibleHeight * cam.aspect;
        
        const screenAspect = visibleWidth / visibleHeight;
        
        if (screenAspect > bgAspect) {
            bgMeshRef.current.scale.set(visibleWidth, visibleWidth / bgAspect, 1);
        } else {
            bgMeshRef.current.scale.set(visibleHeight * bgAspect, visibleHeight, 1);
        }
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        updateBgScale();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
        reqIdRef.current = requestAnimationFrame(animate);
        const time = clockRef.current.getElapsedTime();
        const hand = handState.current;

        const currentMode = modeRef.current;
        const currentModel = selectedModelRef.current;
        const currentImages = imagesRef.current;

        if (sysGlowRef.current) (sysGlowRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        if (sysGoldRef.current) (sysGoldRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        if (sysPurpleRef.current) (sysPurpleRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        if (sysWineRef.current) (sysWineRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        if (sysFirefliesRef.current) (sysFirefliesRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;

        const showPhotos = (currentMode === AppMode.GALLERY && currentImages.length > 0);
        opacityGlowRef.current += (1.0 - opacityGlowRef.current) * 0.1;
        opacityPhotoRef.current += ((showPhotos ? 1.0 : 0.0) - opacityPhotoRef.current) * 0.1;

        const targetOpen = hand.gesture === GestureType.OPEN ? 1.0 : 0.0;
        handOpenLevelRef.current += (targetOpen - handOpenLevelRef.current) * 0.1;

        if (sysGlowRef.current) (sysGlowRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacityGlowRef.current;
        if (sysPhotoRef.current) {
            (sysPhotoRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacityPhotoRef.current;
            (sysPhotoRef.current.material as THREE.ShaderMaterial).uniforms.uHandOpen.value = handOpenLevelRef.current;
        }
        
        if (sysGoldRef.current) (sysGoldRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacityGlowRef.current * 0.7;
        if (sysPurpleRef.current) (sysPurpleRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacityGlowRef.current * 0.6;
        if (sysWineRef.current) (sysWineRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacityGlowRef.current * 0.6;

        camera.position.z += (85 - camera.position.z) * 0.1;

        // Rotation Logic
        if (currentMode !== AppMode.GALLERY && currentMode !== AppMode.GRAVITY) {
            const rotSpeed = currentMode === AppMode.MODEL ? 0.01 : 0.003;
            if(sysGlowRef.current) sysGlowRef.current.rotation.y += rotSpeed;
            if(sysGoldRef.current) sysGoldRef.current.rotation.y += rotSpeed;
            if(sysPurpleRef.current) sysPurpleRef.current.rotation.y += rotSpeed;
            if(sysWineRef.current) sysWineRef.current.rotation.y += rotSpeed;
            if(sysPhotoRef.current) sysPhotoRef.current.rotation.y += rotSpeed;
        } else if (currentMode === AppMode.GALLERY) {
            // Slow continuous rotation in gallery mode
            const galRotSpeed = 0.002;
            if(sysGlowRef.current) sysGlowRef.current.rotation.y += galRotSpeed;
            if(sysGoldRef.current) sysGoldRef.current.rotation.y += galRotSpeed;
            if(sysPurpleRef.current) sysPurpleRef.current.rotation.y += galRotSpeed;
            if(sysWineRef.current) sysWineRef.current.rotation.y += galRotSpeed;
            if(sysPhotoRef.current) sysPhotoRef.current.rotation.y += galRotSpeed;
        }

        let beatScale = 1.0;
        if (currentMode === AppMode.MODEL && currentModel === ModelType.HEART) {
            beatScale = 1.0 + Math.pow(Math.sin(time * 2.0), 2) * 0.05;
        }

        // Firefly Motion
        const currentFireflyPos = fireflyPosRef.current;
        const currentFireflyVel = fireflyVelRef.current;
        
        if (currentFireflyPos && currentFireflyVel) {
            for(let i=0; i<fireflyCount; i++) {
                const ix = i*3;
                currentFireflyPos[ix] += currentFireflyVel[ix] + Math.sin(time + i) * 0.05;
                currentFireflyPos[ix+1] += currentFireflyVel[ix+1];
                currentFireflyPos[ix+2] += currentFireflyVel[ix+2] + Math.cos(time + i) * 0.05;
                
                if (currentFireflyPos[ix] > 400) currentFireflyPos[ix] = -400;
                if (currentFireflyPos[ix] < -400) currentFireflyPos[ix] = 400;
                if (currentFireflyPos[ix+1] > 300) currentFireflyPos[ix+1] = -300;
                if (currentFireflyPos[ix+1] < -300) currentFireflyPos[ix+1] = 300;
            }
            if (sysFirefliesRef.current) sysFirefliesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Particle Physics Loop
        const shapes = shapesRef.current;
        const currentPos = posRef.current;
        const currentVel = velRef.current;
        
        // Auxiliary systems...
        const currentGoldPos = goldPosRef.current;
        const currentGoldVel = goldVelRef.current;
        const currentPurplePos = purplePosRef.current;
        const currentPurpleVel = purpleVelRef.current;
        const currentWinePos = winePosRef.current;
        const currentWineVel = wineVelRef.current;

        if (currentPos && currentVel && shapes) {
            for(let i=0; i<CFG.count; i++) {
                const ix = i*3;
                let tx, ty, tz;

                if (currentMode === AppMode.MODEL) {
                    const targetShape = shapes[currentModel];
                    const scale = 0.6;
                    tx = targetShape[ix] * beatScale * scale;
                    ty = targetShape[ix+1] * beatScale * scale;
                    tz = targetShape[ix+2] * beatScale * scale;
                } else if (currentMode === AppMode.GALLERY) {
                    tx = shapes.GRID[ix];
                    ty = shapes.GRID[ix+1];
                    tz = shapes.GRID[ix+2];
                } else {
                    tx = shapes.SPIRAL[ix];
                    ty = shapes.SPIRAL[ix+1];
                    tz = shapes.SPIRAL[ix+2];
                }

                // Main Physics
                currentVel[ix] += (tx - currentPos[ix]) * 0.04;
                currentVel[ix+1] += (ty - currentPos[ix+1]) * 0.04;
                currentVel[ix+2] += (tz - currentPos[ix+2]) * 0.04;

                // Aux Physics
                currentGoldVel[ix] += (tx - currentGoldPos[ix]) * 0.035; 
                currentGoldVel[ix+1] += (ty - currentGoldPos[ix+1]) * 0.035;
                currentGoldVel[ix+2] += (tz - currentGoldPos[ix+2]) * 0.035;

                currentPurpleVel[ix] += (tx - currentPurplePos[ix]) * 0.030; 
                currentPurpleVel[ix+1] += (ty - currentPurplePos[ix+1]) * 0.030;
                currentPurpleVel[ix+2] += (tz - currentPurplePos[ix+2]) * 0.030;

                currentWineVel[ix] += (tx - currentWinePos[ix]) * 0.032; 
                currentWineVel[ix+1] += (ty - currentWinePos[ix+1]) * 0.032;
                currentWineVel[ix+2] += (tz - currentWinePos[ix+2]) * 0.032;

                // Hand Interactions
                if (hand.present) {
                    const applyInteraction = (px: number, py: number, pz: number, vx: number, vy: number, vz: number) => {
                         const dx = px - hand.position.x;
                         const dy = py - hand.position.y;
                         const dz = pz - hand.position.z;
                         const dSq = dx*dx + dy*dy + dz*dz;
                         if (dSq < 2500) { 
                             const d = Math.sqrt(dSq);
                             const f = (50 - d) * 0.03; 
                             return [vx + (dx/d) * f, vy + (dy/d) * f, vz + (dz/d) * f];
                         }
                         return [vx, vy, vz];
                    };

                    const v1 = applyInteraction(currentPos[ix], currentPos[ix+1], currentPos[ix+2], currentVel[ix], currentVel[ix+1], currentVel[ix+2]);
                    currentVel[ix] = v1[0]; currentVel[ix+1] = v1[1]; currentVel[ix+2] = v1[2];

                    const v2 = applyInteraction(currentGoldPos[ix], currentGoldPos[ix+1], currentGoldPos[ix+2], currentGoldVel[ix], currentGoldVel[ix+1], currentGoldVel[ix+2]);
                    currentGoldVel[ix] = v2[0]; currentGoldVel[ix+1] = v2[1]; currentGoldVel[ix+2] = v2[2];

                    const v3 = applyInteraction(currentPurplePos[ix], currentPurplePos[ix+1], currentPurplePos[ix+2], currentPurpleVel[ix], currentPurpleVel[ix+1], currentPurpleVel[ix+2]);
                    currentPurpleVel[ix] = v3[0]; currentPurpleVel[ix+1] = v3[1]; currentPurpleVel[ix+2] = v3[2];
                    
                    const v4 = applyInteraction(currentWinePos[ix], currentWinePos[ix+1], currentWinePos[ix+2], currentWineVel[ix], currentWineVel[ix+1], currentWineVel[ix+2]);
                    currentWineVel[ix] = v4[0]; currentWineVel[ix+1] = v4[1]; currentWineVel[ix+2] = v4[2];
                }

                currentVel[ix] *= 0.9;
                currentVel[ix+1] *= 0.9;
                currentVel[ix+2] *= 0.9;
                
                currentGoldVel[ix] *= 0.91;
                currentGoldVel[ix+1] *= 0.91;
                currentGoldVel[ix+2] *= 0.91;

                currentPurpleVel[ix] *= 0.92;
                currentPurpleVel[ix+1] *= 0.92;
                currentPurpleVel[ix+2] *= 0.92;

                currentWineVel[ix] *= 0.915;
                currentWineVel[ix+1] *= 0.915;
                currentWineVel[ix+2] *= 0.915;

                currentPos[ix] += currentVel[ix];
                currentPos[ix+1] += currentVel[ix+1];
                currentPos[ix+2] += currentVel[ix+2];

                currentGoldPos[ix] += currentGoldVel[ix];
                currentGoldPos[ix+1] += currentGoldVel[ix+1];
                currentGoldPos[ix+2] += currentGoldVel[ix+2];

                currentPurplePos[ix] += currentPurpleVel[ix];
                currentPurplePos[ix+1] += currentPurpleVel[ix+1];
                currentPurplePos[ix+2] += currentPurpleVel[ix+2];
                
                currentWinePos[ix] += currentWineVel[ix];
                currentWinePos[ix+1] += currentWineVel[ix+1];
                currentWinePos[ix+2] += currentWineVel[ix+2];
            }
            if (sysGlowRef.current) sysGlowRef.current.geometry.attributes.position.needsUpdate = true;
            if (sysGoldRef.current) sysGoldRef.current.geometry.attributes.position.needsUpdate = true;
            if (sysPurpleRef.current) sysPurpleRef.current.geometry.attributes.position.needsUpdate = true;
            if (sysWineRef.current) sysWineRef.current.geometry.attributes.position.needsUpdate = true;
        }

        composer.render();
    };

    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(reqIdRef.current);
        renderer.dispose();
        if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Handle Color Updates
  useEffect(() => {
      if (!sysGlowRef.current || !particleAlphasRef.current) return;
      const baseColor = new THREE.Color(color);
      const deepColor = baseColor.clone().multiplyScalar(0.2).offsetHSL(0.02, 0, 0);
      const colors = sysGlowRef.current.geometry.attributes.color;
      const temp = new THREE.Color();
      for (let i = 0; i < CFG.count; i++) {
          const alpha = particleAlphasRef.current[i];
          temp.copy(deepColor).lerp(baseColor, alpha);
          colors.setXYZ(i, temp.r, temp.g, temp.b);
      }
      colors.needsUpdate = true;
  }, [color]);

  // Handle Background Texture
  useEffect(() => {
    if (bgMeshRef.current && cameraRef.current) {
        if (backgroundTexture) {
            const img = backgroundTexture.image as HTMLImageElement;
            const bgAspect = img.width / img.height;
            const cam = cameraRef.current;
            const dist = cam.position.z - bgMeshRef.current.position.z; 
            const vFOV = THREE.MathUtils.degToRad(cam.fov);
            const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
            const visibleWidth = visibleHeight * cam.aspect;

            const screenAspect = visibleWidth / visibleHeight;
            
            if (screenAspect > bgAspect) {
                bgMeshRef.current.scale.set(visibleWidth, visibleWidth / bgAspect, 1);
            } else {
                bgMeshRef.current.scale.set(visibleHeight * bgAspect, visibleHeight, 1);
            }
            
            const mat = bgMeshRef.current.material as THREE.MeshBasicMaterial;
            mat.color.setHex(0x444444); 
            mat.map = backgroundTexture;
            mat.opacity = 0.3;
            mat.needsUpdate = true;
        } else {
            const mat = bgMeshRef.current.material as THREE.MeshBasicMaterial;
            mat.map = null;
            mat.opacity = 0.0;
            mat.needsUpdate = true;
        }
    }
  }, [backgroundTexture]);

  // Handle Image Atlas Updates & Gallery Layout
  useEffect(() => {
      if (!atlasCtxRef.current || !atlasTexRef.current || !sysPhotoRef.current || !cameraRef.current) return;
      
      const ctx = atlasCtxRef.current;
      const s = CFG.atlas / CFG.cols;
      
      // Clear atlas transparently
      ctx.clearRect(0, 0, CFG.atlas, CFG.atlas);
      
      const max = CFG.cols * CFG.cols;
      
      // Draw images to atlas with OBJECT-FIT: CONTAIN logic, NO black frames
      images.forEach((item, i) => {
          if (i >= max) return;
          const col = i % CFG.cols;
          const row = Math.floor(i / CFG.cols);
          const x = col * s;
          const y = row * s;
          
          // REMOVED BLACK FRAME DRAWING

          // Use 1px logical padding to be safe against bleeding in texture lookup, 
          // but visually transparent.
          const pad = 1;
          const avail = s - (pad * 2);

          // Calculate aspect ratio fit
          const imgAspect = item.img.width / item.img.height;
          let drawW = avail;
          let drawH = drawW / imgAspect;

          if (drawH > avail) {
              drawH = avail;
              drawW = drawH * imgAspect;
          }

          const drawX = x + pad + (avail - drawW) / 2;
          const drawY = y + pad + (avail - drawH) / 2;
          
          ctx.drawImage(item.img, drawX, drawY, drawW, drawH);
      });
      
      atlasTexRef.current.needsUpdate = true;
      
      // Update Particles Attributes
      const idxAttr = sysPhotoRef.current.geometry.attributes.imgIndex;
      const isPhotoAttr = sysPhotoRef.current.geometry.attributes.isPhoto;
      
      // RECALCULATE GALLERY LAYOUT: CYLINDRICAL HELIX
      // This ensures photos are spread out nicely around the user
      if (shapesRef.current) {
          const radius = 60; // Radius of the cylinder
          const heightStep = 25; // Vertical distance between rows
          const angleStep = Math.PI / 4; // 45 degrees separation per photo
          
          for(let k=0; k<CFG.count; k++) {
              if (k < images.length) {
                  // Active Photo
                  idxAttr.setX(k, k);
                  isPhotoAttr.setX(k, 1.0);
                  
                  // Spiral positioning
                  const angle = k * angleStep;
                  const h = (k * 5) - (images.length * 2.5); // Center vertically based on count
                  
                  // Add some randomness to make it look "floating" but structured
                  const r = radius + (Math.random() - 0.5) * 5;
                  
                  shapesRef.current.GRID[k*3] = Math.cos(angle) * r;
                  shapesRef.current.GRID[k*3+1] = h;
                  shapesRef.current.GRID[k*3+2] = Math.sin(angle) * r;

              } else {
                  // Inactive Photo (Background noise)
                  idxAttr.setX(k, 0);
                  isPhotoAttr.setX(k, 0.0);
                  
                  // Randomize unused slots far away
                  shapesRef.current.GRID[k*3] = (Math.random()-0.5) * 200; 
                  shapesRef.current.GRID[k*3+1] = (Math.random()-0.5) * 200; 
                  shapesRef.current.GRID[k*3+2] = (Math.random()-0.5) * 200;
              }
          }
      }

      idxAttr.needsUpdate = true;
      isPhotoAttr.needsUpdate = true;
      
      if (sysGlowRef.current) {
          sysGlowRef.current.geometry.attributes.isPhoto.needsUpdate = true;
      }

  }, [images]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black" />;
});

export default Scene;