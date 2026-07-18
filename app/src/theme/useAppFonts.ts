import { useFonts as useOswald, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import {
  useFonts as useBarlow,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';

export function useAppFonts() {
  const [oswaldLoaded] = useOswald({ Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold });
  const [barlowLoaded] = useBarlow({ Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold, Barlow_700Bold });
  return oswaldLoaded && barlowLoaded;
}
