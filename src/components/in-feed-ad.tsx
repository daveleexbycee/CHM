
"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from './ui/card';

declare global {
    interface Window {
        adsbygoogle: any;
    }
}

export const InFeedAd = () => {
    const pathname = usePathname();
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const insElement = adRef.current?.querySelector('ins.adsbygoogle');
        if (insElement && insElement.getAttribute('data-ad-status') !== 'unfilled') {
            return;
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [pathname]);


    return (
        <Card ref={adRef} key={pathname} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
             <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="fluid"
                data-ad-layout-key="-fb+5w+4e-db+86"
                data-ad-client="ca-pub-3338207509752884"
                data-ad-slot="1696128926"></ins>
        </Card>
    );
};
