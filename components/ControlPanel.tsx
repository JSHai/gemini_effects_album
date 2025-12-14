import React from 'react';
import { AppMode, GestureType, ModelType, ParticleImage } from '../types';

interface ControlPanelProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  selectedModel: ModelType;
  setSelectedModel: (m: ModelType) => void;
  color: string;
  setColor: (c: string) => void;
  images: ParticleImage[];
  removeImage: (id: string) => void;
  onUploadImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadBg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadMusic: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMusic: () => void;
  isPlaying: boolean;
  clearAll: () => void;
  status: { ai: string; fingers: string; imgCount: number };
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode, setMode, selectedModel, setSelectedModel,
  color, setColor, images, removeImage,
  onUploadImages, onUploadBg, onUploadMusic, toggleMusic, isPlaying, clearAll,
  status
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [previewImg, setPreviewImg] = React.useState<string | null>(null);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 w-11 h-11 rounded-full bg-indigo-600/90 border-2 border-indigo-300/30 text-white text-xl flex justify-center items-center z-50 shadow-lg shadow-indigo-900/60 hover:scale-110 hover:bg-indigo-700 transition-all duration-300"
      >
        ⚙️
      </button>
    );
  }

  const models = [
    { id: ModelType.HEART, label: '❤️ Heart' },
    { id: ModelType.TREE, label: '🎄 Tree' },
    { id: ModelType.PYRAMID, label: '⛰️ Pyramid' },
    { id: ModelType.TORUS, label: '🍩 Torus' },
    { id: ModelType.SATURN, label: '🪐 Saturn' },
    { id: ModelType.DIAMOND, label: '💎 Diamond' },
    { id: ModelType.ATOM, label: '⚛️ Atom' },
    { id: ModelType.VORTEX, label: '🌪️ Vortex' },
    { id: ModelType.HOURGLASS, label: '⏳ Hourglass' },
    { id: ModelType.DNA, label: '🧬 DNA' },
    { id: ModelType.SPHERE, label: '🔮 Sphere' },
    { id: ModelType.CYLINDER, label: '🛢️ Cylinder' },
    { id: ModelType.MOBIUS, label: '♾️ Mobius' },
    { id: ModelType.CUBE, label: '🧊 Cube' },
    { id: ModelType.STAR, label: '⭐ Star' },
    { id: ModelType.KNOT, label: '🪢 Knot' },
    { id: ModelType.FLOWER, label: '🌸 Flower' },
    { id: ModelType.KLEIN, label: '🏺 Klein' },
    { id: ModelType.CONE, label: '🍦 Cone' },
    { id: ModelType.SHELL, label: '🐚 Shell' },
    { id: ModelType.KNOT_CN, label: '🇨🇳 Knot' },
  ];

  return (
    <>
      <div className="fixed bottom-5 left-5 w-[360px] max-h-[90vh] bg-[#0c0614]/95 text-[#d0b0ff] border border-[rgba(140,80,255,0.25)] rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-xl shadow-2xl shadow-black/60 z-50 transition-all duration-300 origin-bottom-left overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[rgba(140,80,255,0.2)]">
          <h2 className="m-0 text-[15px] font-semibold text-white tracking-wide">V42 Control Panel</h2>
          <button onClick={() => setIsOpen(false)} className="text-[#a080c0] hover:text-white hover:scale-110 transition-transform">✕</button>
        </div>

        {/* Status */}
        <div className="flex justify-between text-[11px] text-[#9080a0] bg-black/20 p-2 rounded-md">
          <span>AI: <span className={status.ai === 'Connected' ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>{status.ai}</span></span>
          <span>Fingers: <span className="text-[#e0d0ff] font-bold">{status.fingers}</span></span>
          <span>Images: <span className="text-[#e0d0ff] font-bold">{status.imgCount}</span></span>
        </div>

        {/* Modes */}
        <div>
          <div className="text-[11px] text-[#8a7a9a] font-bold uppercase tracking-wider mb-1">Gesture Modes</div>
          <div className="grid grid-cols-3 gap-1.5">
            <ModeBtn active={mode === AppMode.GALLERY} onClick={() => setMode(AppMode.GALLERY)} icon="✋" label="Gallery" />
            <ModeBtn active={mode === AppMode.MODEL} onClick={() => setMode(AppMode.MODEL)} icon="✊" label="Model" />
            <ModeBtn active={mode === AppMode.SPIRAL} onClick={() => setMode(AppMode.SPIRAL)} icon="✌️" label="Spiral" />
          </div>
        </div>

        {/* Models */}
        <div>
          <div className="text-[11px] text-[#8a7a9a] font-bold uppercase tracking-wider mb-1">Models (✊ Fist)</div>
          <div className="grid grid-cols-4 gap-1.5">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`
                  bg-[#28283c]/30 border border-white/10 rounded-md py-2 px-1 text-[10px] cursor-pointer transition-colors
                  whitespace-nowrap overflow-hidden text-ellipsis text-[#aaa] hover:border-[#d0b0ff] hover:text-white
                  ${selectedModel === m.id ? 'bg-[#ffd700]/15 border-[#ffd700] text-[#ffd700] font-bold' : ''}
                `}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media & Color */}
        <div>
          <div className="text-[11px] text-[#8a7a9a] font-bold uppercase tracking-wider mb-1">Appearance & Media</div>
          <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-[#783cdc]/20 mb-2">
            <span className="text-xs text-[#ccc]">🎨 Particle Color</span>
            <input 
              type="color" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 btn-primary bg-[#50288c]/70 border border-[#9a4be2] text-white font-bold p-2.5 rounded-lg text-center text-xs cursor-pointer hover:bg-[#5a3296]/90 transition-all flex justify-center items-center gap-1">
               📂 Add Photos / Folder
              {/* Added webkitdirectory and directory attributes for folder selection support */}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={onUploadImages} 
                className="hidden" 
                // @ts-ignore
                webkitdirectory="" 
                directory=""
              />
            </label>
            
            <label className="btn bg-[#321e50]/50 border border-[#783cdc]/30 text-[#ccc] p-2.5 rounded-lg text-center text-xs cursor-pointer hover:bg-[#5a3296]/60 hover:text-white hover:border-[#c0a0ff] transition-all">
              🖼️ Set BG
              <input type="file" accept="image/*" onChange={onUploadBg} className="hidden" />
            </label>

            <label className="btn bg-[#321e50]/50 border border-[#783cdc]/30 text-[#ccc] p-2.5 rounded-lg text-center text-xs cursor-pointer hover:bg-[#5a3296]/60 hover:text-white hover:border-[#c0a0ff] transition-all">
              🎵 Set Music
              <input type="file" accept="audio/*" onChange={onUploadMusic} className="hidden" />
            </label>

            <button 
              onClick={toggleMusic}
              className={`p-2.5 rounded-lg text-center text-xs cursor-pointer transition-all border ${isPlaying ? 'bg-[#143c1e]/50 border-[#50fa7b] text-[#50fa7b]' : 'bg-[#321e50]/50 border-[#783cdc]/30 text-[#ccc]'}`}
            >
              ⏯️ {isPlaying ? 'Playing' : 'Play Music'}
            </button>

            <button 
              onClick={clearAll}
              className="col-span-2 bg-[#501414]/40 border border-red-400/30 text-[#ffadad] p-2.5 rounded-lg text-center text-xs cursor-pointer hover:bg-[#781e1e]/60 hover:border-[#ff6060] hover:text-white transition-all"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Image List */}
        <div className="flex-grow min-h-[60px] border-t border-[rgba(140,80,255,0.2)] pt-2 overflow-y-auto">
          {images.map((img) => (
            <div key={img.id} className="flex items-center justify-between bg-white/5 mb-1 p-1 px-2 rounded-md">
              <img 
                src={img.img.src} 
                alt="thumb" 
                className="w-6 h-6 object-cover rounded mr-2 cursor-pointer hover:scale-125 transition-transform border border-transparent hover:border-white/50" 
                onClick={() => setPreviewImg(img.img.src)}
              />
              <span className="text-[11px] text-[#aaa] flex-grow overflow-hidden text-ellipsis whitespace-nowrap">{img.name}</span>
              <button onClick={() => removeImage(img.id)} className="text-[#ff6b6b] hover:text-white px-1">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-10 animate-fade-in"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={previewImg} 
              alt="Preview" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(100,0,255,0.5)] border-2 border-white/20"
            />
            <button className="absolute -top-10 right-0 text-white hover:text-red-400 text-2xl font-bold">Close ✕</button>
          </div>
        </div>
      )}
    </>
  );
};

const ModeBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center gap-1 py-2 px-1 rounded-lg border cursor-pointer transition-all
      ${active 
        ? 'bg-[#783cdc]/70 border-[#d0b0ff] text-white shadow-[0_0_10px_rgba(160,100,255,0.3)]' 
        : 'bg-[#3c285a]/40 border-transparent text-[#d0b0ff] hover:bg-[#643ca0]/50 hover:border-[#a060ff]'}
    `}
  >
    <span className="text-base">{icon}</span>
    <span className="text-[10px]">{label}</span>
  </button>
);

export default ControlPanel;