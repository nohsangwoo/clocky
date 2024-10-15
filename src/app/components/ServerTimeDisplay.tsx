'use client';

import { fetchServerTime, normalizeUrl } from '@/libs/fetchServerTime';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

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

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => {
                const newDate = new Date();
                newDate.setHours(parseInt(prevTime.hours));
                newDate.setMinutes(parseInt(prevTime.minutes));
                newDate.setSeconds(parseInt(prevTime.seconds) + 1);
                return formatTime(newDate.toISOString());
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">{url}</h3>
            <div className="grid grid-cols-3 gap-2">
                <TimeUnit value={time.hours} label="시" />
                <TimeUnit value={time.minutes} label="분" />
                <TimeUnit value={time.seconds} label="초" />
            </div>
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
