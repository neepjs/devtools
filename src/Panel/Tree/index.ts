import Neep from '@neep/core';
import { createElementBase, encase, createRenderElement } from '../../install/neep';
import { Options } from '../../types';
import { Deliver } from '../../deliver';
import { getChildTree } from './utils';

export interface TreeProps {
	options: Options;
	selected: Neep.Value<number>;
	container: Neep.ContainerProxy<any>;
}
export default (props: TreeProps) => {
	const value: Deliver = {
		keys: encase<{[key: number]: boolean}>({}),
		options: props.options, selected: props.selected,
	};
	
	return createRenderElement(() => createElementBase(Deliver, {
		value: value,
	}, getChildTree(props.container)));
};
