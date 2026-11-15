import type { ReactNode } from 'react';

interface StackedCardProps {
  children: ReactNode;
  surfaceColor?: string;
  className?: string;
  wrapperClassName?: string;
}

export function StackedCard({
  children,
  surfaceColor = '#FFFFFF',
  className = '',
  wrapperClassName = '',
}: StackedCardProps) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <div className="relative w-full pr-[10px] pb-[10px]">
        {/* Back-most layer (+10px right/down offset): Warm Golden Yellow */}
        <div
          aria-hidden="true"
          className="absolute top-[10px] left-[10px] right-0 bottom-0 rounded-[26px] border-[1.8px] border-[#18181B] bg-[#F6C344]"
        />
        {/* Middle layer (+5px right/down offset): Soft Lavender */}
        <div
          aria-hidden="true"
          className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] rounded-[26px] border-[1.8px] border-[#18181B] bg-[#8B5CF6]"
        />
        {/* Front card */}
        <div
          className={`relative w-full rounded-[26px] border-2 border-[#18181B] overflow-hidden ${className}`}
          style={{ backgroundColor: surfaceColor }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
