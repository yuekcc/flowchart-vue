import { openBlock, createElementBlock, normalizeStyle, createElementVNode, toDisplayString, renderSlot } from "vue";
var noop = { value: function() {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames$1(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function") select2 = arrayAll(select2);
  else select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$1(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant$1(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection_selection() {
  return this;
}
Selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection([[document.querySelector(selector2)]], [document.documentElement]) : new Selection([[selector2]], root);
}
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent) event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
const nonpassive = { passive: false };
const nonpassivecapture = { capture: true, passive: false };
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function nodrag(view) {
  var root2 = view.document.documentElement, selection = select(view).on("dragstart.drag", noevent, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection.on("selectstart.drag", noevent, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent, nonpassivecapture);
    setTimeout(function() {
      selection.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
const constant = (x) => () => x;
function DragEvent(type, {
  sourceEvent: sourceEvent2,
  subject,
  target,
  identifier,
  active,
  x,
  y,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x, enumerable: true, configurable: true },
    y: { value: y, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag() {
  var filter2 = defaultFilter, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag2(selection) {
    selection.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter2.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    nodrag(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter2.call(this, event, d)) return;
    var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag2,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null) return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type, event2, touch2) {
      var p0 = p, n;
      switch (type) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        case "drag":
          p = pointer(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event2,
          subject: s,
          target: drag2,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), drag2) : filter2;
  };
  drag2.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag2) : container;
  };
  drag2.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag2) : subject;
  };
  drag2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag2) : touchable;
  };
  drag2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag2 : value;
  };
  drag2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag2) : Math.sqrt(clickDistance2);
  };
  return drag2;
}
function distanceOfPointToLine(beginX, beginY, endX, endY, ptX, ptY) {
  const k = (endY - beginY || 1) / (endX - beginX || 1);
  const b = beginY - k * beginX;
  return Math.abs(k * ptX - ptY + b) / Math.sqrt(k * k + 1);
}
function between(num1, num2, num) {
  return num > num1 && num < num2 || num > num2 && num < num1;
}
function approximatelyEquals(n, m) {
  return Math.abs(m - n) <= 3;
}
function getEdgeOfPoints(points) {
  let minX = points.reduce((prev, point) => {
    return point.x < prev ? point.x : prev;
  }, Infinity);
  let maxX = points.reduce((prev, point) => {
    return point.x > prev ? point.x : prev;
  }, 0);
  let minY = points.reduce((prev, point) => {
    return point.y < prev ? point.y : prev;
  }, Infinity);
  let maxY = points.reduce((prev, point) => {
    return point.y > prev ? point.y : prev;
  }, 0);
  return { start: { x: minX, y: minY }, end: { x: maxX, y: maxY } };
}
function pointRectangleIntersection(p, r) {
  return p.x > r.start.x && p.x < r.end.x && p.y > r.start.y && p.y < r.end.y;
}
function roundTo20(number) {
  return number < 20 ? 20 : number;
}
function render(g, node, isSelected) {
  node.width = node.width || 120;
  node.height = node.height || 60;
  let header = null;
  let title = null;
  const theme = !node.theme ? {} : node.theme;
  const headerBackgroundColor = theme.headerBackgroundColor ? theme.headerBackgroundColor : "#f1f3f4";
  const bodyBackgroundColor = theme.bodyBackgroundColor ? theme.bodyBackgroundColor : "white";
  const bodyTextColor = theme.bodyTextColor ? theme.bodyTextColor : "black";
  const headerTextColor = theme.headerTextColor ? theme.headerTextColor : "black";
  let borderColor = isSelected ? "#666666" : "#bbbbbb";
  if (theme.borderColor) {
    if (isSelected) {
      borderColor = theme.borderColorSelected;
    } else {
      borderColor = theme.borderColor;
    }
  }
  if (node.type !== "start" && node.type !== "end") {
    header = g.append("rect").attr("x", node.x).attr("y", node.y).attr("stroke", borderColor).attr("class", "title").style("height", "20px").style("fill", headerBackgroundColor).style("stroke-width", "1px").style("width", node.width + "px");
    title = g.append("text").attr("fill", headerTextColor).attr("x", node.x + 4).attr("y", node.y + 15).attr("class", "unselectable").text(() => node.name).each(function wrap() {
      let self = select(this);
      let textLength = self.node().getComputedTextLength();
      let text2 = self.text();
      while (textLength > node.width - 2 * 4 && text2.length > 0) {
        text2 = text2.slice(0, -1);
        self.text(`${text2}...`);
        textLength = self.node().getComputedTextLength();
      }
    });
  }
  let body = g.append("rect").attr("class", "body");
  body.style("width", `${node.width}px`).style("fill", bodyBackgroundColor).style("stroke-width", "1px");
  if (node.type !== "start" && node.type !== "end") {
    body.attr("x", node.x).attr("y", node.y + 20);
    body.style("height", `${roundTo20(node.height - 20)}px`);
  } else {
    body.attr("x", node.x).attr("y", node.y).classed(node.type, true).attr("rx", 30);
    body.style("height", `${roundTo20(node.height)}px`);
  }
  body.attr("stroke", borderColor);
  let text = node.type === "start" ? "Start" : node.type === "end" ? "End" : !node.approvers || node.approvers.length === 0 ? "No approver" : node.approvers.length > 1 ? `${node.approvers[0].name}...` : node.approvers[0].name;
  let bodyTextY;
  if (node.type !== "start" && node.type !== "end") {
    bodyTextY = node.y + 25 + roundTo20(node.height - 20) / 2;
  } else {
    bodyTextY = node.y + 5 + roundTo20(node.height) / 2;
  }
  let content = g.append("text").attr("fill", bodyTextColor).attr("x", node.x + node.width / 2).attr("y", bodyTextY).attr("class", "unselectable").attr("text-anchor", "middle").text(() => text).each(function wrap() {
    let self = select(this);
    let textLength = self.node().getComputedTextLength();
    let text2 = self.text();
    while (textLength > node.width - 2 * 4 && text2.length > 0) {
      text2 = text2.slice(0, -1);
      self.text(`${text2}...`);
      textLength = self.node().getComputedTextLength();
    }
  });
  return { header, title, body, content };
}
function ifElementContainChildNode(parentSelector, checkedNode) {
  const parentElement = document.querySelector(parentSelector);
  const childrenNodes = Array.from(parentElement.childNodes);
  return childrenNodes.some((node) => node.contains(checkedNode));
}
function lineTo(g, x1, y1, x2, y2, lineWidth, strokeStyle, dash) {
  let sta = [x1, y1];
  let end = [x2, y2];
  let path = g.append("path").attr("stroke", strokeStyle).attr("stroke-width", lineWidth).attr("fill", "none").attr("d", `M ${sta[0]} ${sta[1]} L ${end[0]} ${end[1]}`);
  if (dash) {
    path.style("stroke-dasharray", dash.join(","));
  }
  return path;
}
function connect(g, x1, y1, x2, y2, startPosition, endPosition, lineWidth, strokeStyle, markered) {
  if (!endPosition) {
    endPosition = x1 > x2 ? "right" : "left";
  }
  let points = [];
  let start = [x1, y1];
  let end = [x2, y2];
  let centerX = start[0] + (end[0] - start[0]) / 2;
  let centerY = start[1] + (end[1] - start[1]) / 2;
  let second;
  let addVerticalCenterLine = () => {
    let third = [centerX, second[1]];
    let forth = [centerX, penult[1]];
    points.push(third);
    points.push(forth);
  };
  let addHorizontalCenterLine = () => {
    let third = [second[0], centerY];
    let forth = [penult[0], centerY];
    points.push(third);
    points.push(forth);
  };
  let addHorizontalTopLine = () => {
    points.push([second[0], start[1] - 50]);
    points.push([penult[0], start[1] - 50]);
  };
  let addHorizontalBottomLine = () => {
    points.push([second[0], start[1] + 50]);
    points.push([penult[0], start[1] + 50]);
  };
  let addVerticalRightLine = () => {
    points.push([start[0] + 80, second[1]]);
    points.push([start[0] + 80, penult[1]]);
  };
  let addVerticalLeftLine = () => {
    points.push([start[0] - 80, second[1]]);
    points.push([start[0] - 80, penult[1]]);
  };
  let addSecondXPenultY = () => {
    points.push([second[0], penult[1]]);
  };
  let addPenultXSecondY = () => {
    points.push([penult[0], second[1]]);
  };
  switch (startPosition) {
    case "left":
      second = [start[0] - 20, start[1]];
      break;
    case "top":
      second = [start[0], start[1] - 20];
      break;
    case "bottom":
      second = [start[0], start[1] + 20];
      break;
    default:
      second = [start[0] + 20, start[1]];
      break;
  }
  let penult = null;
  switch (endPosition) {
    case "right":
      penult = [end[0] + 20, end[1]];
      break;
    case "top":
      penult = [end[0], end[1] - 20];
      break;
    case "bottom":
      penult = [end[0], end[1] + 20];
      break;
    default:
      penult = [end[0] - 20, end[1]];
      break;
  }
  points.push(start);
  points.push(second);
  startPosition = startPosition || "right";
  endPosition = endPosition || "left";
  let direction = getDirection(x1, y1, x2, y2);
  if (direction.indexOf("r") > -1) {
    if (startPosition === "right" || endPosition === "left") {
      if (second[0] > centerX) {
        second[0] = centerX;
      }
      if (penult[0] < centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf("d") > -1) {
    if (startPosition === "bottom" || endPosition === "top") {
      if (second[1] > centerY) {
        second[1] = centerY;
      }
      if (penult[1] < centerY) {
        penult[1] = centerY;
      }
    }
  }
  if (direction.indexOf("l") > -1) {
    if (startPosition === "left" || endPosition === "right") {
      if (second[0] < centerX) {
        second[0] = centerX;
      }
      if (penult[0] > centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf("u") > -1) {
    if (startPosition === "top" || endPosition === "bottom") {
      if (second[1] < centerY) {
        second[1] = centerY;
      }
      if (penult[1] > centerY) {
        penult[1] = centerY;
      }
    }
  }
  switch (direction) {
    case "lu": {
      if (startPosition === "right") {
        switch (endPosition) {
          case "top":
          case "right":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "top":
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "top":
          case "right":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "top":
          case "right":
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      }
      break;
    }
    case "u":
      if (startPosition === "right") {
        switch (endPosition) {
          case "right": {
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "right": {
            addHorizontalCenterLine();
            break;
          }
          case "top":
            addVerticalRightLine();
            break;
        }
      } else {
        switch (endPosition) {
          case "left":
          case "right":
            break;
          default: {
            points.push([second[0], penult[1]]);
            break;
          }
        }
      }
      break;
    case "ru":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addVerticalCenterLine();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "top": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "right": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "left":
          case "top":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      }
      break;
    case "l":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addHorizontalBottomLine();
            break;
          }
          case "right": {
            addSecondXPenultY();
            break;
          }
          case "top": {
            addVerticalCenterLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addHorizontalTopLine();
            break;
          }
          case "right": {
            addSecondXPenultY();
            break;
          }
          case "top": {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "left": {
            addHorizontalTopLine();
            break;
          }
          case "right": {
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case "r":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            break;
          }
          case "right": {
            addHorizontalTopLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addSecondXPenultY();
            break;
          }
          case "right": {
            addHorizontalBottomLine();
            break;
          }
          case "top": {
            addVerticalCenterLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "right": {
            addHorizontalTopLine();
            break;
          }
          case "top": {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      }
      break;
    case "ld":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "top": {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addPenultXSecondY();
            break;
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "left":
          case "top":
            addPenultXSecondY();
            break;
          case "right": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case "d":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addHorizontalCenterLine();
            break;
          }
          case "right": {
            addPenultXSecondY();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;
          case "top": {
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addVerticalLeftLine();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else {
        switch (endPosition) {
          case "left": {
            break;
          }
          case "right": {
            addHorizontalCenterLine();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalLeftLine();
            break;
          }
        }
      }
      break;
    case "rd": {
      if (startPosition === "right" && endPosition === "left") {
        addVerticalCenterLine();
      } else if (startPosition === "right" && endPosition === "bottom") {
        addSecondXPenultY();
      } else if (startPosition === "right" && endPosition === "top" || startPosition === "right" && endPosition === "right") {
        addPenultXSecondY();
      } else if (startPosition === "bottom" && endPosition === "left") {
        addSecondXPenultY();
      } else if (startPosition === "bottom" && endPosition === "right") {
        addPenultXSecondY();
      } else if (startPosition === "bottom" && endPosition === "top") {
        addHorizontalCenterLine();
      } else if (startPosition === "bottom" && endPosition === "bottom") {
        addSecondXPenultY();
      } else if (startPosition === "top" && endPosition === "left") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "right") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "top") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "bottom") {
        addVerticalCenterLine();
      } else if (startPosition === "left" && endPosition === "left") {
        addSecondXPenultY();
      } else if (startPosition === "left" && endPosition === "right") {
        addHorizontalCenterLine();
      } else if (startPosition === "left" && endPosition === "top") {
        addHorizontalCenterLine();
      } else if (startPosition === "left" && endPosition === "bottom") {
        addSecondXPenultY();
      }
      break;
    }
  }
  points.push(penult);
  points.push(end);
  let lines = [];
  let paths = [];
  for (let i = 0; i < points.length; i++) {
    let source = points[i];
    let destination = points[i + 1];
    lines.push({
      sourceX: source[0],
      sourceY: source[1],
      destinationX: destination[0],
      destinationY: destination[1]
    });
    let finish = i === points.length - 2;
    if (finish && markered) {
      let path = arrowTo(g, source[0], source[1], destination[0], destination[1], lineWidth, strokeStyle);
      paths.push(path);
      break;
    } else {
      let path = lineTo(g, source[0], source[1], destination[0], destination[1], lineWidth, strokeStyle);
      paths.push(path);
    }
    if (finish) {
      break;
    }
  }
  return { lines, paths };
}
function arrowTo(g, x1, y1, x2, y2, lineWidth, strokeStyle) {
  let path = lineTo(g, x1, y1, x2, y2, lineWidth, strokeStyle);
  const id = "arrow" + strokeStyle.replace("#", "");
  g.append("marker").attr("id", id).attr("markerUnits", "strokeWidth").attr("viewBox", "0 0 12 12").attr("refX", 9).attr("refY", 6).attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2").attr("fill", strokeStyle);
  path.attr("marker-end", "url(#" + id + ")");
  return path;
}
function getDirection(x1, y1, x2, y2) {
  if (x2 < x1 && approximatelyEquals(y2, y1)) {
    return "l";
  }
  if (x2 > x1 && approximatelyEquals(y2, y1)) {
    return "r";
  }
  if (approximatelyEquals(x2, x1) && y2 < y1) {
    return "u";
  }
  if (approximatelyEquals(x2, x1) && y2 > y1) {
    return "d";
  }
  if (x2 < x1 && y2 < y1) {
    return "lu";
  }
  if (x2 > x1 && y2 < y1) {
    return "ru";
  }
  if (x2 < x1 && y2 > y1) {
    return "ld";
  }
  return "rd";
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main = {
  name: "flowchart",
  props: {
    nodes: {
      type: Array,
      default: () => [
        { id: 1, x: 140, y: 270, name: "Start", type: "start" },
        { id: 2, x: 540, y: 270, name: "End", type: "end" }
      ]
    },
    connections: {
      type: Array,
      default: () => [
        {
          source: { id: 1, position: "right" },
          destination: { id: 2, position: "left" },
          id: 1,
          type: "pass"
        }
      ]
    },
    width: {
      type: [String, Number],
      default: 800
    },
    height: {
      type: [String, Number],
      default: 600
    },
    readonly: {
      type: Boolean,
      default: false
    },
    readOnlyPermissions: {
      type: Object,
      default: () => ({
        allowDragNodes: false,
        allowSave: false,
        allowAddNodes: false,
        allowEditNodes: false,
        allowEditConnections: false,
        allowDblClick: false
      })
    },
    removeRequiresConfirmation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalNodes: [],
      internalConnections: [],
      connectingInfo: {
        source: null,
        sourcePosition: null
      },
      selectionInfo: null,
      moveInfo: null,
      currentNodes: [],
      currentConnections: [],
      /**
       * Mouse position(relative to chart div)
       */
      cursorToChartOffset: { x: 0, y: 0 },
      clickedOnce: false,
      pathClickedOnce: false,
      /**
       * lines of all internalConnections
       */
      lines: [],
      invalidConnections: [],
      moveCoordinates: {
        startX: 0,
        startY: 0,
        diffX: 0,
        diffY: 0
      }
    };
  },
  methods: {
    add(node) {
      if (this.readonly && !this.readOnlyPermissions.allowAddNodes) {
        return;
      }
      this.internalNodes.push(node);
      this.$emit("add", node, this.internalNodes, this.internalConnections);
    },
    editCurrent() {
      if (this.currentNodes.length === 1) {
        this.editNode(this.currentNodes[0]);
      } else if (this.currentConnections.length === 1) {
        this.editConnection(this.currentConnections[0]);
      }
    },
    editNode(node) {
      if (this.readonly && !this.readOnlyPermissions.allowEditNodes) {
        return;
      }
      this.$emit("editnode", node);
    },
    editConnection(connection) {
      if (this.readonly && !this.readOnlyPermissions.allowEditConnections) {
        return;
      }
      this.$emit("editconnection", connection);
    },
    handleChartMouseWheel(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.ctrlKey) {
        let svg = document.getElementById("svg");
        let zoom = parseFloat(svg.style.zoom || 1);
        if (event.deltaY > 0 && zoom === 0.1) {
          return;
        }
        zoom -= event.deltaY / 100 / 10;
        svg.style.zoom = zoom;
      }
    },
    async handleChartMouseUp(event) {
      if (this.connectingInfo.source) {
        if (this.hoveredConnector) {
          if (this.isNodesConnectionValid()) {
            let tempId = +/* @__PURE__ */ new Date();
            let conn = {
              source: {
                id: this.connectingInfo.source.id,
                position: this.connectingInfo.sourcePosition
              },
              destination: {
                id: this.hoveredConnector.node.id,
                position: this.hoveredConnector.position
              },
              id: tempId,
              type: "pass",
              name: "Pass"
            };
            this.internalConnections.push(conn);
            this.$emit("connect", conn, this.internalNodes, this.internalConnections);
          }
        }
        this.connectingInfo.source = null;
        this.connectingInfo.sourcePosition = null;
      }
      if (this.selectionInfo) {
        this.selectionInfo = null;
      }
      if (this.moveInfo) {
        this.moveCoordinates.diffX -= event.pageX - this.moveCoordinates.startX;
        this.moveCoordinates.diffY += event.pageY - this.moveCoordinates.startY;
        this.$emit("movediff", {
          x: this.moveCoordinates.diffX,
          y: this.moveCoordinates.diffY
        });
        this.moveInfo = null;
      }
    },
    isNodesConnectionValid() {
      const connectionToItself = this.connectingInfo.source.id === this.hoveredConnector.node.id;
      const connectionAlreadyExists = this.internalConnections.some(
        (x) => x.source.id === this.connectingInfo.source.id && x.source.position === this.connectingInfo.sourcePosition && x.destination.id === this.hoveredConnector.node.id && x.destination.position === this.hoveredConnector.position
      );
      return !connectionToItself && !connectionAlreadyExists;
    },
    async handleChartMouseMove(event) {
      let boundingClientRect = event.currentTarget.getBoundingClientRect();
      let actualX = event.pageX - boundingClientRect.left - window.scrollX;
      this.cursorToChartOffset.x = Math.trunc(actualX);
      let actualY = event.pageY - boundingClientRect.top - window.scrollY;
      this.cursorToChartOffset.y = Math.trunc(actualY);
      if (this.connectingInfo.source) {
        await this.renderConnections();
        for (let element of document.querySelectorAll("#svg .connector")) {
          element.classList.add("active");
        }
        let sourceOffset = this.getNodeConnectorOffset(
          this.connectingInfo.source.id,
          this.connectingInfo.sourcePosition
        );
        let destinationPosition = this.hoveredConnector ? this.hoveredConnector.position : null;
        this.arrowTo(
          sourceOffset.x,
          sourceOffset.y,
          this.cursorToChartOffset.x,
          this.cursorToChartOffset.y,
          this.connectingInfo.sourcePosition,
          destinationPosition
        );
      }
    },
    handleChartDblClick(event) {
      if (this.isMouseClickOnSlot(event.target)) {
        return;
      }
      if (this.readonly && !this.readOnlyPermissions.allowDblClick) {
        return;
      }
      this.$emit("dblclick", { x: event.offsetX, y: event.offsetY });
    },
    handleChartMouseDown(event) {
      if (this.isMouseClickOnSlot(event.target)) {
        return;
      }
      if (event.ctrlKey) {
        this.moveCoordinates.startX = event.pageX;
        this.moveCoordinates.startY = event.pageY;
        this.initializeMovingAllElements(event);
      } else {
        this.selectionInfo = { x: event.offsetX, y: event.offsetY };
      }
    },
    isMouseClickOnSlot(eventTargetNode) {
      return ifElementContainChildNode("#chart-slot", eventTargetNode);
    },
    initializeMovingAllElements(event) {
      if (!this.isMouseOverAnyNode()) {
        this.moveInfo = { x: event.offsetX, y: event.offsetY };
      }
    },
    isMouseOverAnyNode() {
      let cursorPosition = {
        x: this.cursorToChartOffset.x,
        y: this.cursorToChartOffset.y
      };
      let result = false;
      for (let currentNodeIndex = 0; currentNodeIndex < this.internalNodes.length; currentNodeIndex++) {
        const node = this.internalNodes[currentNodeIndex];
        const nodeArea = {
          start: { x: node.x, y: node.y },
          end: { x: node.x + node.width, y: node.y + node.height }
        };
        const mousePointIntersectNodeArea = cursorPosition.x >= nodeArea.start.x && cursorPosition.x <= nodeArea.end.x && cursorPosition.y >= nodeArea.start.y && cursorPosition.y <= nodeArea.end.y;
        if (mousePointIntersectNodeArea) {
          result = true;
          break;
        }
      }
      return result;
    },
    getConnectorPosition(node) {
      const halfWidth = node.width / 2;
      const halfHeight = node.height / 2;
      const result = {};
      if (this.hasNodeConnector(node, "top")) {
        result.top = { x: node.x + halfWidth, y: node.y };
      }
      if (this.hasNodeConnector(node, "right")) {
        result.right = { x: node.x + node.width, y: node.y + halfHeight };
      }
      if (this.hasNodeConnector(node, "bottom")) {
        result.bottom = { x: node.x + halfWidth, y: node.y + node.height };
      }
      if (this.hasNodeConnector(node, "left")) {
        result.left = { x: node.x, y: node.y + halfHeight };
      }
      return result;
    },
    hasNodeConnector(node, position) {
      return !node.connectors || node.connectors.includes(position);
    },
    moveAllElements() {
      let that = this;
      if (!that.moveInfo) {
        return;
      }
      const moveX = that.moveInfo.x - that.cursorToChartOffset.x;
      const moveY = that.moveInfo.y - that.cursorToChartOffset.y;
      this.internalNodes.forEach((element) => {
        element.x -= moveX;
        element.y -= moveY;
      });
      that.moveInfo.x = that.cursorToChartOffset.x;
      that.moveInfo.y = that.cursorToChartOffset.y;
    },
    renderSelection() {
      let that = this;
      if (that.selectionInfo) {
        that.currentNodes.splice(0, that.currentNodes.length);
        that.currentConnections.splice(0, that.currentConnections.length);
        let edge = getEdgeOfPoints([
          { x: that.selectionInfo.x, y: that.selectionInfo.y },
          { x: that.cursorToChartOffset.x, y: that.cursorToChartOffset.y }
        ]);
        for (let rect of document.querySelectorAll("#svg .selection")) {
          rect.classList.add("active");
          rect.setAttribute("x", edge.start.x);
          rect.setAttribute("y", edge.start.y);
          rect.setAttribute("width", edge.end.x - edge.start.x);
          rect.setAttribute("height", edge.end.y - edge.start.y);
        }
        that.internalNodes.forEach((item) => {
          let points = [
            { x: item.x, y: item.y },
            { x: item.x, y: item.y + item.height },
            { x: item.x + item.width, y: item.y },
            { x: item.x + item.width, y: item.y + item.height }
          ];
          if (points.some((point) => pointRectangleIntersection(point, edge))) {
            that.currentNodes.push(item);
          }
        });
        that.lines.forEach((line) => {
          let points = [
            { x: line.sourceX, y: line.sourceY },
            { x: line.destinationX, y: line.destinationY }
          ];
          if (points.every((point) => pointRectangleIntersection(point, edge)) && that.currentConnections.every((item) => item.id !== line.id)) {
            let connection = that.internalConnections.filter((conn) => conn.id === line.id)[0];
            that.currentConnections.push(connection);
          }
        });
      } else {
        for (let element of document.querySelectorAll("#svg > .selection")) {
          element.classList.remove("active");
        }
      }
    },
    renderConnections() {
      let that = this;
      return new Promise((resolve) => {
        that.$nextTick(() => {
          for (let element of document.querySelectorAll("#svg > g.connection")) {
            element.remove();
          }
          that.lines = [];
          that.invalidConnections = [];
          that.internalConnections.forEach((conn) => {
            if (!that.haveNodesSelectedConnectors(conn)) {
              that.invalidConnections.push(conn);
              return;
            }
            let sourcePosition = that.getNodeConnectorOffset(conn.source.id, conn.source.position);
            let destinationPosition = that.getNodeConnectorOffset(
              conn.destination.id,
              conn.destination.position
            );
            let colors = {
              pass: "#52c41a",
              reject: "red"
            };
            if (that.currentConnections.filter((item) => item === conn).length > 0) {
              colors = {
                pass: "#12640a",
                reject: "darkred"
              };
            }
            let result = that.arrowTo(
              sourcePosition.x,
              sourcePosition.y,
              destinationPosition.x,
              destinationPosition.y,
              conn.source.position,
              conn.destination.position,
              colors[conn.type]
            );
            for (const path of result.paths) {
              path.on("mousedown", (event) => {
                event.stopPropagation();
                if (that.pathClickedOnce) {
                  that.editConnection(conn);
                } else {
                  let timer = setTimeout(() => {
                    that.pathClickedOnce = false;
                    clearTimeout(timer);
                  }, 300);
                  that.pathClickedOnce = true;
                }
                that.currentNodes.splice(0, that.currentNodes.length);
                that.currentConnections.splice(0, that.currentConnections.length);
                that.currentConnections.push(conn);
              });
            }
            for (const line of result.lines) {
              that.lines.push({
                sourceX: line.sourceX,
                sourceY: line.sourceY,
                destinationX: line.destinationX,
                destinationY: line.destinationY,
                id: conn.id
              });
            }
          });
          resolve();
        });
      });
    },
    haveNodesSelectedConnectors(connection) {
      const sourceNode = this.nodes.find((x) => x.id === connection.source.id);
      const destinationNode = this.nodes.find((x) => x.id === connection.destination.id);
      return this.hasNodeConnector(sourceNode, connection.source.position) && this.hasNodeConnector(destinationNode, connection.destination.position);
    },
    renderNodes() {
      let that = this;
      return new Promise((resolve) => {
        for (let node of document.querySelectorAll("#svg > g.node")) {
          node.remove();
        }
        that.internalNodes.forEach((node) => {
          that.renderNode(node, that.currentNodes.filter((item) => item === node).length > 0);
        });
        resolve();
      });
    },
    getNodeConnectorOffset(nodeId, connectorPosition) {
      let node = this.internalNodes.filter((item) => item.id === nodeId)[0];
      return this.getConnectorPosition(node)[connectorPosition];
    },
    append(element) {
      let svg = select("#svg");
      return svg.insert(element, ".selection");
    },
    guideLineTo(x1, y1, x2, y2) {
      let g = this.append("g");
      g.classed("guideline", true);
      lineTo(g, x1, y1, x2, y2, 1, "#a3a3a3", [5, 3]);
    },
    arrowTo(x1, y1, x2, y2, startPosition, endPosition, color) {
      let g = this.append("g");
      g.classed("connection", true);
      connect(g, x1, y1, x2, y2, startPosition, endPosition, 1, color || "#a3a3a3", true);
      return connect(g, x1, y1, x2, y2, startPosition, endPosition, 5, "transparent", false);
    },
    renderNode(node, isSelected) {
      let that = this;
      let g = that.append("g").attr("cursor", "move").classed("node", true);
      let children2 = render(g, node, isSelected);
      that.$emit("render", node, children2);
      let dragHandler = drag().on("start", (event) => {
        let isNotCurrentNode = that.currentNodes.filter((item) => item === node).length === 0;
        if (isNotCurrentNode) {
          that.currentConnections.splice(0, that.currentConnections.length);
          that.currentNodes.splice(0, that.currentNodes.length);
          that.currentNodes.push(node);
        }
        if (that.clickedOnce) {
          that.currentNodes.splice(0, that.currentNodes.length);
          that.editNode(node);
        } else {
          let timer = setTimeout(() => {
            that.clickedOnce = false;
            clearTimeout(timer);
          }, 300);
          that.clickedOnce = true;
        }
      }).on("drag", async (event) => {
        if (that.readonly && !that.readOnlyPermissions.allowDragNodes) {
          return;
        }
        let zoom = parseFloat(document.getElementById("svg").style.zoom || 1);
        for (let currentNode of that.currentNodes) {
          let x = event.dx / zoom;
          if (currentNode.x + x < 0) {
            x = -currentNode.x;
          }
          currentNode.x += x;
          let y = event.dy / zoom;
          if (currentNode.y + y < 0) {
            y = -currentNode.y;
          }
          currentNode.y += y;
        }
        for (let element of document.querySelectorAll("#svg > g.guideline")) {
          element.remove();
        }
        let edge = that.getCurrentNodesEdge();
        let expectX = Math.round(Math.round(edge.start.x) / 10) * 10;
        let expectY = Math.round(Math.round(edge.start.y) / 10) * 10;
        that.internalNodes.forEach((item) => {
          if (that.currentNodes.filter((currentNode) => currentNode === item).length === 0) {
            if (item.x === expectX) {
              if (item.y < expectY) {
                that.guideLineTo(item.x, item.y + item.height, expectX, expectY);
              } else {
                that.guideLineTo(expectX, expectY + item.height, item.x, item.y);
              }
            }
            if (item.y === expectY) {
              if (item.x < expectX) {
                that.guideLineTo(item.x + item.width, item.y, expectX, expectY);
              } else {
                that.guideLineTo(expectX + item.width, expectY, item.x, item.y);
              }
            }
          }
        });
      }).on("end", (event) => {
        for (let element of document.querySelectorAll("#svg > g.guideline")) {
          element.remove();
        }
        for (let currentNode of that.currentNodes) {
          currentNode.x = Math.round(Math.round(currentNode.x) / 10) * 10;
          currentNode.y = Math.round(Math.round(currentNode.y) / 10) * 10;
        }
        that.$emit("nodesdragged", that.currentNodes);
      });
      g.call(dragHandler);
      g.on("mousedown", (event) => {
        if (!event.ctrlKey) {
          return;
        }
        let isNotCurrentNode = that.currentNodes.filter((item) => item === node).length === 0;
        if (isNotCurrentNode) {
          that.currentNodes.push(node);
        } else {
          that.currentNodes.splice(that.currentNodes.indexOf(node), 1);
        }
      });
      let connectors = [];
      let connectorPosition = this.getConnectorPosition(node);
      for (let position in connectorPosition) {
        let positionElement = connectorPosition[position];
        let connector = g.append("circle").attr("cx", positionElement.x).attr("cy", positionElement.y).attr("r", 4).attr("class", "connector");
        connector.on("mousedown", (event) => {
          event.stopPropagation();
          if (node.type === "end" || that.readonly) {
            return;
          }
          that.connectingInfo.source = node;
          that.connectingInfo.sourcePosition = position;
        }).on("mouseup", (event) => {
          event.stopPropagation();
          if (that.connectingInfo.source) {
            if (that.connectingInfo.source.id !== node.id) {
              let tempId = +/* @__PURE__ */ new Date();
              let conn = {
                source: {
                  id: that.connectingInfo.source.id,
                  position: that.connectingInfo.sourcePosition
                },
                destination: {
                  id: node.id,
                  position
                },
                id: tempId,
                type: "pass",
                name: "Pass"
              };
              that.internalConnections.push(conn);
              that.$emit("connect", conn, that.internalNodes, that.internalConnections);
            }
            that.connectingInfo.source = null;
            that.connectingInfo.sourcePosition = null;
          }
        }).on("mouseover", (event) => {
          connector.classed("active", true);
        }).on("mouseout", (event) => {
          connector.classed("active", false);
        });
        connectors.push(connector);
      }
      g.on("mouseover", (event) => {
        connectors.forEach((conn) => conn.classed("active", true));
      }).on("mouseout", (event) => {
        connectors.forEach((conn) => conn.classed("active", false));
      });
    },
    getCurrentNodesEdge() {
      let points = this.currentNodes.map((node) => ({
        x: node.x,
        y: node.y
      }));
      points.push(
        ...this.currentNodes.map((node) => ({
          x: node.x + node.width,
          y: node.y + node.height
        }))
      );
      return getEdgeOfPoints(points);
    },
    save() {
      if (this.readonly && !this.readOnlyPermissions.allowSave) {
        return;
      }
      this.$emit("save", this.internalNodes, this.internalConnections);
    },
    async remove() {
      if (this.readonly && !this.readOnlyPermissions.allowRemove) {
        return;
      }
      const anyElementToRemove = this.currentConnections.length > 0 || this.currentNodes.length > 0;
      if (!anyElementToRemove) {
        return;
      }
      if (!this.removeRequiresConfirmation) {
        this.removeSelectedNodesAndConnections();
      } else {
        this.$emit("removeconfirmationrequired", this.currentNodes, this.currentConnections);
      }
    },
    confirmRemove() {
      this.removeSelectedNodesAndConnections();
    },
    removeSelectedNodesAndConnections() {
      if (this.readonly) {
        return;
      }
      if (this.currentConnections.length > 0) {
        for (let conn of this.currentConnections) {
          this.removeConnection(conn);
        }
        this.currentConnections.splice(0, this.currentConnections.length);
      }
      if (this.currentNodes.length > 0) {
        for (let node of this.currentNodes) {
          this.removeNode(node);
        }
        this.currentNodes.splice(0, this.currentNodes.length);
      }
    },
    removeNode(node) {
      let connections = this.internalConnections.filter(
        (item) => item.source.id === node.id || item.destination.id === node.id
      );
      for (let connection of connections) {
        this.internalConnections.splice(this.internalConnections.indexOf(connection), 1);
      }
      this.internalNodes.splice(this.internalNodes.indexOf(node), 1);
      this.$emit("delete", node, this.internalNodes, this.internalConnections);
    },
    removeConnection(conn) {
      let index = this.internalConnections.indexOf(conn);
      this.internalConnections.splice(index, 1);
      this.$emit("disconnect", conn, this.internalNodes, this.internalConnections);
    },
    moveCurrentNode(x, y) {
      if (this.currentNodes.length > 0 && !this.readonly) {
        for (let node of this.currentNodes) {
          if (node.x + x < 0) {
            x = -node.x;
          }
          node.x += x;
          if (node.y + y < 0) {
            y = -node.y;
          }
          node.y += y;
        }
      }
    },
    init() {
      let that = this;
      that.internalNodes.splice(0, that.internalNodes.length);
      that.internalConnections.splice(0, that.internalConnections.length);
      that.nodes.forEach((node) => {
        let newNode = Object.assign({}, node);
        newNode.x = newNode.x - this.moveCoordinates.diffX;
        newNode.y = newNode.y + this.moveCoordinates.diffY;
        newNode.width = newNode.width || 120;
        newNode.height = newNode.height || 60;
        that.internalNodes.push(newNode);
      });
      that.connections.forEach((connection) => {
        that.internalConnections.push(JSON.parse(JSON.stringify(connection)));
      });
    }
  },
  mounted() {
    let that = this;
    that.init();
    document.onkeydown = (event) => {
      switch (event.keyCode) {
        case 37:
          that.moveCurrentNode(-10, 0);
          break;
        case 38:
          that.moveCurrentNode(0, -10);
          break;
        case 39:
          that.moveCurrentNode(10, 0);
          break;
        case 40:
          that.moveCurrentNode(0, 10);
          break;
        case 27:
          that.currentNodes.splice(0, that.currentNodes.length);
          that.currentConnections.splice(0, that.currentConnections.length);
          break;
        case 65:
          if (document.activeElement === document.getElementById("chart")) {
            that.currentNodes.splice(0, that.currentNodes.length);
            that.currentConnections.splice(0, that.currentConnections.length);
            that.currentNodes.push(...that.internalNodes);
            that.currentConnections.push(...that.internalConnections);
            event.preventDefault();
          }
          break;
        case 46:
        case 8:
          that.remove();
          break;
      }
    };
  },
  created() {
  },
  computed: {
    hoveredConnector() {
      for (const node of this.internalNodes) {
        let connectorPosition = this.getConnectorPosition(node);
        for (let prop in connectorPosition) {
          let entry = connectorPosition[prop];
          if (Math.hypot(entry.x - this.cursorToChartOffset.x, entry.y - this.cursorToChartOffset.y) < 10) {
            return { position: prop, node };
          }
        }
      }
      return null;
    },
    hoveredConnection() {
      for (const line of this.lines) {
        let distance = distanceOfPointToLine(
          line.sourceX,
          line.sourceY,
          line.destinationX,
          line.destinationY,
          this.cursorToChartOffset.x,
          this.cursorToChartOffset.y
        );
        if (distance < 5 && between(line.sourceX - 2, line.destinationX + 2, this.cursorToChartOffset.x) && between(line.sourceY - 2, line.destinationY + 2, this.cursorToChartOffset.y)) {
          let connections = this.internalConnections.filter((item) => item.id === line.id);
          return connections.length > 0 ? connections[0] : null;
        }
      }
      return null;
    },
    cursor() {
      if (this.connectingInfo.source || this.hoveredConnector) {
        return "crosshair";
      }
      if (this.hoveredConnection != null) {
        return "pointer";
      }
      return null;
    }
  },
  watch: {
    internalNodes: {
      immediate: true,
      deep: true,
      handler() {
        this.renderNodes();
        this.renderConnections();
      }
    },
    internalConnections: {
      immediate: true,
      deep: true,
      handler() {
        this.renderConnections();
      }
    },
    selectionInfo: {
      immediate: true,
      deep: true,
      handler() {
        this.renderSelection();
      }
    },
    currentNodes: {
      immediate: true,
      deep: true,
      handler() {
        this.$emit("select", this.currentNodes);
        this.renderNodes();
      }
    },
    currentConnections: {
      immediate: true,
      deep: true,
      handler() {
        this.$emit("selectconnection", this.currentConnections);
        this.renderConnections();
      }
    },
    cursorToChartOffset: {
      immediate: true,
      deep: true,
      handler() {
        if (this.selectionInfo) {
          this.renderSelection();
          return;
        }
        if (this.moveInfo) {
          this.moveAllElements();
        }
      }
    },
    connectingInfo: {
      immediate: true,
      deep: true,
      handler() {
        this.renderConnections();
      }
    },
    nodes: {
      immediate: true,
      deep: true,
      handler() {
        this.init();
      }
    },
    connections: {
      immediate: true,
      deep: true,
      handler() {
        this.init();
      }
    }
  }
};
const _hoisted_1 = {
  id: "position",
  class: "unselectable"
};
const _hoisted_2 = /* @__PURE__ */ createElementVNode("svg", { id: "svg" }, [
  /* @__PURE__ */ createElementVNode("rect", {
    class: "selection",
    height: "0",
    width: "0"
  })
], -1);
const _hoisted_3 = {
  id: "chart-slot",
  class: "unselectable"
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    id: "chart",
    tabindex: "0",
    style: normalizeStyle({
      width: isNaN($props.width) ? $props.width : $props.width + "px",
      height: isNaN($props.height) ? $props.height : $props.height + "px",
      cursor: $options.cursor
    }),
    onMousemove: _cache[0] || (_cache[0] = (...args) => $options.handleChartMouseMove && $options.handleChartMouseMove(...args)),
    onMouseup: _cache[1] || (_cache[1] = ($event) => $options.handleChartMouseUp($event)),
    onDblclick: _cache[2] || (_cache[2] = ($event) => $options.handleChartDblClick($event)),
    onMousewheel: _cache[3] || (_cache[3] = (...args) => $options.handleChartMouseWheel && $options.handleChartMouseWheel(...args)),
    onMousedown: _cache[4] || (_cache[4] = ($event) => $options.handleChartMouseDown($event))
  }, [
    createElementVNode("span", _hoisted_1, toDisplayString($data.cursorToChartOffset.x + ", " + $data.cursorToChartOffset.y), 1),
    _hoisted_2,
    createElementVNode("div", _hoisted_3, [
      renderSlot(_ctx.$slots, "default")
    ])
  ], 36);
}
const FlowChart = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export {
  FlowChart as default
};
