import dts from 'rollup-plugin-dts';
import resolve from './rollup-plugins/resolve';
import babel from './rollup-plugins/babel';
import replace from './rollup-plugins/replace';
import fsFn from 'fs';
const info = JSON.parse(fsFn.readFileSync('./package.json'));
const {
	version,
	author,
	license,
} = info;

const name = info.name.replace(
	/(?:^|-|@|\/)([a-z])/g,
	(_, s) => s.toUpperCase()
);

const bYear = 2019;
const year = new Date().getFullYear();
const date = bYear === year ? bYear : `${ bYear }-${ year }`;
const banner = `\
/*!
 * ${ name } v${ version }
 * (c) ${ date } ${ author }
 * @license ${ license }
 */`;

const createOutput = (format) => ({
	file: [
		`dist/${ info.name.replace('@', '').replace(/\/|-/g, '.') }`,
		format === 'esm' ? 'esm' : format === 'umd' ? 'browser' : '',
		format === 'mjs' ? 'mjs' : 'js',
	].filter(Boolean).join('.'),
	// sourcemap: true,
	format: format === 'mjs' ? 'esm' : format,
	name,
	banner,
	globals: {
		'monitorable': 'Monitorable',
		'@neep/core': 'Neep',
	},
	exports: 'named',
});

const external = ['monitorable', '@neep/core'];
const input = 'src/index.ts';

export default [
	{
		input,
		output: [
			createOutput('cjs'),
			createOutput('mjs'),
			createOutput('umd'),
		],
		external,
		plugins: [ resolve(), babel(), replace(false) ],
	},

	{
		input,
		output: [ createOutput('esm') ],
		external,
		plugins: [ resolve(true), babel(), replace(false) ],
	},

	{
		input,
		output: { file: 'types.d.ts', format: 'esm', banner },
		plugins: [ dts() ],
	},
];
