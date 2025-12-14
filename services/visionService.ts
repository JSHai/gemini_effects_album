import { Camera } from '@mediapipe/camera_utils';
import { Hands, Results } from '@mediapipe/hands';
import { Vector3, Camera as ThreeCamera } from 'three';
import { AppMode, GestureType, HandState } from '../types';

export const initVision = (
    videoElement: HTMLVideoElement,
    onResults: (res: Results) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Check if global Hands is available (loaded from index.html scripts)
            // @ts-ignore
            if (!window.Hands) {
                reject(new Error("MediaPipe Hands not loaded. Check internet connection or script tags."));
                return;
            }

            // @ts-ignore - Loaded via CDN in index.html
            const hands = new window.Hands({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 0, // 0 for performance, 1 for accuracy
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults(onResults);

            // @ts-ignore - Loaded via CDN
            if (!window.Camera) {
                 reject(new Error("MediaPipe Camera Utils not loaded."));
                 return;
            }

            // @ts-ignore - Loaded via CDN
            const camera = new window.Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });

            camera.start()
                .then(() => resolve())
                .catch((err: any) => reject(err));
        } catch (e) {
            reject(e);
        }
    });
};

export const processHandResults = (
    res: Results, 
    camera: ThreeCamera, 
    currentHandState: HandState,
    setMode: (m: AppMode) => void,
    forceMode: boolean
): HandState => {
    const newState = { ...currentHandState };

    if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
        newState.present = true;
        const lm = res.multiHandLandmarks[0];
        
        // 3D Position Projection
        // Map normalized coordinates (0-1) to NDC (-1 to 1), flip Y
        const ndcX = (1 - lm[9].x) * 2 - 1;
        const ndcY = -lm[9].y * 2 + 1;
        
        const vector = new Vector3(ndcX, ndcY, 0.5);
        vector.unproject(camera);
        
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));
        
        newState.position.lerp(targetPos, 0.5); // Smooth movement

        // Gesture Recognition
        let fingerCount = 0;
        if (lm[8].y < lm[6].y) fingerCount++; // Index
        if (lm[12].y < lm[10].y) fingerCount++; // Middle
        if (lm[16].y < lm[14].y) fingerCount++; // Ring
        if (lm[20].y < lm[18].y) fingerCount++; // Pinky
        if (Math.abs(lm[4].x - lm[17].x) > 0.15) fingerCount++; // Thumb

        // Pinch Detection (Thumb tip #4 near Index tip #8)
        const thumbTip = lm[4];
        const indexTip = lm[8];
        const pinchDist = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );

        newState.gesture = GestureType.NONE;
        
        if (pinchDist < 0.05) {
             newState.gesture = GestureType.PINCH;
             // Pinch does not trigger mode switch automatically, it is an interaction gesture
        } else if (!forceMode) {
            // Mode switching based on fingers
            if (fingerCount >= 4) {
                newState.gesture = GestureType.OPEN; // Explicitly set OPEN gesture
                setMode(AppMode.GALLERY);
            } else if (fingerCount <= 1) {
                newState.gesture = GestureType.FIST; // Approximate Fist
                setMode(AppMode.MODEL);
            } else if (fingerCount === 2) {
                newState.gesture = GestureType.VICTORY;
                setMode(AppMode.SPIRAL);
            }
        }
    } else {
        newState.present = false;
        newState.position.set(999, 999, 999);
    }
    
    return newState;
};