export const PosIcon = ({ size = 24, ...props }) => (
    <svg aria-hidden="true" fill="none" focusable="false" height={size} width={size} role="presentation" viewBox="0 0 24 24" {...props}>
        <rect x="5" y="10" width="14" height="8" rx="1" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="9" cy="14" r="0.5" fill="currentColor" />
        <circle cx="12" cy="14" r="0.5" fill="currentColor" />
        <circle cx="15" cy="14" r="0.5" fill="currentColor" />
        <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        <rect x="10" y="6" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth={1.5} />
    </svg>
);
