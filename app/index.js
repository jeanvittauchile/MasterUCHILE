import { registerRootComponent } from 'expo';
import App from './App';

// Entry propio (en vez de `expo/AppEntry`) porque en un monorepo con npm workspaces node_modules
// está hoisteado a la raíz del repo, y `expo/AppEntry.js` asume `../../App` relativo a sí mismo
// (project root == monorepo root), lo cual no existe — nuestro App.tsx vive en `app/App.tsx`.
registerRootComponent(App);
