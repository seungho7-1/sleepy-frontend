import React from 'react';

export default function SnsIcon({ url }) {
    if (!url) return null;
    
    if (url.includes('youtube.com')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    } else if (url.includes('instagram.com')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        );
    } else if (url.includes('tiktok.com')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5v3a3 3 0 01-3-3" />
            </svg>
        );
    } else if (url.includes('facebook.com')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    );
}
