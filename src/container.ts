import Neep from '@neep/core';
import { createElementBase, Slot } from './install/neep';
import { Container } from './types';

function DefaultContainer(props: Container.Props) {
	return createElementBase('template', null, createElementBase(Slot, {
		name: 'settings',
	}), createElementBase(Slot, {
		name: 'tree',
	}), createElementBase(Slot, {
		name: 'attr',
	}));
}

export let currentContainer: Container = DefaultContainer;

export function setContainer(container?: Container) {
	currentContainer = typeof container === 'function'
		? container
		: DefaultContainer;
}
