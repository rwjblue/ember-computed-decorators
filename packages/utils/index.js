function setupBabelPlugins(addon, options) {
  addon.options = addon.options || {};
  addon.options.babel = addon.options.babel || {};

  let plugins = addon.options.babel.plugins = addon.options.babel.plugins || [];

  let shouldThrowOnComputedOverride =
    options && 'throwOnComputedOverride' in options
      ? options.throwOnComputedOverride
      : true;

  let pluginOptions = {
    envFlags: {
      source: 'ember-decorators-flags',
      flags: {
        DEBUG: false,
      },
    },

    features: {
      name: 'ember-decorators-flags',
      source: 'ember-decorators-flags',
      flags: {
        THROW_ON_COMPUTED_OVERRIDE: shouldThrowOnComputedOverride,
      },
    },

    externalizeHelpers: {
      global: 'Ember',
    },

    debugTools: {
      source: 'ember-decorators-flags',
      assertPredicateIndex: 1,
    },
  };

  plugins.push([require.resolve('babel-plugin-debug-macros'), pluginOptions]);
}

module.exports = {
  name: '@ember-decorators/utils',

  included(includer) {
    this._super.apply(this, arguments);

    let host = this._findHost();
    let hostOptions = host.options ? host.options['@ember-decorators'] : null;

    setupBabelPlugins(this, hostOptions);
    setupBabelPlugins(includer, hostOptions);
  },
};
