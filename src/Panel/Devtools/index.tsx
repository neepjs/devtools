import { Auxiliary } from '@neep/core';
import { createElement } from '../../install/neep';


export default function (props: any, {}, { Slot }: Auxiliary) {
	return <div>
		<Slot name="settings" />
		<Slot name="tree" />
	</div>;
}
