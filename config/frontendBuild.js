// Generated by CoffeeScript 1.12.7
(function() {
  var AssetsPlugin, ExtractTextPlugin, FrontendBuildConfig, FrontendConfig, csswring, defaultsDeep, webpack,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  defaultsDeep = require('lodash/defaultsDeep');

  csswring = require('csswring');

  webpack = require('webpack');

  FrontendConfig = require('./frontend');

  ExtractTextPlugin = require('extract-text-webpack-plugin');

  AssetsPlugin = require('assets-webpack-plugin');

  module.exports = FrontendBuildConfig = (function(superClass) {
    extend(FrontendBuildConfig, superClass);

    function FrontendBuildConfig() {
      var base, base1, uglifyOptions;
      FrontendBuildConfig.__super__.constructor.apply(this, arguments);
      defaultsDeep(this.options, {
        frontend: {
          productionSourceMaps: false,
          cache: false,
          uglify: true
        }
      });
      this.config.output.filename = '[name].[hash].js';
      this.config.cache = this.options.frontend.cache;
      this.config.debug = false;
      if (this.options.frontend.productionSourceMaps) {
        this.config.devtool = 'source-map';
      }
      this.config.postcss = this._getPostCss([csswring()]);
      if ((base = this.config).stats == null) {
        base.stats = {};
      }
      if ((base1 = this.config.stats).children == null) {
        base1.children = false;
      }
      this.config.module.loaders = this.config.module.loaders.concat([
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style-loader', "raw!postcss")
        }
      ]);
      this.config.module.loaders = this.config.module.loaders.concat(this._getBeforeStylusLoaders());
      this.config.module.loaders.push(this._getStylusLoader());
      this.config.plugins.push(new ExtractTextPlugin('[name].css', {
        priorityModules: this.options.priorityModules || []
      }));
      if (this.options.frontend.uglify) {
        uglifyOptions = {
          compress: {
            warnings: false
          }
        };
        if (!this.options.frontend.productionSourceMaps) {
          uglifyOptions.sourceMap = false;
        }
        this.config.plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyOptions));
      }
      this.config.plugins.push(new AssetsPlugin({
        filename: 'assets.json',
        fullPath: false,
        path: this.config.output.path
      }));
    }

    FrontendBuildConfig.prototype._getActualStylusLoader = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return ExtractTextPlugin.extract('style-loader', FrontendBuildConfig.__super__._getActualStylusLoader.apply(this, args));
    };

    return FrontendBuildConfig;

  })(FrontendConfig);

}).call(this);
