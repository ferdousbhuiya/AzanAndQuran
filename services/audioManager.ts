
const CACHE_NAME = 'adhan-audio-cache-v1';

export class AudioManager {
    private static instance: AudioManager;
    private audioContext: AudioContext | null = null;

    private constructor() { }

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    async isCached(url: string): Promise<boolean> {
        if (!('caches' in window)) return false;
        try {
            const cache = await caches.open(CACHE_NAME);
            const output = await cache.match(url);
            return !!output;
        } catch (e) {
            console.error('Cache check failed:', e);
            return false;
        }
    }

    async cacheAudio(url: string): Promise<void> {
        if (!('caches' in window)) throw new Error("Cache API not supported");
        const cache = await caches.open(CACHE_NAME);
        await cache.add(url);
        console.log(`Cached: ${url}`);
    }

    async play(url: string, onEnded?: () => void): Promise<HTMLAudioElement> {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";

        // Try to play from cache if available (browser handles this transparently usually, 
        // but explicit blob URL can be more robust for offline PWA context)
        if ('caches' in window) {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(url);
            if (response) {
                const blob = await response.blob();
                audio.src = URL.createObjectURL(blob);
            } else {
                audio.src = url;
            }
        } else {
            audio.src = url;
        }

        if (onEnded) {
            audio.onended = onEnded;
        }

        await audio.play();
        return audio;
    }

    // Preload/Download specific voice pack (Normal + Fajr)
    async downloadVoice(voiceId: string, options: Array<{ id: string, url: string, fajrUrl?: string }>): Promise<void> {
        const voice = options.find(v => v.id === voiceId);
        if (!voice) throw new Error("Voice not found");

        await this.cacheAudio(voice.url);
        if (voice.fajrUrl && voice.fajrUrl !== voice.url) {
            try {
                await this.cacheAudio(voice.fajrUrl);
            } catch (e) {
                console.warn("Retrying Fajr audio with fallback or ignoring...", e);
            }
        }
    }
}

export const audioManager = AudioManager.getInstance();
