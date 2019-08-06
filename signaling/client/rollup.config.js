import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';

export default [{
    input: 'index.js',
    output: {
        file: 'dist/liaison.js',
        format: 'iife',
        name: 'Liaison'
    },
    name: 'Liaison',
    plugins: [
        json(),
        builtins(),
        resolve(),
        commonjs()
    ],
    watch: {
        include: [
            './index.js',
            './src/**/*.js'
        ],
        exclude: [
            './node_modules/**'
        ],
    },
    external: [
        'uuidv4'
    ]
}];