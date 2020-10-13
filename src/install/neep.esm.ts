export let render: typeof import('@neep/core').render;
export let createElement: typeof import('@neep/core').createElement;
export let setHook: typeof import('@neep/core').setHook;
export let isValue: typeof import('@neep/core').isValue;
export let encase: typeof import('@neep/core').encase;
export let asValue: typeof import('@neep/core').asValue;
export let Slot: typeof import('@neep/core').Slot;
export let isDeliver: typeof import('@neep/core').isDeliver;

export default function install(Neep: typeof import('@neep/core')) {
	({
		render,
		createElement,
		setHook,
		isValue,
		encase,
		asValue,
		Slot,
		isDeliver,
	} = Neep);
	return Neep.install;
}
