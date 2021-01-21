import Neep from '@neep/core';

export interface Options {
	value?: boolean;
	tag?: boolean;
	placeholder?: boolean;
	simple?: boolean;
	container?: boolean;
	scopeSlot?: boolean;
	slotRender?: boolean;
	deliver?: boolean;
	native?: boolean;
	group?: boolean;
	shell?: boolean;
}
export interface SelectedNode {

}
export enum Type {
	tag = 'tag',
	placeholder = 'placeholder',
	standard = 'standard',
	simple = 'simple',
	native = 'native',
	container = 'container',
	special = 'special',
	deliver = 'deliver',
}
export interface VTreeNode {
	tagId: number;
	type: Type;
	tag: string;
	/** 子节点 */
	children: VTreeNode[];
	props?: { [key: string]: any; };
	/** 列表对比 key */
	key?: any;
	/** 标注 */
	labels: Neep.Label[];
	parent: number;
	value?: string;
	isNative?: boolean;
}

declare namespace Container {
	export interface Props {
		options: Options;
	}
}
type Container =
	| Neep.ShellComponent<Container.Props, any>
	| Neep.StandardComponent<Container.Props, any, any>

export { Container };
