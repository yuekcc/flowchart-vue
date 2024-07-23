import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
	plugins: [vue(), vueJsx()],
	build: {
		lib: {
			name: 'Flowchart',
			formats: ['es'],
			entry: 'src/index.js',
      fileName: "index"
		},
		rollupOptions: {
			external: ['vue'],
		},
		sourcemap: false,
		minify: false,
	},
});
