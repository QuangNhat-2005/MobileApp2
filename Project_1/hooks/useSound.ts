import { useSoundPlayer } from '../context/SoundContext';

export const useSound = () => {
    const { playSound } = useSoundPlayer();
    return playSound;
};