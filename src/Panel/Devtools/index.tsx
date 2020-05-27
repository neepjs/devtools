import { createElement, Slot } from '../../install/neep';
import { Options } from '../../type';

interface Props {
	options: Options;
}
export default function (props: Props) {
	return <div>
		<Slot name="settings" />
		<Slot name="tree" />
	</div>;
}
