import { install as NeepInstall } from '@neep/core';

export {
	nameSymbol,

	render,
	createElementBase,
	createRenderElement,
	createTemplateElement,
	isValue,
	encase,
	asValue,

	Slot,
	Container,
	Fragment,
	Render,
	ScopeSlot,

	value,
	computed,
	getNode,

	isDeliverComponent,
	isNativeComponent,
	isSimpleComponent,
	isContainerComponent,

	isProxy,
} from '@neep/core';

export default function install() {
	return NeepInstall;
}
