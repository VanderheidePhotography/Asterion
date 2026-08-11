import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // keep the 3D stack in its own chunks so research mode stays featherweight
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three') || id.includes('three-stdlib') || id.includes('postprocessing')) return 'r3f';
          return undefined;
        },
      },
    },
  },
});
