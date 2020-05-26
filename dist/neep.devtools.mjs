/*!
 * NeepDevtools v0.1.0-alpha.7
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import { install as install$2, nameSymbol, typeSymbol, createElement, isValue, Slot, encase, asValue, setHook, render } from '@neep/core';

function install() {
  return install$2;
}

let Type;

(function (Type) {
  Type["tag"] = "tag";
  Type["placeholder"] = "placeholder";
  Type["standard"] = "standard";
  Type["simple"] = "simple";
  Type["native"] = "native";
  Type["container"] = "container";
  Type["special"] = "special";
})(Type || (Type = {}));

function* getTree(tree, parent = 0) {
  var _component$exposed;

  if (Array.isArray(tree)) {
    for (const it of tree) {
      yield* getTree(it);
    }

    return;
  }

  const {
    id: tagId,
    tag,
    props,
    children,
    key,
    component,
    label = component === null || component === void 0 ? void 0 : (_component$exposed = component.exposed) === null || _component$exposed === void 0 ? void 0 : _component$exposed.$label
  } = tree;

  if (!tag) {
    return yield {
      tagId,
      parent,
      type: Type.placeholder,
      tag: 'placeholder',
      children: []
    };
  }

  if (typeof tag !== 'string') {
    const name = tag[nameSymbol] || tag.name;

    if (!component) {
      return yield {
        tagId,
        parent,
        type: Type.simple,
        tag: name,
        children: [...getTree(children)],
        props,
        key,
        label
      };
    }

    const isNative = tag[typeSymbol] === 'native';
    return yield {
      tagId,
      parent,
      type: isNative ? Type.native : Type.standard,
      tag: name,
      children: [...getTree(isNative ? component.nativeTree : component.tree)],
      props,
      key,
      label
    };
  }

  const ltag = tag.toLowerCase();

  if (ltag === 'neep:container') {
    return yield {
      tagId,
      parent,
      type: Type.container,
      tag: ltag,
      children: [...getTree(component ? component.content : children)],
      props,
      key,
      label
    };
  }

  if (ltag === 'neep:value') {
    const treeValue = tree.value;
    return yield {
      tagId,
      parent,
      type: Type.special,
      tag: ltag,
      children: [],
      isNative: treeValue === tree.node,
      value: treeValue,
      props,
      key,
      label
    };
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return yield {
      tagId,
      parent,
      type: Type.special,
      tag: ltag,
      children: [...getTree(children)],
      props,
      key,
      label
    };
  }

  yield {
    tagId,
    parent,
    type: Type.tag,
    tag,
    children: [...getTree(children)],
    props,
    key,
    label
  };
}

function getValue(value) {
  const type = typeof value;

  if (type === 'function') {
    return createElement("span", {
      style: "font-weight: bold;"
    }, "[Function]");
  }

  if (type === 'string') {
    return createElement("span", null, value);
  }

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || value === null) {
    return createElement("span", {
      style: "font-style: italic;"
    }, String(value));
  } else if (value instanceof RegExp) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, String(value));
  } else if (value instanceof Date) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, value.toISOString());
  } else if (type === 'object') {
    return createElement("span", {
      style: "font-style: italic;"
    }, String(value));
  }

  return null;
}
function TextNode({
  isNative,
  value
}) {
  if (isNative) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, "[Native]");
  }

  if (!isValue(value)) {
    return getValue(value);
  }

  return createElement("template", null, createElement("span", {
    style: "font-weight: bold;"
  }, "[Value:\xA0"), getValue(value()), createElement("span", {
    style: "font-weight: bold;"
  }, "\xA0]"));
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
function getLabels(labels) {
  return labels.filter(Boolean).map(([v, color]) => createElement("span", {
    style: `color: ${color || '#000'}`
  }, v));
}

function Tag({
  keys,
  tagId,
  key,
  labels,
  options,
  children
}) {
  const opened = keys[tagId];
  const childNodes = opened ? [...getList(children, keys, options)] : [];
  const hasChildNodes = Boolean(opened && childNodes.length);
  return createElement("div", {
    key: tagId,
    style: " position: relative; min-height: 20px; font-size: 14px; line-height: 20px; "
  }, createElement("div", {
    style: " position: absolute; left: -20px; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;; ",
    onclick: () => keys[tagId] = !opened
  }, opened ? '-' : '+'), createElement("div", null, '<', createElement(Slot, null), getKey(key), '>', !hasChildNodes && createElement("template", null, opened ? createElement("span", null) : createElement("span", {
    onclick: () => keys[tagId] = true,
    style: "cursor: pointer;"
  }, "..."), '</', createElement(Slot, null), '>'), getLabels(labels)), hasChildNodes && createElement("template", null, createElement("div", {
    style: "padding-left: 20px"
  }, childNodes), createElement("div", null, '</', createElement(Slot, null), '>')));
}

function PlaceholderTag({
  name = 'placeholder',
  tagId,
  key,
  labels
}) {
  return createElement("div", {
    key: tagId,
    style: " position: relative; min-height: 20px; font-size: 14px; line-height: 20px; "
  }, '<', createElement("span", {
    style: "font-style: italic;"
  }, name), getKey(key), '/>', getLabels(labels));
}

function* getList(list, keys, options, labels = []) {
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
    isNative
  } = list;
  const labelList = [label, ...labels];

  if (type === Type.standard || type === Type.native) {
    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: "font-weight: bold;"
    }, tag));
  }

  if (type === Type.tag) {
    if (!options.tag) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, tag);
  }

  if (type === Type.simple) {
    if (!options.simple) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: " font-style: italic; font-weight: bold; "
    }, tag));
  }

  if (type === Type.placeholder) {
    if (!options.placeholder) {
      return;
    }

    return yield createElement(PlaceholderTag, {
      tagId: tagId,
      key: key,
      labels: labelList
    });
  }

  if (type === Type.container) {
    if (!options.container) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: "font-style: italic;"
    }, "container"));
  }

  if (tag === 'neep:deliver') {
    if (!options.deliver) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: "font-style: italic;"
    }, "Deliver"));
  }

  if (tag === 'template') {
    if (!options.template) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: "font-style: italic;"
    }, "Template"));
  }

  if (tag === 'neep:scopeslot' || tag === 'neep:scope-slot') {
    if (!options.scopeSlot) {
      return yield* getList(children, keys, options, labelList);
    }

    return yield createElement(Tag, {
      keys: keys,
      tagId: tagId,
      key: key,
      labels: labelList,
      options: options,
      children: children
    }, createElement("span", {
      style: "font-style: italic;"
    }, "ScopeSlot"));
  }

  if (tag === 'neep:value') {
    if (!options.tag) {
      return;
    }

    if (!options.value) {
      return;
    }

    return yield createElement(TextNode, {
      isNative: isNative,
      value: value
    });
  }

  if (tag === 'neep:slotrender' || tag === 'neep:slot-render') {
    if (options.slotRender) {
      return yield createElement(PlaceholderTag, {
        tagId: tagId,
        key: key,
        labels: labelList,
        name: "SlotRender"
      });
    }

    return;
  }
}

var Tree = (props => {
  const keys = encase({});
  return () => createElement("div", {
    style: "padding-left: 20px;"
  }, [...getList(props.tree, keys, props.options)]);
});

function Devtools (props, {}) {
  return createElement("div", null, createElement(Slot, {
    name: "settings"
  }), createElement(Slot, {
    name: "tree"
  }));
}

function Settings (props) {
  const options = asValue(props.options);
  const value = options('value');
  const tag = options('tag');
  const placeholder = options('placeholder');
  const simple = options('simple');
  const container = options('container');
  const template = options('template');
  const scopeSlot = options('scopeSlot');
  const slotRender = options('slotRender');
  const deliver = options('deliver');
  return createElement("div", null, createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: value
  }), "value"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: tag
  }), "tag"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: placeholder
  }), "placeholder"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: simple
  }), "simple"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: container
  }), "container"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: template
  }), "template"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: scopeSlot
  }), "scopeSlot"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: slotRender
  }), "slotRender"), createElement("label", null, createElement("input", {
    type: "checkbox",
    checked: deliver
  }), "deliver"));
}

let creating = false;

function create() {
  creating = true;

  try {
    return {
      options: encase({
        value: false,
        tag: false,
        placeholder: false,
        simple: false,
        container: false,
        template: false,
        scopeSlot: false,
        slotRender: false,
        deliver: false
      }),
      exposed: render()
    };
  } finally {
    creating = false;
  }
}

function renderHook(container) {
  if (creating) {
    return;
  }

  let app;

  const getData = () => {
    if (!app) {
      app = create();
    }

    const tree = [...getTree(container.content)];
    app.exposed.$update(createElement(Devtools, null, createElement(Tree, {
      slot: "tree",
      tree: tree,
      options: app.options
    }), createElement(Settings, {
      slot: "settings",
      options: app.options
    })));
  };

  setHook('drawnAll', getData, container.entity);
  setHook('mounted', () => {
    if (!app) {
      app = create();
    }

    getData();
    app.exposed.$mount();
  }, container.entity);
}

const devtools = {
  renderHook
};

install()({
  devtools
});
function install$1(Neep) {}

export { install$1 as install };
