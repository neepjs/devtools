import Neep from '@neep/core';
import { value } from './install/neep';
import { Options } from './types';

export const Deliver = Neep.createDeliverComponent<Deliver>({
	keys: {},
	selected: value(-1),
	options: {},
});

export interface Deliver {
	keys: Record<number, boolean>
	selected: Neep.Value<number>
	options: Options
}
