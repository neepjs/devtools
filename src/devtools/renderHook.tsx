import { render, createElement, setHook, encase } from '../install/neep';
import { getTree } from '../tree';
import {  Devtools, Tree } from '../Panel';
import { RootExposed, ContainerEntity } from '@neep/core';
import { Options } from '../type';
import Settings from '../Panel/Settings';

let creating = false;

interface App {
	exposed: RootExposed;
	options: Options;
}

function create() {
	creating = true;
	try {
		return {
			options: encase({
				value: false,
				tag: false,
				placeholder: false,
				simple: false,
				container: false,
				template: false,
				scopeSlot: false,
				slotRender: false,
				deliver: false,
			}),
			exposed: render(),
		};
	} finally {
		creating = false;
	}
}

export default function renderHook(container: ContainerEntity) {
	if (creating) { return; }
	let app: App | undefined;
	const getData = () => {
		if (!app) { app = create(); }
		const tree = [...getTree(container.content)];
		app.exposed.$update(<Devtools>
			<Tree slot="tree" tree={tree} options={app.options} />
			<Settings slot="settings" options={app.options} />
		</Devtools>);
	};
	setHook('drawnAll', getData, container.entity);
	setHook('mounted', () => {
		if (!app) { app = create(); }
		getData();
		app.exposed.$mount();
	}, container.entity);
}
