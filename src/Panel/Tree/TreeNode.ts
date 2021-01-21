import Neep from '@neep/core';
import {
	createElementBase,
	createTemplateElement,
	isContainerComponent,
	isProxy,
	getNode,
	isSimpleComponent,
	Render,
} from '../../install/neep';
import { Deliver } from '../../deliver';
import { getKey, getChildTree, getTagName } from './utils';
import NodeTag  from './NodeTag';
import { Options } from '../../types';
import ValueTag from './ValueTag';

interface Props {
	tagId: number;
}

interface Item {
	keys: Record<number, boolean>;
	tagId: number;
	selected: Neep.Value<number>;
	setSelected(): void;
	switchOpen(): void;
	options: Options;
}
function getType(proxy: Neep.BaseProxy<any>): keyof Options | '' | null {
	if (isProxy(proxy, 'component')) { return ''; }
	if (isProxy(proxy, 'container')) { return 'container'; }
	if (isProxy(proxy, 'deliver')) { return 'deliver'; }
	if (isProxy(proxy, 'element')) { return 'native'; }
	if (isProxy(proxy, 'shell')) { return 'shell'; }
	if (isProxy(proxy, 'slot')) { return 'scopeSlot'; }
	if (isSimpleComponent(proxy.tag)) { return 'simple'; }
	if (isProxy(proxy, 'group')) { return 'group'; }
	return null;
}
const render = Neep.createRenderComponent<Item, any, any>(({
	tagId, keys, selected, setSelected, switchOpen, options,
}) => {
	const el = getNode(tagId);
	if (!el) { return null; }
	const selectedThis = selected.value === tagId;
	if (!el.proxy && !el.tag) {
		if (!options.placeholder) { return null; }
		return createElementBase('span', {
			'on:click': setSelected,
			style: `font-weight: bold; background: ${selectedThis ? '#CCC' : ''};`,
		  }, '[', el.tag === null ? 'Placeholder' : 'Native', ']');
	}
	const {proxy, tag} = el;
	if (tag === Render) {
		if (!options.slotRender) {
			return null;
		}
		return createElementBase(
			'div',
			{
				'on:click': setSelected,
				key: tagId,
				style: `
					position: relative;
					min-height: 20px;
					font-size: 14px;
					line-height: 20px;
					background: ${selectedThis ? '#CCC' : ''};
				`,
			},
			'<',
			createElementBase('span', { style: 'font-style: italic;' }, 'Render'),
			getKey(el.key),
			'/>'
		);
	}
	if (isProxy(proxy, 'value')) {
		if (!proxy.isValue) {
			const { text } = proxy;
			if (typeof text !== 'string') {
				return createTemplateElement(getChildTree(proxy));
			}
			if (!options.value) { return null; }
			return createTemplateElement(text);
		}
		if (!options.value) {
			if (typeof proxy.text === 'string') { return null; }
			return createTemplateElement(getChildTree(proxy));
		}
		// TODO: 值
		return createElementBase(ValueTag, {
			opened: keys[tagId],
			selected: selectedThis,
			setSelected: setSelected,
			proxy: proxy,
			switchOpen: switchOpen,
		  });
	}

	const type = getType(proxy);
	if (type === null) { return null; }
	if (type && !options[type]) {
		return createTemplateElement(getChildTree(proxy));
	}
	let tagName: null | Neep.Element | string = null;
	switch (type) {
	case '':
		tagName = createElementBase('span', { style: 'font-weight: bold;' }, getTagName(tag));
		break;
	case 'container':
		if (isContainerComponent(tag)) {
			tagName = createElementBase('span', { style: 'font-style: italic;font-weight: bold;' }, getTagName(tag));
		} else {
			tagName = createElementBase('span', { style: 'font-style: italic;' }, 'Container');
		}
		break;
	case 'deliver':
		tagName = createElementBase('span', { style: 'font-style: italic;' }, 'Deliver');
		break;
	case 'scopeSlot':
		tagName = createElementBase('span', { style: 'font-style: italic;' }, 'ScopeSlot');
		break;
	case 'group':
		tagName = createElementBase('span', { style: 'font-style: italic;' }, 'Template');
		break;
	case 'native':
		tagName = getTagName(tag);
		break;
	case 'shell':
		tagName = createElementBase('span', { style: 'text-decoration: underline;font-weight: bold;' }, getTagName(tag));
		break;
	
	case 'simple':
		tagName = createElementBase('span', { style: 'text-decoration: line-through;font-weight: bold;' }, getTagName(tag));
		break;
	}
	return createElementBase(NodeTag, {
		key: el.key,
		opened: keys[tagId],
		selected: selectedThis,
		setSelected: setSelected,
		proxy: proxy,
		switchOpen: switchOpen,
	}, tagName);
});
export function TreeNode(
	{ tagId }: Props, {delivered}: Neep.ComponentContext<any, any>
): Neep.Node {
	const {keys, selected, options} = delivered(Deliver);
	function setSelected() {
		selected.value = selected.value === tagId ? -1 : tagId;
	}
	function switchOpen() {
		keys[tagId] = !keys[tagId];
	}
	return render({keys, selected, tagId, setSelected, switchOpen, options});
}
