export let nameSymbol: typeof import('@neep/core').nameSymbol;

export let render: typeof import('@neep/core').render;
export let createElementBase: typeof import('@neep/core').createElementBase;
export let createRenderElement: typeof import('@neep/core').createRenderElement;
export let createTemplateElement: typeof import('@neep/core').createTemplateElement;
export let isValue: typeof import('@neep/core').isValue;
export let encase: typeof import('@neep/core').encase;
export let asValue: typeof import('@neep/core').asValue;

export let Slot: typeof import('@neep/core').Slot;
export let Container: typeof import('@neep/core').Container;
export let Fragment: typeof import('@neep/core').Fragment;
export let Render: typeof import('@neep/core').Render;
export let ScopeSlot: typeof import('@neep/core').ScopeSlot;

export let value: typeof import('@neep/core').value;
export let computed: typeof import('@neep/core').computed;
export let getNode: typeof import('@neep/core').getNode;

export let isDeliverComponent: typeof import('@neep/core').isDeliverComponent;
export let isNativeComponent: typeof import('@neep/core').isNativeComponent;
export let isSimpleComponent: typeof import('@neep/core').isSimpleComponent;
export let isContainerComponent: typeof import('@neep/core').isContainerComponent;

export let isProxy: typeof import('@neep/core').isProxy;

export default function install(Neep: typeof import('@neep/core')) {
	({
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
	} = Neep);
	return Neep.install;
}
