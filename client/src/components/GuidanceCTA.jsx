import { useGuidanceModal } from '../context/GuidanceModalContext';

export default function GuidanceCTA({ className = '', children, onClick, ...props }) {
  const { openGuidance } = useGuidanceModal();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openGuidance();
        onClick?.(e);
      }}
      data-guidance-open
      {...props}
    >
      {children}
    </button>
  );
}
