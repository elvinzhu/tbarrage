import NodePath from 'path';
import RollupNodeResolve from '@rollup/plugin-node-resolve';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupTypescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import cleaner from 'rollup-plugin-cleaner';
import pkg from './package.json';

const resolveFile = path => NodePath.resolve(__dirname, path);
const externalpkgs = ['@tarojs/components', '@tarojs/runtime', '@tarojs/taro', '@tarojs/taro-h5'];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: resolveFile(pkg.main),
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: resolveFile(pkg.module),
      format: 'es',
      sourcemap: true,
    },
  ],
  external: externalpkgs,
  plugins: [
    cleaner({ targets: ['dist', 'demo/src/dist'] }),
    RollupNodeResolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    RollupCommonjs(),
    RollupTypescript({ include: ['src/*.ts'] }),
    copy({
      targets: [
        { src: 'dist/index.d.ts', rename: 'index.es.d.ts', dest: 'demo/src/dist' },
        { src: 'dist/*', dest: 'demo/src/dist' },
      ],
      hook: 'writeBundle',
    }),
  ],
};
