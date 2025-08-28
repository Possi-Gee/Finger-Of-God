
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function FlashSales() {
  const calculateTimeLeft = () => {
    const difference = +new Date("2024-12-31T23:59:59") - +new Date();
    let timeLeft = {
      hours: '00',
      minutes: '00',
      seconds: '00'
    };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="bg-red-600 text-white p-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-300" />
            <span className="text-lg font-bold">Flash Sales</span>
        </div>
        <div className="text-sm">
          <span>TIME LEFT: </span>
          <span className="font-bold">{timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s</span>
        </div>
      </div>
      <Link href="/sales" className="text-sm font-semibold hover:underline">
        See All
      </Link>
    </div>
  );
}
