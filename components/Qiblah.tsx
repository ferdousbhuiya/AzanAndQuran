
import React, { useState, useEffect } from 'react';
import { MapPin, Compass as CompassIcon, Info, RefreshCcw, ShieldCheck } from 'lucide-react';

interface QiblahProps {
  location: { lat: number, lng: number } | null;
}

const Qiblah: React.FC<QiblahProps> = ({ location }) => {
  const [heading, setHeading] = useState(0);
  const [qiblahDirection, setQiblahDirection] = useState(0);
  const [hasOrientation, setHasOrientation] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (location) {
      const calculateQiblah = (lat: number, lng: number) => {
        const phi1 = lat * Math.PI / 180;
        const lambda1 = lng * Math.PI / 180;
        const phi2 = 21.4225 * Math.PI / 180; // Makkah lat
        const lambda2 = 39.8262 * Math.PI / 180; // Makkah lng

        const y = Math.sin(lambda2 - lambda1);
        const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
        let q = Math.atan2(y, x) * 180 / Math.PI;
        return (q + 360) % 360;
      };
      setQiblahDirection(calculateQiblah(location.lat, location.lng));
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS or alpha for Android
      const compassHeading = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
      if (compassHeading !== undefined) {
        setHeading(compassHeading);
        setHasOrientation(true);
        if ((event as any).webkitCompassAccuracy) {
          setAccuracy((event as any).webkitCompassAccuracy);
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [location]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          window.location.reload(); // Reload to activate listeners
        }
      } catch (e) {
        console.error("Permission error", e);
      }
    }
  };

  const isAligned = Math.abs((heading - qiblahDirection + 360) % 360) < 5;

  return (
    <div className="p-6 bg-[#040806] min-h-screen text-white flex flex-col items-center overflow-hidden">
      <header className="w-full flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 tracking-tighter leading-none">Qiblah Finder</h1>
          <p className="text-[9px] text-emerald-900 font-black uppercase tracking-widest mt-1">Sacred Orientation</p>
        </div>
        <button onClick={requestPermission} className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all">
          <RefreshCcw size={18} className="text-emerald-500" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        {/* Status Badge */}
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className={`inline-flex items-center gap-2 backdrop-blur-xl px-4 py-2 rounded-full border transition-all duration-500 ${isAligned ? 'bg-emerald-500/20 border-emerald-500/50 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10'}`}>
            {isAligned ? <ShieldCheck size={14} className="text-emerald-400" /> : <MapPin size={12} className="text-emerald-600" />}
            <span className={`text-[9px] font-black uppercase tracking-widest ${isAligned ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isAligned ? 'Focused on Kaaba' : 'Align with Makkah'}
            </span>
          </div>
        </div>

        {/* COMPASS CONTAINER */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Outer Glow Ring */}
          <div className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000 ${isAligned ? 'bg-emerald-500/10 opacity-100' : 'bg-transparent opacity-0'}`} />

          {/* Fixed Outer Ring (Degree Markers) */}
          <div className="absolute inset-0 border-[1px] border-white/5 rounded-full" />

          {/* Rotating Disc */}
          <div
            className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* Degree Ticks */}
            {[...Array(72)].map((_, i) => (
              <div
                key={i}
                className={`absolute top-0 left-1/2 -ml-[0.5px] origin-bottom h-1/2 ${i % 2 === 0 ? 'w-[1px] bg-white/20' : 'w-[0.5px] bg-white/10'}`}
                style={{ transform: `rotate(${i * 5}deg)` }}
              />
            ))}

            {/* Main Cardinal Points */}
            <div className="absolute inset-4 rounded-full border border-white/5">
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-black text-emerald-500">N</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-black text-white/20">S</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-black text-white/20">W</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-black text-white/20">E</span>
            </div>

            {/* Inner Decorative Rings */}
            <div className="absolute inset-16 border border-white/5 rounded-full" />
            <div className="absolute inset-28 border border-white/5 rounded-full bg-emerald-500/5 shadow-inner" />

            {/* Qiblah Indicator (Pointer) */}
            <div
              className="absolute inset-0 flex flex-col items-center"
              style={{ transform: `rotate(${qiblahDirection}deg)` }}
            >
              <div className="w-[3px] h-32 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] relative -mt-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all duration-300 ${isAligned ? 'bg-emerald-500 border-white rotate-0' : 'bg-white border-white rotate-0'}`}>
                    <CompassIcon size={24} className={isAligned ? 'text-white' : 'text-emerald-950'} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="absolute top-8 bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-xl tracking-tighter">KAABA</div>
            </div>
          </div>

          {/* Fixed Center Element (Non-rotating) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAligned ? 'bg-emerald-400 animate-ping shadow-[0_0_15px_#10b981]' : 'bg-white/20'}`} />
            </div>
          </div>

          {/* Fixed Alignment Guide (Top) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4">
            <div className={`w-1 h-12 rounded-full transition-colors duration-500 ${isAligned ? 'bg-emerald-400' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Direction Data Footer */}
        <div className="mt-10 grid grid-cols-2 gap-8 w-full px-10">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Your Heading</p>
            <h3 className="text-2xl font-black text-white">{Math.round(heading)}°</h3>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Qiblah At</p>
            <h3 className="text-2xl font-black text-emerald-400">{Math.round(qiblahDirection)}°</h3>
          </div>
        </div>
      </div>

      <div className="w-full bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 mb-6 mt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl transition-colors ${isAligned ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
            <Info className={isAligned ? 'text-emerald-400' : 'text-slate-400'} size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/80 leading-relaxed">
              {isAligned ? "Perfect! You are facing the holy Kaaba. Your device is accurately aligned." : "Rotate your phone until the emerald pointer matches the top alignment line."}
            </p>
            {!hasOrientation && (
              <p className="text-[9px] text-rose-400 font-black uppercase tracking-[0.2em] mt-2 animate-pulse">
                Sensors inactive. Recalibrate now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qiblah;
