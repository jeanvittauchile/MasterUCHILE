import { useWindowDimensions } from 'react-native';

/** Por debajo de este ancho la app se ve/comporta como en el teléfono (sin cambios). */
export const DESKTOP_BREAKPOINT = 900;

/** Ancho cómodo de lectura para el contenido principal en pantallas grandes (columna centrada). */
export const MAX_CONTENT_WIDTH = 560;

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_BREAKPOINT;
}
