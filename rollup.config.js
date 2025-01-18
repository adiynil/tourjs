import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import strip from 'rollup-plugin-strip';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    typescript({
      removeComments: true,
      sourceMap: false
    }),
    resolve(),
    postcss({
      extract: 'style.css',
      extensions: ['.css', '.less'],
      use: ['less'],
      minimize: false
    }),
    strip({
      include: ['**/*.js', '**/*.ts'],
      functions: ['console.*', 'assert.*'],
      debugger: true,
      sourceMap: false
    })
  ],
  external: ['@floating-ui/dom', 'jump.js']
};