export function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 w-[104px] h-[82px] rounded-[18px] border-[1.5px] border-[#18181B] bg-[#EFEAFC] flex items-center justify-center overflow-hidden"
    >
      <svg
        width="88"
        height="70"
        viewBox="0 0 88 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background circle */}
        <circle cx="44" cy="36" r="26" fill="#BCE5DE" />

        {/* Smartphone body */}
        <rect
          x="23"
          y="10"
          width="32"
          height="52"
          rx="6"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2"
        />
        {/* Phone speaker notch */}
        <line
          x1="34"
          y1="15"
          x2="44"
          y2="15"
          stroke="#18181B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Message lines inside phone */}
        <rect
          x="28"
          y="22"
          width="18"
          height="5"
          rx="2.5"
          fill="#EFEAFC"
          stroke="#18181B"
          strokeWidth="1.2"
        />
        <rect
          x="28"
          y="31"
          width="14"
          height="5"
          rx="2.5"
          fill="#F4B69C"
          stroke="#18181B"
          strokeWidth="1.2"
        />
        <rect
          x="28"
          y="40"
          width="16"
          height="5"
          rx="2.5"
          fill="#BCE5DE"
          stroke="#18181B"
          strokeWidth="1.2"
        />

        {/* Protective Mint/Teal Shield guarding phone */}
        <path
          d="M54 20L69 25.5V37.5C69 47.2 62.5 55.3 54 58.2C45.5 55.3 39 47.2 39 37.5V25.5L54 20Z"
          fill="#5CE094"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Checkmark inside shield */}
        <path
          d="M47.5 38.5L52 43L61 33.5"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
