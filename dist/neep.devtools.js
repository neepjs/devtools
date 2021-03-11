/*!
 * NeepDevtools v0.1.0-alpha.10
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Neep = require('@neep/core');
var Neep__default = _interopDefault(Neep);

(function (Type) {
  Type["tag"] = "tag";
  Type["placeholder"] = "placeholder";
  Type["standard"] = "standard";
  Type["simple"] = "simple";
  Type["native"] = "native";
  Type["container"] = "container";
  Type["special"] = "special";
  Type["deliver"] = "deliver";
})(exports.Type || (exports.Type = {}));

function install() {
  return Neep.install;
}

const Deliver = Neep__default.createDeliverComponent({
  keys: {},
  selected: Neep.value(-1),
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
  return Neep.createElementBase('div', {
    style: `
			position: relative;
			min-height: 20px;
			font-size: 14px;
			line-height: 20px;
			padding-left: 20px;
			background: ${selected ? '#CCC' : ''};
		`
  }, Neep.createElementBase('div', {
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
  }, opened ? '-' : '+'), Neep.createElementBase('div', {
    'on:click': setSelected
  }, '<', Neep.createElementBase(Neep.Slot), getKey(key), '>', !hasChildNodes && Neep.createTemplateElement(opened ? Neep.createElementBase('span') : Neep.createElementBase('span', null, '...'), '</', Neep.createElementBase(Neep.Slot), '>')), hasChildNodes && Neep.createTemplateElement(Neep.createElementBase('div', {
    style: 'padding-left: 20px'
  }, childNodes), Neep.createElementBase('div', {
    'on-click': setSelected
  }, '</', Neep.createElementBase(Neep.Slot), '>')));
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
  return Neep.createElementBase('div', {
    style: `
				position: relative;
				min-height: 20px;
				font-size: 14px;
				line-height: 20px;
				padding-left: 20px;
				background: ${selected ? '#CCC' : ''};
			`
  }, Neep.createElementBase('div', {
    style: 'position: absolute; left: 0; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;',
    'on:click': switchOpen
  }, opened ? '-' : '+'), Neep.createElementBase('div', {
    'on:click': setSelected
  }, Neep.createElementBase('span', {
    style: 'font-style: italic;font-weight: bold;'
  }, '[Value]'), !hasChildNodes && Neep.createTemplateElement(opened ? Neep.createElementBase('span') : Neep.createElementBase('span', null, '...'), Neep.createElementBase('span', {
    style: 'font-style: italic;font-weight: bold;'
  }, '[/Value]'))), hasChildNodes && Neep.createTemplateElement(Neep.createElementBase('div', {
    style: 'padding-left: 20px'
  }, childNodes), Neep.createElementBase('div', {
    'on:click': setSelected,
    style: 'font-style: italic; font-weight: bold;'
  }, '[/Value]')));
}

function getType(proxy) {
  if (Neep.isProxy(proxy, 'component')) {
    return '';
  }

  if (Neep.isProxy(proxy, 'container')) {
    return 'container';
  }

  if (Neep.isProxy(proxy, 'deliver')) {
    return 'deliver';
  }

  if (Neep.isProxy(proxy, 'element')) {
    return 'native';
  }

  if (Neep.isProxy(proxy, 'shell')) {
    return 'shell';
  }

  if (Neep.isProxy(proxy, 'slot')) {
    return 'scopeSlot';
  }

  if (Neep.isSimpleComponent(proxy.tag)) {
    return 'simple';
  }

  if (Neep.isProxy(proxy, 'group')) {
    return 'group';
  }

  return null;
}

const render = Neep__default.createRenderComponent(({
  tagId,
  keys,
  selected,
  setSelected,
  switchOpen,
  options
}) => {
  const el = Neep.getNode(tagId);

  if (!el) {
    return null;
  }

  const selectedThis = selected.value === tagId;

  if (!el.proxy && !el.tag) {
    if (!options.placeholder) {
      return null;
    }

    return Neep.createElementBase('span', {
      'on:click': setSelected,
      style: `font-weight: bold; background: ${selectedThis ? '#CCC' : ''};`
    }, '[', el.tag === null ? 'Placeholder' : 'Native', ']');
  }

  const {
    proxy,
    tag
  } = el;

  if (tag === Neep.Render) {
    if (!options.slotRender) {
      return null;
    }

    return Neep.createElementBase('div', {
      'on:click': setSelected,
      key: tagId,
      style: `
					position: relative;
					min-height: 20px;
					font-size: 14px;
					line-height: 20px;
					background: ${selectedThis ? '#CCC' : ''};
				`
    }, '<', Neep.createElementBase('span', {
      style: 'font-style: italic;'
    }, 'Render'), getKey(el.key), '/>');
  }

  if (Neep.isProxy(proxy, 'value')) {
    if (!proxy.isValue) {
      const {
        text
      } = proxy;

      if (typeof text !== 'string') {
        return Neep.createTemplateElement(getChildTree(proxy));
      }

      if (!options.value) {
        return null;
      }

      return Neep.createTemplateElement(text);
    }

    if (!options.value) {
      if (typeof proxy.text === 'string') {
        return null;
      }

      return Neep.createTemplateElement(getChildTree(proxy));
    }

    return Neep.createElementBase(ValueTag, {
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
    return Neep.createTemplateElement(getChildTree(proxy));
  }

  let tagName = null;

  switch (type) {
    case '':
      tagName = Neep.createElementBase('span', {
        style: 'font-weight: bold;'
      }, getTagName(tag));
      break;

    case 'container':
      if (Neep.isContainerComponent(tag)) {
        tagName = Neep.createElementBase('span', {
          style: 'font-style: italic;font-weight: bold;'
        }, getTagName(tag));
      } else {
        tagName = Neep.createElementBase('span', {
          style: 'font-style: italic;'
        }, 'Container');
      }

      break;

    case 'deliver':
      tagName = Neep.createElementBase('span', {
        style: 'font-style: italic;'
      }, 'Deliver');
      break;

    case 'scopeSlot':
      tagName = Neep.createElementBase('span', {
        style: 'font-style: italic;'
      }, 'ScopeSlot');
      break;

    case 'group':
      tagName = Neep.createElementBase('span', {
        style: 'font-style: italic;'
      }, 'Template');
      break;

    case 'native':
      tagName = getTagName(tag);
      break;

    case 'shell':
      tagName = Neep.createElementBase('span', {
        style: 'text-decoration: underline;font-weight: bold;'
      }, getTagName(tag));
      break;

    case 'simple':
      tagName = Neep.createElementBase('span', {
        style: 'text-decoration: line-through;font-weight: bold;'
      }, getTagName(tag));
      break;
  }

  return Neep.createElementBase(NodeTag, {
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
  } = Neep__default.withDelivered(Deliver);

  function setSelected() {
    selected.value = selected.value === tagId ? -1 : tagId;
  }

  function switchOpen() {
    keys[tagId] = !keys[tagId];
  }

  return render({
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
  const childNodes = proxy.content.flat(Infinity).map(t => Neep.createElementBase(TreeNode, {
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

  if (Neep.isDeliverComponent(tag)) {
    return 'Deliver';
  }

  return tag[Neep.nameSymbol] || tag.name;
}

var Tree = (props => {
  const value = {
    keys: Neep.encase({}),
    options: props.options,
    selected: props.selected
  };
  return Neep.createRenderElement(() => Neep.createElementBase(Deliver, {
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
    return Neep.createElementBase('span', {
      style: 'font-weight: bold;'
    }, '[Function]');
  }

  if (type === 'string') {
    return Neep.createElementBase('span', null, value);
  }

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || value === null) {
    return Neep.createElementBase('span', {
      style: 'font-style: italic;'
    }, String(value));
  } else if (value instanceof RegExp) {
    return Neep.createElementBase('span', {
      style: 'font-weight: bold;'
    }, String(value));
  } else if (value instanceof Date) {
    return Neep.createElementBase('span', {
      style: 'font-weight: bold;'
    }, value.toISOString());
  } else if (type === 'object') {
    return Neep.createElementBase('span', {
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

  if (Neep.isValue(p)) {
    propIsValue = true;
    p = p();
  }

  return Neep.createElementBase('div', null, key, ': ', propIsValue && Neep.createElementBase('span', {
    style: 'font-weight: bold;'
  }, '[Value: '), getValue(p), propIsValue && Neep.createElementBase('span', {
    style: 'font-weight: bold;'
  }, ' ]'));
}

function Attr({
  selected
}) {
  const element = Neep.getNode(selected.value);

  if (!element) {
    return Neep.createElementBase('temlpate');
  }

  const {
    props = {}
  } = element;
  return Neep.createElementBase('div', null, Neep.createElementBase('div', null, 'key:', getKeyValue(element.key)), Neep.createElementBase('div', null, '属性: '), Object.keys(props).map(k => Neep.createElementBase(Prop, {
    'n:key': k,
    'key': k,
    props
  })));
}

function Settings (props) {
  const options = Neep.asValue(props.options);
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
  return Neep.createElementBase('div', null, Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: value
  }), 'value'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: tag
  }), 'tag'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: placeholder
  }), 'placeholder'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: simple
  }), 'simple'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: container
  }), 'container'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: scopeSlot
  }), 'scopeSlot'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: slotRender
  }), 'slotRender'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: deliver
  }), 'deliver'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: native
  }), 'native'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: group
  }), 'group'), Neep.createElementBase('label', null, Neep.createElementBase('input', {
    type: 'checkbox',
    checked: shell
  }), 'shell'));
}

function DefaultContainer(props) {
  return Neep.createElementBase('template', null, Neep.createElementBase(Neep.Slot, {
    name: 'settings'
  }), Neep.createElementBase(Neep.Slot, {
    name: 'tree'
  }), Neep.createElementBase(Neep.Slot, {
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
      const options = Neep.encase({});
      const selected = Neep.value(-1);
      Neep.render(Neep.createElementBase(currentContainer, {
        options
      }, Neep.createElementBase(Tree, {
        'n:slot': 'tree',
        container,
        options,
        selected
      }), Neep.createElementBase(Settings, {
        'n:slot': 'settings',
        options
      }), Neep.createElementBase(Attr, {
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

install()({
  devtools
});
function install$1(Neep) {}



var NeepDevtools = /*#__PURE__*/Object.freeze({
	__proto__: null,
	install: install$1,
	setContainer: setContainer,
	get Type () { return exports.Type; }
});

exports.default = NeepDevtools;
exports.install = install$1;
exports.setContainer = setContainer;
