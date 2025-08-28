
'use client';

import { useHomepage } from '@/hooks/use-homepage';

export function CallToAction() {
  const { state } = useHomepage();

  return (
    <div className="bg-purple-600 text-white text-center p-2 font-bold">
      {state.callToAction.text}
    </div>
  );
}
