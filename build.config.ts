import { defineBuildConfig } from 'unbuild';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  externals: ['react', 'react-dom', 'next'],
  alias: {
    '@': resolve(__dirname, './src'),
  },
});
