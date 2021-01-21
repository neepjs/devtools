import Neep from '@neep/core';
import { render, createElementBase, encase, value } from '../install/neep';
import { Tree, Attr, Settings } from '../Panel';
import { Options } from '../types';
import { currentContainer } from '../container';

let creating = false;


export default function renderHook(
	rootEntity: Neep.RootEntity<any>,
	container: Neep.ContainerProxy<any>,
) {
	if (creating) { return; }
	rootEntity.setHook('mounted', () => {
		creating = true;
		try {
			const options: Options = encase({});
			const selected = value(-1);
			render(createElementBase(
				currentContainer,
				{options},
				createElementBase(Tree, { 'n:slot': 'tree', container, options, selected }),
				createElementBase(Settings, { 'n:slot': 'settings', options }),
				createElementBase(Attr, { 'n:slot': 'attr', selected})
			)).mount();
		} finally {
			creating = false;
		}
	});
}
