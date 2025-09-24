import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <LoadingAnimation />
    </ErrorBoundary>
  );
}
