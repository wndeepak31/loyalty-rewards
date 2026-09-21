import React, { useState } from 'react';

export const BrandLogo = ({
    className = "",
    imageClassName = "h-8 w-auto object-contain",
    showBadge = false,
    badgeText = "Loyalty",
    fallbackText = "Effission"
}) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            {!imageError ? (
                <img
                    src="/images/effission-logo.png"
                    alt={fallbackText}
                    className={imageClassName}
                    onError={() => setImageError(true)}
                />
            ) : (
                <span className="text-2xl font-black tracking-wider text-slate-800 uppercase font-sans">
                    {fallbackText}
                </span>
            )}
            {showBadge && (
                <span className="bg-brand-50 text-brand-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-brand-200 tracking-wider">
                    {badgeText}
                </span>
            )}
        </div>
    );
};

export default BrandLogo;
