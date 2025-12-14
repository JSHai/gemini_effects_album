import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Scene from './components/Scene';
import ControlPanel from './components/ControlPanel';
import { initVision, processHandResults } from './services/visionService';
import { AppMode, GestureType, HandState, ModelType, ParticleImage } from './types';

const App: React.FC = () => {
  // --- State ---
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.SPIRAL);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.HEART);
  const [color, setColor] = useState('#d896ff');
  const [images, setImages] = useState<ParticleImage[]>([]);
  const [bgTexture, setBgTexture] = useState<THREE.Texture | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiStatus, setAiStatus] = useState('Connecting...');
  const [fingerCountDisplay, setFingerCountDisplay] = useState('--');
  
  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameCountRef = useRef(0);
  
  // PERFORMANCE FIX: Instantiate vision camera once and reuse it.
  // Creating `new THREE.PerspectiveCamera` inside the loop causes massive GC churn.
  const visionCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  if (!visionCameraRef.current) {
      visionCameraRef.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
      visionCameraRef.current.position.z = 85; // Match Scene.tsx
  }

  // Shared Mutable Hand State for Performance (Bridge between React & Three.js loop)
  const handStateRef = useRef<HandState>({
    present: false,
    position: new THREE.Vector3(999, 999, 999),
    gesture: GestureType.NONE
  });
  const forceModeRef = useRef(false);

  // --- Helpers ---
  const setModeWithTimeout = (m: AppMode) => {
    setMode(m);
    forceModeRef.current = true;
    setTimeout(() => { forceModeRef.current = false; }, 2000);
  };

  // --- Hand Tracking Init ---
  useEffect(() => {
    let safetyTimer: number;

    const startVision = async () => {
      if (!videoRef.current) {
         // Retry once if ref is missing (rare race condition)
         setTimeout(startVision, 500);
         return;
      }

      try {
        await initVision(videoRef.current!, (res) => {
            if (!visionCameraRef.current) return;

            const refinedState = processHandResults(
                res, 
                visionCameraRef.current, 
                handStateRef.current, 
                (m) => setMode(m), 
                forceModeRef.current
            );
            
            // Sync the mutable ref
            handStateRef.current.present = refinedState.present;
            handStateRef.current.position.copy(refinedState.position);
            handStateRef.current.gesture = refinedState.gesture;
            
            // Throttle UI update to every 10 frames to avoid choking React with 60FPS re-renders
            frameCountRef.current++;
            if (frameCountRef.current % 10 === 0) {
                if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
                     const lm = res.multiHandLandmarks[0];
                     let c = 0;
                     if(lm[8].y < lm[6].y) c++; 
                     if(lm[12].y < lm[10].y) c++; 
                     if(lm[16].y < lm[14].y) c++; 
                     if(lm[20].y < lm[18].y) c++; 
                     if(Math.abs(lm[4].x - lm[17].x) > 0.15) c++;
                     setFingerCountDisplay(c.toString());
                } else {
                    setFingerCountDisplay('--');
                }
            }
        });
        setAiStatus('Connected');
        setLoading(false);
        clearTimeout(safetyTimer);
      } catch (e) {
        console.error("Vision Init Error", e);
        setAiStatus('Error');
        setLoading(false); // Allow app to run without AI
      }
    };
    
    // Fallback safety timer: If MediaPipe hangs (e.g. waiting for permission forever), 
    // load the app anyway after 6 seconds so user isn't stuck.
    safetyTimer = window.setTimeout(() => {
        if (loading) {
            console.warn("Vision init timed out or permission denied silently. Loading app without AI.");
            setLoading(false);
            setAiStatus('Timeout/Denied');
        }
    }, 6000);
    
    // Give browser a moment to load scripts
    setTimeout(startVision, 1000);
    
    return () => clearTimeout(safetyTimer);
  }, []); // Run once on mount

  // --- Handlers ---
  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newImages: ParticleImage[] = [];
          Array.from(e.target.files).forEach((file: File) => {
              const img = new Image();
              img.src = URL.createObjectURL(file);
              img.onload = () => {
                 setImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), img, name: file.name }]);
                 if (mode !== AppMode.GALLERY) setModeWithTimeout(AppMode.GALLERY);
              };
          });
      }
  };

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const loader = new THREE.TextureLoader();
          loader.load(URL.createObjectURL(file), (tex) => {
              setBgTexture(tex);
          });
      }
  };

  const handleUploadMusic = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && audioRef.current) {
          audioRef.current.src = URL.createObjectURL(file);
          audioRef.current.play();
          setIsPlaying(true);
      }
  };

  const toggleMusic = () => {
      if (!audioRef.current || !audioRef.current.src) {
          alert("Please upload music first.");
          return;
      }
      if (audioRef.current.paused) {
          audioRef.current.play();
          setIsPlaying(true);
      } else {
          audioRef.current.pause();
          setIsPlaying(false);
      }
  };

  return (
    <div className="w-full h-screen overflow-hidden font-sans text-white">
        {loading && (
            <div className="absolute inset-0 z-[999] bg-[#020005] flex flex-col justify-center items-center">
                <div className="text-[#d0b0ff] text-2xl animate-pulse">💎 V42 GEOMETRY UPDATE...</div>
                <div className="text-[#8060aa] text-sm mt-4">Initializing Vision & Particles...</div>
            </div>
        )}

        <Scene 
            mode={mode}
            selectedModel={selectedModel}
            images={images}
            color={color}
            handState={handStateRef}
            backgroundTexture={bgTexture}
            onGalleryLayoutUpdate={() => {}}
        />

        <ControlPanel 
            mode={mode}
            setMode={setModeWithTimeout}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            color={color}
            setColor={setColor}
            images={images}
            removeImage={(id) => setImages(prev => prev.filter(i => i.id !== id))}
            onUploadImages={handleUploadImages}
            onUploadBg={handleUploadBg}
            onUploadMusic={handleUploadMusic}
            toggleMusic={toggleMusic}
            isPlaying={isPlaying}
            clearAll={() => { setImages([]); setBgTexture(null); }}
            status={{ ai: aiStatus, fingers: fingerCountDisplay, imgCount: images.length }}
        />

        {/* Hidden Video Feed for MediaPipe */}
        <video 
            ref={videoRef} 
            className="absolute opacity-0 pointer-events-none w-px h-px" 
            playsInline 
            muted 
            autoPlay 
        />
        
        {/* Hidden Audio Element */}
        <audio ref={audioRef} loop className="hidden" />
    </div>
  );
};

export default App;