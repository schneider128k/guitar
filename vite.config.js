import { defineConfig } from 'vite';

// Project pages live at https://schneider128k.github.io/guitar/
// so all asset URLs must be prefixed with /guitar/.
export default defineConfig({
  base: '/guitar/',
});
