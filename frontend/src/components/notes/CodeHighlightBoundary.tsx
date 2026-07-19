import { Component, type ReactNode } from "react";

interface CodeHighlightBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface CodeHighlightBoundaryState {
  hasError: boolean;
}

// Shiki can throw if the LLM produces a language string it doesn't recognize --
// falls back to plain unstyled code instead of taking down the whole note.
export class CodeHighlightBoundary extends Component<
  CodeHighlightBoundaryProps,
  CodeHighlightBoundaryState
> {
  state: CodeHighlightBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
