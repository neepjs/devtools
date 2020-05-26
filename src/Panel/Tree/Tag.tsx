import { NeepNode } from '@neep/core';
import { VTreeNode, Type } from '../../tree';
import { createElement, Slot } from '../../install/neep';
import getList from './getList';
import { getKey, getLabels } from './utils';
import { Options } from '../../type';

interface Props {
	keys: {[key: number]: boolean},
	tagId: number,
	key: any,
	labels: ([string, string] | undefined)[],
	options: Options,
	children: VTreeNode[],
}

export default function Tag({
	keys, tagId, key, labels, options, children,
}: Props): NeepNode {
	const opened = keys[tagId];
	const childNodes = opened ? [...getList(children, keys, options)] : [];
	const hasChildNodes = Boolean(opened && childNodes.length);
	return <div key={tagId} style="
		position: relative;
		min-height: 20px;
		font-size: 14px;
		line-height: 20px;
	">
		<div
			style="
				position: absolute;
				left: -20px;
				top: 0;
				width: 20px;
				height: 20px;
				text-align: center;
				cursor: pointer;
				background: #DDD;;
			"
			onclick={() => keys[tagId] = !opened}
		>{opened ? '-' : '+'}</div>
		<div>
			{'<'}<Slot />{getKey(key)}{'>'}
			{!hasChildNodes && <template>
				{opened ? <span /> : <span
					onclick={() => keys[tagId] = true}
					style="cursor: pointer;"
				>...</span>}
				{'</'}<Slot />{'>'}
			</template>}
			{getLabels(labels)}
		</div>
		{hasChildNodes && <template>
			<div style="padding-left: 20px">{childNodes}</div>
			<div>{'</'}<Slot />{'>'}</div>
		</template>}
	</div>;
}
