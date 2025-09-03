import { useEffect, RefObject } from 'react';

/**
 * Hook que detecta cliques fora de elementos especificados
 * @param refs - Array de refs dos elementos a serem monitorados
 * @param handler - Função a ser executada quando ocorrer um clique fora
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verifica se o clique foi fora de todos os elementos
      const isOutside = refs.every(ref => 
        !ref.current || !ref.current.contains(target)
      );

      if (isOutside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [refs, handler]);
}