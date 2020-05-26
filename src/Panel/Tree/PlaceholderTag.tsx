import { NeepNode } from '@neep/core';
import { createElement, Slot } from '../../install/neep';
import { getKey, getLabels } from './utils';

interface Props {
	name?: string;
	tagId: number,
	key: any,
	labels: ([string, string] | undefined)[],
}

export default function PlaceholderTag({
	name = 'placeholder', tagId, key, labels,
}: Props): NeepNode {
	return <div key={tagId} style="
		position: relative;
		min-height: 20px;
		font-size: 14px;
		line-height: 20px;
	">
		{'<'}
		<span style="font-style: italic;">{name}</span>
		{getKey(key)}
		{'/>'}
		{getLabels(labels)}
	</div>;
}
