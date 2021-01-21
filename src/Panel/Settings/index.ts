import { createElementBase, asValue } from '../../install/neep';
import { Options } from '../../types';


export interface SettingsProps {
	options: Options;
}
export default function (props: SettingsProps) {
	const options = asValue(props.options);
	const value = options('value');
	const tag = options('tag');
	const placeholder = options('placeholder');
	const simple = options('simple');
	const container = options('container');
	const scopeSlot = options('scopeSlot');
	const slotRender = options('slotRender');
	const deliver = options('deliver');
	const native = options('native');
	const group = options('group');
	const shell = options('shell');
	return createElementBase('div', null,
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: value }), 'value'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: tag }), 'tag'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: placeholder }), 'placeholder'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: simple }), 'simple'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: container }), 'container'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: scopeSlot }), 'scopeSlot'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: slotRender }), 'slotRender'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: deliver }), 'deliver'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: native }), 'native'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: group }), 'group'),
		createElementBase('label', null, createElementBase('input', { type: 'checkbox', checked: shell }), 'shell')
	);
}
