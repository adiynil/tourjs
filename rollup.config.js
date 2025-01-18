import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'tourjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),
    resolve(),
    postcss({
      extract: 'dist/style.css',
      extensions: ['.css', '.less'],
      use: ['less'],
      minimize: true,
      sourceMap: true
    }),
    terser()
  ],
  external: []
};