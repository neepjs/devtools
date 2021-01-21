import { createElementBase, isValue } from '../../install/neep';
import { getValue } from '../utils';


export interface AttrProps {
	props: Record<string, any>;
	key: string;
}
export default function ({props, key}: AttrProps) {
	let p = props[key];
	let propIsValue = false;
	if (isValue(p)) {
		propIsValue = true;
		p = p();
	}
	return createElementBase('div', null,
		key, ': ',
		propIsValue && createElementBase('span', {style: 'font-weight: bold;'}, '[Value: '),
		getValue(p),
		propIsValue && createElementBase('span', {style: 'font-weight: bold;'}, ' ]')
	);
}
