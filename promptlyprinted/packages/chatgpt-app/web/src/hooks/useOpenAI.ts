import { useEffect, useState } from 'react';
import type { OpenAIGlobal } from '../types/openai.d';

/**
 * Hook to access the window.openai global provided by ChatGPT
 */
export function useOpenAI() {
  const [openai, setOpenAI] = useState<OpenAIGlobal | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if we're running in ChatGPT's iframe
    if (typeof window !== 'undefined' && window.openai) {
      setOpenAI(window.openai);
      setIsLoaded(true);
    } else {
      // Running outside ChatGPT (development mode)
      setIsLoaded(true);
    }
  }, []);

  return {
    openai,
    isLoaded,
    isInChatGPT: !!openai,
    toolOutput: openai?.toolOutput,
    colorScheme: openai?.colorScheme || 'light',
    locale: openai?.locale || 'en',
    sessionId: openai?.sessionId,
  };
}

/**
 * Hook to persist widget state in ChatGPT
 */
export function useWidgetState<T>(initialState: T) {
  const { openai } = useOpenAI();
  const [state, setState] = useState<T>(() => {
    // Try to get persisted state
    if (openai?.getWidgetState) {
      const persisted = openai.getWidgetState() as T | undefined;
      if (persisted) return persisted;
    }
    return initialState;
  });

  // Persist state to ChatGPT
  useEffect(() => {
    if (openai?.setWidgetState) {
      openai.setWidgetState(state);
    }
  }, [state, openai]);

  return [state, setState] as const;
}

/**
 * Call an MCP tool from the widget
 */
export async function callTool(
  toolName: string, 
  args: Record<string, unknown>
): Promise<unknown> {
  if (window.openai?.callTool) {
    return window.openai.callTool(toolName, args);
  }
  console.warn('callTool not available outside ChatGPT');
  return null;
}
