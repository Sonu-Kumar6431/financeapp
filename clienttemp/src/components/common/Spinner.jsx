import React from 'react';

export default function Spinner({ size = 'md', center = false }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' };
  const el = (
    <div className={`${sizes[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
  );
  if (center) return <div className="flex items-center justify-center py-12">{el}</div>;
  return el;
}
