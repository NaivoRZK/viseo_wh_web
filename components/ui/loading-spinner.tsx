import { ClipLoader } from 'react-spinners';

export function LoadingSpinner({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`} data-testid="loading-spinner">
      <ClipLoader size={size} color="#4f46e5" />
    </div>
  );
}
