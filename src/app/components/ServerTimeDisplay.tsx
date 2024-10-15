'use client';

import { fetchServerTime, normalizeUrl } from '@/libs/fetchServerTime';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

function formatTime(isoString: string) {
    const date = new Date(isoString);
    return {
        hours: String(date.getHours()).padStart(2, '0'),
        minutes: String(date.getMinutes()).padStart(2, '0'),
        seconds: String(date.getSeconds()).padStart(2, '0'),
    };
}

function TimeUnit({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col items-center p-2 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg shadow-lg">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-xs text-white opacity-80">{label}</span>
        </div>
    );
}

function ServerTime({ url, initialTime }: { url: string; initialTime: string }) {
    const [time, setTime] = useState(formatTime(initialTime));
    const [date, setDate] = useState(new Date(initialTime));
    const [notificationSettings, setNotificationSettings] = useState({
        isEnabled: false,
        times: [] as number[]
    });
    const [audioPermission, setAudioPermission] = useState<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => {
                const newDate = new Date(date);
                newDate.setSeconds(newDate.getSeconds() + 1);
                setDate(newDate);
                return formatTime(newDate.toISOString());
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [date]);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioPermission(true);
        }
    };

    const handleNotificationChange = () => {
        if (!notificationSettings.isEnabled) {
            if (window.confirm("알림 및 소리 재생을 허용하시겠습니까?")) {
                try {
                    initAudioContext();
                    setNotificationSettings(prev => ({ ...prev, isEnabled: true }));
                } catch (error) {
                    console.error('오디오 컨텍스트 초기화 중 오류 발생:', error);
                    alert('알림 소리를 설정하는 중 오류가 발생했습니다.');
                }
            }
        } else {
            setNotificationSettings(prev => ({ ...prev, isEnabled: false, times: [] }));
        }
    };

    const toggleNotificationTime = (minutes: number) => {
        setNotificationSettings(prev => {
            const newTimes = prev.times.includes(minutes)
                ? prev.times.filter(t => t !== minutes)
                : [...prev.times, minutes];
            return { ...prev, times: newTimes };
        });
    };

    const playNotificationSound = () => {
        if (!audioContextRef.current) return;

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
    };

    const sendNotification = (minutes: number) => {
        if (notificationSettings.isEnabled && audioPermission) {
            const notification = new Notification(`${url} 서버 시간 알림`, {
                body: `${minutes}분 전입니다: ${time.hours}:${time.minutes}:${time.seconds}`,
            });

            playNotificationSound();
        }
    };

    useEffect(() => {
        if (notificationSettings.isEnabled && notificationSettings.times.length > 0) {
            const notificationTimer = setInterval(() => {
                const currentMinutes = date.getMinutes();
                const currentSeconds = date.getSeconds();

                notificationSettings.times.forEach(minutes => {
                    if (currentMinutes === (60 - minutes) && currentSeconds === 0) {
                        sendNotification(minutes);
                    }
                });
            }, 1000);

            return () => clearInterval(notificationTimer);
        }
    }, [notificationSettings, date]);

    return (
        <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">{url}</h3>
            <div className="text-2xl font-bold text-white mb-4">
                {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                <TimeUnit value={time.hours} label="시" />
                <TimeUnit value={time.minutes} label="분" />
                <TimeUnit value={time.seconds} label="초" />
            </div>
            <div className="flex items-center mb-2">
                <input
                    type="checkbox"
                    id={`notification-${url}`}
                    checked={notificationSettings.isEnabled}
                    onChange={handleNotificationChange}
                    className="mr-2"
                />
                <label htmlFor={`notification-${url}`} className="text-white">알림 듣기</label>
            </div>
            {notificationSettings.isEnabled && (
                <div className="flex space-x-2">
                    {[1, 2, 3].map((minutes) => (
                        <button
                            key={minutes}
                            onClick={() => toggleNotificationTime(minutes)}
                            className={`px-2 py-1 rounded ${notificationSettings.times.includes(minutes) ? 'bg-purple-600' : 'bg-gray-600'
                                } text-white`}
                        >
                            {minutes}분 전
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ServerTimeDisplay() {
    const [url, setUrl] = useState<string>('');
    const [urls, setUrls] = useState<string[]>([]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['serverTimes', urls],
        queryFn: async () => {
            const results = await Promise.all(urls.map(url => fetchServerTime(url)));
            return Object.assign({}, ...results);
        },
        refetchInterval: 20000,
        enabled: urls.length > 0,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (url) {
            try {
                const normalizedUrl = normalizeUrl(url);
                if (!urls.includes(normalizedUrl)) {
                    setUrls([...urls, normalizedUrl]);
                    setUrl('');
                }
            } catch (error) {
                alert('유효하지 않은 URL입니다. 다시 확인해 주세요.');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">서버 시간 알림</h2>
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL 입력 (예: https://www.example.com)"
                        className="flex-grow p-2 border border-gray-700 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        className="bg-purple-700 text-white px-4 py-2 rounded-r-md hover:bg-purple-600 transition duration-300"
                    >
                        추가
                    </button>
                </div>
            </form>
            {isLoading && <div className="text-center text-xl font-semibold text-gray-200">서버 시간을 불러오는 중...</div>}
            {error && <div className="text-center text-xl font-semibold text-red-500">서버 시간 조회 중 오류가 발생했습니다.</div>}
            {data && Object.entries(data).map(([url, time]) => (
                <ServerTime key={url} url={url} initialTime={time as string} />
            ))}
        </div>
    );
}
