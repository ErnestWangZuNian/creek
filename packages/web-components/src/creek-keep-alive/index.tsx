import { useEffect, useState } from 'react';

export const CreekKeepAlive = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return <div>KeepAlive</div>;
};