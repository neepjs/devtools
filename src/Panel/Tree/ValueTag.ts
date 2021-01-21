import Neep from '@neep/core';
import { createElementBase, createTemplateElement } from '../../install/neep';
import { getChildTree } from './utils';

interface Props {
	// labels: Label[],
	opened?: boolean,
	setSelected(): void,
	selected?: boolean,
	proxy: Neep.ValueProxy,
	switchOpen(): void;
}

export default function ValueTag({
	proxy, switchOpen, opened, setSelected, selected,
}: Props): Neep.Node {
	const { text } = proxy;
	const childNodes = opened ? typeof text === 'string' ? [text] : getChildTree(proxy) : [];
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
			style: 'position: absolute; left: 0; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;',
			'on:click': switchOpen,
		}, opened ? '-' : '+'),
		createElementBase(
			'div',
			{'on:click': setSelected },
			createElementBase('span', { style: 'font-style: italic;font-weight: bold;' }, '[Value]'),
			!hasChildNodes && createTemplateElement(
				opened ? createElementBase('span') : createElementBase('span', null, '...'),
				createElementBase('span', { style: 'font-style: italic;font-weight: bold;' }, '[/Value]')
			)
		),
		hasChildNodes && createTemplateElement(
			createElementBase('div', { style: 'padding-left: 20px' }, childNodes),
			createElementBase('div', { 'on:click': setSelected, style: 'font-style: italic; font-weight: bold;' }, '[/Value]')
		)
	);
}
