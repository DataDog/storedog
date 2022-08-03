(() => {
  // node_modules/@spree/dashboard/app/assets/javascripts/spree-dashboard.js
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.SpreeDashboard = {}));
  })(void 0, function(exports2) {
    "use strict";
    class EventListener {
      constructor(eventTarget, eventName, eventOptions) {
        this.eventTarget = eventTarget;
        this.eventName = eventName;
        this.eventOptions = eventOptions;
        this.unorderedBindings = /* @__PURE__ */ new Set();
      }
      connect() {
        this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
      }
      disconnect() {
        this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
      }
      bindingConnected(binding) {
        this.unorderedBindings.add(binding);
      }
      bindingDisconnected(binding) {
        this.unorderedBindings.delete(binding);
      }
      handleEvent(event) {
        const extendedEvent = extendEvent(event);
        for (const binding of this.bindings) {
          if (extendedEvent.immediatePropagationStopped) {
            break;
          } else {
            binding.handleEvent(extendedEvent);
          }
        }
      }
      get bindings() {
        return Array.from(this.unorderedBindings).sort((left, right) => {
          const leftIndex = left.index, rightIndex = right.index;
          return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
        });
      }
    }
    function extendEvent(event) {
      if ("immediatePropagationStopped" in event) {
        return event;
      } else {
        const { stopImmediatePropagation } = event;
        return Object.assign(event, {
          immediatePropagationStopped: false,
          stopImmediatePropagation() {
            this.immediatePropagationStopped = true;
            stopImmediatePropagation.call(this);
          }
        });
      }
    }
    class Dispatcher {
      constructor(application2) {
        this.application = application2;
        this.eventListenerMaps = /* @__PURE__ */ new Map();
        this.started = false;
      }
      start() {
        if (!this.started) {
          this.started = true;
          this.eventListeners.forEach((eventListener) => eventListener.connect());
        }
      }
      stop() {
        if (this.started) {
          this.started = false;
          this.eventListeners.forEach((eventListener) => eventListener.disconnect());
        }
      }
      get eventListeners() {
        return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
      }
      bindingConnected(binding) {
        this.fetchEventListenerForBinding(binding).bindingConnected(binding);
      }
      bindingDisconnected(binding) {
        this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      }
      handleError(error2, message, detail = {}) {
        this.application.handleError(error2, `Error ${message}`, detail);
      }
      fetchEventListenerForBinding(binding) {
        const { eventTarget, eventName, eventOptions } = binding;
        return this.fetchEventListener(eventTarget, eventName, eventOptions);
      }
      fetchEventListener(eventTarget, eventName, eventOptions) {
        const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
        const cacheKey = this.cacheKey(eventName, eventOptions);
        let eventListener = eventListenerMap.get(cacheKey);
        if (!eventListener) {
          eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
          eventListenerMap.set(cacheKey, eventListener);
        }
        return eventListener;
      }
      createEventListener(eventTarget, eventName, eventOptions) {
        const eventListener = new EventListener(eventTarget, eventName, eventOptions);
        if (this.started) {
          eventListener.connect();
        }
        return eventListener;
      }
      fetchEventListenerMapForEventTarget(eventTarget) {
        let eventListenerMap = this.eventListenerMaps.get(eventTarget);
        if (!eventListenerMap) {
          eventListenerMap = /* @__PURE__ */ new Map();
          this.eventListenerMaps.set(eventTarget, eventListenerMap);
        }
        return eventListenerMap;
      }
      cacheKey(eventName, eventOptions) {
        const parts = [eventName];
        Object.keys(eventOptions).sort().forEach((key) => {
          parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
        });
        return parts.join(":");
      }
    }
    const descriptorPattern = /^((.+?)(@(window|document))?->)?(.+?)(#([^:]+?))(:(.+))?$/;
    function parseActionDescriptorString(descriptorString) {
      const source = descriptorString.trim();
      const matches2 = source.match(descriptorPattern) || [];
      return {
        eventTarget: parseEventTarget(matches2[4]),
        eventName: matches2[2],
        eventOptions: matches2[9] ? parseEventOptions(matches2[9]) : {},
        identifier: matches2[5],
        methodName: matches2[7]
      };
    }
    function parseEventTarget(eventTargetName) {
      if (eventTargetName == "window") {
        return window;
      } else if (eventTargetName == "document") {
        return document;
      }
    }
    function parseEventOptions(eventOptions) {
      return eventOptions.split(":").reduce((options, token) => Object.assign(options, {
        [token.replace(/^!/, "")]: !/^!/.test(token)
      }), {});
    }
    function stringifyEventTarget(eventTarget) {
      if (eventTarget == window) {
        return "window";
      } else if (eventTarget == document) {
        return "document";
      }
    }
    function camelize(value) {
      return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
    }
    function capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    function dasherize(value) {
      return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
    }
    function tokenize(value) {
      return value.match(/[^\s]+/g) || [];
    }
    class Action {
      constructor(element, index2, descriptor) {
        this.element = element;
        this.index = index2;
        this.eventTarget = descriptor.eventTarget || element;
        this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
        this.eventOptions = descriptor.eventOptions || {};
        this.identifier = descriptor.identifier || error("missing identifier");
        this.methodName = descriptor.methodName || error("missing method name");
      }
      static forToken(token) {
        return new this(token.element, token.index, parseActionDescriptorString(token.content));
      }
      toString() {
        const eventNameSuffix = this.eventTargetName ? `@${this.eventTargetName}` : "";
        return `${this.eventName}${eventNameSuffix}->${this.identifier}#${this.methodName}`;
      }
      get params() {
        if (this.eventTarget instanceof Element) {
          return this.getParamsFromEventTargetAttributes(this.eventTarget);
        } else {
          return {};
        }
      }
      getParamsFromEventTargetAttributes(eventTarget) {
        const params = {};
        const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`);
        const attributes = Array.from(eventTarget.attributes);
        attributes.forEach(({ name, value }) => {
          const match = name.match(pattern);
          const key = match && match[1];
          if (key) {
            Object.assign(params, {
              [camelize(key)]: typecast(value)
            });
          }
        });
        return params;
      }
      get eventTargetName() {
        return stringifyEventTarget(this.eventTarget);
      }
    }
    const defaultEventNames = {
      a: (e) => "click",
      button: (e) => "click",
      form: (e) => "submit",
      details: (e) => "toggle",
      input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
      select: (e) => "change",
      textarea: (e) => "input"
    };
    function getDefaultEventNameForElement(element) {
      const tagName = element.tagName.toLowerCase();
      if (tagName in defaultEventNames) {
        return defaultEventNames[tagName](element);
      }
    }
    function error(message) {
      throw new Error(message);
    }
    function typecast(value) {
      try {
        return JSON.parse(value);
      } catch (o_O) {
        return value;
      }
    }
    class Binding {
      constructor(context, action) {
        this.context = context;
        this.action = action;
      }
      get index() {
        return this.action.index;
      }
      get eventTarget() {
        return this.action.eventTarget;
      }
      get eventOptions() {
        return this.action.eventOptions;
      }
      get identifier() {
        return this.context.identifier;
      }
      handleEvent(event) {
        if (this.willBeInvokedByEvent(event)) {
          this.invokeWithEvent(event);
        }
      }
      get eventName() {
        return this.action.eventName;
      }
      get method() {
        const method = this.controller[this.methodName];
        if (typeof method == "function") {
          return method;
        }
        throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
      }
      invokeWithEvent(event) {
        const { target, currentTarget } = event;
        try {
          const { params } = this.action;
          const actionEvent = Object.assign(event, {
            params
          });
          this.method.call(this.controller, actionEvent);
          this.context.logDebugActivity(this.methodName, {
            event,
            target,
            currentTarget,
            action: this.methodName
          });
        } catch (error2) {
          const { identifier, controller, element, index: index2 } = this;
          const detail = {
            identifier,
            controller,
            element,
            index: index2,
            event
          };
          this.context.handleError(error2, `invoking action "${this.action}"`, detail);
        }
      }
      willBeInvokedByEvent(event) {
        const eventTarget = event.target;
        if (this.element === eventTarget) {
          return true;
        } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
          return this.scope.containsElement(eventTarget);
        } else {
          return this.scope.containsElement(this.action.element);
        }
      }
      get controller() {
        return this.context.controller;
      }
      get methodName() {
        return this.action.methodName;
      }
      get element() {
        return this.scope.element;
      }
      get scope() {
        return this.context.scope;
      }
    }
    class ElementObserver {
      constructor(element, delegate) {
        this.mutationObserverInit = {
          attributes: true,
          childList: true,
          subtree: true
        };
        this.element = element;
        this.started = false;
        this.delegate = delegate;
        this.elements = /* @__PURE__ */ new Set();
        this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
      }
      start() {
        if (!this.started) {
          this.started = true;
          this.mutationObserver.observe(this.element, this.mutationObserverInit);
          this.refresh();
        }
      }
      pause(callback) {
        if (this.started) {
          this.mutationObserver.disconnect();
          this.started = false;
        }
        callback();
        if (!this.started) {
          this.mutationObserver.observe(this.element, this.mutationObserverInit);
          this.started = true;
        }
      }
      stop() {
        if (this.started) {
          this.mutationObserver.takeRecords();
          this.mutationObserver.disconnect();
          this.started = false;
        }
      }
      refresh() {
        if (this.started) {
          const matches2 = new Set(this.matchElementsInTree());
          for (const element of Array.from(this.elements)) {
            if (!matches2.has(element)) {
              this.removeElement(element);
            }
          }
          for (const element of Array.from(matches2)) {
            this.addElement(element);
          }
        }
      }
      processMutations(mutations) {
        if (this.started) {
          for (const mutation of mutations) {
            this.processMutation(mutation);
          }
        }
      }
      processMutation(mutation) {
        if (mutation.type == "attributes") {
          this.processAttributeChange(mutation.target, mutation.attributeName);
        } else if (mutation.type == "childList") {
          this.processRemovedNodes(mutation.removedNodes);
          this.processAddedNodes(mutation.addedNodes);
        }
      }
      processAttributeChange(node, attributeName) {
        const element = node;
        if (this.elements.has(element)) {
          if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
            this.delegate.elementAttributeChanged(element, attributeName);
          } else {
            this.removeElement(element);
          }
        } else if (this.matchElement(element)) {
          this.addElement(element);
        }
      }
      processRemovedNodes(nodes) {
        for (const node of Array.from(nodes)) {
          const element = this.elementFromNode(node);
          if (element) {
            this.processTree(element, this.removeElement);
          }
        }
      }
      processAddedNodes(nodes) {
        for (const node of Array.from(nodes)) {
          const element = this.elementFromNode(node);
          if (element && this.elementIsActive(element)) {
            this.processTree(element, this.addElement);
          }
        }
      }
      matchElement(element) {
        return this.delegate.matchElement(element);
      }
      matchElementsInTree(tree = this.element) {
        return this.delegate.matchElementsInTree(tree);
      }
      processTree(tree, processor) {
        for (const element of this.matchElementsInTree(tree)) {
          processor.call(this, element);
        }
      }
      elementFromNode(node) {
        if (node.nodeType == Node.ELEMENT_NODE) {
          return node;
        }
      }
      elementIsActive(element) {
        if (element.isConnected != this.element.isConnected) {
          return false;
        } else {
          return this.element.contains(element);
        }
      }
      addElement(element) {
        if (!this.elements.has(element)) {
          if (this.elementIsActive(element)) {
            this.elements.add(element);
            if (this.delegate.elementMatched) {
              this.delegate.elementMatched(element);
            }
          }
        }
      }
      removeElement(element) {
        if (this.elements.has(element)) {
          this.elements.delete(element);
          if (this.delegate.elementUnmatched) {
            this.delegate.elementUnmatched(element);
          }
        }
      }
    }
    class AttributeObserver {
      constructor(element, attributeName, delegate) {
        this.attributeName = attributeName;
        this.delegate = delegate;
        this.elementObserver = new ElementObserver(element, this);
      }
      get element() {
        return this.elementObserver.element;
      }
      get selector() {
        return `[${this.attributeName}]`;
      }
      start() {
        this.elementObserver.start();
      }
      pause(callback) {
        this.elementObserver.pause(callback);
      }
      stop() {
        this.elementObserver.stop();
      }
      refresh() {
        this.elementObserver.refresh();
      }
      get started() {
        return this.elementObserver.started;
      }
      matchElement(element) {
        return element.hasAttribute(this.attributeName);
      }
      matchElementsInTree(tree) {
        const match = this.matchElement(tree) ? [tree] : [];
        const matches2 = Array.from(tree.querySelectorAll(this.selector));
        return match.concat(matches2);
      }
      elementMatched(element) {
        if (this.delegate.elementMatchedAttribute) {
          this.delegate.elementMatchedAttribute(element, this.attributeName);
        }
      }
      elementUnmatched(element) {
        if (this.delegate.elementUnmatchedAttribute) {
          this.delegate.elementUnmatchedAttribute(element, this.attributeName);
        }
      }
      elementAttributeChanged(element, attributeName) {
        if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
          this.delegate.elementAttributeValueChanged(element, attributeName);
        }
      }
    }
    class StringMapObserver {
      constructor(element, delegate) {
        this.element = element;
        this.delegate = delegate;
        this.started = false;
        this.stringMap = /* @__PURE__ */ new Map();
        this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
      }
      start() {
        if (!this.started) {
          this.started = true;
          this.mutationObserver.observe(this.element, {
            attributes: true,
            attributeOldValue: true
          });
          this.refresh();
        }
      }
      stop() {
        if (this.started) {
          this.mutationObserver.takeRecords();
          this.mutationObserver.disconnect();
          this.started = false;
        }
      }
      refresh() {
        if (this.started) {
          for (const attributeName of this.knownAttributeNames) {
            this.refreshAttribute(attributeName, null);
          }
        }
      }
      processMutations(mutations) {
        if (this.started) {
          for (const mutation of mutations) {
            this.processMutation(mutation);
          }
        }
      }
      processMutation(mutation) {
        const attributeName = mutation.attributeName;
        if (attributeName) {
          this.refreshAttribute(attributeName, mutation.oldValue);
        }
      }
      refreshAttribute(attributeName, oldValue) {
        const key = this.delegate.getStringMapKeyForAttribute(attributeName);
        if (key != null) {
          if (!this.stringMap.has(attributeName)) {
            this.stringMapKeyAdded(key, attributeName);
          }
          const value = this.element.getAttribute(attributeName);
          if (this.stringMap.get(attributeName) != value) {
            this.stringMapValueChanged(value, key, oldValue);
          }
          if (value == null) {
            const oldValue2 = this.stringMap.get(attributeName);
            this.stringMap.delete(attributeName);
            if (oldValue2)
              this.stringMapKeyRemoved(key, attributeName, oldValue2);
          } else {
            this.stringMap.set(attributeName, value);
          }
        }
      }
      stringMapKeyAdded(key, attributeName) {
        if (this.delegate.stringMapKeyAdded) {
          this.delegate.stringMapKeyAdded(key, attributeName);
        }
      }
      stringMapValueChanged(value, key, oldValue) {
        if (this.delegate.stringMapValueChanged) {
          this.delegate.stringMapValueChanged(value, key, oldValue);
        }
      }
      stringMapKeyRemoved(key, attributeName, oldValue) {
        if (this.delegate.stringMapKeyRemoved) {
          this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
        }
      }
      get knownAttributeNames() {
        return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
      }
      get currentAttributeNames() {
        return Array.from(this.element.attributes).map((attribute) => attribute.name);
      }
      get recordedAttributeNames() {
        return Array.from(this.stringMap.keys());
      }
    }
    function add(map, key, value) {
      fetch$1(map, key).add(value);
    }
    function del(map, key, value) {
      fetch$1(map, key).delete(value);
      prune(map, key);
    }
    function fetch$1(map, key) {
      let values = map.get(key);
      if (!values) {
        values = /* @__PURE__ */ new Set();
        map.set(key, values);
      }
      return values;
    }
    function prune(map, key) {
      const values = map.get(key);
      if (values != null && values.size == 0) {
        map.delete(key);
      }
    }
    class Multimap {
      constructor() {
        this.valuesByKey = /* @__PURE__ */ new Map();
      }
      get keys() {
        return Array.from(this.valuesByKey.keys());
      }
      get values() {
        const sets = Array.from(this.valuesByKey.values());
        return sets.reduce((values, set) => values.concat(Array.from(set)), []);
      }
      get size() {
        const sets = Array.from(this.valuesByKey.values());
        return sets.reduce((size, set) => size + set.size, 0);
      }
      add(key, value) {
        add(this.valuesByKey, key, value);
      }
      delete(key, value) {
        del(this.valuesByKey, key, value);
      }
      has(key, value) {
        const values = this.valuesByKey.get(key);
        return values != null && values.has(value);
      }
      hasKey(key) {
        return this.valuesByKey.has(key);
      }
      hasValue(value) {
        const sets = Array.from(this.valuesByKey.values());
        return sets.some((set) => set.has(value));
      }
      getValuesForKey(key) {
        const values = this.valuesByKey.get(key);
        return values ? Array.from(values) : [];
      }
      getKeysForValue(value) {
        return Array.from(this.valuesByKey).filter(([key, values]) => values.has(value)).map(([key, values]) => key);
      }
    }
    class TokenListObserver {
      constructor(element, attributeName, delegate) {
        this.attributeObserver = new AttributeObserver(element, attributeName, this);
        this.delegate = delegate;
        this.tokensByElement = new Multimap();
      }
      get started() {
        return this.attributeObserver.started;
      }
      start() {
        this.attributeObserver.start();
      }
      pause(callback) {
        this.attributeObserver.pause(callback);
      }
      stop() {
        this.attributeObserver.stop();
      }
      refresh() {
        this.attributeObserver.refresh();
      }
      get element() {
        return this.attributeObserver.element;
      }
      get attributeName() {
        return this.attributeObserver.attributeName;
      }
      elementMatchedAttribute(element) {
        this.tokensMatched(this.readTokensForElement(element));
      }
      elementAttributeValueChanged(element) {
        const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
        this.tokensUnmatched(unmatchedTokens);
        this.tokensMatched(matchedTokens);
      }
      elementUnmatchedAttribute(element) {
        this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
      }
      tokensMatched(tokens) {
        tokens.forEach((token) => this.tokenMatched(token));
      }
      tokensUnmatched(tokens) {
        tokens.forEach((token) => this.tokenUnmatched(token));
      }
      tokenMatched(token) {
        this.delegate.tokenMatched(token);
        this.tokensByElement.add(token.element, token);
      }
      tokenUnmatched(token) {
        this.delegate.tokenUnmatched(token);
        this.tokensByElement.delete(token.element, token);
      }
      refreshTokensForElement(element) {
        const previousTokens = this.tokensByElement.getValuesForKey(element);
        const currentTokens = this.readTokensForElement(element);
        const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
        if (firstDifferingIndex == -1) {
          return [[], []];
        } else {
          return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
        }
      }
      readTokensForElement(element) {
        const attributeName = this.attributeName;
        const tokenString = element.getAttribute(attributeName) || "";
        return parseTokenString(tokenString, element, attributeName);
      }
    }
    function parseTokenString(tokenString, element, attributeName) {
      return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index2) => ({
        element,
        attributeName,
        content,
        index: index2
      }));
    }
    function zip(left, right) {
      const length = Math.max(left.length, right.length);
      return Array.from({
        length
      }, (_, index2) => [left[index2], right[index2]]);
    }
    function tokensAreEqual(left, right) {
      return left && right && left.index == right.index && left.content == right.content;
    }
    class ValueListObserver {
      constructor(element, attributeName, delegate) {
        this.tokenListObserver = new TokenListObserver(element, attributeName, this);
        this.delegate = delegate;
        this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
        this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
      }
      get started() {
        return this.tokenListObserver.started;
      }
      start() {
        this.tokenListObserver.start();
      }
      stop() {
        this.tokenListObserver.stop();
      }
      refresh() {
        this.tokenListObserver.refresh();
      }
      get element() {
        return this.tokenListObserver.element;
      }
      get attributeName() {
        return this.tokenListObserver.attributeName;
      }
      tokenMatched(token) {
        const { element } = token;
        const { value } = this.fetchParseResultForToken(token);
        if (value) {
          this.fetchValuesByTokenForElement(element).set(token, value);
          this.delegate.elementMatchedValue(element, value);
        }
      }
      tokenUnmatched(token) {
        const { element } = token;
        const { value } = this.fetchParseResultForToken(token);
        if (value) {
          this.fetchValuesByTokenForElement(element).delete(token);
          this.delegate.elementUnmatchedValue(element, value);
        }
      }
      fetchParseResultForToken(token) {
        let parseResult = this.parseResultsByToken.get(token);
        if (!parseResult) {
          parseResult = this.parseToken(token);
          this.parseResultsByToken.set(token, parseResult);
        }
        return parseResult;
      }
      fetchValuesByTokenForElement(element) {
        let valuesByToken = this.valuesByTokenByElement.get(element);
        if (!valuesByToken) {
          valuesByToken = /* @__PURE__ */ new Map();
          this.valuesByTokenByElement.set(element, valuesByToken);
        }
        return valuesByToken;
      }
      parseToken(token) {
        try {
          const value = this.delegate.parseValueForToken(token);
          return {
            value
          };
        } catch (error2) {
          return {
            error: error2
          };
        }
      }
    }
    class BindingObserver {
      constructor(context, delegate) {
        this.context = context;
        this.delegate = delegate;
        this.bindingsByAction = /* @__PURE__ */ new Map();
      }
      start() {
        if (!this.valueListObserver) {
          this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
          this.valueListObserver.start();
        }
      }
      stop() {
        if (this.valueListObserver) {
          this.valueListObserver.stop();
          delete this.valueListObserver;
          this.disconnectAllActions();
        }
      }
      get element() {
        return this.context.element;
      }
      get identifier() {
        return this.context.identifier;
      }
      get actionAttribute() {
        return this.schema.actionAttribute;
      }
      get schema() {
        return this.context.schema;
      }
      get bindings() {
        return Array.from(this.bindingsByAction.values());
      }
      connectAction(action) {
        const binding = new Binding(this.context, action);
        this.bindingsByAction.set(action, binding);
        this.delegate.bindingConnected(binding);
      }
      disconnectAction(action) {
        const binding = this.bindingsByAction.get(action);
        if (binding) {
          this.bindingsByAction.delete(action);
          this.delegate.bindingDisconnected(binding);
        }
      }
      disconnectAllActions() {
        this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding));
        this.bindingsByAction.clear();
      }
      parseValueForToken(token) {
        const action = Action.forToken(token);
        if (action.identifier == this.identifier) {
          return action;
        }
      }
      elementMatchedValue(element, action) {
        this.connectAction(action);
      }
      elementUnmatchedValue(element, action) {
        this.disconnectAction(action);
      }
    }
    class ValueObserver {
      constructor(context, receiver) {
        this.context = context;
        this.receiver = receiver;
        this.stringMapObserver = new StringMapObserver(this.element, this);
        this.valueDescriptorMap = this.controller.valueDescriptorMap;
        this.invokeChangedCallbacksForDefaultValues();
      }
      start() {
        this.stringMapObserver.start();
      }
      stop() {
        this.stringMapObserver.stop();
      }
      get element() {
        return this.context.element;
      }
      get controller() {
        return this.context.controller;
      }
      getStringMapKeyForAttribute(attributeName) {
        if (attributeName in this.valueDescriptorMap) {
          return this.valueDescriptorMap[attributeName].name;
        }
      }
      stringMapKeyAdded(key, attributeName) {
        const descriptor = this.valueDescriptorMap[attributeName];
        if (!this.hasValue(key)) {
          this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
        }
      }
      stringMapValueChanged(value, name, oldValue) {
        const descriptor = this.valueDescriptorNameMap[name];
        if (value === null)
          return;
        if (oldValue === null) {
          oldValue = descriptor.writer(descriptor.defaultValue);
        }
        this.invokeChangedCallback(name, value, oldValue);
      }
      stringMapKeyRemoved(key, attributeName, oldValue) {
        const descriptor = this.valueDescriptorNameMap[key];
        if (this.hasValue(key)) {
          this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
        } else {
          this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
        }
      }
      invokeChangedCallbacksForDefaultValues() {
        for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
          if (defaultValue != void 0 && !this.controller.data.has(key)) {
            this.invokeChangedCallback(name, writer(defaultValue), void 0);
          }
        }
      }
      invokeChangedCallback(name, rawValue, rawOldValue) {
        const changedMethodName = `${name}Changed`;
        const changedMethod = this.receiver[changedMethodName];
        if (typeof changedMethod == "function") {
          const descriptor = this.valueDescriptorNameMap[name];
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        }
      }
      get valueDescriptors() {
        const { valueDescriptorMap } = this;
        return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
      }
      get valueDescriptorNameMap() {
        const descriptors = {};
        Object.keys(this.valueDescriptorMap).forEach((key) => {
          const descriptor = this.valueDescriptorMap[key];
          descriptors[descriptor.name] = descriptor;
        });
        return descriptors;
      }
      hasValue(attributeName) {
        const descriptor = this.valueDescriptorNameMap[attributeName];
        const hasMethodName = `has${capitalize(descriptor.name)}`;
        return this.receiver[hasMethodName];
      }
    }
    class TargetObserver {
      constructor(context, delegate) {
        this.context = context;
        this.delegate = delegate;
        this.targetsByName = new Multimap();
      }
      start() {
        if (!this.tokenListObserver) {
          this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
          this.tokenListObserver.start();
        }
      }
      stop() {
        if (this.tokenListObserver) {
          this.disconnectAllTargets();
          this.tokenListObserver.stop();
          delete this.tokenListObserver;
        }
      }
      tokenMatched({ element, content: name }) {
        if (this.scope.containsElement(element)) {
          this.connectTarget(element, name);
        }
      }
      tokenUnmatched({ element, content: name }) {
        this.disconnectTarget(element, name);
      }
      connectTarget(element, name) {
        var _a;
        if (!this.targetsByName.has(name, element)) {
          this.targetsByName.add(name, element);
          (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
        }
      }
      disconnectTarget(element, name) {
        var _a;
        if (this.targetsByName.has(name, element)) {
          this.targetsByName.delete(name, element);
          (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
        }
      }
      disconnectAllTargets() {
        for (const name of this.targetsByName.keys) {
          for (const element of this.targetsByName.getValuesForKey(name)) {
            this.disconnectTarget(element, name);
          }
        }
      }
      get attributeName() {
        return `data-${this.context.identifier}-target`;
      }
      get element() {
        return this.context.element;
      }
      get scope() {
        return this.context.scope;
      }
    }
    class Context {
      constructor(module2, scope) {
        this.logDebugActivity = (functionName, detail = {}) => {
          const { identifier, controller, element } = this;
          detail = Object.assign({
            identifier,
            controller,
            element
          }, detail);
          this.application.logDebugActivity(this.identifier, functionName, detail);
        };
        this.module = module2;
        this.scope = scope;
        this.controller = new module2.controllerConstructor(this);
        this.bindingObserver = new BindingObserver(this, this.dispatcher);
        this.valueObserver = new ValueObserver(this, this.controller);
        this.targetObserver = new TargetObserver(this, this);
        try {
          this.controller.initialize();
          this.logDebugActivity("initialize");
        } catch (error2) {
          this.handleError(error2, "initializing controller");
        }
      }
      connect() {
        this.bindingObserver.start();
        this.valueObserver.start();
        this.targetObserver.start();
        try {
          this.controller.connect();
          this.logDebugActivity("connect");
        } catch (error2) {
          this.handleError(error2, "connecting controller");
        }
      }
      disconnect() {
        try {
          this.controller.disconnect();
          this.logDebugActivity("disconnect");
        } catch (error2) {
          this.handleError(error2, "disconnecting controller");
        }
        this.targetObserver.stop();
        this.valueObserver.stop();
        this.bindingObserver.stop();
      }
      get application() {
        return this.module.application;
      }
      get identifier() {
        return this.module.identifier;
      }
      get schema() {
        return this.application.schema;
      }
      get dispatcher() {
        return this.application.dispatcher;
      }
      get element() {
        return this.scope.element;
      }
      get parentElement() {
        return this.element.parentElement;
      }
      handleError(error2, message, detail = {}) {
        const { identifier, controller, element } = this;
        detail = Object.assign({
          identifier,
          controller,
          element
        }, detail);
        this.application.handleError(error2, `Error ${message}`, detail);
      }
      targetConnected(element, name) {
        this.invokeControllerMethod(`${name}TargetConnected`, element);
      }
      targetDisconnected(element, name) {
        this.invokeControllerMethod(`${name}TargetDisconnected`, element);
      }
      invokeControllerMethod(methodName, ...args) {
        const controller = this.controller;
        if (typeof controller[methodName] == "function") {
          controller[methodName](...args);
        }
      }
    }
    function readInheritableStaticArrayValues(constructor, propertyName) {
      const ancestors = getAncestorsForConstructor(constructor);
      return Array.from(ancestors.reduce((values, constructor2) => {
        getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
        return values;
      }, /* @__PURE__ */ new Set()));
    }
    function readInheritableStaticObjectPairs(constructor, propertyName) {
      const ancestors = getAncestorsForConstructor(constructor);
      return ancestors.reduce((pairs, constructor2) => {
        pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
        return pairs;
      }, []);
    }
    function getAncestorsForConstructor(constructor) {
      const ancestors = [];
      while (constructor) {
        ancestors.push(constructor);
        constructor = Object.getPrototypeOf(constructor);
      }
      return ancestors.reverse();
    }
    function getOwnStaticArrayValues(constructor, propertyName) {
      const definition = constructor[propertyName];
      return Array.isArray(definition) ? definition : [];
    }
    function getOwnStaticObjectPairs(constructor, propertyName) {
      const definition = constructor[propertyName];
      return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
    }
    function bless(constructor) {
      return shadow(constructor, getBlessedProperties(constructor));
    }
    function shadow(constructor, properties) {
      const shadowConstructor = extend$1(constructor);
      const shadowProperties = getShadowProperties(constructor.prototype, properties);
      Object.defineProperties(shadowConstructor.prototype, shadowProperties);
      return shadowConstructor;
    }
    function getBlessedProperties(constructor) {
      const blessings = readInheritableStaticArrayValues(constructor, "blessings");
      return blessings.reduce((blessedProperties, blessing) => {
        const properties = blessing(constructor);
        for (const key in properties) {
          const descriptor = blessedProperties[key] || {};
          blessedProperties[key] = Object.assign(descriptor, properties[key]);
        }
        return blessedProperties;
      }, {});
    }
    function getShadowProperties(prototype, properties) {
      return getOwnKeys(properties).reduce((shadowProperties, key) => {
        const descriptor = getShadowedDescriptor(prototype, properties, key);
        if (descriptor) {
          Object.assign(shadowProperties, {
            [key]: descriptor
          });
        }
        return shadowProperties;
      }, {});
    }
    function getShadowedDescriptor(prototype, properties, key) {
      const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
      const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
      if (!shadowedByValue) {
        const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
        if (shadowingDescriptor) {
          descriptor.get = shadowingDescriptor.get || descriptor.get;
          descriptor.set = shadowingDescriptor.set || descriptor.set;
        }
        return descriptor;
      }
    }
    const getOwnKeys = (() => {
      if (typeof Object.getOwnPropertySymbols == "function") {
        return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
      } else {
        return Object.getOwnPropertyNames;
      }
    })();
    const extend$1 = (() => {
      function extendWithReflect(constructor) {
        function extended() {
          return Reflect.construct(constructor, arguments, new.target);
        }
        extended.prototype = Object.create(constructor.prototype, {
          constructor: {
            value: extended
          }
        });
        Reflect.setPrototypeOf(extended, constructor);
        return extended;
      }
      function testReflectExtension() {
        const a = function() {
          this.a.call(this);
        };
        const b = extendWithReflect(a);
        b.prototype.a = function() {
        };
        return new b();
      }
      try {
        testReflectExtension();
        return extendWithReflect;
      } catch (error2) {
        return (constructor) => class extended extends constructor {
        };
      }
    })();
    function blessDefinition(definition) {
      return {
        identifier: definition.identifier,
        controllerConstructor: bless(definition.controllerConstructor)
      };
    }
    class Module {
      constructor(application2, definition) {
        this.application = application2;
        this.definition = blessDefinition(definition);
        this.contextsByScope = /* @__PURE__ */ new WeakMap();
        this.connectedContexts = /* @__PURE__ */ new Set();
      }
      get identifier() {
        return this.definition.identifier;
      }
      get controllerConstructor() {
        return this.definition.controllerConstructor;
      }
      get contexts() {
        return Array.from(this.connectedContexts);
      }
      connectContextForScope(scope) {
        const context = this.fetchContextForScope(scope);
        this.connectedContexts.add(context);
        context.connect();
      }
      disconnectContextForScope(scope) {
        const context = this.contextsByScope.get(scope);
        if (context) {
          this.connectedContexts.delete(context);
          context.disconnect();
        }
      }
      fetchContextForScope(scope) {
        let context = this.contextsByScope.get(scope);
        if (!context) {
          context = new Context(this, scope);
          this.contextsByScope.set(scope, context);
        }
        return context;
      }
    }
    class ClassMap {
      constructor(scope) {
        this.scope = scope;
      }
      has(name) {
        return this.data.has(this.getDataKey(name));
      }
      get(name) {
        return this.getAll(name)[0];
      }
      getAll(name) {
        const tokenString = this.data.get(this.getDataKey(name)) || "";
        return tokenize(tokenString);
      }
      getAttributeName(name) {
        return this.data.getAttributeNameForKey(this.getDataKey(name));
      }
      getDataKey(name) {
        return `${name}-class`;
      }
      get data() {
        return this.scope.data;
      }
    }
    class DataMap {
      constructor(scope) {
        this.scope = scope;
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get(key) {
        const name = this.getAttributeNameForKey(key);
        return this.element.getAttribute(name);
      }
      set(key, value) {
        const name = this.getAttributeNameForKey(key);
        this.element.setAttribute(name, value);
        return this.get(key);
      }
      has(key) {
        const name = this.getAttributeNameForKey(key);
        return this.element.hasAttribute(name);
      }
      delete(key) {
        if (this.has(key)) {
          const name = this.getAttributeNameForKey(key);
          this.element.removeAttribute(name);
          return true;
        } else {
          return false;
        }
      }
      getAttributeNameForKey(key) {
        return `data-${this.identifier}-${dasherize(key)}`;
      }
    }
    class Guide {
      constructor(logger) {
        this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
        this.logger = logger;
      }
      warn(object, key, message) {
        let warnedKeys = this.warnedKeysByObject.get(object);
        if (!warnedKeys) {
          warnedKeys = /* @__PURE__ */ new Set();
          this.warnedKeysByObject.set(object, warnedKeys);
        }
        if (!warnedKeys.has(key)) {
          warnedKeys.add(key);
          this.logger.warn(message, object);
        }
      }
    }
    function attributeValueContainsToken(attributeName, token) {
      return `[${attributeName}~="${token}"]`;
    }
    class TargetSet {
      constructor(scope) {
        this.scope = scope;
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get schema() {
        return this.scope.schema;
      }
      has(targetName) {
        return this.find(targetName) != null;
      }
      find(...targetNames) {
        return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
      }
      findAll(...targetNames) {
        return targetNames.reduce((targets, targetName) => [...targets, ...this.findAllTargets(targetName), ...this.findAllLegacyTargets(targetName)], []);
      }
      findTarget(targetName) {
        const selector = this.getSelectorForTargetName(targetName);
        return this.scope.findElement(selector);
      }
      findAllTargets(targetName) {
        const selector = this.getSelectorForTargetName(targetName);
        return this.scope.findAllElements(selector);
      }
      getSelectorForTargetName(targetName) {
        const attributeName = this.schema.targetAttributeForScope(this.identifier);
        return attributeValueContainsToken(attributeName, targetName);
      }
      findLegacyTarget(targetName) {
        const selector = this.getLegacySelectorForTargetName(targetName);
        return this.deprecate(this.scope.findElement(selector), targetName);
      }
      findAllLegacyTargets(targetName) {
        const selector = this.getLegacySelectorForTargetName(targetName);
        return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
      }
      getLegacySelectorForTargetName(targetName) {
        const targetDescriptor = `${this.identifier}.${targetName}`;
        return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
      }
      deprecate(element, targetName) {
        if (element) {
          const { identifier } = this;
          const attributeName = this.schema.targetAttribute;
          const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
          this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
        }
        return element;
      }
      get guide() {
        return this.scope.guide;
      }
    }
    class Scope {
      constructor(schema, element, identifier, logger) {
        this.targets = new TargetSet(this);
        this.classes = new ClassMap(this);
        this.data = new DataMap(this);
        this.containsElement = (element2) => element2.closest(this.controllerSelector) === this.element;
        this.schema = schema;
        this.element = element;
        this.identifier = identifier;
        this.guide = new Guide(logger);
      }
      findElement(selector) {
        return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
      }
      findAllElements(selector) {
        return [...this.element.matches(selector) ? [this.element] : [], ...this.queryElements(selector).filter(this.containsElement)];
      }
      queryElements(selector) {
        return Array.from(this.element.querySelectorAll(selector));
      }
      get controllerSelector() {
        return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
      }
    }
    class ScopeObserver {
      constructor(element, schema, delegate) {
        this.element = element;
        this.schema = schema;
        this.delegate = delegate;
        this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
        this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
        this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
      }
      start() {
        this.valueListObserver.start();
      }
      stop() {
        this.valueListObserver.stop();
      }
      get controllerAttribute() {
        return this.schema.controllerAttribute;
      }
      parseValueForToken(token) {
        const { element, content: identifier } = token;
        const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
        let scope = scopesByIdentifier.get(identifier);
        if (!scope) {
          scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
          scopesByIdentifier.set(identifier, scope);
        }
        return scope;
      }
      elementMatchedValue(element, value) {
        const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
        this.scopeReferenceCounts.set(value, referenceCount);
        if (referenceCount == 1) {
          this.delegate.scopeConnected(value);
        }
      }
      elementUnmatchedValue(element, value) {
        const referenceCount = this.scopeReferenceCounts.get(value);
        if (referenceCount) {
          this.scopeReferenceCounts.set(value, referenceCount - 1);
          if (referenceCount == 1) {
            this.delegate.scopeDisconnected(value);
          }
        }
      }
      fetchScopesByIdentifierForElement(element) {
        let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
        if (!scopesByIdentifier) {
          scopesByIdentifier = /* @__PURE__ */ new Map();
          this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
        }
        return scopesByIdentifier;
      }
    }
    class Router {
      constructor(application2) {
        this.application = application2;
        this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
        this.scopesByIdentifier = new Multimap();
        this.modulesByIdentifier = /* @__PURE__ */ new Map();
      }
      get element() {
        return this.application.element;
      }
      get schema() {
        return this.application.schema;
      }
      get logger() {
        return this.application.logger;
      }
      get controllerAttribute() {
        return this.schema.controllerAttribute;
      }
      get modules() {
        return Array.from(this.modulesByIdentifier.values());
      }
      get contexts() {
        return this.modules.reduce((contexts, module2) => contexts.concat(module2.contexts), []);
      }
      start() {
        this.scopeObserver.start();
      }
      stop() {
        this.scopeObserver.stop();
      }
      loadDefinition(definition) {
        this.unloadIdentifier(definition.identifier);
        const module2 = new Module(this.application, definition);
        this.connectModule(module2);
      }
      unloadIdentifier(identifier) {
        const module2 = this.modulesByIdentifier.get(identifier);
        if (module2) {
          this.disconnectModule(module2);
        }
      }
      getContextForElementAndIdentifier(element, identifier) {
        const module2 = this.modulesByIdentifier.get(identifier);
        if (module2) {
          return module2.contexts.find((context) => context.element == element);
        }
      }
      handleError(error2, message, detail) {
        this.application.handleError(error2, message, detail);
      }
      createScopeForElementAndIdentifier(element, identifier) {
        return new Scope(this.schema, element, identifier, this.logger);
      }
      scopeConnected(scope) {
        this.scopesByIdentifier.add(scope.identifier, scope);
        const module2 = this.modulesByIdentifier.get(scope.identifier);
        if (module2) {
          module2.connectContextForScope(scope);
        }
      }
      scopeDisconnected(scope) {
        this.scopesByIdentifier.delete(scope.identifier, scope);
        const module2 = this.modulesByIdentifier.get(scope.identifier);
        if (module2) {
          module2.disconnectContextForScope(scope);
        }
      }
      connectModule(module2) {
        this.modulesByIdentifier.set(module2.identifier, module2);
        const scopes = this.scopesByIdentifier.getValuesForKey(module2.identifier);
        scopes.forEach((scope) => module2.connectContextForScope(scope));
      }
      disconnectModule(module2) {
        this.modulesByIdentifier.delete(module2.identifier);
        const scopes = this.scopesByIdentifier.getValuesForKey(module2.identifier);
        scopes.forEach((scope) => module2.disconnectContextForScope(scope));
      }
    }
    const defaultSchema = {
      controllerAttribute: "data-controller",
      actionAttribute: "data-action",
      targetAttribute: "data-target",
      targetAttributeForScope: (identifier) => `data-${identifier}-target`
    };
    class Application {
      constructor(element = document.documentElement, schema = defaultSchema) {
        this.logger = console;
        this.debug = false;
        this.logDebugActivity = (identifier, functionName, detail = {}) => {
          if (this.debug) {
            this.logFormattedMessage(identifier, functionName, detail);
          }
        };
        this.element = element;
        this.schema = schema;
        this.dispatcher = new Dispatcher(this);
        this.router = new Router(this);
      }
      static start(element, schema) {
        const application2 = new Application(element, schema);
        application2.start();
        return application2;
      }
      async start() {
        await domReady();
        this.logDebugActivity("application", "starting");
        this.dispatcher.start();
        this.router.start();
        this.logDebugActivity("application", "start");
      }
      stop() {
        this.logDebugActivity("application", "stopping");
        this.dispatcher.stop();
        this.router.stop();
        this.logDebugActivity("application", "stop");
      }
      register(identifier, controllerConstructor) {
        if (controllerConstructor.shouldLoad) {
          this.load({
            identifier,
            controllerConstructor
          });
        }
      }
      load(head, ...rest) {
        const definitions = Array.isArray(head) ? head : [head, ...rest];
        definitions.forEach((definition) => this.router.loadDefinition(definition));
      }
      unload(head, ...rest) {
        const identifiers = Array.isArray(head) ? head : [head, ...rest];
        identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
      }
      get controllers() {
        return this.router.contexts.map((context) => context.controller);
      }
      getControllerForElementAndIdentifier(element, identifier) {
        const context = this.router.getContextForElementAndIdentifier(element, identifier);
        return context ? context.controller : null;
      }
      handleError(error2, message, detail) {
        var _a;
        this.logger.error(`%s

%o

%o`, message, error2, detail);
        (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
      }
      logFormattedMessage(identifier, functionName, detail = {}) {
        detail = Object.assign({
          application: this
        }, detail);
        this.logger.groupCollapsed(`${identifier} #${functionName}`);
        this.logger.log("details:", Object.assign({}, detail));
        this.logger.groupEnd();
      }
    }
    function domReady() {
      return new Promise((resolve) => {
        if (document.readyState == "loading") {
          document.addEventListener("DOMContentLoaded", () => resolve());
        } else {
          resolve();
        }
      });
    }
    function ClassPropertiesBlessing(constructor) {
      const classes = readInheritableStaticArrayValues(constructor, "classes");
      return classes.reduce((properties, classDefinition) => Object.assign(properties, propertiesForClassDefinition(classDefinition)), {});
    }
    function propertiesForClassDefinition(key) {
      return {
        [`${key}Class`]: {
          get() {
            const { classes } = this;
            if (classes.has(key)) {
              return classes.get(key);
            } else {
              const attribute = classes.getAttributeName(key);
              throw new Error(`Missing attribute "${attribute}"`);
            }
          }
        },
        [`${key}Classes`]: {
          get() {
            return this.classes.getAll(key);
          }
        },
        [`has${capitalize(key)}Class`]: {
          get() {
            return this.classes.has(key);
          }
        }
      };
    }
    function TargetPropertiesBlessing(constructor) {
      const targets = readInheritableStaticArrayValues(constructor, "targets");
      return targets.reduce((properties, targetDefinition) => Object.assign(properties, propertiesForTargetDefinition(targetDefinition)), {});
    }
    function propertiesForTargetDefinition(name) {
      return {
        [`${name}Target`]: {
          get() {
            const target = this.targets.find(name);
            if (target) {
              return target;
            } else {
              throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
            }
          }
        },
        [`${name}Targets`]: {
          get() {
            return this.targets.findAll(name);
          }
        },
        [`has${capitalize(name)}Target`]: {
          get() {
            return this.targets.has(name);
          }
        }
      };
    }
    function ValuePropertiesBlessing(constructor) {
      const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
      const propertyDescriptorMap = {
        valueDescriptorMap: {
          get() {
            return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
              const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair);
              const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
              return Object.assign(result, {
                [attributeName]: valueDescriptor
              });
            }, {});
          }
        }
      };
      return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair)), propertyDescriptorMap);
    }
    function propertiesForValueDefinitionPair(valueDefinitionPair) {
      const definition = parseValueDefinitionPair(valueDefinitionPair);
      const { key, name, reader: read, writer: write } = definition;
      return {
        [name]: {
          get() {
            const value = this.data.get(key);
            if (value !== null) {
              return read(value);
            } else {
              return definition.defaultValue;
            }
          },
          set(value) {
            if (value === void 0) {
              this.data.delete(key);
            } else {
              this.data.set(key, write(value));
            }
          }
        },
        [`has${capitalize(name)}`]: {
          get() {
            return this.data.has(key) || definition.hasCustomDefaultValue;
          }
        }
      };
    }
    function parseValueDefinitionPair([token, typeDefinition]) {
      return valueDescriptorForTokenAndTypeDefinition(token, typeDefinition);
    }
    function parseValueTypeConstant(constant) {
      switch (constant) {
        case Array:
          return "array";
        case Boolean:
          return "boolean";
        case Number:
          return "number";
        case Object:
          return "object";
        case String:
          return "string";
      }
    }
    function parseValueTypeDefault(defaultValue) {
      switch (typeof defaultValue) {
        case "boolean":
          return "boolean";
        case "number":
          return "number";
        case "string":
          return "string";
      }
      if (Array.isArray(defaultValue))
        return "array";
      if (Object.prototype.toString.call(defaultValue) === "[object Object]")
        return "object";
    }
    function parseValueTypeObject(typeObject) {
      const typeFromObject = parseValueTypeConstant(typeObject.type);
      if (typeFromObject) {
        const defaultValueType = parseValueTypeDefault(typeObject.default);
        if (typeFromObject !== defaultValueType) {
          throw new Error(`Type "${typeFromObject}" must match the type of the default value. Given default value: "${typeObject.default}" as "${defaultValueType}"`);
        }
        return typeFromObject;
      }
    }
    function parseValueTypeDefinition(typeDefinition) {
      const typeFromObject = parseValueTypeObject(typeDefinition);
      const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
      const typeFromConstant = parseValueTypeConstant(typeDefinition);
      const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
      if (type)
        return type;
      throw new Error(`Unknown value type "${typeDefinition}"`);
    }
    function defaultValueForDefinition(typeDefinition) {
      const constant = parseValueTypeConstant(typeDefinition);
      if (constant)
        return defaultValuesByType[constant];
      const defaultValue = typeDefinition.default;
      if (defaultValue !== void 0)
        return defaultValue;
      return typeDefinition;
    }
    function valueDescriptorForTokenAndTypeDefinition(token, typeDefinition) {
      const key = `${dasherize(token)}-value`;
      const type = parseValueTypeDefinition(typeDefinition);
      return {
        type,
        key,
        name: camelize(key),
        get defaultValue() {
          return defaultValueForDefinition(typeDefinition);
        },
        get hasCustomDefaultValue() {
          return parseValueTypeDefault(typeDefinition) !== void 0;
        },
        reader: readers[type],
        writer: writers[type] || writers.default
      };
    }
    const defaultValuesByType = {
      get array() {
        return [];
      },
      boolean: false,
      number: 0,
      get object() {
        return {};
      },
      string: ""
    };
    const readers = {
      array(value) {
        const array = JSON.parse(value);
        if (!Array.isArray(array)) {
          throw new TypeError("Expected array");
        }
        return array;
      },
      boolean(value) {
        return !(value == "0" || value == "false");
      },
      number(value) {
        return Number(value);
      },
      object(value) {
        const object = JSON.parse(value);
        if (object === null || typeof object != "object" || Array.isArray(object)) {
          throw new TypeError("Expected object");
        }
        return object;
      },
      string(value) {
        return value;
      }
    };
    const writers = {
      default: writeString,
      array: writeJSON,
      object: writeJSON
    };
    function writeJSON(value) {
      return JSON.stringify(value);
    }
    function writeString(value) {
      return `${value}`;
    }
    class Controller {
      constructor(context) {
        this.context = context;
      }
      static get shouldLoad() {
        return true;
      }
      get application() {
        return this.context.application;
      }
      get scope() {
        return this.context.scope;
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get targets() {
        return this.scope.targets;
      }
      get classes() {
        return this.scope.classes;
      }
      get data() {
        return this.scope.data;
      }
      initialize() {
      }
      connect() {
      }
      disconnect() {
      }
      dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
        const type = prefix ? `${prefix}:${eventName}` : eventName;
        const event = new CustomEvent(type, {
          detail,
          bubbles,
          cancelable
        });
        target.dispatchEvent(event);
        return event;
      }
    }
    Controller.blessings = [ClassPropertiesBlessing, TargetPropertiesBlessing, ValuePropertiesBlessing];
    Controller.targets = [];
    Controller.values = {};
    const HOOKS = ["onChange", "onClose", "onDayCreate", "onDestroy", "onKeyDown", "onMonthChange", "onOpen", "onParseConfig", "onReady", "onValueUpdate", "onYearChange", "onPreCalendarPosition"];
    const defaults$1 = {
      _disable: [],
      allowInput: false,
      allowInvalidPreload: false,
      altFormat: "F j, Y",
      altInput: false,
      altInputClass: "form-control input",
      animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
      ariaDateFormat: "F j, Y",
      autoFillDefaultTime: true,
      clickOpens: true,
      closeOnSelect: true,
      conjunction: ", ",
      dateFormat: "Y-m-d",
      defaultHour: 12,
      defaultMinute: 0,
      defaultSeconds: 0,
      disable: [],
      disableMobile: false,
      enableSeconds: false,
      enableTime: false,
      errorHandler: (err) => typeof console !== "undefined" && console.warn(err),
      getWeek: (givenDate) => {
        const date = new Date(givenDate.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        var week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 864e5 - 3 + (week1.getDay() + 6) % 7) / 7);
      },
      hourIncrement: 1,
      ignoredFocusElements: [],
      inline: false,
      locale: "default",
      minuteIncrement: 5,
      mode: "single",
      monthSelectorType: "dropdown",
      nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
      noCalendar: false,
      now: new Date(),
      onChange: [],
      onClose: [],
      onDayCreate: [],
      onDestroy: [],
      onKeyDown: [],
      onMonthChange: [],
      onOpen: [],
      onParseConfig: [],
      onReady: [],
      onValueUpdate: [],
      onYearChange: [],
      onPreCalendarPosition: [],
      plugins: [],
      position: "auto",
      positionElement: void 0,
      prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
      shorthandCurrentMonth: false,
      showMonths: 1,
      static: false,
      time_24hr: false,
      weekNumbers: false,
      wrap: false
    };
    const english = {
      weekdays: {
        shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      },
      months: {
        shorthand: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        longhand: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      },
      daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      firstDayOfWeek: 0,
      ordinal: (nth) => {
        const s = nth % 100;
        if (s > 3 && s < 21)
          return "th";
        switch (s % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      },
      rangeSeparator: " to ",
      weekAbbreviation: "Wk",
      scrollTitle: "Scroll to increment",
      toggleTitle: "Click to toggle",
      amPM: ["AM", "PM"],
      yearAriaLabel: "Year",
      monthAriaLabel: "Month",
      hourAriaLabel: "Hour",
      minuteAriaLabel: "Minute",
      time_24hr: false
    };
    const pad = (number, length = 2) => `000${number}`.slice(length * -1);
    const int = (bool) => bool === true ? 1 : 0;
    function debounce$1(fn, wait) {
      let t;
      return function() {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, arguments), wait);
      };
    }
    const arrayify = (obj) => obj instanceof Array ? obj : [obj];
    function toggleClass$1(elem, className, bool) {
      if (bool === true)
        return elem.classList.add(className);
      elem.classList.remove(className);
    }
    function createElement(tag, className, content) {
      const e = window.document.createElement(tag);
      className = className || "";
      content = content || "";
      e.className = className;
      if (content !== void 0)
        e.textContent = content;
      return e;
    }
    function clearNode(node) {
      while (node.firstChild)
        node.removeChild(node.firstChild);
    }
    function findParent(node, condition) {
      if (condition(node))
        return node;
      else if (node.parentNode)
        return findParent(node.parentNode, condition);
      return void 0;
    }
    function createNumberInput(inputClassName, opts) {
      const wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
      if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
        numInput.type = "number";
      } else {
        numInput.type = "text";
        numInput.pattern = "\\d*";
      }
      if (opts !== void 0)
        for (const key in opts)
          numInput.setAttribute(key, opts[key]);
      wrapper.appendChild(numInput);
      wrapper.appendChild(arrowUp);
      wrapper.appendChild(arrowDown);
      return wrapper;
    }
    function getEventTarget(event) {
      try {
        if (typeof event.composedPath === "function") {
          const path = event.composedPath();
          return path[0];
        }
        return event.target;
      } catch (error2) {
        return event.target;
      }
    }
    const doNothing = () => void 0;
    const monthToStr = (monthNumber, shorthand, locale) => locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
    const revFormat = {
      D: doNothing,
      F: function(dateObj, monthName, locale) {
        dateObj.setMonth(locale.months.longhand.indexOf(monthName));
      },
      G: (dateObj, hour) => {
        dateObj.setHours(parseFloat(hour));
      },
      H: (dateObj, hour) => {
        dateObj.setHours(parseFloat(hour));
      },
      J: (dateObj, day) => {
        dateObj.setDate(parseFloat(day));
      },
      K: (dateObj, amPM, locale) => {
        dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
      },
      M: function(dateObj, shortMonth, locale) {
        dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
      },
      S: (dateObj, seconds) => {
        dateObj.setSeconds(parseFloat(seconds));
      },
      U: (_, unixSeconds) => new Date(parseFloat(unixSeconds) * 1e3),
      W: function(dateObj, weekNum, locale) {
        const weekNumber = parseInt(weekNum);
        const date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
        date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
        return date;
      },
      Y: (dateObj, year) => {
        dateObj.setFullYear(parseFloat(year));
      },
      Z: (_, ISODate) => new Date(ISODate),
      d: (dateObj, day) => {
        dateObj.setDate(parseFloat(day));
      },
      h: (dateObj, hour) => {
        dateObj.setHours(parseFloat(hour));
      },
      i: (dateObj, minutes) => {
        dateObj.setMinutes(parseFloat(minutes));
      },
      j: (dateObj, day) => {
        dateObj.setDate(parseFloat(day));
      },
      l: doNothing,
      m: (dateObj, month) => {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      n: (dateObj, month) => {
        dateObj.setMonth(parseFloat(month) - 1);
      },
      s: (dateObj, seconds) => {
        dateObj.setSeconds(parseFloat(seconds));
      },
      u: (_, unixMillSeconds) => new Date(parseFloat(unixMillSeconds)),
      w: doNothing,
      y: (dateObj, year) => {
        dateObj.setFullYear(2e3 + parseFloat(year));
      }
    };
    const tokenRegex = {
      D: "(\\w+)",
      F: "(\\w+)",
      G: "(\\d\\d|\\d)",
      H: "(\\d\\d|\\d)",
      J: "(\\d\\d|\\d)\\w+",
      K: "",
      M: "(\\w+)",
      S: "(\\d\\d|\\d)",
      U: "(.+)",
      W: "(\\d\\d|\\d)",
      Y: "(\\d{4})",
      Z: "(.+)",
      d: "(\\d\\d|\\d)",
      h: "(\\d\\d|\\d)",
      i: "(\\d\\d|\\d)",
      j: "(\\d\\d|\\d)",
      l: "(\\w+)",
      m: "(\\d\\d|\\d)",
      n: "(\\d\\d|\\d)",
      s: "(\\d\\d|\\d)",
      u: "(.+)",
      w: "(\\d\\d|\\d)",
      y: "(\\d{2})"
    };
    const formats = {
      Z: (date) => date.toISOString(),
      D: function(date, locale, options) {
        return locale.weekdays.shorthand[formats.w(date, locale, options)];
      },
      F: function(date, locale, options) {
        return monthToStr(formats.n(date, locale, options) - 1, false, locale);
      },
      G: function(date, locale, options) {
        return pad(formats.h(date, locale, options));
      },
      H: (date) => pad(date.getHours()),
      J: function(date, locale) {
        return locale.ordinal !== void 0 ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
      },
      K: (date, locale) => locale.amPM[int(date.getHours() > 11)],
      M: function(date, locale) {
        return monthToStr(date.getMonth(), true, locale);
      },
      S: (date) => pad(date.getSeconds()),
      U: (date) => date.getTime() / 1e3,
      W: function(date, _, options) {
        return options.getWeek(date);
      },
      Y: (date) => pad(date.getFullYear(), 4),
      d: (date) => pad(date.getDate()),
      h: (date) => date.getHours() % 12 ? date.getHours() % 12 : 12,
      i: (date) => pad(date.getMinutes()),
      j: (date) => date.getDate(),
      l: function(date, locale) {
        return locale.weekdays.longhand[date.getDay()];
      },
      m: (date) => pad(date.getMonth() + 1),
      n: (date) => date.getMonth() + 1,
      s: (date) => date.getSeconds(),
      u: (date) => date.getTime(),
      w: (date) => date.getDay(),
      y: (date) => String(date.getFullYear()).substring(2)
    };
    const createDateFormatter = ({ config = defaults$1, l10n = english, isMobile = false }) => (dateObj, frmt, overrideLocale) => {
      const locale = overrideLocale || l10n;
      if (config.formatDate !== void 0 && !isMobile) {
        return config.formatDate(dateObj, frmt, locale);
      }
      return frmt.split("").map((c, i, arr) => formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "").join("");
    };
    const createDateParser = ({ config = defaults$1, l10n = english }) => (date, givenFormat, timeless, customLocale) => {
      if (date !== 0 && !date)
        return void 0;
      const locale = customLocale || l10n;
      let parsedDate;
      const dateOrig = date;
      if (date instanceof Date)
        parsedDate = new Date(date.getTime());
      else if (typeof date !== "string" && date.toFixed !== void 0)
        parsedDate = new Date(date);
      else if (typeof date === "string") {
        const format = givenFormat || (config || defaults$1).dateFormat;
        const datestr = String(date).trim();
        if (datestr === "today") {
          parsedDate = new Date();
          timeless = true;
        } else if (/Z$/.test(datestr) || /GMT$/.test(datestr))
          parsedDate = new Date(date);
        else if (config && config.parseDate)
          parsedDate = config.parseDate(date, format);
        else {
          parsedDate = !config || !config.noCalendar ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0) : new Date(new Date().setHours(0, 0, 0, 0));
          let matched, ops = [];
          for (let i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
            const token = format[i];
            const isBackSlash = token === "\\";
            const escaped = format[i - 1] === "\\" || isBackSlash;
            if (tokenRegex[token] && !escaped) {
              regexStr += tokenRegex[token];
              const match = new RegExp(regexStr).exec(date);
              if (match && (matched = true)) {
                ops[token !== "Y" ? "push" : "unshift"]({
                  fn: revFormat[token],
                  val: match[++matchIndex]
                });
              }
            } else if (!isBackSlash)
              regexStr += ".";
            ops.forEach(({ fn, val }) => parsedDate = fn(parsedDate, val, locale) || parsedDate);
          }
          parsedDate = matched ? parsedDate : void 0;
        }
      }
      if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
        config.errorHandler(new Error(`Invalid date provided: ${dateOrig}`));
        return void 0;
      }
      if (timeless === true)
        parsedDate.setHours(0, 0, 0, 0);
      return parsedDate;
    };
    function compareDates(date1, date2, timeless = true) {
      if (timeless !== false) {
        return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
      }
      return date1.getTime() - date2.getTime();
    }
    const isBetween = (ts, ts1, ts2) => ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
    const duration = {
      DAY: 864e5
    };
    function getDefaultHours(config) {
      let hours = config.defaultHour;
      let minutes = config.defaultMinute;
      let seconds = config.defaultSeconds;
      if (config.minDate !== void 0) {
        const minHour = config.minDate.getHours();
        const minMinutes = config.minDate.getMinutes();
        const minSeconds = config.minDate.getSeconds();
        if (hours < minHour) {
          hours = minHour;
        }
        if (hours === minHour && minutes < minMinutes) {
          minutes = minMinutes;
        }
        if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
          seconds = config.minDate.getSeconds();
      }
      if (config.maxDate !== void 0) {
        const maxHr = config.maxDate.getHours();
        const maxMinutes = config.maxDate.getMinutes();
        hours = Math.min(hours, maxHr);
        if (hours === maxHr)
          minutes = Math.min(maxMinutes, minutes);
        if (hours === maxHr && minutes === maxMinutes)
          seconds = config.maxDate.getSeconds();
      }
      return {
        hours,
        minutes,
        seconds
      };
    }
    if (typeof Object.assign !== "function") {
      Object.assign = function(target, ...args) {
        if (!target) {
          throw TypeError("Cannot convert undefined or null to object");
        }
        for (const source of args) {
          if (source) {
            Object.keys(source).forEach((key) => target[key] = source[key]);
          }
        }
        return target;
      };
    }
    const DEBOUNCED_CHANGE_MS = 300;
    function FlatpickrInstance(element, instanceConfig) {
      const self2 = {
        config: Object.assign(Object.assign({}, defaults$1), flatpickr.defaultConfig),
        l10n: english
      };
      self2.parseDate = createDateParser({
        config: self2.config,
        l10n: self2.l10n
      });
      self2._handlers = [];
      self2.pluginElements = [];
      self2.loadedPlugins = [];
      self2._bind = bind;
      self2._setHoursFromDate = setHoursFromDate;
      self2._positionCalendar = positionCalendar;
      self2.changeMonth = changeMonth;
      self2.changeYear = changeYear;
      self2.clear = clear;
      self2.close = close;
      self2._createElement = createElement;
      self2.destroy = destroy2;
      self2.isEnabled = isEnabled;
      self2.jumpToDate = jumpToDate;
      self2.open = open;
      self2.redraw = redraw;
      self2.set = set;
      self2.setDate = setDate;
      self2.toggle = toggle;
      function setupHelperFunctions() {
        self2.utils = {
          getDaysInMonth(month = self2.currentMonth, yr = self2.currentYear) {
            if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0))
              return 29;
            return self2.l10n.daysInMonth[month];
          }
        };
      }
      function init() {
        self2.element = self2.input = element;
        self2.isOpen = false;
        parseConfig();
        setupLocale();
        setupInputs();
        setupDates();
        setupHelperFunctions();
        if (!self2.isMobile)
          build();
        bindEvents();
        if (self2.selectedDates.length || self2.config.noCalendar) {
          if (self2.config.enableTime) {
            setHoursFromDate(self2.config.noCalendar ? self2.latestSelectedDateObj : void 0);
          }
          updateValue(false);
        }
        setCalendarWidth();
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (!self2.isMobile && isSafari) {
          positionCalendar();
        }
        triggerEvent("onReady");
      }
      function bindToInstance(fn) {
        return fn.bind(self2);
      }
      function setCalendarWidth() {
        const config = self2.config;
        if (config.weekNumbers === false && config.showMonths === 1) {
          return;
        } else if (config.noCalendar !== true) {
          window.requestAnimationFrame(function() {
            if (self2.calendarContainer !== void 0) {
              self2.calendarContainer.style.visibility = "hidden";
              self2.calendarContainer.style.display = "block";
            }
            if (self2.daysContainer !== void 0) {
              const daysWidth = (self2.days.offsetWidth + 1) * config.showMonths;
              self2.daysContainer.style.width = daysWidth + "px";
              self2.calendarContainer.style.width = daysWidth + (self2.weekWrapper !== void 0 ? self2.weekWrapper.offsetWidth : 0) + "px";
              self2.calendarContainer.style.removeProperty("visibility");
              self2.calendarContainer.style.removeProperty("display");
            }
          });
        }
      }
      function updateTime(e) {
        if (self2.selectedDates.length === 0) {
          const defaultDate = self2.config.minDate === void 0 || compareDates(new Date(), self2.config.minDate) >= 0 ? new Date() : new Date(self2.config.minDate.getTime());
          const defaults2 = getDefaultHours(self2.config);
          defaultDate.setHours(defaults2.hours, defaults2.minutes, defaults2.seconds, defaultDate.getMilliseconds());
          self2.selectedDates = [defaultDate];
          self2.latestSelectedDateObj = defaultDate;
        }
        if (e !== void 0 && e.type !== "blur") {
          timeWrapper(e);
        }
        const prevValue = self2._input.value;
        setHoursFromInputs();
        updateValue();
        if (self2._input.value !== prevValue) {
          self2._debouncedChange();
        }
      }
      function ampm2military(hour, amPM) {
        return hour % 12 + 12 * int(amPM === self2.l10n.amPM[1]);
      }
      function military2ampm(hour) {
        switch (hour % 24) {
          case 0:
          case 12:
            return 12;
          default:
            return hour % 12;
        }
      }
      function setHoursFromInputs() {
        if (self2.hourElement === void 0 || self2.minuteElement === void 0)
          return;
        let hours = (parseInt(self2.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self2.minuteElement.value, 10) || 0) % 60, seconds = self2.secondElement !== void 0 ? (parseInt(self2.secondElement.value, 10) || 0) % 60 : 0;
        if (self2.amPM !== void 0) {
          hours = ampm2military(hours, self2.amPM.textContent);
        }
        const limitMinHours = self2.config.minTime !== void 0 || self2.config.minDate && self2.minDateHasTime && self2.latestSelectedDateObj && compareDates(self2.latestSelectedDateObj, self2.config.minDate, true) === 0;
        const limitMaxHours = self2.config.maxTime !== void 0 || self2.config.maxDate && self2.maxDateHasTime && self2.latestSelectedDateObj && compareDates(self2.latestSelectedDateObj, self2.config.maxDate, true) === 0;
        if (limitMaxHours) {
          const maxTime = self2.config.maxTime !== void 0 ? self2.config.maxTime : self2.config.maxDate;
          hours = Math.min(hours, maxTime.getHours());
          if (hours === maxTime.getHours())
            minutes = Math.min(minutes, maxTime.getMinutes());
          if (minutes === maxTime.getMinutes())
            seconds = Math.min(seconds, maxTime.getSeconds());
        }
        if (limitMinHours) {
          const minTime = self2.config.minTime !== void 0 ? self2.config.minTime : self2.config.minDate;
          hours = Math.max(hours, minTime.getHours());
          if (hours === minTime.getHours() && minutes < minTime.getMinutes())
            minutes = minTime.getMinutes();
          if (minutes === minTime.getMinutes())
            seconds = Math.max(seconds, minTime.getSeconds());
        }
        setHours(hours, minutes, seconds);
      }
      function setHoursFromDate(dateObj) {
        const date = dateObj || self2.latestSelectedDateObj;
        if (date) {
          setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
      }
      function setHours(hours, minutes, seconds) {
        if (self2.latestSelectedDateObj !== void 0) {
          self2.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
        }
        if (!self2.hourElement || !self2.minuteElement || self2.isMobile)
          return;
        self2.hourElement.value = pad(!self2.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
        self2.minuteElement.value = pad(minutes);
        if (self2.amPM !== void 0)
          self2.amPM.textContent = self2.l10n.amPM[int(hours >= 12)];
        if (self2.secondElement !== void 0)
          self2.secondElement.value = pad(seconds);
      }
      function onYearInput(event) {
        const eventTarget = getEventTarget(event);
        const year = parseInt(eventTarget.value) + (event.delta || 0);
        if (year / 1e3 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
          changeYear(year);
        }
      }
      function bind(element2, event, handler, options) {
        if (event instanceof Array)
          return event.forEach((ev) => bind(element2, ev, handler, options));
        if (element2 instanceof Array)
          return element2.forEach((el) => bind(el, event, handler, options));
        element2.addEventListener(event, handler, options);
        self2._handlers.push({
          remove: () => element2.removeEventListener(event, handler)
        });
      }
      function triggerChange() {
        triggerEvent("onChange");
      }
      function bindEvents() {
        if (self2.config.wrap) {
          ["open", "close", "toggle", "clear"].forEach((evt) => {
            Array.prototype.forEach.call(self2.element.querySelectorAll(`[data-${evt}]`), (el) => bind(el, "click", self2[evt]));
          });
        }
        if (self2.isMobile) {
          setupMobile();
          return;
        }
        const debouncedResize = debounce$1(onResize, 50);
        self2._debouncedChange = debounce$1(triggerChange, DEBOUNCED_CHANGE_MS);
        if (self2.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
          bind(self2.daysContainer, "mouseover", (e) => {
            if (self2.config.mode === "range")
              onMouseOver(getEventTarget(e));
          });
        bind(window.document.body, "keydown", onKeyDown);
        if (!self2.config.inline && !self2.config.static)
          bind(window, "resize", debouncedResize);
        if (window.ontouchstart !== void 0)
          bind(window.document, "touchstart", documentClick);
        else
          bind(window.document, "mousedown", documentClick);
        bind(window.document, "focus", documentClick, {
          capture: true
        });
        if (self2.config.clickOpens === true) {
          bind(self2._input, "focus", self2.open);
          bind(self2._input, "click", self2.open);
        }
        if (self2.daysContainer !== void 0) {
          bind(self2.monthNav, "click", onMonthNavClick);
          bind(self2.monthNav, ["keyup", "increment"], onYearInput);
          bind(self2.daysContainer, "click", selectDate);
        }
        if (self2.timeContainer !== void 0 && self2.minuteElement !== void 0 && self2.hourElement !== void 0) {
          const selText = (e) => getEventTarget(e).select();
          bind(self2.timeContainer, ["increment"], updateTime);
          bind(self2.timeContainer, "blur", updateTime, {
            capture: true
          });
          bind(self2.timeContainer, "click", timeIncrement);
          bind([self2.hourElement, self2.minuteElement], ["focus", "click"], selText);
          if (self2.secondElement !== void 0)
            bind(self2.secondElement, "focus", () => self2.secondElement && self2.secondElement.select());
          if (self2.amPM !== void 0) {
            bind(self2.amPM, "click", (e) => {
              updateTime(e);
              triggerChange();
            });
          }
        }
        if (self2.config.allowInput) {
          bind(self2._input, "blur", onBlur);
        }
      }
      function jumpToDate(jumpDate, triggerChange2) {
        const jumpTo = jumpDate !== void 0 ? self2.parseDate(jumpDate) : self2.latestSelectedDateObj || (self2.config.minDate && self2.config.minDate > self2.now ? self2.config.minDate : self2.config.maxDate && self2.config.maxDate < self2.now ? self2.config.maxDate : self2.now);
        const oldYear = self2.currentYear;
        const oldMonth = self2.currentMonth;
        try {
          if (jumpTo !== void 0) {
            self2.currentYear = jumpTo.getFullYear();
            self2.currentMonth = jumpTo.getMonth();
          }
        } catch (e) {
          e.message = "Invalid date supplied: " + jumpTo;
          self2.config.errorHandler(e);
        }
        if (triggerChange2 && self2.currentYear !== oldYear) {
          triggerEvent("onYearChange");
          buildMonthSwitch();
        }
        if (triggerChange2 && (self2.currentYear !== oldYear || self2.currentMonth !== oldMonth)) {
          triggerEvent("onMonthChange");
        }
        self2.redraw();
      }
      function timeIncrement(e) {
        const eventTarget = getEventTarget(e);
        if (~eventTarget.className.indexOf("arrow"))
          incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
      }
      function incrementNumInput(e, delta, inputElem) {
        const target = e && getEventTarget(e);
        const input = inputElem || target && target.parentNode && target.parentNode.firstChild;
        const event = createEvent("increment");
        event.delta = delta;
        input && input.dispatchEvent(event);
      }
      function build() {
        const fragment = window.document.createDocumentFragment();
        self2.calendarContainer = createElement("div", "flatpickr-calendar");
        self2.calendarContainer.tabIndex = -1;
        if (!self2.config.noCalendar) {
          fragment.appendChild(buildMonthNav());
          self2.innerContainer = createElement("div", "flatpickr-innerContainer");
          if (self2.config.weekNumbers) {
            const { weekWrapper, weekNumbers } = buildWeeks();
            self2.innerContainer.appendChild(weekWrapper);
            self2.weekNumbers = weekNumbers;
            self2.weekWrapper = weekWrapper;
          }
          self2.rContainer = createElement("div", "flatpickr-rContainer");
          self2.rContainer.appendChild(buildWeekdays());
          if (!self2.daysContainer) {
            self2.daysContainer = createElement("div", "flatpickr-days");
            self2.daysContainer.tabIndex = -1;
          }
          buildDays();
          self2.rContainer.appendChild(self2.daysContainer);
          self2.innerContainer.appendChild(self2.rContainer);
          fragment.appendChild(self2.innerContainer);
        }
        if (self2.config.enableTime) {
          fragment.appendChild(buildTime());
        }
        toggleClass$1(self2.calendarContainer, "rangeMode", self2.config.mode === "range");
        toggleClass$1(self2.calendarContainer, "animate", self2.config.animate === true);
        toggleClass$1(self2.calendarContainer, "multiMonth", self2.config.showMonths > 1);
        self2.calendarContainer.appendChild(fragment);
        const customAppend = self2.config.appendTo !== void 0 && self2.config.appendTo.nodeType !== void 0;
        if (self2.config.inline || self2.config.static) {
          self2.calendarContainer.classList.add(self2.config.inline ? "inline" : "static");
          if (self2.config.inline) {
            if (!customAppend && self2.element.parentNode)
              self2.element.parentNode.insertBefore(self2.calendarContainer, self2._input.nextSibling);
            else if (self2.config.appendTo !== void 0)
              self2.config.appendTo.appendChild(self2.calendarContainer);
          }
          if (self2.config.static) {
            const wrapper = createElement("div", "flatpickr-wrapper");
            if (self2.element.parentNode)
              self2.element.parentNode.insertBefore(wrapper, self2.element);
            wrapper.appendChild(self2.element);
            if (self2.altInput)
              wrapper.appendChild(self2.altInput);
            wrapper.appendChild(self2.calendarContainer);
          }
        }
        if (!self2.config.static && !self2.config.inline)
          (self2.config.appendTo !== void 0 ? self2.config.appendTo : window.document.body).appendChild(self2.calendarContainer);
      }
      function createDay(className, date, dayNumber, i) {
        const dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", "flatpickr-day " + className, date.getDate().toString());
        dayElement.dateObj = date;
        dayElement.$i = i;
        dayElement.setAttribute("aria-label", self2.formatDate(date, self2.config.ariaDateFormat));
        if (className.indexOf("hidden") === -1 && compareDates(date, self2.now) === 0) {
          self2.todayDateElem = dayElement;
          dayElement.classList.add("today");
          dayElement.setAttribute("aria-current", "date");
        }
        if (dateIsEnabled) {
          dayElement.tabIndex = -1;
          if (isDateSelected(date)) {
            dayElement.classList.add("selected");
            self2.selectedDateElem = dayElement;
            if (self2.config.mode === "range") {
              toggleClass$1(dayElement, "startRange", self2.selectedDates[0] && compareDates(date, self2.selectedDates[0], true) === 0);
              toggleClass$1(dayElement, "endRange", self2.selectedDates[1] && compareDates(date, self2.selectedDates[1], true) === 0);
              if (className === "nextMonthDay")
                dayElement.classList.add("inRange");
            }
          }
        } else {
          dayElement.classList.add("flatpickr-disabled");
        }
        if (self2.config.mode === "range") {
          if (isDateInRange(date) && !isDateSelected(date))
            dayElement.classList.add("inRange");
        }
        if (self2.weekNumbers && self2.config.showMonths === 1 && className !== "prevMonthDay" && dayNumber % 7 === 1) {
          self2.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self2.config.getWeek(date) + "</span>");
        }
        triggerEvent("onDayCreate", dayElement);
        return dayElement;
      }
      function focusOnDayElem(targetNode) {
        targetNode.focus();
        if (self2.config.mode === "range")
          onMouseOver(targetNode);
      }
      function getFirstAvailableDay(delta) {
        const startMonth = delta > 0 ? 0 : self2.config.showMonths - 1;
        const endMonth = delta > 0 ? self2.config.showMonths : -1;
        for (let m = startMonth; m != endMonth; m += delta) {
          const month = self2.daysContainer.children[m];
          const startIndex = delta > 0 ? 0 : month.children.length - 1;
          const endIndex = delta > 0 ? month.children.length : -1;
          for (let i = startIndex; i != endIndex; i += delta) {
            const c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
              return c;
          }
        }
        return void 0;
      }
      function getNextAvailableDay(current, delta) {
        const givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self2.currentMonth;
        const endMonth = delta > 0 ? self2.config.showMonths : -1;
        const loopDelta = delta > 0 ? 1 : -1;
        for (let m = givenMonth - self2.currentMonth; m != endMonth; m += loopDelta) {
          const month = self2.daysContainer.children[m];
          const startIndex = givenMonth - self2.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
          const numMonthDays = month.children.length;
          for (let i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
            const c = month.children[i];
            if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta))
              return focusOnDayElem(c);
          }
        }
        self2.changeMonth(loopDelta);
        focusOnDay(getFirstAvailableDay(loopDelta), 0);
        return void 0;
      }
      function focusOnDay(current, offset2) {
        const dayFocused = isInView(document.activeElement || document.body);
        const startElem = current !== void 0 ? current : dayFocused ? document.activeElement : self2.selectedDateElem !== void 0 && isInView(self2.selectedDateElem) ? self2.selectedDateElem : self2.todayDateElem !== void 0 && isInView(self2.todayDateElem) ? self2.todayDateElem : getFirstAvailableDay(offset2 > 0 ? 1 : -1);
        if (startElem === void 0) {
          self2._input.focus();
        } else if (!dayFocused) {
          focusOnDayElem(startElem);
        } else {
          getNextAvailableDay(startElem, offset2);
        }
      }
      function buildMonthDays(year, month) {
        const firstOfMonth = (new Date(year, month, 1).getDay() - self2.l10n.firstDayOfWeek + 7) % 7;
        const prevMonthDays = self2.utils.getDaysInMonth((month - 1 + 12) % 12, year);
        const daysInMonth = self2.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self2.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
        let dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
        for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
          days.appendChild(createDay(prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
        }
        for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
          days.appendChild(createDay("", new Date(year, month, dayNumber), dayNumber, dayIndex));
        }
        for (let dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self2.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
          days.appendChild(createDay(nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
        }
        const dayContainer = createElement("div", "dayContainer");
        dayContainer.appendChild(days);
        return dayContainer;
      }
      function buildDays() {
        if (self2.daysContainer === void 0) {
          return;
        }
        clearNode(self2.daysContainer);
        if (self2.weekNumbers)
          clearNode(self2.weekNumbers);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < self2.config.showMonths; i++) {
          const d = new Date(self2.currentYear, self2.currentMonth, 1);
          d.setMonth(self2.currentMonth + i);
          frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
        }
        self2.daysContainer.appendChild(frag);
        self2.days = self2.daysContainer.firstChild;
        if (self2.config.mode === "range" && self2.selectedDates.length === 1) {
          onMouseOver();
        }
      }
      function buildMonthSwitch() {
        if (self2.config.showMonths > 1 || self2.config.monthSelectorType !== "dropdown")
          return;
        const shouldBuildMonth = function(month) {
          if (self2.config.minDate !== void 0 && self2.currentYear === self2.config.minDate.getFullYear() && month < self2.config.minDate.getMonth()) {
            return false;
          }
          return !(self2.config.maxDate !== void 0 && self2.currentYear === self2.config.maxDate.getFullYear() && month > self2.config.maxDate.getMonth());
        };
        self2.monthsDropdownContainer.tabIndex = -1;
        self2.monthsDropdownContainer.innerHTML = "";
        for (let i = 0; i < 12; i++) {
          if (!shouldBuildMonth(i))
            continue;
          const month = createElement("option", "flatpickr-monthDropdown-month");
          month.value = new Date(self2.currentYear, i).getMonth().toString();
          month.textContent = monthToStr(i, self2.config.shorthandCurrentMonth, self2.l10n);
          month.tabIndex = -1;
          if (self2.currentMonth === i) {
            month.selected = true;
          }
          self2.monthsDropdownContainer.appendChild(month);
        }
      }
      function buildMonth() {
        const container = createElement("div", "flatpickr-month");
        const monthNavFragment = window.document.createDocumentFragment();
        let monthElement;
        if (self2.config.showMonths > 1 || self2.config.monthSelectorType === "static") {
          monthElement = createElement("span", "cur-month");
        } else {
          self2.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
          self2.monthsDropdownContainer.setAttribute("aria-label", self2.l10n.monthAriaLabel);
          bind(self2.monthsDropdownContainer, "change", (e) => {
            const target = getEventTarget(e);
            const selectedMonth = parseInt(target.value, 10);
            self2.changeMonth(selectedMonth - self2.currentMonth);
            triggerEvent("onMonthChange");
          });
          buildMonthSwitch();
          monthElement = self2.monthsDropdownContainer;
        }
        const yearInput = createNumberInput("cur-year", {
          tabindex: "-1"
        });
        const yearElement = yearInput.getElementsByTagName("input")[0];
        yearElement.setAttribute("aria-label", self2.l10n.yearAriaLabel);
        if (self2.config.minDate) {
          yearElement.setAttribute("min", self2.config.minDate.getFullYear().toString());
        }
        if (self2.config.maxDate) {
          yearElement.setAttribute("max", self2.config.maxDate.getFullYear().toString());
          yearElement.disabled = !!self2.config.minDate && self2.config.minDate.getFullYear() === self2.config.maxDate.getFullYear();
        }
        const currentMonth = createElement("div", "flatpickr-current-month");
        currentMonth.appendChild(monthElement);
        currentMonth.appendChild(yearInput);
        monthNavFragment.appendChild(currentMonth);
        container.appendChild(monthNavFragment);
        return {
          container,
          yearElement,
          monthElement
        };
      }
      function buildMonths() {
        clearNode(self2.monthNav);
        self2.monthNav.appendChild(self2.prevMonthNav);
        if (self2.config.showMonths) {
          self2.yearElements = [];
          self2.monthElements = [];
        }
        for (let m = self2.config.showMonths; m--; ) {
          const month = buildMonth();
          self2.yearElements.push(month.yearElement);
          self2.monthElements.push(month.monthElement);
          self2.monthNav.appendChild(month.container);
        }
        self2.monthNav.appendChild(self2.nextMonthNav);
      }
      function buildMonthNav() {
        self2.monthNav = createElement("div", "flatpickr-months");
        self2.yearElements = [];
        self2.monthElements = [];
        self2.prevMonthNav = createElement("span", "flatpickr-prev-month");
        self2.prevMonthNav.innerHTML = self2.config.prevArrow;
        self2.nextMonthNav = createElement("span", "flatpickr-next-month");
        self2.nextMonthNav.innerHTML = self2.config.nextArrow;
        buildMonths();
        Object.defineProperty(self2, "_hidePrevMonthArrow", {
          get: () => self2.__hidePrevMonthArrow,
          set(bool) {
            if (self2.__hidePrevMonthArrow !== bool) {
              toggleClass$1(self2.prevMonthNav, "flatpickr-disabled", bool);
              self2.__hidePrevMonthArrow = bool;
            }
          }
        });
        Object.defineProperty(self2, "_hideNextMonthArrow", {
          get: () => self2.__hideNextMonthArrow,
          set(bool) {
            if (self2.__hideNextMonthArrow !== bool) {
              toggleClass$1(self2.nextMonthNav, "flatpickr-disabled", bool);
              self2.__hideNextMonthArrow = bool;
            }
          }
        });
        self2.currentYearElement = self2.yearElements[0];
        updateNavigationCurrentMonth();
        return self2.monthNav;
      }
      function buildTime() {
        self2.calendarContainer.classList.add("hasTime");
        if (self2.config.noCalendar)
          self2.calendarContainer.classList.add("noCalendar");
        const defaults2 = getDefaultHours(self2.config);
        self2.timeContainer = createElement("div", "flatpickr-time");
        self2.timeContainer.tabIndex = -1;
        const separator = createElement("span", "flatpickr-time-separator", ":");
        const hourInput = createNumberInput("flatpickr-hour", {
          "aria-label": self2.l10n.hourAriaLabel
        });
        self2.hourElement = hourInput.getElementsByTagName("input")[0];
        const minuteInput = createNumberInput("flatpickr-minute", {
          "aria-label": self2.l10n.minuteAriaLabel
        });
        self2.minuteElement = minuteInput.getElementsByTagName("input")[0];
        self2.hourElement.tabIndex = self2.minuteElement.tabIndex = -1;
        self2.hourElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getHours() : self2.config.time_24hr ? defaults2.hours : military2ampm(defaults2.hours));
        self2.minuteElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getMinutes() : defaults2.minutes);
        self2.hourElement.setAttribute("step", self2.config.hourIncrement.toString());
        self2.minuteElement.setAttribute("step", self2.config.minuteIncrement.toString());
        self2.hourElement.setAttribute("min", self2.config.time_24hr ? "0" : "1");
        self2.hourElement.setAttribute("max", self2.config.time_24hr ? "23" : "12");
        self2.hourElement.setAttribute("maxlength", "2");
        self2.minuteElement.setAttribute("min", "0");
        self2.minuteElement.setAttribute("max", "59");
        self2.minuteElement.setAttribute("maxlength", "2");
        self2.timeContainer.appendChild(hourInput);
        self2.timeContainer.appendChild(separator);
        self2.timeContainer.appendChild(minuteInput);
        if (self2.config.time_24hr)
          self2.timeContainer.classList.add("time24hr");
        if (self2.config.enableSeconds) {
          self2.timeContainer.classList.add("hasSeconds");
          const secondInput = createNumberInput("flatpickr-second");
          self2.secondElement = secondInput.getElementsByTagName("input")[0];
          self2.secondElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getSeconds() : defaults2.seconds);
          self2.secondElement.setAttribute("step", self2.minuteElement.getAttribute("step"));
          self2.secondElement.setAttribute("min", "0");
          self2.secondElement.setAttribute("max", "59");
          self2.secondElement.setAttribute("maxlength", "2");
          self2.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
          self2.timeContainer.appendChild(secondInput);
        }
        if (!self2.config.time_24hr) {
          self2.amPM = createElement("span", "flatpickr-am-pm", self2.l10n.amPM[int((self2.latestSelectedDateObj ? self2.hourElement.value : self2.config.defaultHour) > 11)]);
          self2.amPM.title = self2.l10n.toggleTitle;
          self2.amPM.tabIndex = -1;
          self2.timeContainer.appendChild(self2.amPM);
        }
        return self2.timeContainer;
      }
      function buildWeekdays() {
        if (!self2.weekdayContainer)
          self2.weekdayContainer = createElement("div", "flatpickr-weekdays");
        else
          clearNode(self2.weekdayContainer);
        for (let i = self2.config.showMonths; i--; ) {
          const container = createElement("div", "flatpickr-weekdaycontainer");
          self2.weekdayContainer.appendChild(container);
        }
        updateWeekdays();
        return self2.weekdayContainer;
      }
      function updateWeekdays() {
        if (!self2.weekdayContainer) {
          return;
        }
        const firstDayOfWeek = self2.l10n.firstDayOfWeek;
        let weekdays = [...self2.l10n.weekdays.shorthand];
        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
          weekdays = [...weekdays.splice(firstDayOfWeek, weekdays.length), ...weekdays.splice(0, firstDayOfWeek)];
        }
        for (let i = self2.config.showMonths; i--; ) {
          self2.weekdayContainer.children[i].innerHTML = `
      <span class='flatpickr-weekday'>
        ${weekdays.join("</span><span class='flatpickr-weekday'>")}
      </span>
      `;
        }
      }
      function buildWeeks() {
        self2.calendarContainer.classList.add("hasWeeks");
        const weekWrapper = createElement("div", "flatpickr-weekwrapper");
        weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self2.l10n.weekAbbreviation));
        const weekNumbers = createElement("div", "flatpickr-weeks");
        weekWrapper.appendChild(weekNumbers);
        return {
          weekWrapper,
          weekNumbers
        };
      }
      function changeMonth(value, isOffset = true) {
        const delta = isOffset ? value : value - self2.currentMonth;
        if (delta < 0 && self2._hidePrevMonthArrow === true || delta > 0 && self2._hideNextMonthArrow === true)
          return;
        self2.currentMonth += delta;
        if (self2.currentMonth < 0 || self2.currentMonth > 11) {
          self2.currentYear += self2.currentMonth > 11 ? 1 : -1;
          self2.currentMonth = (self2.currentMonth + 12) % 12;
          triggerEvent("onYearChange");
          buildMonthSwitch();
        }
        buildDays();
        triggerEvent("onMonthChange");
        updateNavigationCurrentMonth();
      }
      function clear(triggerChangeEvent = true, toInitial = true) {
        self2.input.value = "";
        if (self2.altInput !== void 0)
          self2.altInput.value = "";
        if (self2.mobileInput !== void 0)
          self2.mobileInput.value = "";
        self2.selectedDates = [];
        self2.latestSelectedDateObj = void 0;
        if (toInitial === true) {
          self2.currentYear = self2._initialDate.getFullYear();
          self2.currentMonth = self2._initialDate.getMonth();
        }
        if (self2.config.enableTime === true) {
          const { hours, minutes, seconds } = getDefaultHours(self2.config);
          setHours(hours, minutes, seconds);
        }
        self2.redraw();
        if (triggerChangeEvent)
          triggerEvent("onChange");
      }
      function close() {
        self2.isOpen = false;
        if (!self2.isMobile) {
          if (self2.calendarContainer !== void 0) {
            self2.calendarContainer.classList.remove("open");
          }
          if (self2._input !== void 0) {
            self2._input.classList.remove("active");
          }
        }
        triggerEvent("onClose");
      }
      function destroy2() {
        if (self2.config !== void 0)
          triggerEvent("onDestroy");
        for (let i = self2._handlers.length; i--; ) {
          self2._handlers[i].remove();
        }
        self2._handlers = [];
        if (self2.mobileInput) {
          if (self2.mobileInput.parentNode)
            self2.mobileInput.parentNode.removeChild(self2.mobileInput);
          self2.mobileInput = void 0;
        } else if (self2.calendarContainer && self2.calendarContainer.parentNode) {
          if (self2.config.static && self2.calendarContainer.parentNode) {
            const wrapper = self2.calendarContainer.parentNode;
            wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
            if (wrapper.parentNode) {
              while (wrapper.firstChild)
                wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
          } else
            self2.calendarContainer.parentNode.removeChild(self2.calendarContainer);
        }
        if (self2.altInput) {
          self2.input.type = "text";
          if (self2.altInput.parentNode)
            self2.altInput.parentNode.removeChild(self2.altInput);
          delete self2.altInput;
        }
        if (self2.input) {
          self2.input.type = self2.input._type;
          self2.input.classList.remove("flatpickr-input");
          self2.input.removeAttribute("readonly");
        }
        ["_showTimeInput", "latestSelectedDateObj", "_hideNextMonthArrow", "_hidePrevMonthArrow", "__hideNextMonthArrow", "__hidePrevMonthArrow", "isMobile", "isOpen", "selectedDateElem", "minDateHasTime", "maxDateHasTime", "days", "daysContainer", "_input", "_positionElement", "innerContainer", "rContainer", "monthNav", "todayDateElem", "calendarContainer", "weekdayContainer", "prevMonthNav", "nextMonthNav", "monthsDropdownContainer", "currentMonthElement", "currentYearElement", "navigationCurrentMonth", "selectedDateElem", "config"].forEach((k) => {
          try {
            delete self2[k];
          } catch (_) {
          }
        });
      }
      function isCalendarElem(elem) {
        if (self2.config.appendTo && self2.config.appendTo.contains(elem))
          return true;
        return self2.calendarContainer.contains(elem);
      }
      function documentClick(e) {
        if (self2.isOpen && !self2.config.inline) {
          const eventTarget = getEventTarget(e);
          const isCalendarElement = isCalendarElem(eventTarget);
          const isInput = eventTarget === self2.input || eventTarget === self2.altInput || self2.element.contains(eventTarget) || e.path && e.path.indexOf && (~e.path.indexOf(self2.input) || ~e.path.indexOf(self2.altInput));
          const lostFocus = e.type === "blur" ? isInput && e.relatedTarget && !isCalendarElem(e.relatedTarget) : !isInput && !isCalendarElement && !isCalendarElem(e.relatedTarget);
          const isIgnored = !self2.config.ignoredFocusElements.some((elem) => elem.contains(eventTarget));
          if (lostFocus && isIgnored) {
            if (self2.timeContainer !== void 0 && self2.minuteElement !== void 0 && self2.hourElement !== void 0 && self2.input.value !== "" && self2.input.value !== void 0) {
              updateTime();
            }
            self2.close();
            if (self2.config && self2.config.mode === "range" && self2.selectedDates.length === 1) {
              self2.clear(false);
              self2.redraw();
            }
          }
        }
      }
      function changeYear(newYear) {
        if (!newYear || self2.config.minDate && newYear < self2.config.minDate.getFullYear() || self2.config.maxDate && newYear > self2.config.maxDate.getFullYear())
          return;
        const newYearNum = newYear, isNewYear = self2.currentYear !== newYearNum;
        self2.currentYear = newYearNum || self2.currentYear;
        if (self2.config.maxDate && self2.currentYear === self2.config.maxDate.getFullYear()) {
          self2.currentMonth = Math.min(self2.config.maxDate.getMonth(), self2.currentMonth);
        } else if (self2.config.minDate && self2.currentYear === self2.config.minDate.getFullYear()) {
          self2.currentMonth = Math.max(self2.config.minDate.getMonth(), self2.currentMonth);
        }
        if (isNewYear) {
          self2.redraw();
          triggerEvent("onYearChange");
          buildMonthSwitch();
        }
      }
      function isEnabled(date, timeless = true) {
        var _a;
        const dateToCheck = self2.parseDate(date, void 0, timeless);
        if (self2.config.minDate && dateToCheck && compareDates(dateToCheck, self2.config.minDate, timeless !== void 0 ? timeless : !self2.minDateHasTime) < 0 || self2.config.maxDate && dateToCheck && compareDates(dateToCheck, self2.config.maxDate, timeless !== void 0 ? timeless : !self2.maxDateHasTime) > 0)
          return false;
        if (!self2.config.enable && self2.config.disable.length === 0)
          return true;
        if (dateToCheck === void 0)
          return false;
        const bool = !!self2.config.enable, array = (_a = self2.config.enable) !== null && _a !== void 0 ? _a : self2.config.disable;
        for (let i = 0, d; i < array.length; i++) {
          d = array[i];
          if (typeof d === "function" && d(dateToCheck))
            return bool;
          else if (d instanceof Date && dateToCheck !== void 0 && d.getTime() === dateToCheck.getTime())
            return bool;
          else if (typeof d === "string") {
            const parsed = self2.parseDate(d, void 0, true);
            return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
          } else if (typeof d === "object" && dateToCheck !== void 0 && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime())
            return bool;
        }
        return !bool;
      }
      function isInView(elem) {
        if (self2.daysContainer !== void 0)
          return elem.className.indexOf("hidden") === -1 && elem.className.indexOf("flatpickr-disabled") === -1 && self2.daysContainer.contains(elem);
        return false;
      }
      function onBlur(e) {
        const isInput = e.target === self2._input;
        if (isInput && (self2.selectedDates.length > 0 || self2._input.value.length > 0) && !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
          self2.setDate(self2._input.value, true, e.target === self2.altInput ? self2.config.altFormat : self2.config.dateFormat);
        }
      }
      function onKeyDown(e) {
        const eventTarget = getEventTarget(e);
        const isInput = self2.config.wrap ? element.contains(eventTarget) : eventTarget === self2._input;
        const allowInput = self2.config.allowInput;
        const allowKeydown = self2.isOpen && (!allowInput || !isInput);
        const allowInlineKeydown = self2.config.inline && isInput && !allowInput;
        if (e.keyCode === 13 && isInput) {
          if (allowInput) {
            self2.setDate(self2._input.value, true, eventTarget === self2.altInput ? self2.config.altFormat : self2.config.dateFormat);
            return eventTarget.blur();
          } else {
            self2.open();
          }
        } else if (isCalendarElem(eventTarget) || allowKeydown || allowInlineKeydown) {
          const isTimeObj = !!self2.timeContainer && self2.timeContainer.contains(eventTarget);
          switch (e.keyCode) {
            case 13:
              if (isTimeObj) {
                e.preventDefault();
                updateTime();
                focusAndClose();
              } else
                selectDate(e);
              break;
            case 27:
              e.preventDefault();
              focusAndClose();
              break;
            case 8:
            case 46:
              if (isInput && !self2.config.allowInput) {
                e.preventDefault();
                self2.clear();
              }
              break;
            case 37:
            case 39:
              if (!isTimeObj && !isInput) {
                e.preventDefault();
                if (self2.daysContainer !== void 0 && (allowInput === false || document.activeElement && isInView(document.activeElement))) {
                  const delta2 = e.keyCode === 39 ? 1 : -1;
                  if (!e.ctrlKey)
                    focusOnDay(void 0, delta2);
                  else {
                    e.stopPropagation();
                    changeMonth(delta2);
                    focusOnDay(getFirstAvailableDay(1), 0);
                  }
                }
              } else if (self2.hourElement)
                self2.hourElement.focus();
              break;
            case 38:
            case 40:
              e.preventDefault();
              const delta = e.keyCode === 40 ? 1 : -1;
              if (self2.daysContainer && eventTarget.$i !== void 0 || eventTarget === self2.input || eventTarget === self2.altInput) {
                if (e.ctrlKey) {
                  e.stopPropagation();
                  changeYear(self2.currentYear - delta);
                  focusOnDay(getFirstAvailableDay(1), 0);
                } else if (!isTimeObj)
                  focusOnDay(void 0, delta * 7);
              } else if (eventTarget === self2.currentYearElement) {
                changeYear(self2.currentYear - delta);
              } else if (self2.config.enableTime) {
                if (!isTimeObj && self2.hourElement)
                  self2.hourElement.focus();
                updateTime(e);
                self2._debouncedChange();
              }
              break;
            case 9:
              if (isTimeObj) {
                const elems = [self2.hourElement, self2.minuteElement, self2.secondElement, self2.amPM].concat(self2.pluginElements).filter((x) => x);
                const i = elems.indexOf(eventTarget);
                if (i !== -1) {
                  const target = elems[i + (e.shiftKey ? -1 : 1)];
                  e.preventDefault();
                  (target || self2._input).focus();
                }
              } else if (!self2.config.noCalendar && self2.daysContainer && self2.daysContainer.contains(eventTarget) && e.shiftKey) {
                e.preventDefault();
                self2._input.focus();
              }
              break;
          }
        }
        if (self2.amPM !== void 0 && eventTarget === self2.amPM) {
          switch (e.key) {
            case self2.l10n.amPM[0].charAt(0):
            case self2.l10n.amPM[0].charAt(0).toLowerCase():
              self2.amPM.textContent = self2.l10n.amPM[0];
              setHoursFromInputs();
              updateValue();
              break;
            case self2.l10n.amPM[1].charAt(0):
            case self2.l10n.amPM[1].charAt(0).toLowerCase():
              self2.amPM.textContent = self2.l10n.amPM[1];
              setHoursFromInputs();
              updateValue();
              break;
          }
        }
        if (isInput || isCalendarElem(eventTarget)) {
          triggerEvent("onKeyDown", e);
        }
      }
      function onMouseOver(elem) {
        if (self2.selectedDates.length !== 1 || elem && (!elem.classList.contains("flatpickr-day") || elem.classList.contains("flatpickr-disabled")))
          return;
        const hoverDate = elem ? elem.dateObj.getTime() : self2.days.firstElementChild.dateObj.getTime(), initialDate = self2.parseDate(self2.selectedDates[0], void 0, true).getTime(), rangeStartDate = Math.min(hoverDate, self2.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self2.selectedDates[0].getTime());
        let containsDisabled = false;
        let minRange = 0, maxRange = 0;
        for (let t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
          if (!isEnabled(new Date(t), true)) {
            containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
            if (t < initialDate && (!minRange || t > minRange))
              minRange = t;
            else if (t > initialDate && (!maxRange || t < maxRange))
              maxRange = t;
          }
        }
        for (let m = 0; m < self2.config.showMonths; m++) {
          const month = self2.daysContainer.children[m];
          for (let i = 0, l = month.children.length; i < l; i++) {
            const dayElem = month.children[i], date = dayElem.dateObj;
            const timestamp = date.getTime();
            const outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;
            if (outOfRange) {
              dayElem.classList.add("notAllowed");
              ["inRange", "startRange", "endRange"].forEach((c) => {
                dayElem.classList.remove(c);
              });
              continue;
            } else if (containsDisabled && !outOfRange)
              continue;
            ["startRange", "inRange", "endRange", "notAllowed"].forEach((c) => {
              dayElem.classList.remove(c);
            });
            if (elem !== void 0) {
              elem.classList.add(hoverDate <= self2.selectedDates[0].getTime() ? "startRange" : "endRange");
              if (initialDate < hoverDate && timestamp === initialDate)
                dayElem.classList.add("startRange");
              else if (initialDate > hoverDate && timestamp === initialDate)
                dayElem.classList.add("endRange");
              if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate))
                dayElem.classList.add("inRange");
            }
          }
        }
      }
      function onResize() {
        if (self2.isOpen && !self2.config.static && !self2.config.inline)
          positionCalendar();
      }
      function open(e, positionElement = self2._positionElement) {
        if (self2.isMobile === true) {
          if (e) {
            e.preventDefault();
            const eventTarget = getEventTarget(e);
            if (eventTarget) {
              eventTarget.blur();
            }
          }
          if (self2.mobileInput !== void 0) {
            self2.mobileInput.focus();
            self2.mobileInput.click();
          }
          triggerEvent("onOpen");
          return;
        } else if (self2._input.disabled || self2.config.inline) {
          return;
        }
        const wasOpen = self2.isOpen;
        self2.isOpen = true;
        if (!wasOpen) {
          self2.calendarContainer.classList.add("open");
          self2._input.classList.add("active");
          triggerEvent("onOpen");
          positionCalendar(positionElement);
        }
        if (self2.config.enableTime === true && self2.config.noCalendar === true) {
          if (self2.config.allowInput === false && (e === void 0 || !self2.timeContainer.contains(e.relatedTarget))) {
            setTimeout(() => self2.hourElement.select(), 50);
          }
        }
      }
      function minMaxDateSetter(type) {
        return (date) => {
          const dateObj = self2.config[`_${type}Date`] = self2.parseDate(date, self2.config.dateFormat);
          const inverseDateObj = self2.config[`_${type === "min" ? "max" : "min"}Date`];
          if (dateObj !== void 0) {
            self2[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
          }
          if (self2.selectedDates) {
            self2.selectedDates = self2.selectedDates.filter((d) => isEnabled(d));
            if (!self2.selectedDates.length && type === "min")
              setHoursFromDate(dateObj);
            updateValue();
          }
          if (self2.daysContainer) {
            redraw();
            if (dateObj !== void 0)
              self2.currentYearElement[type] = dateObj.getFullYear().toString();
            else
              self2.currentYearElement.removeAttribute(type);
            self2.currentYearElement.disabled = !!inverseDateObj && dateObj !== void 0 && inverseDateObj.getFullYear() === dateObj.getFullYear();
          }
        };
      }
      function parseConfig() {
        const boolOpts = ["wrap", "weekNumbers", "allowInput", "allowInvalidPreload", "clickOpens", "time_24hr", "enableTime", "noCalendar", "altInput", "shorthandCurrentMonth", "inline", "static", "enableSeconds", "disableMobile"];
        const userConfig = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
        const formats2 = {};
        self2.config.parseDate = userConfig.parseDate;
        self2.config.formatDate = userConfig.formatDate;
        Object.defineProperty(self2.config, "enable", {
          get: () => self2.config._enable,
          set: (dates) => {
            self2.config._enable = parseDateRules(dates);
          }
        });
        Object.defineProperty(self2.config, "disable", {
          get: () => self2.config._disable,
          set: (dates) => {
            self2.config._disable = parseDateRules(dates);
          }
        });
        const timeMode = userConfig.mode === "time";
        if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
          const defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults$1.dateFormat;
          formats2.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
        }
        if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
          const defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults$1.altFormat;
          formats2.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : defaultAltFormat + ` h:i${userConfig.enableSeconds ? ":S" : ""} K`;
        }
        Object.defineProperty(self2.config, "minDate", {
          get: () => self2.config._minDate,
          set: minMaxDateSetter("min")
        });
        Object.defineProperty(self2.config, "maxDate", {
          get: () => self2.config._maxDate,
          set: minMaxDateSetter("max")
        });
        const minMaxTimeSetter = (type) => (val) => {
          self2.config[type === "min" ? "_minTime" : "_maxTime"] = self2.parseDate(val, "H:i:S");
        };
        Object.defineProperty(self2.config, "minTime", {
          get: () => self2.config._minTime,
          set: minMaxTimeSetter("min")
        });
        Object.defineProperty(self2.config, "maxTime", {
          get: () => self2.config._maxTime,
          set: minMaxTimeSetter("max")
        });
        if (userConfig.mode === "time") {
          self2.config.noCalendar = true;
          self2.config.enableTime = true;
        }
        Object.assign(self2.config, formats2, userConfig);
        for (let i = 0; i < boolOpts.length; i++)
          self2.config[boolOpts[i]] = self2.config[boolOpts[i]] === true || self2.config[boolOpts[i]] === "true";
        HOOKS.filter((hook) => self2.config[hook] !== void 0).forEach((hook) => {
          self2.config[hook] = arrayify(self2.config[hook] || []).map(bindToInstance);
        });
        self2.isMobile = !self2.config.disableMobile && !self2.config.inline && self2.config.mode === "single" && !self2.config.disable.length && !self2.config.enable && !self2.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        for (let i = 0; i < self2.config.plugins.length; i++) {
          const pluginConf = self2.config.plugins[i](self2) || {};
          for (const key in pluginConf) {
            if (HOOKS.indexOf(key) > -1) {
              self2.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self2.config[key]);
            } else if (typeof userConfig[key] === "undefined")
              self2.config[key] = pluginConf[key];
          }
        }
        if (!userConfig.altInputClass) {
          self2.config.altInputClass = getInputElem().className + " " + self2.config.altInputClass;
        }
        triggerEvent("onParseConfig");
      }
      function getInputElem() {
        return self2.config.wrap ? element.querySelector("[data-input]") : element;
      }
      function setupLocale() {
        if (typeof self2.config.locale !== "object" && typeof flatpickr.l10ns[self2.config.locale] === "undefined")
          self2.config.errorHandler(new Error(`flatpickr: invalid locale ${self2.config.locale}`));
        self2.l10n = Object.assign(Object.assign({}, flatpickr.l10ns.default), typeof self2.config.locale === "object" ? self2.config.locale : self2.config.locale !== "default" ? flatpickr.l10ns[self2.config.locale] : void 0);
        tokenRegex.K = `(${self2.l10n.amPM[0]}|${self2.l10n.amPM[1]}|${self2.l10n.amPM[0].toLowerCase()}|${self2.l10n.amPM[1].toLowerCase()})`;
        const userConfig = Object.assign(Object.assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
        if (userConfig.time_24hr === void 0 && flatpickr.defaultConfig.time_24hr === void 0) {
          self2.config.time_24hr = self2.l10n.time_24hr;
        }
        self2.formatDate = createDateFormatter(self2);
        self2.parseDate = createDateParser({
          config: self2.config,
          l10n: self2.l10n
        });
      }
      function positionCalendar(customPositionElement) {
        if (typeof self2.config.position === "function") {
          return void self2.config.position(self2, customPositionElement);
        }
        if (self2.calendarContainer === void 0)
          return;
        triggerEvent("onPreCalendarPosition");
        const positionElement = customPositionElement || self2._positionElement;
        const calendarHeight = Array.prototype.reduce.call(self2.calendarContainer.children, (acc, child) => acc + child.offsetHeight, 0), calendarWidth = self2.calendarContainer.offsetWidth, configPos = self2.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
        const top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
        toggleClass$1(self2.calendarContainer, "arrowTop", !showOnTop);
        toggleClass$1(self2.calendarContainer, "arrowBottom", showOnTop);
        if (self2.config.inline)
          return;
        let left = window.pageXOffset + inputBounds.left;
        let isCenter = false;
        let isRight = false;
        if (configPosHorizontal === "center") {
          left -= (calendarWidth - inputBounds.width) / 2;
          isCenter = true;
        } else if (configPosHorizontal === "right") {
          left -= calendarWidth - inputBounds.width;
          isRight = true;
        }
        toggleClass$1(self2.calendarContainer, "arrowLeft", !isCenter && !isRight);
        toggleClass$1(self2.calendarContainer, "arrowCenter", isCenter);
        toggleClass$1(self2.calendarContainer, "arrowRight", isRight);
        const right = window.document.body.offsetWidth - (window.pageXOffset + inputBounds.right);
        const rightMost = left + calendarWidth > window.document.body.offsetWidth;
        const centerMost = right + calendarWidth > window.document.body.offsetWidth;
        toggleClass$1(self2.calendarContainer, "rightMost", rightMost);
        if (self2.config.static)
          return;
        self2.calendarContainer.style.top = `${top}px`;
        if (!rightMost) {
          self2.calendarContainer.style.left = `${left}px`;
          self2.calendarContainer.style.right = "auto";
        } else if (!centerMost) {
          self2.calendarContainer.style.left = "auto";
          self2.calendarContainer.style.right = `${right}px`;
        } else {
          const doc = getDocumentStyleSheet();
          if (doc === void 0)
            return;
          const bodyWidth = window.document.body.offsetWidth;
          const centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
          const centerBefore = ".flatpickr-calendar.centerMost:before";
          const centerAfter = ".flatpickr-calendar.centerMost:after";
          const centerIndex = doc.cssRules.length;
          const centerStyle = `{left:${inputBounds.left}px;right:auto;}`;
          toggleClass$1(self2.calendarContainer, "rightMost", false);
          toggleClass$1(self2.calendarContainer, "centerMost", true);
          doc.insertRule(`${centerBefore},${centerAfter}${centerStyle}`, centerIndex);
          self2.calendarContainer.style.left = `${centerLeft}px`;
          self2.calendarContainer.style.right = "auto";
        }
      }
      function getDocumentStyleSheet() {
        let editableSheet = null;
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            sheet.cssRules;
          } catch (err) {
            continue;
          }
          editableSheet = sheet;
          break;
        }
        return editableSheet != null ? editableSheet : createStyleSheet();
      }
      function createStyleSheet() {
        const style = document.createElement("style");
        document.head.appendChild(style);
        return style.sheet;
      }
      function redraw() {
        if (self2.config.noCalendar || self2.isMobile)
          return;
        buildMonthSwitch();
        updateNavigationCurrentMonth();
        buildDays();
      }
      function focusAndClose() {
        self2._input.focus();
        if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== void 0) {
          setTimeout(self2.close, 0);
        } else {
          self2.close();
        }
      }
      function selectDate(e) {
        e.preventDefault();
        e.stopPropagation();
        const isSelectable = (day) => day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("flatpickr-disabled") && !day.classList.contains("notAllowed");
        const t = findParent(getEventTarget(e), isSelectable);
        if (t === void 0)
          return;
        const target = t;
        const selectedDate = self2.latestSelectedDateObj = new Date(target.dateObj.getTime());
        const shouldChangeMonth = (selectedDate.getMonth() < self2.currentMonth || selectedDate.getMonth() > self2.currentMonth + self2.config.showMonths - 1) && self2.config.mode !== "range";
        self2.selectedDateElem = target;
        if (self2.config.mode === "single")
          self2.selectedDates = [selectedDate];
        else if (self2.config.mode === "multiple") {
          const selectedIndex = isDateSelected(selectedDate);
          if (selectedIndex)
            self2.selectedDates.splice(parseInt(selectedIndex), 1);
          else
            self2.selectedDates.push(selectedDate);
        } else if (self2.config.mode === "range") {
          if (self2.selectedDates.length === 2) {
            self2.clear(false, false);
          }
          self2.latestSelectedDateObj = selectedDate;
          self2.selectedDates.push(selectedDate);
          if (compareDates(selectedDate, self2.selectedDates[0], true) !== 0)
            self2.selectedDates.sort((a, b) => a.getTime() - b.getTime());
        }
        setHoursFromInputs();
        if (shouldChangeMonth) {
          const isNewYear = self2.currentYear !== selectedDate.getFullYear();
          self2.currentYear = selectedDate.getFullYear();
          self2.currentMonth = selectedDate.getMonth();
          if (isNewYear) {
            triggerEvent("onYearChange");
            buildMonthSwitch();
          }
          triggerEvent("onMonthChange");
        }
        updateNavigationCurrentMonth();
        buildDays();
        updateValue();
        if (!shouldChangeMonth && self2.config.mode !== "range" && self2.config.showMonths === 1)
          focusOnDayElem(target);
        else if (self2.selectedDateElem !== void 0 && self2.hourElement === void 0) {
          self2.selectedDateElem && self2.selectedDateElem.focus();
        }
        if (self2.hourElement !== void 0)
          self2.hourElement !== void 0 && self2.hourElement.focus();
        if (self2.config.closeOnSelect) {
          const single = self2.config.mode === "single" && !self2.config.enableTime;
          const range = self2.config.mode === "range" && self2.selectedDates.length === 2 && !self2.config.enableTime;
          if (single || range) {
            focusAndClose();
          }
        }
        triggerChange();
      }
      const CALLBACKS = {
        locale: [setupLocale, updateWeekdays],
        showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
        minDate: [jumpToDate],
        maxDate: [jumpToDate],
        clickOpens: [() => {
          if (self2.config.clickOpens === true) {
            bind(self2._input, "focus", self2.open);
            bind(self2._input, "click", self2.open);
          } else {
            self2._input.removeEventListener("focus", self2.open);
            self2._input.removeEventListener("click", self2.open);
          }
        }]
      };
      function set(option, value) {
        if (option !== null && typeof option === "object") {
          Object.assign(self2.config, option);
          for (const key in option) {
            if (CALLBACKS[key] !== void 0)
              CALLBACKS[key].forEach((x) => x());
          }
        } else {
          self2.config[option] = value;
          if (CALLBACKS[option] !== void 0)
            CALLBACKS[option].forEach((x) => x());
          else if (HOOKS.indexOf(option) > -1)
            self2.config[option] = arrayify(value);
        }
        self2.redraw();
        updateValue(true);
      }
      function setSelectedDate(inputDate, format) {
        let dates = [];
        if (inputDate instanceof Array)
          dates = inputDate.map((d) => self2.parseDate(d, format));
        else if (inputDate instanceof Date || typeof inputDate === "number")
          dates = [self2.parseDate(inputDate, format)];
        else if (typeof inputDate === "string") {
          switch (self2.config.mode) {
            case "single":
            case "time":
              dates = [self2.parseDate(inputDate, format)];
              break;
            case "multiple":
              dates = inputDate.split(self2.config.conjunction).map((date) => self2.parseDate(date, format));
              break;
            case "range":
              dates = inputDate.split(self2.l10n.rangeSeparator).map((date) => self2.parseDate(date, format));
              break;
          }
        } else
          self2.config.errorHandler(new Error(`Invalid date supplied: ${JSON.stringify(inputDate)}`));
        self2.selectedDates = self2.config.allowInvalidPreload ? dates : dates.filter((d) => d instanceof Date && isEnabled(d, false));
        if (self2.config.mode === "range")
          self2.selectedDates.sort((a, b) => a.getTime() - b.getTime());
      }
      function setDate(date, triggerChange2 = false, format = self2.config.dateFormat) {
        if (date !== 0 && !date || date instanceof Array && date.length === 0)
          return self2.clear(triggerChange2);
        setSelectedDate(date, format);
        self2.latestSelectedDateObj = self2.selectedDates[self2.selectedDates.length - 1];
        self2.redraw();
        jumpToDate(void 0, triggerChange2);
        setHoursFromDate();
        if (self2.selectedDates.length === 0) {
          self2.clear(false);
        }
        updateValue(triggerChange2);
        if (triggerChange2)
          triggerEvent("onChange");
      }
      function parseDateRules(arr) {
        return arr.slice().map((rule) => {
          if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
            return self2.parseDate(rule, void 0, true);
          } else if (rule && typeof rule === "object" && rule.from && rule.to)
            return {
              from: self2.parseDate(rule.from, void 0),
              to: self2.parseDate(rule.to, void 0)
            };
          return rule;
        }).filter((x) => x);
      }
      function setupDates() {
        self2.selectedDates = [];
        self2.now = self2.parseDate(self2.config.now) || new Date();
        const preloadedDate = self2.config.defaultDate || ((self2.input.nodeName === "INPUT" || self2.input.nodeName === "TEXTAREA") && self2.input.placeholder && self2.input.value === self2.input.placeholder ? null : self2.input.value);
        if (preloadedDate)
          setSelectedDate(preloadedDate, self2.config.dateFormat);
        self2._initialDate = self2.selectedDates.length > 0 ? self2.selectedDates[0] : self2.config.minDate && self2.config.minDate.getTime() > self2.now.getTime() ? self2.config.minDate : self2.config.maxDate && self2.config.maxDate.getTime() < self2.now.getTime() ? self2.config.maxDate : self2.now;
        self2.currentYear = self2._initialDate.getFullYear();
        self2.currentMonth = self2._initialDate.getMonth();
        if (self2.selectedDates.length > 0)
          self2.latestSelectedDateObj = self2.selectedDates[0];
        if (self2.config.minTime !== void 0)
          self2.config.minTime = self2.parseDate(self2.config.minTime, "H:i");
        if (self2.config.maxTime !== void 0)
          self2.config.maxTime = self2.parseDate(self2.config.maxTime, "H:i");
        self2.minDateHasTime = !!self2.config.minDate && (self2.config.minDate.getHours() > 0 || self2.config.minDate.getMinutes() > 0 || self2.config.minDate.getSeconds() > 0);
        self2.maxDateHasTime = !!self2.config.maxDate && (self2.config.maxDate.getHours() > 0 || self2.config.maxDate.getMinutes() > 0 || self2.config.maxDate.getSeconds() > 0);
      }
      function setupInputs() {
        self2.input = getInputElem();
        if (!self2.input) {
          self2.config.errorHandler(new Error("Invalid input element specified"));
          return;
        }
        self2.input._type = self2.input.type;
        self2.input.type = "text";
        self2.input.classList.add("flatpickr-input");
        self2._input = self2.input;
        if (self2.config.altInput) {
          self2.altInput = createElement(self2.input.nodeName, self2.config.altInputClass);
          self2._input = self2.altInput;
          self2.altInput.placeholder = self2.input.placeholder;
          self2.altInput.disabled = self2.input.disabled;
          self2.altInput.required = self2.input.required;
          self2.altInput.tabIndex = self2.input.tabIndex;
          self2.altInput.type = "text";
          self2.input.setAttribute("type", "hidden");
          if (!self2.config.static && self2.input.parentNode)
            self2.input.parentNode.insertBefore(self2.altInput, self2.input.nextSibling);
        }
        if (!self2.config.allowInput)
          self2._input.setAttribute("readonly", "readonly");
        self2._positionElement = self2.config.positionElement || self2._input;
      }
      function setupMobile() {
        const inputType = self2.config.enableTime ? self2.config.noCalendar ? "time" : "datetime-local" : "date";
        self2.mobileInput = createElement("input", self2.input.className + " flatpickr-mobile");
        self2.mobileInput.tabIndex = 1;
        self2.mobileInput.type = inputType;
        self2.mobileInput.disabled = self2.input.disabled;
        self2.mobileInput.required = self2.input.required;
        self2.mobileInput.placeholder = self2.input.placeholder;
        self2.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";
        if (self2.selectedDates.length > 0) {
          self2.mobileInput.defaultValue = self2.mobileInput.value = self2.formatDate(self2.selectedDates[0], self2.mobileFormatStr);
        }
        if (self2.config.minDate)
          self2.mobileInput.min = self2.formatDate(self2.config.minDate, "Y-m-d");
        if (self2.config.maxDate)
          self2.mobileInput.max = self2.formatDate(self2.config.maxDate, "Y-m-d");
        if (self2.input.getAttribute("step"))
          self2.mobileInput.step = String(self2.input.getAttribute("step"));
        self2.input.type = "hidden";
        if (self2.altInput !== void 0)
          self2.altInput.type = "hidden";
        try {
          if (self2.input.parentNode)
            self2.input.parentNode.insertBefore(self2.mobileInput, self2.input.nextSibling);
        } catch (_a) {
        }
        bind(self2.mobileInput, "change", (e) => {
          self2.setDate(getEventTarget(e).value, false, self2.mobileFormatStr);
          triggerEvent("onChange");
          triggerEvent("onClose");
        });
      }
      function toggle(e) {
        if (self2.isOpen === true)
          return self2.close();
        self2.open(e);
      }
      function triggerEvent(event, data) {
        if (self2.config === void 0)
          return;
        const hooks = self2.config[event];
        if (hooks !== void 0 && hooks.length > 0) {
          for (let i = 0; hooks[i] && i < hooks.length; i++)
            hooks[i](self2.selectedDates, self2.input.value, self2, data);
        }
        if (event === "onChange") {
          self2.input.dispatchEvent(createEvent("change"));
          self2.input.dispatchEvent(createEvent("input"));
        }
      }
      function createEvent(name) {
        const e = document.createEvent("Event");
        e.initEvent(name, true, true);
        return e;
      }
      function isDateSelected(date) {
        for (let i = 0; i < self2.selectedDates.length; i++) {
          if (compareDates(self2.selectedDates[i], date) === 0)
            return "" + i;
        }
        return false;
      }
      function isDateInRange(date) {
        if (self2.config.mode !== "range" || self2.selectedDates.length < 2)
          return false;
        return compareDates(date, self2.selectedDates[0]) >= 0 && compareDates(date, self2.selectedDates[1]) <= 0;
      }
      function updateNavigationCurrentMonth() {
        if (self2.config.noCalendar || self2.isMobile || !self2.monthNav)
          return;
        self2.yearElements.forEach((yearElement, i) => {
          const d = new Date(self2.currentYear, self2.currentMonth, 1);
          d.setMonth(self2.currentMonth + i);
          if (self2.config.showMonths > 1 || self2.config.monthSelectorType === "static") {
            self2.monthElements[i].textContent = monthToStr(d.getMonth(), self2.config.shorthandCurrentMonth, self2.l10n) + " ";
          } else {
            self2.monthsDropdownContainer.value = d.getMonth().toString();
          }
          yearElement.value = d.getFullYear().toString();
        });
        self2._hidePrevMonthArrow = self2.config.minDate !== void 0 && (self2.currentYear === self2.config.minDate.getFullYear() ? self2.currentMonth <= self2.config.minDate.getMonth() : self2.currentYear < self2.config.minDate.getFullYear());
        self2._hideNextMonthArrow = self2.config.maxDate !== void 0 && (self2.currentYear === self2.config.maxDate.getFullYear() ? self2.currentMonth + 1 > self2.config.maxDate.getMonth() : self2.currentYear > self2.config.maxDate.getFullYear());
      }
      function getDateStr(format) {
        return self2.selectedDates.map((dObj) => self2.formatDate(dObj, format)).filter((d, i, arr) => self2.config.mode !== "range" || self2.config.enableTime || arr.indexOf(d) === i).join(self2.config.mode !== "range" ? self2.config.conjunction : self2.l10n.rangeSeparator);
      }
      function updateValue(triggerChange2 = true) {
        if (self2.mobileInput !== void 0 && self2.mobileFormatStr) {
          self2.mobileInput.value = self2.latestSelectedDateObj !== void 0 ? self2.formatDate(self2.latestSelectedDateObj, self2.mobileFormatStr) : "";
        }
        self2.input.value = getDateStr(self2.config.dateFormat);
        if (self2.altInput !== void 0) {
          self2.altInput.value = getDateStr(self2.config.altFormat);
        }
        if (triggerChange2 !== false)
          triggerEvent("onValueUpdate");
      }
      function onMonthNavClick(e) {
        const eventTarget = getEventTarget(e);
        const isPrevMonth = self2.prevMonthNav.contains(eventTarget);
        const isNextMonth = self2.nextMonthNav.contains(eventTarget);
        if (isPrevMonth || isNextMonth) {
          changeMonth(isPrevMonth ? -1 : 1);
        } else if (self2.yearElements.indexOf(eventTarget) >= 0) {
          eventTarget.select();
        } else if (eventTarget.classList.contains("arrowUp")) {
          self2.changeYear(self2.currentYear + 1);
        } else if (eventTarget.classList.contains("arrowDown")) {
          self2.changeYear(self2.currentYear - 1);
        }
      }
      function timeWrapper(e) {
        e.preventDefault();
        const isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
        if (self2.amPM !== void 0 && eventTarget === self2.amPM) {
          self2.amPM.textContent = self2.l10n.amPM[int(self2.amPM.textContent === self2.l10n.amPM[0])];
        }
        const min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
        let newValue = curValue + step * delta;
        if (typeof input.value !== "undefined" && input.value.length === 2) {
          const isHourElem = input === self2.hourElement, isMinuteElem = input === self2.minuteElement;
          if (newValue < min) {
            newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self2.amPM));
            if (isMinuteElem)
              incrementNumInput(void 0, -1, self2.hourElement);
          } else if (newValue > max) {
            newValue = input === self2.hourElement ? newValue - max - int(!self2.amPM) : min;
            if (isMinuteElem)
              incrementNumInput(void 0, 1, self2.hourElement);
          }
          if (self2.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
            self2.amPM.textContent = self2.l10n.amPM[int(self2.amPM.textContent === self2.l10n.amPM[0])];
          }
          input.value = pad(newValue);
        }
      }
      init();
      return self2;
    }
    function _flatpickr(nodeList, config) {
      const nodes = Array.prototype.slice.call(nodeList).filter((x) => x instanceof HTMLElement);
      const instances = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        try {
          if (node.getAttribute("data-fp-omit") !== null)
            continue;
          if (node._flatpickr !== void 0) {
            node._flatpickr.destroy();
            node._flatpickr = void 0;
          }
          node._flatpickr = FlatpickrInstance(node, config || {});
          instances.push(node._flatpickr);
        } catch (e) {
          console.error(e);
        }
      }
      return instances.length === 1 ? instances[0] : instances;
    }
    if (typeof HTMLElement !== "undefined" && typeof HTMLCollection !== "undefined" && typeof NodeList !== "undefined") {
      HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function(config) {
        return _flatpickr(this, config);
      };
      HTMLElement.prototype.flatpickr = function(config) {
        return _flatpickr([this], config);
      };
    }
    var flatpickr = function(selector, config) {
      if (typeof selector === "string") {
        return _flatpickr(window.document.querySelectorAll(selector), config);
      } else if (selector instanceof Node) {
        return _flatpickr([selector], config);
      } else {
        return _flatpickr(selector, config);
      }
    };
    flatpickr.defaultConfig = {};
    flatpickr.l10ns = {
      en: Object.assign({}, english),
      default: Object.assign({}, english)
    };
    flatpickr.localize = (l10n) => {
      flatpickr.l10ns.default = Object.assign(Object.assign({}, flatpickr.l10ns.default), l10n);
    };
    flatpickr.setDefaults = (config) => {
      flatpickr.defaultConfig = Object.assign(Object.assign({}, flatpickr.defaultConfig), config);
    };
    flatpickr.parseDate = createDateParser({});
    flatpickr.formatDate = createDateFormatter({});
    flatpickr.compareDates = compareDates;
    if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
      jQuery.fn.flatpickr = function(config) {
        return _flatpickr(this, config);
      };
    }
    Date.prototype.fp_incr = function(days) {
      return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
    };
    if (typeof window !== "undefined") {
      window.flatpickr = flatpickr;
    }
    (function() {
      if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
        return;
      }
      const BuiltInHTMLElement = HTMLElement;
      const wrapperForTheName = {
        HTMLElement: function HTMLElement2() {
          return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
        }
      };
      window.HTMLElement = wrapperForTheName["HTMLElement"];
      HTMLElement.prototype = BuiltInHTMLElement.prototype;
      HTMLElement.prototype.constructor = HTMLElement;
      Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
    })();
    const submittersByForm = /* @__PURE__ */ new WeakMap();
    function findSubmitterFromClickTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      const candidate = element ? element.closest("input, button") : null;
      return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
    }
    function clickCaptured(event) {
      const submitter = findSubmitterFromClickTarget(event.target);
      if (submitter && submitter.form) {
        submittersByForm.set(submitter.form, submitter);
      }
    }
    (function() {
      if ("submitter" in Event.prototype)
        return;
      let prototype;
      if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
        prototype = window.SubmitEvent.prototype;
      } else if ("SubmitEvent" in window) {
        return;
      } else {
        prototype = window.Event.prototype;
      }
      addEventListener("click", clickCaptured, true);
      Object.defineProperty(prototype, "submitter", {
        get() {
          if (this.type == "submit" && this.target instanceof HTMLFormElement) {
            return submittersByForm.get(this.target);
          }
        }
      });
    })();
    var FrameLoadingStyle;
    (function(FrameLoadingStyle2) {
      FrameLoadingStyle2["eager"] = "eager";
      FrameLoadingStyle2["lazy"] = "lazy";
    })(FrameLoadingStyle || (FrameLoadingStyle = {}));
    class FrameElement extends HTMLElement {
      constructor() {
        super();
        this.loaded = Promise.resolve();
        this.delegate = new FrameElement.delegateConstructor(this);
      }
      static get observedAttributes() {
        return ["disabled", "loading", "src"];
      }
      connectedCallback() {
        this.delegate.connect();
      }
      disconnectedCallback() {
        this.delegate.disconnect();
      }
      reload() {
        const { src } = this;
        this.src = null;
        this.src = src;
      }
      attributeChangedCallback(name) {
        if (name == "loading") {
          this.delegate.loadingStyleChanged();
        } else if (name == "src") {
          this.delegate.sourceURLChanged();
        } else {
          this.delegate.disabledChanged();
        }
      }
      get src() {
        return this.getAttribute("src");
      }
      set src(value) {
        if (value) {
          this.setAttribute("src", value);
        } else {
          this.removeAttribute("src");
        }
      }
      get loading() {
        return frameLoadingStyleFromString(this.getAttribute("loading") || "");
      }
      set loading(value) {
        if (value) {
          this.setAttribute("loading", value);
        } else {
          this.removeAttribute("loading");
        }
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(value) {
        if (value) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
      }
      get autoscroll() {
        return this.hasAttribute("autoscroll");
      }
      set autoscroll(value) {
        if (value) {
          this.setAttribute("autoscroll", "");
        } else {
          this.removeAttribute("autoscroll");
        }
      }
      get complete() {
        return !this.delegate.isLoading;
      }
      get isActive() {
        return this.ownerDocument === document && !this.isPreview;
      }
      get isPreview() {
        var _a, _b;
        return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
      }
    }
    function frameLoadingStyleFromString(style) {
      switch (style.toLowerCase()) {
        case "lazy":
          return FrameLoadingStyle.lazy;
        default:
          return FrameLoadingStyle.eager;
      }
    }
    function expandURL(locatable) {
      return new URL(locatable.toString(), document.baseURI);
    }
    function getAnchor(url) {
      let anchorMatch;
      if (url.hash) {
        return url.hash.slice(1);
      } else if (anchorMatch = url.href.match(/#(.*)$/)) {
        return anchorMatch[1];
      }
    }
    function getExtension(url) {
      return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
    }
    function isHTML(url) {
      return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml))$/);
    }
    function isPrefixedBy(baseURL, url) {
      const prefix = getPrefix(url);
      return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
    }
    function getRequestURL(url) {
      const anchor = getAnchor(url);
      return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
    }
    function toCacheKey(url) {
      return getRequestURL(url);
    }
    function urlsAreEqual(left, right) {
      return expandURL(left).href == expandURL(right).href;
    }
    function getPathComponents(url) {
      return url.pathname.split("/").slice(1);
    }
    function getLastPathComponent(url) {
      return getPathComponents(url).slice(-1)[0];
    }
    function getPrefix(url) {
      return addTrailingSlash(url.origin + url.pathname);
    }
    function addTrailingSlash(value) {
      return value.endsWith("/") ? value : value + "/";
    }
    class FetchResponse$1 {
      constructor(response) {
        this.response = response;
      }
      get succeeded() {
        return this.response.ok;
      }
      get failed() {
        return !this.succeeded;
      }
      get clientError() {
        return this.statusCode >= 400 && this.statusCode <= 499;
      }
      get serverError() {
        return this.statusCode >= 500 && this.statusCode <= 599;
      }
      get redirected() {
        return this.response.redirected;
      }
      get location() {
        return expandURL(this.response.url);
      }
      get isHTML() {
        return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
      }
      get statusCode() {
        return this.response.status;
      }
      get contentType() {
        return this.header("Content-Type");
      }
      get responseText() {
        return this.response.clone().text();
      }
      get responseHTML() {
        if (this.isHTML) {
          return this.response.clone().text();
        } else {
          return Promise.resolve(void 0);
        }
      }
      header(name) {
        return this.response.headers.get(name);
      }
    }
    function dispatch(eventName, { target, cancelable, detail } = {}) {
      const event = new CustomEvent(eventName, {
        cancelable,
        bubbles: true,
        detail
      });
      if (target && target.isConnected) {
        target.dispatchEvent(event);
      } else {
        document.documentElement.dispatchEvent(event);
      }
      return event;
    }
    function nextAnimationFrame() {
      return new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }
    function nextEventLoopTick() {
      return new Promise((resolve) => setTimeout(() => resolve(), 0));
    }
    function nextMicrotask() {
      return Promise.resolve();
    }
    function parseHTMLDocument(html = "") {
      return new DOMParser().parseFromString(html, "text/html");
    }
    function unindent(strings, ...values) {
      const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
      const match = lines[0].match(/^\s+/);
      const indent = match ? match[0].length : 0;
      return lines.map((line) => line.slice(indent)).join("\n");
    }
    function interpolate(strings, values) {
      return strings.reduce((result, string, i) => {
        const value = values[i] == void 0 ? "" : values[i];
        return result + string + value;
      }, "");
    }
    function uuid() {
      return Array.apply(null, {
        length: 36
      }).map((_, i) => {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
          return "-";
        } else if (i == 14) {
          return "4";
        } else if (i == 19) {
          return (Math.floor(Math.random() * 4) + 8).toString(16);
        } else {
          return Math.floor(Math.random() * 15).toString(16);
        }
      }).join("");
    }
    var FetchMethod;
    (function(FetchMethod2) {
      FetchMethod2[FetchMethod2["get"] = 0] = "get";
      FetchMethod2[FetchMethod2["post"] = 1] = "post";
      FetchMethod2[FetchMethod2["put"] = 2] = "put";
      FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
      FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
    })(FetchMethod || (FetchMethod = {}));
    function fetchMethodFromString(method) {
      switch (method.toLowerCase()) {
        case "get":
          return FetchMethod.get;
        case "post":
          return FetchMethod.post;
        case "put":
          return FetchMethod.put;
        case "patch":
          return FetchMethod.patch;
        case "delete":
          return FetchMethod.delete;
      }
    }
    class FetchRequest$1 {
      constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
        this.abortController = new AbortController();
        this.resolveRequestPromise = (value) => {
        };
        this.delegate = delegate;
        this.method = method;
        this.headers = this.defaultHeaders;
        if (this.isIdempotent) {
          this.url = mergeFormDataEntries(location2, [...body.entries()]);
        } else {
          this.body = body;
          this.url = location2;
        }
        this.target = target;
      }
      get location() {
        return this.url;
      }
      get params() {
        return this.url.searchParams;
      }
      get entries() {
        return this.body ? Array.from(this.body.entries()) : [];
      }
      cancel() {
        this.abortController.abort();
      }
      async perform() {
        var _a, _b;
        const { fetchOptions } = this;
        (_b = (_a = this.delegate).prepareHeadersForRequest) === null || _b === void 0 ? void 0 : _b.call(_a, this.headers, this);
        await this.allowRequestToBeIntercepted(fetchOptions);
        try {
          this.delegate.requestStarted(this);
          const response = await fetch(this.url.href, fetchOptions);
          return await this.receive(response);
        } catch (error2) {
          if (error2.name !== "AbortError") {
            this.delegate.requestErrored(this, error2);
            throw error2;
          }
        } finally {
          this.delegate.requestFinished(this);
        }
      }
      async receive(response) {
        const fetchResponse = new FetchResponse$1(response);
        const event = dispatch("turbo:before-fetch-response", {
          cancelable: true,
          detail: {
            fetchResponse
          },
          target: this.target
        });
        if (event.defaultPrevented) {
          this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
        } else if (fetchResponse.succeeded) {
          this.delegate.requestSucceededWithResponse(this, fetchResponse);
        } else {
          this.delegate.requestFailedWithResponse(this, fetchResponse);
        }
        return fetchResponse;
      }
      get fetchOptions() {
        var _a;
        return {
          method: FetchMethod[this.method].toUpperCase(),
          credentials: "same-origin",
          headers: this.headers,
          redirect: "follow",
          body: this.body,
          signal: this.abortSignal,
          referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
        };
      }
      get defaultHeaders() {
        return {
          Accept: "text/html, application/xhtml+xml"
        };
      }
      get isIdempotent() {
        return this.method == FetchMethod.get;
      }
      get abortSignal() {
        return this.abortController.signal;
      }
      async allowRequestToBeIntercepted(fetchOptions) {
        const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
        const event = dispatch("turbo:before-fetch-request", {
          cancelable: true,
          detail: {
            fetchOptions,
            url: this.url.href,
            resume: this.resolveRequestPromise
          },
          target: this.target
        });
        if (event.defaultPrevented)
          await requestInterception;
      }
    }
    function mergeFormDataEntries(url, entries) {
      const currentSearchParams = new URLSearchParams(url.search);
      for (const [name, value] of entries) {
        if (value instanceof File)
          continue;
        if (currentSearchParams.has(name)) {
          currentSearchParams.delete(name);
          url.searchParams.set(name, value);
        } else {
          url.searchParams.append(name, value);
        }
      }
      return url;
    }
    class AppearanceObserver {
      constructor(delegate, element) {
        this.started = false;
        this.intersect = (entries) => {
          const lastEntry = entries.slice(-1)[0];
          if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
            this.delegate.elementAppearedInViewport(this.element);
          }
        };
        this.delegate = delegate;
        this.element = element;
        this.intersectionObserver = new IntersectionObserver(this.intersect);
      }
      start() {
        if (!this.started) {
          this.started = true;
          this.intersectionObserver.observe(this.element);
        }
      }
      stop() {
        if (this.started) {
          this.started = false;
          this.intersectionObserver.unobserve(this.element);
        }
      }
    }
    class StreamMessage {
      constructor(html) {
        this.templateElement = document.createElement("template");
        this.templateElement.innerHTML = html;
      }
      static wrap(message) {
        if (typeof message == "string") {
          return new this(message);
        } else {
          return message;
        }
      }
      get fragment() {
        const fragment = document.createDocumentFragment();
        for (const element of this.foreignElements) {
          fragment.appendChild(document.importNode(element, true));
        }
        return fragment;
      }
      get foreignElements() {
        return this.templateChildren.reduce((streamElements, child) => {
          if (child.tagName.toLowerCase() == "turbo-stream") {
            return [...streamElements, child];
          } else {
            return streamElements;
          }
        }, []);
      }
      get templateChildren() {
        return Array.from(this.templateElement.content.children);
      }
    }
    StreamMessage.contentType = "text/vnd.turbo-stream.html";
    var FormSubmissionState;
    (function(FormSubmissionState2) {
      FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
      FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
      FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
      FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
      FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
      FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
    })(FormSubmissionState || (FormSubmissionState = {}));
    var FormEnctype;
    (function(FormEnctype2) {
      FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
      FormEnctype2["multipart"] = "multipart/form-data";
      FormEnctype2["plain"] = "text/plain";
    })(FormEnctype || (FormEnctype = {}));
    function formEnctypeFromString(encoding) {
      switch (encoding.toLowerCase()) {
        case FormEnctype.multipart:
          return FormEnctype.multipart;
        case FormEnctype.plain:
          return FormEnctype.plain;
        default:
          return FormEnctype.urlEncoded;
      }
    }
    class FormSubmission {
      constructor(delegate, formElement, submitter, mustRedirect = false) {
        this.state = FormSubmissionState.initialized;
        this.delegate = delegate;
        this.formElement = formElement;
        this.submitter = submitter;
        this.formData = buildFormData(formElement, submitter);
        this.fetchRequest = new FetchRequest$1(this, this.method, this.location, this.body, this.formElement);
        this.mustRedirect = mustRedirect;
      }
      get method() {
        var _a;
        const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
        return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
      }
      get action() {
        var _a;
        const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
        return ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formaction")) || this.formElement.getAttribute("action") || formElementAction || "";
      }
      get location() {
        return expandURL(this.action);
      }
      get body() {
        if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
          return new URLSearchParams(this.stringFormData);
        } else {
          return this.formData;
        }
      }
      get enctype() {
        var _a;
        return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
      }
      get isIdempotent() {
        return this.fetchRequest.isIdempotent;
      }
      get stringFormData() {
        return [...this.formData].reduce((entries, [name, value]) => entries.concat(typeof value == "string" ? [[name, value]] : []), []);
      }
      async start() {
        const { initialized, requesting } = FormSubmissionState;
        if (this.state == initialized) {
          this.state = requesting;
          return this.fetchRequest.perform();
        }
      }
      stop() {
        const { stopping, stopped } = FormSubmissionState;
        if (this.state != stopping && this.state != stopped) {
          this.state = stopping;
          this.fetchRequest.cancel();
          return true;
        }
      }
      prepareHeadersForRequest(headers, request) {
        if (!request.isIdempotent) {
          const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
          if (token) {
            headers["X-CSRF-Token"] = token;
          }
          headers["Accept"] = [StreamMessage.contentType, headers["Accept"]].join(", ");
        }
      }
      requestStarted(request) {
        this.state = FormSubmissionState.waiting;
        dispatch("turbo:submit-start", {
          target: this.formElement,
          detail: {
            formSubmission: this
          }
        });
        this.delegate.formSubmissionStarted(this);
      }
      requestPreventedHandlingResponse(request, response) {
        this.result = {
          success: response.succeeded,
          fetchResponse: response
        };
      }
      requestSucceededWithResponse(request, response) {
        if (response.clientError || response.serverError) {
          this.delegate.formSubmissionFailedWithResponse(this, response);
        } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
          const error2 = new Error("Form responses must redirect to another location");
          this.delegate.formSubmissionErrored(this, error2);
        } else {
          this.state = FormSubmissionState.receiving;
          this.result = {
            success: true,
            fetchResponse: response
          };
          this.delegate.formSubmissionSucceededWithResponse(this, response);
        }
      }
      requestFailedWithResponse(request, response) {
        this.result = {
          success: false,
          fetchResponse: response
        };
        this.delegate.formSubmissionFailedWithResponse(this, response);
      }
      requestErrored(request, error2) {
        this.result = {
          success: false,
          error: error2
        };
        this.delegate.formSubmissionErrored(this, error2);
      }
      requestFinished(request) {
        this.state = FormSubmissionState.stopped;
        dispatch("turbo:submit-end", {
          target: this.formElement,
          detail: Object.assign({
            formSubmission: this
          }, this.result)
        });
        this.delegate.formSubmissionFinished(this);
      }
      requestMustRedirect(request) {
        return !request.isIdempotent && this.mustRedirect;
      }
    }
    function buildFormData(formElement, submitter) {
      const formData = new FormData(formElement);
      const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
      const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
      if (name && value != null && formData.get(name) != value) {
        formData.append(name, value);
      }
      return formData;
    }
    function getCookieValue(cookieName) {
      if (cookieName != null) {
        const cookies = document.cookie ? document.cookie.split("; ") : [];
        const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
        if (cookie) {
          const value = cookie.split("=").slice(1).join("=");
          return value ? decodeURIComponent(value) : void 0;
        }
      }
    }
    function getMetaContent(name) {
      const element = document.querySelector(`meta[name="${name}"]`);
      return element && element.content;
    }
    function responseSucceededWithoutRedirect(response) {
      return response.statusCode == 200 && !response.redirected;
    }
    class Snapshot {
      constructor(element) {
        this.element = element;
      }
      get children() {
        return [...this.element.children];
      }
      hasAnchor(anchor) {
        return this.getElementForAnchor(anchor) != null;
      }
      getElementForAnchor(anchor) {
        return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
      }
      get isConnected() {
        return this.element.isConnected;
      }
      get firstAutofocusableElement() {
        return this.element.querySelector("[autofocus]");
      }
      get permanentElements() {
        return [...this.element.querySelectorAll("[id][data-turbo-permanent]")];
      }
      getPermanentElementById(id) {
        return this.element.querySelector(`#${id}[data-turbo-permanent]`);
      }
      getPermanentElementMapForSnapshot(snapshot) {
        const permanentElementMap = {};
        for (const currentPermanentElement of this.permanentElements) {
          const { id } = currentPermanentElement;
          const newPermanentElement = snapshot.getPermanentElementById(id);
          if (newPermanentElement) {
            permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
          }
        }
        return permanentElementMap;
      }
    }
    class FormInterceptor {
      constructor(delegate, element) {
        this.submitBubbled = (event) => {
          const form = event.target;
          if (form instanceof HTMLFormElement && form.closest("turbo-frame, html") == this.element) {
            const submitter = event.submitter || void 0;
            if (this.delegate.shouldInterceptFormSubmission(form, submitter)) {
              event.preventDefault();
              event.stopImmediatePropagation();
              this.delegate.formSubmissionIntercepted(form, submitter);
            }
          }
        };
        this.delegate = delegate;
        this.element = element;
      }
      start() {
        this.element.addEventListener("submit", this.submitBubbled);
      }
      stop() {
        this.element.removeEventListener("submit", this.submitBubbled);
      }
    }
    class View {
      constructor(delegate, element) {
        this.resolveRenderPromise = (value) => {
        };
        this.resolveInterceptionPromise = (value) => {
        };
        this.delegate = delegate;
        this.element = element;
      }
      scrollToAnchor(anchor) {
        const element = this.snapshot.getElementForAnchor(anchor);
        if (element) {
          this.scrollToElement(element);
          this.focusElement(element);
        } else {
          this.scrollToPosition({
            x: 0,
            y: 0
          });
        }
      }
      scrollToAnchorFromLocation(location2) {
        this.scrollToAnchor(getAnchor(location2));
      }
      scrollToElement(element) {
        element.scrollIntoView();
      }
      focusElement(element) {
        if (element instanceof HTMLElement) {
          if (element.hasAttribute("tabindex")) {
            element.focus();
          } else {
            element.setAttribute("tabindex", "-1");
            element.focus();
            element.removeAttribute("tabindex");
          }
        }
      }
      scrollToPosition({ x, y }) {
        this.scrollRoot.scrollTo(x, y);
      }
      scrollToTop() {
        this.scrollToPosition({
          x: 0,
          y: 0
        });
      }
      get scrollRoot() {
        return window;
      }
      async render(renderer) {
        const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
        if (shouldRender) {
          try {
            this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
            this.renderer = renderer;
            this.prepareToRenderSnapshot(renderer);
            const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
            const immediateRender = this.delegate.allowsImmediateRender(snapshot, this.resolveInterceptionPromise);
            if (!immediateRender)
              await renderInterception;
            await this.renderSnapshot(renderer);
            this.delegate.viewRenderedSnapshot(snapshot, isPreview);
            this.finishRenderingSnapshot(renderer);
          } finally {
            delete this.renderer;
            this.resolveRenderPromise(void 0);
            delete this.renderPromise;
          }
        } else {
          this.invalidate();
        }
      }
      invalidate() {
        this.delegate.viewInvalidated();
      }
      prepareToRenderSnapshot(renderer) {
        this.markAsPreview(renderer.isPreview);
        renderer.prepareToRender();
      }
      markAsPreview(isPreview) {
        if (isPreview) {
          this.element.setAttribute("data-turbo-preview", "");
        } else {
          this.element.removeAttribute("data-turbo-preview");
        }
      }
      async renderSnapshot(renderer) {
        await renderer.render();
      }
      finishRenderingSnapshot(renderer) {
        renderer.finishRendering();
      }
    }
    class FrameView extends View {
      invalidate() {
        this.element.innerHTML = "";
      }
      get snapshot() {
        return new Snapshot(this.element);
      }
    }
    class LinkInterceptor {
      constructor(delegate, element) {
        this.clickBubbled = (event) => {
          if (this.respondsToEventTarget(event.target)) {
            this.clickEvent = event;
          } else {
            delete this.clickEvent;
          }
        };
        this.linkClicked = (event) => {
          if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
            if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url)) {
              this.clickEvent.preventDefault();
              event.preventDefault();
              this.delegate.linkClickIntercepted(event.target, event.detail.url);
            }
          }
          delete this.clickEvent;
        };
        this.willVisit = () => {
          delete this.clickEvent;
        };
        this.delegate = delegate;
        this.element = element;
      }
      start() {
        this.element.addEventListener("click", this.clickBubbled);
        document.addEventListener("turbo:click", this.linkClicked);
        document.addEventListener("turbo:before-visit", this.willVisit);
      }
      stop() {
        this.element.removeEventListener("click", this.clickBubbled);
        document.removeEventListener("turbo:click", this.linkClicked);
        document.removeEventListener("turbo:before-visit", this.willVisit);
      }
      respondsToEventTarget(target) {
        const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
        return element && element.closest("turbo-frame, html") == this.element;
      }
    }
    class Bardo {
      constructor(permanentElementMap) {
        this.permanentElementMap = permanentElementMap;
      }
      static preservingPermanentElements(permanentElementMap, callback) {
        const bardo = new this(permanentElementMap);
        bardo.enter();
        callback();
        bardo.leave();
      }
      enter() {
        for (const id in this.permanentElementMap) {
          const [, newPermanentElement] = this.permanentElementMap[id];
          this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
        }
      }
      leave() {
        for (const id in this.permanentElementMap) {
          const [currentPermanentElement] = this.permanentElementMap[id];
          this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
          this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        }
      }
      replaceNewPermanentElementWithPlaceholder(permanentElement) {
        const placeholder = createPlaceholderForPermanentElement(permanentElement);
        permanentElement.replaceWith(placeholder);
      }
      replaceCurrentPermanentElementWithClone(permanentElement) {
        const clone2 = permanentElement.cloneNode(true);
        permanentElement.replaceWith(clone2);
      }
      replacePlaceholderWithPermanentElement(permanentElement) {
        const placeholder = this.getPlaceholderById(permanentElement.id);
        placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
      }
      getPlaceholderById(id) {
        return this.placeholders.find((element) => element.content == id);
      }
      get placeholders() {
        return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
      }
    }
    function createPlaceholderForPermanentElement(permanentElement) {
      const element = document.createElement("meta");
      element.setAttribute("name", "turbo-permanent-placeholder");
      element.setAttribute("content", permanentElement.id);
      return element;
    }
    class Renderer {
      constructor(currentSnapshot, newSnapshot, isPreview) {
        this.currentSnapshot = currentSnapshot;
        this.newSnapshot = newSnapshot;
        this.isPreview = isPreview;
        this.promise = new Promise((resolve, reject) => this.resolvingFunctions = {
          resolve,
          reject
        });
      }
      get shouldRender() {
        return true;
      }
      prepareToRender() {
        return;
      }
      finishRendering() {
        if (this.resolvingFunctions) {
          this.resolvingFunctions.resolve();
          delete this.resolvingFunctions;
        }
      }
      createScriptElement(element) {
        if (element.getAttribute("data-turbo-eval") == "false") {
          return element;
        } else {
          const createdScriptElement = document.createElement("script");
          if (this.cspNonce) {
            createdScriptElement.nonce = this.cspNonce;
          }
          createdScriptElement.textContent = element.textContent;
          createdScriptElement.async = false;
          copyElementAttributes(createdScriptElement, element);
          return createdScriptElement;
        }
      }
      preservingPermanentElements(callback) {
        Bardo.preservingPermanentElements(this.permanentElementMap, callback);
      }
      focusFirstAutofocusableElement() {
        const element = this.connectedSnapshot.firstAutofocusableElement;
        if (elementIsFocusable(element)) {
          element.focus();
        }
      }
      get connectedSnapshot() {
        return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
      }
      get currentElement() {
        return this.currentSnapshot.element;
      }
      get newElement() {
        return this.newSnapshot.element;
      }
      get permanentElementMap() {
        return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
      }
      get cspNonce() {
        var _a;
        return (_a = document.head.querySelector('meta[name="csp-nonce"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content");
      }
    }
    function copyElementAttributes(destinationElement, sourceElement) {
      for (const { name, value } of [...sourceElement.attributes]) {
        destinationElement.setAttribute(name, value);
      }
    }
    function elementIsFocusable(element) {
      return element && typeof element.focus == "function";
    }
    class FrameRenderer extends Renderer {
      get shouldRender() {
        return true;
      }
      async render() {
        await nextAnimationFrame();
        this.preservingPermanentElements(() => {
          this.loadFrameElement();
        });
        this.scrollFrameIntoView();
        await nextAnimationFrame();
        this.focusFirstAutofocusableElement();
        await nextAnimationFrame();
        this.activateScriptElements();
      }
      loadFrameElement() {
        var _a;
        const destinationRange = document.createRange();
        destinationRange.selectNodeContents(this.currentElement);
        destinationRange.deleteContents();
        const frameElement = this.newElement;
        const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
        if (sourceRange) {
          sourceRange.selectNodeContents(frameElement);
          this.currentElement.appendChild(sourceRange.extractContents());
        }
      }
      scrollFrameIntoView() {
        if (this.currentElement.autoscroll || this.newElement.autoscroll) {
          const element = this.currentElement.firstElementChild;
          const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
          if (element) {
            element.scrollIntoView({
              block
            });
            return true;
          }
        }
        return false;
      }
      activateScriptElements() {
        for (const inertScriptElement of this.newScriptElements) {
          const activatedScriptElement = this.createScriptElement(inertScriptElement);
          inertScriptElement.replaceWith(activatedScriptElement);
        }
      }
      get newScriptElements() {
        return this.currentElement.querySelectorAll("script");
      }
    }
    function readScrollLogicalPosition(value, defaultValue) {
      if (value == "end" || value == "start" || value == "center" || value == "nearest") {
        return value;
      } else {
        return defaultValue;
      }
    }
    class ProgressBar {
      constructor() {
        this.hiding = false;
        this.value = 0;
        this.visible = false;
        this.trickle = () => {
          this.setValue(this.value + Math.random() / 100);
        };
        this.stylesheetElement = this.createStylesheetElement();
        this.progressElement = this.createProgressElement();
        this.installStylesheetElement();
        this.setValue(0);
      }
      static get defaultCSS() {
        return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 9999;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
      }
      show() {
        if (!this.visible) {
          this.visible = true;
          this.installProgressElement();
          this.startTrickling();
        }
      }
      hide() {
        if (this.visible && !this.hiding) {
          this.hiding = true;
          this.fadeProgressElement(() => {
            this.uninstallProgressElement();
            this.stopTrickling();
            this.visible = false;
            this.hiding = false;
          });
        }
      }
      setValue(value) {
        this.value = value;
        this.refresh();
      }
      installStylesheetElement() {
        document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
      }
      installProgressElement() {
        this.progressElement.style.width = "0";
        this.progressElement.style.opacity = "1";
        document.documentElement.insertBefore(this.progressElement, document.body);
        this.refresh();
      }
      fadeProgressElement(callback) {
        this.progressElement.style.opacity = "0";
        setTimeout(callback, ProgressBar.animationDuration * 1.5);
      }
      uninstallProgressElement() {
        if (this.progressElement.parentNode) {
          document.documentElement.removeChild(this.progressElement);
        }
      }
      startTrickling() {
        if (!this.trickleInterval) {
          this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
        }
      }
      stopTrickling() {
        window.clearInterval(this.trickleInterval);
        delete this.trickleInterval;
      }
      refresh() {
        requestAnimationFrame(() => {
          this.progressElement.style.width = `${10 + this.value * 90}%`;
        });
      }
      createStylesheetElement() {
        const element = document.createElement("style");
        element.type = "text/css";
        element.textContent = ProgressBar.defaultCSS;
        return element;
      }
      createProgressElement() {
        const element = document.createElement("div");
        element.className = "turbo-progress-bar";
        return element;
      }
    }
    ProgressBar.animationDuration = 300;
    class HeadSnapshot extends Snapshot {
      constructor() {
        super(...arguments);
        this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
          const { outerHTML } = element;
          const details = outerHTML in result ? result[outerHTML] : {
            type: elementType(element),
            tracked: elementIsTracked(element),
            elements: []
          };
          return Object.assign(Object.assign({}, result), {
            [outerHTML]: Object.assign(Object.assign({}, details), {
              elements: [...details.elements, element]
            })
          });
        }, {});
      }
      get trackedElementSignature() {
        return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
      }
      getScriptElementsNotInSnapshot(snapshot) {
        return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
      }
      getStylesheetElementsNotInSnapshot(snapshot) {
        return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
      }
      getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
        return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
      }
      get provisionalElements() {
        return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
          const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
          if (type == null && !tracked) {
            return [...result, ...elements];
          } else if (elements.length > 1) {
            return [...result, ...elements.slice(1)];
          } else {
            return result;
          }
        }, []);
      }
      getMetaValue(name) {
        const element = this.findMetaElementByName(name);
        return element ? element.getAttribute("content") : null;
      }
      findMetaElementByName(name) {
        return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
          const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
          return elementIsMetaElementWithName(element, name) ? element : result;
        }, void 0);
      }
    }
    function elementType(element) {
      if (elementIsScript(element)) {
        return "script";
      } else if (elementIsStylesheet(element)) {
        return "stylesheet";
      }
    }
    function elementIsTracked(element) {
      return element.getAttribute("data-turbo-track") == "reload";
    }
    function elementIsScript(element) {
      const tagName = element.tagName.toLowerCase();
      return tagName == "script";
    }
    function elementIsNoscript(element) {
      const tagName = element.tagName.toLowerCase();
      return tagName == "noscript";
    }
    function elementIsStylesheet(element) {
      const tagName = element.tagName.toLowerCase();
      return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
    }
    function elementIsMetaElementWithName(element, name) {
      const tagName = element.tagName.toLowerCase();
      return tagName == "meta" && element.getAttribute("name") == name;
    }
    function elementWithoutNonce(element) {
      if (element.hasAttribute("nonce")) {
        element.setAttribute("nonce", "");
      }
      return element;
    }
    class PageSnapshot extends Snapshot {
      constructor(element, headSnapshot) {
        super(element);
        this.headSnapshot = headSnapshot;
      }
      static fromHTMLString(html = "") {
        return this.fromDocument(parseHTMLDocument(html));
      }
      static fromElement(element) {
        return this.fromDocument(element.ownerDocument);
      }
      static fromDocument({ head, body }) {
        return new this(body, new HeadSnapshot(head));
      }
      clone() {
        return new PageSnapshot(this.element.cloneNode(true), this.headSnapshot);
      }
      get headElement() {
        return this.headSnapshot.element;
      }
      get rootLocation() {
        var _a;
        const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
        return expandURL(root);
      }
      get cacheControlValue() {
        return this.getSetting("cache-control");
      }
      get isPreviewable() {
        return this.cacheControlValue != "no-preview";
      }
      get isCacheable() {
        return this.cacheControlValue != "no-cache";
      }
      get isVisitable() {
        return this.getSetting("visit-control") != "reload";
      }
      getSetting(name) {
        return this.headSnapshot.getMetaValue(`turbo-${name}`);
      }
    }
    var TimingMetric;
    (function(TimingMetric2) {
      TimingMetric2["visitStart"] = "visitStart";
      TimingMetric2["requestStart"] = "requestStart";
      TimingMetric2["requestEnd"] = "requestEnd";
      TimingMetric2["visitEnd"] = "visitEnd";
    })(TimingMetric || (TimingMetric = {}));
    var VisitState;
    (function(VisitState2) {
      VisitState2["initialized"] = "initialized";
      VisitState2["started"] = "started";
      VisitState2["canceled"] = "canceled";
      VisitState2["failed"] = "failed";
      VisitState2["completed"] = "completed";
    })(VisitState || (VisitState = {}));
    const defaultOptions = {
      action: "advance",
      historyChanged: false
    };
    var SystemStatusCode;
    (function(SystemStatusCode2) {
      SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
      SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
      SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
    })(SystemStatusCode || (SystemStatusCode = {}));
    class Visit {
      constructor(delegate, location2, restorationIdentifier, options = {}) {
        this.identifier = uuid();
        this.timingMetrics = {};
        this.followedRedirect = false;
        this.historyChanged = false;
        this.scrolled = false;
        this.snapshotCached = false;
        this.state = VisitState.initialized;
        this.delegate = delegate;
        this.location = location2;
        this.restorationIdentifier = restorationIdentifier || uuid();
        const { action, historyChanged, referrer, snapshotHTML, response } = Object.assign(Object.assign({}, defaultOptions), options);
        this.action = action;
        this.historyChanged = historyChanged;
        this.referrer = referrer;
        this.snapshotHTML = snapshotHTML;
        this.response = response;
        this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      }
      get adapter() {
        return this.delegate.adapter;
      }
      get view() {
        return this.delegate.view;
      }
      get history() {
        return this.delegate.history;
      }
      get restorationData() {
        return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
      }
      get silent() {
        return this.isSamePage;
      }
      start() {
        if (this.state == VisitState.initialized) {
          this.recordTimingMetric(TimingMetric.visitStart);
          this.state = VisitState.started;
          this.adapter.visitStarted(this);
          this.delegate.visitStarted(this);
        }
      }
      cancel() {
        if (this.state == VisitState.started) {
          if (this.request) {
            this.request.cancel();
          }
          this.cancelRender();
          this.state = VisitState.canceled;
        }
      }
      complete() {
        if (this.state == VisitState.started) {
          this.recordTimingMetric(TimingMetric.visitEnd);
          this.state = VisitState.completed;
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
          this.followRedirect();
        }
      }
      fail() {
        if (this.state == VisitState.started) {
          this.state = VisitState.failed;
          this.adapter.visitFailed(this);
        }
      }
      changeHistory() {
        var _a;
        if (!this.historyChanged) {
          const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
          const method = this.getHistoryMethodForAction(actionForHistory);
          this.history.update(method, this.location, this.restorationIdentifier);
          this.historyChanged = true;
        }
      }
      issueRequest() {
        if (this.hasPreloadedResponse()) {
          this.simulateRequest();
        } else if (this.shouldIssueRequest() && !this.request) {
          this.request = new FetchRequest$1(this, FetchMethod.get, this.location);
          this.request.perform();
        }
      }
      simulateRequest() {
        if (this.response) {
          this.startRequest();
          this.recordResponse();
          this.finishRequest();
        }
      }
      startRequest() {
        this.recordTimingMetric(TimingMetric.requestStart);
        this.adapter.visitRequestStarted(this);
      }
      recordResponse(response = this.response) {
        this.response = response;
        if (response) {
          const { statusCode } = response;
          if (isSuccessful(statusCode)) {
            this.adapter.visitRequestCompleted(this);
          } else {
            this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
          }
        }
      }
      finishRequest() {
        this.recordTimingMetric(TimingMetric.requestEnd);
        this.adapter.visitRequestFinished(this);
      }
      loadResponse() {
        if (this.response) {
          const { statusCode, responseHTML } = this.response;
          this.render(async () => {
            this.cacheSnapshot();
            if (this.view.renderPromise)
              await this.view.renderPromise;
            if (isSuccessful(statusCode) && responseHTML != null) {
              await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML));
              this.adapter.visitRendered(this);
              this.complete();
            } else {
              await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML));
              this.adapter.visitRendered(this);
              this.fail();
            }
          });
        }
      }
      getCachedSnapshot() {
        const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
        if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
          if (this.action == "restore" || snapshot.isPreviewable) {
            return snapshot;
          }
        }
      }
      getPreloadedSnapshot() {
        if (this.snapshotHTML) {
          return PageSnapshot.fromHTMLString(this.snapshotHTML);
        }
      }
      hasCachedSnapshot() {
        return this.getCachedSnapshot() != null;
      }
      loadCachedSnapshot() {
        const snapshot = this.getCachedSnapshot();
        if (snapshot) {
          const isPreview = this.shouldIssueRequest();
          this.render(async () => {
            this.cacheSnapshot();
            if (this.isSamePage) {
              this.adapter.visitRendered(this);
            } else {
              if (this.view.renderPromise)
                await this.view.renderPromise;
              await this.view.renderPage(snapshot, isPreview);
              this.adapter.visitRendered(this);
              if (!isPreview) {
                this.complete();
              }
            }
          });
        }
      }
      followRedirect() {
        if (this.redirectedToLocation && !this.followedRedirect) {
          this.adapter.visitProposedToLocation(this.redirectedToLocation, {
            action: "replace",
            response: this.response
          });
          this.followedRedirect = true;
        }
      }
      goToSamePageAnchor() {
        if (this.isSamePage) {
          this.render(async () => {
            this.cacheSnapshot();
            this.adapter.visitRendered(this);
          });
        }
      }
      requestStarted() {
        this.startRequest();
      }
      requestPreventedHandlingResponse(request, response) {
      }
      async requestSucceededWithResponse(request, response) {
        const responseHTML = await response.responseHTML;
        if (responseHTML == void 0) {
          this.recordResponse({
            statusCode: SystemStatusCode.contentTypeMismatch
          });
        } else {
          this.redirectedToLocation = response.redirected ? response.location : void 0;
          this.recordResponse({
            statusCode: response.statusCode,
            responseHTML
          });
        }
      }
      async requestFailedWithResponse(request, response) {
        const responseHTML = await response.responseHTML;
        if (responseHTML == void 0) {
          this.recordResponse({
            statusCode: SystemStatusCode.contentTypeMismatch
          });
        } else {
          this.recordResponse({
            statusCode: response.statusCode,
            responseHTML
          });
        }
      }
      requestErrored(request, error2) {
        this.recordResponse({
          statusCode: SystemStatusCode.networkFailure
        });
      }
      requestFinished() {
        this.finishRequest();
      }
      performScroll() {
        if (!this.scrolled) {
          if (this.action == "restore") {
            this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
          } else {
            this.scrollToAnchor() || this.view.scrollToTop();
          }
          if (this.isSamePage) {
            this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
          }
          this.scrolled = true;
        }
      }
      scrollToRestoredPosition() {
        const { scrollPosition } = this.restorationData;
        if (scrollPosition) {
          this.view.scrollToPosition(scrollPosition);
          return true;
        }
      }
      scrollToAnchor() {
        const anchor = getAnchor(this.location);
        if (anchor != null) {
          this.view.scrollToAnchor(anchor);
          return true;
        }
      }
      recordTimingMetric(metric) {
        this.timingMetrics[metric] = new Date().getTime();
      }
      getTimingMetrics() {
        return Object.assign({}, this.timingMetrics);
      }
      getHistoryMethodForAction(action) {
        switch (action) {
          case "replace":
            return history.replaceState;
          case "advance":
          case "restore":
            return history.pushState;
        }
      }
      hasPreloadedResponse() {
        return typeof this.response == "object";
      }
      shouldIssueRequest() {
        if (this.isSamePage) {
          return false;
        } else if (this.action == "restore") {
          return !this.hasCachedSnapshot();
        } else {
          return true;
        }
      }
      cacheSnapshot() {
        if (!this.snapshotCached) {
          this.view.cacheSnapshot();
          this.snapshotCached = true;
        }
      }
      async render(callback) {
        this.cancelRender();
        await new Promise((resolve) => {
          this.frame = requestAnimationFrame(() => resolve());
        });
        await callback();
        delete this.frame;
        this.performScroll();
      }
      cancelRender() {
        if (this.frame) {
          cancelAnimationFrame(this.frame);
          delete this.frame;
        }
      }
    }
    function isSuccessful(statusCode) {
      return statusCode >= 200 && statusCode < 300;
    }
    class BrowserAdapter {
      constructor(session2) {
        this.progressBar = new ProgressBar();
        this.showProgressBar = () => {
          this.progressBar.show();
        };
        this.session = session2;
      }
      visitProposedToLocation(location2, options) {
        this.navigator.startVisit(location2, uuid(), options);
      }
      visitStarted(visit2) {
        visit2.issueRequest();
        visit2.changeHistory();
        visit2.goToSamePageAnchor();
        visit2.loadCachedSnapshot();
      }
      visitRequestStarted(visit2) {
        this.progressBar.setValue(0);
        if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
          this.showVisitProgressBarAfterDelay();
        } else {
          this.showProgressBar();
        }
      }
      visitRequestCompleted(visit2) {
        visit2.loadResponse();
      }
      visitRequestFailedWithStatusCode(visit2, statusCode) {
        switch (statusCode) {
          case SystemStatusCode.networkFailure:
          case SystemStatusCode.timeoutFailure:
          case SystemStatusCode.contentTypeMismatch:
            return this.reload();
          default:
            return visit2.loadResponse();
        }
      }
      visitRequestFinished(visit2) {
        this.progressBar.setValue(1);
        this.hideVisitProgressBar();
      }
      visitCompleted(visit2) {
      }
      pageInvalidated() {
        this.reload();
      }
      visitFailed(visit2) {
      }
      visitRendered(visit2) {
      }
      formSubmissionStarted(formSubmission) {
        this.progressBar.setValue(0);
        this.showFormProgressBarAfterDelay();
      }
      formSubmissionFinished(formSubmission) {
        this.progressBar.setValue(1);
        this.hideFormProgressBar();
      }
      showVisitProgressBarAfterDelay() {
        this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
      hideVisitProgressBar() {
        this.progressBar.hide();
        if (this.visitProgressBarTimeout != null) {
          window.clearTimeout(this.visitProgressBarTimeout);
          delete this.visitProgressBarTimeout;
        }
      }
      showFormProgressBarAfterDelay() {
        if (this.formProgressBarTimeout == null) {
          this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
        }
      }
      hideFormProgressBar() {
        this.progressBar.hide();
        if (this.formProgressBarTimeout != null) {
          window.clearTimeout(this.formProgressBarTimeout);
          delete this.formProgressBarTimeout;
        }
      }
      reload() {
        window.location.reload();
      }
      get navigator() {
        return this.session.navigator;
      }
    }
    class CacheObserver {
      constructor() {
        this.started = false;
      }
      start() {
        if (!this.started) {
          this.started = true;
          addEventListener("turbo:before-cache", this.removeStaleElements, false);
        }
      }
      stop() {
        if (this.started) {
          this.started = false;
          removeEventListener("turbo:before-cache", this.removeStaleElements, false);
        }
      }
      removeStaleElements() {
        const staleElements = [...document.querySelectorAll('[data-turbo-cache="false"]')];
        for (const element of staleElements) {
          element.remove();
        }
      }
    }
    class FormSubmitObserver {
      constructor(delegate) {
        this.started = false;
        this.submitCaptured = () => {
          removeEventListener("submit", this.submitBubbled, false);
          addEventListener("submit", this.submitBubbled, false);
        };
        this.submitBubbled = (event) => {
          if (!event.defaultPrevented) {
            const form = event.target instanceof HTMLFormElement ? event.target : void 0;
            const submitter = event.submitter || void 0;
            if (form) {
              const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.method;
              if (method != "dialog" && this.delegate.willSubmitForm(form, submitter)) {
                event.preventDefault();
                this.delegate.formSubmitted(form, submitter);
              }
            }
          }
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          addEventListener("submit", this.submitCaptured, true);
          this.started = true;
        }
      }
      stop() {
        if (this.started) {
          removeEventListener("submit", this.submitCaptured, true);
          this.started = false;
        }
      }
    }
    class FrameRedirector {
      constructor(element) {
        this.element = element;
        this.linkInterceptor = new LinkInterceptor(this, element);
        this.formInterceptor = new FormInterceptor(this, element);
      }
      start() {
        this.linkInterceptor.start();
        this.formInterceptor.start();
      }
      stop() {
        this.linkInterceptor.stop();
        this.formInterceptor.stop();
      }
      shouldInterceptLinkClick(element, url) {
        return this.shouldRedirect(element);
      }
      linkClickIntercepted(element, url) {
        const frame = this.findFrameElement(element);
        if (frame) {
          frame.setAttribute("reloadable", "");
          frame.src = url;
        }
      }
      shouldInterceptFormSubmission(element, submitter) {
        return this.shouldRedirect(element, submitter);
      }
      formSubmissionIntercepted(element, submitter) {
        const frame = this.findFrameElement(element, submitter);
        if (frame) {
          frame.removeAttribute("reloadable");
          frame.delegate.formSubmissionIntercepted(element, submitter);
        }
      }
      shouldRedirect(element, submitter) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      }
      findFrameElement(element, submitter) {
        const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
        if (id && id != "_top") {
          const frame = this.element.querySelector(`#${id}:not([disabled])`);
          if (frame instanceof FrameElement) {
            return frame;
          }
        }
      }
    }
    class History {
      constructor(delegate) {
        this.restorationIdentifier = uuid();
        this.restorationData = {};
        this.started = false;
        this.pageLoaded = false;
        this.onPopState = (event) => {
          if (this.shouldHandlePopState()) {
            const { turbo } = event.state || {};
            if (turbo) {
              this.location = new URL(window.location.href);
              const { restorationIdentifier } = turbo;
              this.restorationIdentifier = restorationIdentifier;
              this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
            }
          }
        };
        this.onPageLoad = async (event) => {
          await nextMicrotask();
          this.pageLoaded = true;
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          addEventListener("popstate", this.onPopState, false);
          addEventListener("load", this.onPageLoad, false);
          this.started = true;
          this.replace(new URL(window.location.href));
        }
      }
      stop() {
        if (this.started) {
          removeEventListener("popstate", this.onPopState, false);
          removeEventListener("load", this.onPageLoad, false);
          this.started = false;
        }
      }
      push(location2, restorationIdentifier) {
        this.update(history.pushState, location2, restorationIdentifier);
      }
      replace(location2, restorationIdentifier) {
        this.update(history.replaceState, location2, restorationIdentifier);
      }
      update(method, location2, restorationIdentifier = uuid()) {
        const state = {
          turbo: {
            restorationIdentifier
          }
        };
        method.call(history, state, "", location2.href);
        this.location = location2;
        this.restorationIdentifier = restorationIdentifier;
      }
      getRestorationDataForIdentifier(restorationIdentifier) {
        return this.restorationData[restorationIdentifier] || {};
      }
      updateRestorationData(additionalData) {
        const { restorationIdentifier } = this;
        const restorationData = this.restorationData[restorationIdentifier];
        this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
      }
      assumeControlOfScrollRestoration() {
        var _a;
        if (!this.previousScrollRestoration) {
          this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
          history.scrollRestoration = "manual";
        }
      }
      relinquishControlOfScrollRestoration() {
        if (this.previousScrollRestoration) {
          history.scrollRestoration = this.previousScrollRestoration;
          delete this.previousScrollRestoration;
        }
      }
      shouldHandlePopState() {
        return this.pageIsLoaded();
      }
      pageIsLoaded() {
        return this.pageLoaded || document.readyState == "complete";
      }
    }
    class LinkClickObserver {
      constructor(delegate) {
        this.started = false;
        this.clickCaptured = () => {
          removeEventListener("click", this.clickBubbled, false);
          addEventListener("click", this.clickBubbled, false);
        };
        this.clickBubbled = (event) => {
          if (this.clickEventIsSignificant(event)) {
            const target = event.composedPath && event.composedPath()[0] || event.target;
            const link = this.findLinkFromClickTarget(target);
            if (link) {
              const location2 = this.getLocationForLink(link);
              if (this.delegate.willFollowLinkToLocation(link, location2)) {
                event.preventDefault();
                this.delegate.followedLinkToLocation(link, location2);
              }
            }
          }
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          addEventListener("click", this.clickCaptured, true);
          this.started = true;
        }
      }
      stop() {
        if (this.started) {
          removeEventListener("click", this.clickCaptured, true);
          this.started = false;
        }
      }
      clickEventIsSignificant(event) {
        return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
      }
      findLinkFromClickTarget(target) {
        if (target instanceof Element) {
          return target.closest("a[href]:not([target^=_]):not([download])");
        }
      }
      getLocationForLink(link) {
        return expandURL(link.getAttribute("href") || "");
      }
    }
    function isAction(action) {
      return action == "advance" || action == "replace" || action == "restore";
    }
    class Navigator {
      constructor(delegate) {
        this.delegate = delegate;
      }
      proposeVisit(location2, options = {}) {
        if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
          this.delegate.visitProposedToLocation(location2, options);
        }
      }
      startVisit(locatable, restorationIdentifier, options = {}) {
        this.stop();
        this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({
          referrer: this.location
        }, options));
        this.currentVisit.start();
      }
      submitForm(form, submitter) {
        this.stop();
        this.formSubmission = new FormSubmission(this, form, submitter, true);
        if (this.formSubmission.isIdempotent) {
          this.proposeVisit(this.formSubmission.fetchRequest.url, {
            action: this.getActionForFormSubmission(this.formSubmission)
          });
        } else {
          this.formSubmission.start();
        }
      }
      stop() {
        if (this.formSubmission) {
          this.formSubmission.stop();
          delete this.formSubmission;
        }
        if (this.currentVisit) {
          this.currentVisit.cancel();
          delete this.currentVisit;
        }
      }
      get adapter() {
        return this.delegate.adapter;
      }
      get view() {
        return this.delegate.view;
      }
      get history() {
        return this.delegate.history;
      }
      formSubmissionStarted(formSubmission) {
        if (typeof this.adapter.formSubmissionStarted === "function") {
          this.adapter.formSubmissionStarted(formSubmission);
        }
      }
      async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
        if (formSubmission == this.formSubmission) {
          const responseHTML = await fetchResponse.responseHTML;
          if (responseHTML) {
            if (formSubmission.method != FetchMethod.get) {
              this.view.clearSnapshotCache();
            }
            const { statusCode } = fetchResponse;
            const visitOptions = {
              response: {
                statusCode,
                responseHTML
              }
            };
            this.proposeVisit(fetchResponse.location, visitOptions);
          }
        }
      }
      async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const snapshot = PageSnapshot.fromHTMLString(responseHTML);
          if (fetchResponse.serverError) {
            await this.view.renderError(snapshot);
          } else {
            await this.view.renderPage(snapshot);
          }
          this.view.scrollToTop();
          this.view.clearSnapshotCache();
        }
      }
      formSubmissionErrored(formSubmission, error2) {
        console.error(error2);
      }
      formSubmissionFinished(formSubmission) {
        if (typeof this.adapter.formSubmissionFinished === "function") {
          this.adapter.formSubmissionFinished(formSubmission);
        }
      }
      visitStarted(visit2) {
        this.delegate.visitStarted(visit2);
      }
      visitCompleted(visit2) {
        this.delegate.visitCompleted(visit2);
      }
      locationWithActionIsSamePage(location2, action) {
        const anchor = getAnchor(location2);
        const currentAnchor = getAnchor(this.view.lastRenderedLocation);
        const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
        return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
      }
      visitScrolledToSamePageLocation(oldURL, newURL) {
        this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
      }
      get location() {
        return this.history.location;
      }
      get restorationIdentifier() {
        return this.history.restorationIdentifier;
      }
      getActionForFormSubmission(formSubmission) {
        const { formElement, submitter } = formSubmission;
        const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-action")) || formElement.getAttribute("data-turbo-action");
        return isAction(action) ? action : "advance";
      }
    }
    var PageStage;
    (function(PageStage2) {
      PageStage2[PageStage2["initial"] = 0] = "initial";
      PageStage2[PageStage2["loading"] = 1] = "loading";
      PageStage2[PageStage2["interactive"] = 2] = "interactive";
      PageStage2[PageStage2["complete"] = 3] = "complete";
    })(PageStage || (PageStage = {}));
    class PageObserver {
      constructor(delegate) {
        this.stage = PageStage.initial;
        this.started = false;
        this.interpretReadyState = () => {
          const { readyState } = this;
          if (readyState == "interactive") {
            this.pageIsInteractive();
          } else if (readyState == "complete") {
            this.pageIsComplete();
          }
        };
        this.pageWillUnload = () => {
          this.delegate.pageWillUnload();
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          if (this.stage == PageStage.initial) {
            this.stage = PageStage.loading;
          }
          document.addEventListener("readystatechange", this.interpretReadyState, false);
          addEventListener("pagehide", this.pageWillUnload, false);
          this.started = true;
        }
      }
      stop() {
        if (this.started) {
          document.removeEventListener("readystatechange", this.interpretReadyState, false);
          removeEventListener("pagehide", this.pageWillUnload, false);
          this.started = false;
        }
      }
      pageIsInteractive() {
        if (this.stage == PageStage.loading) {
          this.stage = PageStage.interactive;
          this.delegate.pageBecameInteractive();
        }
      }
      pageIsComplete() {
        this.pageIsInteractive();
        if (this.stage == PageStage.interactive) {
          this.stage = PageStage.complete;
          this.delegate.pageLoaded();
        }
      }
      get readyState() {
        return document.readyState;
      }
    }
    class ScrollObserver {
      constructor(delegate) {
        this.started = false;
        this.onScroll = () => {
          this.updatePosition({
            x: window.pageXOffset,
            y: window.pageYOffset
          });
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          addEventListener("scroll", this.onScroll, false);
          this.onScroll();
          this.started = true;
        }
      }
      stop() {
        if (this.started) {
          removeEventListener("scroll", this.onScroll, false);
          this.started = false;
        }
      }
      updatePosition(position) {
        this.delegate.scrollPositionChanged(position);
      }
    }
    class StreamObserver {
      constructor(delegate) {
        this.sources = /* @__PURE__ */ new Set();
        this.started = false;
        this.inspectFetchResponse = (event) => {
          const response = fetchResponseFromEvent(event);
          if (response && fetchResponseIsStream(response)) {
            event.preventDefault();
            this.receiveMessageResponse(response);
          }
        };
        this.receiveMessageEvent = (event) => {
          if (this.started && typeof event.data == "string") {
            this.receiveMessageHTML(event.data);
          }
        };
        this.delegate = delegate;
      }
      start() {
        if (!this.started) {
          this.started = true;
          addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
        }
      }
      stop() {
        if (this.started) {
          this.started = false;
          removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
        }
      }
      connectStreamSource(source) {
        if (!this.streamSourceIsConnected(source)) {
          this.sources.add(source);
          source.addEventListener("message", this.receiveMessageEvent, false);
        }
      }
      disconnectStreamSource(source) {
        if (this.streamSourceIsConnected(source)) {
          this.sources.delete(source);
          source.removeEventListener("message", this.receiveMessageEvent, false);
        }
      }
      streamSourceIsConnected(source) {
        return this.sources.has(source);
      }
      async receiveMessageResponse(response) {
        const html = await response.responseHTML;
        if (html) {
          this.receiveMessageHTML(html);
        }
      }
      receiveMessageHTML(html) {
        this.delegate.receivedMessageFromStream(new StreamMessage(html));
      }
    }
    function fetchResponseFromEvent(event) {
      var _a;
      const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
      if (fetchResponse instanceof FetchResponse$1) {
        return fetchResponse;
      }
    }
    function fetchResponseIsStream(response) {
      var _a;
      const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
      return contentType.startsWith(StreamMessage.contentType);
    }
    class ErrorRenderer extends Renderer {
      async render() {
        this.replaceHeadAndBody();
        this.activateScriptElements();
      }
      replaceHeadAndBody() {
        const { documentElement, head, body } = document;
        documentElement.replaceChild(this.newHead, head);
        documentElement.replaceChild(this.newElement, body);
      }
      activateScriptElements() {
        for (const replaceableElement of this.scriptElements) {
          const parentNode = replaceableElement.parentNode;
          if (parentNode) {
            const element = this.createScriptElement(replaceableElement);
            parentNode.replaceChild(element, replaceableElement);
          }
        }
      }
      get newHead() {
        return this.newSnapshot.headSnapshot.element;
      }
      get scriptElements() {
        return [...document.documentElement.querySelectorAll("script")];
      }
    }
    class PageRenderer extends Renderer {
      get shouldRender() {
        return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
      }
      prepareToRender() {
        this.mergeHead();
      }
      async render() {
        this.replaceBody();
      }
      finishRendering() {
        super.finishRendering();
        if (!this.isPreview) {
          this.focusFirstAutofocusableElement();
        }
      }
      get currentHeadSnapshot() {
        return this.currentSnapshot.headSnapshot;
      }
      get newHeadSnapshot() {
        return this.newSnapshot.headSnapshot;
      }
      get newElement() {
        return this.newSnapshot.element;
      }
      mergeHead() {
        this.copyNewHeadStylesheetElements();
        this.copyNewHeadScriptElements();
        this.removeCurrentHeadProvisionalElements();
        this.copyNewHeadProvisionalElements();
      }
      replaceBody() {
        this.preservingPermanentElements(() => {
          this.activateNewBody();
          this.assignNewBody();
        });
      }
      get trackedElementsAreIdentical() {
        return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
      }
      copyNewHeadStylesheetElements() {
        for (const element of this.newHeadStylesheetElements) {
          document.head.appendChild(element);
        }
      }
      copyNewHeadScriptElements() {
        for (const element of this.newHeadScriptElements) {
          document.head.appendChild(this.createScriptElement(element));
        }
      }
      removeCurrentHeadProvisionalElements() {
        for (const element of this.currentHeadProvisionalElements) {
          document.head.removeChild(element);
        }
      }
      copyNewHeadProvisionalElements() {
        for (const element of this.newHeadProvisionalElements) {
          document.head.appendChild(element);
        }
      }
      activateNewBody() {
        document.adoptNode(this.newElement);
        this.activateNewBodyScriptElements();
      }
      activateNewBodyScriptElements() {
        for (const inertScriptElement of this.newBodyScriptElements) {
          const activatedScriptElement = this.createScriptElement(inertScriptElement);
          inertScriptElement.replaceWith(activatedScriptElement);
        }
      }
      assignNewBody() {
        if (document.body && this.newElement instanceof HTMLBodyElement) {
          document.body.replaceWith(this.newElement);
        } else {
          document.documentElement.appendChild(this.newElement);
        }
      }
      get newHeadStylesheetElements() {
        return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
      }
      get newHeadScriptElements() {
        return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
      }
      get currentHeadProvisionalElements() {
        return this.currentHeadSnapshot.provisionalElements;
      }
      get newHeadProvisionalElements() {
        return this.newHeadSnapshot.provisionalElements;
      }
      get newBodyScriptElements() {
        return this.newElement.querySelectorAll("script");
      }
    }
    class SnapshotCache {
      constructor(size) {
        this.keys = [];
        this.snapshots = {};
        this.size = size;
      }
      has(location2) {
        return toCacheKey(location2) in this.snapshots;
      }
      get(location2) {
        if (this.has(location2)) {
          const snapshot = this.read(location2);
          this.touch(location2);
          return snapshot;
        }
      }
      put(location2, snapshot) {
        this.write(location2, snapshot);
        this.touch(location2);
        return snapshot;
      }
      clear() {
        this.snapshots = {};
      }
      read(location2) {
        return this.snapshots[toCacheKey(location2)];
      }
      write(location2, snapshot) {
        this.snapshots[toCacheKey(location2)] = snapshot;
      }
      touch(location2) {
        const key = toCacheKey(location2);
        const index2 = this.keys.indexOf(key);
        if (index2 > -1)
          this.keys.splice(index2, 1);
        this.keys.unshift(key);
        this.trim();
      }
      trim() {
        for (const key of this.keys.splice(this.size)) {
          delete this.snapshots[key];
        }
      }
    }
    class PageView extends View {
      constructor() {
        super(...arguments);
        this.snapshotCache = new SnapshotCache(10);
        this.lastRenderedLocation = new URL(location.href);
      }
      renderPage(snapshot, isPreview = false) {
        const renderer = new PageRenderer(this.snapshot, snapshot, isPreview);
        return this.render(renderer);
      }
      renderError(snapshot) {
        const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
        return this.render(renderer);
      }
      clearSnapshotCache() {
        this.snapshotCache.clear();
      }
      async cacheSnapshot() {
        if (this.shouldCacheSnapshot) {
          this.delegate.viewWillCacheSnapshot();
          const { snapshot, lastRenderedLocation: location2 } = this;
          await nextEventLoopTick();
          this.snapshotCache.put(location2, snapshot.clone());
        }
      }
      getCachedSnapshotForLocation(location2) {
        return this.snapshotCache.get(location2);
      }
      get snapshot() {
        return PageSnapshot.fromElement(this.element);
      }
      get shouldCacheSnapshot() {
        return this.snapshot.isCacheable;
      }
    }
    class Session {
      constructor() {
        this.navigator = new Navigator(this);
        this.history = new History(this);
        this.view = new PageView(this, document.documentElement);
        this.adapter = new BrowserAdapter(this);
        this.pageObserver = new PageObserver(this);
        this.cacheObserver = new CacheObserver();
        this.linkClickObserver = new LinkClickObserver(this);
        this.formSubmitObserver = new FormSubmitObserver(this);
        this.scrollObserver = new ScrollObserver(this);
        this.streamObserver = new StreamObserver(this);
        this.frameRedirector = new FrameRedirector(document.documentElement);
        this.drive = true;
        this.enabled = true;
        this.progressBarDelay = 500;
        this.started = false;
      }
      start() {
        if (!this.started) {
          this.pageObserver.start();
          this.cacheObserver.start();
          this.linkClickObserver.start();
          this.formSubmitObserver.start();
          this.scrollObserver.start();
          this.streamObserver.start();
          this.frameRedirector.start();
          this.history.start();
          this.started = true;
          this.enabled = true;
        }
      }
      disable() {
        this.enabled = false;
      }
      stop() {
        if (this.started) {
          this.pageObserver.stop();
          this.cacheObserver.stop();
          this.linkClickObserver.stop();
          this.formSubmitObserver.stop();
          this.scrollObserver.stop();
          this.streamObserver.stop();
          this.frameRedirector.stop();
          this.history.stop();
          this.started = false;
        }
      }
      registerAdapter(adapter) {
        this.adapter = adapter;
      }
      visit(location2, options = {}) {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
      connectStreamSource(source) {
        this.streamObserver.connectStreamSource(source);
      }
      disconnectStreamSource(source) {
        this.streamObserver.disconnectStreamSource(source);
      }
      renderStreamMessage(message) {
        document.documentElement.appendChild(StreamMessage.wrap(message).fragment);
      }
      clearCache() {
        this.view.clearSnapshotCache();
      }
      setProgressBarDelay(delay) {
        this.progressBarDelay = delay;
      }
      get location() {
        return this.history.location;
      }
      get restorationIdentifier() {
        return this.history.restorationIdentifier;
      }
      historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
        if (this.enabled) {
          this.navigator.startVisit(location2, restorationIdentifier, {
            action: "restore",
            historyChanged: true
          });
        } else {
          this.adapter.pageInvalidated();
        }
      }
      scrollPositionChanged(position) {
        this.history.updateRestorationData({
          scrollPosition: position
        });
      }
      willFollowLinkToLocation(link, location2) {
        return this.elementDriveEnabled(link) && this.locationIsVisitable(location2) && this.applicationAllowsFollowingLinkToLocation(link, location2);
      }
      followedLinkToLocation(link, location2) {
        const action = this.getActionForLink(link);
        this.convertLinkWithMethodClickToFormSubmission(link) || this.visit(location2.href, {
          action
        });
      }
      convertLinkWithMethodClickToFormSubmission(link) {
        var _a;
        const linkMethod = link.getAttribute("data-turbo-method");
        if (linkMethod) {
          const form = document.createElement("form");
          form.method = linkMethod;
          form.action = link.getAttribute("href") || "undefined";
          form.hidden = true;
          (_a = link.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(form, link);
          return dispatch("submit", {
            cancelable: true,
            target: form
          });
        } else {
          return false;
        }
      }
      allowsVisitingLocationWithAction(location2, action) {
        return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
      }
      visitProposedToLocation(location2, options) {
        extendURLWithDeprecatedProperties(location2);
        this.adapter.visitProposedToLocation(location2, options);
      }
      visitStarted(visit2) {
        extendURLWithDeprecatedProperties(visit2.location);
        if (!visit2.silent) {
          this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
        }
      }
      visitCompleted(visit2) {
        this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
      }
      locationWithActionIsSamePage(location2, action) {
        return this.navigator.locationWithActionIsSamePage(location2, action);
      }
      visitScrolledToSamePageLocation(oldURL, newURL) {
        this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
      }
      willSubmitForm(form, submitter) {
        return this.elementDriveEnabled(form) && (!submitter || this.elementDriveEnabled(submitter));
      }
      formSubmitted(form, submitter) {
        this.navigator.submitForm(form, submitter);
      }
      pageBecameInteractive() {
        this.view.lastRenderedLocation = this.location;
        this.notifyApplicationAfterPageLoad();
      }
      pageLoaded() {
        this.history.assumeControlOfScrollRestoration();
      }
      pageWillUnload() {
        this.history.relinquishControlOfScrollRestoration();
      }
      receivedMessageFromStream(message) {
        this.renderStreamMessage(message);
      }
      viewWillCacheSnapshot() {
        var _a;
        if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
          this.notifyApplicationBeforeCachingSnapshot();
        }
      }
      allowsImmediateRender({ element }, resume) {
        const event = this.notifyApplicationBeforeRender(element, resume);
        return !event.defaultPrevented;
      }
      viewRenderedSnapshot(snapshot, isPreview) {
        this.view.lastRenderedLocation = this.history.location;
        this.notifyApplicationAfterRender();
      }
      viewInvalidated() {
        this.adapter.pageInvalidated();
      }
      frameLoaded(frame) {
        this.notifyApplicationAfterFrameLoad(frame);
      }
      frameRendered(fetchResponse, frame) {
        this.notifyApplicationAfterFrameRender(fetchResponse, frame);
      }
      applicationAllowsFollowingLinkToLocation(link, location2) {
        const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2);
        return !event.defaultPrevented;
      }
      applicationAllowsVisitingLocation(location2) {
        const event = this.notifyApplicationBeforeVisitingLocation(location2);
        return !event.defaultPrevented;
      }
      notifyApplicationAfterClickingLinkToLocation(link, location2) {
        return dispatch("turbo:click", {
          target: link,
          detail: {
            url: location2.href
          },
          cancelable: true
        });
      }
      notifyApplicationBeforeVisitingLocation(location2) {
        return dispatch("turbo:before-visit", {
          detail: {
            url: location2.href
          },
          cancelable: true
        });
      }
      notifyApplicationAfterVisitingLocation(location2, action) {
        return dispatch("turbo:visit", {
          detail: {
            url: location2.href,
            action
          }
        });
      }
      notifyApplicationBeforeCachingSnapshot() {
        return dispatch("turbo:before-cache");
      }
      notifyApplicationBeforeRender(newBody, resume) {
        return dispatch("turbo:before-render", {
          detail: {
            newBody,
            resume
          },
          cancelable: true
        });
      }
      notifyApplicationAfterRender() {
        return dispatch("turbo:render");
      }
      notifyApplicationAfterPageLoad(timing = {}) {
        return dispatch("turbo:load", {
          detail: {
            url: this.location.href,
            timing
          }
        });
      }
      notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
        dispatchEvent(new HashChangeEvent("hashchange", {
          oldURL: oldURL.toString(),
          newURL: newURL.toString()
        }));
      }
      notifyApplicationAfterFrameLoad(frame) {
        return dispatch("turbo:frame-load", {
          target: frame
        });
      }
      notifyApplicationAfterFrameRender(fetchResponse, frame) {
        return dispatch("turbo:frame-render", {
          detail: {
            fetchResponse
          },
          target: frame,
          cancelable: true
        });
      }
      elementDriveEnabled(element) {
        const container = element === null || element === void 0 ? void 0 : element.closest("[data-turbo]");
        if (this.drive) {
          if (container) {
            return container.getAttribute("data-turbo") != "false";
          } else {
            return true;
          }
        } else {
          if (container) {
            return container.getAttribute("data-turbo") == "true";
          } else {
            return false;
          }
        }
      }
      getActionForLink(link) {
        const action = link.getAttribute("data-turbo-action");
        return isAction(action) ? action : "advance";
      }
      locationIsVisitable(location2) {
        return isPrefixedBy(location2, this.snapshot.rootLocation) && isHTML(location2);
      }
      get snapshot() {
        return this.view.snapshot;
      }
    }
    function extendURLWithDeprecatedProperties(url) {
      Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
    }
    const deprecatedLocationPropertyDescriptors = {
      absoluteURL: {
        get() {
          return this.toString();
        }
      }
    };
    const session = new Session();
    const { navigator: navigator$1 } = session;
    function start() {
      session.start();
    }
    function registerAdapter(adapter) {
      session.registerAdapter(adapter);
    }
    function visit(location2, options) {
      session.visit(location2, options);
    }
    function connectStreamSource(source) {
      session.connectStreamSource(source);
    }
    function disconnectStreamSource(source) {
      session.disconnectStreamSource(source);
    }
    function renderStreamMessage(message) {
      session.renderStreamMessage(message);
    }
    function clearCache() {
      session.clearCache();
    }
    function setProgressBarDelay(delay) {
      session.setProgressBarDelay(delay);
    }
    var Turbo = Object.freeze({
      __proto__: null,
      navigator: navigator$1,
      session,
      PageRenderer,
      PageSnapshot,
      start,
      registerAdapter,
      visit,
      connectStreamSource,
      disconnectStreamSource,
      renderStreamMessage,
      clearCache,
      setProgressBarDelay
    });
    class FrameController {
      constructor(element) {
        this.resolveVisitPromise = () => {
        };
        this.connected = false;
        this.hasBeenLoaded = false;
        this.settingSourceURL = false;
        this.element = element;
        this.view = new FrameView(this, this.element);
        this.appearanceObserver = new AppearanceObserver(this, this.element);
        this.linkInterceptor = new LinkInterceptor(this, this.element);
        this.formInterceptor = new FormInterceptor(this, this.element);
      }
      connect() {
        if (!this.connected) {
          this.connected = true;
          this.reloadable = false;
          if (this.loadingStyle == FrameLoadingStyle.lazy) {
            this.appearanceObserver.start();
          }
          this.linkInterceptor.start();
          this.formInterceptor.start();
          this.sourceURLChanged();
        }
      }
      disconnect() {
        if (this.connected) {
          this.connected = false;
          this.appearanceObserver.stop();
          this.linkInterceptor.stop();
          this.formInterceptor.stop();
        }
      }
      disabledChanged() {
        if (this.loadingStyle == FrameLoadingStyle.eager) {
          this.loadSourceURL();
        }
      }
      sourceURLChanged() {
        if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
          this.loadSourceURL();
        }
      }
      loadingStyleChanged() {
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.appearanceObserver.stop();
          this.loadSourceURL();
        }
      }
      async loadSourceURL() {
        if (!this.settingSourceURL && this.enabled && this.isActive && (this.reloadable || this.sourceURL != this.currentURL)) {
          const previousURL = this.currentURL;
          this.currentURL = this.sourceURL;
          if (this.sourceURL) {
            try {
              this.element.loaded = this.visit(this.sourceURL);
              this.appearanceObserver.stop();
              await this.element.loaded;
              this.hasBeenLoaded = true;
              session.frameLoaded(this.element);
            } catch (error2) {
              this.currentURL = previousURL;
              throw error2;
            }
          }
        }
      }
      async loadResponse(fetchResponse) {
        if (fetchResponse.redirected) {
          this.sourceURL = fetchResponse.response.url;
        }
        try {
          const html = await fetchResponse.responseHTML;
          if (html) {
            const { body } = parseHTMLDocument(html);
            const snapshot = new Snapshot(await this.extractForeignFrameElement(body));
            const renderer = new FrameRenderer(this.view.snapshot, snapshot, false);
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.render(renderer);
            session.frameRendered(fetchResponse, this.element);
          }
        } catch (error2) {
          console.error(error2);
          this.view.invalidate();
        }
      }
      elementAppearedInViewport(element) {
        this.loadSourceURL();
      }
      shouldInterceptLinkClick(element, url) {
        if (element.hasAttribute("data-turbo-method")) {
          return false;
        } else {
          return this.shouldInterceptNavigation(element);
        }
      }
      linkClickIntercepted(element, url) {
        this.reloadable = true;
        this.navigateFrame(element, url);
      }
      shouldInterceptFormSubmission(element, submitter) {
        return this.shouldInterceptNavigation(element, submitter);
      }
      formSubmissionIntercepted(element, submitter) {
        if (this.formSubmission) {
          this.formSubmission.stop();
        }
        this.reloadable = false;
        this.formSubmission = new FormSubmission(this, element, submitter);
        if (this.formSubmission.fetchRequest.isIdempotent) {
          this.navigateFrame(element, this.formSubmission.fetchRequest.url.href, submitter);
        } else {
          const { fetchRequest } = this.formSubmission;
          this.prepareHeadersForRequest(fetchRequest.headers, fetchRequest);
          this.formSubmission.start();
        }
      }
      prepareHeadersForRequest(headers, request) {
        headers["Turbo-Frame"] = this.id;
      }
      requestStarted(request) {
        this.element.setAttribute("busy", "");
      }
      requestPreventedHandlingResponse(request, response) {
        this.resolveVisitPromise();
      }
      async requestSucceededWithResponse(request, response) {
        await this.loadResponse(response);
        this.resolveVisitPromise();
      }
      requestFailedWithResponse(request, response) {
        console.error(response);
        this.resolveVisitPromise();
      }
      requestErrored(request, error2) {
        console.error(error2);
        this.resolveVisitPromise();
      }
      requestFinished(request) {
        this.element.removeAttribute("busy");
      }
      formSubmissionStarted(formSubmission) {
        const frame = this.findFrameElement(formSubmission.formElement);
        frame.setAttribute("busy", "");
      }
      formSubmissionSucceededWithResponse(formSubmission, response) {
        const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
        frame.delegate.loadResponse(response);
      }
      formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
        this.element.delegate.loadResponse(fetchResponse);
      }
      formSubmissionErrored(formSubmission, error2) {
        console.error(error2);
      }
      formSubmissionFinished(formSubmission) {
        const frame = this.findFrameElement(formSubmission.formElement);
        frame.removeAttribute("busy");
      }
      allowsImmediateRender(snapshot, resume) {
        return true;
      }
      viewRenderedSnapshot(snapshot, isPreview) {
      }
      viewInvalidated() {
      }
      async visit(url) {
        const request = new FetchRequest$1(this, FetchMethod.get, expandURL(url), void 0, this.element);
        return new Promise((resolve) => {
          this.resolveVisitPromise = () => {
            this.resolveVisitPromise = () => {
            };
            resolve();
          };
          request.perform();
        });
      }
      navigateFrame(element, url, submitter) {
        const frame = this.findFrameElement(element, submitter);
        frame.setAttribute("reloadable", "");
        frame.src = url;
      }
      findFrameElement(element, submitter) {
        var _a;
        const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame") || this.element.getAttribute("target");
        return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
      }
      async extractForeignFrameElement(container) {
        let element;
        const id = CSS.escape(this.id);
        try {
          if (element = activateElement(container.querySelector(`turbo-frame#${id}`), this.currentURL)) {
            return element;
          }
          if (element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.currentURL)) {
            await element.loaded;
            return await this.extractForeignFrameElement(element);
          }
          console.error(`Response has no matching <turbo-frame id="${id}"> element`);
        } catch (error2) {
          console.error(error2);
        }
        return new FrameElement();
      }
      shouldInterceptNavigation(element, submitter) {
        const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame") || this.element.getAttribute("target");
        if (!this.enabled || id == "_top") {
          return false;
        }
        if (id) {
          const frameElement = getFrameElementById(id);
          if (frameElement) {
            return !frameElement.disabled;
          }
        }
        if (!session.elementDriveEnabled(element)) {
          return false;
        }
        if (submitter && !session.elementDriveEnabled(submitter)) {
          return false;
        }
        return true;
      }
      get id() {
        return this.element.id;
      }
      get enabled() {
        return !this.element.disabled;
      }
      get sourceURL() {
        if (this.element.src) {
          return this.element.src;
        }
      }
      get reloadable() {
        const frame = this.findFrameElement(this.element);
        return frame.hasAttribute("reloadable");
      }
      set reloadable(value) {
        const frame = this.findFrameElement(this.element);
        if (value) {
          frame.setAttribute("reloadable", "");
        } else {
          frame.removeAttribute("reloadable");
        }
      }
      set sourceURL(sourceURL) {
        this.settingSourceURL = true;
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
        this.currentURL = this.element.src;
        this.settingSourceURL = false;
      }
      get loadingStyle() {
        return this.element.loading;
      }
      get isLoading() {
        return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
      }
      get isActive() {
        return this.element.isActive && this.connected;
      }
    }
    function getFrameElementById(id) {
      if (id != null) {
        const element = document.getElementById(id);
        if (element instanceof FrameElement) {
          return element;
        }
      }
    }
    function activateElement(element, currentURL) {
      if (element) {
        const src = element.getAttribute("src");
        if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
          throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
        }
        if (element.ownerDocument !== document) {
          element = document.importNode(element, true);
        }
        if (element instanceof FrameElement) {
          element.connectedCallback();
          return element;
        }
      }
    }
    const StreamActions = {
      after() {
        this.targetElements.forEach((e) => {
          var _a;
          return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
        });
      },
      append() {
        this.removeDuplicateTargetChildren();
        this.targetElements.forEach((e) => e.append(this.templateContent));
      },
      before() {
        this.targetElements.forEach((e) => {
          var _a;
          return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
        });
      },
      prepend() {
        this.removeDuplicateTargetChildren();
        this.targetElements.forEach((e) => e.prepend(this.templateContent));
      },
      remove() {
        this.targetElements.forEach((e) => e.remove());
      },
      replace() {
        this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
      },
      update() {
        this.targetElements.forEach((e) => {
          e.innerHTML = "";
          e.append(this.templateContent);
        });
      }
    };
    class StreamElement extends HTMLElement {
      async connectedCallback() {
        try {
          await this.render();
        } catch (error2) {
          console.error(error2);
        } finally {
          this.disconnect();
        }
      }
      async render() {
        var _a;
        return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
          if (this.dispatchEvent(this.beforeRenderEvent)) {
            await nextAnimationFrame();
            this.performAction();
          }
        })();
      }
      disconnect() {
        try {
          this.remove();
        } catch (_a) {
        }
      }
      removeDuplicateTargetChildren() {
        this.duplicateChildren.forEach((c) => c.remove());
      }
      get duplicateChildren() {
        var _a;
        const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
        const newChildrenIds = [...(_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children].filter((c) => !!c.id).map((c) => c.id);
        return existingChildren.filter((c) => newChildrenIds.includes(c.id));
      }
      get performAction() {
        if (this.action) {
          const actionFunction = StreamActions[this.action];
          if (actionFunction) {
            return actionFunction;
          }
          this.raise("unknown action");
        }
        this.raise("action attribute is missing");
      }
      get targetElements() {
        if (this.target) {
          return this.targetElementsById;
        } else if (this.targets) {
          return this.targetElementsByQuery;
        } else {
          this.raise("target or targets attribute is missing");
        }
      }
      get templateContent() {
        return this.templateElement.content.cloneNode(true);
      }
      get templateElement() {
        if (this.firstElementChild instanceof HTMLTemplateElement) {
          return this.firstElementChild;
        }
        this.raise("first child element must be a <template> element");
      }
      get action() {
        return this.getAttribute("action");
      }
      get target() {
        return this.getAttribute("target");
      }
      get targets() {
        return this.getAttribute("targets");
      }
      raise(message) {
        throw new Error(`${this.description}: ${message}`);
      }
      get description() {
        var _a, _b;
        return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
      }
      get beforeRenderEvent() {
        return new CustomEvent("turbo:before-stream-render", {
          bubbles: true,
          cancelable: true
        });
      }
      get targetElementsById() {
        var _a;
        const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
        if (element !== null) {
          return [element];
        } else {
          return [];
        }
      }
      get targetElementsByQuery() {
        var _a;
        const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
        if (elements.length !== 0) {
          return Array.prototype.slice.call(elements);
        } else {
          return [];
        }
      }
    }
    FrameElement.delegateConstructor = FrameController;
    customElements.define("turbo-frame", FrameElement);
    customElements.define("turbo-stream", StreamElement);
    (() => {
      let element = document.currentScript;
      if (!element)
        return;
      if (element.hasAttribute("data-turbo-suppress-warning"))
        return;
      while (element = element.parentElement) {
        if (element == document.body) {
          return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
        }
      }
    })();
    window.Turbo = Turbo;
    start();
    var turbo_es2017Esm = Object.freeze({
      __proto__: null,
      PageRenderer,
      PageSnapshot,
      clearCache,
      connectStreamSource,
      disconnectStreamSource,
      navigator: navigator$1,
      registerAdapter,
      renderStreamMessage,
      session,
      setProgressBarDelay,
      start,
      visit
    });
    var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    function getAugmentedNamespace(n) {
      if (n.__esModule)
        return n;
      var a = Object.defineProperty({}, "__esModule", {
        value: true
      });
      Object.keys(n).forEach(function(k) {
        var d = Object.getOwnPropertyDescriptor(n, k);
        Object.defineProperty(a, k, d.get ? d : {
          enumerable: true,
          get: function() {
            return n[k];
          }
        });
      });
      return a;
    }
    var jquery$1 = {
      exports: {}
    };
    (function(module2) {
      (function(global2, factory) {
        {
          module2.exports = global2.document ? factory(global2, true) : function(w) {
            if (!w.document) {
              throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
          };
        }
      })(typeof window !== "undefined" ? window : commonjsGlobal, function(window2, noGlobal) {
        var arr = [];
        var getProto = Object.getPrototypeOf;
        var slice = arr.slice;
        var flat = function(array) {
          return arr.concat.apply([], array);
        };
        var push = arr.push;
        var indexOf = arr.indexOf;
        var class2type = {};
        var toString = class2type.toString;
        var hasOwn = class2type.hasOwnProperty;
        var fnToString = hasOwn.toString;
        var ObjectFunctionString = fnToString.call(Object);
        var support = {};
        var isFunction2 = function isFunction3(obj) {
          return typeof obj === "function" && typeof obj.nodeType !== "number";
        };
        var isWindow = function isWindow2(obj) {
          return obj != null && obj === obj.window;
        };
        var document2 = window2.document;
        var preservedScriptAttributes = {
          type: true,
          src: true,
          nonce: true,
          noModule: true
        };
        function DOMEval(code, node, doc) {
          doc = doc || document2;
          var i, val, script = doc.createElement("script");
          script.text = code;
          if (node) {
            for (i in preservedScriptAttributes) {
              val = node[i] || node.getAttribute && node.getAttribute(i);
              if (val) {
                script.setAttribute(i, val);
              }
            }
          }
          doc.head.appendChild(script).parentNode.removeChild(script);
        }
        function toType(obj) {
          if (obj == null) {
            return obj + "";
          }
          return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
        }
        var version2 = "3.5.1", jQuery2 = function(selector, context) {
          return new jQuery2.fn.init(selector, context);
        };
        jQuery2.fn = jQuery2.prototype = {
          jquery: version2,
          constructor: jQuery2,
          length: 0,
          toArray: function() {
            return slice.call(this);
          },
          get: function(num) {
            if (num == null) {
              return slice.call(this);
            }
            return num < 0 ? this[num + this.length] : this[num];
          },
          pushStack: function(elems) {
            var ret = jQuery2.merge(this.constructor(), elems);
            ret.prevObject = this;
            return ret;
          },
          each: function(callback) {
            return jQuery2.each(this, callback);
          },
          map: function(callback) {
            return this.pushStack(jQuery2.map(this, function(elem, i) {
              return callback.call(elem, i, elem);
            }));
          },
          slice: function() {
            return this.pushStack(slice.apply(this, arguments));
          },
          first: function() {
            return this.eq(0);
          },
          last: function() {
            return this.eq(-1);
          },
          even: function() {
            return this.pushStack(jQuery2.grep(this, function(_elem, i) {
              return (i + 1) % 2;
            }));
          },
          odd: function() {
            return this.pushStack(jQuery2.grep(this, function(_elem, i) {
              return i % 2;
            }));
          },
          eq: function(i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
          },
          end: function() {
            return this.prevObject || this.constructor();
          },
          push,
          sort: arr.sort,
          splice: arr.splice
        };
        jQuery2.extend = jQuery2.fn.extend = function() {
          var options, name, src, copy, copyIsArray, clone2, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
          if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
          }
          if (typeof target !== "object" && !isFunction2(target)) {
            target = {};
          }
          if (i === length) {
            target = this;
            i--;
          }
          for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
              for (name in options) {
                copy = options[name];
                if (name === "__proto__" || target === copy) {
                  continue;
                }
                if (deep && copy && (jQuery2.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                  src = target[name];
                  if (copyIsArray && !Array.isArray(src)) {
                    clone2 = [];
                  } else if (!copyIsArray && !jQuery2.isPlainObject(src)) {
                    clone2 = {};
                  } else {
                    clone2 = src;
                  }
                  copyIsArray = false;
                  target[name] = jQuery2.extend(deep, clone2, copy);
                } else if (copy !== void 0) {
                  target[name] = copy;
                }
              }
            }
          }
          return target;
        };
        jQuery2.extend({
          expando: "jQuery" + (version2 + Math.random()).replace(/\D/g, ""),
          isReady: true,
          error: function(msg) {
            throw new Error(msg);
          },
          noop: function() {
          },
          isPlainObject: function(obj) {
            var proto, Ctor;
            if (!obj || toString.call(obj) !== "[object Object]") {
              return false;
            }
            proto = getProto(obj);
            if (!proto) {
              return true;
            }
            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
          },
          isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
              return false;
            }
            return true;
          },
          globalEval: function(code, options, doc) {
            DOMEval(code, {
              nonce: options && options.nonce
            }, doc);
          },
          each: function(obj, callback) {
            var length, i = 0;
            if (isArrayLike(obj)) {
              length = obj.length;
              for (; i < length; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            } else {
              for (i in obj) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            }
            return obj;
          },
          makeArray: function(arr2, results) {
            var ret = results || [];
            if (arr2 != null) {
              if (isArrayLike(Object(arr2))) {
                jQuery2.merge(ret, typeof arr2 === "string" ? [arr2] : arr2);
              } else {
                push.call(ret, arr2);
              }
            }
            return ret;
          },
          inArray: function(elem, arr2, i) {
            return arr2 == null ? -1 : indexOf.call(arr2, elem, i);
          },
          merge: function(first, second) {
            var len = +second.length, j = 0, i = first.length;
            for (; j < len; j++) {
              first[i++] = second[j];
            }
            first.length = i;
            return first;
          },
          grep: function(elems, callback, invert) {
            var callbackInverse, matches2 = [], i = 0, length = elems.length, callbackExpect = !invert;
            for (; i < length; i++) {
              callbackInverse = !callback(elems[i], i);
              if (callbackInverse !== callbackExpect) {
                matches2.push(elems[i]);
              }
            }
            return matches2;
          },
          map: function(elems, callback, arg) {
            var length, value, i = 0, ret = [];
            if (isArrayLike(elems)) {
              length = elems.length;
              for (; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            } else {
              for (i in elems) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            }
            return flat(ret);
          },
          guid: 1,
          support
        });
        if (typeof Symbol === "function") {
          jQuery2.fn[Symbol.iterator] = arr[Symbol.iterator];
        }
        jQuery2.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(_i, name) {
          class2type["[object " + name + "]"] = name.toLowerCase();
        });
        function isArrayLike(obj) {
          var length = !!obj && "length" in obj && obj.length, type = toType(obj);
          if (isFunction2(obj) || isWindow(obj)) {
            return false;
          }
          return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
        }
        var Sizzle = function(window3) {
          var i, support2, Expr, getText, isXML, tokenize2, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document3, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches2, contains, expando2 = "sizzle" + 1 * new Date(), preferredDoc = window3.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), nonnativeSelectorCache = createCache(), sortOrder = function(a, b) {
            if (a === b) {
              hasDuplicate = true;
            }
            return 0;
          }, hasOwn2 = {}.hasOwnProperty, arr2 = [], pop = arr2.pop, pushNative = arr2.push, push2 = arr2.push, slice2 = arr2.slice, indexOf2 = function(list, elem) {
            var i2 = 0, len = list.length;
            for (; i2 < len; i2++) {
              if (list[i2] === elem) {
                return i2;
              }
            }
            return -1;
          }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", whitespace = "[\\x20\\t\\r\\n\\f]", identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+", attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]", pseudos = ":(" + identifier + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)", rwhitespace = new RegExp(whitespace + "+", "g"), rtrim2 = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rdescend = new RegExp(whitespace + "|>"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            ID: new RegExp("^#(" + identifier + ")"),
            CLASS: new RegExp("^\\.(" + identifier + ")"),
            TAG: new RegExp("^(" + identifier + "|[*])"),
            ATTR: new RegExp("^" + attributes),
            PSEUDO: new RegExp("^" + pseudos),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            bool: new RegExp("^(?:" + booleans + ")$", "i"),
            needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
          }, rhtml2 = /HTML$/i, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr2 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"), funescape = function(escape, nonHex) {
            var high = "0x" + escape.slice(1) - 65536;
            return nonHex ? nonHex : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
          }, rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, fcssescape = function(ch, asCodePoint) {
            if (asCodePoint) {
              if (ch === "\0") {
                return "\uFFFD";
              }
              return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
            }
            return "\\" + ch;
          }, unloadHandler = function() {
            setDocument();
          }, inDisabledFieldset = addCombinator(function(elem) {
            return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
          }, {
            dir: "parentNode",
            next: "legend"
          });
          try {
            push2.apply(arr2 = slice2.call(preferredDoc.childNodes), preferredDoc.childNodes);
            arr2[preferredDoc.childNodes.length].nodeType;
          } catch (e) {
            push2 = {
              apply: arr2.length ? function(target, els) {
                pushNative.apply(target, slice2.call(els));
              } : function(target, els) {
                var j = target.length, i2 = 0;
                while (target[j++] = els[i2++]) {
                }
                target.length = j - 1;
              }
            };
          }
          function Sizzle2(selector, context, results, seed) {
            var m, i2, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument, nodeType = context ? context.nodeType : 9;
            results = results || [];
            if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
              return results;
            }
            if (!seed) {
              setDocument(context);
              context = context || document3;
              if (documentIsHTML) {
                if (nodeType !== 11 && (match = rquickExpr2.exec(selector))) {
                  if (m = match[1]) {
                    if (nodeType === 9) {
                      if (elem = context.getElementById(m)) {
                        if (elem.id === m) {
                          results.push(elem);
                          return results;
                        }
                      } else {
                        return results;
                      }
                    } else {
                      if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {
                        results.push(elem);
                        return results;
                      }
                    }
                  } else if (match[2]) {
                    push2.apply(results, context.getElementsByTagName(selector));
                    return results;
                  } else if ((m = match[3]) && support2.getElementsByClassName && context.getElementsByClassName) {
                    push2.apply(results, context.getElementsByClassName(m));
                    return results;
                  }
                }
                if (support2.qsa && !nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector)) && (nodeType !== 1 || context.nodeName.toLowerCase() !== "object")) {
                  newSelector = selector;
                  newContext = context;
                  if (nodeType === 1 && (rdescend.test(selector) || rcombinators.test(selector))) {
                    newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                    if (newContext !== context || !support2.scope) {
                      if (nid = context.getAttribute("id")) {
                        nid = nid.replace(rcssescape, fcssescape);
                      } else {
                        context.setAttribute("id", nid = expando2);
                      }
                    }
                    groups = tokenize2(selector);
                    i2 = groups.length;
                    while (i2--) {
                      groups[i2] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i2]);
                    }
                    newSelector = groups.join(",");
                  }
                  try {
                    push2.apply(results, newContext.querySelectorAll(newSelector));
                    return results;
                  } catch (qsaError) {
                    nonnativeSelectorCache(selector, true);
                  } finally {
                    if (nid === expando2) {
                      context.removeAttribute("id");
                    }
                  }
                }
              }
            }
            return select(selector.replace(rtrim2, "$1"), context, results, seed);
          }
          function createCache() {
            var keys = [];
            function cache(key, value) {
              if (keys.push(key + " ") > Expr.cacheLength) {
                delete cache[keys.shift()];
              }
              return cache[key + " "] = value;
            }
            return cache;
          }
          function markFunction(fn) {
            fn[expando2] = true;
            return fn;
          }
          function assert(fn) {
            var el = document3.createElement("fieldset");
            try {
              return !!fn(el);
            } catch (e) {
              return false;
            } finally {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
              el = null;
            }
          }
          function addHandle(attrs, handler) {
            var arr3 = attrs.split("|"), i2 = arr3.length;
            while (i2--) {
              Expr.attrHandle[arr3[i2]] = handler;
            }
          }
          function siblingCheck(a, b) {
            var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && a.sourceIndex - b.sourceIndex;
            if (diff) {
              return diff;
            }
            if (cur) {
              while (cur = cur.nextSibling) {
                if (cur === b) {
                  return -1;
                }
              }
            }
            return a ? 1 : -1;
          }
          function createInputPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return name === "input" && elem.type === type;
            };
          }
          function createButtonPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return (name === "input" || name === "button") && elem.type === type;
            };
          }
          function createDisabledPseudo(disabled) {
            return function(elem) {
              if ("form" in elem) {
                if (elem.parentNode && elem.disabled === false) {
                  if ("label" in elem) {
                    if ("label" in elem.parentNode) {
                      return elem.parentNode.disabled === disabled;
                    } else {
                      return elem.disabled === disabled;
                    }
                  }
                  return elem.isDisabled === disabled || elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled;
                }
                return elem.disabled === disabled;
              } else if ("label" in elem) {
                return elem.disabled === disabled;
              }
              return false;
            };
          }
          function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
              argument = +argument;
              return markFunction(function(seed, matches3) {
                var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
                while (i2--) {
                  if (seed[j = matchIndexes[i2]]) {
                    seed[j] = !(matches3[j] = seed[j]);
                  }
                }
              });
            });
          }
          function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
          }
          support2 = Sizzle2.support = {};
          isXML = Sizzle2.isXML = function(elem) {
            var namespace = elem.namespaceURI, docElem2 = (elem.ownerDocument || elem).documentElement;
            return !rhtml2.test(namespace || docElem2 && docElem2.nodeName || "HTML");
          };
          setDocument = Sizzle2.setDocument = function(node) {
            var hasCompare, subWindow, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc == document3 || doc.nodeType !== 9 || !doc.documentElement) {
              return document3;
            }
            document3 = doc;
            docElem = document3.documentElement;
            documentIsHTML = !isXML(document3);
            if (preferredDoc != document3 && (subWindow = document3.defaultView) && subWindow.top !== subWindow) {
              if (subWindow.addEventListener) {
                subWindow.addEventListener("unload", unloadHandler, false);
              } else if (subWindow.attachEvent) {
                subWindow.attachEvent("onunload", unloadHandler);
              }
            }
            support2.scope = assert(function(el) {
              docElem.appendChild(el).appendChild(document3.createElement("div"));
              return typeof el.querySelectorAll !== "undefined" && !el.querySelectorAll(":scope fieldset div").length;
            });
            support2.attributes = assert(function(el) {
              el.className = "i";
              return !el.getAttribute("className");
            });
            support2.getElementsByTagName = assert(function(el) {
              el.appendChild(document3.createComment(""));
              return !el.getElementsByTagName("*").length;
            });
            support2.getElementsByClassName = rnative.test(document3.getElementsByClassName);
            support2.getById = assert(function(el) {
              docElem.appendChild(el).id = expando2;
              return !document3.getElementsByName || !document3.getElementsByName(expando2).length;
            });
            if (support2.getById) {
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  return elem.getAttribute("id") === attrId;
                };
              };
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var elem = context.getElementById(id);
                  return elem ? [elem] : [];
                }
              };
            } else {
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  var node2 = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                  return node2 && node2.value === attrId;
                };
              };
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var node2, i2, elems, elem = context.getElementById(id);
                  if (elem) {
                    node2 = elem.getAttributeNode("id");
                    if (node2 && node2.value === id) {
                      return [elem];
                    }
                    elems = context.getElementsByName(id);
                    i2 = 0;
                    while (elem = elems[i2++]) {
                      node2 = elem.getAttributeNode("id");
                      if (node2 && node2.value === id) {
                        return [elem];
                      }
                    }
                  }
                  return [];
                }
              };
            }
            Expr.find["TAG"] = support2.getElementsByTagName ? function(tag, context) {
              if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(tag);
              } else if (support2.qsa) {
                return context.querySelectorAll(tag);
              }
            } : function(tag, context) {
              var elem, tmp = [], i2 = 0, results = context.getElementsByTagName(tag);
              if (tag === "*") {
                while (elem = results[i2++]) {
                  if (elem.nodeType === 1) {
                    tmp.push(elem);
                  }
                }
                return tmp;
              }
              return results;
            };
            Expr.find["CLASS"] = support2.getElementsByClassName && function(className, context) {
              if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
                return context.getElementsByClassName(className);
              }
            };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if (support2.qsa = rnative.test(document3.querySelectorAll)) {
              assert(function(el) {
                var input;
                docElem.appendChild(el).innerHTML = "<a id='" + expando2 + "'></a><select id='" + expando2 + "-\r\\' msallowcapture=''><option selected=''></option></select>";
                if (el.querySelectorAll("[msallowcapture^='']").length) {
                  rbuggyQSA.push("[*^$]=" + whitespace + `*(?:''|"")`);
                }
                if (!el.querySelectorAll("[selected]").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                }
                if (!el.querySelectorAll("[id~=" + expando2 + "-]").length) {
                  rbuggyQSA.push("~=");
                }
                input = document3.createElement("input");
                input.setAttribute("name", "");
                el.appendChild(input);
                if (!el.querySelectorAll("[name='']").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + `*(?:''|"")`);
                }
                if (!el.querySelectorAll(":checked").length) {
                  rbuggyQSA.push(":checked");
                }
                if (!el.querySelectorAll("a#" + expando2 + "+*").length) {
                  rbuggyQSA.push(".#.+[+~]");
                }
                el.querySelectorAll("\\\f");
                rbuggyQSA.push("[\\r\\n\\f]");
              });
              assert(function(el) {
                el.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                var input = document3.createElement("input");
                input.setAttribute("type", "hidden");
                el.appendChild(input).setAttribute("name", "D");
                if (el.querySelectorAll("[name=d]").length) {
                  rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                }
                if (el.querySelectorAll(":enabled").length !== 2) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                docElem.appendChild(el).disabled = true;
                if (el.querySelectorAll(":disabled").length !== 2) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                el.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
              });
            }
            if (support2.matchesSelector = rnative.test(matches2 = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
              assert(function(el) {
                support2.disconnectedMatch = matches2.call(el, "*");
                matches2.call(el, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
              });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            hasCompare = rnative.test(docElem.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
              var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
              return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
            } : function(a, b) {
              if (b) {
                while (b = b.parentNode) {
                  if (b === a) {
                    return true;
                  }
                }
              }
              return false;
            };
            sortOrder = hasCompare ? function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
              if (compare) {
                return compare;
              }
              compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
              if (compare & 1 || !support2.sortDetached && b.compareDocumentPosition(a) === compare) {
                if (a == document3 || a.ownerDocument == preferredDoc && contains(preferredDoc, a)) {
                  return -1;
                }
                if (b == document3 || b.ownerDocument == preferredDoc && contains(preferredDoc, b)) {
                  return 1;
                }
                return sortInput ? indexOf2(sortInput, a) - indexOf2(sortInput, b) : 0;
              }
              return compare & 4 ? -1 : 1;
            } : function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var cur, i2 = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
              if (!aup || !bup) {
                return a == document3 ? -1 : b == document3 ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf2(sortInput, a) - indexOf2(sortInput, b) : 0;
              } else if (aup === bup) {
                return siblingCheck(a, b);
              }
              cur = a;
              while (cur = cur.parentNode) {
                ap.unshift(cur);
              }
              cur = b;
              while (cur = cur.parentNode) {
                bp.unshift(cur);
              }
              while (ap[i2] === bp[i2]) {
                i2++;
              }
              return i2 ? siblingCheck(ap[i2], bp[i2]) : ap[i2] == preferredDoc ? -1 : bp[i2] == preferredDoc ? 1 : 0;
            };
            return document3;
          };
          Sizzle2.matches = function(expr, elements) {
            return Sizzle2(expr, null, null, elements);
          };
          Sizzle2.matchesSelector = function(elem, expr) {
            setDocument(elem);
            if (support2.matchesSelector && documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
              try {
                var ret = matches2.call(elem, expr);
                if (ret || support2.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                  return ret;
                }
              } catch (e) {
                nonnativeSelectorCache(expr, true);
              }
            }
            return Sizzle2(expr, document3, null, [elem]).length > 0;
          };
          Sizzle2.contains = function(context, elem) {
            if ((context.ownerDocument || context) != document3) {
              setDocument(context);
            }
            return contains(context, elem);
          };
          Sizzle2.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) != document3) {
              setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn2.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
            return val !== void 0 ? val : support2.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
          };
          Sizzle2.escape = function(sel) {
            return (sel + "").replace(rcssescape, fcssescape);
          };
          Sizzle2.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
          };
          Sizzle2.uniqueSort = function(results) {
            var elem, duplicates = [], j = 0, i2 = 0;
            hasDuplicate = !support2.detectDuplicates;
            sortInput = !support2.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
              while (elem = results[i2++]) {
                if (elem === results[i2]) {
                  j = duplicates.push(i2);
                }
              }
              while (j--) {
                results.splice(duplicates[j], 1);
              }
            }
            sortInput = null;
            return results;
          };
          getText = Sizzle2.getText = function(elem) {
            var node, ret = "", i2 = 0, nodeType = elem.nodeType;
            if (!nodeType) {
              while (node = elem[i2++]) {
                ret += getText(node);
              }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
              if (typeof elem.textContent === "string") {
                return elem.textContent;
              } else {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  ret += getText(elem);
                }
              }
            } else if (nodeType === 3 || nodeType === 4) {
              return elem.nodeValue;
            }
            return ret;
          };
          Expr = Sizzle2.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
              ">": {
                dir: "parentNode",
                first: true
              },
              " ": {
                dir: "parentNode"
              },
              "+": {
                dir: "previousSibling",
                first: true
              },
              "~": {
                dir: "previousSibling"
              }
            },
            preFilter: {
              ATTR: function(match) {
                match[1] = match[1].replace(runescape, funescape);
                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                if (match[2] === "~=") {
                  match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
              },
              CHILD: function(match) {
                match[1] = match[1].toLowerCase();
                if (match[1].slice(0, 3) === "nth") {
                  if (!match[3]) {
                    Sizzle2.error(match[0]);
                  }
                  match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                  match[5] = +(match[7] + match[8] || match[3] === "odd");
                } else if (match[3]) {
                  Sizzle2.error(match[0]);
                }
                return match;
              },
              PSEUDO: function(match) {
                var excess, unquoted = !match[6] && match[2];
                if (matchExpr["CHILD"].test(match[0])) {
                  return null;
                }
                if (match[3]) {
                  match[2] = match[4] || match[5] || "";
                } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize2(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                  match[0] = match[0].slice(0, excess);
                  match[2] = unquoted.slice(0, excess);
                }
                return match.slice(0, 3);
              }
            },
            filter: {
              TAG: function(nodeNameSelector) {
                var nodeName2 = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ? function() {
                  return true;
                } : function(elem) {
                  return elem.nodeName && elem.nodeName.toLowerCase() === nodeName2;
                };
              },
              CLASS: function(className) {
                var pattern = classCache[className + " "];
                return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                  return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                });
              },
              ATTR: function(name, operator, check) {
                return function(elem) {
                  var result = Sizzle2.attr(elem, name);
                  if (result == null) {
                    return operator === "!=";
                  }
                  if (!operator) {
                    return true;
                  }
                  result += "";
                  return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                };
              },
              CHILD: function(type, what, _argument, first, last) {
                var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
                return first === 1 && last === 0 ? function(elem) {
                  return !!elem.parentNode;
                } : function(elem, _context, xml) {
                  var cache, uniqueCache, outerCache, node, nodeIndex, start2, dir2 = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType, diff = false;
                  if (parent) {
                    if (simple) {
                      while (dir2) {
                        node = elem;
                        while (node = node[dir2]) {
                          if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                            return false;
                          }
                        }
                        start2 = dir2 = type === "only" && !start2 && "nextSibling";
                      }
                      return true;
                    }
                    start2 = [forward ? parent.firstChild : parent.lastChild];
                    if (forward && useCache) {
                      node = parent;
                      outerCache = node[expando2] || (node[expando2] = {});
                      uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                      cache = uniqueCache[type] || [];
                      nodeIndex = cache[0] === dirruns && cache[1];
                      diff = nodeIndex && cache[2];
                      node = nodeIndex && parent.childNodes[nodeIndex];
                      while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start2.pop()) {
                        if (node.nodeType === 1 && ++diff && node === elem) {
                          uniqueCache[type] = [dirruns, nodeIndex, diff];
                          break;
                        }
                      }
                    } else {
                      if (useCache) {
                        node = elem;
                        outerCache = node[expando2] || (node[expando2] = {});
                        uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                        cache = uniqueCache[type] || [];
                        nodeIndex = cache[0] === dirruns && cache[1];
                        diff = nodeIndex;
                      }
                      if (diff === false) {
                        while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start2.pop()) {
                          if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                            if (useCache) {
                              outerCache = node[expando2] || (node[expando2] = {});
                              uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                              uniqueCache[type] = [dirruns, diff];
                            }
                            if (node === elem) {
                              break;
                            }
                          }
                        }
                      }
                    }
                    diff -= last;
                    return diff === first || diff % first === 0 && diff / first >= 0;
                  }
                };
              },
              PSEUDO: function(pseudo, argument) {
                var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle2.error("unsupported pseudo: " + pseudo);
                if (fn[expando2]) {
                  return fn(argument);
                }
                if (fn.length > 1) {
                  args = [pseudo, pseudo, "", argument];
                  return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches3) {
                    var idx, matched = fn(seed, argument), i2 = matched.length;
                    while (i2--) {
                      idx = indexOf2(seed, matched[i2]);
                      seed[idx] = !(matches3[idx] = matched[i2]);
                    }
                  }) : function(elem) {
                    return fn(elem, 0, args);
                  };
                }
                return fn;
              }
            },
            pseudos: {
              not: markFunction(function(selector) {
                var input = [], results = [], matcher = compile(selector.replace(rtrim2, "$1"));
                return matcher[expando2] ? markFunction(function(seed, matches3, _context, xml) {
                  var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
                  while (i2--) {
                    if (elem = unmatched[i2]) {
                      seed[i2] = !(matches3[i2] = elem);
                    }
                  }
                }) : function(elem, _context, xml) {
                  input[0] = elem;
                  matcher(input, null, xml, results);
                  input[0] = null;
                  return !results.pop();
                };
              }),
              has: markFunction(function(selector) {
                return function(elem) {
                  return Sizzle2(selector, elem).length > 0;
                };
              }),
              contains: markFunction(function(text) {
                text = text.replace(runescape, funescape);
                return function(elem) {
                  return (elem.textContent || getText(elem)).indexOf(text) > -1;
                };
              }),
              lang: markFunction(function(lang) {
                if (!ridentifier.test(lang || "")) {
                  Sizzle2.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function(elem) {
                  var elemLang;
                  do {
                    if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                      elemLang = elemLang.toLowerCase();
                      return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                    }
                  } while ((elem = elem.parentNode) && elem.nodeType === 1);
                  return false;
                };
              }),
              target: function(elem) {
                var hash = window3.location && window3.location.hash;
                return hash && hash.slice(1) === elem.id;
              },
              root: function(elem) {
                return elem === docElem;
              },
              focus: function(elem) {
                return elem === document3.activeElement && (!document3.hasFocus || document3.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
              },
              enabled: createDisabledPseudo(false),
              disabled: createDisabledPseudo(true),
              checked: function(elem) {
                var nodeName2 = elem.nodeName.toLowerCase();
                return nodeName2 === "input" && !!elem.checked || nodeName2 === "option" && !!elem.selected;
              },
              selected: function(elem) {
                if (elem.parentNode) {
                  elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
              },
              empty: function(elem) {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  if (elem.nodeType < 6) {
                    return false;
                  }
                }
                return true;
              },
              parent: function(elem) {
                return !Expr.pseudos["empty"](elem);
              },
              header: function(elem) {
                return rheader.test(elem.nodeName);
              },
              input: function(elem) {
                return rinputs.test(elem.nodeName);
              },
              button: function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
              },
              text: function(elem) {
                var attr;
                return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
              },
              first: createPositionalPseudo(function() {
                return [0];
              }),
              last: createPositionalPseudo(function(_matchIndexes, length) {
                return [length - 1];
              }),
              eq: createPositionalPseudo(function(_matchIndexes, length, argument) {
                return [argument < 0 ? argument + length : argument];
              }),
              even: createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 0;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              odd: createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 1;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              lt: createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument > length ? length : argument;
                for (; --i2 >= 0; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              gt: createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument;
                for (; ++i2 < length; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              })
            }
          };
          Expr.pseudos["nth"] = Expr.pseudos["eq"];
          for (i in {
            radio: true,
            checkbox: true,
            file: true,
            password: true,
            image: true
          }) {
            Expr.pseudos[i] = createInputPseudo(i);
          }
          for (i in {
            submit: true,
            reset: true
          }) {
            Expr.pseudos[i] = createButtonPseudo(i);
          }
          function setFilters() {
          }
          setFilters.prototype = Expr.filters = Expr.pseudos;
          Expr.setFilters = new setFilters();
          tokenize2 = Sizzle2.tokenize = function(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
              return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
              if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                  soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push(tokens = []);
              }
              matched = false;
              if (match = rcombinators.exec(soFar)) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  type: match[0].replace(rtrim2, " ")
                });
                soFar = soFar.slice(matched.length);
              }
              for (type in Expr.filter) {
                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                  matched = match.shift();
                  tokens.push({
                    value: matched,
                    type,
                    matches: match
                  });
                  soFar = soFar.slice(matched.length);
                }
              }
              if (!matched) {
                break;
              }
            }
            return parseOnly ? soFar.length : soFar ? Sizzle2.error(selector) : tokenCache(selector, groups).slice(0);
          };
          function toSelector(tokens) {
            var i2 = 0, len = tokens.length, selector = "";
            for (; i2 < len; i2++) {
              selector += tokens[i2].value;
            }
            return selector;
          }
          function addCombinator(matcher, combinator, base) {
            var dir2 = combinator.dir, skip = combinator.next, key = skip || dir2, checkNonElements = base && key === "parentNode", doneName = done++;
            return combinator.first ? function(elem, context, xml) {
              while (elem = elem[dir2]) {
                if (elem.nodeType === 1 || checkNonElements) {
                  return matcher(elem, context, xml);
                }
              }
              return false;
            } : function(elem, context, xml) {
              var oldCache, uniqueCache, outerCache, newCache = [dirruns, doneName];
              if (xml) {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    if (matcher(elem, context, xml)) {
                      return true;
                    }
                  }
                }
              } else {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    outerCache = elem[expando2] || (elem[expando2] = {});
                    uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});
                    if (skip && skip === elem.nodeName.toLowerCase()) {
                      elem = elem[dir2] || elem;
                    } else if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                      return newCache[2] = oldCache[2];
                    } else {
                      uniqueCache[key] = newCache;
                      if (newCache[2] = matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            };
          }
          function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
              var i2 = matchers.length;
              while (i2--) {
                if (!matchers[i2](elem, context, xml)) {
                  return false;
                }
              }
              return true;
            } : matchers[0];
          }
          function multipleContexts(selector, contexts, results) {
            var i2 = 0, len = contexts.length;
            for (; i2 < len; i2++) {
              Sizzle2(selector, contexts[i2], results);
            }
            return results;
          }
          function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
            for (; i2 < len; i2++) {
              if (elem = unmatched[i2]) {
                if (!filter || filter(elem, context, xml)) {
                  newUnmatched.push(elem);
                  if (mapped) {
                    map.push(i2);
                  }
                }
              }
            }
            return newUnmatched;
          }
          function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando2]) {
              postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando2]) {
              postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
              var temp, i2, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
              if (matcher) {
                matcher(matcherIn, matcherOut, context, xml);
              }
              if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);
                i2 = temp.length;
                while (i2--) {
                  if (elem = temp[i2]) {
                    matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
                  }
                }
              }
              if (seed) {
                if (postFinder || preFilter) {
                  if (postFinder) {
                    temp = [];
                    i2 = matcherOut.length;
                    while (i2--) {
                      if (elem = matcherOut[i2]) {
                        temp.push(matcherIn[i2] = elem);
                      }
                    }
                    postFinder(null, matcherOut = [], temp, xml);
                  }
                  i2 = matcherOut.length;
                  while (i2--) {
                    if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf2(seed, elem) : preMap[i2]) > -1) {
                      seed[temp] = !(results[temp] = elem);
                    }
                  }
                }
              } else {
                matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                if (postFinder) {
                  postFinder(null, results, matcherOut, xml);
                } else {
                  push2.apply(results, matcherOut);
                }
              }
            });
          }
          function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
              return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
              return indexOf2(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [function(elem, context, xml) {
              var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
              checkContext = null;
              return ret;
            }];
            for (; i2 < len; i2++) {
              if (matcher = Expr.relative[tokens[i2].type]) {
                matchers = [addCombinator(elementMatcher(matchers), matcher)];
              } else {
                matcher = Expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
                if (matcher[expando2]) {
                  j = ++i2;
                  for (; j < len; j++) {
                    if (Expr.relative[tokens[j].type]) {
                      break;
                    }
                  }
                  return setMatcher(i2 > 1 && elementMatcher(matchers), i2 > 1 && toSelector(tokens.slice(0, i2 - 1).concat({
                    value: tokens[i2 - 2].type === " " ? "*" : ""
                  })).replace(rtrim2, "$1"), matcher, i2 < j && matcherFromTokens(tokens.slice(i2, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
                }
                matchers.push(matcher);
              }
            }
            return elementMatcher(matchers);
          }
          function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
              var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find["TAG"]("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
              if (outermost) {
                outermostContext = context == document3 || context || outermost;
              }
              for (; i2 !== len && (elem = elems[i2]) != null; i2++) {
                if (byElement && elem) {
                  j = 0;
                  if (!context && elem.ownerDocument != document3) {
                    setDocument(elem);
                    xml = !documentIsHTML;
                  }
                  while (matcher = elementMatchers[j++]) {
                    if (matcher(elem, context || document3, xml)) {
                      results.push(elem);
                      break;
                    }
                  }
                  if (outermost) {
                    dirruns = dirrunsUnique;
                  }
                }
                if (bySet) {
                  if (elem = !matcher && elem) {
                    matchedCount--;
                  }
                  if (seed) {
                    unmatched.push(elem);
                  }
                }
              }
              matchedCount += i2;
              if (bySet && i2 !== matchedCount) {
                j = 0;
                while (matcher = setMatchers[j++]) {
                  matcher(unmatched, setMatched, context, xml);
                }
                if (seed) {
                  if (matchedCount > 0) {
                    while (i2--) {
                      if (!(unmatched[i2] || setMatched[i2])) {
                        setMatched[i2] = pop.call(results);
                      }
                    }
                  }
                  setMatched = condense(setMatched);
                }
                push2.apply(results, setMatched);
                if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                  Sizzle2.uniqueSort(results);
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
              }
              return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
          }
          compile = Sizzle2.compile = function(selector, match) {
            var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
              if (!match) {
                match = tokenize2(selector);
              }
              i2 = match.length;
              while (i2--) {
                cached = matcherFromTokens(match[i2]);
                if (cached[expando2]) {
                  setMatchers.push(cached);
                } else {
                  elementMatchers.push(cached);
                }
              }
              cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
              cached.selector = selector;
            }
            return cached;
          };
          select = Sizzle2.select = function(selector, context, results, seed) {
            var i2, tokens, token, type, find2, compiled = typeof selector === "function" && selector, match = !seed && tokenize2(selector = compiled.selector || selector);
            results = results || [];
            if (match.length === 1) {
              tokens = match[0] = match[0].slice(0);
              if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                if (!context) {
                  return results;
                } else if (compiled) {
                  context = context.parentNode;
                }
                selector = selector.slice(tokens.shift().value.length);
              }
              i2 = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
              while (i2--) {
                token = tokens[i2];
                if (Expr.relative[type = token.type]) {
                  break;
                }
                if (find2 = Expr.find[type]) {
                  if (seed = find2(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
                    tokens.splice(i2, 1);
                    selector = seed.length && toSelector(tokens);
                    if (!selector) {
                      push2.apply(results, seed);
                      return results;
                    }
                    break;
                  }
                }
              }
            }
            (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
            return results;
          };
          support2.sortStable = expando2.split("").sort(sortOrder).join("") === expando2;
          support2.detectDuplicates = !!hasDuplicate;
          setDocument();
          support2.sortDetached = assert(function(el) {
            return el.compareDocumentPosition(document3.createElement("fieldset")) & 1;
          });
          if (!assert(function(el) {
            el.innerHTML = "<a href='#'></a>";
            return el.firstChild.getAttribute("href") === "#";
          })) {
            addHandle("type|href|height|width", function(elem, name, isXML2) {
              if (!isXML2) {
                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
              }
            });
          }
          if (!support2.attributes || !assert(function(el) {
            el.innerHTML = "<input/>";
            el.firstChild.setAttribute("value", "");
            return el.firstChild.getAttribute("value") === "";
          })) {
            addHandle("value", function(elem, _name, isXML2) {
              if (!isXML2 && elem.nodeName.toLowerCase() === "input") {
                return elem.defaultValue;
              }
            });
          }
          if (!assert(function(el) {
            return el.getAttribute("disabled") == null;
          })) {
            addHandle(booleans, function(elem, name, isXML2) {
              var val;
              if (!isXML2) {
                return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
              }
            });
          }
          return Sizzle2;
        }(window2);
        jQuery2.find = Sizzle;
        jQuery2.expr = Sizzle.selectors;
        jQuery2.expr[":"] = jQuery2.expr.pseudos;
        jQuery2.uniqueSort = jQuery2.unique = Sizzle.uniqueSort;
        jQuery2.text = Sizzle.getText;
        jQuery2.isXMLDoc = Sizzle.isXML;
        jQuery2.contains = Sizzle.contains;
        jQuery2.escapeSelector = Sizzle.escape;
        var dir = function(elem, dir2, until) {
          var matched = [], truncate = until !== void 0;
          while ((elem = elem[dir2]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
              if (truncate && jQuery2(elem).is(until)) {
                break;
              }
              matched.push(elem);
            }
          }
          return matched;
        };
        var siblings = function(n, elem) {
          var matched = [];
          for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
              matched.push(n);
            }
          }
          return matched;
        };
        var rneedsContext = jQuery2.expr.match.needsContext;
        function nodeName(elem, name) {
          return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        }
        var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        function winnow(elements, qualifier, not) {
          if (isFunction2(qualifier)) {
            return jQuery2.grep(elements, function(elem, i) {
              return !!qualifier.call(elem, i, elem) !== not;
            });
          }
          if (qualifier.nodeType) {
            return jQuery2.grep(elements, function(elem) {
              return elem === qualifier !== not;
            });
          }
          if (typeof qualifier !== "string") {
            return jQuery2.grep(elements, function(elem) {
              return indexOf.call(qualifier, elem) > -1 !== not;
            });
          }
          return jQuery2.filter(qualifier, elements, not);
        }
        jQuery2.filter = function(expr, elems, not) {
          var elem = elems[0];
          if (not) {
            expr = ":not(" + expr + ")";
          }
          if (elems.length === 1 && elem.nodeType === 1) {
            return jQuery2.find.matchesSelector(elem, expr) ? [elem] : [];
          }
          return jQuery2.find.matches(expr, jQuery2.grep(elems, function(elem2) {
            return elem2.nodeType === 1;
          }));
        };
        jQuery2.fn.extend({
          find: function(selector) {
            var i, ret, len = this.length, self2 = this;
            if (typeof selector !== "string") {
              return this.pushStack(jQuery2(selector).filter(function() {
                for (i = 0; i < len; i++) {
                  if (jQuery2.contains(self2[i], this)) {
                    return true;
                  }
                }
              }));
            }
            ret = this.pushStack([]);
            for (i = 0; i < len; i++) {
              jQuery2.find(selector, self2[i], ret);
            }
            return len > 1 ? jQuery2.uniqueSort(ret) : ret;
          },
          filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
          },
          not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
          },
          is: function(selector) {
            return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery2(selector) : selector || [], false).length;
          }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/, init = jQuery2.fn.init = function(selector, context, root) {
          var match, elem;
          if (!selector) {
            return this;
          }
          root = root || rootjQuery;
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery2 ? context[0] : context;
                jQuery2.merge(this, jQuery2.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document2, true));
                if (rsingleTag.test(match[1]) && jQuery2.isPlainObject(context)) {
                  for (match in context) {
                    if (isFunction2(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document2.getElementById(match[2]);
                if (elem) {
                  this[0] = elem;
                  this.length = 1;
                }
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || root).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
          } else if (isFunction2(selector)) {
            return root.ready !== void 0 ? root.ready(selector) : selector(jQuery2);
          }
          return jQuery2.makeArray(selector, this);
        };
        init.prototype = jQuery2.fn;
        rootjQuery = jQuery2(document2);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
        jQuery2.fn.extend({
          has: function(target) {
            var targets = jQuery2(target, this), l = targets.length;
            return this.filter(function() {
              var i = 0;
              for (; i < l; i++) {
                if (jQuery2.contains(this, targets[i])) {
                  return true;
                }
              }
            });
          },
          closest: function(selectors, context) {
            var cur, i = 0, l = this.length, matched = [], targets = typeof selectors !== "string" && jQuery2(selectors);
            if (!rneedsContext.test(selectors)) {
              for (; i < l; i++) {
                for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                  if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : cur.nodeType === 1 && jQuery2.find.matchesSelector(cur, selectors))) {
                    matched.push(cur);
                    break;
                  }
                }
              }
            }
            return this.pushStack(matched.length > 1 ? jQuery2.uniqueSort(matched) : matched);
          },
          index: function(elem) {
            if (!elem) {
              return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            if (typeof elem === "string") {
              return indexOf.call(jQuery2(elem), this[0]);
            }
            return indexOf.call(this, elem.jquery ? elem[0] : elem);
          },
          add: function(selector, context) {
            return this.pushStack(jQuery2.uniqueSort(jQuery2.merge(this.get(), jQuery2(selector, context))));
          },
          addBack: function(selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
          }
        });
        function sibling(cur, dir2) {
          while ((cur = cur[dir2]) && cur.nodeType !== 1) {
          }
          return cur;
        }
        jQuery2.each({
          parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
          },
          parents: function(elem) {
            return dir(elem, "parentNode");
          },
          parentsUntil: function(elem, _i, until) {
            return dir(elem, "parentNode", until);
          },
          next: function(elem) {
            return sibling(elem, "nextSibling");
          },
          prev: function(elem) {
            return sibling(elem, "previousSibling");
          },
          nextAll: function(elem) {
            return dir(elem, "nextSibling");
          },
          prevAll: function(elem) {
            return dir(elem, "previousSibling");
          },
          nextUntil: function(elem, _i, until) {
            return dir(elem, "nextSibling", until);
          },
          prevUntil: function(elem, _i, until) {
            return dir(elem, "previousSibling", until);
          },
          siblings: function(elem) {
            return siblings((elem.parentNode || {}).firstChild, elem);
          },
          children: function(elem) {
            return siblings(elem.firstChild);
          },
          contents: function(elem) {
            if (elem.contentDocument != null && getProto(elem.contentDocument)) {
              return elem.contentDocument;
            }
            if (nodeName(elem, "template")) {
              elem = elem.content || elem;
            }
            return jQuery2.merge([], elem.childNodes);
          }
        }, function(name, fn) {
          jQuery2.fn[name] = function(until, selector) {
            var matched = jQuery2.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
              selector = until;
            }
            if (selector && typeof selector === "string") {
              matched = jQuery2.filter(selector, matched);
            }
            if (this.length > 1) {
              if (!guaranteedUnique[name]) {
                jQuery2.uniqueSort(matched);
              }
              if (rparentsprev.test(name)) {
                matched.reverse();
              }
            }
            return this.pushStack(matched);
          };
        });
        var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;
        function createOptions(options) {
          var object = {};
          jQuery2.each(options.match(rnothtmlwhite) || [], function(_, flag) {
            object[flag] = true;
          });
          return object;
        }
        jQuery2.Callbacks = function(options) {
          options = typeof options === "string" ? createOptions(options) : jQuery2.extend({}, options);
          var firing, memory, fired, locked, list = [], queue = [], firingIndex = -1, fire = function() {
            locked = locked || options.once;
            fired = firing = true;
            for (; queue.length; firingIndex = -1) {
              memory = queue.shift();
              while (++firingIndex < list.length) {
                if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                  firingIndex = list.length;
                  memory = false;
                }
              }
            }
            if (!options.memory) {
              memory = false;
            }
            firing = false;
            if (locked) {
              if (memory) {
                list = [];
              } else {
                list = "";
              }
            }
          }, self2 = {
            add: function() {
              if (list) {
                if (memory && !firing) {
                  firingIndex = list.length - 1;
                  queue.push(memory);
                }
                (function add2(args) {
                  jQuery2.each(args, function(_, arg) {
                    if (isFunction2(arg)) {
                      if (!options.unique || !self2.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && toType(arg) !== "string") {
                      add2(arg);
                    }
                  });
                })(arguments);
                if (memory && !firing) {
                  fire();
                }
              }
              return this;
            },
            remove: function() {
              jQuery2.each(arguments, function(_, arg) {
                var index2;
                while ((index2 = jQuery2.inArray(arg, list, index2)) > -1) {
                  list.splice(index2, 1);
                  if (index2 <= firingIndex) {
                    firingIndex--;
                  }
                }
              });
              return this;
            },
            has: function(fn) {
              return fn ? jQuery2.inArray(fn, list) > -1 : list.length > 0;
            },
            empty: function() {
              if (list) {
                list = [];
              }
              return this;
            },
            disable: function() {
              locked = queue = [];
              list = memory = "";
              return this;
            },
            disabled: function() {
              return !list;
            },
            lock: function() {
              locked = queue = [];
              if (!memory && !firing) {
                list = memory = "";
              }
              return this;
            },
            locked: function() {
              return !!locked;
            },
            fireWith: function(context, args) {
              if (!locked) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                queue.push(args);
                if (!firing) {
                  fire();
                }
              }
              return this;
            },
            fire: function() {
              self2.fireWith(this, arguments);
              return this;
            },
            fired: function() {
              return !!fired;
            }
          };
          return self2;
        };
        function Identity(v) {
          return v;
        }
        function Thrower(ex) {
          throw ex;
        }
        function adoptValue(value, resolve, reject, noValue) {
          var method;
          try {
            if (value && isFunction2(method = value.promise)) {
              method.call(value).done(resolve).fail(reject);
            } else if (value && isFunction2(method = value.then)) {
              method.call(value, resolve, reject);
            } else {
              resolve.apply(void 0, [value].slice(noValue));
            }
          } catch (value2) {
            reject.apply(void 0, [value2]);
          }
        }
        jQuery2.extend({
          Deferred: function(func) {
            var tuples = [["notify", "progress", jQuery2.Callbacks("memory"), jQuery2.Callbacks("memory"), 2], ["resolve", "done", jQuery2.Callbacks("once memory"), jQuery2.Callbacks("once memory"), 0, "resolved"], ["reject", "fail", jQuery2.Callbacks("once memory"), jQuery2.Callbacks("once memory"), 1, "rejected"]], state = "pending", promise = {
              state: function() {
                return state;
              },
              always: function() {
                deferred.done(arguments).fail(arguments);
                return this;
              },
              catch: function(fn) {
                return promise.then(null, fn);
              },
              pipe: function() {
                var fns = arguments;
                return jQuery2.Deferred(function(newDefer) {
                  jQuery2.each(tuples, function(_i, tuple) {
                    var fn = isFunction2(fns[tuple[4]]) && fns[tuple[4]];
                    deferred[tuple[1]](function() {
                      var returned = fn && fn.apply(this, arguments);
                      if (returned && isFunction2(returned.promise)) {
                        returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                      } else {
                        newDefer[tuple[0] + "With"](this, fn ? [returned] : arguments);
                      }
                    });
                  });
                  fns = null;
                }).promise();
              },
              then: function(onFulfilled, onRejected, onProgress) {
                var maxDepth = 0;
                function resolve(depth, deferred2, handler, special) {
                  return function() {
                    var that = this, args = arguments, mightThrow = function() {
                      var returned, then;
                      if (depth < maxDepth) {
                        return;
                      }
                      returned = handler.apply(that, args);
                      if (returned === deferred2.promise()) {
                        throw new TypeError("Thenable self-resolution");
                      }
                      then = returned && (typeof returned === "object" || typeof returned === "function") && returned.then;
                      if (isFunction2(then)) {
                        if (special) {
                          then.call(returned, resolve(maxDepth, deferred2, Identity, special), resolve(maxDepth, deferred2, Thrower, special));
                        } else {
                          maxDepth++;
                          then.call(returned, resolve(maxDepth, deferred2, Identity, special), resolve(maxDepth, deferred2, Thrower, special), resolve(maxDepth, deferred2, Identity, deferred2.notifyWith));
                        }
                      } else {
                        if (handler !== Identity) {
                          that = void 0;
                          args = [returned];
                        }
                        (special || deferred2.resolveWith)(that, args);
                      }
                    }, process = special ? mightThrow : function() {
                      try {
                        mightThrow();
                      } catch (e) {
                        if (jQuery2.Deferred.exceptionHook) {
                          jQuery2.Deferred.exceptionHook(e, process.stackTrace);
                        }
                        if (depth + 1 >= maxDepth) {
                          if (handler !== Thrower) {
                            that = void 0;
                            args = [e];
                          }
                          deferred2.rejectWith(that, args);
                        }
                      }
                    };
                    if (depth) {
                      process();
                    } else {
                      if (jQuery2.Deferred.getStackHook) {
                        process.stackTrace = jQuery2.Deferred.getStackHook();
                      }
                      window2.setTimeout(process);
                    }
                  };
                }
                return jQuery2.Deferred(function(newDefer) {
                  tuples[0][3].add(resolve(0, newDefer, isFunction2(onProgress) ? onProgress : Identity, newDefer.notifyWith));
                  tuples[1][3].add(resolve(0, newDefer, isFunction2(onFulfilled) ? onFulfilled : Identity));
                  tuples[2][3].add(resolve(0, newDefer, isFunction2(onRejected) ? onRejected : Thrower));
                }).promise();
              },
              promise: function(obj) {
                return obj != null ? jQuery2.extend(obj, promise) : promise;
              }
            }, deferred = {};
            jQuery2.each(tuples, function(i, tuple) {
              var list = tuple[2], stateString = tuple[5];
              promise[tuple[1]] = list.add;
              if (stateString) {
                list.add(function() {
                  state = stateString;
                }, tuples[3 - i][2].disable, tuples[3 - i][3].disable, tuples[0][2].lock, tuples[0][3].lock);
              }
              list.add(tuple[3].fire);
              deferred[tuple[0]] = function() {
                deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments);
                return this;
              };
              deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
              func.call(deferred, deferred);
            }
            return deferred;
          },
          when: function(singleValue) {
            var remaining = arguments.length, i = remaining, resolveContexts = Array(i), resolveValues = slice.call(arguments), master = jQuery2.Deferred(), updateFunc = function(i2) {
              return function(value) {
                resolveContexts[i2] = this;
                resolveValues[i2] = arguments.length > 1 ? slice.call(arguments) : value;
                if (!--remaining) {
                  master.resolveWith(resolveContexts, resolveValues);
                }
              };
            };
            if (remaining <= 1) {
              adoptValue(singleValue, master.done(updateFunc(i)).resolve, master.reject, !remaining);
              if (master.state() === "pending" || isFunction2(resolveValues[i] && resolveValues[i].then)) {
                return master.then();
              }
            }
            while (i--) {
              adoptValue(resolveValues[i], updateFunc(i), master.reject);
            }
            return master.promise();
          }
        });
        var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        jQuery2.Deferred.exceptionHook = function(error2, stack) {
          if (window2.console && window2.console.warn && error2 && rerrorNames.test(error2.name)) {
            window2.console.warn("jQuery.Deferred exception: " + error2.message, error2.stack, stack);
          }
        };
        jQuery2.readyException = function(error2) {
          window2.setTimeout(function() {
            throw error2;
          });
        };
        var readyList = jQuery2.Deferred();
        jQuery2.fn.ready = function(fn) {
          readyList.then(fn).catch(function(error2) {
            jQuery2.readyException(error2);
          });
          return this;
        };
        jQuery2.extend({
          isReady: false,
          readyWait: 1,
          ready: function(wait) {
            if (wait === true ? --jQuery2.readyWait : jQuery2.isReady) {
              return;
            }
            jQuery2.isReady = true;
            if (wait !== true && --jQuery2.readyWait > 0) {
              return;
            }
            readyList.resolveWith(document2, [jQuery2]);
          }
        });
        jQuery2.ready.then = readyList.then;
        function completed() {
          document2.removeEventListener("DOMContentLoaded", completed);
          window2.removeEventListener("load", completed);
          jQuery2.ready();
        }
        if (document2.readyState === "complete" || document2.readyState !== "loading" && !document2.documentElement.doScroll) {
          window2.setTimeout(jQuery2.ready);
        } else {
          document2.addEventListener("DOMContentLoaded", completed);
          window2.addEventListener("load", completed);
        }
        var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
          var i = 0, len = elems.length, bulk = key == null;
          if (toType(key) === "object") {
            chainable = true;
            for (i in key) {
              access(elems, fn, i, key[i], true, emptyGet, raw);
            }
          } else if (value !== void 0) {
            chainable = true;
            if (!isFunction2(value)) {
              raw = true;
            }
            if (bulk) {
              if (raw) {
                fn.call(elems, value);
                fn = null;
              } else {
                bulk = fn;
                fn = function(elem, _key, value2) {
                  return bulk.call(jQuery2(elem), value2);
                };
              }
            }
            if (fn) {
              for (; i < len; i++) {
                fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
              }
            }
          }
          if (chainable) {
            return elems;
          }
          if (bulk) {
            return fn.call(elems);
          }
          return len ? fn(elems[0], key) : emptyGet;
        };
        var rmsPrefix = /^-ms-/, rdashAlpha = /-([a-z])/g;
        function fcamelCase(_all, letter) {
          return letter.toUpperCase();
        }
        function camelCase(string) {
          return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        }
        var acceptData = function(owner) {
          return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
        };
        function Data() {
          this.expando = jQuery2.expando + Data.uid++;
        }
        Data.uid = 1;
        Data.prototype = {
          cache: function(owner) {
            var value = owner[this.expando];
            if (!value) {
              value = {};
              if (acceptData(owner)) {
                if (owner.nodeType) {
                  owner[this.expando] = value;
                } else {
                  Object.defineProperty(owner, this.expando, {
                    value,
                    configurable: true
                  });
                }
              }
            }
            return value;
          },
          set: function(owner, data, value) {
            var prop, cache = this.cache(owner);
            if (typeof data === "string") {
              cache[camelCase(data)] = value;
            } else {
              for (prop in data) {
                cache[camelCase(prop)] = data[prop];
              }
            }
            return cache;
          },
          get: function(owner, key) {
            return key === void 0 ? this.cache(owner) : owner[this.expando] && owner[this.expando][camelCase(key)];
          },
          access: function(owner, key, value) {
            if (key === void 0 || key && typeof key === "string" && value === void 0) {
              return this.get(owner, key);
            }
            this.set(owner, key, value);
            return value !== void 0 ? value : key;
          },
          remove: function(owner, key) {
            var i, cache = owner[this.expando];
            if (cache === void 0) {
              return;
            }
            if (key !== void 0) {
              if (Array.isArray(key)) {
                key = key.map(camelCase);
              } else {
                key = camelCase(key);
                key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
              }
              i = key.length;
              while (i--) {
                delete cache[key[i]];
              }
            }
            if (key === void 0 || jQuery2.isEmptyObject(cache)) {
              if (owner.nodeType) {
                owner[this.expando] = void 0;
              } else {
                delete owner[this.expando];
              }
            }
          },
          hasData: function(owner) {
            var cache = owner[this.expando];
            return cache !== void 0 && !jQuery2.isEmptyObject(cache);
          }
        };
        var dataPriv = new Data();
        var dataUser = new Data();
        var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /[A-Z]/g;
        function getData(data) {
          if (data === "true") {
            return true;
          }
          if (data === "false") {
            return false;
          }
          if (data === "null") {
            return null;
          }
          if (data === +data + "") {
            return +data;
          }
          if (rbrace.test(data)) {
            return JSON.parse(data);
          }
          return data;
        }
        function dataAttr(elem, key, data) {
          var name;
          if (data === void 0 && elem.nodeType === 1) {
            name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
              try {
                data = getData(data);
              } catch (e) {
              }
              dataUser.set(elem, key, data);
            } else {
              data = void 0;
            }
          }
          return data;
        }
        jQuery2.extend({
          hasData: function(elem) {
            return dataUser.hasData(elem) || dataPriv.hasData(elem);
          },
          data: function(elem, name, data) {
            return dataUser.access(elem, name, data);
          },
          removeData: function(elem, name) {
            dataUser.remove(elem, name);
          },
          _data: function(elem, name, data) {
            return dataPriv.access(elem, name, data);
          },
          _removeData: function(elem, name) {
            dataPriv.remove(elem, name);
          }
        });
        jQuery2.fn.extend({
          data: function(key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            if (key === void 0) {
              if (this.length) {
                data = dataUser.get(elem);
                if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                  i = attrs.length;
                  while (i--) {
                    if (attrs[i]) {
                      name = attrs[i].name;
                      if (name.indexOf("data-") === 0) {
                        name = camelCase(name.slice(5));
                        dataAttr(elem, name, data[name]);
                      }
                    }
                  }
                  dataPriv.set(elem, "hasDataAttrs", true);
                }
              }
              return data;
            }
            if (typeof key === "object") {
              return this.each(function() {
                dataUser.set(this, key);
              });
            }
            return access(this, function(value2) {
              var data2;
              if (elem && value2 === void 0) {
                data2 = dataUser.get(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                data2 = dataAttr(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                return;
              }
              this.each(function() {
                dataUser.set(this, key, value2);
              });
            }, null, value, arguments.length > 1, null, true);
          },
          removeData: function(key) {
            return this.each(function() {
              dataUser.remove(this, key);
            });
          }
        });
        jQuery2.extend({
          queue: function(elem, type, data) {
            var queue;
            if (elem) {
              type = (type || "fx") + "queue";
              queue = dataPriv.get(elem, type);
              if (data) {
                if (!queue || Array.isArray(data)) {
                  queue = dataPriv.access(elem, type, jQuery2.makeArray(data));
                } else {
                  queue.push(data);
                }
              }
              return queue || [];
            }
          },
          dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery2.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery2._queueHooks(elem, type), next = function() {
              jQuery2.dequeue(elem, type);
            };
            if (fn === "inprogress") {
              fn = queue.shift();
              startLength--;
            }
            if (fn) {
              if (type === "fx") {
                queue.unshift("inprogress");
              }
              delete hooks.stop;
              fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
              hooks.empty.fire();
            }
          },
          _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
              empty: jQuery2.Callbacks("once memory").add(function() {
                dataPriv.remove(elem, [type + "queue", key]);
              })
            });
          }
        });
        jQuery2.fn.extend({
          queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
              data = type;
              type = "fx";
              setter--;
            }
            if (arguments.length < setter) {
              return jQuery2.queue(this[0], type);
            }
            return data === void 0 ? this : this.each(function() {
              var queue = jQuery2.queue(this, type, data);
              jQuery2._queueHooks(this, type);
              if (type === "fx" && queue[0] !== "inprogress") {
                jQuery2.dequeue(this, type);
              }
            });
          },
          dequeue: function(type) {
            return this.each(function() {
              jQuery2.dequeue(this, type);
            });
          },
          clearQueue: function(type) {
            return this.queue(type || "fx", []);
          },
          promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery2.Deferred(), elements = this, i = this.length, resolve = function() {
              if (!--count) {
                defer.resolveWith(elements, [elements]);
              }
            };
            if (typeof type !== "string") {
              obj = type;
              type = void 0;
            }
            type = type || "fx";
            while (i--) {
              tmp = dataPriv.get(elements[i], type + "queueHooks");
              if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
              }
            }
            resolve();
            return defer.promise(obj);
          }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
        var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
        var cssExpand = ["Top", "Right", "Bottom", "Left"];
        var documentElement = document2.documentElement;
        var isAttached = function(elem) {
          return jQuery2.contains(elem.ownerDocument, elem);
        }, composed = {
          composed: true
        };
        if (documentElement.getRootNode) {
          isAttached = function(elem) {
            return jQuery2.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument;
          };
        }
        var isHiddenWithinTree = function(elem, el) {
          elem = el || elem;
          return elem.style.display === "none" || elem.style.display === "" && isAttached(elem) && jQuery2.css(elem, "display") === "none";
        };
        function adjustCSS(elem, prop, valueParts, tween) {
          var adjusted, scale, maxIterations = 20, currentValue = tween ? function() {
            return tween.cur();
          } : function() {
            return jQuery2.css(elem, prop, "");
          }, initial = currentValue(), unit = valueParts && valueParts[3] || (jQuery2.cssNumber[prop] ? "" : "px"), initialInUnit = elem.nodeType && (jQuery2.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery2.css(elem, prop));
          if (initialInUnit && initialInUnit[3] !== unit) {
            initial = initial / 2;
            unit = unit || initialInUnit[3];
            initialInUnit = +initial || 1;
            while (maxIterations--) {
              jQuery2.style(elem, prop, initialInUnit + unit);
              if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
                maxIterations = 0;
              }
              initialInUnit = initialInUnit / scale;
            }
            initialInUnit = initialInUnit * 2;
            jQuery2.style(elem, prop, initialInUnit + unit);
            valueParts = valueParts || [];
          }
          if (valueParts) {
            initialInUnit = +initialInUnit || +initial || 0;
            adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
            if (tween) {
              tween.unit = unit;
              tween.start = initialInUnit;
              tween.end = adjusted;
            }
          }
          return adjusted;
        }
        var defaultDisplayMap = {};
        function getDefaultDisplay(elem) {
          var temp, doc = elem.ownerDocument, nodeName2 = elem.nodeName, display = defaultDisplayMap[nodeName2];
          if (display) {
            return display;
          }
          temp = doc.body.appendChild(doc.createElement(nodeName2));
          display = jQuery2.css(temp, "display");
          temp.parentNode.removeChild(temp);
          if (display === "none") {
            display = "block";
          }
          defaultDisplayMap[nodeName2] = display;
          return display;
        }
        function showHide(elements, show) {
          var display, elem, values = [], index2 = 0, length = elements.length;
          for (; index2 < length; index2++) {
            elem = elements[index2];
            if (!elem.style) {
              continue;
            }
            display = elem.style.display;
            if (show) {
              if (display === "none") {
                values[index2] = dataPriv.get(elem, "display") || null;
                if (!values[index2]) {
                  elem.style.display = "";
                }
              }
              if (elem.style.display === "" && isHiddenWithinTree(elem)) {
                values[index2] = getDefaultDisplay(elem);
              }
            } else {
              if (display !== "none") {
                values[index2] = "none";
                dataPriv.set(elem, "display", display);
              }
            }
          }
          for (index2 = 0; index2 < length; index2++) {
            if (values[index2] != null) {
              elements[index2].style.display = values[index2];
            }
          }
          return elements;
        }
        jQuery2.fn.extend({
          show: function() {
            return showHide(this, true);
          },
          hide: function() {
            return showHide(this);
          },
          toggle: function(state) {
            if (typeof state === "boolean") {
              return state ? this.show() : this.hide();
            }
            return this.each(function() {
              if (isHiddenWithinTree(this)) {
                jQuery2(this).show();
              } else {
                jQuery2(this).hide();
              }
            });
          }
        });
        var rcheckableType = /^(?:checkbox|radio)$/i;
        var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
        var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
        (function() {
          var fragment = document2.createDocumentFragment(), div = fragment.appendChild(document2.createElement("div")), input = document2.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "t");
          div.appendChild(input);
          support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
          div.innerHTML = "<textarea>x</textarea>";
          support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
          div.innerHTML = "<option></option>";
          support.option = !!div.lastChild;
        })();
        var wrapMap = {
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        if (!support.option) {
          wrapMap.optgroup = wrapMap.option = [1, "<select multiple='multiple'>", "</select>"];
        }
        function getAll(context, tag) {
          var ret;
          if (typeof context.getElementsByTagName !== "undefined") {
            ret = context.getElementsByTagName(tag || "*");
          } else if (typeof context.querySelectorAll !== "undefined") {
            ret = context.querySelectorAll(tag || "*");
          } else {
            ret = [];
          }
          if (tag === void 0 || tag && nodeName(context, tag)) {
            return jQuery2.merge([context], ret);
          }
          return ret;
        }
        function setGlobalEval(elems, refElements) {
          var i = 0, l = elems.length;
          for (; i < l; i++) {
            dataPriv.set(elems[i], "globalEval", !refElements || dataPriv.get(refElements[i], "globalEval"));
          }
        }
        var rhtml = /<|&#?\w+;/;
        function buildFragment(elems, context, scripts, selection, ignored) {
          var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
          for (; i < l; i++) {
            elem = elems[i];
            if (elem || elem === 0) {
              if (toType(elem) === "object") {
                jQuery2.merge(nodes, elem.nodeType ? [elem] : elem);
              } else if (!rhtml.test(elem)) {
                nodes.push(context.createTextNode(elem));
              } else {
                tmp = tmp || fragment.appendChild(context.createElement("div"));
                tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                tmp.innerHTML = wrap[1] + jQuery2.htmlPrefilter(elem) + wrap[2];
                j = wrap[0];
                while (j--) {
                  tmp = tmp.lastChild;
                }
                jQuery2.merge(nodes, tmp.childNodes);
                tmp = fragment.firstChild;
                tmp.textContent = "";
              }
            }
          }
          fragment.textContent = "";
          i = 0;
          while (elem = nodes[i++]) {
            if (selection && jQuery2.inArray(elem, selection) > -1) {
              if (ignored) {
                ignored.push(elem);
              }
              continue;
            }
            attached = isAttached(elem);
            tmp = getAll(fragment.appendChild(elem), "script");
            if (attached) {
              setGlobalEval(tmp);
            }
            if (scripts) {
              j = 0;
              while (elem = tmp[j++]) {
                if (rscriptType.test(elem.type || "")) {
                  scripts.push(elem);
                }
              }
            }
          }
          return fragment;
        }
        var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
        function returnTrue() {
          return true;
        }
        function returnFalse() {
          return false;
        }
        function expectSync(elem, type) {
          return elem === safeActiveElement() === (type === "focus");
        }
        function safeActiveElement() {
          try {
            return document2.activeElement;
          } catch (err) {
          }
        }
        function on2(elem, types, selector, data, fn, one) {
          var origFn, type;
          if (typeof types === "object") {
            if (typeof selector !== "string") {
              data = data || selector;
              selector = void 0;
            }
            for (type in types) {
              on2(elem, type, selector, data, types[type], one);
            }
            return elem;
          }
          if (data == null && fn == null) {
            fn = selector;
            data = selector = void 0;
          } else if (fn == null) {
            if (typeof selector === "string") {
              fn = data;
              data = void 0;
            } else {
              fn = data;
              data = selector;
              selector = void 0;
            }
          }
          if (fn === false) {
            fn = returnFalse;
          } else if (!fn) {
            return elem;
          }
          if (one === 1) {
            origFn = fn;
            fn = function(event) {
              jQuery2().off(event);
              return origFn.apply(this, arguments);
            };
            fn.guid = origFn.guid || (origFn.guid = jQuery2.guid++);
          }
          return elem.each(function() {
            jQuery2.event.add(this, types, fn, data, selector);
          });
        }
        jQuery2.event = {
          global: {},
          add: function(elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.get(elem);
            if (!acceptData(elem)) {
              return;
            }
            if (handler.handler) {
              handleObjIn = handler;
              handler = handleObjIn.handler;
              selector = handleObjIn.selector;
            }
            if (selector) {
              jQuery2.find.matchesSelector(documentElement, selector);
            }
            if (!handler.guid) {
              handler.guid = jQuery2.guid++;
            }
            if (!(events = elemData.events)) {
              events = elemData.events = /* @__PURE__ */ Object.create(null);
            }
            if (!(eventHandle = elemData.handle)) {
              eventHandle = elemData.handle = function(e) {
                return typeof jQuery2 !== "undefined" && jQuery2.event.triggered !== e.type ? jQuery2.event.dispatch.apply(elem, arguments) : void 0;
              };
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                continue;
              }
              special = jQuery2.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              special = jQuery2.event.special[type] || {};
              handleObj = jQuery2.extend({
                type,
                origType,
                data,
                handler,
                guid: handler.guid,
                selector,
                needsContext: selector && jQuery2.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".")
              }, handleObjIn);
              if (!(handlers = events[type])) {
                handlers = events[type] = [];
                handlers.delegateCount = 0;
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                  if (elem.addEventListener) {
                    elem.addEventListener(type, eventHandle);
                  }
                }
              }
              if (special.add) {
                special.add.call(elem, handleObj);
                if (!handleObj.handler.guid) {
                  handleObj.handler.guid = handler.guid;
                }
              }
              if (selector) {
                handlers.splice(handlers.delegateCount++, 0, handleObj);
              } else {
                handlers.push(handleObj);
              }
              jQuery2.event.global[type] = true;
            }
          },
          remove: function(elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
            if (!elemData || !(events = elemData.events)) {
              return;
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                for (type in events) {
                  jQuery2.event.remove(elem, type + types[t], handler, selector, true);
                }
                continue;
              }
              special = jQuery2.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              handlers = events[type] || [];
              tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
              origCount = j = handlers.length;
              while (j--) {
                handleObj = handlers[j];
                if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                  handlers.splice(j, 1);
                  if (handleObj.selector) {
                    handlers.delegateCount--;
                  }
                  if (special.remove) {
                    special.remove.call(elem, handleObj);
                  }
                }
              }
              if (origCount && !handlers.length) {
                if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                  jQuery2.removeEvent(elem, type, elemData.handle);
                }
                delete events[type];
              }
            }
            if (jQuery2.isEmptyObject(events)) {
              dataPriv.remove(elem, "handle events");
            }
          },
          dispatch: function(nativeEvent) {
            var i, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length), event = jQuery2.event.fix(nativeEvent), handlers = (dataPriv.get(this, "events") || /* @__PURE__ */ Object.create(null))[event.type] || [], special = jQuery2.event.special[event.type] || {};
            args[0] = event;
            for (i = 1; i < arguments.length; i++) {
              args[i] = arguments[i];
            }
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
              return;
            }
            handlerQueue = jQuery2.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
              event.currentTarget = matched.elem;
              j = 0;
              while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                if (!event.rnamespace || handleObj.namespace === false || event.rnamespace.test(handleObj.namespace)) {
                  event.handleObj = handleObj;
                  event.data = handleObj.data;
                  ret = ((jQuery2.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                  if (ret !== void 0) {
                    if ((event.result = ret) === false) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }
              }
            }
            if (special.postDispatch) {
              special.postDispatch.call(this, event);
            }
            return event.result;
          },
          handlers: function(event, handlers) {
            var i, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && cur.nodeType && !(event.type === "click" && event.button >= 1)) {
              for (; cur !== this; cur = cur.parentNode || this) {
                if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
                  matchedHandlers = [];
                  matchedSelectors = {};
                  for (i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector + " ";
                    if (matchedSelectors[sel] === void 0) {
                      matchedSelectors[sel] = handleObj.needsContext ? jQuery2(sel, this).index(cur) > -1 : jQuery2.find(sel, this, null, [cur]).length;
                    }
                    if (matchedSelectors[sel]) {
                      matchedHandlers.push(handleObj);
                    }
                  }
                  if (matchedHandlers.length) {
                    handlerQueue.push({
                      elem: cur,
                      handlers: matchedHandlers
                    });
                  }
                }
              }
            }
            cur = this;
            if (delegateCount < handlers.length) {
              handlerQueue.push({
                elem: cur,
                handlers: handlers.slice(delegateCount)
              });
            }
            return handlerQueue;
          },
          addProp: function(name, hook) {
            Object.defineProperty(jQuery2.Event.prototype, name, {
              enumerable: true,
              configurable: true,
              get: isFunction2(hook) ? function() {
                if (this.originalEvent) {
                  return hook(this.originalEvent);
                }
              } : function() {
                if (this.originalEvent) {
                  return this.originalEvent[name];
                }
              },
              set: function(value) {
                Object.defineProperty(this, name, {
                  enumerable: true,
                  configurable: true,
                  writable: true,
                  value
                });
              }
            });
          },
          fix: function(originalEvent) {
            return originalEvent[jQuery2.expando] ? originalEvent : new jQuery2.Event(originalEvent);
          },
          special: {
            load: {
              noBubble: true
            },
            click: {
              setup: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click", returnTrue);
                }
                return false;
              },
              trigger: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click");
                }
                return true;
              },
              _default: function(event) {
                var target = event.target;
                return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a");
              }
            },
            beforeunload: {
              postDispatch: function(event) {
                if (event.result !== void 0 && event.originalEvent) {
                  event.originalEvent.returnValue = event.result;
                }
              }
            }
          }
        };
        function leverageNative(el, type, expectSync2) {
          if (!expectSync2) {
            if (dataPriv.get(el, type) === void 0) {
              jQuery2.event.add(el, type, returnTrue);
            }
            return;
          }
          dataPriv.set(el, type, false);
          jQuery2.event.add(el, type, {
            namespace: false,
            handler: function(event) {
              var notAsync, result, saved = dataPriv.get(this, type);
              if (event.isTrigger & 1 && this[type]) {
                if (!saved.length) {
                  saved = slice.call(arguments);
                  dataPriv.set(this, type, saved);
                  notAsync = expectSync2(this, type);
                  this[type]();
                  result = dataPriv.get(this, type);
                  if (saved !== result || notAsync) {
                    dataPriv.set(this, type, false);
                  } else {
                    result = {};
                  }
                  if (saved !== result) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return result.value;
                  }
                } else if ((jQuery2.event.special[type] || {}).delegateType) {
                  event.stopPropagation();
                }
              } else if (saved.length) {
                dataPriv.set(this, type, {
                  value: jQuery2.event.trigger(jQuery2.extend(saved[0], jQuery2.Event.prototype), saved.slice(1), this)
                });
                event.stopImmediatePropagation();
              }
            }
          });
        }
        jQuery2.removeEvent = function(elem, type, handle) {
          if (elem.removeEventListener) {
            elem.removeEventListener(type, handle);
          }
        };
        jQuery2.Event = function(src, props) {
          if (!(this instanceof jQuery2.Event)) {
            return new jQuery2.Event(src, props);
          }
          if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === void 0 && src.returnValue === false ? returnTrue : returnFalse;
            this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;
            this.currentTarget = src.currentTarget;
            this.relatedTarget = src.relatedTarget;
          } else {
            this.type = src;
          }
          if (props) {
            jQuery2.extend(this, props);
          }
          this.timeStamp = src && src.timeStamp || Date.now();
          this[jQuery2.expando] = true;
        };
        jQuery2.Event.prototype = {
          constructor: jQuery2.Event,
          isDefaultPrevented: returnFalse,
          isPropagationStopped: returnFalse,
          isImmediatePropagationStopped: returnFalse,
          isSimulated: false,
          preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && !this.isSimulated) {
              e.preventDefault();
            }
          },
          stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopPropagation();
            }
          },
          stopImmediatePropagation: function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopImmediatePropagation();
            }
            this.stopPropagation();
          }
        };
        jQuery2.each({
          altKey: true,
          bubbles: true,
          cancelable: true,
          changedTouches: true,
          ctrlKey: true,
          detail: true,
          eventPhase: true,
          metaKey: true,
          pageX: true,
          pageY: true,
          shiftKey: true,
          view: true,
          char: true,
          code: true,
          charCode: true,
          key: true,
          keyCode: true,
          button: true,
          buttons: true,
          clientX: true,
          clientY: true,
          offsetX: true,
          offsetY: true,
          pointerId: true,
          pointerType: true,
          screenX: true,
          screenY: true,
          targetTouches: true,
          toElement: true,
          touches: true,
          which: function(event) {
            var button = event.button;
            if (event.which == null && rkeyEvent.test(event.type)) {
              return event.charCode != null ? event.charCode : event.keyCode;
            }
            if (!event.which && button !== void 0 && rmouseEvent.test(event.type)) {
              if (button & 1) {
                return 1;
              }
              if (button & 2) {
                return 3;
              }
              if (button & 4) {
                return 2;
              }
              return 0;
            }
            return event.which;
          }
        }, jQuery2.event.addProp);
        jQuery2.each({
          focus: "focusin",
          blur: "focusout"
        }, function(type, delegateType) {
          jQuery2.event.special[type] = {
            setup: function() {
              leverageNative(this, type, expectSync);
              return false;
            },
            trigger: function() {
              leverageNative(this, type);
              return true;
            },
            delegateType
          };
        });
        jQuery2.each({
          mouseenter: "mouseover",
          mouseleave: "mouseout",
          pointerenter: "pointerover",
          pointerleave: "pointerout"
        }, function(orig, fix) {
          jQuery2.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
              var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
              if (!related || related !== target && !jQuery2.contains(target, related)) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
              }
              return ret;
            }
          };
        });
        jQuery2.fn.extend({
          on: function(types, selector, data, fn) {
            return on2(this, types, selector, data, fn);
          },
          one: function(types, selector, data, fn) {
            return on2(this, types, selector, data, fn, 1);
          },
          off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
              handleObj = types.handleObj;
              jQuery2(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
              return this;
            }
            if (typeof types === "object") {
              for (type in types) {
                this.off(type, selector, types[type]);
              }
              return this;
            }
            if (selector === false || typeof selector === "function") {
              fn = selector;
              selector = void 0;
            }
            if (fn === false) {
              fn = returnFalse;
            }
            return this.each(function() {
              jQuery2.event.remove(this, types, fn, selector);
            });
          }
        });
        var rnoInnerhtml = /<script|<style|<link/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
        function manipulationTarget(elem, content) {
          if (nodeName(elem, "table") && nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {
            return jQuery2(elem).children("tbody")[0] || elem;
          }
          return elem;
        }
        function disableScript(elem) {
          elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
          return elem;
        }
        function restoreScript(elem) {
          if ((elem.type || "").slice(0, 5) === "true/") {
            elem.type = elem.type.slice(5);
          } else {
            elem.removeAttribute("type");
          }
          return elem;
        }
        function cloneCopyEvent(src, dest) {
          var i, l, type, pdataOld, udataOld, udataCur, events;
          if (dest.nodeType !== 1) {
            return;
          }
          if (dataPriv.hasData(src)) {
            pdataOld = dataPriv.get(src);
            events = pdataOld.events;
            if (events) {
              dataPriv.remove(dest, "handle events");
              for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                  jQuery2.event.add(dest, type, events[type][i]);
                }
              }
            }
          }
          if (dataUser.hasData(src)) {
            udataOld = dataUser.access(src);
            udataCur = jQuery2.extend({}, udataOld);
            dataUser.set(dest, udataCur);
          }
        }
        function fixInput(src, dest) {
          var nodeName2 = dest.nodeName.toLowerCase();
          if (nodeName2 === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
          } else if (nodeName2 === "input" || nodeName2 === "textarea") {
            dest.defaultValue = src.defaultValue;
          }
        }
        function domManip(collection, args, callback, ignored) {
          args = flat(args);
          var fragment, first, scripts, hasScripts, node, doc, i = 0, l = collection.length, iNoClone = l - 1, value = args[0], valueIsFunction = isFunction2(value);
          if (valueIsFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
            return collection.each(function(index2) {
              var self2 = collection.eq(index2);
              if (valueIsFunction) {
                args[0] = value.call(this, index2, self2.html());
              }
              domManip(self2, args, callback, ignored);
            });
          }
          if (l) {
            fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
            first = fragment.firstChild;
            if (fragment.childNodes.length === 1) {
              fragment = first;
            }
            if (first || ignored) {
              scripts = jQuery2.map(getAll(fragment, "script"), disableScript);
              hasScripts = scripts.length;
              for (; i < l; i++) {
                node = fragment;
                if (i !== iNoClone) {
                  node = jQuery2.clone(node, true, true);
                  if (hasScripts) {
                    jQuery2.merge(scripts, getAll(node, "script"));
                  }
                }
                callback.call(collection[i], node, i);
              }
              if (hasScripts) {
                doc = scripts[scripts.length - 1].ownerDocument;
                jQuery2.map(scripts, restoreScript);
                for (i = 0; i < hasScripts; i++) {
                  node = scripts[i];
                  if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery2.contains(doc, node)) {
                    if (node.src && (node.type || "").toLowerCase() !== "module") {
                      if (jQuery2._evalUrl && !node.noModule) {
                        jQuery2._evalUrl(node.src, {
                          nonce: node.nonce || node.getAttribute("nonce")
                        }, doc);
                      }
                    } else {
                      DOMEval(node.textContent.replace(rcleanScript, ""), node, doc);
                    }
                  }
                }
              }
            }
          }
          return collection;
        }
        function remove(elem, selector, keepData) {
          var node, nodes = selector ? jQuery2.filter(selector, elem) : elem, i = 0;
          for (; (node = nodes[i]) != null; i++) {
            if (!keepData && node.nodeType === 1) {
              jQuery2.cleanData(getAll(node));
            }
            if (node.parentNode) {
              if (keepData && isAttached(node)) {
                setGlobalEval(getAll(node, "script"));
              }
              node.parentNode.removeChild(node);
            }
          }
          return elem;
        }
        jQuery2.extend({
          htmlPrefilter: function(html) {
            return html;
          },
          clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone2 = elem.cloneNode(true), inPage = isAttached(elem);
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery2.isXMLDoc(elem)) {
              destElements = getAll(clone2);
              srcElements = getAll(elem);
              for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
              }
            }
            if (dataAndEvents) {
              if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone2);
                for (i = 0, l = srcElements.length; i < l; i++) {
                  cloneCopyEvent(srcElements[i], destElements[i]);
                }
              } else {
                cloneCopyEvent(elem, clone2);
              }
            }
            destElements = getAll(clone2, "script");
            if (destElements.length > 0) {
              setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            return clone2;
          },
          cleanData: function(elems) {
            var data, elem, type, special = jQuery2.event.special, i = 0;
            for (; (elem = elems[i]) !== void 0; i++) {
              if (acceptData(elem)) {
                if (data = elem[dataPriv.expando]) {
                  if (data.events) {
                    for (type in data.events) {
                      if (special[type]) {
                        jQuery2.event.remove(elem, type);
                      } else {
                        jQuery2.removeEvent(elem, type, data.handle);
                      }
                    }
                  }
                  elem[dataPriv.expando] = void 0;
                }
                if (elem[dataUser.expando]) {
                  elem[dataUser.expando] = void 0;
                }
              }
            }
          }
        });
        jQuery2.fn.extend({
          detach: function(selector) {
            return remove(this, selector, true);
          },
          remove: function(selector) {
            return remove(this, selector);
          },
          text: function(value) {
            return access(this, function(value2) {
              return value2 === void 0 ? jQuery2.text(this) : this.empty().each(function() {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                  this.textContent = value2;
                }
              });
            }, null, value, arguments.length);
          },
          append: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.appendChild(elem);
              }
            });
          },
          prepend: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.insertBefore(elem, target.firstChild);
              }
            });
          },
          before: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
              }
            });
          },
          after: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
              }
            });
          },
          empty: function() {
            var elem, i = 0;
            for (; (elem = this[i]) != null; i++) {
              if (elem.nodeType === 1) {
                jQuery2.cleanData(getAll(elem, false));
                elem.textContent = "";
              }
            }
            return this;
          },
          clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
              return jQuery2.clone(this, dataAndEvents, deepDataAndEvents);
            });
          },
          html: function(value) {
            return access(this, function(value2) {
              var elem = this[0] || {}, i = 0, l = this.length;
              if (value2 === void 0 && elem.nodeType === 1) {
                return elem.innerHTML;
              }
              if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
                value2 = jQuery2.htmlPrefilter(value2);
                try {
                  for (; i < l; i++) {
                    elem = this[i] || {};
                    if (elem.nodeType === 1) {
                      jQuery2.cleanData(getAll(elem, false));
                      elem.innerHTML = value2;
                    }
                  }
                  elem = 0;
                } catch (e) {
                }
              }
              if (elem) {
                this.empty().append(value2);
              }
            }, null, value, arguments.length);
          },
          replaceWith: function() {
            var ignored = [];
            return domManip(this, arguments, function(elem) {
              var parent = this.parentNode;
              if (jQuery2.inArray(this, ignored) < 0) {
                jQuery2.cleanData(getAll(this));
                if (parent) {
                  parent.replaceChild(elem, this);
                }
              }
            }, ignored);
          }
        });
        jQuery2.each({
          appendTo: "append",
          prependTo: "prepend",
          insertBefore: "before",
          insertAfter: "after",
          replaceAll: "replaceWith"
        }, function(name, original) {
          jQuery2.fn[name] = function(selector) {
            var elems, ret = [], insert = jQuery2(selector), last = insert.length - 1, i = 0;
            for (; i <= last; i++) {
              elems = i === last ? this : this.clone(true);
              jQuery2(insert[i])[original](elems);
              push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
          };
        });
        var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
        var getStyles = function(elem) {
          var view = elem.ownerDocument.defaultView;
          if (!view || !view.opener) {
            view = window2;
          }
          return view.getComputedStyle(elem);
        };
        var swap = function(elem, options, callback) {
          var ret, name, old = {};
          for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
          }
          ret = callback.call(elem);
          for (name in options) {
            elem.style[name] = old[name];
          }
          return ret;
        };
        var rboxStyle = new RegExp(cssExpand.join("|"), "i");
        (function() {
          function computeStyleTests() {
            if (!div) {
              return;
            }
            container.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0";
            div.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%";
            documentElement.appendChild(container).appendChild(div);
            var divStyle = window2.getComputedStyle(div);
            pixelPositionVal = divStyle.top !== "1%";
            reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;
            div.style.right = "60%";
            pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;
            boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;
            div.style.position = "absolute";
            scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12;
            documentElement.removeChild(container);
            div = null;
          }
          function roundPixelMeasures(measure) {
            return Math.round(parseFloat(measure));
          }
          var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal, reliableTrDimensionsVal, reliableMarginLeftVal, container = document2.createElement("div"), div = document2.createElement("div");
          if (!div.style) {
            return;
          }
          div.style.backgroundClip = "content-box";
          div.cloneNode(true).style.backgroundClip = "";
          support.clearCloneStyle = div.style.backgroundClip === "content-box";
          jQuery2.extend(support, {
            boxSizingReliable: function() {
              computeStyleTests();
              return boxSizingReliableVal;
            },
            pixelBoxStyles: function() {
              computeStyleTests();
              return pixelBoxStylesVal;
            },
            pixelPosition: function() {
              computeStyleTests();
              return pixelPositionVal;
            },
            reliableMarginLeft: function() {
              computeStyleTests();
              return reliableMarginLeftVal;
            },
            scrollboxSize: function() {
              computeStyleTests();
              return scrollboxSizeVal;
            },
            reliableTrDimensions: function() {
              var table, tr, trChild, trStyle;
              if (reliableTrDimensionsVal == null) {
                table = document2.createElement("table");
                tr = document2.createElement("tr");
                trChild = document2.createElement("div");
                table.style.cssText = "position:absolute;left:-11111px";
                tr.style.height = "1px";
                trChild.style.height = "9px";
                documentElement.appendChild(table).appendChild(tr).appendChild(trChild);
                trStyle = window2.getComputedStyle(tr);
                reliableTrDimensionsVal = parseInt(trStyle.height) > 3;
                documentElement.removeChild(table);
              }
              return reliableTrDimensionsVal;
            }
          });
        })();
        function curCSS(elem, name, computed) {
          var width, minWidth, maxWidth, ret, style = elem.style;
          computed = computed || getStyles(elem);
          if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
            if (ret === "" && !isAttached(elem)) {
              ret = jQuery2.style(elem, name);
            }
            if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name)) {
              width = style.width;
              minWidth = style.minWidth;
              maxWidth = style.maxWidth;
              style.minWidth = style.maxWidth = style.width = ret;
              ret = computed.width;
              style.width = width;
              style.minWidth = minWidth;
              style.maxWidth = maxWidth;
            }
          }
          return ret !== void 0 ? ret + "" : ret;
        }
        function addGetHookIf(conditionFn, hookFn) {
          return {
            get: function() {
              if (conditionFn()) {
                delete this.get;
                return;
              }
              return (this.get = hookFn).apply(this, arguments);
            }
          };
        }
        var cssPrefixes = ["Webkit", "Moz", "ms"], emptyStyle = document2.createElement("div").style, vendorProps = {};
        function vendorPropName(name) {
          var capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length;
          while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in emptyStyle) {
              return name;
            }
          }
        }
        function finalPropName(name) {
          var final = jQuery2.cssProps[name] || vendorProps[name];
          if (final) {
            return final;
          }
          if (name in emptyStyle) {
            return name;
          }
          return vendorProps[name] = vendorPropName(name) || name;
        }
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/, rcustomProp = /^--/, cssShow = {
          position: "absolute",
          visibility: "hidden",
          display: "block"
        }, cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        };
        function setPositiveNumber(_elem, value, subtract) {
          var matches2 = rcssNum.exec(value);
          return matches2 ? Math.max(0, matches2[2] - (subtract || 0)) + (matches2[3] || "px") : value;
        }
        function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
          var i = dimension === "width" ? 1 : 0, extra = 0, delta = 0;
          if (box === (isBorderBox ? "border" : "content")) {
            return 0;
          }
          for (; i < 4; i += 2) {
            if (box === "margin") {
              delta += jQuery2.css(elem, box + cssExpand[i], true, styles);
            }
            if (!isBorderBox) {
              delta += jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
              if (box !== "padding") {
                delta += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              } else {
                extra += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            } else {
              if (box === "content") {
                delta -= jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
              }
              if (box !== "margin") {
                delta -= jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            }
          }
          if (!isBorderBox && computedVal >= 0) {
            delta += Math.max(0, Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5)) || 0;
          }
          return delta;
        }
        function getWidthOrHeight(elem, dimension, extra) {
          var styles = getStyles(elem), boxSizingNeeded = !support.boxSizingReliable() || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", valueIsBorderBox = isBorderBox, val = curCSS(elem, dimension, styles), offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
          if (rnumnonpx.test(val)) {
            if (!extra) {
              return val;
            }
            val = "auto";
          }
          if ((!support.boxSizingReliable() && isBorderBox || !support.reliableTrDimensions() && nodeName(elem, "tr") || val === "auto" || !parseFloat(val) && jQuery2.css(elem, "display", false, styles) === "inline") && elem.getClientRects().length) {
            isBorderBox = jQuery2.css(elem, "boxSizing", false, styles) === "border-box";
            valueIsBorderBox = offsetProp in elem;
            if (valueIsBorderBox) {
              val = elem[offsetProp];
            }
          }
          val = parseFloat(val) || 0;
          return val + boxModelAdjustment(elem, dimension, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles, val) + "px";
        }
        jQuery2.extend({
          cssHooks: {
            opacity: {
              get: function(elem, computed) {
                if (computed) {
                  var ret = curCSS(elem, "opacity");
                  return ret === "" ? "1" : ret;
                }
              }
            }
          },
          cssNumber: {
            animationIterationCount: true,
            columnCount: true,
            fillOpacity: true,
            flexGrow: true,
            flexShrink: true,
            fontWeight: true,
            gridArea: true,
            gridColumn: true,
            gridColumnEnd: true,
            gridColumnStart: true,
            gridRow: true,
            gridRowEnd: true,
            gridRowStart: true,
            lineHeight: true,
            opacity: true,
            order: true,
            orphans: true,
            widows: true,
            zIndex: true,
            zoom: true
          },
          cssProps: {},
          style: function(elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
              return;
            }
            var ret, type, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name), style = elem.style;
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
            if (value !== void 0) {
              type = typeof value;
              if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
                value = adjustCSS(elem, name, ret);
                type = "number";
              }
              if (value == null || value !== value) {
                return;
              }
              if (type === "number" && !isCustomProp) {
                value += ret && ret[3] || (jQuery2.cssNumber[origName] ? "" : "px");
              }
              if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
              }
              if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
                if (isCustomProp) {
                  style.setProperty(name, value);
                } else {
                  style[name] = value;
                }
              }
            } else {
              if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
                return ret;
              }
              return style[name];
            }
          },
          css: function(elem, name, extra, styles) {
            var val, num, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name);
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
            if (hooks && "get" in hooks) {
              val = hooks.get(elem, true, extra);
            }
            if (val === void 0) {
              val = curCSS(elem, name, styles);
            }
            if (val === "normal" && name in cssNormalTransform) {
              val = cssNormalTransform[name];
            }
            if (extra === "" || extra) {
              num = parseFloat(val);
              return extra === true || isFinite(num) ? num || 0 : val;
            }
            return val;
          }
        });
        jQuery2.each(["height", "width"], function(_i, dimension) {
          jQuery2.cssHooks[dimension] = {
            get: function(elem, computed, extra) {
              if (computed) {
                return rdisplayswap.test(jQuery2.css(elem, "display")) && (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function() {
                  return getWidthOrHeight(elem, dimension, extra);
                }) : getWidthOrHeight(elem, dimension, extra);
              }
            },
            set: function(elem, value, extra) {
              var matches2, styles = getStyles(elem), scrollboxSizeBuggy = !support.scrollboxSize() && styles.position === "absolute", boxSizingNeeded = scrollboxSizeBuggy || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", subtract = extra ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles) : 0;
              if (isBorderBox && scrollboxSizeBuggy) {
                subtract -= Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - parseFloat(styles[dimension]) - boxModelAdjustment(elem, dimension, "border", false, styles) - 0.5);
              }
              if (subtract && (matches2 = rcssNum.exec(value)) && (matches2[3] || "px") !== "px") {
                elem.style[dimension] = value;
                value = jQuery2.css(elem, dimension);
              }
              return setPositiveNumber(elem, value, subtract);
            }
          };
        });
        jQuery2.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function(elem, computed) {
          if (computed) {
            return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, {
              marginLeft: 0
            }, function() {
              return elem.getBoundingClientRect().left;
            })) + "px";
          }
        });
        jQuery2.each({
          margin: "",
          padding: "",
          border: "Width"
        }, function(prefix, suffix) {
          jQuery2.cssHooks[prefix + suffix] = {
            expand: function(value) {
              var i = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
              for (; i < 4; i++) {
                expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
              }
              return expanded;
            }
          };
          if (prefix !== "margin") {
            jQuery2.cssHooks[prefix + suffix].set = setPositiveNumber;
          }
        });
        jQuery2.fn.extend({
          css: function(name, value) {
            return access(this, function(elem, name2, value2) {
              var styles, len, map = {}, i = 0;
              if (Array.isArray(name2)) {
                styles = getStyles(elem);
                len = name2.length;
                for (; i < len; i++) {
                  map[name2[i]] = jQuery2.css(elem, name2[i], false, styles);
                }
                return map;
              }
              return value2 !== void 0 ? jQuery2.style(elem, name2, value2) : jQuery2.css(elem, name2);
            }, name, value, arguments.length > 1);
          }
        });
        function Tween(elem, options, prop, end, easing) {
          return new Tween.prototype.init(elem, options, prop, end, easing);
        }
        jQuery2.Tween = Tween;
        Tween.prototype = {
          constructor: Tween,
          init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || jQuery2.easing._default;
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery2.cssNumber[prop] ? "" : "px");
          },
          cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
          },
          run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
              this.pos = eased = jQuery2.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
            } else {
              this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
              this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
              hooks.set(this);
            } else {
              Tween.propHooks._default.set(this);
            }
            return this;
          }
        };
        Tween.prototype.init.prototype = Tween.prototype;
        Tween.propHooks = {
          _default: {
            get: function(tween) {
              var result;
              if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
                return tween.elem[tween.prop];
              }
              result = jQuery2.css(tween.elem, tween.prop, "");
              return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
              if (jQuery2.fx.step[tween.prop]) {
                jQuery2.fx.step[tween.prop](tween);
              } else if (tween.elem.nodeType === 1 && (jQuery2.cssHooks[tween.prop] || tween.elem.style[finalPropName(tween.prop)] != null)) {
                jQuery2.style(tween.elem, tween.prop, tween.now + tween.unit);
              } else {
                tween.elem[tween.prop] = tween.now;
              }
            }
          }
        };
        Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
          set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
              tween.elem[tween.prop] = tween.now;
            }
          }
        };
        jQuery2.easing = {
          linear: function(p) {
            return p;
          },
          swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
          },
          _default: "swing"
        };
        jQuery2.fx = Tween.prototype.init;
        jQuery2.fx.step = {};
        var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/, rrun = /queueHooks$/;
        function schedule() {
          if (inProgress) {
            if (document2.hidden === false && window2.requestAnimationFrame) {
              window2.requestAnimationFrame(schedule);
            } else {
              window2.setTimeout(schedule, jQuery2.fx.interval);
            }
            jQuery2.fx.tick();
          }
        }
        function createFxNow() {
          window2.setTimeout(function() {
            fxNow = void 0;
          });
          return fxNow = Date.now();
        }
        function genFx(type, includeWidth) {
          var which, i = 0, attrs = {
            height: type
          };
          includeWidth = includeWidth ? 1 : 0;
          for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
          }
          if (includeWidth) {
            attrs.opacity = attrs.width = type;
          }
          return attrs;
        }
        function createTween(value, prop, animation) {
          var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index2 = 0, length = collection.length;
          for (; index2 < length; index2++) {
            if (tween = collection[index2].call(animation, prop, value)) {
              return tween;
            }
          }
        }
        function defaultPrefilter(elem, props, opts) {
          var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHiddenWithinTree(elem), dataShow = dataPriv.get(elem, "fxshow");
          if (!opts.queue) {
            hooks = jQuery2._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
              hooks.unqueued = 0;
              oldfire = hooks.empty.fire;
              hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                  oldfire();
                }
              };
            }
            hooks.unqueued++;
            anim.always(function() {
              anim.always(function() {
                hooks.unqueued--;
                if (!jQuery2.queue(elem, "fx").length) {
                  hooks.empty.fire();
                }
              });
            });
          }
          for (prop in props) {
            value = props[prop];
            if (rfxtypes.test(value)) {
              delete props[prop];
              toggle = toggle || value === "toggle";
              if (value === (hidden ? "hide" : "show")) {
                if (value === "show" && dataShow && dataShow[prop] !== void 0) {
                  hidden = true;
                } else {
                  continue;
                }
              }
              orig[prop] = dataShow && dataShow[prop] || jQuery2.style(elem, prop);
            }
          }
          propTween = !jQuery2.isEmptyObject(props);
          if (!propTween && jQuery2.isEmptyObject(orig)) {
            return;
          }
          if (isBox && elem.nodeType === 1) {
            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
            restoreDisplay = dataShow && dataShow.display;
            if (restoreDisplay == null) {
              restoreDisplay = dataPriv.get(elem, "display");
            }
            display = jQuery2.css(elem, "display");
            if (display === "none") {
              if (restoreDisplay) {
                display = restoreDisplay;
              } else {
                showHide([elem], true);
                restoreDisplay = elem.style.display || restoreDisplay;
                display = jQuery2.css(elem, "display");
                showHide([elem]);
              }
            }
            if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
              if (jQuery2.css(elem, "float") === "none") {
                if (!propTween) {
                  anim.done(function() {
                    style.display = restoreDisplay;
                  });
                  if (restoreDisplay == null) {
                    display = style.display;
                    restoreDisplay = display === "none" ? "" : display;
                  }
                }
                style.display = "inline-block";
              }
            }
          }
          if (opts.overflow) {
            style.overflow = "hidden";
            anim.always(function() {
              style.overflow = opts.overflow[0];
              style.overflowX = opts.overflow[1];
              style.overflowY = opts.overflow[2];
            });
          }
          propTween = false;
          for (prop in orig) {
            if (!propTween) {
              if (dataShow) {
                if ("hidden" in dataShow) {
                  hidden = dataShow.hidden;
                }
              } else {
                dataShow = dataPriv.access(elem, "fxshow", {
                  display: restoreDisplay
                });
              }
              if (toggle) {
                dataShow.hidden = !hidden;
              }
              if (hidden) {
                showHide([elem], true);
              }
              anim.done(function() {
                if (!hidden) {
                  showHide([elem]);
                }
                dataPriv.remove(elem, "fxshow");
                for (prop in orig) {
                  jQuery2.style(elem, prop, orig[prop]);
                }
              });
            }
            propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
            if (!(prop in dataShow)) {
              dataShow[prop] = propTween.start;
              if (hidden) {
                propTween.end = propTween.start;
                propTween.start = 0;
              }
            }
          }
        }
        function propFilter(props, specialEasing) {
          var index2, name, easing, value, hooks;
          for (index2 in props) {
            name = camelCase(index2);
            easing = specialEasing[name];
            value = props[index2];
            if (Array.isArray(value)) {
              easing = value[1];
              value = props[index2] = value[0];
            }
            if (index2 !== name) {
              props[name] = value;
              delete props[index2];
            }
            hooks = jQuery2.cssHooks[name];
            if (hooks && "expand" in hooks) {
              value = hooks.expand(value);
              delete props[name];
              for (index2 in value) {
                if (!(index2 in props)) {
                  props[index2] = value[index2];
                  specialEasing[index2] = easing;
                }
              }
            } else {
              specialEasing[name] = easing;
            }
          }
        }
        function Animation(elem, properties, options) {
          var result, stopped, index2 = 0, length = Animation.prefilters.length, deferred = jQuery2.Deferred().always(function() {
            delete tick.elem;
          }), tick = function() {
            if (stopped) {
              return false;
            }
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index3 = 0, length2 = animation.tweens.length;
            for (; index3 < length2; index3++) {
              animation.tweens[index3].run(percent);
            }
            deferred.notifyWith(elem, [animation, percent, remaining]);
            if (percent < 1 && length2) {
              return remaining;
            }
            if (!length2) {
              deferred.notifyWith(elem, [animation, 1, 0]);
            }
            deferred.resolveWith(elem, [animation]);
            return false;
          }, animation = deferred.promise({
            elem,
            props: jQuery2.extend({}, properties),
            opts: jQuery2.extend(true, {
              specialEasing: {},
              easing: jQuery2.easing._default
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
              var tween = jQuery2.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
              animation.tweens.push(tween);
              return tween;
            },
            stop: function(gotoEnd) {
              var index3 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
              if (stopped) {
                return this;
              }
              stopped = true;
              for (; index3 < length2; index3++) {
                animation.tweens[index3].run(1);
              }
              if (gotoEnd) {
                deferred.notifyWith(elem, [animation, 1, 0]);
                deferred.resolveWith(elem, [animation, gotoEnd]);
              } else {
                deferred.rejectWith(elem, [animation, gotoEnd]);
              }
              return this;
            }
          }), props = animation.props;
          propFilter(props, animation.opts.specialEasing);
          for (; index2 < length; index2++) {
            result = Animation.prefilters[index2].call(animation, elem, props, animation.opts);
            if (result) {
              if (isFunction2(result.stop)) {
                jQuery2._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result);
              }
              return result;
            }
          }
          jQuery2.map(props, createTween, animation);
          if (isFunction2(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
          }
          animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
          jQuery2.fx.timer(jQuery2.extend(tick, {
            elem,
            anim: animation,
            queue: animation.opts.queue
          }));
          return animation;
        }
        jQuery2.Animation = jQuery2.extend(Animation, {
          tweeners: {
            "*": [function(prop, value) {
              var tween = this.createTween(prop, value);
              adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
              return tween;
            }]
          },
          tweener: function(props, callback) {
            if (isFunction2(props)) {
              callback = props;
              props = ["*"];
            } else {
              props = props.match(rnothtmlwhite);
            }
            var prop, index2 = 0, length = props.length;
            for (; index2 < length; index2++) {
              prop = props[index2];
              Animation.tweeners[prop] = Animation.tweeners[prop] || [];
              Animation.tweeners[prop].unshift(callback);
            }
          },
          prefilters: [defaultPrefilter],
          prefilter: function(callback, prepend) {
            if (prepend) {
              Animation.prefilters.unshift(callback);
            } else {
              Animation.prefilters.push(callback);
            }
          }
        });
        jQuery2.speed = function(speed, easing, fn) {
          var opt = speed && typeof speed === "object" ? jQuery2.extend({}, speed) : {
            complete: fn || !fn && easing || isFunction2(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !isFunction2(easing) && easing
          };
          if (jQuery2.fx.off) {
            opt.duration = 0;
          } else {
            if (typeof opt.duration !== "number") {
              if (opt.duration in jQuery2.fx.speeds) {
                opt.duration = jQuery2.fx.speeds[opt.duration];
              } else {
                opt.duration = jQuery2.fx.speeds._default;
              }
            }
          }
          if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
          }
          opt.old = opt.complete;
          opt.complete = function() {
            if (isFunction2(opt.old)) {
              opt.old.call(this);
            }
            if (opt.queue) {
              jQuery2.dequeue(this, opt.queue);
            }
          };
          return opt;
        };
        jQuery2.fn.extend({
          fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({
              opacity: to
            }, speed, easing, callback);
          },
          animate: function(prop, speed, easing, callback) {
            var empty = jQuery2.isEmptyObject(prop), optall = jQuery2.speed(speed, easing, callback), doAnimation = function() {
              var anim = Animation(this, jQuery2.extend({}, prop), optall);
              if (empty || dataPriv.get(this, "finish")) {
                anim.stop(true);
              }
            };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
          },
          stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
              var stop = hooks.stop;
              delete hooks.stop;
              stop(gotoEnd);
            };
            if (typeof type !== "string") {
              gotoEnd = clearQueue;
              clearQueue = type;
              type = void 0;
            }
            if (clearQueue) {
              this.queue(type || "fx", []);
            }
            return this.each(function() {
              var dequeue = true, index2 = type != null && type + "queueHooks", timers = jQuery2.timers, data = dataPriv.get(this);
              if (index2) {
                if (data[index2] && data[index2].stop) {
                  stopQueue(data[index2]);
                }
              } else {
                for (index2 in data) {
                  if (data[index2] && data[index2].stop && rrun.test(index2)) {
                    stopQueue(data[index2]);
                  }
                }
              }
              for (index2 = timers.length; index2--; ) {
                if (timers[index2].elem === this && (type == null || timers[index2].queue === type)) {
                  timers[index2].anim.stop(gotoEnd);
                  dequeue = false;
                  timers.splice(index2, 1);
                }
              }
              if (dequeue || !gotoEnd) {
                jQuery2.dequeue(this, type);
              }
            });
          },
          finish: function(type) {
            if (type !== false) {
              type = type || "fx";
            }
            return this.each(function() {
              var index2, data = dataPriv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery2.timers, length = queue ? queue.length : 0;
              data.finish = true;
              jQuery2.queue(this, type, []);
              if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
              }
              for (index2 = timers.length; index2--; ) {
                if (timers[index2].elem === this && timers[index2].queue === type) {
                  timers[index2].anim.stop(true);
                  timers.splice(index2, 1);
                }
              }
              for (index2 = 0; index2 < length; index2++) {
                if (queue[index2] && queue[index2].finish) {
                  queue[index2].finish.call(this);
                }
              }
              delete data.finish;
            });
          }
        });
        jQuery2.each(["toggle", "show", "hide"], function(_i, name) {
          var cssFn = jQuery2.fn[name];
          jQuery2.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
          };
        });
        jQuery2.each({
          slideDown: genFx("show"),
          slideUp: genFx("hide"),
          slideToggle: genFx("toggle"),
          fadeIn: {
            opacity: "show"
          },
          fadeOut: {
            opacity: "hide"
          },
          fadeToggle: {
            opacity: "toggle"
          }
        }, function(name, props) {
          jQuery2.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
          };
        });
        jQuery2.timers = [];
        jQuery2.fx.tick = function() {
          var timer, i = 0, timers = jQuery2.timers;
          fxNow = Date.now();
          for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
              timers.splice(i--, 1);
            }
          }
          if (!timers.length) {
            jQuery2.fx.stop();
          }
          fxNow = void 0;
        };
        jQuery2.fx.timer = function(timer) {
          jQuery2.timers.push(timer);
          jQuery2.fx.start();
        };
        jQuery2.fx.interval = 13;
        jQuery2.fx.start = function() {
          if (inProgress) {
            return;
          }
          inProgress = true;
          schedule();
        };
        jQuery2.fx.stop = function() {
          inProgress = null;
        };
        jQuery2.fx.speeds = {
          slow: 600,
          fast: 200,
          _default: 400
        };
        jQuery2.fn.delay = function(time, type) {
          time = jQuery2.fx ? jQuery2.fx.speeds[time] || time : time;
          type = type || "fx";
          return this.queue(type, function(next, hooks) {
            var timeout = window2.setTimeout(next, time);
            hooks.stop = function() {
              window2.clearTimeout(timeout);
            };
          });
        };
        (function() {
          var input = document2.createElement("input"), select = document2.createElement("select"), opt = select.appendChild(document2.createElement("option"));
          input.type = "checkbox";
          support.checkOn = input.value !== "";
          support.optSelected = opt.selected;
          input = document2.createElement("input");
          input.value = "t";
          input.type = "radio";
          support.radioValue = input.value === "t";
        })();
        var boolHook, attrHandle = jQuery2.expr.attrHandle;
        jQuery2.fn.extend({
          attr: function(name, value) {
            return access(this, jQuery2.attr, name, value, arguments.length > 1);
          },
          removeAttr: function(name) {
            return this.each(function() {
              jQuery2.removeAttr(this, name);
            });
          }
        });
        jQuery2.extend({
          attr: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (typeof elem.getAttribute === "undefined") {
              return jQuery2.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
              hooks = jQuery2.attrHooks[name.toLowerCase()] || (jQuery2.expr.match.bool.test(name) ? boolHook : void 0);
            }
            if (value !== void 0) {
              if (value === null) {
                jQuery2.removeAttr(elem, name);
                return;
              }
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              elem.setAttribute(name, value + "");
              return value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            ret = jQuery2.find.attr(elem, name);
            return ret == null ? void 0 : ret;
          },
          attrHooks: {
            type: {
              set: function(elem, value) {
                if (!support.radioValue && value === "radio" && nodeName(elem, "input")) {
                  var val = elem.value;
                  elem.setAttribute("type", value);
                  if (val) {
                    elem.value = val;
                  }
                  return value;
                }
              }
            }
          },
          removeAttr: function(elem, value) {
            var name, i = 0, attrNames = value && value.match(rnothtmlwhite);
            if (attrNames && elem.nodeType === 1) {
              while (name = attrNames[i++]) {
                elem.removeAttribute(name);
              }
            }
          }
        });
        boolHook = {
          set: function(elem, value, name) {
            if (value === false) {
              jQuery2.removeAttr(elem, name);
            } else {
              elem.setAttribute(name, name);
            }
            return name;
          }
        };
        jQuery2.each(jQuery2.expr.match.bool.source.match(/\w+/g), function(_i, name) {
          var getter = attrHandle[name] || jQuery2.find.attr;
          attrHandle[name] = function(elem, name2, isXML) {
            var ret, handle, lowercaseName = name2.toLowerCase();
            if (!isXML) {
              handle = attrHandle[lowercaseName];
              attrHandle[lowercaseName] = ret;
              ret = getter(elem, name2, isXML) != null ? lowercaseName : null;
              attrHandle[lowercaseName] = handle;
            }
            return ret;
          };
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i, rclickable = /^(?:a|area)$/i;
        jQuery2.fn.extend({
          prop: function(name, value) {
            return access(this, jQuery2.prop, name, value, arguments.length > 1);
          },
          removeProp: function(name) {
            return this.each(function() {
              delete this[jQuery2.propFix[name] || name];
            });
          }
        });
        jQuery2.extend({
          prop: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
              name = jQuery2.propFix[name] || name;
              hooks = jQuery2.propHooks[name];
            }
            if (value !== void 0) {
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              return elem[name] = value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            return elem[name];
          },
          propHooks: {
            tabIndex: {
              get: function(elem) {
                var tabindex = jQuery2.find.attr(elem, "tabindex");
                if (tabindex) {
                  return parseInt(tabindex, 10);
                }
                if (rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href) {
                  return 0;
                }
                return -1;
              }
            }
          },
          propFix: {
            for: "htmlFor",
            class: "className"
          }
        });
        if (!support.optSelected) {
          jQuery2.propHooks.selected = {
            get: function(elem) {
              var parent = elem.parentNode;
              if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
              }
              return null;
            },
            set: function(elem) {
              var parent = elem.parentNode;
              if (parent) {
                parent.selectedIndex;
                if (parent.parentNode) {
                  parent.parentNode.selectedIndex;
                }
              }
            }
          };
        }
        jQuery2.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
          jQuery2.propFix[this.toLowerCase()] = this;
        });
        function stripAndCollapse(value) {
          var tokens = value.match(rnothtmlwhite) || [];
          return tokens.join(" ");
        }
        function getClass(elem) {
          return elem.getAttribute && elem.getAttribute("class") || "";
        }
        function classesToArray(value) {
          if (Array.isArray(value)) {
            return value;
          }
          if (typeof value === "string") {
            return value.match(rnothtmlwhite) || [];
          }
          return [];
        }
        jQuery2.fn.extend({
          addClass: function(value) {
            var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
            if (isFunction2(value)) {
              return this.each(function(j2) {
                jQuery2(this).addClass(value.call(this, j2, getClass(this)));
              });
            }
            classes = classesToArray(value);
            if (classes.length) {
              while (elem = this[i++]) {
                curValue = getClass(elem);
                cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    if (cur.indexOf(" " + clazz + " ") < 0) {
                      cur += clazz + " ";
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    elem.setAttribute("class", finalValue);
                  }
                }
              }
            }
            return this;
          },
          removeClass: function(value) {
            var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
            if (isFunction2(value)) {
              return this.each(function(j2) {
                jQuery2(this).removeClass(value.call(this, j2, getClass(this)));
              });
            }
            if (!arguments.length) {
              return this.attr("class", "");
            }
            classes = classesToArray(value);
            if (classes.length) {
              while (elem = this[i++]) {
                curValue = getClass(elem);
                cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    while (cur.indexOf(" " + clazz + " ") > -1) {
                      cur = cur.replace(" " + clazz + " ", " ");
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    elem.setAttribute("class", finalValue);
                  }
                }
              }
            }
            return this;
          },
          toggleClass: function(value, stateVal) {
            var type = typeof value, isValidValue = type === "string" || Array.isArray(value);
            if (typeof stateVal === "boolean" && isValidValue) {
              return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (isFunction2(value)) {
              return this.each(function(i) {
                jQuery2(this).toggleClass(value.call(this, i, getClass(this), stateVal), stateVal);
              });
            }
            return this.each(function() {
              var className, i, self2, classNames;
              if (isValidValue) {
                i = 0;
                self2 = jQuery2(this);
                classNames = classesToArray(value);
                while (className = classNames[i++]) {
                  if (self2.hasClass(className)) {
                    self2.removeClass(className);
                  } else {
                    self2.addClass(className);
                  }
                }
              } else if (value === void 0 || type === "boolean") {
                className = getClass(this);
                if (className) {
                  dataPriv.set(this, "__className__", className);
                }
                if (this.setAttribute) {
                  this.setAttribute("class", className || value === false ? "" : dataPriv.get(this, "__className__") || "");
                }
              }
            });
          },
          hasClass: function(selector) {
            var className, elem, i = 0;
            className = " " + selector + " ";
            while (elem = this[i++]) {
              if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
                return true;
              }
            }
            return false;
          }
        });
        var rreturn = /\r/g;
        jQuery2.fn.extend({
          val: function(value) {
            var hooks, ret, valueIsFunction, elem = this[0];
            if (!arguments.length) {
              if (elem) {
                hooks = jQuery2.valHooks[elem.type] || jQuery2.valHooks[elem.nodeName.toLowerCase()];
                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
                  return ret;
                }
                ret = elem.value;
                if (typeof ret === "string") {
                  return ret.replace(rreturn, "");
                }
                return ret == null ? "" : ret;
              }
              return;
            }
            valueIsFunction = isFunction2(value);
            return this.each(function(i) {
              var val;
              if (this.nodeType !== 1) {
                return;
              }
              if (valueIsFunction) {
                val = value.call(this, i, jQuery2(this).val());
              } else {
                val = value;
              }
              if (val == null) {
                val = "";
              } else if (typeof val === "number") {
                val += "";
              } else if (Array.isArray(val)) {
                val = jQuery2.map(val, function(value2) {
                  return value2 == null ? "" : value2 + "";
                });
              }
              hooks = jQuery2.valHooks[this.type] || jQuery2.valHooks[this.nodeName.toLowerCase()];
              if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
                this.value = val;
              }
            });
          }
        });
        jQuery2.extend({
          valHooks: {
            option: {
              get: function(elem) {
                var val = jQuery2.find.attr(elem, "value");
                return val != null ? val : stripAndCollapse(jQuery2.text(elem));
              }
            },
            select: {
              get: function(elem) {
                var value, option, i, options = elem.options, index2 = elem.selectedIndex, one = elem.type === "select-one", values = one ? null : [], max = one ? index2 + 1 : options.length;
                if (index2 < 0) {
                  i = max;
                } else {
                  i = one ? index2 : 0;
                }
                for (; i < max; i++) {
                  option = options[i];
                  if ((option.selected || i === index2) && !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                    value = jQuery2(option).val();
                    if (one) {
                      return value;
                    }
                    values.push(value);
                  }
                }
                return values;
              },
              set: function(elem, value) {
                var optionSet, option, options = elem.options, values = jQuery2.makeArray(value), i = options.length;
                while (i--) {
                  option = options[i];
                  if (option.selected = jQuery2.inArray(jQuery2.valHooks.option.get(option), values) > -1) {
                    optionSet = true;
                  }
                }
                if (!optionSet) {
                  elem.selectedIndex = -1;
                }
                return values;
              }
            }
          }
        });
        jQuery2.each(["radio", "checkbox"], function() {
          jQuery2.valHooks[this] = {
            set: function(elem, value) {
              if (Array.isArray(value)) {
                return elem.checked = jQuery2.inArray(jQuery2(elem).val(), value) > -1;
              }
            }
          };
          if (!support.checkOn) {
            jQuery2.valHooks[this].get = function(elem) {
              return elem.getAttribute("value") === null ? "on" : elem.value;
            };
          }
        });
        support.focusin = "onfocusin" in window2;
        var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, stopPropagationCallback = function(e) {
          e.stopPropagation();
        };
        jQuery2.extend(jQuery2.event, {
          trigger: function(event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document2], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = lastElement = tmp = elem = elem || document2;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
              return;
            }
            if (rfocusMorph.test(type + jQuery2.event.triggered)) {
              return;
            }
            if (type.indexOf(".") > -1) {
              namespaces = type.split(".");
              type = namespaces.shift();
              namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            event = event[jQuery2.expando] ? event : new jQuery2.Event(type, typeof event === "object" && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = void 0;
            if (!event.target) {
              event.target = elem;
            }
            data = data == null ? [event] : jQuery2.makeArray(data, [event]);
            special = jQuery2.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
              return;
            }
            if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
              bubbleType = special.delegateType || type;
              if (!rfocusMorph.test(bubbleType + type)) {
                cur = cur.parentNode;
              }
              for (; cur; cur = cur.parentNode) {
                eventPath.push(cur);
                tmp = cur;
              }
              if (tmp === (elem.ownerDocument || document2)) {
                eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
              }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
              lastElement = cur;
              event.type = i > 1 ? bubbleType : special.bindType || type;
              handle = (dataPriv.get(cur, "events") || /* @__PURE__ */ Object.create(null))[event.type] && dataPriv.get(cur, "handle");
              if (handle) {
                handle.apply(cur, data);
              }
              handle = ontype && cur[ontype];
              if (handle && handle.apply && acceptData(cur)) {
                event.result = handle.apply(cur, data);
                if (event.result === false) {
                  event.preventDefault();
                }
              }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
              if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {
                if (ontype && isFunction2(elem[type]) && !isWindow(elem)) {
                  tmp = elem[ontype];
                  if (tmp) {
                    elem[ontype] = null;
                  }
                  jQuery2.event.triggered = type;
                  if (event.isPropagationStopped()) {
                    lastElement.addEventListener(type, stopPropagationCallback);
                  }
                  elem[type]();
                  if (event.isPropagationStopped()) {
                    lastElement.removeEventListener(type, stopPropagationCallback);
                  }
                  jQuery2.event.triggered = void 0;
                  if (tmp) {
                    elem[ontype] = tmp;
                  }
                }
              }
            }
            return event.result;
          },
          simulate: function(type, elem, event) {
            var e = jQuery2.extend(new jQuery2.Event(), event, {
              type,
              isSimulated: true
            });
            jQuery2.event.trigger(e, null, elem);
          }
        });
        jQuery2.fn.extend({
          trigger: function(type, data) {
            return this.each(function() {
              jQuery2.event.trigger(type, data, this);
            });
          },
          triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
              return jQuery2.event.trigger(type, data, elem, true);
            }
          }
        });
        if (!support.focusin) {
          jQuery2.each({
            focus: "focusin",
            blur: "focusout"
          }, function(orig, fix) {
            var handler = function(event) {
              jQuery2.event.simulate(fix, event.target, jQuery2.event.fix(event));
            };
            jQuery2.event.special[fix] = {
              setup: function() {
                var doc = this.ownerDocument || this.document || this, attaches = dataPriv.access(doc, fix);
                if (!attaches) {
                  doc.addEventListener(orig, handler, true);
                }
                dataPriv.access(doc, fix, (attaches || 0) + 1);
              },
              teardown: function() {
                var doc = this.ownerDocument || this.document || this, attaches = dataPriv.access(doc, fix) - 1;
                if (!attaches) {
                  doc.removeEventListener(orig, handler, true);
                  dataPriv.remove(doc, fix);
                } else {
                  dataPriv.access(doc, fix, attaches);
                }
              }
            };
          });
        }
        var location2 = window2.location;
        var nonce = {
          guid: Date.now()
        };
        var rquery = /\?/;
        jQuery2.parseXML = function(data) {
          var xml;
          if (!data || typeof data !== "string") {
            return null;
          }
          try {
            xml = new window2.DOMParser().parseFromString(data, "text/xml");
          } catch (e) {
            xml = void 0;
          }
          if (!xml || xml.getElementsByTagName("parsererror").length) {
            jQuery2.error("Invalid XML: " + data);
          }
          return xml;
        };
        var rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
        function buildParams(prefix, obj, traditional, add2) {
          var name;
          if (Array.isArray(obj)) {
            jQuery2.each(obj, function(i, v) {
              if (traditional || rbracket.test(prefix)) {
                add2(prefix, v);
              } else {
                buildParams(prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]", v, traditional, add2);
              }
            });
          } else if (!traditional && toType(obj) === "object") {
            for (name in obj) {
              buildParams(prefix + "[" + name + "]", obj[name], traditional, add2);
            }
          } else {
            add2(prefix, obj);
          }
        }
        jQuery2.param = function(a, traditional) {
          var prefix, s = [], add2 = function(key, valueOrFunction) {
            var value = isFunction2(valueOrFunction) ? valueOrFunction() : valueOrFunction;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
          };
          if (a == null) {
            return "";
          }
          if (Array.isArray(a) || a.jquery && !jQuery2.isPlainObject(a)) {
            jQuery2.each(a, function() {
              add2(this.name, this.value);
            });
          } else {
            for (prefix in a) {
              buildParams(prefix, a[prefix], traditional, add2);
            }
          }
          return s.join("&");
        };
        jQuery2.fn.extend({
          serialize: function() {
            return jQuery2.param(this.serializeArray());
          },
          serializeArray: function() {
            return this.map(function() {
              var elements = jQuery2.prop(this, "elements");
              return elements ? jQuery2.makeArray(elements) : this;
            }).filter(function() {
              var type = this.type;
              return this.name && !jQuery2(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(_i, elem) {
              var val = jQuery2(this).val();
              if (val == null) {
                return null;
              }
              if (Array.isArray(val)) {
                return jQuery2.map(val, function(val2) {
                  return {
                    name: elem.name,
                    value: val2.replace(rCRLF, "\r\n")
                  };
                });
              }
              return {
                name: elem.name,
                value: val.replace(rCRLF, "\r\n")
              };
            }).get();
          }
        });
        var r20 = /%20/g, rhash = /#.*$/, rantiCache = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), originAnchor = document2.createElement("a");
        originAnchor.href = location2.href;
        function addToPrefiltersOrTransports(structure) {
          return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
              func = dataTypeExpression;
              dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
            if (isFunction2(func)) {
              while (dataType = dataTypes[i++]) {
                if (dataType[0] === "+") {
                  dataType = dataType.slice(1) || "*";
                  (structure[dataType] = structure[dataType] || []).unshift(func);
                } else {
                  (structure[dataType] = structure[dataType] || []).push(func);
                }
              }
            }
          };
        }
        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
          var inspected = {}, seekingTransport = structure === transports;
          function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery2.each(structure[dataType] || [], function(_, prefilterOrFactory) {
              var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
              if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                options.dataTypes.unshift(dataTypeOrTransport);
                inspect(dataTypeOrTransport);
                return false;
              } else if (seekingTransport) {
                return !(selected = dataTypeOrTransport);
              }
            });
            return selected;
          }
          return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
        }
        function ajaxExtend(target, src) {
          var key, deep, flatOptions = jQuery2.ajaxSettings.flatOptions || {};
          for (key in src) {
            if (src[key] !== void 0) {
              (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
          }
          if (deep) {
            jQuery2.extend(true, target, deep);
          }
          return target;
        }
        function ajaxHandleResponses(s, jqXHR, responses) {
          var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
          while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === void 0) {
              ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
          }
          if (ct) {
            for (type in contents) {
              if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
              }
            }
          }
          if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
          } else {
            for (type in responses) {
              if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                finalDataType = type;
                break;
              }
              if (!firstDataType) {
                firstDataType = type;
              }
            }
            finalDataType = finalDataType || firstDataType;
          }
          if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
              dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
          }
        }
        function ajaxConvert(s, response, jqXHR, isSuccess) {
          var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
          if (dataTypes[1]) {
            for (conv in s.converters) {
              converters[conv.toLowerCase()] = s.converters[conv];
            }
          }
          current = dataTypes.shift();
          while (current) {
            if (s.responseFields[current]) {
              jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
              response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
              if (current === "*") {
                current = prev;
              } else if (prev !== "*" && prev !== current) {
                conv = converters[prev + " " + current] || converters["* " + current];
                if (!conv) {
                  for (conv2 in converters) {
                    tmp = conv2.split(" ");
                    if (tmp[1] === current) {
                      conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                      if (conv) {
                        if (conv === true) {
                          conv = converters[conv2];
                        } else if (converters[conv2] !== true) {
                          current = tmp[0];
                          dataTypes.unshift(tmp[1]);
                        }
                        break;
                      }
                    }
                  }
                }
                if (conv !== true) {
                  if (conv && s.throws) {
                    response = conv(response);
                  } else {
                    try {
                      response = conv(response);
                    } catch (e) {
                      return {
                        state: "parsererror",
                        error: conv ? e : "No conversion from " + prev + " to " + current
                      };
                    }
                  }
                }
              }
            }
          }
          return {
            state: "success",
            data: response
          };
        }
        jQuery2.extend({
          active: 0,
          lastModified: {},
          etag: {},
          ajaxSettings: {
            url: location2.href,
            type: "GET",
            isLocal: rlocalProtocol.test(location2.protocol),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
              "*": allTypes,
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript"
            },
            contents: {
              xml: /\bxml\b/,
              html: /\bhtml/,
              json: /\bjson\b/
            },
            responseFields: {
              xml: "responseXML",
              text: "responseText",
              json: "responseJSON"
            },
            converters: {
              "* text": String,
              "text html": true,
              "text json": JSON.parse,
              "text xml": jQuery2.parseXML
            },
            flatOptions: {
              url: true,
              context: true
            }
          },
          ajaxSetup: function(target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery2.ajaxSettings), settings) : ajaxExtend(jQuery2.ajaxSettings, target);
          },
          ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
          ajaxTransport: addToPrefiltersOrTransports(transports),
          ajax: function(url, options) {
            if (typeof url === "object") {
              options = url;
              url = void 0;
            }
            options = options || {};
            var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed2, fireGlobals, i, uncached, s = jQuery2.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery2(callbackContext) : jQuery2.event, deferred = jQuery2.Deferred(), completeDeferred = jQuery2.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, strAbort = "canceled", jqXHR = {
              readyState: 0,
              getResponseHeader: function(key) {
                var match;
                if (completed2) {
                  if (!responseHeaders) {
                    responseHeaders = {};
                    while (match = rheaders.exec(responseHeadersString)) {
                      responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                    }
                  }
                  match = responseHeaders[key.toLowerCase() + " "];
                }
                return match == null ? null : match.join(", ");
              },
              getAllResponseHeaders: function() {
                return completed2 ? responseHeadersString : null;
              },
              setRequestHeader: function(name, value) {
                if (completed2 == null) {
                  name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
                  requestHeaders[name] = value;
                }
                return this;
              },
              overrideMimeType: function(type) {
                if (completed2 == null) {
                  s.mimeType = type;
                }
                return this;
              },
              statusCode: function(map) {
                var code;
                if (map) {
                  if (completed2) {
                    jqXHR.always(map[jqXHR.status]);
                  } else {
                    for (code in map) {
                      statusCode[code] = [statusCode[code], map[code]];
                    }
                  }
                }
                return this;
              },
              abort: function(statusText) {
                var finalText = statusText || strAbort;
                if (transport) {
                  transport.abort(finalText);
                }
                done(0, finalText);
                return this;
              }
            };
            deferred.promise(jqXHR);
            s.url = ((url || s.url || location2.href) + "").replace(rprotocol, location2.protocol + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];
            if (s.crossDomain == null) {
              urlAnchor = document2.createElement("a");
              try {
                urlAnchor.href = s.url;
                urlAnchor.href = urlAnchor.href;
                s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
              } catch (e) {
                s.crossDomain = true;
              }
            }
            if (s.data && s.processData && typeof s.data !== "string") {
              s.data = jQuery2.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (completed2) {
              return jqXHR;
            }
            fireGlobals = jQuery2.event && s.global;
            if (fireGlobals && jQuery2.active++ === 0) {
              jQuery2.event.trigger("ajaxStart");
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url.replace(rhash, "");
            if (!s.hasContent) {
              uncached = s.url.slice(cacheURL.length);
              if (s.data && (s.processData || typeof s.data === "string")) {
                cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;
                delete s.data;
              }
              if (s.cache === false) {
                cacheURL = cacheURL.replace(rantiCache, "$1");
                uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
              }
              s.url = cacheURL + uncached;
            } else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
              s.data = s.data.replace(r20, "+");
            }
            if (s.ifModified) {
              if (jQuery2.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery2.lastModified[cacheURL]);
              }
              if (jQuery2.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery2.etag[cacheURL]);
              }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
              jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            for (i in s.headers) {
              jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed2)) {
              return jqXHR.abort();
            }
            strAbort = "abort";
            completeDeferred.add(s.complete);
            jqXHR.done(s.success);
            jqXHR.fail(s.error);
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
              done(-1, "No Transport");
            } else {
              jqXHR.readyState = 1;
              if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
              }
              if (completed2) {
                return jqXHR;
              }
              if (s.async && s.timeout > 0) {
                timeoutTimer = window2.setTimeout(function() {
                  jqXHR.abort("timeout");
                }, s.timeout);
              }
              try {
                completed2 = false;
                transport.send(requestHeaders, done);
              } catch (e) {
                if (completed2) {
                  throw e;
                }
                done(-1, e);
              }
            }
            function done(status, nativeStatusText, responses, headers) {
              var isSuccess, success, error2, response, modified, statusText = nativeStatusText;
              if (completed2) {
                return;
              }
              completed2 = true;
              if (timeoutTimer) {
                window2.clearTimeout(timeoutTimer);
              }
              transport = void 0;
              responseHeadersString = headers || "";
              jqXHR.readyState = status > 0 ? 4 : 0;
              isSuccess = status >= 200 && status < 300 || status === 304;
              if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
              }
              if (!isSuccess && jQuery2.inArray("script", s.dataTypes) > -1) {
                s.converters["text script"] = function() {
                };
              }
              response = ajaxConvert(s, response, jqXHR, isSuccess);
              if (isSuccess) {
                if (s.ifModified) {
                  modified = jqXHR.getResponseHeader("Last-Modified");
                  if (modified) {
                    jQuery2.lastModified[cacheURL] = modified;
                  }
                  modified = jqXHR.getResponseHeader("etag");
                  if (modified) {
                    jQuery2.etag[cacheURL] = modified;
                  }
                }
                if (status === 204 || s.type === "HEAD") {
                  statusText = "nocontent";
                } else if (status === 304) {
                  statusText = "notmodified";
                } else {
                  statusText = response.state;
                  success = response.data;
                  error2 = response.error;
                  isSuccess = !error2;
                }
              } else {
                error2 = statusText;
                if (status || !statusText) {
                  statusText = "error";
                  if (status < 0) {
                    status = 0;
                  }
                }
              }
              jqXHR.status = status;
              jqXHR.statusText = (nativeStatusText || statusText) + "";
              if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
              } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error2]);
              }
              jqXHR.statusCode(statusCode);
              statusCode = void 0;
              if (fireGlobals) {
                globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error2]);
              }
              completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
              if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                if (!--jQuery2.active) {
                  jQuery2.event.trigger("ajaxStop");
                }
              }
            }
            return jqXHR;
          },
          getJSON: function(url, data, callback) {
            return jQuery2.get(url, data, callback, "json");
          },
          getScript: function(url, callback) {
            return jQuery2.get(url, void 0, callback, "script");
          }
        });
        jQuery2.each(["get", "post"], function(_i, method) {
          jQuery2[method] = function(url, data, callback, type) {
            if (isFunction2(data)) {
              type = type || callback;
              callback = data;
              data = void 0;
            }
            return jQuery2.ajax(jQuery2.extend({
              url,
              type: method,
              dataType: type,
              data,
              success: callback
            }, jQuery2.isPlainObject(url) && url));
          };
        });
        jQuery2.ajaxPrefilter(function(s) {
          var i;
          for (i in s.headers) {
            if (i.toLowerCase() === "content-type") {
              s.contentType = s.headers[i] || "";
            }
          }
        });
        jQuery2._evalUrl = function(url, options, doc) {
          return jQuery2.ajax({
            url,
            type: "GET",
            dataType: "script",
            cache: true,
            async: false,
            global: false,
            converters: {
              "text script": function() {
              }
            },
            dataFilter: function(response) {
              jQuery2.globalEval(response, options, doc);
            }
          });
        };
        jQuery2.fn.extend({
          wrapAll: function(html) {
            var wrap;
            if (this[0]) {
              if (isFunction2(html)) {
                html = html.call(this[0]);
              }
              wrap = jQuery2(html, this[0].ownerDocument).eq(0).clone(true);
              if (this[0].parentNode) {
                wrap.insertBefore(this[0]);
              }
              wrap.map(function() {
                var elem = this;
                while (elem.firstElementChild) {
                  elem = elem.firstElementChild;
                }
                return elem;
              }).append(this);
            }
            return this;
          },
          wrapInner: function(html) {
            if (isFunction2(html)) {
              return this.each(function(i) {
                jQuery2(this).wrapInner(html.call(this, i));
              });
            }
            return this.each(function() {
              var self2 = jQuery2(this), contents = self2.contents();
              if (contents.length) {
                contents.wrapAll(html);
              } else {
                self2.append(html);
              }
            });
          },
          wrap: function(html) {
            var htmlIsFunction = isFunction2(html);
            return this.each(function(i) {
              jQuery2(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
            });
          },
          unwrap: function(selector) {
            this.parent(selector).not("body").each(function() {
              jQuery2(this).replaceWith(this.childNodes);
            });
            return this;
          }
        });
        jQuery2.expr.pseudos.hidden = function(elem) {
          return !jQuery2.expr.pseudos.visible(elem);
        };
        jQuery2.expr.pseudos.visible = function(elem) {
          return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };
        jQuery2.ajaxSettings.xhr = function() {
          try {
            return new window2.XMLHttpRequest();
          } catch (e) {
          }
        };
        var xhrSuccessStatus = {
          0: 200,
          1223: 204
        }, xhrSupported = jQuery2.ajaxSettings.xhr();
        support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
        support.ajax = xhrSupported = !!xhrSupported;
        jQuery2.ajaxTransport(function(options) {
          var callback, errorCallback;
          if (support.cors || xhrSupported && !options.crossDomain) {
            return {
              send: function(headers, complete) {
                var i, xhr = options.xhr();
                xhr.open(options.type, options.url, options.async, options.username, options.password);
                if (options.xhrFields) {
                  for (i in options.xhrFields) {
                    xhr[i] = options.xhrFields[i];
                  }
                }
                if (options.mimeType && xhr.overrideMimeType) {
                  xhr.overrideMimeType(options.mimeType);
                }
                if (!options.crossDomain && !headers["X-Requested-With"]) {
                  headers["X-Requested-With"] = "XMLHttpRequest";
                }
                for (i in headers) {
                  xhr.setRequestHeader(i, headers[i]);
                }
                callback = function(type) {
                  return function() {
                    if (callback) {
                      callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = xhr.onreadystatechange = null;
                      if (type === "abort") {
                        xhr.abort();
                      } else if (type === "error") {
                        if (typeof xhr.status !== "number") {
                          complete(0, "error");
                        } else {
                          complete(xhr.status, xhr.statusText);
                        }
                      } else {
                        complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, (xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? {
                          binary: xhr.response
                        } : {
                          text: xhr.responseText
                        }, xhr.getAllResponseHeaders());
                      }
                    }
                  };
                };
                xhr.onload = callback();
                errorCallback = xhr.onerror = xhr.ontimeout = callback("error");
                if (xhr.onabort !== void 0) {
                  xhr.onabort = errorCallback;
                } else {
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                      window2.setTimeout(function() {
                        if (callback) {
                          errorCallback();
                        }
                      });
                    }
                  };
                }
                callback = callback("abort");
                try {
                  xhr.send(options.hasContent && options.data || null);
                } catch (e) {
                  if (callback) {
                    throw e;
                  }
                }
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        jQuery2.ajaxPrefilter(function(s) {
          if (s.crossDomain) {
            s.contents.script = false;
          }
        });
        jQuery2.ajaxSetup({
          accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
          },
          contents: {
            script: /\b(?:java|ecma)script\b/
          },
          converters: {
            "text script": function(text) {
              jQuery2.globalEval(text);
              return text;
            }
          }
        });
        jQuery2.ajaxPrefilter("script", function(s) {
          if (s.cache === void 0) {
            s.cache = false;
          }
          if (s.crossDomain) {
            s.type = "GET";
          }
        });
        jQuery2.ajaxTransport("script", function(s) {
          if (s.crossDomain || s.scriptAttrs) {
            var script, callback;
            return {
              send: function(_, complete) {
                script = jQuery2("<script>").attr(s.scriptAttrs || {}).prop({
                  charset: s.scriptCharset,
                  src: s.url
                }).on("load error", callback = function(evt) {
                  script.remove();
                  callback = null;
                  if (evt) {
                    complete(evt.type === "error" ? 404 : 200, evt.type);
                  }
                });
                document2.head.appendChild(script[0]);
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery2.ajaxSetup({
          jsonp: "callback",
          jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery2.expando + "_" + nonce.guid++;
            this[callback] = true;
            return callback;
          }
        });
        jQuery2.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
          var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
          if (jsonProp || s.dataTypes[0] === "jsonp") {
            callbackName = s.jsonpCallback = isFunction2(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
              s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
              s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            s.converters["script json"] = function() {
              if (!responseContainer) {
                jQuery2.error(callbackName + " was not called");
              }
              return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window2[callbackName];
            window2[callbackName] = function() {
              responseContainer = arguments;
            };
            jqXHR.always(function() {
              if (overwritten === void 0) {
                jQuery2(window2).removeProp(callbackName);
              } else {
                window2[callbackName] = overwritten;
              }
              if (s[callbackName]) {
                s.jsonpCallback = originalSettings.jsonpCallback;
                oldCallbacks.push(callbackName);
              }
              if (responseContainer && isFunction2(overwritten)) {
                overwritten(responseContainer[0]);
              }
              responseContainer = overwritten = void 0;
            });
            return "script";
          }
        });
        support.createHTMLDocument = function() {
          var body = document2.implementation.createHTMLDocument("").body;
          body.innerHTML = "<form></form><form></form>";
          return body.childNodes.length === 2;
        }();
        jQuery2.parseHTML = function(data, context, keepScripts) {
          if (typeof data !== "string") {
            return [];
          }
          if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
          }
          var base, parsed, scripts;
          if (!context) {
            if (support.createHTMLDocument) {
              context = document2.implementation.createHTMLDocument("");
              base = context.createElement("base");
              base.href = document2.location.href;
              context.head.appendChild(base);
            } else {
              context = document2;
            }
          }
          parsed = rsingleTag.exec(data);
          scripts = !keepScripts && [];
          if (parsed) {
            return [context.createElement(parsed[1])];
          }
          parsed = buildFragment([data], context, scripts);
          if (scripts && scripts.length) {
            jQuery2(scripts).remove();
          }
          return jQuery2.merge([], parsed.childNodes);
        };
        jQuery2.fn.load = function(url, params, callback) {
          var selector, type, response, self2 = this, off2 = url.indexOf(" ");
          if (off2 > -1) {
            selector = stripAndCollapse(url.slice(off2));
            url = url.slice(0, off2);
          }
          if (isFunction2(params)) {
            callback = params;
            params = void 0;
          } else if (params && typeof params === "object") {
            type = "POST";
          }
          if (self2.length > 0) {
            jQuery2.ajax({
              url,
              type: type || "GET",
              dataType: "html",
              data: params
            }).done(function(responseText) {
              response = arguments;
              self2.html(selector ? jQuery2("<div>").append(jQuery2.parseHTML(responseText)).find(selector) : responseText);
            }).always(callback && function(jqXHR, status) {
              self2.each(function() {
                callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
              });
            });
          }
          return this;
        };
        jQuery2.expr.pseudos.animated = function(elem) {
          return jQuery2.grep(jQuery2.timers, function(fn) {
            return elem === fn.elem;
          }).length;
        };
        jQuery2.offset = {
          setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery2.css(elem, "position"), curElem = jQuery2(elem), props = {};
            if (position === "static") {
              elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery2.css(elem, "top");
            curCSSLeft = jQuery2.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
            if (calculatePosition) {
              curPosition = curElem.position();
              curTop = curPosition.top;
              curLeft = curPosition.left;
            } else {
              curTop = parseFloat(curCSSTop) || 0;
              curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (isFunction2(options)) {
              options = options.call(elem, i, jQuery2.extend({}, curOffset));
            }
            if (options.top != null) {
              props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
              props.left = options.left - curOffset.left + curLeft;
            }
            if ("using" in options) {
              options.using.call(elem, props);
            } else {
              if (typeof props.top === "number") {
                props.top += "px";
              }
              if (typeof props.left === "number") {
                props.left += "px";
              }
              curElem.css(props);
            }
          }
        };
        jQuery2.fn.extend({
          offset: function(options) {
            if (arguments.length) {
              return options === void 0 ? this : this.each(function(i) {
                jQuery2.offset.setOffset(this, options, i);
              });
            }
            var rect, win, elem = this[0];
            if (!elem) {
              return;
            }
            if (!elem.getClientRects().length) {
              return {
                top: 0,
                left: 0
              };
            }
            rect = elem.getBoundingClientRect();
            win = elem.ownerDocument.defaultView;
            return {
              top: rect.top + win.pageYOffset,
              left: rect.left + win.pageXOffset
            };
          },
          position: function() {
            if (!this[0]) {
              return;
            }
            var offsetParent, offset2, doc, elem = this[0], parentOffset = {
              top: 0,
              left: 0
            };
            if (jQuery2.css(elem, "position") === "fixed") {
              offset2 = elem.getBoundingClientRect();
            } else {
              offset2 = this.offset();
              doc = elem.ownerDocument;
              offsetParent = elem.offsetParent || doc.documentElement;
              while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && jQuery2.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.parentNode;
              }
              if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
                parentOffset = jQuery2(offsetParent).offset();
                parentOffset.top += jQuery2.css(offsetParent, "borderTopWidth", true);
                parentOffset.left += jQuery2.css(offsetParent, "borderLeftWidth", true);
              }
            }
            return {
              top: offset2.top - parentOffset.top - jQuery2.css(elem, "marginTop", true),
              left: offset2.left - parentOffset.left - jQuery2.css(elem, "marginLeft", true)
            };
          },
          offsetParent: function() {
            return this.map(function() {
              var offsetParent = this.offsetParent;
              while (offsetParent && jQuery2.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.offsetParent;
              }
              return offsetParent || documentElement;
            });
          }
        });
        jQuery2.each({
          scrollLeft: "pageXOffset",
          scrollTop: "pageYOffset"
        }, function(method, prop) {
          var top = "pageYOffset" === prop;
          jQuery2.fn[method] = function(val) {
            return access(this, function(elem, method2, val2) {
              var win;
              if (isWindow(elem)) {
                win = elem;
              } else if (elem.nodeType === 9) {
                win = elem.defaultView;
              }
              if (val2 === void 0) {
                return win ? win[prop] : elem[method2];
              }
              if (win) {
                win.scrollTo(!top ? val2 : win.pageXOffset, top ? val2 : win.pageYOffset);
              } else {
                elem[method2] = val2;
              }
            }, method, val, arguments.length);
          };
        });
        jQuery2.each(["top", "left"], function(_i, prop) {
          jQuery2.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
            if (computed) {
              computed = curCSS(elem, prop);
              return rnumnonpx.test(computed) ? jQuery2(elem).position()[prop] + "px" : computed;
            }
          });
        });
        jQuery2.each({
          Height: "height",
          Width: "width"
        }, function(name, type) {
          jQuery2.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
          }, function(defaultExtra, funcName) {
            jQuery2.fn[funcName] = function(margin, value) {
              var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
              return access(this, function(elem, type2, value2) {
                var doc;
                if (isWindow(elem)) {
                  return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
                }
                if (elem.nodeType === 9) {
                  doc = elem.documentElement;
                  return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                }
                return value2 === void 0 ? jQuery2.css(elem, type2, extra) : jQuery2.style(elem, type2, value2, extra);
              }, type, chainable ? margin : void 0, chainable);
            };
          });
        });
        jQuery2.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(_i, type) {
          jQuery2.fn[type] = function(fn) {
            return this.on(type, fn);
          };
        });
        jQuery2.fn.extend({
          bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
          },
          unbind: function(types, fn) {
            return this.off(types, null, fn);
          },
          delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
          },
          undelegate: function(selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
          },
          hover: function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
          }
        });
        jQuery2.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(_i, name) {
          jQuery2.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
          };
        });
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        jQuery2.proxy = function(fn, context) {
          var tmp, args, proxy;
          if (typeof context === "string") {
            tmp = fn[context];
            context = fn;
            fn = tmp;
          }
          if (!isFunction2(fn)) {
            return void 0;
          }
          args = slice.call(arguments, 2);
          proxy = function() {
            return fn.apply(context || this, args.concat(slice.call(arguments)));
          };
          proxy.guid = fn.guid = fn.guid || jQuery2.guid++;
          return proxy;
        };
        jQuery2.holdReady = function(hold) {
          if (hold) {
            jQuery2.readyWait++;
          } else {
            jQuery2.ready(true);
          }
        };
        jQuery2.isArray = Array.isArray;
        jQuery2.parseJSON = JSON.parse;
        jQuery2.nodeName = nodeName;
        jQuery2.isFunction = isFunction2;
        jQuery2.isWindow = isWindow;
        jQuery2.camelCase = camelCase;
        jQuery2.type = toType;
        jQuery2.now = Date.now;
        jQuery2.isNumeric = function(obj) {
          var type = jQuery2.type(obj);
          return (type === "number" || type === "string") && !isNaN(obj - parseFloat(obj));
        };
        jQuery2.trim = function(text) {
          return text == null ? "" : (text + "").replace(rtrim, "");
        };
        var _jQuery = window2.jQuery, _$ = window2.$;
        jQuery2.noConflict = function(deep) {
          if (window2.$ === jQuery2) {
            window2.$ = _$;
          }
          if (deep && window2.jQuery === jQuery2) {
            window2.jQuery = _jQuery;
          }
          return jQuery2;
        };
        if (typeof noGlobal === "undefined") {
          window2.jQuery = window2.$ = jQuery2;
        }
        return jQuery2;
      });
    })(jquery$1);
    var jquery = jquery$1.exports;
    var bootstrap = {
      exports: {}
    };
    var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && typeof navigator !== "undefined";
    var timeoutDuration = function() {
      var longerTimeoutBrowsers = ["Edge", "Trident", "Firefox"];
      for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
        if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
          return 1;
        }
      }
      return 0;
    }();
    function microtaskDebounce(fn) {
      var called = false;
      return function() {
        if (called) {
          return;
        }
        called = true;
        window.Promise.resolve().then(function() {
          called = false;
          fn();
        });
      };
    }
    function taskDebounce(fn) {
      var scheduled = false;
      return function() {
        if (!scheduled) {
          scheduled = true;
          setTimeout(function() {
            scheduled = false;
            fn();
          }, timeoutDuration);
        }
      };
    }
    var supportsMicroTasks = isBrowser && window.Promise;
    var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;
    function isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
    }
    function getStyleComputedProperty(element, property) {
      if (element.nodeType !== 1) {
        return [];
      }
      var window2 = element.ownerDocument.defaultView;
      var css2 = window2.getComputedStyle(element, null);
      return property ? css2[property] : css2;
    }
    function getParentNode(element) {
      if (element.nodeName === "HTML") {
        return element;
      }
      return element.parentNode || element.host;
    }
    function getScrollParent(element) {
      if (!element) {
        return document.body;
      }
      switch (element.nodeName) {
        case "HTML":
        case "BODY":
          return element.ownerDocument.body;
        case "#document":
          return element.body;
      }
      var _getStyleComputedProp = getStyleComputedProperty(element), overflow = _getStyleComputedProp.overflow, overflowX = _getStyleComputedProp.overflowX, overflowY = _getStyleComputedProp.overflowY;
      if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
        return element;
      }
      return getScrollParent(getParentNode(element));
    }
    function getReferenceNode(reference) {
      return reference && reference.referenceNode ? reference.referenceNode : reference;
    }
    var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
    var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);
    function isIE(version2) {
      if (version2 === 11) {
        return isIE11;
      }
      if (version2 === 10) {
        return isIE10;
      }
      return isIE11 || isIE10;
    }
    function getOffsetParent(element) {
      if (!element) {
        return document.documentElement;
      }
      var noOffsetParent = isIE(10) ? document.body : null;
      var offsetParent = element.offsetParent || null;
      while (offsetParent === noOffsetParent && element.nextElementSibling) {
        offsetParent = (element = element.nextElementSibling).offsetParent;
      }
      var nodeName = offsetParent && offsetParent.nodeName;
      if (!nodeName || nodeName === "BODY" || nodeName === "HTML") {
        return element ? element.ownerDocument.documentElement : document.documentElement;
      }
      if (["TH", "TD", "TABLE"].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, "position") === "static") {
        return getOffsetParent(offsetParent);
      }
      return offsetParent;
    }
    function isOffsetContainer(element) {
      var nodeName = element.nodeName;
      if (nodeName === "BODY") {
        return false;
      }
      return nodeName === "HTML" || getOffsetParent(element.firstElementChild) === element;
    }
    function getRoot(node) {
      if (node.parentNode !== null) {
        return getRoot(node.parentNode);
      }
      return node;
    }
    function findCommonOffsetParent(element1, element2) {
      if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
        return document.documentElement;
      }
      var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
      var start2 = order ? element1 : element2;
      var end = order ? element2 : element1;
      var range = document.createRange();
      range.setStart(start2, 0);
      range.setEnd(end, 0);
      var commonAncestorContainer = range.commonAncestorContainer;
      if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start2.contains(end)) {
        if (isOffsetContainer(commonAncestorContainer)) {
          return commonAncestorContainer;
        }
        return getOffsetParent(commonAncestorContainer);
      }
      var element1root = getRoot(element1);
      if (element1root.host) {
        return findCommonOffsetParent(element1root.host, element2);
      } else {
        return findCommonOffsetParent(element1, getRoot(element2).host);
      }
    }
    function getScroll(element) {
      var side = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "top";
      var upperSide = side === "top" ? "scrollTop" : "scrollLeft";
      var nodeName = element.nodeName;
      if (nodeName === "BODY" || nodeName === "HTML") {
        var html = element.ownerDocument.documentElement;
        var scrollingElement = element.ownerDocument.scrollingElement || html;
        return scrollingElement[upperSide];
      }
      return element[upperSide];
    }
    function includeScroll(rect, element) {
      var subtract = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      var scrollTop = getScroll(element, "top");
      var scrollLeft = getScroll(element, "left");
      var modifier = subtract ? -1 : 1;
      rect.top += scrollTop * modifier;
      rect.bottom += scrollTop * modifier;
      rect.left += scrollLeft * modifier;
      rect.right += scrollLeft * modifier;
      return rect;
    }
    function getBordersSize(styles, axis) {
      var sideA = axis === "x" ? "Left" : "Top";
      var sideB = sideA === "Left" ? "Right" : "Bottom";
      return parseFloat(styles["border" + sideA + "Width"]) + parseFloat(styles["border" + sideB + "Width"]);
    }
    function getSize(axis, body, html, computedStyle) {
      return Math.max(body["offset" + axis], body["scroll" + axis], html["client" + axis], html["offset" + axis], html["scroll" + axis], isIE(10) ? parseInt(html["offset" + axis]) + parseInt(computedStyle["margin" + (axis === "Height" ? "Top" : "Left")]) + parseInt(computedStyle["margin" + (axis === "Height" ? "Bottom" : "Right")]) : 0);
    }
    function getWindowSizes(document2) {
      var body = document2.body;
      var html = document2.documentElement;
      var computedStyle = isIE(10) && getComputedStyle(html);
      return {
        height: getSize("Height", body, html, computedStyle),
        width: getSize("Width", body, html, computedStyle)
      };
    }
    var classCallCheck = function(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };
    var createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var defineProperty = function(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    };
    var _extends$1 = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    function getClientRect(offsets) {
      return _extends$1({}, offsets, {
        right: offsets.left + offsets.width,
        bottom: offsets.top + offsets.height
      });
    }
    function getBoundingClientRect(element) {
      var rect = {};
      try {
        if (isIE(10)) {
          rect = element.getBoundingClientRect();
          var scrollTop = getScroll(element, "top");
          var scrollLeft = getScroll(element, "left");
          rect.top += scrollTop;
          rect.left += scrollLeft;
          rect.bottom += scrollTop;
          rect.right += scrollLeft;
        } else {
          rect = element.getBoundingClientRect();
        }
      } catch (e) {
      }
      var result = {
        left: rect.left,
        top: rect.top,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
      var sizes = element.nodeName === "HTML" ? getWindowSizes(element.ownerDocument) : {};
      var width = sizes.width || element.clientWidth || result.width;
      var height = sizes.height || element.clientHeight || result.height;
      var horizScrollbar = element.offsetWidth - width;
      var vertScrollbar = element.offsetHeight - height;
      if (horizScrollbar || vertScrollbar) {
        var styles = getStyleComputedProperty(element);
        horizScrollbar -= getBordersSize(styles, "x");
        vertScrollbar -= getBordersSize(styles, "y");
        result.width -= horizScrollbar;
        result.height -= vertScrollbar;
      }
      return getClientRect(result);
    }
    function getOffsetRectRelativeToArbitraryNode(children, parent) {
      var fixedPosition = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
      var isIE102 = isIE(10);
      var isHTML2 = parent.nodeName === "HTML";
      var childrenRect = getBoundingClientRect(children);
      var parentRect = getBoundingClientRect(parent);
      var scrollParent = getScrollParent(children);
      var styles = getStyleComputedProperty(parent);
      var borderTopWidth = parseFloat(styles.borderTopWidth);
      var borderLeftWidth = parseFloat(styles.borderLeftWidth);
      if (fixedPosition && isHTML2) {
        parentRect.top = Math.max(parentRect.top, 0);
        parentRect.left = Math.max(parentRect.left, 0);
      }
      var offsets = getClientRect({
        top: childrenRect.top - parentRect.top - borderTopWidth,
        left: childrenRect.left - parentRect.left - borderLeftWidth,
        width: childrenRect.width,
        height: childrenRect.height
      });
      offsets.marginTop = 0;
      offsets.marginLeft = 0;
      if (!isIE102 && isHTML2) {
        var marginTop = parseFloat(styles.marginTop);
        var marginLeft = parseFloat(styles.marginLeft);
        offsets.top -= borderTopWidth - marginTop;
        offsets.bottom -= borderTopWidth - marginTop;
        offsets.left -= borderLeftWidth - marginLeft;
        offsets.right -= borderLeftWidth - marginLeft;
        offsets.marginTop = marginTop;
        offsets.marginLeft = marginLeft;
      }
      if (isIE102 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== "BODY") {
        offsets = includeScroll(offsets, parent);
      }
      return offsets;
    }
    function getViewportOffsetRectRelativeToArtbitraryNode(element) {
      var excludeScroll = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var html = element.ownerDocument.documentElement;
      var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
      var width = Math.max(html.clientWidth, window.innerWidth || 0);
      var height = Math.max(html.clientHeight, window.innerHeight || 0);
      var scrollTop = !excludeScroll ? getScroll(html) : 0;
      var scrollLeft = !excludeScroll ? getScroll(html, "left") : 0;
      var offset2 = {
        top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
        left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
        width,
        height
      };
      return getClientRect(offset2);
    }
    function isFixed(element) {
      var nodeName = element.nodeName;
      if (nodeName === "BODY" || nodeName === "HTML") {
        return false;
      }
      if (getStyleComputedProperty(element, "position") === "fixed") {
        return true;
      }
      var parentNode = getParentNode(element);
      if (!parentNode) {
        return false;
      }
      return isFixed(parentNode);
    }
    function getFixedPositionOffsetParent(element) {
      if (!element || !element.parentElement || isIE()) {
        return document.documentElement;
      }
      var el = element.parentElement;
      while (el && getStyleComputedProperty(el, "transform") === "none") {
        el = el.parentElement;
      }
      return el || document.documentElement;
    }
    function getBoundaries(popper2, reference, padding, boundariesElement) {
      var fixedPosition = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : false;
      var boundaries = {
        top: 0,
        left: 0
      };
      var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper2) : findCommonOffsetParent(popper2, getReferenceNode(reference));
      if (boundariesElement === "viewport") {
        boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
      } else {
        var boundariesNode = void 0;
        if (boundariesElement === "scrollParent") {
          boundariesNode = getScrollParent(getParentNode(reference));
          if (boundariesNode.nodeName === "BODY") {
            boundariesNode = popper2.ownerDocument.documentElement;
          }
        } else if (boundariesElement === "window") {
          boundariesNode = popper2.ownerDocument.documentElement;
        } else {
          boundariesNode = boundariesElement;
        }
        var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);
        if (boundariesNode.nodeName === "HTML" && !isFixed(offsetParent)) {
          var _getWindowSizes = getWindowSizes(popper2.ownerDocument), height = _getWindowSizes.height, width = _getWindowSizes.width;
          boundaries.top += offsets.top - offsets.marginTop;
          boundaries.bottom = height + offsets.top;
          boundaries.left += offsets.left - offsets.marginLeft;
          boundaries.right = width + offsets.left;
        } else {
          boundaries = offsets;
        }
      }
      padding = padding || 0;
      var isPaddingNumber = typeof padding === "number";
      boundaries.left += isPaddingNumber ? padding : padding.left || 0;
      boundaries.top += isPaddingNumber ? padding : padding.top || 0;
      boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
      boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;
      return boundaries;
    }
    function getArea(_ref) {
      var width = _ref.width, height = _ref.height;
      return width * height;
    }
    function computeAutoPlacement(placement, refRect, popper2, reference, boundariesElement) {
      var padding = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 0;
      if (placement.indexOf("auto") === -1) {
        return placement;
      }
      var boundaries = getBoundaries(popper2, reference, padding, boundariesElement);
      var rects = {
        top: {
          width: boundaries.width,
          height: refRect.top - boundaries.top
        },
        right: {
          width: boundaries.right - refRect.right,
          height: boundaries.height
        },
        bottom: {
          width: boundaries.width,
          height: boundaries.bottom - refRect.bottom
        },
        left: {
          width: refRect.left - boundaries.left,
          height: boundaries.height
        }
      };
      var sortedAreas = Object.keys(rects).map(function(key) {
        return _extends$1({
          key
        }, rects[key], {
          area: getArea(rects[key])
        });
      }).sort(function(a, b) {
        return b.area - a.area;
      });
      var filteredAreas = sortedAreas.filter(function(_ref2) {
        var width = _ref2.width, height = _ref2.height;
        return width >= popper2.clientWidth && height >= popper2.clientHeight;
      });
      var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;
      var variation = placement.split("-")[1];
      return computedPlacement + (variation ? "-" + variation : "");
    }
    function getReferenceOffsets(state, popper2, reference) {
      var fixedPosition = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
      var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper2) : findCommonOffsetParent(popper2, getReferenceNode(reference));
      return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
    }
    function getOuterSizes(element) {
      var window2 = element.ownerDocument.defaultView;
      var styles = window2.getComputedStyle(element);
      var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
      var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
      var result = {
        width: element.offsetWidth + y,
        height: element.offsetHeight + x
      };
      return result;
    }
    function getOppositePlacement(placement) {
      var hash = {
        left: "right",
        right: "left",
        bottom: "top",
        top: "bottom"
      };
      return placement.replace(/left|right|bottom|top/g, function(matched) {
        return hash[matched];
      });
    }
    function getPopperOffsets(popper2, referenceOffsets, placement) {
      placement = placement.split("-")[0];
      var popperRect = getOuterSizes(popper2);
      var popperOffsets = {
        width: popperRect.width,
        height: popperRect.height
      };
      var isHoriz = ["right", "left"].indexOf(placement) !== -1;
      var mainSide = isHoriz ? "top" : "left";
      var secondarySide = isHoriz ? "left" : "top";
      var measurement = isHoriz ? "height" : "width";
      var secondaryMeasurement = !isHoriz ? "height" : "width";
      popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
      if (placement === secondarySide) {
        popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
      } else {
        popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
      }
      return popperOffsets;
    }
    function find$1(arr, check) {
      if (Array.prototype.find) {
        return arr.find(check);
      }
      return arr.filter(check)[0];
    }
    function findIndex(arr, prop, value) {
      if (Array.prototype.findIndex) {
        return arr.findIndex(function(cur) {
          return cur[prop] === value;
        });
      }
      var match = find$1(arr, function(obj) {
        return obj[prop] === value;
      });
      return arr.indexOf(match);
    }
    function runModifiers(modifiers2, data, ends) {
      var modifiersToRun = ends === void 0 ? modifiers2 : modifiers2.slice(0, findIndex(modifiers2, "name", ends));
      modifiersToRun.forEach(function(modifier) {
        if (modifier["function"]) {
          console.warn("`modifier.function` is deprecated, use `modifier.fn`!");
        }
        var fn = modifier["function"] || modifier.fn;
        if (modifier.enabled && isFunction(fn)) {
          data.offsets.popper = getClientRect(data.offsets.popper);
          data.offsets.reference = getClientRect(data.offsets.reference);
          data = fn(data, modifier);
        }
      });
      return data;
    }
    function update() {
      if (this.state.isDestroyed) {
        return;
      }
      var data = {
        instance: this,
        styles: {},
        arrowStyles: {},
        attributes: {},
        flipped: false,
        offsets: {}
      };
      data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);
      data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);
      data.originalPlacement = data.placement;
      data.positionFixed = this.options.positionFixed;
      data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);
      data.offsets.popper.position = this.options.positionFixed ? "fixed" : "absolute";
      data = runModifiers(this.modifiers, data);
      if (!this.state.isCreated) {
        this.state.isCreated = true;
        this.options.onCreate(data);
      } else {
        this.options.onUpdate(data);
      }
    }
    function isModifierEnabled(modifiers2, modifierName) {
      return modifiers2.some(function(_ref) {
        var name = _ref.name, enabled = _ref.enabled;
        return enabled && name === modifierName;
      });
    }
    function getSupportedPropertyName(property) {
      var prefixes = [false, "ms", "Webkit", "Moz", "O"];
      var upperProp = property.charAt(0).toUpperCase() + property.slice(1);
      for (var i = 0; i < prefixes.length; i++) {
        var prefix = prefixes[i];
        var toCheck = prefix ? "" + prefix + upperProp : property;
        if (typeof document.body.style[toCheck] !== "undefined") {
          return toCheck;
        }
      }
      return null;
    }
    function destroy() {
      this.state.isDestroyed = true;
      if (isModifierEnabled(this.modifiers, "applyStyle")) {
        this.popper.removeAttribute("x-placement");
        this.popper.style.position = "";
        this.popper.style.top = "";
        this.popper.style.left = "";
        this.popper.style.right = "";
        this.popper.style.bottom = "";
        this.popper.style.willChange = "";
        this.popper.style[getSupportedPropertyName("transform")] = "";
      }
      this.disableEventListeners();
      if (this.options.removeOnDestroy) {
        this.popper.parentNode.removeChild(this.popper);
      }
      return this;
    }
    function getWindow(element) {
      var ownerDocument = element.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView : window;
    }
    function attachToScrollParents(scrollParent, event, callback, scrollParents) {
      var isBody = scrollParent.nodeName === "BODY";
      var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
      target.addEventListener(event, callback, {
        passive: true
      });
      if (!isBody) {
        attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
      }
      scrollParents.push(target);
    }
    function setupEventListeners(reference, options, state, updateBound) {
      state.updateBound = updateBound;
      getWindow(reference).addEventListener("resize", state.updateBound, {
        passive: true
      });
      var scrollElement = getScrollParent(reference);
      attachToScrollParents(scrollElement, "scroll", state.updateBound, state.scrollParents);
      state.scrollElement = scrollElement;
      state.eventsEnabled = true;
      return state;
    }
    function enableEventListeners() {
      if (!this.state.eventsEnabled) {
        this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
      }
    }
    function removeEventListeners(reference, state) {
      getWindow(reference).removeEventListener("resize", state.updateBound);
      state.scrollParents.forEach(function(target) {
        target.removeEventListener("scroll", state.updateBound);
      });
      state.updateBound = null;
      state.scrollParents = [];
      state.scrollElement = null;
      state.eventsEnabled = false;
      return state;
    }
    function disableEventListeners() {
      if (this.state.eventsEnabled) {
        cancelAnimationFrame(this.scheduleUpdate);
        this.state = removeEventListeners(this.reference, this.state);
      }
    }
    function isNumeric(n) {
      return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
    }
    function setStyles(element, styles) {
      Object.keys(styles).forEach(function(prop) {
        var unit = "";
        if (["width", "height", "top", "right", "bottom", "left"].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
          unit = "px";
        }
        element.style[prop] = styles[prop] + unit;
      });
    }
    function setAttributes(element, attributes) {
      Object.keys(attributes).forEach(function(prop) {
        var value = attributes[prop];
        if (value !== false) {
          element.setAttribute(prop, attributes[prop]);
        } else {
          element.removeAttribute(prop);
        }
      });
    }
    function applyStyle(data) {
      setStyles(data.instance.popper, data.styles);
      setAttributes(data.instance.popper, data.attributes);
      if (data.arrowElement && Object.keys(data.arrowStyles).length) {
        setStyles(data.arrowElement, data.arrowStyles);
      }
      return data;
    }
    function applyStyleOnLoad(reference, popper2, options, modifierOptions, state) {
      var referenceOffsets = getReferenceOffsets(state, popper2, reference, options.positionFixed);
      var placement = computeAutoPlacement(options.placement, referenceOffsets, popper2, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);
      popper2.setAttribute("x-placement", placement);
      setStyles(popper2, {
        position: options.positionFixed ? "fixed" : "absolute"
      });
      return options;
    }
    function getRoundedOffsets(data, shouldRound) {
      var _data$offsets = data.offsets, popper2 = _data$offsets.popper, reference = _data$offsets.reference;
      var round = Math.round, floor = Math.floor;
      var noRound = function noRound2(v) {
        return v;
      };
      var referenceWidth = round(reference.width);
      var popperWidth = round(popper2.width);
      var isVertical = ["left", "right"].indexOf(data.placement) !== -1;
      var isVariation = data.placement.indexOf("-") !== -1;
      var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
      var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;
      var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
      var verticalToInteger = !shouldRound ? noRound : round;
      return {
        left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper2.left - 1 : popper2.left),
        top: verticalToInteger(popper2.top),
        bottom: verticalToInteger(popper2.bottom),
        right: horizontalToInteger(popper2.right)
      };
    }
    var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);
    function computeStyle(data, options) {
      var x = options.x, y = options.y;
      var popper2 = data.offsets.popper;
      var legacyGpuAccelerationOption = find$1(data.instance.modifiers, function(modifier) {
        return modifier.name === "applyStyle";
      }).gpuAcceleration;
      if (legacyGpuAccelerationOption !== void 0) {
        console.warn("WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!");
      }
      var gpuAcceleration = legacyGpuAccelerationOption !== void 0 ? legacyGpuAccelerationOption : options.gpuAcceleration;
      var offsetParent = getOffsetParent(data.instance.popper);
      var offsetParentRect = getBoundingClientRect(offsetParent);
      var styles = {
        position: popper2.position
      };
      var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);
      var sideA = x === "bottom" ? "top" : "bottom";
      var sideB = y === "right" ? "left" : "right";
      var prefixedProperty = getSupportedPropertyName("transform");
      var left = void 0, top = void 0;
      if (sideA === "bottom") {
        if (offsetParent.nodeName === "HTML") {
          top = -offsetParent.clientHeight + offsets.bottom;
        } else {
          top = -offsetParentRect.height + offsets.bottom;
        }
      } else {
        top = offsets.top;
      }
      if (sideB === "right") {
        if (offsetParent.nodeName === "HTML") {
          left = -offsetParent.clientWidth + offsets.right;
        } else {
          left = -offsetParentRect.width + offsets.right;
        }
      } else {
        left = offsets.left;
      }
      if (gpuAcceleration && prefixedProperty) {
        styles[prefixedProperty] = "translate3d(" + left + "px, " + top + "px, 0)";
        styles[sideA] = 0;
        styles[sideB] = 0;
        styles.willChange = "transform";
      } else {
        var invertTop = sideA === "bottom" ? -1 : 1;
        var invertLeft = sideB === "right" ? -1 : 1;
        styles[sideA] = top * invertTop;
        styles[sideB] = left * invertLeft;
        styles.willChange = sideA + ", " + sideB;
      }
      var attributes = {
        "x-placement": data.placement
      };
      data.attributes = _extends$1({}, attributes, data.attributes);
      data.styles = _extends$1({}, styles, data.styles);
      data.arrowStyles = _extends$1({}, data.offsets.arrow, data.arrowStyles);
      return data;
    }
    function isModifierRequired(modifiers2, requestingName, requestedName) {
      var requesting = find$1(modifiers2, function(_ref) {
        var name = _ref.name;
        return name === requestingName;
      });
      var isRequired = !!requesting && modifiers2.some(function(modifier) {
        return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
      });
      if (!isRequired) {
        var _requesting = "`" + requestingName + "`";
        var requested = "`" + requestedName + "`";
        console.warn(requested + " modifier is required by " + _requesting + " modifier in order to work, be sure to include it before " + _requesting + "!");
      }
      return isRequired;
    }
    function arrow(data, options) {
      var _data$offsets$arrow;
      if (!isModifierRequired(data.instance.modifiers, "arrow", "keepTogether")) {
        return data;
      }
      var arrowElement = options.element;
      if (typeof arrowElement === "string") {
        arrowElement = data.instance.popper.querySelector(arrowElement);
        if (!arrowElement) {
          return data;
        }
      } else {
        if (!data.instance.popper.contains(arrowElement)) {
          console.warn("WARNING: `arrow.element` must be child of its popper element!");
          return data;
        }
      }
      var placement = data.placement.split("-")[0];
      var _data$offsets = data.offsets, popper2 = _data$offsets.popper, reference = _data$offsets.reference;
      var isVertical = ["left", "right"].indexOf(placement) !== -1;
      var len = isVertical ? "height" : "width";
      var sideCapitalized = isVertical ? "Top" : "Left";
      var side = sideCapitalized.toLowerCase();
      var altSide = isVertical ? "left" : "top";
      var opSide = isVertical ? "bottom" : "right";
      var arrowElementSize = getOuterSizes(arrowElement)[len];
      if (reference[opSide] - arrowElementSize < popper2[side]) {
        data.offsets.popper[side] -= popper2[side] - (reference[opSide] - arrowElementSize);
      }
      if (reference[side] + arrowElementSize > popper2[opSide]) {
        data.offsets.popper[side] += reference[side] + arrowElementSize - popper2[opSide];
      }
      data.offsets.popper = getClientRect(data.offsets.popper);
      var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;
      var css2 = getStyleComputedProperty(data.instance.popper);
      var popperMarginSide = parseFloat(css2["margin" + sideCapitalized]);
      var popperBorderSide = parseFloat(css2["border" + sideCapitalized + "Width"]);
      var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;
      sideValue = Math.max(Math.min(popper2[len] - arrowElementSize, sideValue), 0);
      data.arrowElement = arrowElement;
      data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ""), _data$offsets$arrow);
      return data;
    }
    function getOppositeVariation(variation) {
      if (variation === "end") {
        return "start";
      } else if (variation === "start") {
        return "end";
      }
      return variation;
    }
    var placements = ["auto-start", "auto", "auto-end", "top-start", "top", "top-end", "right-start", "right", "right-end", "bottom-end", "bottom", "bottom-start", "left-end", "left", "left-start"];
    var validPlacements = placements.slice(3);
    function clockwise(placement) {
      var counter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var index2 = validPlacements.indexOf(placement);
      var arr = validPlacements.slice(index2 + 1).concat(validPlacements.slice(0, index2));
      return counter ? arr.reverse() : arr;
    }
    var BEHAVIORS = {
      FLIP: "flip",
      CLOCKWISE: "clockwise",
      COUNTERCLOCKWISE: "counterclockwise"
    };
    function flip(data, options) {
      if (isModifierEnabled(data.instance.modifiers, "inner")) {
        return data;
      }
      if (data.flipped && data.placement === data.originalPlacement) {
        return data;
      }
      var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);
      var placement = data.placement.split("-")[0];
      var placementOpposite = getOppositePlacement(placement);
      var variation = data.placement.split("-")[1] || "";
      var flipOrder = [];
      switch (options.behavior) {
        case BEHAVIORS.FLIP:
          flipOrder = [placement, placementOpposite];
          break;
        case BEHAVIORS.CLOCKWISE:
          flipOrder = clockwise(placement);
          break;
        case BEHAVIORS.COUNTERCLOCKWISE:
          flipOrder = clockwise(placement, true);
          break;
        default:
          flipOrder = options.behavior;
      }
      flipOrder.forEach(function(step, index2) {
        if (placement !== step || flipOrder.length === index2 + 1) {
          return data;
        }
        placement = data.placement.split("-")[0];
        placementOpposite = getOppositePlacement(placement);
        var popperOffsets = data.offsets.popper;
        var refOffsets = data.offsets.reference;
        var floor = Math.floor;
        var overlapsRef = placement === "left" && floor(popperOffsets.right) > floor(refOffsets.left) || placement === "right" && floor(popperOffsets.left) < floor(refOffsets.right) || placement === "top" && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === "bottom" && floor(popperOffsets.top) < floor(refOffsets.bottom);
        var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
        var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
        var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
        var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);
        var overflowsBoundaries = placement === "left" && overflowsLeft || placement === "right" && overflowsRight || placement === "top" && overflowsTop || placement === "bottom" && overflowsBottom;
        var isVertical = ["top", "bottom"].indexOf(placement) !== -1;
        var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === "start" && overflowsLeft || isVertical && variation === "end" && overflowsRight || !isVertical && variation === "start" && overflowsTop || !isVertical && variation === "end" && overflowsBottom);
        var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === "start" && overflowsRight || isVertical && variation === "end" && overflowsLeft || !isVertical && variation === "start" && overflowsBottom || !isVertical && variation === "end" && overflowsTop);
        var flippedVariation = flippedVariationByRef || flippedVariationByContent;
        if (overlapsRef || overflowsBoundaries || flippedVariation) {
          data.flipped = true;
          if (overlapsRef || overflowsBoundaries) {
            placement = flipOrder[index2 + 1];
          }
          if (flippedVariation) {
            variation = getOppositeVariation(variation);
          }
          data.placement = placement + (variation ? "-" + variation : "");
          data.offsets.popper = _extends$1({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));
          data = runModifiers(data.instance.modifiers, data, "flip");
        }
      });
      return data;
    }
    function keepTogether(data) {
      var _data$offsets = data.offsets, popper2 = _data$offsets.popper, reference = _data$offsets.reference;
      var placement = data.placement.split("-")[0];
      var floor = Math.floor;
      var isVertical = ["top", "bottom"].indexOf(placement) !== -1;
      var side = isVertical ? "right" : "bottom";
      var opSide = isVertical ? "left" : "top";
      var measurement = isVertical ? "width" : "height";
      if (popper2[side] < floor(reference[opSide])) {
        data.offsets.popper[opSide] = floor(reference[opSide]) - popper2[measurement];
      }
      if (popper2[opSide] > floor(reference[side])) {
        data.offsets.popper[opSide] = floor(reference[side]);
      }
      return data;
    }
    function toValue(str, measurement, popperOffsets, referenceOffsets) {
      var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
      var value = +split[1];
      var unit = split[2];
      if (!value) {
        return str;
      }
      if (unit.indexOf("%") === 0) {
        var element = void 0;
        switch (unit) {
          case "%p":
            element = popperOffsets;
            break;
          case "%":
          case "%r":
          default:
            element = referenceOffsets;
        }
        var rect = getClientRect(element);
        return rect[measurement] / 100 * value;
      } else if (unit === "vh" || unit === "vw") {
        var size = void 0;
        if (unit === "vh") {
          size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        } else {
          size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        }
        return size / 100 * value;
      } else {
        return value;
      }
    }
    function parseOffset(offset2, popperOffsets, referenceOffsets, basePlacement) {
      var offsets = [0, 0];
      var useHeight = ["right", "left"].indexOf(basePlacement) !== -1;
      var fragments = offset2.split(/(\+|\-)/).map(function(frag) {
        return frag.trim();
      });
      var divider = fragments.indexOf(find$1(fragments, function(frag) {
        return frag.search(/,|\s/) !== -1;
      }));
      if (fragments[divider] && fragments[divider].indexOf(",") === -1) {
        console.warn("Offsets separated by white space(s) are deprecated, use a comma (,) instead.");
      }
      var splitRegex = /\s*,\s*|\s+/;
      var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];
      ops = ops.map(function(op, index2) {
        var measurement = (index2 === 1 ? !useHeight : useHeight) ? "height" : "width";
        var mergeWithPrevious = false;
        return op.reduce(function(a, b) {
          if (a[a.length - 1] === "" && ["+", "-"].indexOf(b) !== -1) {
            a[a.length - 1] = b;
            mergeWithPrevious = true;
            return a;
          } else if (mergeWithPrevious) {
            a[a.length - 1] += b;
            mergeWithPrevious = false;
            return a;
          } else {
            return a.concat(b);
          }
        }, []).map(function(str) {
          return toValue(str, measurement, popperOffsets, referenceOffsets);
        });
      });
      ops.forEach(function(op, index2) {
        op.forEach(function(frag, index22) {
          if (isNumeric(frag)) {
            offsets[index2] += frag * (op[index22 - 1] === "-" ? -1 : 1);
          }
        });
      });
      return offsets;
    }
    function offset(data, _ref) {
      var offset2 = _ref.offset;
      var placement = data.placement, _data$offsets = data.offsets, popper2 = _data$offsets.popper, reference = _data$offsets.reference;
      var basePlacement = placement.split("-")[0];
      var offsets = void 0;
      if (isNumeric(+offset2)) {
        offsets = [+offset2, 0];
      } else {
        offsets = parseOffset(offset2, popper2, reference, basePlacement);
      }
      if (basePlacement === "left") {
        popper2.top += offsets[0];
        popper2.left -= offsets[1];
      } else if (basePlacement === "right") {
        popper2.top += offsets[0];
        popper2.left += offsets[1];
      } else if (basePlacement === "top") {
        popper2.left += offsets[0];
        popper2.top -= offsets[1];
      } else if (basePlacement === "bottom") {
        popper2.left += offsets[0];
        popper2.top += offsets[1];
      }
      data.popper = popper2;
      return data;
    }
    function preventOverflow(data, options) {
      var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);
      if (data.instance.reference === boundariesElement) {
        boundariesElement = getOffsetParent(boundariesElement);
      }
      var transformProp = getSupportedPropertyName("transform");
      var popperStyles = data.instance.popper.style;
      var top = popperStyles.top, left = popperStyles.left, transform = popperStyles[transformProp];
      popperStyles.top = "";
      popperStyles.left = "";
      popperStyles[transformProp] = "";
      var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);
      popperStyles.top = top;
      popperStyles.left = left;
      popperStyles[transformProp] = transform;
      options.boundaries = boundaries;
      var order = options.priority;
      var popper2 = data.offsets.popper;
      var check = {
        primary: function primary(placement) {
          var value = popper2[placement];
          if (popper2[placement] < boundaries[placement] && !options.escapeWithReference) {
            value = Math.max(popper2[placement], boundaries[placement]);
          }
          return defineProperty({}, placement, value);
        },
        secondary: function secondary(placement) {
          var mainSide = placement === "right" ? "left" : "top";
          var value = popper2[mainSide];
          if (popper2[placement] > boundaries[placement] && !options.escapeWithReference) {
            value = Math.min(popper2[mainSide], boundaries[placement] - (placement === "right" ? popper2.width : popper2.height));
          }
          return defineProperty({}, mainSide, value);
        }
      };
      order.forEach(function(placement) {
        var side = ["left", "top"].indexOf(placement) !== -1 ? "primary" : "secondary";
        popper2 = _extends$1({}, popper2, check[side](placement));
      });
      data.offsets.popper = popper2;
      return data;
    }
    function shift(data) {
      var placement = data.placement;
      var basePlacement = placement.split("-")[0];
      var shiftvariation = placement.split("-")[1];
      if (shiftvariation) {
        var _data$offsets = data.offsets, reference = _data$offsets.reference, popper2 = _data$offsets.popper;
        var isVertical = ["bottom", "top"].indexOf(basePlacement) !== -1;
        var side = isVertical ? "left" : "top";
        var measurement = isVertical ? "width" : "height";
        var shiftOffsets = {
          start: defineProperty({}, side, reference[side]),
          end: defineProperty({}, side, reference[side] + reference[measurement] - popper2[measurement])
        };
        data.offsets.popper = _extends$1({}, popper2, shiftOffsets[shiftvariation]);
      }
      return data;
    }
    function hide(data) {
      if (!isModifierRequired(data.instance.modifiers, "hide", "preventOverflow")) {
        return data;
      }
      var refRect = data.offsets.reference;
      var bound = find$1(data.instance.modifiers, function(modifier) {
        return modifier.name === "preventOverflow";
      }).boundaries;
      if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
        if (data.hide === true) {
          return data;
        }
        data.hide = true;
        data.attributes["x-out-of-boundaries"] = "";
      } else {
        if (data.hide === false) {
          return data;
        }
        data.hide = false;
        data.attributes["x-out-of-boundaries"] = false;
      }
      return data;
    }
    function inner(data) {
      var placement = data.placement;
      var basePlacement = placement.split("-")[0];
      var _data$offsets = data.offsets, popper2 = _data$offsets.popper, reference = _data$offsets.reference;
      var isHoriz = ["left", "right"].indexOf(basePlacement) !== -1;
      var subtractLength = ["top", "left"].indexOf(basePlacement) === -1;
      popper2[isHoriz ? "left" : "top"] = reference[basePlacement] - (subtractLength ? popper2[isHoriz ? "width" : "height"] : 0);
      data.placement = getOppositePlacement(placement);
      data.offsets.popper = getClientRect(popper2);
      return data;
    }
    var modifiers = {
      shift: {
        order: 100,
        enabled: true,
        fn: shift
      },
      offset: {
        order: 200,
        enabled: true,
        fn: offset,
        offset: 0
      },
      preventOverflow: {
        order: 300,
        enabled: true,
        fn: preventOverflow,
        priority: ["left", "right", "top", "bottom"],
        padding: 5,
        boundariesElement: "scrollParent"
      },
      keepTogether: {
        order: 400,
        enabled: true,
        fn: keepTogether
      },
      arrow: {
        order: 500,
        enabled: true,
        fn: arrow,
        element: "[x-arrow]"
      },
      flip: {
        order: 600,
        enabled: true,
        fn: flip,
        behavior: "flip",
        padding: 5,
        boundariesElement: "viewport",
        flipVariations: false,
        flipVariationsByContent: false
      },
      inner: {
        order: 700,
        enabled: false,
        fn: inner
      },
      hide: {
        order: 800,
        enabled: true,
        fn: hide
      },
      computeStyle: {
        order: 850,
        enabled: true,
        fn: computeStyle,
        gpuAcceleration: true,
        x: "bottom",
        y: "right"
      },
      applyStyle: {
        order: 900,
        enabled: true,
        fn: applyStyle,
        onLoad: applyStyleOnLoad,
        gpuAcceleration: void 0
      }
    };
    var Defaults = {
      placement: "bottom",
      positionFixed: false,
      eventsEnabled: true,
      removeOnDestroy: false,
      onCreate: function onCreate() {
      },
      onUpdate: function onUpdate() {
      },
      modifiers
    };
    var Popper = function() {
      function Popper2(reference, popper2) {
        var _this = this;
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        classCallCheck(this, Popper2);
        this.scheduleUpdate = function() {
          return requestAnimationFrame(_this.update);
        };
        this.update = debounce(this.update.bind(this));
        this.options = _extends$1({}, Popper2.Defaults, options);
        this.state = {
          isDestroyed: false,
          isCreated: false,
          scrollParents: []
        };
        this.reference = reference && reference.jquery ? reference[0] : reference;
        this.popper = popper2 && popper2.jquery ? popper2[0] : popper2;
        this.options.modifiers = {};
        Object.keys(_extends$1({}, Popper2.Defaults.modifiers, options.modifiers)).forEach(function(name) {
          _this.options.modifiers[name] = _extends$1({}, Popper2.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
        });
        this.modifiers = Object.keys(this.options.modifiers).map(function(name) {
          return _extends$1({
            name
          }, _this.options.modifiers[name]);
        }).sort(function(a, b) {
          return a.order - b.order;
        });
        this.modifiers.forEach(function(modifierOptions) {
          if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
            modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
          }
        });
        this.update();
        var eventsEnabled = this.options.eventsEnabled;
        if (eventsEnabled) {
          this.enableEventListeners();
        }
        this.state.eventsEnabled = eventsEnabled;
      }
      createClass(Popper2, [{
        key: "update",
        value: function update$$1() {
          return update.call(this);
        }
      }, {
        key: "destroy",
        value: function destroy$$1() {
          return destroy.call(this);
        }
      }, {
        key: "enableEventListeners",
        value: function enableEventListeners$$1() {
          return enableEventListeners.call(this);
        }
      }, {
        key: "disableEventListeners",
        value: function disableEventListeners$$1() {
          return disableEventListeners.call(this);
        }
      }]);
      return Popper2;
    }();
    Popper.Utils = (typeof window !== "undefined" ? window : global).PopperUtils;
    Popper.placements = placements;
    Popper.Defaults = Defaults;
    var popper = Object.freeze({
      __proto__: null,
      default: Popper
    });
    var require$$1 = getAugmentedNamespace(popper);
    (function(module2, exports3) {
      (function(global2, factory) {
        factory(exports3, jquery$1.exports, require$$1);
      })(commonjsGlobal, function(exports4, $2, Popper2) {
        function _interopDefaultLegacy(e) {
          return e && typeof e === "object" && "default" in e ? e : {
            default: e
          };
        }
        var $__default = _interopDefaultLegacy($2);
        var Popper__default = _interopDefaultLegacy(Popper2);
        function _defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        function _createClass(Constructor, protoProps, staticProps) {
          if (protoProps)
            _defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            _defineProperties(Constructor, staticProps);
          return Constructor;
        }
        function _extends2() {
          _extends2 = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
            return target;
          };
          return _extends2.apply(this, arguments);
        }
        function _inheritsLoose(subClass, superClass) {
          subClass.prototype = Object.create(superClass.prototype);
          subClass.prototype.constructor = subClass;
          _setPrototypeOf(subClass, superClass);
        }
        function _setPrototypeOf(o, p) {
          _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o2, p2) {
            o2.__proto__ = p2;
            return o2;
          };
          return _setPrototypeOf(o, p);
        }
        var TRANSITION_END = "transitionend";
        var MAX_UID = 1e6;
        var MILLISECONDS_MULTIPLIER = 1e3;
        function toType(obj) {
          if (obj === null || typeof obj === "undefined") {
            return "" + obj;
          }
          return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
        }
        function getSpecialTransitionEndEvent() {
          return {
            bindType: TRANSITION_END,
            delegateType: TRANSITION_END,
            handle: function handle(event) {
              if ($__default["default"](event.target).is(this)) {
                return event.handleObj.handler.apply(this, arguments);
              }
              return void 0;
            }
          };
        }
        function transitionEndEmulator(duration2) {
          var _this = this;
          var called = false;
          $__default["default"](this).one(Util.TRANSITION_END, function() {
            called = true;
          });
          setTimeout(function() {
            if (!called) {
              Util.triggerTransitionEnd(_this);
            }
          }, duration2);
          return this;
        }
        function setTransitionEndSupport() {
          $__default["default"].fn.emulateTransitionEnd = transitionEndEmulator;
          $__default["default"].event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
        }
        var Util = {
          TRANSITION_END: "bsTransitionEnd",
          getUID: function getUID(prefix) {
            do {
              prefix += ~~(Math.random() * MAX_UID);
            } while (document.getElementById(prefix));
            return prefix;
          },
          getSelectorFromElement: function getSelectorFromElement(element) {
            var selector = element.getAttribute("data-target");
            if (!selector || selector === "#") {
              var hrefAttr = element.getAttribute("href");
              selector = hrefAttr && hrefAttr !== "#" ? hrefAttr.trim() : "";
            }
            try {
              return document.querySelector(selector) ? selector : null;
            } catch (_) {
              return null;
            }
          },
          getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
            if (!element) {
              return 0;
            }
            var transitionDuration = $__default["default"](element).css("transition-duration");
            var transitionDelay = $__default["default"](element).css("transition-delay");
            var floatTransitionDuration = parseFloat(transitionDuration);
            var floatTransitionDelay = parseFloat(transitionDelay);
            if (!floatTransitionDuration && !floatTransitionDelay) {
              return 0;
            }
            transitionDuration = transitionDuration.split(",")[0];
            transitionDelay = transitionDelay.split(",")[0];
            return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
          },
          reflow: function reflow(element) {
            return element.offsetHeight;
          },
          triggerTransitionEnd: function triggerTransitionEnd(element) {
            $__default["default"](element).trigger(TRANSITION_END);
          },
          supportsTransitionEnd: function supportsTransitionEnd() {
            return Boolean(TRANSITION_END);
          },
          isElement: function isElement(obj) {
            return (obj[0] || obj).nodeType;
          },
          typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
            for (var property in configTypes) {
              if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
                var expectedTypes = configTypes[property];
                var value = config[property];
                var valueType = value && Util.isElement(value) ? "element" : toType(value);
                if (!new RegExp(expectedTypes).test(valueType)) {
                  throw new Error(componentName.toUpperCase() + ": " + ('Option "' + property + '" provided type "' + valueType + '" ') + ('but expected type "' + expectedTypes + '".'));
                }
              }
            }
          },
          findShadowRoot: function findShadowRoot(element) {
            if (!document.documentElement.attachShadow) {
              return null;
            }
            if (typeof element.getRootNode === "function") {
              var root = element.getRootNode();
              return root instanceof ShadowRoot ? root : null;
            }
            if (element instanceof ShadowRoot) {
              return element;
            }
            if (!element.parentNode) {
              return null;
            }
            return Util.findShadowRoot(element.parentNode);
          },
          jQueryDetection: function jQueryDetection() {
            if (typeof $__default["default"] === "undefined") {
              throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");
            }
            var version2 = $__default["default"].fn.jquery.split(" ")[0].split(".");
            var minMajor = 1;
            var ltMajor = 2;
            var minMinor = 9;
            var minPatch = 1;
            var maxMajor = 4;
            if (version2[0] < ltMajor && version2[1] < minMinor || version2[0] === minMajor && version2[1] === minMinor && version2[2] < minPatch || version2[0] >= maxMajor) {
              throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0");
            }
          }
        };
        Util.jQueryDetection();
        setTransitionEndSupport();
        var NAME$a = "alert";
        var VERSION$a = "4.6.1";
        var DATA_KEY$a = "bs.alert";
        var EVENT_KEY$a = "." + DATA_KEY$a;
        var DATA_API_KEY$7 = ".data-api";
        var JQUERY_NO_CONFLICT$a = $__default["default"].fn[NAME$a];
        var CLASS_NAME_ALERT = "alert";
        var CLASS_NAME_FADE$5 = "fade";
        var CLASS_NAME_SHOW$7 = "show";
        var EVENT_CLOSE = "close" + EVENT_KEY$a;
        var EVENT_CLOSED = "closed" + EVENT_KEY$a;
        var EVENT_CLICK_DATA_API$6 = "click" + EVENT_KEY$a + DATA_API_KEY$7;
        var SELECTOR_DISMISS = '[data-dismiss="alert"]';
        var Alert = function() {
          function Alert2(element) {
            this._element = element;
          }
          var _proto = Alert2.prototype;
          _proto.close = function close(element) {
            var rootElement = this._element;
            if (element) {
              rootElement = this._getRootElement(element);
            }
            var customEvent = this._triggerCloseEvent(rootElement);
            if (customEvent.isDefaultPrevented()) {
              return;
            }
            this._removeElement(rootElement);
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$a);
            this._element = null;
          };
          _proto._getRootElement = function _getRootElement(element) {
            var selector = Util.getSelectorFromElement(element);
            var parent = false;
            if (selector) {
              parent = document.querySelector(selector);
            }
            if (!parent) {
              parent = $__default["default"](element).closest("." + CLASS_NAME_ALERT)[0];
            }
            return parent;
          };
          _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
            var closeEvent = $__default["default"].Event(EVENT_CLOSE);
            $__default["default"](element).trigger(closeEvent);
            return closeEvent;
          };
          _proto._removeElement = function _removeElement(element) {
            var _this = this;
            $__default["default"](element).removeClass(CLASS_NAME_SHOW$7);
            if (!$__default["default"](element).hasClass(CLASS_NAME_FADE$5)) {
              this._destroyElement(element);
              return;
            }
            var transitionDuration = Util.getTransitionDurationFromElement(element);
            $__default["default"](element).one(Util.TRANSITION_END, function(event) {
              return _this._destroyElement(element, event);
            }).emulateTransitionEnd(transitionDuration);
          };
          _proto._destroyElement = function _destroyElement(element) {
            $__default["default"](element).detach().trigger(EVENT_CLOSED).remove();
          };
          Alert2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var $element = $__default["default"](this);
              var data = $element.data(DATA_KEY$a);
              if (!data) {
                data = new Alert2(this);
                $element.data(DATA_KEY$a, data);
              }
              if (config === "close") {
                data[config](this);
              }
            });
          };
          Alert2._handleDismiss = function _handleDismiss(alertInstance) {
            return function(event) {
              if (event) {
                event.preventDefault();
              }
              alertInstance.close(this);
            };
          };
          _createClass(Alert2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$a;
            }
          }]);
          return Alert2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API$6, SELECTOR_DISMISS, Alert._handleDismiss(new Alert()));
        $__default["default"].fn[NAME$a] = Alert._jQueryInterface;
        $__default["default"].fn[NAME$a].Constructor = Alert;
        $__default["default"].fn[NAME$a].noConflict = function() {
          $__default["default"].fn[NAME$a] = JQUERY_NO_CONFLICT$a;
          return Alert._jQueryInterface;
        };
        var NAME$9 = "button";
        var VERSION$9 = "4.6.1";
        var DATA_KEY$9 = "bs.button";
        var EVENT_KEY$9 = "." + DATA_KEY$9;
        var DATA_API_KEY$6 = ".data-api";
        var JQUERY_NO_CONFLICT$9 = $__default["default"].fn[NAME$9];
        var CLASS_NAME_ACTIVE$3 = "active";
        var CLASS_NAME_BUTTON = "btn";
        var CLASS_NAME_FOCUS = "focus";
        var EVENT_CLICK_DATA_API$5 = "click" + EVENT_KEY$9 + DATA_API_KEY$6;
        var EVENT_FOCUS_BLUR_DATA_API = "focus" + EVENT_KEY$9 + DATA_API_KEY$6 + " " + ("blur" + EVENT_KEY$9 + DATA_API_KEY$6);
        var EVENT_LOAD_DATA_API$2 = "load" + EVENT_KEY$9 + DATA_API_KEY$6;
        var SELECTOR_DATA_TOGGLE_CARROT = '[data-toggle^="button"]';
        var SELECTOR_DATA_TOGGLES = '[data-toggle="buttons"]';
        var SELECTOR_DATA_TOGGLE$4 = '[data-toggle="button"]';
        var SELECTOR_DATA_TOGGLES_BUTTONS = '[data-toggle="buttons"] .btn';
        var SELECTOR_INPUT = 'input:not([type="hidden"])';
        var SELECTOR_ACTIVE$2 = ".active";
        var SELECTOR_BUTTON = ".btn";
        var Button = function() {
          function Button2(element) {
            this._element = element;
            this.shouldAvoidTriggerChange = false;
          }
          var _proto = Button2.prototype;
          _proto.toggle = function toggle() {
            var triggerChangeEvent = true;
            var addAriaPressed = true;
            var rootElement = $__default["default"](this._element).closest(SELECTOR_DATA_TOGGLES)[0];
            if (rootElement) {
              var input = this._element.querySelector(SELECTOR_INPUT);
              if (input) {
                if (input.type === "radio") {
                  if (input.checked && this._element.classList.contains(CLASS_NAME_ACTIVE$3)) {
                    triggerChangeEvent = false;
                  } else {
                    var activeElement = rootElement.querySelector(SELECTOR_ACTIVE$2);
                    if (activeElement) {
                      $__default["default"](activeElement).removeClass(CLASS_NAME_ACTIVE$3);
                    }
                  }
                }
                if (triggerChangeEvent) {
                  if (input.type === "checkbox" || input.type === "radio") {
                    input.checked = !this._element.classList.contains(CLASS_NAME_ACTIVE$3);
                  }
                  if (!this.shouldAvoidTriggerChange) {
                    $__default["default"](input).trigger("change");
                  }
                }
                input.focus();
                addAriaPressed = false;
              }
            }
            if (!(this._element.hasAttribute("disabled") || this._element.classList.contains("disabled"))) {
              if (addAriaPressed) {
                this._element.setAttribute("aria-pressed", !this._element.classList.contains(CLASS_NAME_ACTIVE$3));
              }
              if (triggerChangeEvent) {
                $__default["default"](this._element).toggleClass(CLASS_NAME_ACTIVE$3);
              }
            }
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$9);
            this._element = null;
          };
          Button2._jQueryInterface = function _jQueryInterface(config, avoidTriggerChange) {
            return this.each(function() {
              var $element = $__default["default"](this);
              var data = $element.data(DATA_KEY$9);
              if (!data) {
                data = new Button2(this);
                $element.data(DATA_KEY$9, data);
              }
              data.shouldAvoidTriggerChange = avoidTriggerChange;
              if (config === "toggle") {
                data[config]();
              }
            });
          };
          _createClass(Button2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$9;
            }
          }]);
          return Button2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API$5, SELECTOR_DATA_TOGGLE_CARROT, function(event) {
          var button = event.target;
          var initialButton = button;
          if (!$__default["default"](button).hasClass(CLASS_NAME_BUTTON)) {
            button = $__default["default"](button).closest(SELECTOR_BUTTON)[0];
          }
          if (!button || button.hasAttribute("disabled") || button.classList.contains("disabled")) {
            event.preventDefault();
          } else {
            var inputBtn = button.querySelector(SELECTOR_INPUT);
            if (inputBtn && (inputBtn.hasAttribute("disabled") || inputBtn.classList.contains("disabled"))) {
              event.preventDefault();
              return;
            }
            if (initialButton.tagName === "INPUT" || button.tagName !== "LABEL") {
              Button._jQueryInterface.call($__default["default"](button), "toggle", initialButton.tagName === "INPUT");
            }
          }
        }).on(EVENT_FOCUS_BLUR_DATA_API, SELECTOR_DATA_TOGGLE_CARROT, function(event) {
          var button = $__default["default"](event.target).closest(SELECTOR_BUTTON)[0];
          $__default["default"](button).toggleClass(CLASS_NAME_FOCUS, /^focus(in)?$/.test(event.type));
        });
        $__default["default"](window).on(EVENT_LOAD_DATA_API$2, function() {
          var buttons = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLES_BUTTONS));
          for (var i = 0, len = buttons.length; i < len; i++) {
            var button = buttons[i];
            var input = button.querySelector(SELECTOR_INPUT);
            if (input.checked || input.hasAttribute("checked")) {
              button.classList.add(CLASS_NAME_ACTIVE$3);
            } else {
              button.classList.remove(CLASS_NAME_ACTIVE$3);
            }
          }
          buttons = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE$4));
          for (var _i = 0, _len = buttons.length; _i < _len; _i++) {
            var _button = buttons[_i];
            if (_button.getAttribute("aria-pressed") === "true") {
              _button.classList.add(CLASS_NAME_ACTIVE$3);
            } else {
              _button.classList.remove(CLASS_NAME_ACTIVE$3);
            }
          }
        });
        $__default["default"].fn[NAME$9] = Button._jQueryInterface;
        $__default["default"].fn[NAME$9].Constructor = Button;
        $__default["default"].fn[NAME$9].noConflict = function() {
          $__default["default"].fn[NAME$9] = JQUERY_NO_CONFLICT$9;
          return Button._jQueryInterface;
        };
        var NAME$8 = "carousel";
        var VERSION$8 = "4.6.1";
        var DATA_KEY$8 = "bs.carousel";
        var EVENT_KEY$8 = "." + DATA_KEY$8;
        var DATA_API_KEY$5 = ".data-api";
        var JQUERY_NO_CONFLICT$8 = $__default["default"].fn[NAME$8];
        var ARROW_LEFT_KEYCODE = 37;
        var ARROW_RIGHT_KEYCODE = 39;
        var TOUCHEVENT_COMPAT_WAIT = 500;
        var SWIPE_THRESHOLD = 40;
        var CLASS_NAME_CAROUSEL = "carousel";
        var CLASS_NAME_ACTIVE$2 = "active";
        var CLASS_NAME_SLIDE = "slide";
        var CLASS_NAME_RIGHT = "carousel-item-right";
        var CLASS_NAME_LEFT = "carousel-item-left";
        var CLASS_NAME_NEXT = "carousel-item-next";
        var CLASS_NAME_PREV = "carousel-item-prev";
        var CLASS_NAME_POINTER_EVENT = "pointer-event";
        var DIRECTION_NEXT = "next";
        var DIRECTION_PREV = "prev";
        var DIRECTION_LEFT = "left";
        var DIRECTION_RIGHT = "right";
        var EVENT_SLIDE = "slide" + EVENT_KEY$8;
        var EVENT_SLID = "slid" + EVENT_KEY$8;
        var EVENT_KEYDOWN = "keydown" + EVENT_KEY$8;
        var EVENT_MOUSEENTER = "mouseenter" + EVENT_KEY$8;
        var EVENT_MOUSELEAVE = "mouseleave" + EVENT_KEY$8;
        var EVENT_TOUCHSTART = "touchstart" + EVENT_KEY$8;
        var EVENT_TOUCHMOVE = "touchmove" + EVENT_KEY$8;
        var EVENT_TOUCHEND = "touchend" + EVENT_KEY$8;
        var EVENT_POINTERDOWN = "pointerdown" + EVENT_KEY$8;
        var EVENT_POINTERUP = "pointerup" + EVENT_KEY$8;
        var EVENT_DRAG_START = "dragstart" + EVENT_KEY$8;
        var EVENT_LOAD_DATA_API$1 = "load" + EVENT_KEY$8 + DATA_API_KEY$5;
        var EVENT_CLICK_DATA_API$4 = "click" + EVENT_KEY$8 + DATA_API_KEY$5;
        var SELECTOR_ACTIVE$1 = ".active";
        var SELECTOR_ACTIVE_ITEM = ".active.carousel-item";
        var SELECTOR_ITEM = ".carousel-item";
        var SELECTOR_ITEM_IMG = ".carousel-item img";
        var SELECTOR_NEXT_PREV = ".carousel-item-next, .carousel-item-prev";
        var SELECTOR_INDICATORS = ".carousel-indicators";
        var SELECTOR_DATA_SLIDE = "[data-slide], [data-slide-to]";
        var SELECTOR_DATA_RIDE = '[data-ride="carousel"]';
        var Default$7 = {
          interval: 5e3,
          keyboard: true,
          slide: false,
          pause: "hover",
          wrap: true,
          touch: true
        };
        var DefaultType$7 = {
          interval: "(number|boolean)",
          keyboard: "boolean",
          slide: "(boolean|string)",
          pause: "(string|boolean)",
          wrap: "boolean",
          touch: "boolean"
        };
        var PointerType = {
          TOUCH: "touch",
          PEN: "pen"
        };
        var Carousel = function() {
          function Carousel2(element, config) {
            this._items = null;
            this._interval = null;
            this._activeElement = null;
            this._isPaused = false;
            this._isSliding = false;
            this.touchTimeout = null;
            this.touchStartX = 0;
            this.touchDeltaX = 0;
            this._config = this._getConfig(config);
            this._element = element;
            this._indicatorsElement = this._element.querySelector(SELECTOR_INDICATORS);
            this._touchSupported = "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
            this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent);
            this._addEventListeners();
          }
          var _proto = Carousel2.prototype;
          _proto.next = function next() {
            if (!this._isSliding) {
              this._slide(DIRECTION_NEXT);
            }
          };
          _proto.nextWhenVisible = function nextWhenVisible() {
            var $element = $__default["default"](this._element);
            if (!document.hidden && $element.is(":visible") && $element.css("visibility") !== "hidden") {
              this.next();
            }
          };
          _proto.prev = function prev() {
            if (!this._isSliding) {
              this._slide(DIRECTION_PREV);
            }
          };
          _proto.pause = function pause(event) {
            if (!event) {
              this._isPaused = true;
            }
            if (this._element.querySelector(SELECTOR_NEXT_PREV)) {
              Util.triggerTransitionEnd(this._element);
              this.cycle(true);
            }
            clearInterval(this._interval);
            this._interval = null;
          };
          _proto.cycle = function cycle(event) {
            if (!event) {
              this._isPaused = false;
            }
            if (this._interval) {
              clearInterval(this._interval);
              this._interval = null;
            }
            if (this._config.interval && !this._isPaused) {
              this._updateInterval();
              this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
            }
          };
          _proto.to = function to(index2) {
            var _this = this;
            this._activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);
            var activeIndex = this._getItemIndex(this._activeElement);
            if (index2 > this._items.length - 1 || index2 < 0) {
              return;
            }
            if (this._isSliding) {
              $__default["default"](this._element).one(EVENT_SLID, function() {
                return _this.to(index2);
              });
              return;
            }
            if (activeIndex === index2) {
              this.pause();
              this.cycle();
              return;
            }
            var direction = index2 > activeIndex ? DIRECTION_NEXT : DIRECTION_PREV;
            this._slide(direction, this._items[index2]);
          };
          _proto.dispose = function dispose() {
            $__default["default"](this._element).off(EVENT_KEY$8);
            $__default["default"].removeData(this._element, DATA_KEY$8);
            this._items = null;
            this._config = null;
            this._element = null;
            this._interval = null;
            this._isPaused = null;
            this._isSliding = null;
            this._activeElement = null;
            this._indicatorsElement = null;
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, Default$7, config);
            Util.typeCheckConfig(NAME$8, config, DefaultType$7);
            return config;
          };
          _proto._handleSwipe = function _handleSwipe() {
            var absDeltax = Math.abs(this.touchDeltaX);
            if (absDeltax <= SWIPE_THRESHOLD) {
              return;
            }
            var direction = absDeltax / this.touchDeltaX;
            this.touchDeltaX = 0;
            if (direction > 0) {
              this.prev();
            }
            if (direction < 0) {
              this.next();
            }
          };
          _proto._addEventListeners = function _addEventListeners() {
            var _this2 = this;
            if (this._config.keyboard) {
              $__default["default"](this._element).on(EVENT_KEYDOWN, function(event) {
                return _this2._keydown(event);
              });
            }
            if (this._config.pause === "hover") {
              $__default["default"](this._element).on(EVENT_MOUSEENTER, function(event) {
                return _this2.pause(event);
              }).on(EVENT_MOUSELEAVE, function(event) {
                return _this2.cycle(event);
              });
            }
            if (this._config.touch) {
              this._addTouchEventListeners();
            }
          };
          _proto._addTouchEventListeners = function _addTouchEventListeners() {
            var _this3 = this;
            if (!this._touchSupported) {
              return;
            }
            var start2 = function start3(event) {
              if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
                _this3.touchStartX = event.originalEvent.clientX;
              } else if (!_this3._pointerEvent) {
                _this3.touchStartX = event.originalEvent.touches[0].clientX;
              }
            };
            var move = function move2(event) {
              _this3.touchDeltaX = event.originalEvent.touches && event.originalEvent.touches.length > 1 ? 0 : event.originalEvent.touches[0].clientX - _this3.touchStartX;
            };
            var end = function end2(event) {
              if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
                _this3.touchDeltaX = event.originalEvent.clientX - _this3.touchStartX;
              }
              _this3._handleSwipe();
              if (_this3._config.pause === "hover") {
                _this3.pause();
                if (_this3.touchTimeout) {
                  clearTimeout(_this3.touchTimeout);
                }
                _this3.touchTimeout = setTimeout(function(event2) {
                  return _this3.cycle(event2);
                }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
              }
            };
            $__default["default"](this._element.querySelectorAll(SELECTOR_ITEM_IMG)).on(EVENT_DRAG_START, function(e) {
              return e.preventDefault();
            });
            if (this._pointerEvent) {
              $__default["default"](this._element).on(EVENT_POINTERDOWN, function(event) {
                return start2(event);
              });
              $__default["default"](this._element).on(EVENT_POINTERUP, function(event) {
                return end(event);
              });
              this._element.classList.add(CLASS_NAME_POINTER_EVENT);
            } else {
              $__default["default"](this._element).on(EVENT_TOUCHSTART, function(event) {
                return start2(event);
              });
              $__default["default"](this._element).on(EVENT_TOUCHMOVE, function(event) {
                return move(event);
              });
              $__default["default"](this._element).on(EVENT_TOUCHEND, function(event) {
                return end(event);
              });
            }
          };
          _proto._keydown = function _keydown(event) {
            if (/input|textarea/i.test(event.target.tagName)) {
              return;
            }
            switch (event.which) {
              case ARROW_LEFT_KEYCODE:
                event.preventDefault();
                this.prev();
                break;
              case ARROW_RIGHT_KEYCODE:
                event.preventDefault();
                this.next();
                break;
            }
          };
          _proto._getItemIndex = function _getItemIndex(element) {
            this._items = element && element.parentNode ? [].slice.call(element.parentNode.querySelectorAll(SELECTOR_ITEM)) : [];
            return this._items.indexOf(element);
          };
          _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
            var isNextDirection = direction === DIRECTION_NEXT;
            var isPrevDirection = direction === DIRECTION_PREV;
            var activeIndex = this._getItemIndex(activeElement);
            var lastItemIndex = this._items.length - 1;
            var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;
            if (isGoingToWrap && !this._config.wrap) {
              return activeElement;
            }
            var delta = direction === DIRECTION_PREV ? -1 : 1;
            var itemIndex = (activeIndex + delta) % this._items.length;
            return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
          };
          _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
            var targetIndex = this._getItemIndex(relatedTarget);
            var fromIndex = this._getItemIndex(this._element.querySelector(SELECTOR_ACTIVE_ITEM));
            var slideEvent = $__default["default"].Event(EVENT_SLIDE, {
              relatedTarget,
              direction: eventDirectionName,
              from: fromIndex,
              to: targetIndex
            });
            $__default["default"](this._element).trigger(slideEvent);
            return slideEvent;
          };
          _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
            if (this._indicatorsElement) {
              var indicators = [].slice.call(this._indicatorsElement.querySelectorAll(SELECTOR_ACTIVE$1));
              $__default["default"](indicators).removeClass(CLASS_NAME_ACTIVE$2);
              var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];
              if (nextIndicator) {
                $__default["default"](nextIndicator).addClass(CLASS_NAME_ACTIVE$2);
              }
            }
          };
          _proto._updateInterval = function _updateInterval() {
            var element = this._activeElement || this._element.querySelector(SELECTOR_ACTIVE_ITEM);
            if (!element) {
              return;
            }
            var elementInterval = parseInt(element.getAttribute("data-interval"), 10);
            if (elementInterval) {
              this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
              this._config.interval = elementInterval;
            } else {
              this._config.interval = this._config.defaultInterval || this._config.interval;
            }
          };
          _proto._slide = function _slide(direction, element) {
            var _this4 = this;
            var activeElement = this._element.querySelector(SELECTOR_ACTIVE_ITEM);
            var activeElementIndex = this._getItemIndex(activeElement);
            var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);
            var nextElementIndex = this._getItemIndex(nextElement);
            var isCycling = Boolean(this._interval);
            var directionalClassName;
            var orderClassName;
            var eventDirectionName;
            if (direction === DIRECTION_NEXT) {
              directionalClassName = CLASS_NAME_LEFT;
              orderClassName = CLASS_NAME_NEXT;
              eventDirectionName = DIRECTION_LEFT;
            } else {
              directionalClassName = CLASS_NAME_RIGHT;
              orderClassName = CLASS_NAME_PREV;
              eventDirectionName = DIRECTION_RIGHT;
            }
            if (nextElement && $__default["default"](nextElement).hasClass(CLASS_NAME_ACTIVE$2)) {
              this._isSliding = false;
              return;
            }
            var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);
            if (slideEvent.isDefaultPrevented()) {
              return;
            }
            if (!activeElement || !nextElement) {
              return;
            }
            this._isSliding = true;
            if (isCycling) {
              this.pause();
            }
            this._setActiveIndicatorElement(nextElement);
            this._activeElement = nextElement;
            var slidEvent = $__default["default"].Event(EVENT_SLID, {
              relatedTarget: nextElement,
              direction: eventDirectionName,
              from: activeElementIndex,
              to: nextElementIndex
            });
            if ($__default["default"](this._element).hasClass(CLASS_NAME_SLIDE)) {
              $__default["default"](nextElement).addClass(orderClassName);
              Util.reflow(nextElement);
              $__default["default"](activeElement).addClass(directionalClassName);
              $__default["default"](nextElement).addClass(directionalClassName);
              var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
              $__default["default"](activeElement).one(Util.TRANSITION_END, function() {
                $__default["default"](nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(CLASS_NAME_ACTIVE$2);
                $__default["default"](activeElement).removeClass(CLASS_NAME_ACTIVE$2 + " " + orderClassName + " " + directionalClassName);
                _this4._isSliding = false;
                setTimeout(function() {
                  return $__default["default"](_this4._element).trigger(slidEvent);
                }, 0);
              }).emulateTransitionEnd(transitionDuration);
            } else {
              $__default["default"](activeElement).removeClass(CLASS_NAME_ACTIVE$2);
              $__default["default"](nextElement).addClass(CLASS_NAME_ACTIVE$2);
              this._isSliding = false;
              $__default["default"](this._element).trigger(slidEvent);
            }
            if (isCycling) {
              this.cycle();
            }
          };
          Carousel2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var data = $__default["default"](this).data(DATA_KEY$8);
              var _config = _extends2({}, Default$7, $__default["default"](this).data());
              if (typeof config === "object") {
                _config = _extends2({}, _config, config);
              }
              var action = typeof config === "string" ? config : _config.slide;
              if (!data) {
                data = new Carousel2(this, _config);
                $__default["default"](this).data(DATA_KEY$8, data);
              }
              if (typeof config === "number") {
                data.to(config);
              } else if (typeof action === "string") {
                if (typeof data[action] === "undefined") {
                  throw new TypeError('No method named "' + action + '"');
                }
                data[action]();
              } else if (_config.interval && _config.ride) {
                data.pause();
                data.cycle();
              }
            });
          };
          Carousel2._dataApiClickHandler = function _dataApiClickHandler(event) {
            var selector = Util.getSelectorFromElement(this);
            if (!selector) {
              return;
            }
            var target = $__default["default"](selector)[0];
            if (!target || !$__default["default"](target).hasClass(CLASS_NAME_CAROUSEL)) {
              return;
            }
            var config = _extends2({}, $__default["default"](target).data(), $__default["default"](this).data());
            var slideIndex = this.getAttribute("data-slide-to");
            if (slideIndex) {
              config.interval = false;
            }
            Carousel2._jQueryInterface.call($__default["default"](target), config);
            if (slideIndex) {
              $__default["default"](target).data(DATA_KEY$8).to(slideIndex);
            }
            event.preventDefault();
          };
          _createClass(Carousel2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$8;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$7;
            }
          }]);
          return Carousel2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API$4, SELECTOR_DATA_SLIDE, Carousel._dataApiClickHandler);
        $__default["default"](window).on(EVENT_LOAD_DATA_API$1, function() {
          var carousels = [].slice.call(document.querySelectorAll(SELECTOR_DATA_RIDE));
          for (var i = 0, len = carousels.length; i < len; i++) {
            var $carousel = $__default["default"](carousels[i]);
            Carousel._jQueryInterface.call($carousel, $carousel.data());
          }
        });
        $__default["default"].fn[NAME$8] = Carousel._jQueryInterface;
        $__default["default"].fn[NAME$8].Constructor = Carousel;
        $__default["default"].fn[NAME$8].noConflict = function() {
          $__default["default"].fn[NAME$8] = JQUERY_NO_CONFLICT$8;
          return Carousel._jQueryInterface;
        };
        var NAME$7 = "collapse";
        var VERSION$7 = "4.6.1";
        var DATA_KEY$7 = "bs.collapse";
        var EVENT_KEY$7 = "." + DATA_KEY$7;
        var DATA_API_KEY$4 = ".data-api";
        var JQUERY_NO_CONFLICT$7 = $__default["default"].fn[NAME$7];
        var CLASS_NAME_SHOW$6 = "show";
        var CLASS_NAME_COLLAPSE = "collapse";
        var CLASS_NAME_COLLAPSING = "collapsing";
        var CLASS_NAME_COLLAPSED = "collapsed";
        var DIMENSION_WIDTH = "width";
        var DIMENSION_HEIGHT = "height";
        var EVENT_SHOW$4 = "show" + EVENT_KEY$7;
        var EVENT_SHOWN$4 = "shown" + EVENT_KEY$7;
        var EVENT_HIDE$4 = "hide" + EVENT_KEY$7;
        var EVENT_HIDDEN$4 = "hidden" + EVENT_KEY$7;
        var EVENT_CLICK_DATA_API$3 = "click" + EVENT_KEY$7 + DATA_API_KEY$4;
        var SELECTOR_ACTIVES = ".show, .collapsing";
        var SELECTOR_DATA_TOGGLE$3 = '[data-toggle="collapse"]';
        var Default$6 = {
          toggle: true,
          parent: ""
        };
        var DefaultType$6 = {
          toggle: "boolean",
          parent: "(string|element)"
        };
        var Collapse = function() {
          function Collapse2(element, config) {
            this._isTransitioning = false;
            this._element = element;
            this._config = this._getConfig(config);
            this._triggerArray = [].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#' + element.id + '"],' + ('[data-toggle="collapse"][data-target="#' + element.id + '"]')));
            var toggleList = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE$3));
            for (var i = 0, len = toggleList.length; i < len; i++) {
              var elem = toggleList[i];
              var selector = Util.getSelectorFromElement(elem);
              var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function(foundElem) {
                return foundElem === element;
              });
              if (selector !== null && filterElement.length > 0) {
                this._selector = selector;
                this._triggerArray.push(elem);
              }
            }
            this._parent = this._config.parent ? this._getParent() : null;
            if (!this._config.parent) {
              this._addAriaAndCollapsedClass(this._element, this._triggerArray);
            }
            if (this._config.toggle) {
              this.toggle();
            }
          }
          var _proto = Collapse2.prototype;
          _proto.toggle = function toggle() {
            if ($__default["default"](this._element).hasClass(CLASS_NAME_SHOW$6)) {
              this.hide();
            } else {
              this.show();
            }
          };
          _proto.show = function show() {
            var _this = this;
            if (this._isTransitioning || $__default["default"](this._element).hasClass(CLASS_NAME_SHOW$6)) {
              return;
            }
            var actives;
            var activesData;
            if (this._parent) {
              actives = [].slice.call(this._parent.querySelectorAll(SELECTOR_ACTIVES)).filter(function(elem) {
                if (typeof _this._config.parent === "string") {
                  return elem.getAttribute("data-parent") === _this._config.parent;
                }
                return elem.classList.contains(CLASS_NAME_COLLAPSE);
              });
              if (actives.length === 0) {
                actives = null;
              }
            }
            if (actives) {
              activesData = $__default["default"](actives).not(this._selector).data(DATA_KEY$7);
              if (activesData && activesData._isTransitioning) {
                return;
              }
            }
            var startEvent = $__default["default"].Event(EVENT_SHOW$4);
            $__default["default"](this._element).trigger(startEvent);
            if (startEvent.isDefaultPrevented()) {
              return;
            }
            if (actives) {
              Collapse2._jQueryInterface.call($__default["default"](actives).not(this._selector), "hide");
              if (!activesData) {
                $__default["default"](actives).data(DATA_KEY$7, null);
              }
            }
            var dimension = this._getDimension();
            $__default["default"](this._element).removeClass(CLASS_NAME_COLLAPSE).addClass(CLASS_NAME_COLLAPSING);
            this._element.style[dimension] = 0;
            if (this._triggerArray.length) {
              $__default["default"](this._triggerArray).removeClass(CLASS_NAME_COLLAPSED).attr("aria-expanded", true);
            }
            this.setTransitioning(true);
            var complete = function complete2() {
              $__default["default"](_this._element).removeClass(CLASS_NAME_COLLAPSING).addClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$6);
              _this._element.style[dimension] = "";
              _this.setTransitioning(false);
              $__default["default"](_this._element).trigger(EVENT_SHOWN$4);
            };
            var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
            var scrollSize = "scroll" + capitalizedDimension;
            var transitionDuration = Util.getTransitionDurationFromElement(this._element);
            $__default["default"](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            this._element.style[dimension] = this._element[scrollSize] + "px";
          };
          _proto.hide = function hide2() {
            var _this2 = this;
            if (this._isTransitioning || !$__default["default"](this._element).hasClass(CLASS_NAME_SHOW$6)) {
              return;
            }
            var startEvent = $__default["default"].Event(EVENT_HIDE$4);
            $__default["default"](this._element).trigger(startEvent);
            if (startEvent.isDefaultPrevented()) {
              return;
            }
            var dimension = this._getDimension();
            this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
            Util.reflow(this._element);
            $__default["default"](this._element).addClass(CLASS_NAME_COLLAPSING).removeClass(CLASS_NAME_COLLAPSE + " " + CLASS_NAME_SHOW$6);
            var triggerArrayLength = this._triggerArray.length;
            if (triggerArrayLength > 0) {
              for (var i = 0; i < triggerArrayLength; i++) {
                var trigger = this._triggerArray[i];
                var selector = Util.getSelectorFromElement(trigger);
                if (selector !== null) {
                  var $elem = $__default["default"]([].slice.call(document.querySelectorAll(selector)));
                  if (!$elem.hasClass(CLASS_NAME_SHOW$6)) {
                    $__default["default"](trigger).addClass(CLASS_NAME_COLLAPSED).attr("aria-expanded", false);
                  }
                }
              }
            }
            this.setTransitioning(true);
            var complete = function complete2() {
              _this2.setTransitioning(false);
              $__default["default"](_this2._element).removeClass(CLASS_NAME_COLLAPSING).addClass(CLASS_NAME_COLLAPSE).trigger(EVENT_HIDDEN$4);
            };
            this._element.style[dimension] = "";
            var transitionDuration = Util.getTransitionDurationFromElement(this._element);
            $__default["default"](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
          };
          _proto.setTransitioning = function setTransitioning(isTransitioning) {
            this._isTransitioning = isTransitioning;
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$7);
            this._config = null;
            this._parent = null;
            this._element = null;
            this._triggerArray = null;
            this._isTransitioning = null;
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, Default$6, config);
            config.toggle = Boolean(config.toggle);
            Util.typeCheckConfig(NAME$7, config, DefaultType$6);
            return config;
          };
          _proto._getDimension = function _getDimension() {
            var hasWidth = $__default["default"](this._element).hasClass(DIMENSION_WIDTH);
            return hasWidth ? DIMENSION_WIDTH : DIMENSION_HEIGHT;
          };
          _proto._getParent = function _getParent() {
            var _this3 = this;
            var parent;
            if (Util.isElement(this._config.parent)) {
              parent = this._config.parent;
              if (typeof this._config.parent.jquery !== "undefined") {
                parent = this._config.parent[0];
              }
            } else {
              parent = document.querySelector(this._config.parent);
            }
            var selector = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
            var children = [].slice.call(parent.querySelectorAll(selector));
            $__default["default"](children).each(function(i, element) {
              _this3._addAriaAndCollapsedClass(Collapse2._getTargetFromElement(element), [element]);
            });
            return parent;
          };
          _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
            var isOpen = $__default["default"](element).hasClass(CLASS_NAME_SHOW$6);
            if (triggerArray.length) {
              $__default["default"](triggerArray).toggleClass(CLASS_NAME_COLLAPSED, !isOpen).attr("aria-expanded", isOpen);
            }
          };
          Collapse2._getTargetFromElement = function _getTargetFromElement(element) {
            var selector = Util.getSelectorFromElement(element);
            return selector ? document.querySelector(selector) : null;
          };
          Collapse2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var $element = $__default["default"](this);
              var data = $element.data(DATA_KEY$7);
              var _config = _extends2({}, Default$6, $element.data(), typeof config === "object" && config ? config : {});
              if (!data && _config.toggle && typeof config === "string" && /show|hide/.test(config)) {
                _config.toggle = false;
              }
              if (!data) {
                data = new Collapse2(this, _config);
                $element.data(DATA_KEY$7, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          _createClass(Collapse2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$7;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$6;
            }
          }]);
          return Collapse2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
          if (event.currentTarget.tagName === "A") {
            event.preventDefault();
          }
          var $trigger = $__default["default"](this);
          var selector = Util.getSelectorFromElement(this);
          var selectors = [].slice.call(document.querySelectorAll(selector));
          $__default["default"](selectors).each(function() {
            var $target = $__default["default"](this);
            var data = $target.data(DATA_KEY$7);
            var config = data ? "toggle" : $trigger.data();
            Collapse._jQueryInterface.call($target, config);
          });
        });
        $__default["default"].fn[NAME$7] = Collapse._jQueryInterface;
        $__default["default"].fn[NAME$7].Constructor = Collapse;
        $__default["default"].fn[NAME$7].noConflict = function() {
          $__default["default"].fn[NAME$7] = JQUERY_NO_CONFLICT$7;
          return Collapse._jQueryInterface;
        };
        var NAME$6 = "dropdown";
        var VERSION$6 = "4.6.1";
        var DATA_KEY$6 = "bs.dropdown";
        var EVENT_KEY$6 = "." + DATA_KEY$6;
        var DATA_API_KEY$3 = ".data-api";
        var JQUERY_NO_CONFLICT$6 = $__default["default"].fn[NAME$6];
        var ESCAPE_KEYCODE$1 = 27;
        var SPACE_KEYCODE = 32;
        var TAB_KEYCODE = 9;
        var ARROW_UP_KEYCODE = 38;
        var ARROW_DOWN_KEYCODE = 40;
        var RIGHT_MOUSE_BUTTON_WHICH = 3;
        var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE$1);
        var CLASS_NAME_DISABLED$1 = "disabled";
        var CLASS_NAME_SHOW$5 = "show";
        var CLASS_NAME_DROPUP = "dropup";
        var CLASS_NAME_DROPRIGHT = "dropright";
        var CLASS_NAME_DROPLEFT = "dropleft";
        var CLASS_NAME_MENURIGHT = "dropdown-menu-right";
        var CLASS_NAME_POSITION_STATIC = "position-static";
        var EVENT_HIDE$3 = "hide" + EVENT_KEY$6;
        var EVENT_HIDDEN$3 = "hidden" + EVENT_KEY$6;
        var EVENT_SHOW$3 = "show" + EVENT_KEY$6;
        var EVENT_SHOWN$3 = "shown" + EVENT_KEY$6;
        var EVENT_CLICK = "click" + EVENT_KEY$6;
        var EVENT_CLICK_DATA_API$2 = "click" + EVENT_KEY$6 + DATA_API_KEY$3;
        var EVENT_KEYDOWN_DATA_API = "keydown" + EVENT_KEY$6 + DATA_API_KEY$3;
        var EVENT_KEYUP_DATA_API = "keyup" + EVENT_KEY$6 + DATA_API_KEY$3;
        var SELECTOR_DATA_TOGGLE$2 = '[data-toggle="dropdown"]';
        var SELECTOR_FORM_CHILD = ".dropdown form";
        var SELECTOR_MENU = ".dropdown-menu";
        var SELECTOR_NAVBAR_NAV = ".navbar-nav";
        var SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
        var PLACEMENT_TOP = "top-start";
        var PLACEMENT_TOPEND = "top-end";
        var PLACEMENT_BOTTOM = "bottom-start";
        var PLACEMENT_BOTTOMEND = "bottom-end";
        var PLACEMENT_RIGHT = "right-start";
        var PLACEMENT_LEFT = "left-start";
        var Default$5 = {
          offset: 0,
          flip: true,
          boundary: "scrollParent",
          reference: "toggle",
          display: "dynamic",
          popperConfig: null
        };
        var DefaultType$5 = {
          offset: "(number|string|function)",
          flip: "boolean",
          boundary: "(string|element)",
          reference: "(string|element)",
          display: "string",
          popperConfig: "(null|object)"
        };
        var Dropdown = function() {
          function Dropdown2(element, config) {
            this._element = element;
            this._popper = null;
            this._config = this._getConfig(config);
            this._menu = this._getMenuElement();
            this._inNavbar = this._detectNavbar();
            this._addEventListeners();
          }
          var _proto = Dropdown2.prototype;
          _proto.toggle = function toggle() {
            if (this._element.disabled || $__default["default"](this._element).hasClass(CLASS_NAME_DISABLED$1)) {
              return;
            }
            var isActive = $__default["default"](this._menu).hasClass(CLASS_NAME_SHOW$5);
            Dropdown2._clearMenus();
            if (isActive) {
              return;
            }
            this.show(true);
          };
          _proto.show = function show(usePopper) {
            if (usePopper === void 0) {
              usePopper = false;
            }
            if (this._element.disabled || $__default["default"](this._element).hasClass(CLASS_NAME_DISABLED$1) || $__default["default"](this._menu).hasClass(CLASS_NAME_SHOW$5)) {
              return;
            }
            var relatedTarget = {
              relatedTarget: this._element
            };
            var showEvent = $__default["default"].Event(EVENT_SHOW$3, relatedTarget);
            var parent = Dropdown2._getParentFromElement(this._element);
            $__default["default"](parent).trigger(showEvent);
            if (showEvent.isDefaultPrevented()) {
              return;
            }
            if (!this._inNavbar && usePopper) {
              if (typeof Popper__default["default"] === "undefined") {
                throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");
              }
              var referenceElement = this._element;
              if (this._config.reference === "parent") {
                referenceElement = parent;
              } else if (Util.isElement(this._config.reference)) {
                referenceElement = this._config.reference;
                if (typeof this._config.reference.jquery !== "undefined") {
                  referenceElement = this._config.reference[0];
                }
              }
              if (this._config.boundary !== "scrollParent") {
                $__default["default"](parent).addClass(CLASS_NAME_POSITION_STATIC);
              }
              this._popper = new Popper__default["default"](referenceElement, this._menu, this._getPopperConfig());
            }
            if ("ontouchstart" in document.documentElement && $__default["default"](parent).closest(SELECTOR_NAVBAR_NAV).length === 0) {
              $__default["default"](document.body).children().on("mouseover", null, $__default["default"].noop);
            }
            this._element.focus();
            this._element.setAttribute("aria-expanded", true);
            $__default["default"](this._menu).toggleClass(CLASS_NAME_SHOW$5);
            $__default["default"](parent).toggleClass(CLASS_NAME_SHOW$5).trigger($__default["default"].Event(EVENT_SHOWN$3, relatedTarget));
          };
          _proto.hide = function hide2() {
            if (this._element.disabled || $__default["default"](this._element).hasClass(CLASS_NAME_DISABLED$1) || !$__default["default"](this._menu).hasClass(CLASS_NAME_SHOW$5)) {
              return;
            }
            var relatedTarget = {
              relatedTarget: this._element
            };
            var hideEvent = $__default["default"].Event(EVENT_HIDE$3, relatedTarget);
            var parent = Dropdown2._getParentFromElement(this._element);
            $__default["default"](parent).trigger(hideEvent);
            if (hideEvent.isDefaultPrevented()) {
              return;
            }
            if (this._popper) {
              this._popper.destroy();
            }
            $__default["default"](this._menu).toggleClass(CLASS_NAME_SHOW$5);
            $__default["default"](parent).toggleClass(CLASS_NAME_SHOW$5).trigger($__default["default"].Event(EVENT_HIDDEN$3, relatedTarget));
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$6);
            $__default["default"](this._element).off(EVENT_KEY$6);
            this._element = null;
            this._menu = null;
            if (this._popper !== null) {
              this._popper.destroy();
              this._popper = null;
            }
          };
          _proto.update = function update2() {
            this._inNavbar = this._detectNavbar();
            if (this._popper !== null) {
              this._popper.scheduleUpdate();
            }
          };
          _proto._addEventListeners = function _addEventListeners() {
            var _this = this;
            $__default["default"](this._element).on(EVENT_CLICK, function(event) {
              event.preventDefault();
              event.stopPropagation();
              _this.toggle();
            });
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, this.constructor.Default, $__default["default"](this._element).data(), config);
            Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);
            return config;
          };
          _proto._getMenuElement = function _getMenuElement() {
            if (!this._menu) {
              var parent = Dropdown2._getParentFromElement(this._element);
              if (parent) {
                this._menu = parent.querySelector(SELECTOR_MENU);
              }
            }
            return this._menu;
          };
          _proto._getPlacement = function _getPlacement() {
            var $parentDropdown = $__default["default"](this._element.parentNode);
            var placement = PLACEMENT_BOTTOM;
            if ($parentDropdown.hasClass(CLASS_NAME_DROPUP)) {
              placement = $__default["default"](this._menu).hasClass(CLASS_NAME_MENURIGHT) ? PLACEMENT_TOPEND : PLACEMENT_TOP;
            } else if ($parentDropdown.hasClass(CLASS_NAME_DROPRIGHT)) {
              placement = PLACEMENT_RIGHT;
            } else if ($parentDropdown.hasClass(CLASS_NAME_DROPLEFT)) {
              placement = PLACEMENT_LEFT;
            } else if ($__default["default"](this._menu).hasClass(CLASS_NAME_MENURIGHT)) {
              placement = PLACEMENT_BOTTOMEND;
            }
            return placement;
          };
          _proto._detectNavbar = function _detectNavbar() {
            return $__default["default"](this._element).closest(".navbar").length > 0;
          };
          _proto._getOffset = function _getOffset() {
            var _this2 = this;
            var offset2 = {};
            if (typeof this._config.offset === "function") {
              offset2.fn = function(data) {
                data.offsets = _extends2({}, data.offsets, _this2._config.offset(data.offsets, _this2._element));
                return data;
              };
            } else {
              offset2.offset = this._config.offset;
            }
            return offset2;
          };
          _proto._getPopperConfig = function _getPopperConfig() {
            var popperConfig = {
              placement: this._getPlacement(),
              modifiers: {
                offset: this._getOffset(),
                flip: {
                  enabled: this._config.flip
                },
                preventOverflow: {
                  boundariesElement: this._config.boundary
                }
              }
            };
            if (this._config.display === "static") {
              popperConfig.modifiers.applyStyle = {
                enabled: false
              };
            }
            return _extends2({}, popperConfig, this._config.popperConfig);
          };
          Dropdown2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var data = $__default["default"](this).data(DATA_KEY$6);
              var _config = typeof config === "object" ? config : null;
              if (!data) {
                data = new Dropdown2(this, _config);
                $__default["default"](this).data(DATA_KEY$6, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          Dropdown2._clearMenus = function _clearMenus(event) {
            if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === "keyup" && event.which !== TAB_KEYCODE)) {
              return;
            }
            var toggles = [].slice.call(document.querySelectorAll(SELECTOR_DATA_TOGGLE$2));
            for (var i = 0, len = toggles.length; i < len; i++) {
              var parent = Dropdown2._getParentFromElement(toggles[i]);
              var context = $__default["default"](toggles[i]).data(DATA_KEY$6);
              var relatedTarget = {
                relatedTarget: toggles[i]
              };
              if (event && event.type === "click") {
                relatedTarget.clickEvent = event;
              }
              if (!context) {
                continue;
              }
              var dropdownMenu = context._menu;
              if (!$__default["default"](parent).hasClass(CLASS_NAME_SHOW$5)) {
                continue;
              }
              if (event && (event.type === "click" && /input|textarea/i.test(event.target.tagName) || event.type === "keyup" && event.which === TAB_KEYCODE) && $__default["default"].contains(parent, event.target)) {
                continue;
              }
              var hideEvent = $__default["default"].Event(EVENT_HIDE$3, relatedTarget);
              $__default["default"](parent).trigger(hideEvent);
              if (hideEvent.isDefaultPrevented()) {
                continue;
              }
              if ("ontouchstart" in document.documentElement) {
                $__default["default"](document.body).children().off("mouseover", null, $__default["default"].noop);
              }
              toggles[i].setAttribute("aria-expanded", "false");
              if (context._popper) {
                context._popper.destroy();
              }
              $__default["default"](dropdownMenu).removeClass(CLASS_NAME_SHOW$5);
              $__default["default"](parent).removeClass(CLASS_NAME_SHOW$5).trigger($__default["default"].Event(EVENT_HIDDEN$3, relatedTarget));
            }
          };
          Dropdown2._getParentFromElement = function _getParentFromElement(element) {
            var parent;
            var selector = Util.getSelectorFromElement(element);
            if (selector) {
              parent = document.querySelector(selector);
            }
            return parent || element.parentNode;
          };
          Dropdown2._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
            if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE$1 && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $__default["default"](event.target).closest(SELECTOR_MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
              return;
            }
            if (this.disabled || $__default["default"](this).hasClass(CLASS_NAME_DISABLED$1)) {
              return;
            }
            var parent = Dropdown2._getParentFromElement(this);
            var isActive = $__default["default"](parent).hasClass(CLASS_NAME_SHOW$5);
            if (!isActive && event.which === ESCAPE_KEYCODE$1) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (!isActive || event.which === ESCAPE_KEYCODE$1 || event.which === SPACE_KEYCODE) {
              if (event.which === ESCAPE_KEYCODE$1) {
                $__default["default"](parent.querySelector(SELECTOR_DATA_TOGGLE$2)).trigger("focus");
              }
              $__default["default"](this).trigger("click");
              return;
            }
            var items = [].slice.call(parent.querySelectorAll(SELECTOR_VISIBLE_ITEMS)).filter(function(item) {
              return $__default["default"](item).is(":visible");
            });
            if (items.length === 0) {
              return;
            }
            var index2 = items.indexOf(event.target);
            if (event.which === ARROW_UP_KEYCODE && index2 > 0) {
              index2--;
            }
            if (event.which === ARROW_DOWN_KEYCODE && index2 < items.length - 1) {
              index2++;
            }
            if (index2 < 0) {
              index2 = 0;
            }
            items[index2].focus();
          };
          _createClass(Dropdown2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$6;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$5;
            }
          }, {
            key: "DefaultType",
            get: function get() {
              return DefaultType$5;
            }
          }]);
          return Dropdown2;
        }();
        $__default["default"](document).on(EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$2, Dropdown._dataApiKeydownHandler).on(EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown._dataApiKeydownHandler).on(EVENT_CLICK_DATA_API$2 + " " + EVENT_KEYUP_DATA_API, Dropdown._clearMenus).on(EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
          event.preventDefault();
          event.stopPropagation();
          Dropdown._jQueryInterface.call($__default["default"](this), "toggle");
        }).on(EVENT_CLICK_DATA_API$2, SELECTOR_FORM_CHILD, function(e) {
          e.stopPropagation();
        });
        $__default["default"].fn[NAME$6] = Dropdown._jQueryInterface;
        $__default["default"].fn[NAME$6].Constructor = Dropdown;
        $__default["default"].fn[NAME$6].noConflict = function() {
          $__default["default"].fn[NAME$6] = JQUERY_NO_CONFLICT$6;
          return Dropdown._jQueryInterface;
        };
        var NAME$5 = "modal";
        var VERSION$5 = "4.6.1";
        var DATA_KEY$5 = "bs.modal";
        var EVENT_KEY$5 = "." + DATA_KEY$5;
        var DATA_API_KEY$2 = ".data-api";
        var JQUERY_NO_CONFLICT$5 = $__default["default"].fn[NAME$5];
        var ESCAPE_KEYCODE = 27;
        var CLASS_NAME_SCROLLABLE = "modal-dialog-scrollable";
        var CLASS_NAME_SCROLLBAR_MEASURER = "modal-scrollbar-measure";
        var CLASS_NAME_BACKDROP = "modal-backdrop";
        var CLASS_NAME_OPEN = "modal-open";
        var CLASS_NAME_FADE$4 = "fade";
        var CLASS_NAME_SHOW$4 = "show";
        var CLASS_NAME_STATIC = "modal-static";
        var EVENT_HIDE$2 = "hide" + EVENT_KEY$5;
        var EVENT_HIDE_PREVENTED = "hidePrevented" + EVENT_KEY$5;
        var EVENT_HIDDEN$2 = "hidden" + EVENT_KEY$5;
        var EVENT_SHOW$2 = "show" + EVENT_KEY$5;
        var EVENT_SHOWN$2 = "shown" + EVENT_KEY$5;
        var EVENT_FOCUSIN = "focusin" + EVENT_KEY$5;
        var EVENT_RESIZE = "resize" + EVENT_KEY$5;
        var EVENT_CLICK_DISMISS$1 = "click.dismiss" + EVENT_KEY$5;
        var EVENT_KEYDOWN_DISMISS = "keydown.dismiss" + EVENT_KEY$5;
        var EVENT_MOUSEUP_DISMISS = "mouseup.dismiss" + EVENT_KEY$5;
        var EVENT_MOUSEDOWN_DISMISS = "mousedown.dismiss" + EVENT_KEY$5;
        var EVENT_CLICK_DATA_API$1 = "click" + EVENT_KEY$5 + DATA_API_KEY$2;
        var SELECTOR_DIALOG = ".modal-dialog";
        var SELECTOR_MODAL_BODY = ".modal-body";
        var SELECTOR_DATA_TOGGLE$1 = '[data-toggle="modal"]';
        var SELECTOR_DATA_DISMISS$1 = '[data-dismiss="modal"]';
        var SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
        var SELECTOR_STICKY_CONTENT = ".sticky-top";
        var Default$4 = {
          backdrop: true,
          keyboard: true,
          focus: true,
          show: true
        };
        var DefaultType$4 = {
          backdrop: "(boolean|string)",
          keyboard: "boolean",
          focus: "boolean",
          show: "boolean"
        };
        var Modal = function() {
          function Modal2(element, config) {
            this._config = this._getConfig(config);
            this._element = element;
            this._dialog = element.querySelector(SELECTOR_DIALOG);
            this._backdrop = null;
            this._isShown = false;
            this._isBodyOverflowing = false;
            this._ignoreBackdropClick = false;
            this._isTransitioning = false;
            this._scrollbarWidth = 0;
          }
          var _proto = Modal2.prototype;
          _proto.toggle = function toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget);
          };
          _proto.show = function show(relatedTarget) {
            var _this = this;
            if (this._isShown || this._isTransitioning) {
              return;
            }
            var showEvent = $__default["default"].Event(EVENT_SHOW$2, {
              relatedTarget
            });
            $__default["default"](this._element).trigger(showEvent);
            if (showEvent.isDefaultPrevented()) {
              return;
            }
            this._isShown = true;
            if ($__default["default"](this._element).hasClass(CLASS_NAME_FADE$4)) {
              this._isTransitioning = true;
            }
            this._checkScrollbar();
            this._setScrollbar();
            this._adjustDialog();
            this._setEscapeEvent();
            this._setResizeEvent();
            $__default["default"](this._element).on(EVENT_CLICK_DISMISS$1, SELECTOR_DATA_DISMISS$1, function(event) {
              return _this.hide(event);
            });
            $__default["default"](this._dialog).on(EVENT_MOUSEDOWN_DISMISS, function() {
              $__default["default"](_this._element).one(EVENT_MOUSEUP_DISMISS, function(event) {
                if ($__default["default"](event.target).is(_this._element)) {
                  _this._ignoreBackdropClick = true;
                }
              });
            });
            this._showBackdrop(function() {
              return _this._showElement(relatedTarget);
            });
          };
          _proto.hide = function hide2(event) {
            var _this2 = this;
            if (event) {
              event.preventDefault();
            }
            if (!this._isShown || this._isTransitioning) {
              return;
            }
            var hideEvent = $__default["default"].Event(EVENT_HIDE$2);
            $__default["default"](this._element).trigger(hideEvent);
            if (!this._isShown || hideEvent.isDefaultPrevented()) {
              return;
            }
            this._isShown = false;
            var transition = $__default["default"](this._element).hasClass(CLASS_NAME_FADE$4);
            if (transition) {
              this._isTransitioning = true;
            }
            this._setEscapeEvent();
            this._setResizeEvent();
            $__default["default"](document).off(EVENT_FOCUSIN);
            $__default["default"](this._element).removeClass(CLASS_NAME_SHOW$4);
            $__default["default"](this._element).off(EVENT_CLICK_DISMISS$1);
            $__default["default"](this._dialog).off(EVENT_MOUSEDOWN_DISMISS);
            if (transition) {
              var transitionDuration = Util.getTransitionDurationFromElement(this._element);
              $__default["default"](this._element).one(Util.TRANSITION_END, function(event2) {
                return _this2._hideModal(event2);
              }).emulateTransitionEnd(transitionDuration);
            } else {
              this._hideModal();
            }
          };
          _proto.dispose = function dispose() {
            [window, this._element, this._dialog].forEach(function(htmlElement) {
              return $__default["default"](htmlElement).off(EVENT_KEY$5);
            });
            $__default["default"](document).off(EVENT_FOCUSIN);
            $__default["default"].removeData(this._element, DATA_KEY$5);
            this._config = null;
            this._element = null;
            this._dialog = null;
            this._backdrop = null;
            this._isShown = null;
            this._isBodyOverflowing = null;
            this._ignoreBackdropClick = null;
            this._isTransitioning = null;
            this._scrollbarWidth = null;
          };
          _proto.handleUpdate = function handleUpdate() {
            this._adjustDialog();
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, Default$4, config);
            Util.typeCheckConfig(NAME$5, config, DefaultType$4);
            return config;
          };
          _proto._triggerBackdropTransition = function _triggerBackdropTransition() {
            var _this3 = this;
            var hideEventPrevented = $__default["default"].Event(EVENT_HIDE_PREVENTED);
            $__default["default"](this._element).trigger(hideEventPrevented);
            if (hideEventPrevented.isDefaultPrevented()) {
              return;
            }
            var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            if (!isModalOverflowing) {
              this._element.style.overflowY = "hidden";
            }
            this._element.classList.add(CLASS_NAME_STATIC);
            var modalTransitionDuration = Util.getTransitionDurationFromElement(this._dialog);
            $__default["default"](this._element).off(Util.TRANSITION_END);
            $__default["default"](this._element).one(Util.TRANSITION_END, function() {
              _this3._element.classList.remove(CLASS_NAME_STATIC);
              if (!isModalOverflowing) {
                $__default["default"](_this3._element).one(Util.TRANSITION_END, function() {
                  _this3._element.style.overflowY = "";
                }).emulateTransitionEnd(_this3._element, modalTransitionDuration);
              }
            }).emulateTransitionEnd(modalTransitionDuration);
            this._element.focus();
          };
          _proto._showElement = function _showElement(relatedTarget) {
            var _this4 = this;
            var transition = $__default["default"](this._element).hasClass(CLASS_NAME_FADE$4);
            var modalBody = this._dialog ? this._dialog.querySelector(SELECTOR_MODAL_BODY) : null;
            if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
              document.body.appendChild(this._element);
            }
            this._element.style.display = "block";
            this._element.removeAttribute("aria-hidden");
            this._element.setAttribute("aria-modal", true);
            this._element.setAttribute("role", "dialog");
            if ($__default["default"](this._dialog).hasClass(CLASS_NAME_SCROLLABLE) && modalBody) {
              modalBody.scrollTop = 0;
            } else {
              this._element.scrollTop = 0;
            }
            if (transition) {
              Util.reflow(this._element);
            }
            $__default["default"](this._element).addClass(CLASS_NAME_SHOW$4);
            if (this._config.focus) {
              this._enforceFocus();
            }
            var shownEvent = $__default["default"].Event(EVENT_SHOWN$2, {
              relatedTarget
            });
            var transitionComplete = function transitionComplete2() {
              if (_this4._config.focus) {
                _this4._element.focus();
              }
              _this4._isTransitioning = false;
              $__default["default"](_this4._element).trigger(shownEvent);
            };
            if (transition) {
              var transitionDuration = Util.getTransitionDurationFromElement(this._dialog);
              $__default["default"](this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
            } else {
              transitionComplete();
            }
          };
          _proto._enforceFocus = function _enforceFocus() {
            var _this5 = this;
            $__default["default"](document).off(EVENT_FOCUSIN).on(EVENT_FOCUSIN, function(event) {
              if (document !== event.target && _this5._element !== event.target && $__default["default"](_this5._element).has(event.target).length === 0) {
                _this5._element.focus();
              }
            });
          };
          _proto._setEscapeEvent = function _setEscapeEvent() {
            var _this6 = this;
            if (this._isShown) {
              $__default["default"](this._element).on(EVENT_KEYDOWN_DISMISS, function(event) {
                if (_this6._config.keyboard && event.which === ESCAPE_KEYCODE) {
                  event.preventDefault();
                  _this6.hide();
                } else if (!_this6._config.keyboard && event.which === ESCAPE_KEYCODE) {
                  _this6._triggerBackdropTransition();
                }
              });
            } else if (!this._isShown) {
              $__default["default"](this._element).off(EVENT_KEYDOWN_DISMISS);
            }
          };
          _proto._setResizeEvent = function _setResizeEvent() {
            var _this7 = this;
            if (this._isShown) {
              $__default["default"](window).on(EVENT_RESIZE, function(event) {
                return _this7.handleUpdate(event);
              });
            } else {
              $__default["default"](window).off(EVENT_RESIZE);
            }
          };
          _proto._hideModal = function _hideModal() {
            var _this8 = this;
            this._element.style.display = "none";
            this._element.setAttribute("aria-hidden", true);
            this._element.removeAttribute("aria-modal");
            this._element.removeAttribute("role");
            this._isTransitioning = false;
            this._showBackdrop(function() {
              $__default["default"](document.body).removeClass(CLASS_NAME_OPEN);
              _this8._resetAdjustments();
              _this8._resetScrollbar();
              $__default["default"](_this8._element).trigger(EVENT_HIDDEN$2);
            });
          };
          _proto._removeBackdrop = function _removeBackdrop() {
            if (this._backdrop) {
              $__default["default"](this._backdrop).remove();
              this._backdrop = null;
            }
          };
          _proto._showBackdrop = function _showBackdrop(callback) {
            var _this9 = this;
            var animate = $__default["default"](this._element).hasClass(CLASS_NAME_FADE$4) ? CLASS_NAME_FADE$4 : "";
            if (this._isShown && this._config.backdrop) {
              this._backdrop = document.createElement("div");
              this._backdrop.className = CLASS_NAME_BACKDROP;
              if (animate) {
                this._backdrop.classList.add(animate);
              }
              $__default["default"](this._backdrop).appendTo(document.body);
              $__default["default"](this._element).on(EVENT_CLICK_DISMISS$1, function(event) {
                if (_this9._ignoreBackdropClick) {
                  _this9._ignoreBackdropClick = false;
                  return;
                }
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (_this9._config.backdrop === "static") {
                  _this9._triggerBackdropTransition();
                } else {
                  _this9.hide();
                }
              });
              if (animate) {
                Util.reflow(this._backdrop);
              }
              $__default["default"](this._backdrop).addClass(CLASS_NAME_SHOW$4);
              if (!callback) {
                return;
              }
              if (!animate) {
                callback();
                return;
              }
              var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
              $__default["default"](this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
            } else if (!this._isShown && this._backdrop) {
              $__default["default"](this._backdrop).removeClass(CLASS_NAME_SHOW$4);
              var callbackRemove = function callbackRemove2() {
                _this9._removeBackdrop();
                if (callback) {
                  callback();
                }
              };
              if ($__default["default"](this._element).hasClass(CLASS_NAME_FADE$4)) {
                var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
                $__default["default"](this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
              } else {
                callbackRemove();
              }
            } else if (callback) {
              callback();
            }
          };
          _proto._adjustDialog = function _adjustDialog() {
            var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            if (!this._isBodyOverflowing && isModalOverflowing) {
              this._element.style.paddingLeft = this._scrollbarWidth + "px";
            }
            if (this._isBodyOverflowing && !isModalOverflowing) {
              this._element.style.paddingRight = this._scrollbarWidth + "px";
            }
          };
          _proto._resetAdjustments = function _resetAdjustments() {
            this._element.style.paddingLeft = "";
            this._element.style.paddingRight = "";
          };
          _proto._checkScrollbar = function _checkScrollbar() {
            var rect = document.body.getBoundingClientRect();
            this._isBodyOverflowing = Math.round(rect.left + rect.right) < window.innerWidth;
            this._scrollbarWidth = this._getScrollbarWidth();
          };
          _proto._setScrollbar = function _setScrollbar() {
            var _this10 = this;
            if (this._isBodyOverflowing) {
              var fixedContent = [].slice.call(document.querySelectorAll(SELECTOR_FIXED_CONTENT));
              var stickyContent = [].slice.call(document.querySelectorAll(SELECTOR_STICKY_CONTENT));
              $__default["default"](fixedContent).each(function(index2, element) {
                var actualPadding2 = element.style.paddingRight;
                var calculatedPadding2 = $__default["default"](element).css("padding-right");
                $__default["default"](element).data("padding-right", actualPadding2).css("padding-right", parseFloat(calculatedPadding2) + _this10._scrollbarWidth + "px");
              });
              $__default["default"](stickyContent).each(function(index2, element) {
                var actualMargin = element.style.marginRight;
                var calculatedMargin = $__default["default"](element).css("margin-right");
                $__default["default"](element).data("margin-right", actualMargin).css("margin-right", parseFloat(calculatedMargin) - _this10._scrollbarWidth + "px");
              });
              var actualPadding = document.body.style.paddingRight;
              var calculatedPadding = $__default["default"](document.body).css("padding-right");
              $__default["default"](document.body).data("padding-right", actualPadding).css("padding-right", parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
            }
            $__default["default"](document.body).addClass(CLASS_NAME_OPEN);
          };
          _proto._resetScrollbar = function _resetScrollbar() {
            var fixedContent = [].slice.call(document.querySelectorAll(SELECTOR_FIXED_CONTENT));
            $__default["default"](fixedContent).each(function(index2, element) {
              var padding2 = $__default["default"](element).data("padding-right");
              $__default["default"](element).removeData("padding-right");
              element.style.paddingRight = padding2 ? padding2 : "";
            });
            var elements = [].slice.call(document.querySelectorAll("" + SELECTOR_STICKY_CONTENT));
            $__default["default"](elements).each(function(index2, element) {
              var margin = $__default["default"](element).data("margin-right");
              if (typeof margin !== "undefined") {
                $__default["default"](element).css("margin-right", margin).removeData("margin-right");
              }
            });
            var padding = $__default["default"](document.body).data("padding-right");
            $__default["default"](document.body).removeData("padding-right");
            document.body.style.paddingRight = padding ? padding : "";
          };
          _proto._getScrollbarWidth = function _getScrollbarWidth() {
            var scrollDiv = document.createElement("div");
            scrollDiv.className = CLASS_NAME_SCROLLBAR_MEASURER;
            document.body.appendChild(scrollDiv);
            var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
          };
          Modal2._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
            return this.each(function() {
              var data = $__default["default"](this).data(DATA_KEY$5);
              var _config = _extends2({}, Default$4, $__default["default"](this).data(), typeof config === "object" && config ? config : {});
              if (!data) {
                data = new Modal2(this, _config);
                $__default["default"](this).data(DATA_KEY$5, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config](relatedTarget);
              } else if (_config.show) {
                data.show(relatedTarget);
              }
            });
          };
          _createClass(Modal2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$5;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$4;
            }
          }]);
          return Modal2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
          var _this11 = this;
          var target;
          var selector = Util.getSelectorFromElement(this);
          if (selector) {
            target = document.querySelector(selector);
          }
          var config = $__default["default"](target).data(DATA_KEY$5) ? "toggle" : _extends2({}, $__default["default"](target).data(), $__default["default"](this).data());
          if (this.tagName === "A" || this.tagName === "AREA") {
            event.preventDefault();
          }
          var $target = $__default["default"](target).one(EVENT_SHOW$2, function(showEvent) {
            if (showEvent.isDefaultPrevented()) {
              return;
            }
            $target.one(EVENT_HIDDEN$2, function() {
              if ($__default["default"](_this11).is(":visible")) {
                _this11.focus();
              }
            });
          });
          Modal._jQueryInterface.call($__default["default"](target), config, this);
        });
        $__default["default"].fn[NAME$5] = Modal._jQueryInterface;
        $__default["default"].fn[NAME$5].Constructor = Modal;
        $__default["default"].fn[NAME$5].noConflict = function() {
          $__default["default"].fn[NAME$5] = JQUERY_NO_CONFLICT$5;
          return Modal._jQueryInterface;
        };
        var uriAttrs = ["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"];
        var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
        var DefaultWhitelist = {
          "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
          a: ["target", "href", "title", "rel"],
          area: [],
          b: [],
          br: [],
          col: [],
          code: [],
          div: [],
          em: [],
          hr: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          i: [],
          img: ["src", "srcset", "alt", "title", "width", "height"],
          li: [],
          ol: [],
          p: [],
          pre: [],
          s: [],
          small: [],
          span: [],
          sub: [],
          sup: [],
          strong: [],
          u: [],
          ul: []
        };
        var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
        var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;
        function allowedAttribute(attr, allowedAttributeList) {
          var attrName = attr.nodeName.toLowerCase();
          if (allowedAttributeList.indexOf(attrName) !== -1) {
            if (uriAttrs.indexOf(attrName) !== -1) {
              return Boolean(SAFE_URL_PATTERN.test(attr.nodeValue) || DATA_URL_PATTERN.test(attr.nodeValue));
            }
            return true;
          }
          var regExp = allowedAttributeList.filter(function(attrRegex) {
            return attrRegex instanceof RegExp;
          });
          for (var i = 0, len = regExp.length; i < len; i++) {
            if (regExp[i].test(attrName)) {
              return true;
            }
          }
          return false;
        }
        function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
          if (unsafeHtml.length === 0) {
            return unsafeHtml;
          }
          if (sanitizeFn && typeof sanitizeFn === "function") {
            return sanitizeFn(unsafeHtml);
          }
          var domParser = new window.DOMParser();
          var createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
          var whitelistKeys = Object.keys(whiteList);
          var elements = [].slice.call(createdDocument.body.querySelectorAll("*"));
          var _loop = function _loop2(i2, len2) {
            var el = elements[i2];
            var elName = el.nodeName.toLowerCase();
            if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
              el.parentNode.removeChild(el);
              return "continue";
            }
            var attributeList = [].slice.call(el.attributes);
            var whitelistedAttributes = [].concat(whiteList["*"] || [], whiteList[elName] || []);
            attributeList.forEach(function(attr) {
              if (!allowedAttribute(attr, whitelistedAttributes)) {
                el.removeAttribute(attr.nodeName);
              }
            });
          };
          for (var i = 0, len = elements.length; i < len; i++) {
            var _ret = _loop(i);
            if (_ret === "continue")
              continue;
          }
          return createdDocument.body.innerHTML;
        }
        var NAME$4 = "tooltip";
        var VERSION$4 = "4.6.1";
        var DATA_KEY$4 = "bs.tooltip";
        var EVENT_KEY$4 = "." + DATA_KEY$4;
        var JQUERY_NO_CONFLICT$4 = $__default["default"].fn[NAME$4];
        var CLASS_PREFIX$1 = "bs-tooltip";
        var BSCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", "g");
        var DISALLOWED_ATTRIBUTES = ["sanitize", "whiteList", "sanitizeFn"];
        var CLASS_NAME_FADE$3 = "fade";
        var CLASS_NAME_SHOW$3 = "show";
        var HOVER_STATE_SHOW = "show";
        var HOVER_STATE_OUT = "out";
        var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
        var SELECTOR_ARROW = ".arrow";
        var TRIGGER_HOVER = "hover";
        var TRIGGER_FOCUS = "focus";
        var TRIGGER_CLICK = "click";
        var TRIGGER_MANUAL = "manual";
        var AttachmentMap = {
          AUTO: "auto",
          TOP: "top",
          RIGHT: "right",
          BOTTOM: "bottom",
          LEFT: "left"
        };
        var Default$3 = {
          animation: true,
          template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
          trigger: "hover focus",
          title: "",
          delay: 0,
          html: false,
          selector: false,
          placement: "top",
          offset: 0,
          container: false,
          fallbackPlacement: "flip",
          boundary: "scrollParent",
          customClass: "",
          sanitize: true,
          sanitizeFn: null,
          whiteList: DefaultWhitelist,
          popperConfig: null
        };
        var DefaultType$3 = {
          animation: "boolean",
          template: "string",
          title: "(string|element|function)",
          trigger: "string",
          delay: "(number|object)",
          html: "boolean",
          selector: "(string|boolean)",
          placement: "(string|function)",
          offset: "(number|string|function)",
          container: "(string|element|boolean)",
          fallbackPlacement: "(string|array)",
          boundary: "(string|element)",
          customClass: "(string|function)",
          sanitize: "boolean",
          sanitizeFn: "(null|function)",
          whiteList: "object",
          popperConfig: "(null|object)"
        };
        var Event$1 = {
          HIDE: "hide" + EVENT_KEY$4,
          HIDDEN: "hidden" + EVENT_KEY$4,
          SHOW: "show" + EVENT_KEY$4,
          SHOWN: "shown" + EVENT_KEY$4,
          INSERTED: "inserted" + EVENT_KEY$4,
          CLICK: "click" + EVENT_KEY$4,
          FOCUSIN: "focusin" + EVENT_KEY$4,
          FOCUSOUT: "focusout" + EVENT_KEY$4,
          MOUSEENTER: "mouseenter" + EVENT_KEY$4,
          MOUSELEAVE: "mouseleave" + EVENT_KEY$4
        };
        var Tooltip = function() {
          function Tooltip2(element, config) {
            if (typeof Popper__default["default"] === "undefined") {
              throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");
            }
            this._isEnabled = true;
            this._timeout = 0;
            this._hoverState = "";
            this._activeTrigger = {};
            this._popper = null;
            this.element = element;
            this.config = this._getConfig(config);
            this.tip = null;
            this._setListeners();
          }
          var _proto = Tooltip2.prototype;
          _proto.enable = function enable() {
            this._isEnabled = true;
          };
          _proto.disable = function disable() {
            this._isEnabled = false;
          };
          _proto.toggleEnabled = function toggleEnabled() {
            this._isEnabled = !this._isEnabled;
          };
          _proto.toggle = function toggle(event) {
            if (!this._isEnabled) {
              return;
            }
            if (event) {
              var dataKey = this.constructor.DATA_KEY;
              var context = $__default["default"](event.currentTarget).data(dataKey);
              if (!context) {
                context = new this.constructor(event.currentTarget, this._getDelegateConfig());
                $__default["default"](event.currentTarget).data(dataKey, context);
              }
              context._activeTrigger.click = !context._activeTrigger.click;
              if (context._isWithActiveTrigger()) {
                context._enter(null, context);
              } else {
                context._leave(null, context);
              }
            } else {
              if ($__default["default"](this.getTipElement()).hasClass(CLASS_NAME_SHOW$3)) {
                this._leave(null, this);
                return;
              }
              this._enter(null, this);
            }
          };
          _proto.dispose = function dispose() {
            clearTimeout(this._timeout);
            $__default["default"].removeData(this.element, this.constructor.DATA_KEY);
            $__default["default"](this.element).off(this.constructor.EVENT_KEY);
            $__default["default"](this.element).closest(".modal").off("hide.bs.modal", this._hideModalHandler);
            if (this.tip) {
              $__default["default"](this.tip).remove();
            }
            this._isEnabled = null;
            this._timeout = null;
            this._hoverState = null;
            this._activeTrigger = null;
            if (this._popper) {
              this._popper.destroy();
            }
            this._popper = null;
            this.element = null;
            this.config = null;
            this.tip = null;
          };
          _proto.show = function show() {
            var _this = this;
            if ($__default["default"](this.element).css("display") === "none") {
              throw new Error("Please use show on visible elements");
            }
            var showEvent = $__default["default"].Event(this.constructor.Event.SHOW);
            if (this.isWithContent() && this._isEnabled) {
              $__default["default"](this.element).trigger(showEvent);
              var shadowRoot = Util.findShadowRoot(this.element);
              var isInTheDom = $__default["default"].contains(shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element);
              if (showEvent.isDefaultPrevented() || !isInTheDom) {
                return;
              }
              var tip = this.getTipElement();
              var tipId = Util.getUID(this.constructor.NAME);
              tip.setAttribute("id", tipId);
              this.element.setAttribute("aria-describedby", tipId);
              this.setContent();
              if (this.config.animation) {
                $__default["default"](tip).addClass(CLASS_NAME_FADE$3);
              }
              var placement = typeof this.config.placement === "function" ? this.config.placement.call(this, tip, this.element) : this.config.placement;
              var attachment = this._getAttachment(placement);
              this.addAttachmentClass(attachment);
              var container = this._getContainer();
              $__default["default"](tip).data(this.constructor.DATA_KEY, this);
              if (!$__default["default"].contains(this.element.ownerDocument.documentElement, this.tip)) {
                $__default["default"](tip).appendTo(container);
              }
              $__default["default"](this.element).trigger(this.constructor.Event.INSERTED);
              this._popper = new Popper__default["default"](this.element, tip, this._getPopperConfig(attachment));
              $__default["default"](tip).addClass(CLASS_NAME_SHOW$3);
              $__default["default"](tip).addClass(this.config.customClass);
              if ("ontouchstart" in document.documentElement) {
                $__default["default"](document.body).children().on("mouseover", null, $__default["default"].noop);
              }
              var complete = function complete2() {
                if (_this.config.animation) {
                  _this._fixTransition();
                }
                var prevHoverState = _this._hoverState;
                _this._hoverState = null;
                $__default["default"](_this.element).trigger(_this.constructor.Event.SHOWN);
                if (prevHoverState === HOVER_STATE_OUT) {
                  _this._leave(null, _this);
                }
              };
              if ($__default["default"](this.tip).hasClass(CLASS_NAME_FADE$3)) {
                var transitionDuration = Util.getTransitionDurationFromElement(this.tip);
                $__default["default"](this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
              } else {
                complete();
              }
            }
          };
          _proto.hide = function hide2(callback) {
            var _this2 = this;
            var tip = this.getTipElement();
            var hideEvent = $__default["default"].Event(this.constructor.Event.HIDE);
            var complete = function complete2() {
              if (_this2._hoverState !== HOVER_STATE_SHOW && tip.parentNode) {
                tip.parentNode.removeChild(tip);
              }
              _this2._cleanTipClass();
              _this2.element.removeAttribute("aria-describedby");
              $__default["default"](_this2.element).trigger(_this2.constructor.Event.HIDDEN);
              if (_this2._popper !== null) {
                _this2._popper.destroy();
              }
              if (callback) {
                callback();
              }
            };
            $__default["default"](this.element).trigger(hideEvent);
            if (hideEvent.isDefaultPrevented()) {
              return;
            }
            $__default["default"](tip).removeClass(CLASS_NAME_SHOW$3);
            if ("ontouchstart" in document.documentElement) {
              $__default["default"](document.body).children().off("mouseover", null, $__default["default"].noop);
            }
            this._activeTrigger[TRIGGER_CLICK] = false;
            this._activeTrigger[TRIGGER_FOCUS] = false;
            this._activeTrigger[TRIGGER_HOVER] = false;
            if ($__default["default"](this.tip).hasClass(CLASS_NAME_FADE$3)) {
              var transitionDuration = Util.getTransitionDurationFromElement(tip);
              $__default["default"](tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            } else {
              complete();
            }
            this._hoverState = "";
          };
          _proto.update = function update2() {
            if (this._popper !== null) {
              this._popper.scheduleUpdate();
            }
          };
          _proto.isWithContent = function isWithContent() {
            return Boolean(this.getTitle());
          };
          _proto.addAttachmentClass = function addAttachmentClass(attachment) {
            $__default["default"](this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
          };
          _proto.getTipElement = function getTipElement() {
            this.tip = this.tip || $__default["default"](this.config.template)[0];
            return this.tip;
          };
          _proto.setContent = function setContent() {
            var tip = this.getTipElement();
            this.setElementContent($__default["default"](tip.querySelectorAll(SELECTOR_TOOLTIP_INNER)), this.getTitle());
            $__default["default"](tip).removeClass(CLASS_NAME_FADE$3 + " " + CLASS_NAME_SHOW$3);
          };
          _proto.setElementContent = function setElementContent($element, content) {
            if (typeof content === "object" && (content.nodeType || content.jquery)) {
              if (this.config.html) {
                if (!$__default["default"](content).parent().is($element)) {
                  $element.empty().append(content);
                }
              } else {
                $element.text($__default["default"](content).text());
              }
              return;
            }
            if (this.config.html) {
              if (this.config.sanitize) {
                content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
              }
              $element.html(content);
            } else {
              $element.text(content);
            }
          };
          _proto.getTitle = function getTitle() {
            var title = this.element.getAttribute("data-original-title");
            if (!title) {
              title = typeof this.config.title === "function" ? this.config.title.call(this.element) : this.config.title;
            }
            return title;
          };
          _proto._getPopperConfig = function _getPopperConfig(attachment) {
            var _this3 = this;
            var defaultBsConfig = {
              placement: attachment,
              modifiers: {
                offset: this._getOffset(),
                flip: {
                  behavior: this.config.fallbackPlacement
                },
                arrow: {
                  element: SELECTOR_ARROW
                },
                preventOverflow: {
                  boundariesElement: this.config.boundary
                }
              },
              onCreate: function onCreate(data) {
                if (data.originalPlacement !== data.placement) {
                  _this3._handlePopperPlacementChange(data);
                }
              },
              onUpdate: function onUpdate(data) {
                return _this3._handlePopperPlacementChange(data);
              }
            };
            return _extends2({}, defaultBsConfig, this.config.popperConfig);
          };
          _proto._getOffset = function _getOffset() {
            var _this4 = this;
            var offset2 = {};
            if (typeof this.config.offset === "function") {
              offset2.fn = function(data) {
                data.offsets = _extends2({}, data.offsets, _this4.config.offset(data.offsets, _this4.element));
                return data;
              };
            } else {
              offset2.offset = this.config.offset;
            }
            return offset2;
          };
          _proto._getContainer = function _getContainer() {
            if (this.config.container === false) {
              return document.body;
            }
            if (Util.isElement(this.config.container)) {
              return $__default["default"](this.config.container);
            }
            return $__default["default"](document).find(this.config.container);
          };
          _proto._getAttachment = function _getAttachment(placement) {
            return AttachmentMap[placement.toUpperCase()];
          };
          _proto._setListeners = function _setListeners() {
            var _this5 = this;
            var triggers = this.config.trigger.split(" ");
            triggers.forEach(function(trigger) {
              if (trigger === "click") {
                $__default["default"](_this5.element).on(_this5.constructor.Event.CLICK, _this5.config.selector, function(event) {
                  return _this5.toggle(event);
                });
              } else if (trigger !== TRIGGER_MANUAL) {
                var eventIn = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSEENTER : _this5.constructor.Event.FOCUSIN;
                var eventOut = trigger === TRIGGER_HOVER ? _this5.constructor.Event.MOUSELEAVE : _this5.constructor.Event.FOCUSOUT;
                $__default["default"](_this5.element).on(eventIn, _this5.config.selector, function(event) {
                  return _this5._enter(event);
                }).on(eventOut, _this5.config.selector, function(event) {
                  return _this5._leave(event);
                });
              }
            });
            this._hideModalHandler = function() {
              if (_this5.element) {
                _this5.hide();
              }
            };
            $__default["default"](this.element).closest(".modal").on("hide.bs.modal", this._hideModalHandler);
            if (this.config.selector) {
              this.config = _extends2({}, this.config, {
                trigger: "manual",
                selector: ""
              });
            } else {
              this._fixTitle();
            }
          };
          _proto._fixTitle = function _fixTitle() {
            var titleType = typeof this.element.getAttribute("data-original-title");
            if (this.element.getAttribute("title") || titleType !== "string") {
              this.element.setAttribute("data-original-title", this.element.getAttribute("title") || "");
              this.element.setAttribute("title", "");
            }
          };
          _proto._enter = function _enter(event, context) {
            var dataKey = this.constructor.DATA_KEY;
            context = context || $__default["default"](event.currentTarget).data(dataKey);
            if (!context) {
              context = new this.constructor(event.currentTarget, this._getDelegateConfig());
              $__default["default"](event.currentTarget).data(dataKey, context);
            }
            if (event) {
              context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            }
            if ($__default["default"](context.getTipElement()).hasClass(CLASS_NAME_SHOW$3) || context._hoverState === HOVER_STATE_SHOW) {
              context._hoverState = HOVER_STATE_SHOW;
              return;
            }
            clearTimeout(context._timeout);
            context._hoverState = HOVER_STATE_SHOW;
            if (!context.config.delay || !context.config.delay.show) {
              context.show();
              return;
            }
            context._timeout = setTimeout(function() {
              if (context._hoverState === HOVER_STATE_SHOW) {
                context.show();
              }
            }, context.config.delay.show);
          };
          _proto._leave = function _leave(event, context) {
            var dataKey = this.constructor.DATA_KEY;
            context = context || $__default["default"](event.currentTarget).data(dataKey);
            if (!context) {
              context = new this.constructor(event.currentTarget, this._getDelegateConfig());
              $__default["default"](event.currentTarget).data(dataKey, context);
            }
            if (event) {
              context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = false;
            }
            if (context._isWithActiveTrigger()) {
              return;
            }
            clearTimeout(context._timeout);
            context._hoverState = HOVER_STATE_OUT;
            if (!context.config.delay || !context.config.delay.hide) {
              context.hide();
              return;
            }
            context._timeout = setTimeout(function() {
              if (context._hoverState === HOVER_STATE_OUT) {
                context.hide();
              }
            }, context.config.delay.hide);
          };
          _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
            for (var trigger in this._activeTrigger) {
              if (this._activeTrigger[trigger]) {
                return true;
              }
            }
            return false;
          };
          _proto._getConfig = function _getConfig(config) {
            var dataAttributes = $__default["default"](this.element).data();
            Object.keys(dataAttributes).forEach(function(dataAttr) {
              if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
                delete dataAttributes[dataAttr];
              }
            });
            config = _extends2({}, this.constructor.Default, dataAttributes, typeof config === "object" && config ? config : {});
            if (typeof config.delay === "number") {
              config.delay = {
                show: config.delay,
                hide: config.delay
              };
            }
            if (typeof config.title === "number") {
              config.title = config.title.toString();
            }
            if (typeof config.content === "number") {
              config.content = config.content.toString();
            }
            Util.typeCheckConfig(NAME$4, config, this.constructor.DefaultType);
            if (config.sanitize) {
              config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
            }
            return config;
          };
          _proto._getDelegateConfig = function _getDelegateConfig() {
            var config = {};
            if (this.config) {
              for (var key in this.config) {
                if (this.constructor.Default[key] !== this.config[key]) {
                  config[key] = this.config[key];
                }
              }
            }
            return config;
          };
          _proto._cleanTipClass = function _cleanTipClass() {
            var $tip = $__default["default"](this.getTipElement());
            var tabClass = $tip.attr("class").match(BSCLS_PREFIX_REGEX$1);
            if (tabClass !== null && tabClass.length) {
              $tip.removeClass(tabClass.join(""));
            }
          };
          _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
            this.tip = popperData.instance.popper;
            this._cleanTipClass();
            this.addAttachmentClass(this._getAttachment(popperData.placement));
          };
          _proto._fixTransition = function _fixTransition() {
            var tip = this.getTipElement();
            var initConfigAnimation = this.config.animation;
            if (tip.getAttribute("x-placement") !== null) {
              return;
            }
            $__default["default"](tip).removeClass(CLASS_NAME_FADE$3);
            this.config.animation = false;
            this.hide();
            this.show();
            this.config.animation = initConfigAnimation;
          };
          Tooltip2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var $element = $__default["default"](this);
              var data = $element.data(DATA_KEY$4);
              var _config = typeof config === "object" && config;
              if (!data && /dispose|hide/.test(config)) {
                return;
              }
              if (!data) {
                data = new Tooltip2(this, _config);
                $element.data(DATA_KEY$4, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          _createClass(Tooltip2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$4;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$3;
            }
          }, {
            key: "NAME",
            get: function get() {
              return NAME$4;
            }
          }, {
            key: "DATA_KEY",
            get: function get() {
              return DATA_KEY$4;
            }
          }, {
            key: "Event",
            get: function get() {
              return Event$1;
            }
          }, {
            key: "EVENT_KEY",
            get: function get() {
              return EVENT_KEY$4;
            }
          }, {
            key: "DefaultType",
            get: function get() {
              return DefaultType$3;
            }
          }]);
          return Tooltip2;
        }();
        $__default["default"].fn[NAME$4] = Tooltip._jQueryInterface;
        $__default["default"].fn[NAME$4].Constructor = Tooltip;
        $__default["default"].fn[NAME$4].noConflict = function() {
          $__default["default"].fn[NAME$4] = JQUERY_NO_CONFLICT$4;
          return Tooltip._jQueryInterface;
        };
        var NAME$3 = "popover";
        var VERSION$3 = "4.6.1";
        var DATA_KEY$3 = "bs.popover";
        var EVENT_KEY$3 = "." + DATA_KEY$3;
        var JQUERY_NO_CONFLICT$3 = $__default["default"].fn[NAME$3];
        var CLASS_PREFIX = "bs-popover";
        var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", "g");
        var CLASS_NAME_FADE$2 = "fade";
        var CLASS_NAME_SHOW$2 = "show";
        var SELECTOR_TITLE = ".popover-header";
        var SELECTOR_CONTENT = ".popover-body";
        var Default$2 = _extends2({}, Tooltip.Default, {
          placement: "right",
          trigger: "click",
          content: "",
          template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
        });
        var DefaultType$2 = _extends2({}, Tooltip.DefaultType, {
          content: "(string|element|function)"
        });
        var Event2 = {
          HIDE: "hide" + EVENT_KEY$3,
          HIDDEN: "hidden" + EVENT_KEY$3,
          SHOW: "show" + EVENT_KEY$3,
          SHOWN: "shown" + EVENT_KEY$3,
          INSERTED: "inserted" + EVENT_KEY$3,
          CLICK: "click" + EVENT_KEY$3,
          FOCUSIN: "focusin" + EVENT_KEY$3,
          FOCUSOUT: "focusout" + EVENT_KEY$3,
          MOUSEENTER: "mouseenter" + EVENT_KEY$3,
          MOUSELEAVE: "mouseleave" + EVENT_KEY$3
        };
        var Popover = function(_Tooltip) {
          _inheritsLoose(Popover2, _Tooltip);
          function Popover2() {
            return _Tooltip.apply(this, arguments) || this;
          }
          var _proto = Popover2.prototype;
          _proto.isWithContent = function isWithContent() {
            return this.getTitle() || this._getContent();
          };
          _proto.addAttachmentClass = function addAttachmentClass(attachment) {
            $__default["default"](this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
          };
          _proto.getTipElement = function getTipElement() {
            this.tip = this.tip || $__default["default"](this.config.template)[0];
            return this.tip;
          };
          _proto.setContent = function setContent() {
            var $tip = $__default["default"](this.getTipElement());
            this.setElementContent($tip.find(SELECTOR_TITLE), this.getTitle());
            var content = this._getContent();
            if (typeof content === "function") {
              content = content.call(this.element);
            }
            this.setElementContent($tip.find(SELECTOR_CONTENT), content);
            $tip.removeClass(CLASS_NAME_FADE$2 + " " + CLASS_NAME_SHOW$2);
          };
          _proto._getContent = function _getContent() {
            return this.element.getAttribute("data-content") || this.config.content;
          };
          _proto._cleanTipClass = function _cleanTipClass() {
            var $tip = $__default["default"](this.getTipElement());
            var tabClass = $tip.attr("class").match(BSCLS_PREFIX_REGEX);
            if (tabClass !== null && tabClass.length > 0) {
              $tip.removeClass(tabClass.join(""));
            }
          };
          Popover2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var data = $__default["default"](this).data(DATA_KEY$3);
              var _config = typeof config === "object" ? config : null;
              if (!data && /dispose|hide/.test(config)) {
                return;
              }
              if (!data) {
                data = new Popover2(this, _config);
                $__default["default"](this).data(DATA_KEY$3, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          _createClass(Popover2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$3;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$2;
            }
          }, {
            key: "NAME",
            get: function get() {
              return NAME$3;
            }
          }, {
            key: "DATA_KEY",
            get: function get() {
              return DATA_KEY$3;
            }
          }, {
            key: "Event",
            get: function get() {
              return Event2;
            }
          }, {
            key: "EVENT_KEY",
            get: function get() {
              return EVENT_KEY$3;
            }
          }, {
            key: "DefaultType",
            get: function get() {
              return DefaultType$2;
            }
          }]);
          return Popover2;
        }(Tooltip);
        $__default["default"].fn[NAME$3] = Popover._jQueryInterface;
        $__default["default"].fn[NAME$3].Constructor = Popover;
        $__default["default"].fn[NAME$3].noConflict = function() {
          $__default["default"].fn[NAME$3] = JQUERY_NO_CONFLICT$3;
          return Popover._jQueryInterface;
        };
        var NAME$2 = "scrollspy";
        var VERSION$2 = "4.6.1";
        var DATA_KEY$2 = "bs.scrollspy";
        var EVENT_KEY$2 = "." + DATA_KEY$2;
        var DATA_API_KEY$1 = ".data-api";
        var JQUERY_NO_CONFLICT$2 = $__default["default"].fn[NAME$2];
        var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
        var CLASS_NAME_ACTIVE$1 = "active";
        var EVENT_ACTIVATE = "activate" + EVENT_KEY$2;
        var EVENT_SCROLL = "scroll" + EVENT_KEY$2;
        var EVENT_LOAD_DATA_API = "load" + EVENT_KEY$2 + DATA_API_KEY$1;
        var METHOD_OFFSET = "offset";
        var METHOD_POSITION = "position";
        var SELECTOR_DATA_SPY = '[data-spy="scroll"]';
        var SELECTOR_NAV_LIST_GROUP$1 = ".nav, .list-group";
        var SELECTOR_NAV_LINKS = ".nav-link";
        var SELECTOR_NAV_ITEMS = ".nav-item";
        var SELECTOR_LIST_ITEMS = ".list-group-item";
        var SELECTOR_DROPDOWN$1 = ".dropdown";
        var SELECTOR_DROPDOWN_ITEMS = ".dropdown-item";
        var SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
        var Default$1 = {
          offset: 10,
          method: "auto",
          target: ""
        };
        var DefaultType$1 = {
          offset: "number",
          method: "string",
          target: "(string|element)"
        };
        var ScrollSpy = function() {
          function ScrollSpy2(element, config) {
            var _this = this;
            this._element = element;
            this._scrollElement = element.tagName === "BODY" ? window : element;
            this._config = this._getConfig(config);
            this._selector = this._config.target + " " + SELECTOR_NAV_LINKS + "," + (this._config.target + " " + SELECTOR_LIST_ITEMS + ",") + (this._config.target + " " + SELECTOR_DROPDOWN_ITEMS);
            this._offsets = [];
            this._targets = [];
            this._activeTarget = null;
            this._scrollHeight = 0;
            $__default["default"](this._scrollElement).on(EVENT_SCROLL, function(event) {
              return _this._process(event);
            });
            this.refresh();
            this._process();
          }
          var _proto = ScrollSpy2.prototype;
          _proto.refresh = function refresh() {
            var _this2 = this;
            var autoMethod = this._scrollElement === this._scrollElement.window ? METHOD_OFFSET : METHOD_POSITION;
            var offsetMethod = this._config.method === "auto" ? autoMethod : this._config.method;
            var offsetBase = offsetMethod === METHOD_POSITION ? this._getScrollTop() : 0;
            this._offsets = [];
            this._targets = [];
            this._scrollHeight = this._getScrollHeight();
            var targets = [].slice.call(document.querySelectorAll(this._selector));
            targets.map(function(element) {
              var target;
              var targetSelector = Util.getSelectorFromElement(element);
              if (targetSelector) {
                target = document.querySelector(targetSelector);
              }
              if (target) {
                var targetBCR = target.getBoundingClientRect();
                if (targetBCR.width || targetBCR.height) {
                  return [$__default["default"](target)[offsetMethod]().top + offsetBase, targetSelector];
                }
              }
              return null;
            }).filter(function(item) {
              return item;
            }).sort(function(a, b) {
              return a[0] - b[0];
            }).forEach(function(item) {
              _this2._offsets.push(item[0]);
              _this2._targets.push(item[1]);
            });
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$2);
            $__default["default"](this._scrollElement).off(EVENT_KEY$2);
            this._element = null;
            this._scrollElement = null;
            this._config = null;
            this._selector = null;
            this._offsets = null;
            this._targets = null;
            this._activeTarget = null;
            this._scrollHeight = null;
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, Default$1, typeof config === "object" && config ? config : {});
            if (typeof config.target !== "string" && Util.isElement(config.target)) {
              var id = $__default["default"](config.target).attr("id");
              if (!id) {
                id = Util.getUID(NAME$2);
                $__default["default"](config.target).attr("id", id);
              }
              config.target = "#" + id;
            }
            Util.typeCheckConfig(NAME$2, config, DefaultType$1);
            return config;
          };
          _proto._getScrollTop = function _getScrollTop() {
            return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
          };
          _proto._getScrollHeight = function _getScrollHeight() {
            return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          };
          _proto._getOffsetHeight = function _getOffsetHeight() {
            return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
          };
          _proto._process = function _process() {
            var scrollTop = this._getScrollTop() + this._config.offset;
            var scrollHeight = this._getScrollHeight();
            var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();
            if (this._scrollHeight !== scrollHeight) {
              this.refresh();
            }
            if (scrollTop >= maxScroll) {
              var target = this._targets[this._targets.length - 1];
              if (this._activeTarget !== target) {
                this._activate(target);
              }
              return;
            }
            if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
              this._activeTarget = null;
              this._clear();
              return;
            }
            for (var i = this._offsets.length; i--; ) {
              var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === "undefined" || scrollTop < this._offsets[i + 1]);
              if (isActiveTarget) {
                this._activate(this._targets[i]);
              }
            }
          };
          _proto._activate = function _activate(target) {
            this._activeTarget = target;
            this._clear();
            var queries = this._selector.split(",").map(function(selector) {
              return selector + '[data-target="' + target + '"],' + selector + '[href="' + target + '"]';
            });
            var $link = $__default["default"]([].slice.call(document.querySelectorAll(queries.join(","))));
            if ($link.hasClass(CLASS_NAME_DROPDOWN_ITEM)) {
              $link.closest(SELECTOR_DROPDOWN$1).find(SELECTOR_DROPDOWN_TOGGLE$1).addClass(CLASS_NAME_ACTIVE$1);
              $link.addClass(CLASS_NAME_ACTIVE$1);
            } else {
              $link.addClass(CLASS_NAME_ACTIVE$1);
              $link.parents(SELECTOR_NAV_LIST_GROUP$1).prev(SELECTOR_NAV_LINKS + ", " + SELECTOR_LIST_ITEMS).addClass(CLASS_NAME_ACTIVE$1);
              $link.parents(SELECTOR_NAV_LIST_GROUP$1).prev(SELECTOR_NAV_ITEMS).children(SELECTOR_NAV_LINKS).addClass(CLASS_NAME_ACTIVE$1);
            }
            $__default["default"](this._scrollElement).trigger(EVENT_ACTIVATE, {
              relatedTarget: target
            });
          };
          _proto._clear = function _clear() {
            [].slice.call(document.querySelectorAll(this._selector)).filter(function(node) {
              return node.classList.contains(CLASS_NAME_ACTIVE$1);
            }).forEach(function(node) {
              return node.classList.remove(CLASS_NAME_ACTIVE$1);
            });
          };
          ScrollSpy2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var data = $__default["default"](this).data(DATA_KEY$2);
              var _config = typeof config === "object" && config;
              if (!data) {
                data = new ScrollSpy2(this, _config);
                $__default["default"](this).data(DATA_KEY$2, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          _createClass(ScrollSpy2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$2;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default$1;
            }
          }]);
          return ScrollSpy2;
        }();
        $__default["default"](window).on(EVENT_LOAD_DATA_API, function() {
          var scrollSpys = [].slice.call(document.querySelectorAll(SELECTOR_DATA_SPY));
          var scrollSpysLength = scrollSpys.length;
          for (var i = scrollSpysLength; i--; ) {
            var $spy = $__default["default"](scrollSpys[i]);
            ScrollSpy._jQueryInterface.call($spy, $spy.data());
          }
        });
        $__default["default"].fn[NAME$2] = ScrollSpy._jQueryInterface;
        $__default["default"].fn[NAME$2].Constructor = ScrollSpy;
        $__default["default"].fn[NAME$2].noConflict = function() {
          $__default["default"].fn[NAME$2] = JQUERY_NO_CONFLICT$2;
          return ScrollSpy._jQueryInterface;
        };
        var NAME$1 = "tab";
        var VERSION$1 = "4.6.1";
        var DATA_KEY$1 = "bs.tab";
        var EVENT_KEY$1 = "." + DATA_KEY$1;
        var DATA_API_KEY = ".data-api";
        var JQUERY_NO_CONFLICT$1 = $__default["default"].fn[NAME$1];
        var CLASS_NAME_DROPDOWN_MENU = "dropdown-menu";
        var CLASS_NAME_ACTIVE = "active";
        var CLASS_NAME_DISABLED = "disabled";
        var CLASS_NAME_FADE$1 = "fade";
        var CLASS_NAME_SHOW$1 = "show";
        var EVENT_HIDE$1 = "hide" + EVENT_KEY$1;
        var EVENT_HIDDEN$1 = "hidden" + EVENT_KEY$1;
        var EVENT_SHOW$1 = "show" + EVENT_KEY$1;
        var EVENT_SHOWN$1 = "shown" + EVENT_KEY$1;
        var EVENT_CLICK_DATA_API = "click" + EVENT_KEY$1 + DATA_API_KEY;
        var SELECTOR_DROPDOWN = ".dropdown";
        var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
        var SELECTOR_ACTIVE = ".active";
        var SELECTOR_ACTIVE_UL = "> li > .active";
        var SELECTOR_DATA_TOGGLE = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]';
        var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
        var SELECTOR_DROPDOWN_ACTIVE_CHILD = "> .dropdown-menu .active";
        var Tab = function() {
          function Tab2(element) {
            this._element = element;
          }
          var _proto = Tab2.prototype;
          _proto.show = function show() {
            var _this = this;
            if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $__default["default"](this._element).hasClass(CLASS_NAME_ACTIVE) || $__default["default"](this._element).hasClass(CLASS_NAME_DISABLED)) {
              return;
            }
            var target;
            var previous;
            var listElement = $__default["default"](this._element).closest(SELECTOR_NAV_LIST_GROUP)[0];
            var selector = Util.getSelectorFromElement(this._element);
            if (listElement) {
              var itemSelector = listElement.nodeName === "UL" || listElement.nodeName === "OL" ? SELECTOR_ACTIVE_UL : SELECTOR_ACTIVE;
              previous = $__default["default"].makeArray($__default["default"](listElement).find(itemSelector));
              previous = previous[previous.length - 1];
            }
            var hideEvent = $__default["default"].Event(EVENT_HIDE$1, {
              relatedTarget: this._element
            });
            var showEvent = $__default["default"].Event(EVENT_SHOW$1, {
              relatedTarget: previous
            });
            if (previous) {
              $__default["default"](previous).trigger(hideEvent);
            }
            $__default["default"](this._element).trigger(showEvent);
            if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
              return;
            }
            if (selector) {
              target = document.querySelector(selector);
            }
            this._activate(this._element, listElement);
            var complete = function complete2() {
              var hiddenEvent = $__default["default"].Event(EVENT_HIDDEN$1, {
                relatedTarget: _this._element
              });
              var shownEvent = $__default["default"].Event(EVENT_SHOWN$1, {
                relatedTarget: previous
              });
              $__default["default"](previous).trigger(hiddenEvent);
              $__default["default"](_this._element).trigger(shownEvent);
            };
            if (target) {
              this._activate(target, target.parentNode, complete);
            } else {
              complete();
            }
          };
          _proto.dispose = function dispose() {
            $__default["default"].removeData(this._element, DATA_KEY$1);
            this._element = null;
          };
          _proto._activate = function _activate(element, container, callback) {
            var _this2 = this;
            var activeElements = container && (container.nodeName === "UL" || container.nodeName === "OL") ? $__default["default"](container).find(SELECTOR_ACTIVE_UL) : $__default["default"](container).children(SELECTOR_ACTIVE);
            var active = activeElements[0];
            var isTransitioning = callback && active && $__default["default"](active).hasClass(CLASS_NAME_FADE$1);
            var complete = function complete2() {
              return _this2._transitionComplete(element, active, callback);
            };
            if (active && isTransitioning) {
              var transitionDuration = Util.getTransitionDurationFromElement(active);
              $__default["default"](active).removeClass(CLASS_NAME_SHOW$1).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            } else {
              complete();
            }
          };
          _proto._transitionComplete = function _transitionComplete(element, active, callback) {
            if (active) {
              $__default["default"](active).removeClass(CLASS_NAME_ACTIVE);
              var dropdownChild = $__default["default"](active.parentNode).find(SELECTOR_DROPDOWN_ACTIVE_CHILD)[0];
              if (dropdownChild) {
                $__default["default"](dropdownChild).removeClass(CLASS_NAME_ACTIVE);
              }
              if (active.getAttribute("role") === "tab") {
                active.setAttribute("aria-selected", false);
              }
            }
            $__default["default"](element).addClass(CLASS_NAME_ACTIVE);
            if (element.getAttribute("role") === "tab") {
              element.setAttribute("aria-selected", true);
            }
            Util.reflow(element);
            if (element.classList.contains(CLASS_NAME_FADE$1)) {
              element.classList.add(CLASS_NAME_SHOW$1);
            }
            var parent = element.parentNode;
            if (parent && parent.nodeName === "LI") {
              parent = parent.parentNode;
            }
            if (parent && $__default["default"](parent).hasClass(CLASS_NAME_DROPDOWN_MENU)) {
              var dropdownElement = $__default["default"](element).closest(SELECTOR_DROPDOWN)[0];
              if (dropdownElement) {
                var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(SELECTOR_DROPDOWN_TOGGLE));
                $__default["default"](dropdownToggleList).addClass(CLASS_NAME_ACTIVE);
              }
              element.setAttribute("aria-expanded", true);
            }
            if (callback) {
              callback();
            }
          };
          Tab2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var $this = $__default["default"](this);
              var data = $this.data(DATA_KEY$1);
              if (!data) {
                data = new Tab2(this);
                $this.data(DATA_KEY$1, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config]();
              }
            });
          };
          _createClass(Tab2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION$1;
            }
          }]);
          return Tab2;
        }();
        $__default["default"](document).on(EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
          event.preventDefault();
          Tab._jQueryInterface.call($__default["default"](this), "show");
        });
        $__default["default"].fn[NAME$1] = Tab._jQueryInterface;
        $__default["default"].fn[NAME$1].Constructor = Tab;
        $__default["default"].fn[NAME$1].noConflict = function() {
          $__default["default"].fn[NAME$1] = JQUERY_NO_CONFLICT$1;
          return Tab._jQueryInterface;
        };
        var NAME = "toast";
        var VERSION = "4.6.1";
        var DATA_KEY = "bs.toast";
        var EVENT_KEY = "." + DATA_KEY;
        var JQUERY_NO_CONFLICT = $__default["default"].fn[NAME];
        var CLASS_NAME_FADE = "fade";
        var CLASS_NAME_HIDE = "hide";
        var CLASS_NAME_SHOW = "show";
        var CLASS_NAME_SHOWING = "showing";
        var EVENT_CLICK_DISMISS = "click.dismiss" + EVENT_KEY;
        var EVENT_HIDE = "hide" + EVENT_KEY;
        var EVENT_HIDDEN = "hidden" + EVENT_KEY;
        var EVENT_SHOW = "show" + EVENT_KEY;
        var EVENT_SHOWN = "shown" + EVENT_KEY;
        var SELECTOR_DATA_DISMISS = '[data-dismiss="toast"]';
        var Default = {
          animation: true,
          autohide: true,
          delay: 500
        };
        var DefaultType = {
          animation: "boolean",
          autohide: "boolean",
          delay: "number"
        };
        var Toast = function() {
          function Toast2(element, config) {
            this._element = element;
            this._config = this._getConfig(config);
            this._timeout = null;
            this._setListeners();
          }
          var _proto = Toast2.prototype;
          _proto.show = function show() {
            var _this = this;
            var showEvent = $__default["default"].Event(EVENT_SHOW);
            $__default["default"](this._element).trigger(showEvent);
            if (showEvent.isDefaultPrevented()) {
              return;
            }
            this._clearTimeout();
            if (this._config.animation) {
              this._element.classList.add(CLASS_NAME_FADE);
            }
            var complete = function complete2() {
              _this._element.classList.remove(CLASS_NAME_SHOWING);
              _this._element.classList.add(CLASS_NAME_SHOW);
              $__default["default"](_this._element).trigger(EVENT_SHOWN);
              if (_this._config.autohide) {
                _this._timeout = setTimeout(function() {
                  _this.hide();
                }, _this._config.delay);
              }
            };
            this._element.classList.remove(CLASS_NAME_HIDE);
            Util.reflow(this._element);
            this._element.classList.add(CLASS_NAME_SHOWING);
            if (this._config.animation) {
              var transitionDuration = Util.getTransitionDurationFromElement(this._element);
              $__default["default"](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            } else {
              complete();
            }
          };
          _proto.hide = function hide2() {
            if (!this._element.classList.contains(CLASS_NAME_SHOW)) {
              return;
            }
            var hideEvent = $__default["default"].Event(EVENT_HIDE);
            $__default["default"](this._element).trigger(hideEvent);
            if (hideEvent.isDefaultPrevented()) {
              return;
            }
            this._close();
          };
          _proto.dispose = function dispose() {
            this._clearTimeout();
            if (this._element.classList.contains(CLASS_NAME_SHOW)) {
              this._element.classList.remove(CLASS_NAME_SHOW);
            }
            $__default["default"](this._element).off(EVENT_CLICK_DISMISS);
            $__default["default"].removeData(this._element, DATA_KEY);
            this._element = null;
            this._config = null;
          };
          _proto._getConfig = function _getConfig(config) {
            config = _extends2({}, Default, $__default["default"](this._element).data(), typeof config === "object" && config ? config : {});
            Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
            return config;
          };
          _proto._setListeners = function _setListeners() {
            var _this2 = this;
            $__default["default"](this._element).on(EVENT_CLICK_DISMISS, SELECTOR_DATA_DISMISS, function() {
              return _this2.hide();
            });
          };
          _proto._close = function _close() {
            var _this3 = this;
            var complete = function complete2() {
              _this3._element.classList.add(CLASS_NAME_HIDE);
              $__default["default"](_this3._element).trigger(EVENT_HIDDEN);
            };
            this._element.classList.remove(CLASS_NAME_SHOW);
            if (this._config.animation) {
              var transitionDuration = Util.getTransitionDurationFromElement(this._element);
              $__default["default"](this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
            } else {
              complete();
            }
          };
          _proto._clearTimeout = function _clearTimeout() {
            clearTimeout(this._timeout);
            this._timeout = null;
          };
          Toast2._jQueryInterface = function _jQueryInterface(config) {
            return this.each(function() {
              var $element = $__default["default"](this);
              var data = $element.data(DATA_KEY);
              var _config = typeof config === "object" && config;
              if (!data) {
                data = new Toast2(this, _config);
                $element.data(DATA_KEY, data);
              }
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError('No method named "' + config + '"');
                }
                data[config](this);
              }
            });
          };
          _createClass(Toast2, null, [{
            key: "VERSION",
            get: function get() {
              return VERSION;
            }
          }, {
            key: "DefaultType",
            get: function get() {
              return DefaultType;
            }
          }, {
            key: "Default",
            get: function get() {
              return Default;
            }
          }]);
          return Toast2;
        }();
        $__default["default"].fn[NAME] = Toast._jQueryInterface;
        $__default["default"].fn[NAME].Constructor = Toast;
        $__default["default"].fn[NAME].noConflict = function() {
          $__default["default"].fn[NAME] = JQUERY_NO_CONFLICT;
          return Toast._jQueryInterface;
        };
        exports4.Alert = Alert;
        exports4.Button = Button;
        exports4.Carousel = Carousel;
        exports4.Collapse = Collapse;
        exports4.Dropdown = Dropdown;
        exports4.Modal = Modal;
        exports4.Popover = Popover;
        exports4.Scrollspy = ScrollSpy;
        exports4.Tab = Tab;
        exports4.Toast = Toast;
        exports4.Tooltip = Tooltip;
        exports4.Util = Util;
        Object.defineProperty(exports4, "__esModule", {
          value: true
        });
      });
    })(bootstrap, bootstrap.exports);
    const $ = jquery;
    document.addEventListener("spree:load", function() {
      $(".with-tip").each(function() {
        $(this).tooltip({
          container: $(this)
        });
      });
      $(".with-tip").on("show.bs.tooltip", function(event) {
        if ("ontouchstart" in window) {
          event.preventDefault();
        }
      });
    });
    class UploadButtonController extends Controller {
      static targets = ["uploadButton"];
      initialize() {
        this.uploadButtonTarget.disabled = true;
      }
      buttonState() {
        this.uploadButtonTarget.disabled = false;
      }
    }
    class SpreeController extends Controller {
      connect() {
        const event = new Event("spree:load");
        document.dispatchEvent(event);
      }
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
          symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }
        keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
          ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }
      return target;
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _extends() {
      _extends = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null)
        return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        target[key] = source[key];
      }
      return target;
    }
    function _objectWithoutProperties(source, excluded) {
      if (source == null)
        return {};
      var target = _objectWithoutPropertiesLoose(source, excluded);
      var key, i;
      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0)
            continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key))
            continue;
          target[key] = source[key];
        }
      }
      return target;
    }
    var version = "1.14.0";
    function userAgent(pattern) {
      if (typeof window !== "undefined" && window.navigator) {
        return !!navigator.userAgent.match(pattern);
      }
    }
    var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
    var Edge = userAgent(/Edge/i);
    var FireFox = userAgent(/firefox/i);
    var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
    var IOS = userAgent(/iP(ad|od|hone)/i);
    var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
    var captureMode = {
      capture: false,
      passive: false
    };
    function on(el, event, fn) {
      el.addEventListener(event, fn, !IE11OrLess && captureMode);
    }
    function off(el, event, fn) {
      el.removeEventListener(event, fn, !IE11OrLess && captureMode);
    }
    function matches(el, selector) {
      if (!selector)
        return;
      selector[0] === ">" && (selector = selector.substring(1));
      if (el) {
        try {
          if (el.matches) {
            return el.matches(selector);
          } else if (el.msMatchesSelector) {
            return el.msMatchesSelector(selector);
          } else if (el.webkitMatchesSelector) {
            return el.webkitMatchesSelector(selector);
          }
        } catch (_) {
          return false;
        }
      }
      return false;
    }
    function getParentOrHost(el) {
      return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
    }
    function closest(el, selector, ctx, includeCTX) {
      if (el) {
        ctx = ctx || document;
        do {
          if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
            return el;
          }
          if (el === ctx)
            break;
        } while (el = getParentOrHost(el));
      }
      return null;
    }
    var R_SPACE = /\s+/g;
    function toggleClass(el, name, state) {
      if (el && name) {
        if (el.classList) {
          el.classList[state ? "add" : "remove"](name);
        } else {
          var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
          el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
        }
      }
    }
    function css(el, prop, val) {
      var style = el && el.style;
      if (style) {
        if (val === void 0) {
          if (document.defaultView && document.defaultView.getComputedStyle) {
            val = document.defaultView.getComputedStyle(el, "");
          } else if (el.currentStyle) {
            val = el.currentStyle;
          }
          return prop === void 0 ? val : val[prop];
        } else {
          if (!(prop in style) && prop.indexOf("webkit") === -1) {
            prop = "-webkit-" + prop;
          }
          style[prop] = val + (typeof val === "string" ? "" : "px");
        }
      }
    }
    function matrix(el, selfOnly) {
      var appliedTransforms = "";
      if (typeof el === "string") {
        appliedTransforms = el;
      } else {
        do {
          var transform = css(el, "transform");
          if (transform && transform !== "none") {
            appliedTransforms = transform + " " + appliedTransforms;
          }
        } while (!selfOnly && (el = el.parentNode));
      }
      var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
      return matrixFn && new matrixFn(appliedTransforms);
    }
    function find(ctx, tagName, iterator) {
      if (ctx) {
        var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
        if (iterator) {
          for (; i < n; i++) {
            iterator(list[i], i);
          }
        }
        return list;
      }
      return [];
    }
    function getWindowScrollingElement() {
      var scrollingElement = document.scrollingElement;
      if (scrollingElement) {
        return scrollingElement;
      } else {
        return document.documentElement;
      }
    }
    function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
      if (!el.getBoundingClientRect && el !== window)
        return;
      var elRect, top, left, bottom, right, height, width;
      if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
        elRect = el.getBoundingClientRect();
        top = elRect.top;
        left = elRect.left;
        bottom = elRect.bottom;
        right = elRect.right;
        height = elRect.height;
        width = elRect.width;
      } else {
        top = 0;
        left = 0;
        bottom = window.innerHeight;
        right = window.innerWidth;
        height = window.innerHeight;
        width = window.innerWidth;
      }
      if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
        container = container || el.parentNode;
        if (!IE11OrLess) {
          do {
            if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
              var containerRect = container.getBoundingClientRect();
              top -= containerRect.top + parseInt(css(container, "border-top-width"));
              left -= containerRect.left + parseInt(css(container, "border-left-width"));
              bottom = top + elRect.height;
              right = left + elRect.width;
              break;
            }
          } while (container = container.parentNode);
        }
      }
      if (undoScale && el !== window) {
        var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
        if (elMatrix) {
          top /= scaleY;
          left /= scaleX;
          width /= scaleX;
          height /= scaleY;
          bottom = top + height;
          right = left + width;
        }
      }
      return {
        top,
        left,
        bottom,
        right,
        width,
        height
      };
    }
    function isScrolledPast(el, elSide, parentSide) {
      var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
      while (parent) {
        var parentSideVal = getRect(parent)[parentSide], visible = void 0;
        if (parentSide === "top" || parentSide === "left") {
          visible = elSideVal >= parentSideVal;
        } else {
          visible = elSideVal <= parentSideVal;
        }
        if (!visible)
          return parent;
        if (parent === getWindowScrollingElement())
          break;
        parent = getParentAutoScrollElement(parent, false);
      }
      return false;
    }
    function getChild(el, childNum, options, includeDragEl) {
      var currentChild = 0, i = 0, children = el.children;
      while (i < children.length) {
        if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
          if (currentChild === childNum) {
            return children[i];
          }
          currentChild++;
        }
        i++;
      }
      return null;
    }
    function lastChild(el, selector) {
      var last = el.lastElementChild;
      while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
        last = last.previousElementSibling;
      }
      return last || null;
    }
    function index(el, selector) {
      var index2 = 0;
      if (!el || !el.parentNode) {
        return -1;
      }
      while (el = el.previousElementSibling) {
        if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
          index2++;
        }
      }
      return index2;
    }
    function getRelativeScrollOffset(el) {
      var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
      if (el) {
        do {
          var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
          offsetLeft += el.scrollLeft * scaleX;
          offsetTop += el.scrollTop * scaleY;
        } while (el !== winScroller && (el = el.parentNode));
      }
      return [offsetLeft, offsetTop];
    }
    function indexOfObject(arr, obj) {
      for (var i in arr) {
        if (!arr.hasOwnProperty(i))
          continue;
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && obj[key] === arr[i][key])
            return Number(i);
        }
      }
      return -1;
    }
    function getParentAutoScrollElement(el, includeSelf) {
      if (!el || !el.getBoundingClientRect)
        return getWindowScrollingElement();
      var elem = el;
      var gotSelf = false;
      do {
        if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
          var elemCSS = css(elem);
          if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
            if (!elem.getBoundingClientRect || elem === document.body)
              return getWindowScrollingElement();
            if (gotSelf || includeSelf)
              return elem;
            gotSelf = true;
          }
        }
      } while (elem = elem.parentNode);
      return getWindowScrollingElement();
    }
    function extend(dst, src) {
      if (dst && src) {
        for (var key in src) {
          if (src.hasOwnProperty(key)) {
            dst[key] = src[key];
          }
        }
      }
      return dst;
    }
    function isRectEqual(rect1, rect2) {
      return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
    }
    var _throttleTimeout;
    function throttle(callback, ms) {
      return function() {
        if (!_throttleTimeout) {
          var args = arguments, _this = this;
          if (args.length === 1) {
            callback.call(_this, args[0]);
          } else {
            callback.apply(_this, args);
          }
          _throttleTimeout = setTimeout(function() {
            _throttleTimeout = void 0;
          }, ms);
        }
      };
    }
    function cancelThrottle() {
      clearTimeout(_throttleTimeout);
      _throttleTimeout = void 0;
    }
    function scrollBy(el, x, y) {
      el.scrollLeft += x;
      el.scrollTop += y;
    }
    function clone(el) {
      var Polymer = window.Polymer;
      var $2 = window.jQuery || window.Zepto;
      if (Polymer && Polymer.dom) {
        return Polymer.dom(el).cloneNode(true);
      } else if ($2) {
        return $2(el).clone(true)[0];
      } else {
        return el.cloneNode(true);
      }
    }
    var expando = "Sortable" + new Date().getTime();
    function AnimationStateManager() {
      var animationStates = [], animationCallbackId;
      return {
        captureAnimationState: function captureAnimationState() {
          animationStates = [];
          if (!this.options.animation)
            return;
          var children = [].slice.call(this.el.children);
          children.forEach(function(child) {
            if (css(child, "display") === "none" || child === Sortable.ghost)
              return;
            animationStates.push({
              target: child,
              rect: getRect(child)
            });
            var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
            if (child.thisAnimationDuration) {
              var childMatrix = matrix(child, true);
              if (childMatrix) {
                fromRect.top -= childMatrix.f;
                fromRect.left -= childMatrix.e;
              }
            }
            child.fromRect = fromRect;
          });
        },
        addAnimationState: function addAnimationState(state) {
          animationStates.push(state);
        },
        removeAnimationState: function removeAnimationState(target) {
          animationStates.splice(indexOfObject(animationStates, {
            target
          }), 1);
        },
        animateAll: function animateAll(callback) {
          var _this = this;
          if (!this.options.animation) {
            clearTimeout(animationCallbackId);
            if (typeof callback === "function")
              callback();
            return;
          }
          var animating = false, animationTime = 0;
          animationStates.forEach(function(state) {
            var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
            if (targetMatrix) {
              toRect.top -= targetMatrix.f;
              toRect.left -= targetMatrix.e;
            }
            target.toRect = toRect;
            if (target.thisAnimationDuration) {
              if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
                time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
              }
            }
            if (!isRectEqual(toRect, fromRect)) {
              target.prevFromRect = fromRect;
              target.prevToRect = toRect;
              if (!time) {
                time = _this.options.animation;
              }
              _this.animate(target, animatingRect, toRect, time);
            }
            if (time) {
              animating = true;
              animationTime = Math.max(animationTime, time);
              clearTimeout(target.animationResetTimer);
              target.animationResetTimer = setTimeout(function() {
                target.animationTime = 0;
                target.prevFromRect = null;
                target.fromRect = null;
                target.prevToRect = null;
                target.thisAnimationDuration = null;
              }, time);
              target.thisAnimationDuration = time;
            }
          });
          clearTimeout(animationCallbackId);
          if (!animating) {
            if (typeof callback === "function")
              callback();
          } else {
            animationCallbackId = setTimeout(function() {
              if (typeof callback === "function")
                callback();
            }, animationTime);
          }
          animationStates = [];
        },
        animate: function animate(target, currentRect, toRect, duration2) {
          if (duration2) {
            css(target, "transition", "");
            css(target, "transform", "");
            var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
            target.animatingX = !!translateX;
            target.animatingY = !!translateY;
            css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
            this.forRepaintDummy = repaint(target);
            css(target, "transition", "transform " + duration2 + "ms" + (this.options.easing ? " " + this.options.easing : ""));
            css(target, "transform", "translate3d(0,0,0)");
            typeof target.animated === "number" && clearTimeout(target.animated);
            target.animated = setTimeout(function() {
              css(target, "transition", "");
              css(target, "transform", "");
              target.animated = false;
              target.animatingX = false;
              target.animatingY = false;
            }, duration2);
          }
        }
      };
    }
    function repaint(target) {
      return target.offsetWidth;
    }
    function calculateRealTime(animatingRect, fromRect, toRect, options) {
      return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
    }
    var plugins = [];
    var defaults = {
      initializeByDefault: true
    };
    var PluginManager = {
      mount: function mount(plugin) {
        for (var option in defaults) {
          if (defaults.hasOwnProperty(option) && !(option in plugin)) {
            plugin[option] = defaults[option];
          }
        }
        plugins.forEach(function(p) {
          if (p.pluginName === plugin.pluginName) {
            throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
          }
        });
        plugins.push(plugin);
      },
      pluginEvent: function pluginEvent2(eventName, sortable, evt) {
        var _this = this;
        this.eventCanceled = false;
        evt.cancel = function() {
          _this.eventCanceled = true;
        };
        var eventNameGlobal = eventName + "Global";
        plugins.forEach(function(plugin) {
          if (!sortable[plugin.pluginName])
            return;
          if (sortable[plugin.pluginName][eventNameGlobal]) {
            sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
              sortable
            }, evt));
          }
          if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
            sortable[plugin.pluginName][eventName](_objectSpread2({
              sortable
            }, evt));
          }
        });
      },
      initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
        plugins.forEach(function(plugin) {
          var pluginName = plugin.pluginName;
          if (!sortable.options[pluginName] && !plugin.initializeByDefault)
            return;
          var initialized = new plugin(sortable, el, sortable.options);
          initialized.sortable = sortable;
          initialized.options = sortable.options;
          sortable[pluginName] = initialized;
          _extends(defaults2, initialized.defaults);
        });
        for (var option in sortable.options) {
          if (!sortable.options.hasOwnProperty(option))
            continue;
          var modified = this.modifyOption(sortable, option, sortable.options[option]);
          if (typeof modified !== "undefined") {
            sortable.options[option] = modified;
          }
        }
      },
      getEventProperties: function getEventProperties(name, sortable) {
        var eventProperties = {};
        plugins.forEach(function(plugin) {
          if (typeof plugin.eventProperties !== "function")
            return;
          _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
        });
        return eventProperties;
      },
      modifyOption: function modifyOption(sortable, name, value) {
        var modifiedValue;
        plugins.forEach(function(plugin) {
          if (!sortable[plugin.pluginName])
            return;
          if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
            modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
          }
        });
        return modifiedValue;
      }
    };
    function dispatchEvent$1(_ref) {
      var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
      sortable = sortable || rootEl2 && rootEl2[expando];
      if (!sortable)
        return;
      var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
      if (window.CustomEvent && !IE11OrLess && !Edge) {
        evt = new CustomEvent(name, {
          bubbles: true,
          cancelable: true
        });
      } else {
        evt = document.createEvent("Event");
        evt.initEvent(name, true, true);
      }
      evt.to = toEl || rootEl2;
      evt.from = fromEl || rootEl2;
      evt.item = targetEl || rootEl2;
      evt.clone = cloneEl2;
      evt.oldIndex = oldIndex2;
      evt.newIndex = newIndex2;
      evt.oldDraggableIndex = oldDraggableIndex2;
      evt.newDraggableIndex = newDraggableIndex2;
      evt.originalEvent = originalEvent;
      evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
      var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
      for (var option in allEventProperties) {
        evt[option] = allEventProperties[option];
      }
      if (rootEl2) {
        rootEl2.dispatchEvent(evt);
      }
      if (options[onName]) {
        options[onName].call(sortable, evt);
      }
    }
    var _excluded = ["evt"];
    var pluginEvent = function pluginEvent2(eventName, sortable) {
      var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
      PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
        dragEl,
        parentEl,
        ghostEl,
        rootEl,
        nextEl,
        lastDownEl,
        cloneEl,
        cloneHidden,
        dragStarted: moved,
        putSortable,
        activeSortable: Sortable.active,
        originalEvent,
        oldIndex,
        oldDraggableIndex,
        newIndex,
        newDraggableIndex,
        hideGhostForTarget: _hideGhostForTarget,
        unhideGhostForTarget: _unhideGhostForTarget,
        cloneNowHidden: function cloneNowHidden() {
          cloneHidden = true;
        },
        cloneNowShown: function cloneNowShown() {
          cloneHidden = false;
        },
        dispatchSortableEvent: function dispatchSortableEvent(name) {
          _dispatchEvent({
            sortable,
            name,
            originalEvent
          });
        }
      }, data));
    };
    function _dispatchEvent(info) {
      dispatchEvent$1(_objectSpread2({
        putSortable,
        cloneEl,
        targetEl: dragEl,
        rootEl,
        oldIndex,
        oldDraggableIndex,
        newIndex,
        newDraggableIndex
      }, info));
    }
    var dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted = false, ignoreNextClick = false, sortables = [], tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh = false, isCircumstantialInvert = false, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
    var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
      if (!documentExists)
        return;
      if (IE11OrLess) {
        return false;
      }
      var el = document.createElement("x");
      el.style.cssText = "pointer-events:auto";
      return el.style.pointerEvents === "auto";
    }(), _detectDirection = function _detectDirection2(el, options) {
      var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
      if (elCSS.display === "flex") {
        return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
      }
      if (elCSS.display === "grid") {
        return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
      }
      if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
        var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
        return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
      }
      return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
    }, _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
      var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
      return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
    }, _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
      var ret;
      sortables.some(function(sortable) {
        var threshold = sortable[expando].options.emptyInsertThreshold;
        if (!threshold || lastChild(sortable))
          return;
        var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
        if (insideHorizontally && insideVertically) {
          return ret = sortable;
        }
      });
      return ret;
    }, _prepareGroup = function _prepareGroup2(options) {
      function toFn(value, pull) {
        return function(to, from, dragEl2, evt) {
          var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
          if (value == null && (pull || sameGroup)) {
            return true;
          } else if (value == null || value === false) {
            return false;
          } else if (pull && value === "clone") {
            return value;
          } else if (typeof value === "function") {
            return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
          } else {
            var otherGroup = (pull ? to : from).options.group.name;
            return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
          }
        };
      }
      var group = {};
      var originalGroup = options.group;
      if (!originalGroup || _typeof(originalGroup) != "object") {
        originalGroup = {
          name: originalGroup
        };
      }
      group.name = originalGroup.name;
      group.checkPull = toFn(originalGroup.pull, true);
      group.checkPut = toFn(originalGroup.put);
      group.revertClone = originalGroup.revertClone;
      options.group = group;
    }, _hideGhostForTarget = function _hideGhostForTarget2() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, "display", "none");
      }
    }, _unhideGhostForTarget = function _unhideGhostForTarget2() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, "display", "");
      }
    };
    if (documentExists) {
      document.addEventListener("click", function(evt) {
        if (ignoreNextClick) {
          evt.preventDefault();
          evt.stopPropagation && evt.stopPropagation();
          evt.stopImmediatePropagation && evt.stopImmediatePropagation();
          ignoreNextClick = false;
          return false;
        }
      }, true);
    }
    var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
      if (dragEl) {
        evt = evt.touches ? evt.touches[0] : evt;
        var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
        if (nearest) {
          var event = {};
          for (var i in evt) {
            if (evt.hasOwnProperty(i)) {
              event[i] = evt[i];
            }
          }
          event.target = event.rootEl = nearest;
          event.preventDefault = void 0;
          event.stopPropagation = void 0;
          nearest[expando]._onDragOver(event);
        }
      }
    };
    var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
      if (dragEl) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
      }
    };
    function Sortable(el, options) {
      if (!(el && el.nodeType && el.nodeType === 1)) {
        throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
      }
      this.el = el;
      this.options = options = _extends({}, options);
      el[expando] = this;
      var defaults2 = {
        group: null,
        sort: true,
        disabled: false,
        store: null,
        handle: null,
        draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
        swapThreshold: 1,
        invertSwap: false,
        invertedSwapThreshold: null,
        removeCloneOnHide: true,
        direction: function direction() {
          return _detectDirection(el, this.options);
        },
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        ignore: "a, img",
        filter: null,
        preventOnFilter: true,
        animation: 0,
        easing: null,
        setData: function setData(dataTransfer, dragEl2) {
          dataTransfer.setData("Text", dragEl2.textContent);
        },
        dropBubble: false,
        dragoverBubble: false,
        dataIdAttr: "data-id",
        delay: 0,
        delayOnTouchOnly: false,
        touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
        forceFallback: false,
        fallbackClass: "sortable-fallback",
        fallbackOnBody: false,
        fallbackTolerance: 0,
        fallbackOffset: {
          x: 0,
          y: 0
        },
        supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
        emptyInsertThreshold: 5
      };
      PluginManager.initializePlugins(this, el, defaults2);
      for (var name in defaults2) {
        !(name in options) && (options[name] = defaults2[name]);
      }
      _prepareGroup(options);
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
      this.nativeDraggable = options.forceFallback ? false : supportDraggable;
      if (this.nativeDraggable) {
        this.options.touchStartThreshold = 1;
      }
      if (options.supportPointer) {
        on(el, "pointerdown", this._onTapStart);
      } else {
        on(el, "mousedown", this._onTapStart);
        on(el, "touchstart", this._onTapStart);
      }
      if (this.nativeDraggable) {
        on(el, "dragover", this);
        on(el, "dragenter", this);
      }
      sortables.push(this.el);
      options.store && options.store.get && this.sort(options.store.get(this) || []);
      _extends(this, AnimationStateManager());
    }
    Sortable.prototype = {
      constructor: Sortable,
      _isOutsideThisEl: function _isOutsideThisEl(target) {
        if (!this.el.contains(target) && target !== this.el) {
          lastTarget = null;
        }
      },
      _getDirection: function _getDirection(evt, target) {
        return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
      },
      _onTapStart: function _onTapStart(evt) {
        if (!evt.cancelable)
          return;
        var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
        _saveInputCheckedState(el);
        if (dragEl) {
          return;
        }
        if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
          return;
        }
        if (originalTarget.isContentEditable) {
          return;
        }
        if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
          return;
        }
        target = closest(target, options.draggable, el, false);
        if (target && target.animated) {
          return;
        }
        if (lastDownEl === target) {
          return;
        }
        oldIndex = index(target);
        oldDraggableIndex = index(target, options.draggable);
        if (typeof filter === "function") {
          if (filter.call(this, evt, target, this)) {
            _dispatchEvent({
              sortable: _this,
              rootEl: originalTarget,
              name: "filter",
              targetEl: target,
              toEl: el,
              fromEl: el
            });
            pluginEvent("filter", _this, {
              evt
            });
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return;
          }
        } else if (filter) {
          filter = filter.split(",").some(function(criteria) {
            criteria = closest(originalTarget, criteria.trim(), el, false);
            if (criteria) {
              _dispatchEvent({
                sortable: _this,
                rootEl: criteria,
                name: "filter",
                targetEl: target,
                fromEl: el,
                toEl: el
              });
              pluginEvent("filter", _this, {
                evt
              });
              return true;
            }
          });
          if (filter) {
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return;
          }
        }
        if (options.handle && !closest(originalTarget, options.handle, el, false)) {
          return;
        }
        this._prepareDragStart(evt, touch, target);
      },
      _prepareDragStart: function _prepareDragStart(evt, touch, target) {
        var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
        if (target && !dragEl && target.parentNode === el) {
          var dragRect = getRect(target);
          rootEl = el;
          dragEl = target;
          parentEl = dragEl.parentNode;
          nextEl = dragEl.nextSibling;
          lastDownEl = target;
          activeGroup = options.group;
          Sortable.dragged = dragEl;
          tapEvt = {
            target: dragEl,
            clientX: (touch || evt).clientX,
            clientY: (touch || evt).clientY
          };
          tapDistanceLeft = tapEvt.clientX - dragRect.left;
          tapDistanceTop = tapEvt.clientY - dragRect.top;
          this._lastX = (touch || evt).clientX;
          this._lastY = (touch || evt).clientY;
          dragEl.style["will-change"] = "all";
          dragStartFn = function dragStartFn2() {
            pluginEvent("delayEnded", _this, {
              evt
            });
            if (Sortable.eventCanceled) {
              _this._onDrop();
              return;
            }
            _this._disableDelayedDragEvents();
            if (!FireFox && _this.nativeDraggable) {
              dragEl.draggable = true;
            }
            _this._triggerDragStart(evt, touch);
            _dispatchEvent({
              sortable: _this,
              name: "choose",
              originalEvent: evt
            });
            toggleClass(dragEl, options.chosenClass, true);
          };
          options.ignore.split(",").forEach(function(criteria) {
            find(dragEl, criteria.trim(), _disableDraggable);
          });
          on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
          on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
          on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
          on(ownerDocument, "mouseup", _this._onDrop);
          on(ownerDocument, "touchend", _this._onDrop);
          on(ownerDocument, "touchcancel", _this._onDrop);
          if (FireFox && this.nativeDraggable) {
            this.options.touchStartThreshold = 4;
            dragEl.draggable = true;
          }
          pluginEvent("delayStart", this, {
            evt
          });
          if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
            if (Sortable.eventCanceled) {
              this._onDrop();
              return;
            }
            on(ownerDocument, "mouseup", _this._disableDelayedDrag);
            on(ownerDocument, "touchend", _this._disableDelayedDrag);
            on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
            on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
            on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
            options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
            _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
          } else {
            dragStartFn();
          }
        }
      },
      _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
        var touch = e.touches ? e.touches[0] : e;
        if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
          this._disableDelayedDrag();
        }
      },
      _disableDelayedDrag: function _disableDelayedDrag() {
        dragEl && _disableDraggable(dragEl);
        clearTimeout(this._dragStartTimer);
        this._disableDelayedDragEvents();
      },
      _disableDelayedDragEvents: function _disableDelayedDragEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, "mouseup", this._disableDelayedDrag);
        off(ownerDocument, "touchend", this._disableDelayedDrag);
        off(ownerDocument, "touchcancel", this._disableDelayedDrag);
        off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
        off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
        off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
      },
      _triggerDragStart: function _triggerDragStart(evt, touch) {
        touch = touch || evt.pointerType == "touch" && evt;
        if (!this.nativeDraggable || touch) {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._onTouchMove);
          } else if (touch) {
            on(document, "touchmove", this._onTouchMove);
          } else {
            on(document, "mousemove", this._onTouchMove);
          }
        } else {
          on(dragEl, "dragend", this);
          on(rootEl, "dragstart", this._onDragStart);
        }
        try {
          if (document.selection) {
            _nextTick(function() {
              document.selection.empty();
            });
          } else {
            window.getSelection().removeAllRanges();
          }
        } catch (err) {
        }
      },
      _dragStarted: function _dragStarted(fallback, evt) {
        awaitingDragStarted = false;
        if (rootEl && dragEl) {
          pluginEvent("dragStarted", this, {
            evt
          });
          if (this.nativeDraggable) {
            on(document, "dragover", _checkOutsideTargetEl);
          }
          var options = this.options;
          !fallback && toggleClass(dragEl, options.dragClass, false);
          toggleClass(dragEl, options.ghostClass, true);
          Sortable.active = this;
          fallback && this._appendGhost();
          _dispatchEvent({
            sortable: this,
            name: "start",
            originalEvent: evt
          });
        } else {
          this._nulling();
        }
      },
      _emulateDragOver: function _emulateDragOver() {
        if (touchEvt) {
          this._lastX = touchEvt.clientX;
          this._lastY = touchEvt.clientY;
          _hideGhostForTarget();
          var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          var parent = target;
          while (target && target.shadowRoot) {
            target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
            if (target === parent)
              break;
            parent = target;
          }
          dragEl.parentNode[expando]._isOutsideThisEl(target);
          if (parent) {
            do {
              if (parent[expando]) {
                var inserted = void 0;
                inserted = parent[expando]._onDragOver({
                  clientX: touchEvt.clientX,
                  clientY: touchEvt.clientY,
                  target,
                  rootEl: parent
                });
                if (inserted && !this.options.dragoverBubble) {
                  break;
                }
              }
              target = parent;
            } while (parent = parent.parentNode);
          }
          _unhideGhostForTarget();
        }
      },
      _onTouchMove: function _onTouchMove(evt) {
        if (tapEvt) {
          var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
          if (!Sortable.active && !awaitingDragStarted) {
            if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
              return;
            }
            this._onDragStart(evt, true);
          }
          if (ghostEl) {
            if (ghostMatrix) {
              ghostMatrix.e += dx - (lastDx || 0);
              ghostMatrix.f += dy - (lastDy || 0);
            } else {
              ghostMatrix = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: dx,
                f: dy
              };
            }
            var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
            css(ghostEl, "webkitTransform", cssMatrix);
            css(ghostEl, "mozTransform", cssMatrix);
            css(ghostEl, "msTransform", cssMatrix);
            css(ghostEl, "transform", cssMatrix);
            lastDx = dx;
            lastDy = dy;
            touchEvt = touch;
          }
          evt.cancelable && evt.preventDefault();
        }
      },
      _appendGhost: function _appendGhost() {
        if (!ghostEl) {
          var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
          if (PositionGhostAbsolutely) {
            ghostRelativeParent = container;
            while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
              ghostRelativeParent = ghostRelativeParent.parentNode;
            }
            if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
              if (ghostRelativeParent === document)
                ghostRelativeParent = getWindowScrollingElement();
              rect.top += ghostRelativeParent.scrollTop;
              rect.left += ghostRelativeParent.scrollLeft;
            } else {
              ghostRelativeParent = getWindowScrollingElement();
            }
            ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
          }
          ghostEl = dragEl.cloneNode(true);
          toggleClass(ghostEl, options.ghostClass, false);
          toggleClass(ghostEl, options.fallbackClass, true);
          toggleClass(ghostEl, options.dragClass, true);
          css(ghostEl, "transition", "");
          css(ghostEl, "transform", "");
          css(ghostEl, "box-sizing", "border-box");
          css(ghostEl, "margin", 0);
          css(ghostEl, "top", rect.top);
          css(ghostEl, "left", rect.left);
          css(ghostEl, "width", rect.width);
          css(ghostEl, "height", rect.height);
          css(ghostEl, "opacity", "0.8");
          css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
          css(ghostEl, "zIndex", "100000");
          css(ghostEl, "pointerEvents", "none");
          Sortable.ghost = ghostEl;
          container.appendChild(ghostEl);
          css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
        }
      },
      _onDragStart: function _onDragStart(evt, fallback) {
        var _this = this;
        var dataTransfer = evt.dataTransfer;
        var options = _this.options;
        pluginEvent("dragStart", this, {
          evt
        });
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        pluginEvent("setupClone", this);
        if (!Sortable.eventCanceled) {
          cloneEl = clone(dragEl);
          cloneEl.draggable = false;
          cloneEl.style["will-change"] = "";
          this._hideClone();
          toggleClass(cloneEl, this.options.chosenClass, false);
          Sortable.clone = cloneEl;
        }
        _this.cloneId = _nextTick(function() {
          pluginEvent("clone", _this);
          if (Sortable.eventCanceled)
            return;
          if (!_this.options.removeCloneOnHide) {
            rootEl.insertBefore(cloneEl, dragEl);
          }
          _this._hideClone();
          _dispatchEvent({
            sortable: _this,
            name: "clone"
          });
        });
        !fallback && toggleClass(dragEl, options.dragClass, true);
        if (fallback) {
          ignoreNextClick = true;
          _this._loopId = setInterval(_this._emulateDragOver, 50);
        } else {
          off(document, "mouseup", _this._onDrop);
          off(document, "touchend", _this._onDrop);
          off(document, "touchcancel", _this._onDrop);
          if (dataTransfer) {
            dataTransfer.effectAllowed = "move";
            options.setData && options.setData.call(_this, dataTransfer, dragEl);
          }
          on(document, "drop", _this);
          css(dragEl, "transform", "translateZ(0)");
        }
        awaitingDragStarted = true;
        _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
        on(document, "selectstart", _this);
        moved = true;
        if (Safari) {
          css(document.body, "user-select", "none");
        }
      },
      _onDragOver: function _onDragOver(evt) {
        var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
        if (_silent)
          return;
        function dragOverEvent(name, extra) {
          pluginEvent(name, _this, _objectSpread2({
            evt,
            isOwner,
            axis: vertical ? "vertical" : "horizontal",
            revert,
            dragRect,
            targetRect,
            canSort,
            fromSortable,
            target,
            completed,
            onMove: function onMove(target2, after2) {
              return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
            },
            changed
          }, extra));
        }
        function capture() {
          dragOverEvent("dragOverAnimationCapture");
          _this.captureAnimationState();
          if (_this !== fromSortable) {
            fromSortable.captureAnimationState();
          }
        }
        function completed(insertion) {
          dragOverEvent("dragOverCompleted", {
            insertion
          });
          if (insertion) {
            if (isOwner) {
              activeSortable._hideClone();
            } else {
              activeSortable._showClone(_this);
            }
            if (_this !== fromSortable) {
              toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
              toggleClass(dragEl, options.ghostClass, true);
            }
            if (putSortable !== _this && _this !== Sortable.active) {
              putSortable = _this;
            } else if (_this === Sortable.active && putSortable) {
              putSortable = null;
            }
            if (fromSortable === _this) {
              _this._ignoreWhileAnimating = target;
            }
            _this.animateAll(function() {
              dragOverEvent("dragOverAnimationComplete");
              _this._ignoreWhileAnimating = null;
            });
            if (_this !== fromSortable) {
              fromSortable.animateAll();
              fromSortable._ignoreWhileAnimating = null;
            }
          }
          if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
            lastTarget = null;
          }
          if (!options.dragoverBubble && !evt.rootEl && target !== document) {
            dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
            !insertion && nearestEmptyInsertDetectEvent(evt);
          }
          !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
          return completedFired = true;
        }
        function changed() {
          newIndex = index(dragEl);
          newDraggableIndex = index(dragEl, options.draggable);
          _dispatchEvent({
            sortable: _this,
            name: "change",
            toEl: el,
            newIndex,
            newDraggableIndex,
            originalEvent: evt
          });
        }
        if (evt.preventDefault !== void 0) {
          evt.cancelable && evt.preventDefault();
        }
        target = closest(target, options.draggable, el, true);
        dragOverEvent("dragOver");
        if (Sortable.eventCanceled)
          return completedFired;
        if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
          return completed(false);
        }
        ignoreNextClick = false;
        if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
          vertical = this._getDirection(evt, target) === "vertical";
          dragRect = getRect(dragEl);
          dragOverEvent("dragOverValid");
          if (Sortable.eventCanceled)
            return completedFired;
          if (revert) {
            parentEl = rootEl;
            capture();
            this._hideClone();
            dragOverEvent("revert");
            if (!Sortable.eventCanceled) {
              if (nextEl) {
                rootEl.insertBefore(dragEl, nextEl);
              } else {
                rootEl.appendChild(dragEl);
              }
            }
            return completed(true);
          }
          var elLastChild = lastChild(el, options.draggable);
          if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
            if (elLastChild === dragEl) {
              return completed(false);
            }
            if (elLastChild && el === evt.target) {
              target = elLastChild;
            }
            if (target) {
              targetRect = getRect(target);
            }
            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
              capture();
              el.appendChild(dragEl);
              parentEl = el;
              changed();
              return completed(true);
            }
          } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
            var firstChild = getChild(el, 0, options, true);
            if (firstChild === dragEl) {
              return completed(false);
            }
            target = firstChild;
            targetRect = getRect(target);
            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
              capture();
              el.insertBefore(dragEl, firstChild);
              parentEl = el;
              changed();
              return completed(true);
            }
          } else if (target.parentNode === el) {
            targetRect = getRect(target);
            var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
            if (lastTarget !== target) {
              targetBeforeFirstSwap = targetRect[side1];
              pastFirstInvertThresh = false;
              isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
            }
            direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
            var sibling;
            if (direction !== 0) {
              var dragIndex = index(dragEl);
              do {
                dragIndex -= direction;
                sibling = parentEl.children[dragIndex];
              } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
            }
            if (direction === 0 || sibling === target) {
              return completed(false);
            }
            lastTarget = target;
            lastDirection = direction;
            var nextSibling = target.nextElementSibling, after = false;
            after = direction === 1;
            var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
            if (moveVector !== false) {
              if (moveVector === 1 || moveVector === -1) {
                after = moveVector === 1;
              }
              _silent = true;
              setTimeout(_unsilent, 30);
              capture();
              if (after && !nextSibling) {
                el.appendChild(dragEl);
              } else {
                target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
              }
              if (scrolledPastTop) {
                scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
              }
              parentEl = dragEl.parentNode;
              if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
                targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
              }
              changed();
              return completed(true);
            }
          }
          if (el.contains(dragEl)) {
            return completed(false);
          }
        }
        return false;
      },
      _ignoreWhileAnimating: null,
      _offMoveEvents: function _offMoveEvents() {
        off(document, "mousemove", this._onTouchMove);
        off(document, "touchmove", this._onTouchMove);
        off(document, "pointermove", this._onTouchMove);
        off(document, "dragover", nearestEmptyInsertDetectEvent);
        off(document, "mousemove", nearestEmptyInsertDetectEvent);
        off(document, "touchmove", nearestEmptyInsertDetectEvent);
      },
      _offUpEvents: function _offUpEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, "mouseup", this._onDrop);
        off(ownerDocument, "touchend", this._onDrop);
        off(ownerDocument, "pointerup", this._onDrop);
        off(ownerDocument, "touchcancel", this._onDrop);
        off(document, "selectstart", this);
      },
      _onDrop: function _onDrop(evt) {
        var el = this.el, options = this.options;
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        pluginEvent("drop", this, {
          evt
        });
        parentEl = dragEl && dragEl.parentNode;
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        if (Sortable.eventCanceled) {
          this._nulling();
          return;
        }
        awaitingDragStarted = false;
        isCircumstantialInvert = false;
        pastFirstInvertThresh = false;
        clearInterval(this._loopId);
        clearTimeout(this._dragStartTimer);
        _cancelNextTick(this.cloneId);
        _cancelNextTick(this._dragStartId);
        if (this.nativeDraggable) {
          off(document, "drop", this);
          off(el, "dragstart", this._onDragStart);
        }
        this._offMoveEvents();
        this._offUpEvents();
        if (Safari) {
          css(document.body, "user-select", "");
        }
        css(dragEl, "transform", "");
        if (evt) {
          if (moved) {
            evt.cancelable && evt.preventDefault();
            !options.dropBubble && evt.stopPropagation();
          }
          ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
          if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
            cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
          }
          if (dragEl) {
            if (this.nativeDraggable) {
              off(dragEl, "dragend", this);
            }
            _disableDraggable(dragEl);
            dragEl.style["will-change"] = "";
            if (moved && !awaitingDragStarted) {
              toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
            }
            toggleClass(dragEl, this.options.chosenClass, false);
            _dispatchEvent({
              sortable: this,
              name: "unchoose",
              toEl: parentEl,
              newIndex: null,
              newDraggableIndex: null,
              originalEvent: evt
            });
            if (rootEl !== parentEl) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  rootEl: parentEl,
                  name: "add",
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "remove",
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  rootEl: parentEl,
                  name: "sort",
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "sort",
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
              putSortable && putSortable.save();
            } else {
              if (newIndex !== oldIndex) {
                if (newIndex >= 0) {
                  _dispatchEvent({
                    sortable: this,
                    name: "update",
                    toEl: parentEl,
                    originalEvent: evt
                  });
                  _dispatchEvent({
                    sortable: this,
                    name: "sort",
                    toEl: parentEl,
                    originalEvent: evt
                  });
                }
              }
            }
            if (Sortable.active) {
              if (newIndex == null || newIndex === -1) {
                newIndex = oldIndex;
                newDraggableIndex = oldDraggableIndex;
              }
              _dispatchEvent({
                sortable: this,
                name: "end",
                toEl: parentEl,
                originalEvent: evt
              });
              this.save();
            }
          }
        }
        this._nulling();
      },
      _nulling: function _nulling() {
        pluginEvent("nulling", this);
        rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
        savedInputChecked.forEach(function(el) {
          el.checked = true;
        });
        savedInputChecked.length = lastDx = lastDy = 0;
      },
      handleEvent: function handleEvent(evt) {
        switch (evt.type) {
          case "drop":
          case "dragend":
            this._onDrop(evt);
            break;
          case "dragenter":
          case "dragover":
            if (dragEl) {
              this._onDragOver(evt);
              _globalDragOver(evt);
            }
            break;
          case "selectstart":
            evt.preventDefault();
            break;
        }
      },
      toArray: function toArray() {
        var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
        for (; i < n; i++) {
          el = children[i];
          if (closest(el, options.draggable, this.el, false)) {
            order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
          }
        }
        return order;
      },
      sort: function sort(order, useAnimation) {
        var items = {}, rootEl2 = this.el;
        this.toArray().forEach(function(id, i) {
          var el = rootEl2.children[i];
          if (closest(el, this.options.draggable, rootEl2, false)) {
            items[id] = el;
          }
        }, this);
        useAnimation && this.captureAnimationState();
        order.forEach(function(id) {
          if (items[id]) {
            rootEl2.removeChild(items[id]);
            rootEl2.appendChild(items[id]);
          }
        });
        useAnimation && this.animateAll();
      },
      save: function save() {
        var store = this.options.store;
        store && store.set && store.set(this);
      },
      closest: function closest$1(el, selector) {
        return closest(el, selector || this.options.draggable, this.el, false);
      },
      option: function option(name, value) {
        var options = this.options;
        if (value === void 0) {
          return options[name];
        } else {
          var modifiedValue = PluginManager.modifyOption(this, name, value);
          if (typeof modifiedValue !== "undefined") {
            options[name] = modifiedValue;
          } else {
            options[name] = value;
          }
          if (name === "group") {
            _prepareGroup(options);
          }
        }
      },
      destroy: function destroy2() {
        pluginEvent("destroy", this);
        var el = this.el;
        el[expando] = null;
        off(el, "mousedown", this._onTapStart);
        off(el, "touchstart", this._onTapStart);
        off(el, "pointerdown", this._onTapStart);
        if (this.nativeDraggable) {
          off(el, "dragover", this);
          off(el, "dragenter", this);
        }
        Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
          el2.removeAttribute("draggable");
        });
        this._onDrop();
        this._disableDelayedDragEvents();
        sortables.splice(sortables.indexOf(this.el), 1);
        this.el = el = null;
      },
      _hideClone: function _hideClone() {
        if (!cloneHidden) {
          pluginEvent("hideClone", this);
          if (Sortable.eventCanceled)
            return;
          css(cloneEl, "display", "none");
          if (this.options.removeCloneOnHide && cloneEl.parentNode) {
            cloneEl.parentNode.removeChild(cloneEl);
          }
          cloneHidden = true;
        }
      },
      _showClone: function _showClone(putSortable2) {
        if (putSortable2.lastPutMode !== "clone") {
          this._hideClone();
          return;
        }
        if (cloneHidden) {
          pluginEvent("showClone", this);
          if (Sortable.eventCanceled)
            return;
          if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
            rootEl.insertBefore(cloneEl, dragEl);
          } else if (nextEl) {
            rootEl.insertBefore(cloneEl, nextEl);
          } else {
            rootEl.appendChild(cloneEl);
          }
          if (this.options.group.revertClone) {
            this.animate(dragEl, cloneEl);
          }
          css(cloneEl, "display", "");
          cloneHidden = false;
        }
      }
    };
    function _globalDragOver(evt) {
      if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = "move";
      }
      evt.cancelable && evt.preventDefault();
    }
    function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
      var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
      if (window.CustomEvent && !IE11OrLess && !Edge) {
        evt = new CustomEvent("move", {
          bubbles: true,
          cancelable: true
        });
      } else {
        evt = document.createEvent("Event");
        evt.initEvent("move", true, true);
      }
      evt.to = toEl;
      evt.from = fromEl;
      evt.dragged = dragEl2;
      evt.draggedRect = dragRect;
      evt.related = targetEl || toEl;
      evt.relatedRect = targetRect || getRect(toEl);
      evt.willInsertAfter = willInsertAfter;
      evt.originalEvent = originalEvent;
      fromEl.dispatchEvent(evt);
      if (onMoveFn) {
        retVal = onMoveFn.call(sortable, evt, originalEvent);
      }
      return retVal;
    }
    function _disableDraggable(el) {
      el.draggable = false;
    }
    function _unsilent() {
      _silent = false;
    }
    function _ghostIsFirst(evt, vertical, sortable) {
      var rect = getRect(getChild(sortable.el, 0, sortable.options, true));
      var spacer = 10;
      return vertical ? evt.clientX < rect.left - spacer || evt.clientY < rect.top && evt.clientX < rect.right : evt.clientY < rect.top - spacer || evt.clientY < rect.bottom && evt.clientX < rect.left;
    }
    function _ghostIsLast(evt, vertical, sortable) {
      var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
      var spacer = 10;
      return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
    }
    function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
      var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
      if (!invertSwap) {
        if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
          if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
            pastFirstInvertThresh = true;
          }
          if (!pastFirstInvertThresh) {
            if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
              return -lastDirection;
            }
          } else {
            invert = true;
          }
        } else {
          if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
            return _getInsertDirection(target);
          }
        }
      }
      invert = invert || invertSwap;
      if (invert) {
        if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
          return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
        }
      }
      return 0;
    }
    function _getInsertDirection(target) {
      if (index(dragEl) < index(target)) {
        return 1;
      } else {
        return -1;
      }
    }
    function _generateId(el) {
      var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
      while (i--) {
        sum += str.charCodeAt(i);
      }
      return sum.toString(36);
    }
    function _saveInputCheckedState(root) {
      savedInputChecked.length = 0;
      var inputs = root.getElementsByTagName("input");
      var idx = inputs.length;
      while (idx--) {
        var el = inputs[idx];
        el.checked && savedInputChecked.push(el);
      }
    }
    function _nextTick(fn) {
      return setTimeout(fn, 0);
    }
    function _cancelNextTick(id) {
      return clearTimeout(id);
    }
    if (documentExists) {
      on(document, "touchmove", function(evt) {
        if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
          evt.preventDefault();
        }
      });
    }
    Sortable.utils = {
      on,
      off,
      css,
      find,
      is: function is(el, selector) {
        return !!closest(el, selector, el, false);
      },
      extend,
      throttle,
      closest,
      toggleClass,
      clone,
      index,
      nextTick: _nextTick,
      cancelNextTick: _cancelNextTick,
      detectDirection: _detectDirection,
      getChild
    };
    Sortable.get = function(element) {
      return element[expando];
    };
    Sortable.mount = function() {
      for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
        plugins2[_key] = arguments[_key];
      }
      if (plugins2[0].constructor === Array)
        plugins2 = plugins2[0];
      plugins2.forEach(function(plugin) {
        if (!plugin.prototype || !plugin.prototype.constructor) {
          throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
        }
        if (plugin.utils)
          Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
        PluginManager.mount(plugin);
      });
    };
    Sortable.create = function(el, options) {
      return new Sortable(el, options);
    };
    Sortable.version = version;
    var autoScrolls = [], scrollEl, scrollRootEl, scrolling = false, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval;
    function AutoScrollPlugin() {
      function AutoScroll() {
        this.defaults = {
          scroll: true,
          forceAutoScrollFallback: false,
          scrollSensitivity: 30,
          scrollSpeed: 10,
          bubbleScroll: true
        };
        for (var fn in this) {
          if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
            this[fn] = this[fn].bind(this);
          }
        }
      }
      AutoScroll.prototype = {
        dragStarted: function dragStarted(_ref) {
          var originalEvent = _ref.originalEvent;
          if (this.sortable.nativeDraggable) {
            on(document, "dragover", this._handleAutoScroll);
          } else {
            if (this.options.supportPointer) {
              on(document, "pointermove", this._handleFallbackAutoScroll);
            } else if (originalEvent.touches) {
              on(document, "touchmove", this._handleFallbackAutoScroll);
            } else {
              on(document, "mousemove", this._handleFallbackAutoScroll);
            }
          }
        },
        dragOverCompleted: function dragOverCompleted(_ref2) {
          var originalEvent = _ref2.originalEvent;
          if (!this.options.dragOverBubble && !originalEvent.rootEl) {
            this._handleAutoScroll(originalEvent);
          }
        },
        drop: function drop2() {
          if (this.sortable.nativeDraggable) {
            off(document, "dragover", this._handleAutoScroll);
          } else {
            off(document, "pointermove", this._handleFallbackAutoScroll);
            off(document, "touchmove", this._handleFallbackAutoScroll);
            off(document, "mousemove", this._handleFallbackAutoScroll);
          }
          clearPointerElemChangedInterval();
          clearAutoScrolls();
          cancelThrottle();
        },
        nulling: function nulling() {
          touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
          autoScrolls.length = 0;
        },
        _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
          this._handleAutoScroll(evt, true);
        },
        _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
          var _this = this;
          var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
          touchEvt$1 = evt;
          if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
            autoScroll(evt, this.options, elem, fallback);
            var ogElemScroller = getParentAutoScrollElement(elem, true);
            if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
              pointerElemChangedInterval && clearPointerElemChangedInterval();
              pointerElemChangedInterval = setInterval(function() {
                var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
                if (newElem !== ogElemScroller) {
                  ogElemScroller = newElem;
                  clearAutoScrolls();
                }
                autoScroll(evt, _this.options, newElem, fallback);
              }, 10);
              lastAutoScrollX = x;
              lastAutoScrollY = y;
            }
          } else {
            if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
              clearAutoScrolls();
              return;
            }
            autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
          }
        }
      };
      return _extends(AutoScroll, {
        pluginName: "scroll",
        initializeByDefault: true
      });
    }
    function clearAutoScrolls() {
      autoScrolls.forEach(function(autoScroll2) {
        clearInterval(autoScroll2.pid);
      });
      autoScrolls = [];
    }
    function clearPointerElemChangedInterval() {
      clearInterval(pointerElemChangedInterval);
    }
    var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
      if (!options.scroll)
        return;
      var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
      var scrollThisInstance = false, scrollCustomFn;
      if (scrollRootEl !== rootEl2) {
        scrollRootEl = rootEl2;
        clearAutoScrolls();
        scrollEl = options.scroll;
        scrollCustomFn = options.scrollFn;
        if (scrollEl === true) {
          scrollEl = getParentAutoScrollElement(rootEl2, true);
        }
      }
      var layersOut = 0;
      var currentParent = scrollEl;
      do {
        var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
        if (el === winScroller) {
          canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
          canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
        } else {
          canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
          canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
        }
        var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
        var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
        if (!autoScrolls[layersOut]) {
          for (var i = 0; i <= layersOut; i++) {
            if (!autoScrolls[i]) {
              autoScrolls[i] = {};
            }
          }
        }
        if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
          autoScrolls[layersOut].el = el;
          autoScrolls[layersOut].vx = vx;
          autoScrolls[layersOut].vy = vy;
          clearInterval(autoScrolls[layersOut].pid);
          if (vx != 0 || vy != 0) {
            scrollThisInstance = true;
            autoScrolls[layersOut].pid = setInterval(function() {
              if (isFallback && this.layer === 0) {
                Sortable.active._onTouchMove(touchEvt$1);
              }
              var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
              var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
              if (typeof scrollCustomFn === "function") {
                if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                  return;
                }
              }
              scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
            }.bind({
              layer: layersOut
            }), 24);
          }
        }
        layersOut++;
      } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
      scrolling = scrollThisInstance;
    }, 30);
    var drop = function drop2(_ref) {
      var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
      if (!originalEvent)
        return;
      var toSortable = putSortable2 || activeSortable;
      hideGhostForTarget();
      var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
      var target = document.elementFromPoint(touch.clientX, touch.clientY);
      unhideGhostForTarget();
      if (toSortable && !toSortable.el.contains(target)) {
        dispatchSortableEvent("spill");
        this.onSpill({
          dragEl: dragEl2,
          putSortable: putSortable2
        });
      }
    };
    function Revert() {
    }
    Revert.prototype = {
      startIndex: null,
      dragStart: function dragStart(_ref2) {
        var oldDraggableIndex2 = _ref2.oldDraggableIndex;
        this.startIndex = oldDraggableIndex2;
      },
      onSpill: function onSpill(_ref3) {
        var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
        this.sortable.captureAnimationState();
        if (putSortable2) {
          putSortable2.captureAnimationState();
        }
        var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
        if (nextSibling) {
          this.sortable.el.insertBefore(dragEl2, nextSibling);
        } else {
          this.sortable.el.appendChild(dragEl2);
        }
        this.sortable.animateAll();
        if (putSortable2) {
          putSortable2.animateAll();
        }
      },
      drop
    };
    _extends(Revert, {
      pluginName: "revertOnSpill"
    });
    function Remove() {
    }
    Remove.prototype = {
      onSpill: function onSpill(_ref4) {
        var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
        var parentSortable = putSortable2 || this.sortable;
        parentSortable.captureAnimationState();
        dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
        parentSortable.animateAll();
      },
      drop
    };
    _extends(Remove, {
      pluginName: "removeOnSpill"
    });
    Sortable.mount(new AutoScrollPlugin());
    Sortable.mount(Remove, Revert);
    class FetchResponse {
      constructor(response) {
        this.response = response;
      }
      get statusCode() {
        return this.response.status;
      }
      get redirected() {
        return this.response.redirected;
      }
      get ok() {
        return this.response.ok;
      }
      get unauthenticated() {
        return this.statusCode === 401;
      }
      get authenticationURL() {
        return this.response.headers.get("WWW-Authenticate");
      }
      get contentType() {
        const contentType = this.response.headers.get("Content-Type") || "";
        return contentType.replace(/;.*$/, "");
      }
      get headers() {
        return this.response.headers;
      }
      get html() {
        if (this.contentType.match(/^(application|text)\/(html|xhtml\+xml)$/)) {
          return this.text;
        }
        return Promise.reject(new Error(`Expected an HTML response but got "${this.contentType}" instead`));
      }
      get json() {
        if (this.contentType.match(/^application\/json/)) {
          return this.responseJson || (this.responseJson = this.response.json());
        }
        return Promise.reject(new Error(`Expected a JSON response but got "${this.contentType}" instead`));
      }
      get text() {
        return this.responseText || (this.responseText = this.response.text());
      }
      get isTurboStream() {
        return this.contentType.match(/^text\/vnd\.turbo-stream\.html/);
      }
      async renderTurboStream() {
        if (this.isTurboStream) {
          if (window.Turbo) {
            window.Turbo.renderStreamMessage(await this.text);
          } else {
            console.warn("You must set `window.Turbo = Turbo` to automatically process Turbo Stream events with request.js");
          }
        } else {
          return Promise.reject(new Error(`Expected a Turbo Stream response but got "${this.contentType}" instead`));
        }
      }
    }
    class RequestInterceptor {
      static register(interceptor) {
        this.interceptor = interceptor;
      }
      static get() {
        return this.interceptor;
      }
      static reset() {
        this.interceptor = void 0;
      }
    }
    function getCookie(name) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const prefix = `${encodeURIComponent(name)}=`;
      const cookie = cookies.find((cookie2) => cookie2.startsWith(prefix));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        if (value) {
          return decodeURIComponent(value);
        }
      }
    }
    function compact(object) {
      const result = {};
      for (const key in object) {
        const value = object[key];
        if (value !== void 0) {
          result[key] = value;
        }
      }
      return result;
    }
    function metaContent(name) {
      const element = document.head.querySelector(`meta[name="${name}"]`);
      return element && element.content;
    }
    function stringEntriesFromFormData(formData) {
      return [...formData].reduce((entries, [name, value]) => entries.concat(typeof value === "string" ? [[name, value]] : []), []);
    }
    function mergeEntries(searchParams, entries) {
      for (const [name, value] of entries) {
        if (value instanceof window.File)
          continue;
        if (searchParams.has(name)) {
          searchParams.delete(name);
          searchParams.set(name, value);
        } else {
          searchParams.append(name, value);
        }
      }
    }
    class FetchRequest {
      constructor(method, url, options = {}) {
        this.method = method;
        this.options = options;
        this.originalUrl = url;
      }
      async perform() {
        try {
          const requestInterceptor = RequestInterceptor.get();
          if (requestInterceptor) {
            await requestInterceptor(this);
          }
        } catch (error2) {
          console.error(error2);
        }
        const response = new FetchResponse(await window.fetch(this.url, this.fetchOptions));
        if (response.unauthenticated && response.authenticationURL) {
          return Promise.reject(window.location.href = response.authenticationURL);
        }
        if (response.ok && response.isTurboStream) {
          response.renderTurboStream();
        }
        return response;
      }
      addHeader(key, value) {
        const headers = this.additionalHeaders;
        headers[key] = value;
        this.options.headers = headers;
      }
      get fetchOptions() {
        return {
          method: this.method.toUpperCase(),
          headers: this.headers,
          body: this.formattedBody,
          signal: this.signal,
          credentials: "same-origin",
          redirect: this.redirect
        };
      }
      get headers() {
        return compact(Object.assign({
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": this.csrfToken,
          "Content-Type": this.contentType,
          Accept: this.accept
        }, this.additionalHeaders));
      }
      get csrfToken() {
        return getCookie(metaContent("csrf-param")) || metaContent("csrf-token");
      }
      get contentType() {
        if (this.options.contentType) {
          return this.options.contentType;
        } else if (this.body == null || this.body instanceof window.FormData) {
          return void 0;
        } else if (this.body instanceof window.File) {
          return this.body.type;
        }
        return "application/json";
      }
      get accept() {
        switch (this.responseKind) {
          case "html":
            return "text/html, application/xhtml+xml";
          case "turbo-stream":
            return "text/vnd.turbo-stream.html, text/html, application/xhtml+xml";
          case "json":
            return "application/json";
          default:
            return "*/*";
        }
      }
      get body() {
        return this.options.body;
      }
      get query() {
        const originalQuery = (this.originalUrl.split("?")[1] || "").split("#")[0];
        const params = new URLSearchParams(originalQuery);
        let requestQuery = this.options.query;
        if (requestQuery instanceof window.FormData) {
          requestQuery = stringEntriesFromFormData(requestQuery);
        } else if (requestQuery instanceof window.URLSearchParams) {
          requestQuery = requestQuery.entries();
        } else {
          requestQuery = Object.entries(requestQuery || {});
        }
        mergeEntries(params, requestQuery);
        const query = params.toString();
        return query.length > 0 ? `?${query}` : "";
      }
      get url() {
        return this.originalUrl.split("?")[0] + this.query;
      }
      get responseKind() {
        return this.options.responseKind || "html";
      }
      get signal() {
        return this.options.signal;
      }
      get redirect() {
        return this.options.redirect || "follow";
      }
      get additionalHeaders() {
        return this.options.headers || {};
      }
      get formattedBody() {
        const bodyIsAString = Object.prototype.toString.call(this.body) === "[object String]";
        const contentTypeIsJson = this.headers["Content-Type"] === "application/json";
        if (contentTypeIsJson && !bodyIsAString) {
          return JSON.stringify(this.body);
        }
        return this.body;
      }
    }
    RequestInterceptor.register(async (request) => {
      request.addHeader("Authorization", `Bearer ${OAUTH_TOKEN}`);
    });
    function showProgressBar() {
      navigator$1.delegate.adapter.progressBar.setValue(0);
      navigator$1.delegate.adapter.progressBar.show();
    }
    function hideProgressBar() {
      navigator$1.delegate.adapter.progressBar.setValue(1);
      navigator$1.delegate.adapter.progressBar.hide();
    }
    function withProgress(request) {
      new Promise((resolve) => {
        showProgressBar();
        resolve(request.then(hideProgressBar));
      });
      return request;
    }
    function patch(url, options) {
      const request = new FetchRequest("patch", url, options);
      return withProgress(request.perform());
    }
    class SortableTreeController extends Controller {
      static values = {
        handle: String
      };
      connect() {
        const itemSortable = {
          ...this.options
        };
        let containers = null;
        containers = this.element.querySelectorAll("[data-sortable-tree-parent-id-value]");
        for (let i = 0; i < containers.length; i++) {
          new Sortable(containers[i], itemSortable);
        }
      }
      async end({ item, newIndex: newIndex2, to }) {
        if (!item.dataset.sortableTreeUpdateUrlValue)
          return;
        const data = {
          [item.dataset.sortableTreeResourceNameValue]: {
            new_parent_id: to.dataset.sortableTreeParentIdValue,
            new_position_idx: newIndex2
          }
        };
        const response = await patch(item.dataset.sortableTreeUpdateUrlValue, {
          body: data
        });
        if (!response.ok) {
          show_flash("error", "This move could not be saved.");
        }
      }
      get options() {
        return {
          group: {
            name: "sortable-tree",
            pull: true,
            put: true
          },
          handle: this.handleValue || void 0,
          swapThreshold: 0.5,
          emptyInsertThreshold: 8,
          dragClass: "item-dragged",
          draggable: ".draggable",
          animation: 350,
          forceFallback: false,
          onEnd: this.end
        };
      }
    }
    class WebhooksSubscriberEventsController extends Controller {
      static targets = ["eventsCheckboxesContainer", "subscribeToAll"];
      hideCheckboxes() {
        this.eventsCheckboxesContainerTarget.hidden = true;
      }
      showCheckboxes() {
        this.eventsCheckboxesContainerTarget.hidden = false;
      }
      initialize() {
        if (this.subscribeToAllTarget.checked) {
          this.hideCheckboxes();
        }
      }
    }
    class PasswordToggleController extends Controller {
      static targets = ["unhide"];
      password(e) {
        if (this.unhideTarget.type === "password") {
          this.unhideTarget.type = "text";
        } else {
          this.unhideTarget.type = "password";
        }
      }
    }
    class ClipboardController extends Controller {
      static targets = ["source"];
      copy(event) {
        console.log(event);
        event.preventDefault();
        this.sourceTarget.select();
        document.execCommand("copy");
      }
    }
    class Dashboard {
      constructor() {
        console.log("Spree Dashboard Initialized");
      }
    }
    const application = Application.start();
    application.debug = false;
    window.Stimulus = application;
    application.register("upload-button", UploadButtonController);
    application.register("spree", SpreeController);
    application.register("sortable-tree", SortableTreeController);
    application.register("webhooks_subscriber_events", WebhooksSubscriberEventsController);
    application.register("password-toggle", PasswordToggleController);
    application.register("clipboard", ClipboardController);
    exports2.Dashboard = Dashboard;
    exports2.Turbo = turbo_es2017Esm;
    exports2.application = application;
    exports2.flatpickr = flatpickr;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
  });

  // app/javascript/spree-dashboard.js
  new SpreeDashboard.Dashboard();
})();
/*!
    * Bootstrap v4.6.1 (https://getbootstrap.com/)
    * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
/*!
   * jQuery JavaScript Library v3.5.1
   * https://jquery.com/
   *
   * Includes Sizzle.js
   * https://sizzlejs.com/
   *
   * Copyright JS Foundation and other contributors
   * Released under the MIT license
   * https://jquery.org/license
   *
   * Date: 2020-05-04T22:49Z
   */
/**!
   * @fileOverview Kickass library to create and place poppers near their reference elements.
   * @version 1.16.1
   * @license
   * Copyright (c) 2016 Federico Zivolo and contributors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
/**!
   * Sortable 1.14.0
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   */
//# sourceMappingURL=spree-dashboard.js.map
