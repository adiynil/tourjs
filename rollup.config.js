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
      minimize: true
    }),
    strip({
      include: ['**/*.js', '**/*.ts'],
      functions: ['console.*', 'assert.*'],
      debugger: process.env.NODE_ENV === 'development',
      sourceMap: false
    })
  ],
  external: []
};