import { createElement, asValue } from '../../install/neep';
import { Options } from '../../type';


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
	const template = options('template');
	const scopeSlot = options('scopeSlot');
	const slotRender = options('slotRender');
	const deliver = options('deliver');
	return <div>
		<label><input type="checkbox" checked={value} />value</label>
		<label><input type="checkbox" checked={tag} />tag</label>
		<label><input type="checkbox" checked={placeholder} />placeholder</label>
		<label><input type="checkbox" checked={simple} />simple</label>
		<label><input type="checkbox" checked={container} />container</label>
		<label><input type="checkbox" checked={template} />template</label>
		<label><input type="checkbox" checked={scopeSlot} />scopeSlot</label>
		<label><input type="checkbox" checked={slotRender} />slotRender</label>
		<label><input type="checkbox" checked={deliver} />deliver</label>
	</div>;
}
