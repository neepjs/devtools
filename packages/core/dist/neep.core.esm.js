/*!
 * Neep v0.1.0-alpha.7
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
const version = 'undefined';
const mode = 'development';
const isProduction = mode === 'production';

var Constant = /*#__PURE__*/Object.freeze({
  version: version,
  mode: mode,
  isProduction: isProduction
});

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function getEventName(k) {
  if (k[0] === '@') {
    return k.substr(1);
  }

  if (/^on[:-]/.test(k)) {
    return k.substr(3);
  }

  return '';
}

class EventEmitter {
  static update(emitter, events) {
    if (!events) {
      return [];
    }

    const newHandles = [];

    if (events && typeof events === 'object') {
      for (const n of Object.keys(events)) {
        if (!n) {
          continue;
        }

        const fn = events[n];

        if (typeof fn !== 'function') {
          continue;
        }

        newHandles.push(emitter.on(n, fn));
      }
    }

    return newHandles;
  }

  static updateInProps(emitter, props, custom) {
    if (!props) {
      return [];
    }

    const newHandles = [];

    function addEvent(entName, listener) {
      newHandles.push(emitter.on(entName, listener));
    }

    for (const k of Object.keys(props)) {
      const fn = props[k];

      if (typeof fn !== 'function') {
        continue;
      }

      const entName = getEventName(k);

      if (!entName) {
        continue;
      }

      addEvent(entName, fn);
    }

    const event = props['@'];

    if (event && typeof event === 'object') {
      for (const k of Object.keys(event)) {
        const f = event[k];

        if (typeof f !== 'function') {
          continue;
        }

        addEvent(k, f);
      }
    }

    if (typeof event === 'function') {
      const {
        names
      } = event;

      if (Array.isArray(names)) {
        for (const n of names) {
          if (!n) {
            continue;
          }

          addEvent(n, (...p) => event(n, ...p));
        }
      }
    }

    if (typeof custom === 'function') {
      custom(addEvent);
    }

    newHandles.push(...EventEmitter.update(emitter, props['@']));
    return newHandles;
  }

  get names() {
    return this._names;
  }

  constructor() {
    _defineProperty(this, "_names", []);

    _defineProperty(this, "_cancelHandles", new Set());

    _defineProperty(this, "emit", void 0);

    _defineProperty(this, "on", void 0);

    const events = Object.create(null);
    const names = this._names;

    function emit(name, ...p) {
      const event = events[name];

      if (!event) {
        return;
      }

      for (const fn of [...event]) {
        fn(...p);
      }
    }

    emit.names = names;
    Reflect.defineProperty(emit, 'names', {
      get: () => {
        monitorable.markRead(emit, 'names');
        return this._names;
      },
      configurable: true
    });

    const on = (name, listener) => {
      const fn = monitorable.safeify(listener);
      let event = events[name];

      if (!event) {
        event = new Set();
        events[name] = event;
        monitorable.markChange(emit, 'names');
        this._names = [...this._names, name];
      }

      event.add(fn);
      let removed = false;
      return () => {
        if (removed) {
          return;
        }

        removed = true;
        event.delete(fn);

        if (event.size) {
          return;
        }

        monitorable.markChange(emit, 'names');
        this._names = this._names.filter(n => n !== name);
      };
    };

    this.emit = emit;
    this.on = on;
  }

  updateHandles(newHandles) {
    const eventCancelHandles = this._cancelHandles;
    const oldHandles = [...eventCancelHandles];
    eventCancelHandles.clear();

    for (const fn of oldHandles) {
      fn();
    }

    newHandles.forEach(f => eventCancelHandles.add(f));
    return newHandles;
  }

  update(list) {
    const handles = EventEmitter.update(this, list);
    return this.updateHandles(handles);
  }

  updateInProps(list, custom) {
    const handles = EventEmitter.updateInProps(this, list, custom);
    return this.updateHandles(handles);
  }

}

class NeepError extends Error {
  constructor(message, tag = '') {
    super(tag ? `[${tag}] ${message}` : message);

    _defineProperty(this, "tag", void 0);

    this.tag = tag;
  }

}
function assert(v, message, tag) {
  if (v) {
    return;
  }

  throw new NeepError(message, tag);
}

let monitorable;
let value;
let computed;
let isValue;
let encase;
let recover;

function installMonitorable(api) {
  if (!api) {
    return;
  }

  monitorable = api;
  value = monitorable.value;
  computed = monitorable.computed;
  isValue = monitorable.isValue;
  encase = monitorable.encase;
  recover = monitorable.recover;
}

let nextFrameApi;
function nextFrame(fn) {
  assert(nextFrameApi, 'The basic renderer is not installed', 'install');
  nextFrameApi(fn);
}
const renders = Object.create(null);
function getRender(type = '') {
  if (typeof type === 'object') {
    return type;
  }

  return renders[type] || renders.default;
}

function addRender(render) {
  if (!render) {
    return;
  }

  if (render.install) {
    render.install({
      get isValue() {
        return isValue;
      },

      EventEmitter,
      Error: NeepError
    });
  }

  renders[render.type] = render;

  if (nextFrameApi) {
    return;
  }

  if (!renders.default) {
    renders.default = render;
  }

  if (!nextFrameApi && render.nextFrame) {
    renders.default = render;
    nextFrameApi = render.nextFrame;
  }
}

function installRender({
  render,
  renders
}) {
  addRender(render);

  if (!Array.isArray(renders)) {
    return;
  }

  for (const render of renders) {
    addRender(render);
  }
}

const devtools = {
  renderHook() {}

};

function installDevtools(tools) {
  if (!tools) {
    return;
  }

  if (typeof tools !== 'object') {
    return;
  }

  const {
    renderHook
  } = tools;

  if (typeof renderHook === 'function') {
    devtools.renderHook = renderHook;
  }
}

function install(apis) {
  installMonitorable(apis.monitorable);
  installRender(apis);

  {
    installDevtools(apis.devtools);
  }
}

const components = Object.create(null);
function register(name, component) {
  components[name] = component;
}

const ScopeSlot = 'Neep:ScopeSlot';
const SlotRender = 'Neep:SlotRender';
const Slot = 'Neep:Slot';
const Value = 'Neep:Value';
const Container = 'Neep:Container';
const Deliver = 'Neep:Deliver';
const Template = 'template';
const Fragment = Template;

var Tags = /*#__PURE__*/Object.freeze({
  ScopeSlot: ScopeSlot,
  SlotRender: SlotRender,
  Slot: Slot,
  Value: Value,
  Container: Container,
  Deliver: Deliver,
  Template: Template,
  Fragment: Fragment
});

let current;
function setCurrent(fn, entity) {
  const oldEntity = current;
  current = entity;

  try {
    current.$_valueIndex = 0;
    const ret = fn();

    if (current.$_valueIndex !== current.$_values.length) {
      throw new NeepError('Inconsistent number of useValue executions', 'life');
    }

    return ret;
  } finally {
    current = oldEntity;
  }
}
function checkCurrent(name, initOnly = false) {
  if (!current) {
    throw new NeepError(`Function \`${name}\` can only be called within a cycle.`, 'life');
  }

  if (!initOnly) {
    return current;
  }

  if (!current.created) {
    return current;
  }

  throw new NeepError(`Function \`${name}\` can only be called at initialization time.`, 'life');
}

const constructors = [];
function initContext(context, exposed) {
  for (const constructor of constructors) {
    constructor(context, exposed);
  }

  return context;
}
function addContextConstructor(constructor) {
  constructors.push(monitorable.safeify(constructor));
}

const hooks = Object.create(null);
function setHook(id, hook, entity) {
  let list = (entity === null || entity === void 0 ? void 0 : entity.$_hooks) || hooks;

  if (!list) {
    return () => {};
  }

  hook = monitorable.safeify(hook);
  let set = list[id];

  if (!set) {
    set = new Set();
    list[id] = set;
  }

  set.add(hook);
  return () => set.delete(hook);
}
function callHook(id, exposed) {
  if (!exposed) {
    return;
  }

  for (const hook of exposed.$_hooks[id] || []) {
    hook(exposed);
  }

  for (const hook of hooks[id] || []) {
    hook(exposed);
  }
}

function watch(value, cb) {
  const entity = checkCurrent('watch');

  if (typeof value !== 'function') {
    return () => {};
  }

  const stop = isValue(value) ? value.watch(cb) : computed(value).watch((v, s) => cb(v(), s));
  setHook('beforeDestroy', () => stop(), entity);
  return stop;
}
function useValue(fn, name = 'useValue') {
  const entity = checkCurrent(name);
  const index = entity.$_valueIndex++;
  const values = entity.$_values;

  if (!entity.created) {
    values[index] = undefined;
    const v = typeof fn === 'function' ? fn() : value(undefined);
    return values[index] = v;
  }

  if (index >= values.length) {
    throw new NeepError('Inconsistent number of useValue executions', 'life');
  }

  return values[index];
}
function hook(name, hook, initOnly) {
  const entity = checkCurrent('setHook');

  if (initOnly && entity.created) {
    return undefined;
  }

  return setHook(name, () => hook(), entity);
}
function setValue(obj, name, value, opt) {
  if (typeof name === 'string' && ['$', '_'].includes(name[0])) {
    return;
  }

  if (isValue(value) && opt) {
    Reflect.defineProperty(obj, name, {
      get() {
        return value();
      },

      set(v) {
        value(v);
      },

      configurable: true,
      enumerable: true
    });
    return;
  }

  if (typeof value === 'function' && opt) {
    Reflect.defineProperty(obj, name, {
      get: value,
      set: typeof opt === 'function' ? opt : undefined,
      configurable: true,
      enumerable: true
    });
    return;
  }

  Reflect.defineProperty(obj, name, {
    get() {
      return value;
    },

    configurable: true,
    enumerable: true
  });
}
function expose(name, value, opt) {
  setValue(checkCurrent('expose', true).exposed, name, value, opt);
}
function deliver(name, value, opt) {
  setValue(checkCurrent('deliver', true).delivered, name, value, opt);
}

var Life = /*#__PURE__*/Object.freeze({
  watch: watch,
  useValue: useValue,
  hook: hook,
  setValue: setValue,
  expose: expose,
  deliver: deliver
});

const isElementSymbol = Symbol.for('isNeepElement');
const typeSymbol = Symbol.for('type');
const nameSymbol = Symbol.for('name');
const renderSymbol = Symbol.for('render');
const componentsSymbol = Symbol.for('components');
const configSymbol = Symbol.for('config');

function isElement(v) {
  if (!v) {
    return false;
  }

  if (typeof v !== 'object') {
    return false;
  }

  return v[isElementSymbol] === true;
}
function createElement(tag, attrs, ...children) {
  attrs = attrs ? { ...attrs
  } : {};
  const node = {
    [isElementSymbol]: true,
    tag,
    children: []
  };

  if ('key' in attrs) {
    node.key = attrs.key;
  }

  if ('slot' in attrs) {
    node.slot = attrs.slot;
  }

  if (typeof attrs.ref === 'function') {
    node.ref = attrs.ref;
  }

  if (tag === Value) {
    node.value = attrs.value;
    return node;
  }

  node.children = children;

  if (tag === Template) {
    return node;
  }

  if (tag === SlotRender) {
    node.render = attrs.render;
    return node;
  }

  if (tag === ScopeSlot || tag === Slot) {
    const {
      render,
      argv,
      args,
      name
    } = attrs;
    node.render = render;
    node.args = argv && [argv] || Array.isArray(args) && args.length && args || [{}];

    if (tag === ScopeSlot) {
      node.props = {
        name
      };
      return node;
    }
  }

  node.props = {};

  for (let k in attrs) {
    const nCmd = /^n([:-])([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)$/i.exec(k);

    if (!nCmd) {
      node.props[k] = attrs[k];
      continue;
    }
  }

  return node;
}
function elements(node, opt = {}) {
  if (Array.isArray(node)) {
    const list = [];

    for (let n of node) {
      list.push(elements(n, opt));
    }

    return [].concat(...list);
  }

  if (!isElement(node)) {
    return [node];
  }

  let {
    tag
  } = node;

  if (!tag) {
    return [];
  }

  if ([Template, ScopeSlot].includes(tag)) {
    return elements(node.children, opt);
  }

  if (typeof tag !== 'function') {
    return [node];
  }

  if (tag[typeSymbol] !== 'simple') {
    return [node];
  }

  const {
    simple
  } = opt;

  if (!simple) {
    return [node];
  }

  if (Array.isArray(simple)) {
    if (simple.includes(tag)) {
      return [node];
    }
  } else if (typeof simple === 'function') {
    if (!simple(tag)) {
      return [node];
    }
  }

  return elements(node.children, opt);
}

var Element = /*#__PURE__*/Object.freeze({
  isElement: isElement,
  createElement: createElement,
  elements: elements
});

let label;
function setLabel(l) {
  label = l;
}
function getLabel() {
  const l = label;
  label = undefined;
  return l;
}

function label$1(text, color = '') {
  {
    if (!current) {
      setLabel([text, color]);
      return;
    }

    Reflect.defineProperty(current.exposed, '$label', {
      value: [text, color],
      configurable: true
    });
  }
}

var Dev = /*#__PURE__*/Object.freeze({
  label: label$1
});

const auxiliary = { ...Tags,
  ...Life,
  ...Element,
  ...Dev,
  ...Constant,

  get value() {
    return value;
  },

  get computed() {
    return computed;
  },

  get isValue() {
    return isValue;
  },

  get encase() {
    return encase;
  },

  get recover() {
    return recover;
  }

};
function setAuxiliary(name, value) {
  Reflect.defineProperty(auxiliary, name, {
    value,
    enumerable: true,
    configurable: true
  });
}
function defineAuxiliary(name, get) {
  Reflect.defineProperty(auxiliary, name, {
    get,
    enumerable: true,
    configurable: true
  });
}

let ids = 0;
const Nodes = {};
let IdMap;

{
  IdMap = new Map();
}

function createMountedNode(n, id) {
  {
    id = id || ++ids;
    const {
      node
    } = n;

    if (node && IdMap) {
      IdMap.set(node, id);
    }

    return Nodes[id] = { ...n,
      id
    };
  }

  return { ...n,
    id: 0
  };
}
function recoveryMountedNode(node) {
  {
    delete Nodes[node.id];
  }
}

function* recursive2iterable(list) {
  if (!Array.isArray(list)) {
    yield list;
    return;
  }

  for (const it of list) {
    yield* recursive2iterable(it);
  }
}

let refList;
function setRefList(list) {
  refList = list;
}

function setRef(ref, node, isRemove) {
  if (typeof ref !== 'function') {
    return;
  }

  if (!node) {
    return;
  }

  if (!refList) {
    ref(node, isRemove);
  } else {
    refList.push(() => ref(node, isRemove));
  }
}

function getLastNode(tree) {
  if (Array.isArray(tree)) {
    return getLastNode(tree[tree.length - 1]);
  }

  const {
    component,
    children,
    node
  } = tree;

  if (node) {
    return node;
  }

  if (component) {
    return getLastNode(component.tree);
  }

  return getLastNode(children);
}

function getFirstNode(tree) {
  if (Array.isArray(tree)) {
    return getFirstNode(tree[0]);
  }

  const {
    component,
    children,
    node
  } = tree;

  if (node) {
    return node;
  }

  if (component) {
    return getFirstNode(component.tree);
  }

  return getFirstNode(children[0]);
}

function* getNodes(tree) {
  if (Array.isArray(tree)) {
    for (const it of tree) {
      yield* getNodes(it);
    }

    return;
  }

  const {
    children,
    node,
    component
  } = tree;

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
function unmount(iRender, tree) {
  if (Array.isArray(tree)) {
    tree.forEach(e => unmount(iRender, e));
    return;
  }

  const {
    component,
    children,
    node,
    ref
  } = tree;
  recoveryMountedNode(tree);

  if (node) {
    setRef(ref, node, true);
    iRender.remove(node);
    return;
  }

  if (component) {
    setRef(ref, component.exposed, true);
    component.unmount();
    return;
  }

  unmount(iRender, children);
}

function replace(iRender, newTree, oldTree) {
  const next = getFirstNode(oldTree);

  if (!next) {
    return newTree;
  }

  const parent = iRender.parent(next);

  if (!parent) {
    return newTree;
  }

  for (const it of getNodes(newTree)) {
    iRender.insert(parent, it, next);
  }

  unmount(iRender, oldTree);
  return newTree;
}

function updateList(iRender, source, tree) {
  if (!source.length) {
    const node = createItem(iRender, {
      tag: null,
      children: []
    });
    return [replace(iRender, node, tree)];
  }

  if (!Array.isArray(tree)) {
    tree = [tree];
  }

  const newList = [];
  const list = [...tree];
  const mountedMap = new Map();

  for (const src of source) {
    const index = list.findIndex(it => it.tag === src.tag && it.key === src.key);

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

  if (!parent) {
    return newList;
  }

  let next = iRender.next(last);

  for (let i = newList.length - 1; i >= 0; i--) {
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

function updateAll(iRender, source, tree) {
  let index = 0;
  let length = Math.min(source.length, source.length || 1);
  const list = [];

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
    for (; index < length; index++) {
      unmount(iRender, tree[index]);
    }
  }

  if (source.length > length) {
    const last = getLastNode(list[list.length - 1]);
    const parent = iRender.parent(last);
    const next = iRender.next(last);

    for (; index < length; index++) {
      const src = source[index];
      const item = Array.isArray(src) ? createList(iRender, src) : createItem(iRender, src);
      list.push(item);

      if (!parent) {
        continue;
      }

      for (const it of getNodes(item)) {
        iRender.insert(parent, it, next);
      }
    }
  }

  return list;
}

function updateItem(iRender, source, tree) {
  if (Array.isArray(tree)) {
    const index = tree.findIndex(it => it.tag === source.tag && it.component === source.component);

    if (index < 0) {
      return replace(iRender, createItem(iRender, source), tree);
    }

    const all = tree;
    [tree] = tree.splice(index, 1);
    unmount(iRender, all);
  }

  const {
    tag,
    component
  } = source;
  const ref = source.ref !== tree.ref && source.ref || undefined;

  if (tag !== tree.tag || component !== tree.component) {
    return replace(iRender, createItem(iRender, source), tree);
  }

  if (!tag) {
    return tree;
  }

  if (typeof tag !== 'string' || tag === Container) {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: draw(iRender, source.children, tree.children)
      }, tree.id);
    }

    setRef(ref, component.exposed);
    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    }, tree.id);
  }

  if (tag === Value) {
    let value = source.value;

    if (isValue(value)) {
      value = value();
    }

    if (tree.value === value) {
      setRef(ref, tree.node);
      return createMountedNode({ ...tree,
        ...source,
        value,
        children: []
      }, tree.id);
    }

    return replace(iRender, createValue(iRender, source, value), tree);
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: updateAll(iRender, source.children, tree.children)
    }, tree.id);
  }

  const {
    node
  } = tree;
  iRender.update(node, source.props || {});
  setRef(ref, node);

  if (!source.children.length && !tree.children.length) {
    return createMountedNode({ ...tree,
      ...source,
      children: []
    }, tree.id);
  }

  if (!source.children.length && tree.children.length) {
    unmount(iRender, tree.children);
  }

  if (source.children.length && !tree.children.length) {
    const children = createAll(iRender, source.children);

    for (const it of getNodes(children)) {
      iRender.insert(node, it);
    }

    return createMountedNode({ ...tree,
      ...source,
      children
    }, tree.id);
  }

  return createMountedNode({ ...tree,
    ...source,
    children: updateAll(iRender, source.children, tree.children)
  }, tree.id);
}

function createValue(iRender, source, value) {
  let {
    ref
  } = source;

  if (iRender.isNode(value)) {
    setRef(ref, value);
    return createMountedNode({ ...source,
      value,
      node: value,
      children: [],
      component: undefined
    });
  }

  const type = typeof value;
  let node;

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'string' || type === 'symbol' || value instanceof RegExp) {
    node = iRender.text(String(value));
  } else if (value instanceof Date) {
    node = iRender.text(value.toISOString());
  } else if (type === 'object' && value) {
    node = iRender.text(String(value));
  }

  if (!node) {
    node = iRender.placeholder();
  }

  setRef(ref, node);
  return createMountedNode({ ...source,
    value,
    node,
    component: undefined,
    children: []
  });
}

function createAll(iRender, source) {
  if (!source.length) {
    return [createMountedNode({
      tag: null,
      node: iRender.placeholder(),
      component: undefined,
      children: []
    })];
  }

  return source.map(item => Array.isArray(item) ? createList(iRender, item) : createItem(iRender, item));
}

function createList(iRender, source) {
  if (source.length) {
    return source.map(it => createItem(iRender, it));
  }

  return [createMountedNode({
    tag: null,
    node: iRender.placeholder(),
    component: undefined,
    children: []
  })];
}

function createItem(iRender, source) {
  const {
    tag,
    ref,
    component
  } = source;

  if (!tag) {
    const node = iRender.placeholder();
    setRef(ref, node);
    return createMountedNode({
      tag: null,
      node,
      component: undefined,
      children: []
    });
  }

  if (typeof tag !== 'string' || tag === Container) {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: draw(iRender, source.children)
      });
    }

    component.mount();
    setRef(ref, component.exposed);
    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    });
  }

  if (tag === Value) {
    let value = source.value;

    if (isValue(value)) {
      value = value();
    }

    return createValue(iRender, source, value);
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: createAll(iRender, source.children)
    });
  }

  const node = iRender.create(tag, source.props || {});
  setRef(ref, node);
  let children = [];

  if (source.children) {
    children = createAll(iRender, source.children);

    for (const it of getNodes(children)) {
      iRender.insert(node, it);
    }
  }

  return createMountedNode({ ...source,
    node,
    component: undefined,
    children
  });
}

function draw(iRender, source, tree) {
  if (tree) {
    return updateAll(iRender, source, tree);
  }

  return createAll(iRender, source);
}

function getSlots(iRender, children, slots, native = false) {
  const nativeList = [];

  for (const it of children) {
    if (Array.isArray(it)) {
      const list = Object.create(null);
      nativeList.push(getSlots(iRender, it, list, native));

      for (const k of Reflect.ownKeys(list)) {
        if (k in slots) {
          slots[k].push(list[k]);
        } else {
          slots[k] = [list[k]];
        }
      }

      continue;
    }

    if (native) {
      if (iRender.isNode(it)) {
        nativeList.push(it);
        continue;
      }

      if (!isElement(it)) {
        nativeList.push(it);
        continue;
      }

      if (it.tag !== SlotRender) {
        nativeList.push(it);
        continue;
      }
    }

    const slot = isElement(it) && it.slot || 'default';
    const el = isElement(it) ? { ...it,
      slot: undefined,
      props: { ...it.props,
        slot: undefined
      }
    } : it;

    if (slot in slots) {
      slots[slot].push(el);
    } else {
      slots[slot] = [el];
    }
  }

  return nativeList;
}

function renderSlots(list, ...props) {
  return list.map(it => {
    if (Array.isArray(it)) {
      return renderSlots(it, ...props);
    }

    if (!isElement(it)) {
      return it;
    }

    if (it.tag !== SlotRender) {
      return { ...it,
        slot: undefined
      };
    }

    if (typeof it.render === 'function') {
      return it.render(...props);
    }

    return it.children;
  });
}

function createSlots(name, list) {
  const slot = (...props) => ({
    [isElementSymbol]: true,
    tag: ScopeSlot,
    children: renderSlots(list, ...props),
    inserted: true,
    label:  [`[${name}]`, '#00F']
  });

  slot.children = list;
  return slot;
}

function setSlots(children, slots = Object.create(null)) {
  for (const k of Reflect.ownKeys(slots)) {
    if (!(k in children)) {
      delete slots[k];
    }
  }

  for (const k of Reflect.ownKeys(children)) {
    slots[k] = createSlots(k, children[k]);
  }

  return slots;
}

function updateProps(obj, props, oldProps = {}, define = false) {
  const newKeys = new Set(Reflect.ownKeys(props));

  for (const k of Reflect.ownKeys(obj)) {
    if (!newKeys.has(k)) {
      delete obj[k];
    }
  }

  if (!define) {
    for (const k of newKeys) {
      obj[k] = props[k];
    }

    return obj;
  }

  for (const k of newKeys) {
    const value = props[k];

    if (k in oldProps && oldProps[k] === value) {
      continue;
    }

    if (isValue(value)) {
      Reflect.defineProperty(obj, k, {
        configurable: true,
        enumerable: true,

        get() {
          return value();
        },

        set(v) {
          value(v);
        }

      });
      continue;
    }

    Reflect.defineProperty(obj, k, {
      configurable: true,
      enumerable: true,
      value
    });
  }

  return obj;
}

function getComponents(...components) {
  return components.filter(Boolean);
}

function execSimple(nObject, delivered, node, tag, components, children) {
  const {
    iRender
  } = nObject;
  const slotMap = Object.create(null);
  getSlots(iRender, children, slotMap);
  const slots = setSlots(slotMap);
  const event = new EventEmitter();
  event.updateInProps(node.props);
  const context = initContext({
    slots,
    created: false,
    parent: nObject.exposed,
    delivered,
    children: new Set(),
    childNodes: children,

    refresh(f) {
      nObject.refresh(f);
    },

    emit: event.emit
  });

  {
    getLabel();
  }

  const result = tag({ ...node.props
  }, context, auxiliary);
  let label;

  {
    label = getLabel();
  }

  const nodes = exec(nObject, delivered, renderNode(iRender, result, context, tag[renderSymbol]), slots, getComponents(...components, tag[componentsSymbol]));
  return { ...node,
    tag,
    children: Array.isArray(nodes) ? nodes : [nodes],
    label
  };
}

function execSlot(node, slots, children, args = [{}]) {
  var _node$props;

  const slotName = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.name) || 'default';
  const slot = slots[slotName];

  if (typeof slot === 'function') {
    return { ...node,
      ...slot(...args)
    };
  }

  const {
    render
  } = node;
  const label =  [`[${slotName}]`, '#00F'];
  return { ...node,
    tag: ScopeSlot,
    label,
    children: typeof render !== 'function' ? children : render(...args)
  };
}

function findComponent(tag, components$1) {
  if (!tag) {
    return null;
  }

  if (typeof tag !== 'string') {
    return tag;
  }

  if (tag === 'template') {
    return tag;
  }

  if (/^neep:.+/i.test(tag)) {
    return tag;
  }

  for (const list of components$1) {
    const component = list[tag];

    if (component) {
      return component;
    }
  }

  return components[tag] || tag;
}

function exec(nObject, delivered, node, slots, components, native = false) {
  if (Array.isArray(node)) {
    return node.map(n => exec(nObject, delivered, n, slots, components, native));
  }

  if (!isElement(node)) {
    return node;
  }

  const {
    inserted,
    args = [{}]
  } = node;
  let tag = findComponent(node.tag, components);

  if (tag === Deliver) {
    const props = { ...node.props
    };
    delete props.ref;
    delete props.slot;
    delete props.key;
    const newDelivered = Object.create(delivered);
    updateProps(newDelivered, props || {}, {}, true);
    return { ...node,
      tag,
      $__neep__delivered: newDelivered,
      children: node.children.map(n => exec(nObject, newDelivered, n, slots, components, native))
    };
  }

  const children = node.children.map(n => exec(nObject, delivered, n, slots, components, native));

  if (typeof tag === 'function') {
    if (tag[typeSymbol] === 'simple') {
      return execSimple(nObject, delivered, node, tag, components, children);
    }

    return { ...node,
      $__neep__delivered: delivered,
      children,
      tag
    };
  }

  if (tag === Slot) {
    tag = native ? 'slot' : ScopeSlot;
  }

  if (tag !== ScopeSlot || inserted) {
    return { ...node,
      children,
      tag
    };
  }

  return execSlot({ ...node,
    tag
  }, slots, children, args);
}

function renderNode(iRender, node, context, render) {
  if (Array.isArray(node)) {
    return node;
  }

  if (isElement(node)) {
    return [node];
  }

  if (node === undefined || node === null) {
    return [{
      [isElementSymbol]: true,
      tag: null,
      children: []
    }];
  }

  if (!iRender.isNode(node) && node && typeof node === 'object' && render) {
    node = render(node, context, auxiliary);
  }

  if (isElement(node)) {
    return [node];
  }

  if (node === undefined || node === null) {
    return [{
      [isElementSymbol]: true,
      tag: null,
      children: []
    }];
  }

  return [{
    [isElementSymbol]: true,
    tag: Value,
    value: node,
    children: []
  }];
}

function normalize(nObject, result) {
  const {
    component
  } = nObject;
  return exec(nObject, nObject.delivered, renderNode(nObject.iRender, result, nObject.context, component[renderSymbol]), nObject.context.slots, getComponents(component[componentsSymbol]), Boolean(nObject.native));
}

let delayedRefresh = 0;
const objectSet = new Set();
function wait(obj) {
  if (delayedRefresh <= 0) {
    return false;
  }

  objectSet.add(obj);
  return true;
}

function run() {
  if (delayedRefresh > 0) {
    return;
  }

  const list = [...objectSet];
  objectSet.clear();
  list.forEach(o => o.refresh());
}

async function asyncRefresh(f) {
  try {
    delayedRefresh++;
    return await f();
  } finally {
    delayedRefresh--;
    run();
  }
}

function refresh(f, async) {
  if (async) {
    return asyncRefresh(f);
  }

  try {
    delayedRefresh++;
    return f();
  } finally {
    delayedRefresh--;
    run();
  }
}

function createExposed(obj) {
  const cfg = {
    $parent: {
      configurable: true,
      get: () => {
        var _obj$parent;

        return (_obj$parent = obj.parent) === null || _obj$parent === void 0 ? void 0 : _obj$parent.exposed;
      }
    },
    $component: {
      configurable: true,
      value: null
    },
    $isContainer: {
      configurable: true,
      value: false
    },
    $created: {
      configurable: true,
      get: () => obj.created
    },
    $destroyed: {
      configurable: true,
      get: () => obj.destroyed
    },
    $mounted: {
      configurable: true,
      get: () => obj.mounted
    },
    $unmounted: {
      configurable: true,
      get: () => obj.unmounted
    }
  };
  const exposed = Object.create(null, cfg);
  return exposed;
}

let completeList;
function setCompleteList(list) {
  completeList = list;
}
function complete(it) {
  if (!completeList) {
    it();
  } else {
    completeList.push(it);
  }
}

function createEntity(obj) {
  const cfg = {
    exposed: {
      configurable: true,
      get: () => obj.exposed
    },
    delivered: {
      configurable: true,
      get: () => obj.delivered
    },
    parent: {
      configurable: true,
      get: () => {
        var _obj$parent2;

        return (_obj$parent2 = obj.parent) === null || _obj$parent2 === void 0 ? void 0 : _obj$parent2.entity;
      }
    },
    component: {
      configurable: true,
      value: null
    },
    isContainer: {
      configurable: true,
      value: false
    },
    created: {
      configurable: true,
      get: () => obj.created
    },
    destroyed: {
      configurable: true,
      get: () => obj.destroyed
    },
    mounted: {
      configurable: true,
      get: () => obj.mounted
    },
    unmounted: {
      configurable: true,
      get: () => obj.unmounted
    },
    $_hooks: {
      configurable: true,
      value: Object.create(null)
    },
    $_valueIndex: {
      configurable: true,
      value: 0,
      writable: true
    },
    $_values: {
      configurable: true,
      value: []
    },
    callHook: {
      configurable: true,

      value(h) {
        callHook(h, entity);
      }

    },
    setHook: {
      configurable: true,

      value(id, hook) {
        return setHook(id, hook, entity);
      }

    },
    refresh: {
      configurable: true,
      value: obj.refresh.bind(obj)
    },
    on: {
      configurable: true,
      value: obj.on
    },
    emit: {
      configurable: true,
      value: obj.emit
    },
    config: {
      configurable: true,
      value: obj.config
    }
  };
  const entity = Object.create(null, cfg);
  return entity;
}

class NeepObject {
  constructor(iRender, parent, delivered = (parent === null || parent === void 0 ? void 0 : parent.delivered) || Object.create(null), container) {
    _defineProperty(this, "events", new EventEmitter());

    _defineProperty(this, "emit", this.events.emit);

    _defineProperty(this, "on", this.events.on);

    _defineProperty(this, "eventCancelHandles", new Set());

    _defineProperty(this, "iRender", void 0);

    _defineProperty(this, "components", Object.create(null));

    _defineProperty(this, "config", Object.create(null));

    _defineProperty(this, "parentDelivered", void 0);

    _defineProperty(this, "delivered", void 0);

    _defineProperty(this, "exposed", createExposed(this));

    _defineProperty(this, "entity", createEntity(this));

    _defineProperty(this, "parent", void 0);

    _defineProperty(this, "native", void 0);

    _defineProperty(this, "created", false);

    _defineProperty(this, "destroyed", false);

    _defineProperty(this, "mounted", false);

    _defineProperty(this, "unmounted", false);

    _defineProperty(this, "children", new Set());

    _defineProperty(this, "tree", []);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "_render", () => []);

    _defineProperty(this, "_needRefresh", false);

    _defineProperty(this, "_delayedRefresh", 0);

    _defineProperty(this, "_refreshing", false);

    _defineProperty(this, "_nodes", []);

    _defineProperty(this, "childNodes", []);

    _defineProperty(this, "__executed_destroy", false);

    _defineProperty(this, "__executed_mount", false);

    _defineProperty(this, "__executed_mounted", false);

    _defineProperty(this, "_cancelDrawMonitor", void 0);

    this.iRender = iRender;
    this.parentDelivered = delivered;
    this.delivered = Object.create(delivered);

    if (parent) {
      this.parent = parent;
    }

    this.container = container || this;
  }

  get canRefresh() {
    if (wait(this)) {
      return false;
    }

    return !this._delayedRefresh;
  }

  get needRefresh() {
    if (wait(this)) {
      return false;
    }

    if (this._delayedRefresh) {
      return false;
    }

    const needRefresh = this._needRefresh;
    this._needRefresh = false;
    return needRefresh;
  }

  requestDraw() {}

  async asyncRefresh(f) {
    try {
      this._delayedRefresh++;
      return await f();
    } finally {
      this._delayedRefresh--;
      this.refresh();
    }
  }

  refresh(f, async) {
    if (typeof f === 'function') {
      if (async) {
        return this.asyncRefresh(f);
      }

      try {
        this._delayedRefresh++;
        return f();
      } finally {
        this._delayedRefresh--;

        if (this._delayedRefresh <= 0) {
          this.refresh();
        }
      }
    }

    if (this.destroyed) {
      return;
    }

    this._needRefresh = true;

    if (!this.created) {
      return;
    }

    if (this._refreshing) {
      return;
    }

    this._refreshing = true;
    let nodes;

    while (this.needRefresh) {
      nodes = this._render();

      if (this.destroyed) {
        return;
      }
    }

    this._refreshing = false;

    if (!this.canRefresh) {
      return;
    }

    if (!nodes) {
      return;
    }

    this._nodes = convert(this, nodes, this._nodes);

    if (!this.mounted) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    if (this.unmounted) {
      return;
    }

    this.requestDraw();
  }

  callHook(id) {
    callHook(id, this.entity);
  }

  _update(props, children) {
    this.childNodes = children;
  }

  update(props, children) {
    this._update(props, children);
  }

  _destroy() {}

  destroy() {
    if (this.__executed_destroy) {
      return;
    }

    this.__executed_destroy = true;
    this.callHook('beforeDestroy');

    this._destroy();

    this.callHook('destroyed');
    this.destroyed = true;
  }

  _mount() {}

  mount() {
    if (this.__executed_destroy) {
      return;
    }

    if (this.__executed_mount) {
      return;
    }

    this.__executed_mount = true;
    this.callHook('beforeMount');
    const result = monitorable.exec(c => c && this.requestDraw(), () => {
      this._mount();

      this.mounted = true;
    });
    this._cancelDrawMonitor = result.stop;
    complete(() => this.callHook('mounted'));
  }

  _unmount() {}

  unmount() {
    if (!this.mounted) {
      return;
    }

    if (this.__executed_mounted) {
      return;
    }

    this.__executed_mounted = true;
    this.callHook('beforeUnmount');

    this._unmount();

    this.callHook('unmounted');
    this.unmounted = true;
  }

  _draw() {}

  draw() {
    var _this$_cancelDrawMoni;

    if (this.__executed_destroy) {
      return;
    }

    (_this$_cancelDrawMoni = this._cancelDrawMonitor) === null || _this$_cancelDrawMoni === void 0 ? void 0 : _this$_cancelDrawMoni.call(this);
    this.callHook('beforeUpdate');
    const result = monitorable.exec(c => c && this.requestDraw(), () => this._draw());
    this._cancelDrawMonitor = result.stop;
    complete(() => this.callHook('updated'));
  }

}

function update(nObject, props, children) {
  updateProps(nObject.props, props);
  nObject.events.updateInProps(props);
  const slots = Object.create(null);
  const {
    native
  } = nObject;
  const childNodes = getSlots(nObject.iRender, children, slots, Boolean(native));
  setSlots(slots, nObject.slots);

  if (!native) {
    return;
  }

  nObject.nativeNodes = convert(nObject, childNodes, nObject.nativeNodes);

  if (!nObject.mounted) {
    return;
  }

  nObject.requestDraw();
}

function createContext(nObject) {
  return initContext({
    slots: nObject.slots,

    get created() {
      return nObject.created;
    },

    get parent() {
      return nObject.parent.exposed;
    },

    get delivered() {
      return nObject.parentDelivered;
    },

    get children() {
      return nObject.children;
    },

    get childNodes() {
      return nObject.childNodes;
    },

    get emit() {
      return nObject.emit;
    },

    refresh(f) {
      nObject.refresh(f);
    }

  }, nObject.exposed);
}

function initRender(nObject) {
  const {
    component,
    props,
    context,
    entity
  } = nObject;

  const refresh = changed => changed && nObject.refresh();

  const result = monitorable.exec(refresh, () => setCurrent(() => component(props, context, auxiliary), entity), {
    resultOnly: true
  });

  if (typeof result === 'function') {
    const render = monitorable.createExecutable(refresh, () => normalize(nObject, result()));
    return {
      nodes: render(),
      render,
      stopRender: () => render.stop()
    };
  }

  const render = monitorable.createExecutable(refresh, () => normalize(nObject, setCurrent(() => component(props, context, auxiliary), entity)));
  return {
    nodes: monitorable.exec(refresh, () => normalize(nObject, result), {
      resultOnly: true
    }),
    render,
    stopRender: () => render.stop()
  };
}

class Entity extends NeepObject {
  constructor(component, props, children, parent, delivered) {
    var _this$iRender$compone, _this$iRender;

    super(parent.iRender, parent, delivered, parent.container);

    _defineProperty(this, "component", void 0);

    _defineProperty(this, "props", monitorable.encase(Object.create(null)));

    _defineProperty(this, "slots", monitorable.encase(Object.create(null)));

    _defineProperty(this, "_stopRender", void 0);

    _defineProperty(this, "nativeNodes", void 0);

    _defineProperty(this, "shadowTree", []);

    _defineProperty(this, "nativeTree", []);

    _defineProperty(this, "_shadow", void 0);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "parent", void 0);

    this.component = component;
    Object.assign(this.config, component[configSymbol]);
    Object.assign(this.components, component[componentsSymbol]);
    Reflect.defineProperty(this.exposed, '$component', {
      value: component,
      enumerable: true,
      configurable: true
    });
    [this.native, this._shadow] = component[typeSymbol] === 'native' && ((_this$iRender$compone = (_this$iRender = this.iRender).component) === null || _this$iRender$compone === void 0 ? void 0 : _this$iRender$compone.call(_this$iRender)) || [];
    this.parent = parent;
    parent.children.add(this.exposed);
    const context = createContext(this);
    this.context = context;
    this.callHook('beforeCreate');
    this.childNodes = children;
    refresh(() => update(this, props, children));
    const {
      render,
      nodes,
      stopRender
    } = initRender(this);
    this._render = render;
    this._stopRender = stopRender;
    this._nodes = convert(this, nodes);
    this.callHook('created');
    this.created = true;

    if (this._needRefresh) {
      this.refresh();
    }
  }

  _update(props, children) {
    if (this.destroyed) {
      return;
    }

    this.childNodes = children;
    refresh(() => update(this, props, children));
  }

  _destroy() {
    if (this._stopRender) {
      this._stopRender();
    }

    this.parent.children.delete(this.exposed);
    destroy(this._nodes);
  }

  requestDraw() {
    this.container.markDraw(this);
  }

  _draw() {
    const {
      nativeNodes,
      iRender,
      _shadow,
      native
    } = this;

    if (!native || !nativeNodes || !_shadow) {
      this.tree = draw(iRender, this._nodes, this.tree);
      return;
    }

    this.shadowTree = draw(iRender, this._nodes, this.shadowTree);
    this.nativeTree = draw(iRender, nativeNodes, this.nativeTree);
  }

  _mount() {
    const {
      nativeNodes,
      iRender,
      _shadow,
      native,
      _nodes
    } = this;

    if (!native || !nativeNodes || !_shadow) {
      this.tree = draw(iRender, _nodes);
      return;
    }

    this.tree = draw(iRender, convert(this, native));
    this.shadowTree = draw(iRender, _nodes);

    for (const it of getNodes(this.shadowTree)) {
      iRender.insert(_shadow, it);
    }

    this.nativeTree = draw(iRender, nativeNodes);

    for (const it of getNodes(this.nativeTree)) {
      iRender.insert(native, it);
    }
  }

  _unmount() {
    const {
      iRender,
      nativeTree
    } = this;
    unmount(iRender, this.tree);

    if (!nativeTree) {
      return;
    }

    unmount(iRender, nativeTree);
  }

}

function toElement(t) {
  if (t === false || t === null || t === undefined) {
    return null;
  }

  if (isElement(t)) {
    return t;
  }

  return {
    [isElementSymbol]: true,
    tag: Value,
    key: t,
    value: t,
    children: []
  };
}

function destroy(tree) {
  if (Array.isArray(tree)) {
    tree.forEach(t => destroy(t));
    return;
  }

  const {
    component
  } = tree;

  if (component) {
    component.destroy();
  }
}

function createItem$1(nObject, source) {
  if (!source) {
    return {
      tag: null,
      children: []
    };
  }

  const {
    tag
  } = source;

  if (!tag) {
    return {
      tag: null,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: convert(nObject, source.children),
        component: undefined
      };
    }

    return { ...source,
      children: [],
      component: new Entity(tag, source.props || {}, source.children, nObject, source.$__neep__delivered)
    };
  }

  if (tag === Container) {
    var _source$props;

    const type = source === null || source === void 0 ? void 0 : (_source$props = source.props) === null || _source$props === void 0 ? void 0 : _source$props.type;
    const iRender = type ? getRender(type) : nObject.iRender;
    return { ...source,
      children: [],
      component: new Container$1(iRender, source.props || {}, source.children, nObject, source.$__neep__delivered)
    };
  }

  if (tag === Value) {
    return { ...source,
      children: []
    };
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return { ...source,
      children: convert(nObject, source.children)
    };
  }

  return { ...source,
    children: convert(nObject, source.children)
  };
}

function updateList$1(nObject, source, tree) {
  if (!Array.isArray(tree)) {
    tree = [tree];
  }

  const newList = [];

  for (const src of recursive2iterable(source)) {
    const node = toElement(src);

    if (!node) {
      continue;
    }

    const index = tree.findIndex(it => it.tag === node.tag && it.key === node.key);

    if (index >= 0) {
      newList.push(updateItem$1(nObject, node, tree[index]));
      tree.splice(index, 1);
    } else {
      newList.push(createItem$1(nObject, node));
    }
  }

  destroy(tree);
  return newList;
}

function updateItem$1(nObject, source, tree) {
  if (!tree) {
    return createItem$1(nObject, source);
  }

  if (!source) {
    destroy(tree);
    return {
      tag: null,
      children: []
    };
  }

  if (Array.isArray(tree)) {
    if (!tree.length) {
      return createItem$1(nObject, source);
    }

    const index = tree.findIndex(it => it.tag === source.tag);

    if (index < 0) {
      destroy(tree);
      return createItem$1(nObject, source);
    }

    const all = tree;
    [tree] = tree.splice(index, 1);
    destroy(all);
  }

  const {
    tag
  } = source;

  if (tag !== tree.tag) {
    destroy(tree);
    return createItem$1(nObject, source);
  }

  if (!tag) {
    return {
      tag: null,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: convert(nObject, source.children, tree.children),
        component: undefined
      };
    }

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  if (tag === Container) {
    var _source$props2;

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, source);
    }

    const type = source === null || source === void 0 ? void 0 : (_source$props2 = source.props) === null || _source$props2 === void 0 ? void 0 : _source$props2.type;
    const iRender = type ? getRender(type) : nObject.iRender;

    if (iRender !== component.iRender) {
      return createItem$1(nObject, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  if (tag === Value) {
    return { ...source,
      children: []
    };
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    let delivered;

    if (Deliver === tag) {
      const props = { ...source.props
      };
      delete props.ref;
      delete props.slot;
      delete props.key;
      delivered = updateProps(tree.$__neep__delivered, props, tree.props, true);
    }

    return { ...source,
      $__neep__delivered: delivered,
      children: convert(nObject, source.children, tree.children)
    };
  }

  return { ...source,
    children: convert(nObject, source.children, tree.children)
  };
}

function createAll$1(nObject, source) {
  if (!source.length) {
    return [];
  }

  return source.map(item => {
    if (!Array.isArray(item)) {
      return createItem$1(nObject, toElement(item));
    }

    return [...recursive2iterable(item)].map(it => createItem$1(nObject, toElement(it)));
  });
}

function* updateAll$1(nObject, source, tree) {
  let index = 0;
  let length = Math.min(source.length, source.length);

  for (; index < length; index++) {
    const src = source[index];

    if (Array.isArray(src)) {
      yield updateList$1(nObject, src, tree[index]);
    } else {
      yield updateItem$1(nObject, toElement(src), tree[index]);
    }
  }

  length = Math.max(source.length, source.length);

  if (tree.length > length) {
    for (; index < length; index++) {
      destroy(tree[index]);
    }
  }

  if (source.length > length) {
    for (; index < length; index++) {
      const src = toElement(source[index]);

      if (Array.isArray(src)) {
        yield [...recursive2iterable(src)].map(it => createItem$1(nObject, it));
      } else {
        yield createItem$1(nObject, src);
      }
    }
  }
}

function convert(nObject, source, tree) {
  if (!Array.isArray(source)) {
    source = [source];
  }

  if (!tree) {
    return createAll$1(nObject, source);
  }

  return [...updateAll$1(nObject, source, tree)];
}

let awaitDraw = new Set();
let requested = false;

function markDraw(c) {
  awaitDraw.add(c);

  if (requested) {
    return;
  }

  requested = true;
  nextFrame(() => {
    requested = false;
    const list = [...awaitDraw];
    awaitDraw.clear();
    list.map(c => c.drawAll());
  });
}

class Container$1 extends NeepObject {
  constructor(iRender, props, children, parent, delivered) {
    super(iRender, parent, delivered);

    _defineProperty(this, "props", void 0);

    _defineProperty(this, "content", []);

    _defineProperty(this, "_node", null);

    _defineProperty(this, "_container", null);

    _defineProperty(this, "rootContainer", this);

    _defineProperty(this, "_drawChildren", false);

    _defineProperty(this, "_drawContainer", false);

    _defineProperty(this, "_awaitDraw", new Set());

    _defineProperty(this, "_needDraw", false);

    _defineProperty(this, "_containers", new Set());

    this.props = props;
    this.parent = parent;

    if (parent) {
      this.rootContainer = parent.container.rootContainer;
    }

    this.callHook('beforeCreate');

    this._render = () => children;

    this._nodes = convert(this, children);
    this.callHook('created');
    this.created = true;
  }

  setChildren(children) {
    if (this.destroyed) {
      return;
    }

    this.childNodes = children;

    this._render = () => children;

    this._drawChildren = true;
    this.refresh();
  }

  setProps(props) {
    if (this.destroyed) {
      return;
    }

    this.props = props;
    this._drawContainer = true;
    this.refresh();
  }

  update(props, children) {
    this.refresh(() => {
      this.setProps(props);
      this.setChildren(children);
    });
  }

  requestDraw() {
    this.markDraw(this);
  }

  _mount() {
    const {
      props,
      parent,
      iRender
    } = this;
    const content = draw(this.container.iRender, this._nodes);
    this.content = content;
    const [container, node] = iRender.mount(props, parent === null || parent === void 0 ? void 0 : parent.iRender);

    for (const it of getNodes(content)) {
      iRender.insert(container, it);
    }

    this.tree = [createMountedNode({
      tag: Value,
      component: undefined,
      node,
      value: node,
      children: []
    })];
    this._node = node;
    this._container = container;
  }

  _destroy() {
    destroy(this.content);
  }

  _unmount() {
    const {
      parent,
      iRender
    } = this;

    if (parent) {
      unmount(parent.iRender, this.tree);
    }

    iRender.unmount(this._container, this._node, Boolean(parent));
    unmount(this.iRender, this.content);
  }

  _draw() {
    const {
      _drawChildren: drawChildren,
      _drawContainer: drawContainer
    } = this;
    this._drawContainer = false;

    if (drawContainer) {
      var _this$parent;

      this.iRender.drawContainer(this._container, this._node, this.props, (_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.iRender);
    }

    if (this.parent && this.parent.iRender !== this.iRender) {
      return;
    }

    this._drawChildren = false;

    if (drawChildren) {
      this.content = draw(this.iRender, this._nodes, this.content);
    }
  }

  _drawSelf() {
    const {
      _drawChildren: drawChildren,
      _drawContainer: drawContainer
    } = this;
    this._needDraw = false;
    this._drawChildren = false;
    this._drawContainer = false;

    if (drawContainer) {
      var _this$parent2;

      this.iRender.drawContainer(this._container, this._node, this.props, (_this$parent2 = this.parent) === null || _this$parent2 === void 0 ? void 0 : _this$parent2.iRender, true);
    }

    if (drawChildren) {
      this.content = draw(this.iRender, this._nodes, this.content);
    }
  }

  drawSelf() {
    if (!this.mounted) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    this.callHook('beforeUpdate');
    monitorable.exec(c => c && this.markDraw(this), () => this._drawSelf());
    complete(() => this.callHook('updated'));
  }

  markDraw(nObject, remove = false) {
    var _this$parent3;

    if (((_this$parent3 = this.parent) === null || _this$parent3 === void 0 ? void 0 : _this$parent3.iRender) === this.iRender) {
      this.parent.container.markDraw(nObject, remove);
      return;
    }

    if (nObject === this && this.parent) {
      this.parent.container.markDraw(this, remove);
      this._needDraw = !remove;
    } else if (remove) {
      this._awaitDraw.delete(nObject);
    } else {
      this._awaitDraw.add(nObject);
    }

    this.rootContainer.markDrawContainer(this, !this._needDraw && !this._awaitDraw.size || this.destroyed);
  }

  drawContainer() {
    const {
      _node: node,
      _container: container,
      _awaitDraw: awaitDraw
    } = this;

    if (!node || !container) {
      return;
    }

    this.callHook('beforeDraw');
    const needDraw = this._needDraw;
    this._needDraw = false;
    const list = [...awaitDraw];
    awaitDraw.clear();

    if (needDraw) {
      this.drawSelf();
    }

    list.map(c => c.draw());
    this.iRender.draw(container, node);
    complete(() => this.callHook('drawn'));
  }

  markDrawContainer(container, remove = false) {
    if (remove) {
      this._containers.delete(container);
    } else {
      this._containers.add(container);
    }

    markDraw(this);
  }

  drawAll() {
    const containers = this._containers;

    if (!containers.size) {
      return;
    }

    this.callHook('beforeDrawAll');
    const refs = [];
    const completeList = [];
    setCompleteList(completeList);
    setRefList(refs);
    const list = [...containers];
    containers.clear();
    list.forEach(c => c.drawContainer());
    setRefList();
    refs.forEach(r => r());
    completeList.forEach(r => r());
    this.callHook('drawnAll');
  }

}

function render(e, p = {}) {
  let params = { ...p
  };
  const container = new Container$1(getRender(p.type), params, e === undefined ? [] : isElement(e) ? [e] : [createElement(e)]);

  {
    devtools.renderHook(container);
  }

  const {
    exposed
  } = container;
  Reflect.defineProperty(exposed, '$update', {
    value(c) {
      container.setChildren(c === undefined ? [] : isElement(c) ? [c] : [createElement(c)]);
      return exposed;
    },

    configurable: true
  });
  Reflect.defineProperty(exposed, '$mount', {
    value(target) {
      if (exposed.$mounted) {
        return exposed;
      }

      if (target) {
        params.target = target;
        container.setProps(params);
      }

      container.mount();
      return exposed;
    },

    configurable: true
  });
  Reflect.defineProperty(exposed, '$unmount', {
    value() {
      if (!exposed.$mounted) {
        return;
      }

      if (exposed.$unmounted) {
        return;
      }

      if (exposed.$destroyed) {
        return container.destroy();
      }

      container.unmount();
      return;
    },

    configurable: true
  });

  if (params.target) {
    container.mount();
  }

  return exposed;
}

function Mark(symbol, value) {
  return component => {
    component[symbol] = value;
    return component;
  };
}

function MarkValue(symbol, key, value) {
  return component => {
    let obj = component[symbol];

    if (!obj) {
      obj = Object.create(null);
      component[symbol] = obj;
    }

    obj[key] = value;
    return component;
  };
}

function mName(name, component) {
  if (!component) {
    return Mark(nameSymbol, name);
  }

  component[nameSymbol] = name;
  return component;
}
function mType(type, component) {
  if (!component) {
    return Mark(typeSymbol, type);
  }

  component[typeSymbol] = type;
  return component;
}
function mSimple(component) {
  if (!component) {
    return Mark(typeSymbol, 'simple');
  }

  component[typeSymbol] = 'simple';
  return component;
}
function mNative(component) {
  if (!component) {
    return Mark(typeSymbol, 'native');
  }

  component[typeSymbol] = 'native';
  return component;
}
function mRender(fn, component) {
  if (!component) {
    return Mark(renderSymbol, fn);
  }

  component[renderSymbol] = fn;
  return component;
}
function mConfig(name, config, component) {
  const mark = MarkValue(configSymbol, name, config);

  if (!component) {
    return mark;
  }

  return mark(component);
}
function mComponent(name, item, component) {
  const mark = MarkValue(componentsSymbol, name, item);

  if (!component) {
    return mark;
  }

  return mark(component);
}
function create(c, r) {
  if (typeof r === 'function') {
    c[renderSymbol] = r;
  }

  return c;
}
function mark(component, ...marks) {
  for (const m of marks) {
    m(component);
  }

  return component;
}

export { Container, Deliver, NeepError as Error, EventEmitter, Fragment, ScopeSlot, Slot, SlotRender, Tags, Template, Value, addContextConstructor, callHook, checkCurrent, componentsSymbol, computed, configSymbol, create, createElement, current, defineAuxiliary, deliver, elements, encase, expose, hook, install, isElement, isElementSymbol, isProduction, isValue, label$1 as label, mComponent, mConfig, mName, mNative, mRender, mSimple, mType, mark, mode, nameSymbol, recover, refresh, register, render, renderSymbol, setAuxiliary, setHook, setValue, typeSymbol, useValue, value, version, watch };
//# sourceMappingURL=neep.core.esm.js.map
