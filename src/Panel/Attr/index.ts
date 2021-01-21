import Neep from '@neep/core';
import { createElementBase, getNode } from '../../install/neep';
import { getKeyValue } from '../utils';
import Prop from './Prop';


export interface AttrProps {
	selected: Neep.Value<number>;
}
export default function Attr({selected}: AttrProps) {
	const element = getNode(selected.value);
	if (!element) { return createElementBase('temlpate'); }
	const {props = {}} = element as any;
	return createElementBase('div', null, 
		createElementBase('div', null, 'key:', getKeyValue(element.key)),
		createElementBase('div', null, '属性: '),
		Object.keys(props).map(k => createElementBase(
			Prop, { 'n:key': k, 'key': k, props}
		))
	);
}
