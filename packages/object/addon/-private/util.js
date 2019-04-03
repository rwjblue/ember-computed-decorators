import { DEBUG } from '@glimmer/env';
import { assert, deprecate } from '@ember/debug';

import { computedDecoratorWithRequiredParams } from '@ember-decorators/utils/computed';

import { gte } from 'ember-compatibility-helpers';
import Ember from 'ember';

export function legacyMacro(fn) {
  if (gte('3.10.0')) {
    return computedDecoratorWithRequiredParams(fn, fn.name);
  } else {
    return computedDecoratorWithRequiredParams((elementDesc, params) => {
      return fn(...params);
    }, fn.name);
  }
}

function getMethod(fn, desc, params, required) {
  let method;

  if (String(desc) === '[object Descriptor]' && desc.descriptor.value) {
    deprecate(
      `Ember Decorators currently supports using the ${
        fn.name
      } macro on a function directly, but this is not supported by Ember's official decorators. We'll be removing support in future versions.`,
      false,
      {
        id: 'macro-function-decoration',
        until: '6.0.0',
      }
    );
    method = desc.descriptor.value;
    desc.kind = 'field';
    desc.descriptor = {};
  } else if (desc.value) {
    deprecate(
      `Ember Decorators currently supports using the ${
        fn.name
      } macro on a function directly, but this is not supported by Ember's official decorators. We'll be removing support in future versions.`,
      false,
      {
        id: 'macro-function-decoration',
        until: '6.0.0',
      }
    );
    method = desc.value;
    desc.value = null;
  } else {
    method = params.pop();
  }

  assert(
    `The @${fn.name} decorator must be passed a method`,
    !required || typeof method === 'function'
  );

  return method;
}

export function legacyMacroWithMethod(fn, required) {
  if (gte('3.10.0')) {
    let computedGenerator = computedDecoratorWithRequiredParams(fn, fn.name);

    return function(...params) {
      let decorator = function(...args) {
        let desc;

        if (args.length === 1) {
          desc = args[0];
        } else {
          desc = args[2];
        }

        let method = getMethod(fn, desc, params, required);

        let computed = computedGenerator(...params, method);

        if (decorator._readOnly) computed.readOnly();
        if (decorator._volatile) computed.volatile();
        if (decorator._property) computed.property(...decorator._property);

        computed(...args);
      };

      let setClassicDecorator = Ember._setClassicDecorator || Ember._setComputedDecorator;
      setClassicDecorator(decorator);

      if (DEBUG) {
        // This is for wrapComputed to check against invalid input
        decorator.__isComputedDecorator = true;
      }

      decorator.readOnly = function() {
        this._readOnly = true;
        return this;
      };

      decorator.volatile = function() {
        this._volatile = true;
        return this;
      };

      decorator.property = function(...params) {
        this._property = params;
        return this;
      };

      return decorator;
    };
  } else {
    return computedDecoratorWithRequiredParams((elementDesc, params) => {
      let method = getMethod(fn, elementDesc, params, required);

      return fn(...params, method);
    }, fn.name);
  }
}
