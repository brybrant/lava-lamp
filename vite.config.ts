import viteConfig from '@brybrant/vite-config';

import glslPlugin from 'vite-plugin-glsl';

export default viteConfig({
  base: '/lava-lamp/',
  plugins: [glslPlugin()],
});
