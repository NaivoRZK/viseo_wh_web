import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={48} />
    </div>
  );
}
