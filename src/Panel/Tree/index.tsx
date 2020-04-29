import { VTreeNode, Type } from '../../tree';
import { createElement, encase } from '../../install/neep';
import { Options } from '../../type';
import getList from './getList';

export interface TreeProps {
	tree: VTreeNode[];
	options: Options;
}
export default (props: TreeProps) => {
	const keys = encase<{[key: number]: boolean}>({});
	return () => <div style="padding-left: 20px;">
		{[...getList(props.tree, keys, props.options)]}
	</div>;
};
