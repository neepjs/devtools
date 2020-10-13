import { install as NeepInstall } from '@neep/core';

export {
	render,
	createElement,
	setHook,
	isValue,
	encase,
	asValue,
	Slot,
	isDeliver,
} from '@neep/core';

export default function install() {
	return NeepInstall;
}
