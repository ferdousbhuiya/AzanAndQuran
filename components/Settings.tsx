
import React, { useState } from 'react';
import { AppSettings, QuranFont } from '../types';
import { TRANSLATIONS, ARABIC_FONTS, ADHAN_OPTIONS, ADHAN_STYLES, PRAYER_METHODS, PRAYER_SCHOOLS, RECITERS } from '../constants';
import { Save, Book, Volume2, VolumeX, Target, Compass, Bell, Type, User, Info, Smartphone, RefreshCw } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const playPreview = () => {
    if (isPlaying) {
      stopPreview();
      return;
    }

    const voice = ADHAN_OPTIONS.find(v => v.id === localSettings.adhan.voiceId) || ADHAN_OPTIONS[0];
    const audio = new Audio(voice.url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));

    if (localSettings.adhan.styleId === '1v') {
      setTimeout(() => { if (audioRef.current === audio) stopPreview(); }, 15000);
    } else if (localSettings.adhan.styleId === '2v') {
      setTimeout(() => { if (audioRef.current === audio) stopPreview(); }, 30000);
    }
    audio.onended = () => setIsPlaying(false);
  };

  React.useEffect(() => {
    return () => { if (audioRef.current) stopPreview(); };
  }, []);

  const handleToggleNotify = (prayer: string) => {
    setLocalSettings({
      ...localSettings,
      adhan: {
        ...localSettings.adhan,
        notifications: {
          ...localSettings.adhan.notifications,
          [prayer]: !localSettings.adhan.notifications[prayer]
        }
      }
    });
  };

  return (
    <div className="p-6 bg-[#f2f6f4] min-h-screen pb-40">
      <header className="flex justify-between items-center mb-10 px-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Preferences</h1>
        <button
          onClick={() => {
            onSave(localSettings);
            alert("Settings saved successfully.");
          }}
          className="bg-emerald-950 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Save size={18} /> Save
        </button>
      </header>

      <div className="space-y-12">
        {/* Quran Settings */}
        <section>
          <h2 className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">
            <Book size={14} /> Quranic Experience
          </h2>
          <div className="bg-white p-8 rounded-[3.5rem] border border-white shadow-premium space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Arabic Font</label>
              <select
                value={localSettings.quran.fontFamily}
                onChange={(e) => setLocalSettings({ ...localSettings, quran: { ...localSettings.quran, fontFamily: e.target.value as any } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none"
              >
                {ARABIC_FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Preferred Qari</label>
              <select
                value={localSettings.quran.reciterId}
                onChange={(e) => setLocalSettings({ ...localSettings, quran: { ...localSettings.quran, reciterId: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none"
              >
                {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Translation</label>
              <select
                value={localSettings.quran.translationId}
                onChange={(e) => setLocalSettings({ ...localSettings, quran: { ...localSettings.quran, translationId: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none"
              >
                {TRANSLATIONS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 ml-2 flex justify-between">
                <span>Font Size</span>
                <span className="text-emerald-600 font-black">{localSettings.quran.fontSize}px</span>
              </label>
              <input
                type="range" min="16" max="42" step="1"
                value={localSettings.quran.fontSize}
                onChange={(e) => setLocalSettings({ ...localSettings, quran: { ...localSettings.quran, fontSize: parseInt(e.target.value) } })}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* Prayer Settings */}
        <section>
          <h2 className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">
            <Bell size={14} /> Salat & Notifications
          </h2>
          <div className="bg-white p-8 rounded-[3.5rem] border border-white shadow-premium space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Adhan Alerts</label>
              <div className="grid grid-cols-2 gap-3">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                  <button
                    key={p}
                    onClick={() => handleToggleNotify(p)}
                    className={`p-4 rounded-2xl flex items-center justify-between transition-all border ${localSettings.adhan.notifications[p] ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-transparent text-slate-300'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                    <div className={`w-2 h-2 rounded-full ${localSettings.adhan.notifications[p] ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Calculation Method</label>
                <select
                  value={localSettings.adhan.method}
                  onChange={(e) => setLocalSettings({ ...localSettings, adhan: { ...localSettings.adhan, method: parseInt(e.target.value) } })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none"
                >
                  {PRAYER_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Adhan Voice</label>
                  <select
                    value={localSettings.adhan.voiceId}
                    onChange={(e) => setLocalSettings({ ...localSettings, adhan: { ...localSettings.adhan, voiceId: e.target.value } })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[11px] font-black uppercase outline-none"
                  >
                    {ADHAN_OPTIONS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Adhan Length</label>
                  <select
                    value={localSettings.adhan.styleId}
                    onChange={(e) => setLocalSettings({ ...localSettings, adhan: { ...localSettings.adhan, styleId: e.target.value } })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[11px] font-black uppercase outline-none"
                  >
                    {ADHAN_STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={playPreview}
                className={`w-full p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isPlaying ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
              >
                {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? 'Stop Preview' : 'Preview Adhan'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* General Device Settings */}
        <section>
          <h2 className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">
            <Smartphone size={14} /> Interaction
          </h2>
          <div className="bg-white p-8 rounded-[3.5rem] border border-white shadow-premium">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-800 text-sm tracking-tight">Automatic Location</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Use GPS for prayer times</p>
                </div>
                <div
                  onClick={() => setLocalSettings({ ...localSettings, adhan: { ...localSettings.adhan, autoLocation: !localSettings.adhan.autoLocation } })}
                  className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${localSettings.adhan.autoLocation ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${localSettings.adhan.autoLocation ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {!localSettings.adhan.autoLocation && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Set Manual Address</label>
                  <div className="flex gap-2">
                    <input
                      value={localSettings.adhan.manualLocation?.address || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        adhan: {
                          ...localSettings.adhan,
                          manualLocation: {
                            ...(localSettings.adhan.manualLocation || { lat: 0, lng: 0, address: '' }),
                            address: e.target.value
                          }
                        }
                      })}
                      placeholder="City, Country"
                      className="flex-1 bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none"
                    />
                    <button
                      onClick={async () => {
                        const addr = localSettings.adhan.manualLocation?.address;
                        if (!addr) return;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
                          const data = await res.json();
                          if (data && data[0]) {
                            setLocalSettings({
                              ...localSettings,
                              adhan: {
                                ...localSettings.adhan,
                                manualLocation: {
                                  address: data[0].display_name,
                                  lat: parseFloat(data[0].lat),
                                  lng: parseFloat(data[0].lon)
                                }
                              }
                            });
                            alert("Location updated successfully!");
                          } else {
                            alert("Location not found.");
                          }
                        } catch (e) {
                          alert("Error searching location.");
                        }
                      }}
                      className="bg-emerald-100 text-emerald-800 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Find
                    </button>
                  </div>
                  {localSettings.adhan.manualLocation?.lat !== 0 && (
                    <p className="text-[9px] text-emerald-600 font-bold mt-2 ml-2 uppercase tracking-tighter">
                      Coordinates: {localSettings.adhan.manualLocation?.lat.toFixed(4)}, {localSettings.adhan.manualLocation?.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full mt-8 p-5 bg-slate-50 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
            >
              <RefreshCw size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sync Local Database</span>
            </button>
          </div>
        </section>

        <footer className="text-center px-10">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Noor Companion v1.2</p>
          <div className="flex justify-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SettingsView;
