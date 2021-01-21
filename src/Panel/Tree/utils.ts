import { createElementBase, nameSymbol, isDeliverComponent } from '../../install/neep';
import Neep from '@neep/core';
import { TreeNode } from './TreeNode';

export function getKey(key: any) {
	if (typeof key === 'string') { return ` key=${JSON.stringify(key)}`; }
	if (typeof key === 'number') { return ` key=${key}`; }
	if (typeof key === 'boolean') { return ` key=${key}`; }
	if (typeof key === 'bigint') { return ` key=${key}`; }
	if (typeof key === 'symbol') { return ` key=${String(key)}`; }
	if (key === null) { return ` key=${key}`; }
	if (key !== undefined) { return ` key=${String(key)}`; }
}

export function getLabels(labels: Neep.Label[]) {
	return labels.map(({text, color}) => createElementBase('span', { style: `color: ${color || '#000'}` }, text));
}

export function getChildTree(proxy: Neep.BaseProxy<any>) {
	const childNodes = (proxy.content.flat(Infinity) as Neep.MountedNode[])
		.map(t => createElementBase(TreeNode, { 'n:key': t.id, tagId: t.id }));
	return childNodes;
}

export function getTagName(tag?: Neep.Tag<any>) {
	if (!tag) { return ''; }
	if (typeof tag === 'string') { return tag; }
	if (isDeliverComponent(tag)) { return 'Deliver'; }
	return tag[nameSymbol] || tag.name;
}
