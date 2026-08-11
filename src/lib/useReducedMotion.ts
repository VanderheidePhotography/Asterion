import { useEffect, useState } from 'react';
import { useSettings } from '../app/store';

/** True when motion should be minimized — via OS preference or the in-app setting. */
export function useReducedMotion(): boolean {
  const motionSetting = useSettings((s) => s.motion);
  const [systemReduced, setSystemReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return motionSetting === 'reduced' || systemReduced;
}
