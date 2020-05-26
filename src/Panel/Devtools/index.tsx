import { createElement, Slot } from '../../install/neep';


export default function (props: any, {}) {
	return <div>
		<Slot name="settings" />
		<Slot name="tree" />
	</div>;
}
