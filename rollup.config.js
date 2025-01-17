import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
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
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: [
              'last 2 versions',
              'ie >= 11'
            ]
          },
          modules: false
        }]
      ],
      exclude: 'node_modules/**'
    }),
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