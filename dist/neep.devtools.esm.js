/*!
 * NeepDevtools v0.1.0-alpha.10
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
import Neep from '@neep/core';

let Type;

(function (Type) {
  Type["tag"] = "tag";
  Type["placeholder"] = "placeholder";
  Type["standard"] = "standard";
  Type["simple"] = "simple";
  Type["native"] = "native";
  Type["container"] = "container";
  Type["special"] = "special";
  Type["deliver"] = "deliver";
})(Type || (Type = {}));

let nameSymbol;
let render;
let createElementBase;
let createRenderElement;
let createTemplateElement;
let isValue;
let encase;
let asValue;
let Slot;
let Container;
let Fragment;
let Render;
let ScopeSlot;
let value;
let computed;
let getNode;
let isDeliverComponent;
let isNativeComponent;
let isSimpleComponent;
let isContainerComponent;
let isProxy;
function install(Neep) {
  ({
    nameSymbol,
    render,
    createElementBase,
    createRenderElement,
    createTemplateElement,
    isValue,
    encase,
    asValue,
    Slot,
    Container,
    Fragment,
    Render,
    ScopeSlot,
    value,
    computed,
    getNode,
    isDeliverComponent,
    isNativeComponent,
    isSimpleComponent,
    isContainerComponent,
    isProxy
  } = Neep);
  return Neep.install;
}

const Deliver = Neep.createDeliverComponent({
  keys: {},
  selected: value(-1),
  options: {}
});

function NodeTag({
  proxy,
  key,
  switchOpen,
  opened,
  setSelected,
  selected
}) {
  const childNodes = opened ? getChildTree(proxy) : [];
  const hasChildNodes = Boolean(opened && childNodes.length);
  return createElementBase('div', {
    style: `
			position: relative;
			min-height: 20px;
			font-size: 14px;
			line-height: 20px;
			padding-left: 20px;
			background: ${selected ? '#CCC' : ''};
		`
  }, createElementBase('div', {
    style: `
			position: absolute;
			left: 0;
			top: 0;
			width: 20px;
			height: 20px;
			text-align: center;
			cursor: pointer;
			background: #DDD;
			`,
    'on:click': switchOpen
  }, opened ? '-' : '+'), createElementBase('div', {
    'on:click': setSelected
  }, '<', createElementBase(Slot), getKey(key), '>', !hasChildNodes && createTemplateElement(opened ? createElementBase('span') : createElementBase('span', null, '...'), '</', createElementBase(Slot), '>')), hasChildNodes && createTemplateElement(createElementBase('div', {
    style: 'padding-left: 20px'
  }, childNodes), createElementBase('div', {
    'on-click': setSelected
  }, '</', createElementBase(Slot), '>')));
}

function ValueTag({
  proxy,
  switchOpen,
  opened,
  setSelected,
  selected
}) {
  const {
    text
  } = proxy;
  const childNodes = opened ? typeof text === 'string' ? [text] : getChildTree(proxy) : [];
  const hasChildNodes = Boolean(opened && childNodes.length);
  return createElementBase('div', {
    style: `
				position: relative;
				min-height: 20px;
				font-size: 14px;
				line-height: 20px;
				padding-left: 20px;
				background: ${selected ? '#CCC' : ''};
			`
  }, createElementBase('div', {
    style: 'position: absolute; left: 0; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;',
    'on:click': switchOpen
  }, opened ? '-' : '+'), createElementBase('div', {
    'on:click': setSelected
  }, createElementBase('span', {
    style: 'font-style: italic;font-weight: bold;'
  }, '[Value]'), !hasChildNodes && createTemplateElement(opened ? createElementBase('span') : createElementBase('span', null, '...'), createElementBase('span', {
    style: 'font-style: italic;font-weight: bold;'
  }, '[/Value]'))), hasChildNodes && createTemplateElement(createElementBase('div', {
    style: 'padding-left: 20px'
  }, childNodes), createElementBase('div', {
    'on:click': setSelected,
    style: 'font-style: italic; font-weight: bold;'
  }, '[/Value]')));
}

function getType(proxy) {
  if (isProxy(proxy, 'component')) {
    return '';
  }

  if (isProxy(proxy, 'container')) {
    return 'container';
  }

  if (isProxy(proxy, 'deliver')) {
    return 'deliver';
  }

  if (isProxy(proxy, 'element')) {
    return 'native';
  }

  if (isProxy(proxy, 'shell')) {
    return 'shell';
  }

  if (isProxy(proxy, 'slot')) {
    return 'scopeSlot';
  }

  if (isSimpleComponent(proxy.tag)) {
    return 'simple';
  }

  if (isProxy(proxy, 'group')) {
    return 'group';
  }

  return null;
}

const render$1 = Neep.createRenderComponent(({
  tagId,
  keys,
  selected,
  setSelected,
  switchOpen,
  options
}) => {
  const el = getNode(tagId);

  if (!el) {
    return null;
  }

  const selectedThis = selected.value === tagId;

  if (!el.proxy && !el.tag) {
    if (!options.placeholder) {
      return null;
    }

    return createElementBase('span', {
      'on:click': setSelected,
      style: `font-weight: bold; background: ${selectedThis ? '#CCC' : ''};`
    }, '[', el.tag === null ? 'Placeholder' : 'Native', ']');
  }

  const {
    proxy,
    tag
  } = el;

  if (tag === Render) {
    if (!options.slotRender) {
      return null;
    }

    return createElementBase('div', {
      'on:click': setSelected,
      key: tagId,
      style: `
					position: relative;
					min-height: 20px;
					font-size: 14px;
					line-height: 20px;
					background: ${selectedThis ? '#CCC' : ''};
				`
    }, '<', createElementBase('span', {
      style: 'font-style: italic;'
    }, 'Render'), getKey(el.key), '/>');
  }

  if (isProxy(proxy, 'value')) {
    if (!proxy.isValue) {
      const {
        text
      } = proxy;

      if (typeof text !== 'string') {
        return createTemplateElement(getChildTree(proxy));
      }

      if (!options.value) {
        return null;
      }

      return createTemplateElement(text);
    }

    if (!options.value) {
      if (typeof proxy.text === 'string') {
        return null;
      }

      return createTemplateElement(getChildTree(proxy));
    }

    return createElementBase(ValueTag, {
      opened: keys[tagId],
      selected: selectedThis,
      setSelected: setSelected,
      proxy: proxy,
      switchOpen: switchOpen
    });
  }

  const type = getType(proxy);

  if (type === null) {
    return null;
  }

  if (type && !options[type]) {
    return createTemplateElement(getChildTree(proxy));
  }

  let tagName = null;

  switch (type) {
    case '':
      tagName = createElementBase('span', {
        style: 'font-weight: bold;'
      }, getTagName(tag));
      break;

    case 'container':
      if (isContainerComponent(tag)) {
        tagName = createElementBase('span', {
          style: 'font-style: italic;font-weight: bold;'
        }, getTagName(tag));
      } else {
        tagName = createElementBase('span', {
          style: 'font-style: italic;'
        }, 'Container');
      }

      break;

    case 'deliver':
      tagName = createElementBase('span', {
        style: 'font-style: italic;'
      }, 'Deliver');
      break;

    case 'scopeSlot':
      tagName = createElementBase('span', {
        style: 'font-style: italic;'
      }, 'ScopeSlot');
      break;

    case 'group':
      tagName = createElementBase('span', {
        style: 'font-style: italic;'
      }, 'Template');
      break;

    case 'native':
      tagName = getTagName(tag);
      break;

    case 'shell':
      tagName = createElementBase('span', {
        style: 'text-decoration: underline;font-weight: bold;'
      }, getTagName(tag));
      break;

    case 'simple':
      tagName = createElementBase('span', {
        style: 'text-decoration: line-through;font-weight: bold;'
      }, getTagName(tag));
      break;
  }

  return createElementBase(NodeTag, {
    key: el.key,
    opened: keys[tagId],
    selected: selectedThis,
    setSelected: setSelected,
    proxy: proxy,
    switchOpen: switchOpen
  }, tagName);
});
function TreeNode({
  tagId
}) {
  const {
    keys,
    selected,
    options
  } = Neep.withDelivered(Deliver);

  function setSelected() {
    selected.value = selected.value === tagId ? -1 : tagId;
  }

  function switchOpen() {
    keys[tagId] = !keys[tagId];
  }

  return render$1({
    keys,
    selected,
    tagId,
    setSelected,
    switchOpen,
    options
  });
}

function getKey(key) {
  if (typeof key === 'string') {
    return ` key=${JSON.stringify(key)}`;
  }

  if (typeof key === 'number') {
    return ` key=${key}`;
  }

  if (typeof key === 'boolean') {
    return ` key=${key}`;
  }

  if (typeof key === 'bigint') {
    return ` key=${key}`;
  }

  if (typeof key === 'symbol') {
    return ` key=${String(key)}`;
  }

  if (key === null) {
    return ` key=${key}`;
  }

  if (key !== undefined) {
    return ` key=${String(key)}`;
  }
}
function getChildTree(proxy) {
  const childNodes = proxy.content.flat(Infinity).map(t => createElementBase(TreeNode, {
    'n:key': t.id,
    tagId: t.id
  }));
  return childNodes;
}
function getTagName(tag) {
  if (!tag) {
    return '';
  }

  if (typeof tag === 'string') {
    return tag;
  }

  if (isDeliverComponent(tag)) {
    return 'Deliver';
  }

  return tag[nameSymbol] || tag.name;
}

var Tree = (props => {
  const value = {
    keys: encase({}),
    options: props.options,
    selected: props.selected
  };
  return createRenderElement(() => createElementBase(Deliver, {
    value: value
  }, getChildTree(props.container)));
});

function getKeyValue(key) {
  if (typeof key === 'string') {
    return JSON.stringify(key);
  }

  if (typeof key === 'number') {
    return `${key}`;
  }

  if (typeof key === 'boolean') {
    return `${key}`;
  }

  if (typeof key === 'bigint') {
    return `${key}`;
  }

  if (typeof key === 'symbol') {
    return `${String(key)}`;
  }

  if (key === null) {
    return `${key}`;
  }

  if (key !== undefined) {
    return `${String(key)}`;
  }
}
function getValue(value) {
  const type = typeof value;

  if (type === 'function') {
    return createElementBase('span', {
      style: 'font-weight: bold;'
    }, '[Function]');
  }

  if (type === 'string') {
    return createElementBase('span', null, value);
  }

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || value === null) {
    return createElementBase('span', {
      style: 'font-style: italic;'
    }, String(value));
  } else if (value instanceof RegExp) {
    return createElementBase('span', {
      style: 'font-weight: bold;'
    }, String(value));
  } else if (value instanceof Date) {
    return createElementBase('span', {
      style: 'font-weight: bold;'
    }, value.toISOString());
  } else if (type === 'object') {
    return createElementBase('span', {
      style: 'font-style: italic;'
    }, String(value));
  }

  return null;
}

function Prop ({
  props,
  key
}) {
  let p = props[key];
  let propIsValue = false;

  if (isValue(p)) {
    propIsValue = true;
    p = p();
  }

  return createElementBase('div', null, key, ': ', propIsValue && createElementBase('span', {
    style: 'font-weight: bold;'
  }, '[Value: '), getValue(p), propIsValue && createElementBase('span', {
    style: 'font-weight: bold;'
  }, ' ]'));
}

function Attr({
  selected
}) {
  const element = getNode(selected.value);

  if (!element) {
    return createElementBase('temlpate');
  }

  const {
    props = {}
  } = element;
  return createElementBase('div', null, createElementBase('div', null, 'key:', getKeyValue(element.key)), createElementBase('div', null, '属性: '), Object.keys(props).map(k => createElementBase(Prop, {
    'n:key': k,
    'key': k,
    props
  })));
}

function Settings (props) {
  const options = asValue(props.options);
  const value = options('value');
  const tag = options('tag');
  const placeholder = options('placeholder');
  const simple = options('simple');
  const container = options('container');
  const scopeSlot = options('scopeSlot');
  const slotRender = options('slotRender');
  const deliver = options('deliver');
  const native = options('native');
  const group = options('group');
  const shell = options('shell');
  return createElementBase('div', null, createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: value
  }), 'value'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: tag
  }), 'tag'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: placeholder
  }), 'placeholder'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: simple
  }), 'simple'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: container
  }), 'container'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: scopeSlot
  }), 'scopeSlot'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: slotRender
  }), 'slotRender'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: deliver
  }), 'deliver'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: native
  }), 'native'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: group
  }), 'group'), createElementBase('label', null, createElementBase('input', {
    type: 'checkbox',
    checked: shell
  }), 'shell'));
}

function DefaultContainer(props) {
  return createElementBase('template', null, createElementBase(Slot, {
    name: 'settings'
  }), createElementBase(Slot, {
    name: 'tree'
  }), createElementBase(Slot, {
    name: 'attr'
  }));
}

let currentContainer = DefaultContainer;
function setContainer(container) {
  currentContainer = typeof container === 'function' ? container : DefaultContainer;
}

let creating = false;
function renderHook(rootEntity, container) {
  if (creating) {
    return;
  }

  rootEntity.setHook('mounted', () => {
    creating = true;

    try {
      const options = encase({});
      const selected = value(-1);
      render(createElementBase(currentContainer, {
        options
      }, createElementBase(Tree, {
        'n:slot': 'tree',
        container,
        options,
        selected
      }), createElementBase(Settings, {
        'n:slot': 'settings',
        options
      }), createElementBase(Attr, {
        'n:slot': 'attr',
        selected
      }))).mount();
    } finally {
      creating = false;
    }
  });
}

const devtools = {
  renderHook
};

function install$1(Neep) {
  install(Neep)({
    devtools
  });
}



var NeepDevtools = /*#__PURE__*/Object.freeze({
	__proto__: null,
	install: install$1,
	setContainer: setContainer,
	get Type () { return Type; }
});

export default NeepDevtools;
export { Type, install$1 as install, setContainer };
