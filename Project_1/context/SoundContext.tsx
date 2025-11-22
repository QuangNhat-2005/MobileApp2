import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef } from 'react';

const soundFiles = {
    correct: require('../assets/sounds/correct.mp3'),
    incorrect: require('../assets/sounds/incorrect.mp3'),
    complete: require('../assets/sounds/complete.mp3'),
    click: require('../assets/sounds/click.mp3'),
    click2: require('../assets/sounds/click2.mp3'),
    wordclick: require('../assets/sounds/wordclick.mp3'),
};
type SoundKey = keyof typeof soundFiles;


const SoundContext = createContext<{ playSound: (soundKey: SoundKey) => void }>({
    playSound: () => console.warn('SoundProvider chưa sẵn sàng'),
});

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
    const soundObjects = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});
    const isLoading = useRef(false);
    const loadingPromise = useRef<Promise<void> | null>(null);

    const loadAllSounds = async () => {
        if (isLoading.current || Object.keys(soundObjects.current).length > 0) return;
        isLoading.current = true;

        console.log('SoundProvider: Bắt đầu tải tất cả âm thanh...');
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        const loadPromises = Object.keys(soundFiles).map(async (key) => {
            try {
                const { sound } = await Audio.Sound.createAsync(soundFiles[key as SoundKey]);
                soundObjects.current[key as SoundKey] = sound;
            } catch (error) {
                console.error(`SoundProvider: Lỗi khi load âm thanh ${key}:`, error);
            }
        });

        await Promise.all(loadPromises);
        console.log('SoundProvider: Tất cả âm thanh đã được tải thành công!');
        isLoading.current = false;
    };

    useEffect(() => {
        loadingPromise.current = loadAllSounds();

        return () => {
            console.log('SoundProvider: Dọn dẹp tất cả âm thanh...');
            Object.values(soundObjects.current).forEach(sound => sound?.unloadAsync());
        };
    }, []);

    const playSound = async (soundKey: SoundKey) => {
        if (loadingPromise.current) {
            await loadingPromise.current;
        }

        const soundObject = soundObjects.current[soundKey];
        if (soundObject) {
            try {
                await soundObject.setStatusAsync({ shouldPlay: true, positionMillis: 0 });
            } catch (error) {
                console.error(`SoundProvider: Lỗi khi phát âm thanh ${soundKey}:`, error);
            }
        } else {
            console.warn(`SoundProvider: Âm thanh '${soundKey}' chưa được tải.`);
        }
    };

    return (
        <SoundContext.Provider value={{ playSound }}>
            {children}
        </SoundContext.Provider>
    );
};


export const useSoundPlayer = () => useContext(SoundContext);