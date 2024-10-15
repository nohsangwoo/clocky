'use client';

import { fetchServerTime, normalizeUrl } from '@/libs/fetchServerTime';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function formatTime(isoString: string) {
    const date = new Date(isoString);
    return {
        date: {
            year: date.getFullYear(),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
        },
        time: {
            hours: String(date.getHours()).padStart(2, '0'),
            minutes: String(date.getMinutes()).padStart(2, '0'),
            seconds: String(date.getSeconds()).padStart(2, '0'),
            milliseconds: String(date.getMilliseconds()).padStart(3, '0'),
        }
    };
}

function TimeUnit({ value, label }: { value: string; label: string }) {
    const isMilliseconds = label === "밀리초";
    return (
        <motion.div
            className="flex flex-col items-center p-2 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.span
                className="text-2xl font-bold text-white"
                key={value}
                initial={isMilliseconds ? { opacity: 0 } : { y: 20, opacity: 0 }}
                animate={isMilliseconds ? { opacity: 1 } : { y: 0, opacity: 1 }}
                transition={isMilliseconds
                    ? { duration: 0.1 }
                    : { type: 'spring', stiffness: 300, damping: 30 }
                }
            >
                {value}
            </motion.span>
            <span className="text-xs text-white opacity-80">{label}</span>
        </motion.div>
    );
}

function ServerTime({ url, initialTime }: { url: string; initialTime: string }) {
    const [time, setTime] = useState(formatTime(initialTime));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => {
                const newDate = new Date(
                    prevTime.date.year,
                    parseInt(prevTime.date.month) - 1,
                    parseInt(prevTime.date.day),
                    parseInt(prevTime.time.hours),
                    parseInt(prevTime.time.minutes),
                    parseInt(prevTime.time.seconds),
                    parseInt(prevTime.time.milliseconds) + 10
                );
                return formatTime(newDate.toISOString());
            });
        }, 10);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            className="mb-8 p-4 bg-gray-800 rounded-xl shadow-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-lg font-semibold mb-2 text-gray-200">{url}</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
                <TimeUnit value={time.date.year.toString()} label="년" />
                <TimeUnit value={time.date.month} label="월" />
                <TimeUnit value={time.date.day} label="일" />
            </div>
            <div className="grid grid-cols-4 gap-2">
                <TimeUnit value={time.time.hours} label="시" />
                <TimeUnit value={time.time.minutes} label="분" />
                <TimeUnit value={time.time.seconds} label="초" />
                <TimeUnit value={time.time.milliseconds} label="밀리초" />
            </div>
        </motion.div>
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
        refetchInterval: 60000,
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
