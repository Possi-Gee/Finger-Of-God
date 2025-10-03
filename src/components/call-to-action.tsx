
'use client';

import { useHomepage } from '@/hooks/use-homepage';

export function CallToAction() {
  const { state } = useHomepage();

  if (state.loading) {
    return <div className="bg-accent text-accent-foreground text-center p-2 font-bold h-[36px]"></div>;
  }

  return (
    <div className="bg-accent text-accent-foreground text-center p-2 font-bold">
      {state.callToAction.text}
    </div>
  );
}
