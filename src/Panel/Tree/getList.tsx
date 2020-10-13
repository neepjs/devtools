import { NeepNode } from '@neep/core';
import { VTreeNode, Type } from '../../tree';
import { TextNode } from './Text';
import { createElement, isDeliver } from '../../install/neep';
import Tag from './Tag';
import PlaceholderTag from './PlaceholderTag';

interface Options {
	value?: boolean;
	tag?: boolean;
	placeholder?: boolean;
	simple?: boolean;
	container?: boolean;
	template?: boolean;
	scopeSlot?: boolean;
	slotRender?: boolean;
	deliver?: boolean;
}
export default function *getList(
	list: VTreeNode | VTreeNode[],
	keys: {[key: number]: boolean},
	options: Options,
	labels: ([string, string] | undefined)[] = [],
): Iterable<NeepNode> {
	if (Array.isArray(list)) {
		for (const it of list) {
			yield* getList(it, keys, options, labels);
		}
		return;
	}
	const {
		tagId,
		type,
		tag,
		children,
		props,
		key,
		label,
		value,
		isNative,
	} = list;
	const labelList = [label, ...labels];
	if (type === Type.standard || type === Type.native) {
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="font-weight: bold;">{tag}</span>
		</Tag>;
	}
	if (type === Type.tag) {
		if (!options.tag) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			{tag}
		</Tag>;
	}
	if (type === Type.simple) {
		if (!options.simple) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="
				font-style: italic;
				font-weight: bold;
			">{tag}</span>
		</Tag>;
	}
	if (type === Type.placeholder) {
		if (!options.placeholder) { return; }
		return yield <PlaceholderTag
			tagId={tagId}
			key={key}
			labels={labelList}
		/>;
	}
	if (type === Type.container) {
		if (!options.container) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="font-style: italic;">container</span>
		</Tag>;
	}
	if (isDeliver(tag)) {
		if (!options.deliver) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="font-style: italic;">Deliver</span>
		</Tag>;
	}
	if (tag === 'template') {
		if (!options.template) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="font-style: italic;">Template</span>
		</Tag>;
	}
	if (tag === 'neep:scopeslot' || tag === 'neep:scope-slot') {
		if (!options.scopeSlot) {
			return yield* getList(children, keys, options, labelList);
		}
		return yield <Tag
			keys={keys}
			tagId={tagId}
			key={key}
			labels={labelList}
			options={options}
			children={children}
		>
			<span style="font-style: italic;">ScopeSlot</span>
		</Tag>;
	}
	if (tag === 'neep:value') {
		if (!options.tag) { return; }
		if (!options.value) { return; }
		return yield <TextNode isNative={isNative} value={value} />;
	}
	if (tag === 'neep:slotrender' || tag === 'neep:slot-render') {
		if (options.slotRender) {
			return yield <PlaceholderTag
				tagId={tagId}
				key={key}
				labels={labelList}
				name="SlotRender"
			/>;
		}
		return;
	}
}
