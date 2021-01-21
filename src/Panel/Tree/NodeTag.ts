import Neep from '@neep/core';
import { createElementBase, Slot, createTemplateElement } from '../../install/neep';
import { getKey, getChildTree } from './utils';

interface Props {
	key: any,
	// labels: Label[],
	opened?: boolean,
	setSelected(): void,
	selected?: boolean,
	proxy: Neep.BaseProxy<any>,
	switchOpen(): void;
}

export default function NodeTag({
	proxy,
	key, switchOpen, opened, setSelected, selected,
}: Props): Neep.Node {
	const childNodes = opened ? getChildTree(proxy) : [];
	const hasChildNodes = Boolean(opened && childNodes.length);
	return createElementBase(
		'div',
		{
			style: `
			position: relative;
			min-height: 20px;
			font-size: 14px;
			line-height: 20px;
			padding-left: 20px;
			background: ${selected ? '#CCC' : ''};
		`,
		},
		createElementBase('div', {
			style: `
			position: absolute;
			left: 0;
			top: 0;
			width: 20px;
			height: 20px;
			text-align: center;
			cursor: pointer;
			background: #DDD;
			`,
			'on:click': switchOpen,
		}, opened ? '-' : '+'),
		createElementBase(
			'div',
			{'on:click': setSelected},
			'<',
			createElementBase(Slot),
			getKey(key),
			'>',
			!hasChildNodes && createTemplateElement(
				opened ? createElementBase('span') : createElementBase('span', null, '...'),
				'</',
				createElementBase(Slot),
				'>'
				)
			),
			hasChildNodes && createTemplateElement(
				createElementBase('div', {style: 'padding-left: 20px'}, childNodes),
				createElementBase('div', {'on-click': setSelected}, '</', createElementBase(Slot), '>')
			)
	);
}
