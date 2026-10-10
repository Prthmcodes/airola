import React from 'react';
import ContactOptions from './ContactOptions';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// A code-split chunk that fails to download (deploy mid-visit, flaky connection).
const isChunkLoadError = (error: Error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(
    `${error.name} ${error.message}`
  );

// Catches render errors so a visitor always sees a way to reach us instead of a blank page.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Typed explicitly: this repo has no @types/react, so React.Component's members are untyped.
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Airola page error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunk = isChunkLoadError(error);
    return (
      <section role="alert" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
          {chunk ? "This page didn't load." : 'Something went wrong on our side.'}
        </h1>
        <p className="text-lg text-slate-700 mb-8">
          {chunk ? 'Reload to try again, or reach us directly:' : 'You can still reach us:'}
        </p>
        <ContactOptions />
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-2xl font-bold text-white bg-[#2D6E5F] hover:bg-[#245A4E] transition-colors"
        >
          Reload page
        </button>
      </section>
    );
  }
}

export default ErrorBoundary;
