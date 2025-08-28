
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useHomepage } from '@/hooks/use-homepage';

export function FlashSales() {
  const { state } = useHomepage();
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  const calculateTimeLeft = () => {
    const difference = +new Date(state.flashSale.endDate) - +new Date();
    let newTimeLeft = {
      hours: '00',
      minutes: '00',
      seconds: '00'
    };

    if (difference > 0) {
      newTimeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
      };
    }
    return newTimeLeft;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient, state.flashSale.endDate]);

  if (!isClient) {
    // Render a placeholder on the server to avoid hydration mismatch
    return (
        <div className="bg-red-600 text-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-300" />
                    <span className="text-lg font-bold">Flash Sales</span>
                </div>
                 <div className="text-sm">
                    <span>TIME LEFT: </span>
                    <span className="font-bold">--h : --m : --s</span>
                </div>
            </div>
             <Link href="/sales" className="text-sm font-semibold hover:underline">
                See All
            </Link>
        </div>
    );
  }

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
