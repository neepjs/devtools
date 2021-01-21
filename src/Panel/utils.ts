import Neep from '@neep/core';
import { createElementBase } from '../install/neep';


export function getKeyValue(key: any) {
	if (typeof key === 'string') { return JSON.stringify(key); }
	if (typeof key === 'number') { return `${key}`; }
	if (typeof key === 'boolean') { return `${key}`; }
	if (typeof key === 'bigint') { return `${key}`; }
	if (typeof key === 'symbol') { return `${String(key)}`; }
	if (key === null) { return `${key}`; }
	if (key !== undefined) { return `${String(key)}`; }
}

export function getValue(
	value: any,
): Neep.Node {
	const type = typeof value;

	if (type === 'function') {
		return createElementBase('span', {style: 'font-weight: bold;'}, '[Function]');
	}

	if (type === 'string') {
		return createElementBase('span', null, value);
	}

	if (
		type === 'bigint'
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'symbol'
		|| type === 'undefined'
		|| value === null
	) {
		return createElementBase('span', {style: 'font-style: italic;'}, String(value));
	} else if (value instanceof RegExp) {
		return createElementBase('span', {style: 'font-weight: bold;'}, String(value));
	} else if (value instanceof Date) {
		return createElementBase('span', {style: 'font-weight: bold;'}, value.toISOString());
	} else if (type === 'object') {
		return createElementBase('span', {style: 'font-style: italic;'}, String(value));
	}
	return null;
}
