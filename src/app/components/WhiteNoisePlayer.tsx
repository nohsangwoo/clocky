import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WhiteNoisePlayerProps {
    noiseType: string;
    isPlaying: boolean;
    onPlayPause: () => void;
}

const WhiteNoisePlayer: React.FC<WhiteNoisePlayerProps> = ({ noiseType, isPlaying, onPlayPause }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const [audioPermission, setAudioPermission] = useState<boolean>(false);

    useEffect(() => {
        if (audioPermission && isPlaying && audioContextRef.current) {
            playNoise();
        } else {
            stopNoise();
        }
    }, [isPlaying, noiseType, audioPermission]);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioPermission(true);
        }
    };

    const handlePlayPause = () => {
        if (!audioPermission) {
            if (window.confirm("Would you like to allow sound playback?")) {
                initAudioContext();
            }
        } else {
            onPlayPause();
        }
    };

    const playNoise = () => {
        if (!audioContextRef.current) return;
        stopNoise();

        const bufferSize = 2 * audioContextRef.current.sampleRate;
        const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;

            switch (noiseType) {
                case "white":
                    output[i] = white;
                    break;
                case "pink":
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    output[i] *= 0.11; // 핑크 노이즈 볼륨 조절
                    b6 = white * 0.115926;
                    break;
                case "brown":
                    let brown = (Math.random() * 2 - 1) * 0.02;
                    b0 = (b0 + brown) * 0.99;
                    output[i] = b0 * 3.5; // 브라운 노이즈 볼륨 조절
                    break;
                case "rain":
                    output[i] = Math.sin(i * 0.1) * Math.random() * 0.5;
                    break;
                default:
                    output[i] = white;
            }
        }

        sourceNodeRef.current = audioContextRef.current.createBufferSource();
        sourceNodeRef.current.buffer = noiseBuffer;
        sourceNodeRef.current.loop = true;

        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

        sourceNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
        sourceNodeRef.current.start();
    };

    const stopNoise = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-purple-500 rounded-full p-8 cursor-pointer"
            onClick={handlePlayPause}
        >
            {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </motion.div>
    );
};

export default WhiteNoisePlayer;