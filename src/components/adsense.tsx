"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
    interface Window {
        adsbygoogle: any;
    }
}

export const Adsense = () => {
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
        <div ref={adRef} key={pathname} style={{ overflow: 'hidden', margin: '16px 0' }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-client="ca-pub-3338207509752884"
                data-ad-slot="3496010343"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};
