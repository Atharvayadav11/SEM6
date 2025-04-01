import { ReactNode, useEffect, useState } from 'react';

interface MobileCheckProps {
  children: ReactNode;
}

const MobileCheck = ({ children }: MobileCheckProps) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (!isMobile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md rounded-lg border bg-card p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-card-foreground">Mobile Access Only</h1>
          <p className="text-muted-foreground">
            This application is designed for mobile devices only. Please access it from a smartphone or tablet.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileCheck;