import { Tags } from './auxiliary';
import { MountedNode, TreeNode, Native, IRender } from './type';
import { createMountedNode, recoveryMountedNode } from './dev/id';

type MountedNodes = MountedNode | MountedNode[]
	| (MountedNode | MountedNode[])[];

function getLastNode(tree: MountedNodes): Native.Node {
	if (Array.isArray(tree)) {
		return getLastNode(tree[tree.length - 1]);
	}
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getLastNode(component.tree); }
	return getLastNode(children);
}

function getFirstNode(tree: MountedNodes): Native.Node {
	if (Array.isArray(tree)) { return getFirstNode(tree[0]); }
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getFirstNode(component.tree); }
	return getFirstNode(children[0]);
}

export function *getNodes(tree: MountedNodes): Iterable<Native.Node> {
	if (Array.isArray(tree)) {
		for (const it of tree) {
			yield* getNodes(it);
		}
		return;
	}
	const { children, node, component } = tree;
	if (node) {
		yield node;
		return;
	}
	if (component) {
		yield* getNodes(component.tree);
		return;
	}
	yield* getNodes(children);
}

export function unmount(iRender: IRender, tree: MountedNodes): void {
	if (Array.isArray(tree)) {
		tree.forEach(e => unmount(iRender, e));
		return;
	}
	const { component, children, node } = tree;
	recoveryMountedNode(tree);
	if (node) {
		iRender.remove(node);
		return;
	}
	if (component) {
		component.unmount();
		return;
	}
	unmount(iRender, children);
}


function replace<T extends MountedNode | MountedNode[]>(
	iRender: IRender,
	newTree: T,
	oldTree: MountedNode | MountedNode[],
): T {
	const next = getFirstNode(oldTree);
	if (!next) { return newTree; }
	const parent = iRender.parent(next);
	if (!parent) { return newTree; }
	for (const it of getNodes(newTree)) {
		iRender.insert(parent, it, next);
	}
	unmount(iRender, oldTree);
	return newTree;
}

function updateList(
	iRender: IRender,
	source: TreeNode[],
	tree: MountedNode | MountedNode[],
): MountedNode[] {
	if (!source.length) {
		const node = createItem(iRender, {tag: null, children: []});
		return [replace(iRender, node, tree)];
	}
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: MountedNode[] = [];
	const list = [...tree];
	const mountedMap = new Map<MountedNode, MountedNode>();
	for (const src of source) {
		const index = list.findIndex(it =>
			it.tag === src.tag && it.key === src.key
		);
		if (index >= 0) {
			const old = list[index];
			const item = updateItem(iRender, src, old);
			mountedMap.set(old, item);
			newList.push(item);
			list.splice(index, 1);
		} else {
			const item = createItem(iRender, src);
			newList.push(item);
		}
	}
	if (!mountedMap.size) {
		return replace(iRender, newList, list);
	}
	unmount(iRender, list);
	tree = tree.filter(t => mountedMap.has(t));
	const last = getLastNode(tree[tree.length - 1]);
	const parent = iRender.parent(last);
	if (!parent) { return newList; }
	let next = iRender.next(last);
	// 调整次序
	for(let i = newList.length - 1; i >= 0; i--) {
		const item = newList[i];
		const index = tree.findIndex(o => mountedMap.get(o) === item);
		if (index >= 0) {
			for (const it of tree.splice(index)) {
				mountedMap.delete(it);
			}
		} else {
			for (const it of getNodes(item)) {
				iRender.insert(parent, it, next);
			}
		}
		next = getFirstNode(item) || next;
	}
	return newList;
}
/**
 * 更新树
 * @param tree 已有树
 * @param source 用于替换的源
 * @param iRender Neep 对象
 */
function updateAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	let index = 0;
	let length = Math.min(source.length, source.length || 1);
	const list: (MountedNode | MountedNode[])[] = [];
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			list.push(updateList(iRender, src, tree[index]));
		} else {
			list.push(updateItem(iRender, src, tree[index]));
		}
	}
	length = Math.max(source.length, tree.length);
	if (tree.length > length) {
			// 销毁多余项
			for (; index < length; index++) {
			unmount(iRender, tree[index]);
		}
	}
	if (source.length > length) {
		// 创建多余项
		const last = getLastNode(list[list.length - 1]);
		const parent = iRender.parent(last);
		const next = iRender.next(last);
		for (; index < length; index++) {
			const src = source[index];
			const item = Array.isArray(src)
				? createList(iRender, src) 
				: createItem(iRender, src);
			list.push(item);
			if (!parent) { continue; }
			for (const it of getNodes(item)) {
				iRender.insert(parent, it, next);
			}
		}
	}
	return list;
}

/**
 * 更新树节点
 * @param iRender Neep 对象
 * @param tree 已有树
 * @param source 用于替换的源
 */
function updateItem(
	iRender: IRender,
	source: TreeNode,
	tree: MountedNode | MountedNode[],
): MountedNode {
	if (Array.isArray(tree)) {
		const index = tree.findIndex(it =>
			it.tag === source.tag && it.component === source.component
		);
		if (index < 0) {
			return replace(iRender, createItem(iRender, source), tree);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		unmount(iRender, all);
	}
	const { tag } = source;
	if (tag !== tree.tag) {
		return replace(iRender, createItem(iRender, source), tree);
	}
	if (!tag) { return tree; }
	if (typeof tag !== 'string') {
		const { component } = source;
		if (!component) {
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: draw(iRender, source.children, tree.children),
			}, tree.id);
		}
		return createMountedNode({
			...source,
			node: undefined,
			component,
			children: [],
		}, tree.id);
	}
	if (tag === Tags.Value) {
		if(tree.value === source.value) {
			return createMountedNode({
				...tree,
				...source,
				children: [],
			}, tree.id);
		}
		return replace( iRender, createValue(iRender, source), tree);
	}
	if ([Tags.Template, Tags.ScopeSlot].includes(tag)) {
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: updateAll(
				iRender,
				source.children,
				tree.children,
			),
		}, tree.id);
	}
	if (tag.substr(0, 5) === 'Neep:') { return tree; }
	const { node } = tree;
	iRender.update(
		node as Native.Element,
		source.props || {},
	);
	if (!source.children.length && !tree.children.length) {
		return createMountedNode(
			{
				...tree,
				...source,
				children: [],
			},
			tree.id);
	}
	if (!source.children.length && tree.children.length) {
		unmount(iRender, tree.children);
	}
	if (source.children.length && !tree.children.length) {
		const children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insert(node as Native.Element, it);
		}
		return createMountedNode({
			...tree,
			...source,
			children,
		}, tree.id);
	}
	return createMountedNode({
		...tree, ...source,
		children: updateAll(
			iRender,
			source.children,
			tree.children,
		),
	}, tree.id);
}

function createValue(
	iRender: IRender,
	source: TreeNode,
): MountedNode {
	const { value } = source;
	if (iRender.isNode(source.value)) {
		return createMountedNode({
			...source,
			node: value,
			children: [],
			component: undefined,
		});
	}
	const type = typeof value;
	if (
		type === 'bigint'
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'string'
		|| type === 'symbol'
	) {
		return createMountedNode({
			...source,
			node: iRender.text(String(value)),
			component: undefined,
			children: [],
		});
	}
	if (type === 'object' && value) {
		// TODO: 对象处理
	}
	const node = iRender.placeholder();
	return createMountedNode({
		...source,
		node,
		component: undefined,
		children: [],
	});
}

function createAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
): (MountedNode | MountedNode[])[] {
	if (!source.length) {
		return [createMountedNode({
			tag: null,
			node: iRender.placeholder(),
			component: undefined,
			children: [],
		})];
	}

	return source.map(item =>
		Array.isArray(item)
			? createList(iRender, item)
			: createItem(iRender, item)
	);
}

function createList(
	iRender: IRender,
	source: TreeNode[],
): MountedNode[] {
	return source.map(it => createItem(iRender, it));
}

function createItem(
	iRender: IRender,
	source: TreeNode,
): MountedNode {
	const { tag } = source;
	if (!tag) {
		return createMountedNode({
			tag: null,
			node: iRender.placeholder(),
			component: undefined,
			children: [],
		});
	}
	if (typeof tag !== 'string') {
		const { component } = source;
		if (!component) {
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: draw(iRender, source.children),
			});
		}
		component.mount();
		return createMountedNode({
			...source,
			node: undefined,
			component, children: [],
		});
	}
	if (tag === Tags.Value) {
		return createValue(iRender, source);
	}
	if ([Tags.Template, Tags.ScopeSlot].includes(tag)) {
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: createAll(iRender, source.children),
		});
	}
	if (tag.substr(0, 5) === 'Neep:') {
		return createMountedNode({
			tag: null,
			node: iRender.placeholder(),
			component: undefined,
			children: [],
		});
	}
	const node = iRender.create(tag, source.props || {});
	let children: (MountedNode | MountedNode[])[] = [];
	if (source.children) {
		children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insert(node, it);
		}
	}
	return createMountedNode({
		...source,
		node,
		component: undefined,
		children,
	});
}

export default function draw(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree?: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (tree) {
		return updateAll(iRender, source, tree);
	}
	return createAll(iRender, source);
}
