import { useEffect, useState } from 'react';
import { Desktop } from './os/Desktop';
import { MobileHome } from './mobile/MobileHome';

const PHONE = '(max-width: 767px)';

/** Below 768px wide the site becomes a phone home screen instead of a desktop. */
export default function App() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone ? <MobileHome /> : <Desktop />;
}
