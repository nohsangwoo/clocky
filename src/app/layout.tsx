import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from 'next/script'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "정확한 현재 시간 | 온라인 타이머 및 카운트다운",
  description: "정확한 현재 시간 확인과 온라인 타이머, 카운트다운 기능을 제공합니다. 세계 시간, 시차 계산, 스톱워치 등 다양한 시간 관련 도구를 이용해보세요.",
  keywords: [
    "현재 시간, 서버 시간, 정확한 시간, 시간 확인",
    "카운트다운, 타이머, 스톱워치, 시간 측정",
    "세계 시간, 시차 계산, 표준시, 협정 세계시",
    "디지털 시계, 아날로그 시계, 온라인 시계",
    "시간 동기화, 네트워크 시간 프로토콜, NTP",
    "시간 관리, 생산성 도구, 시간 추적",
    "current time, server time, accurate time, time check",
    "countdown, timer, stopwatch, time measurement",
    "world clock, time zone calculator, standard time, UTC",
    "digital clock, analog clock, online clock",
    "time synchronization, Network Time Protocol, NTP",
    "time management, productivity tools, time tracking",
    "실시간 시계, 온라인 타이머, 웹 시계, 인터넷 시간",
    "시간 변환기, 날짜 계산기, 달력, 시간대 변환",
    "정확한 시간 서비스, 원자시계, GPS 시간",
    "real-time clock, online timer, web clock, internet time",
    "time converter, date calculator, calendar, time zone converter",
    "precise time service, atomic clock, GPS time"
  ].join(", "),
  openGraph: {
    title: "정확한 현재 시간과 온라인 타이머 - 당신의 시간 관리 도구",
    description: "정확한 현재 시간 확인, 온라인 타이머, 카운트다운 등 다양한 시간 관련 기능을 제공합니다. 효율적인 시간 관리를 위한 최고의 온라인 도구입니다.",
    images: [
      {
        url: "https://clocky.ludgi.ai/logo.png",
        width: 1200,
        height: 630,
        alt: "온라인 시계 및 타이머 인터페이스",
      },
    ],
    locale: "ko_KR",
    type: "website",
    siteName: "정확한 시간",
  },
  twitter: {
    card: "summary_large_image",
    title: "정확한 현재 시간 | 온라인 타이머 및 카운트다운",
    description: "정확한 현재 시간을 확인하고 온라인 타이머, 카운트다운 기능을 사용해보세요. 효율적인 시간 관리를 위한 최고의 도구입니다!",
    images: ["https://clocky.ludgi.ai/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const pubId = "ca-pub-5823741955283998"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={pubId} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Funding Choices 스크립트 */}
        <Script
          id="google-funding-choices"
          strategy="afterInteractive"
          src={`https://fundingchoicesmessages.google.com/i/${pubId}?ers=1`}
        />
        {/* Google FC Present 스크립트 */}
        <Script
          id="google-fc-present"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`
          }}
        />
      </body>
    </html>
  );
}
