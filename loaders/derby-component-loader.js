var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var makeIdentitySourceMap = require('../lib/makeIdentitySourceMap');
var fs = require('fs');
var path = require('path');

module.exports = function(source, map) {

  if (this.cacheable) this.cacheable();

  var separator = '\n\n';
  var name = source.match(/module\.exports\s*=\s*([A-Z]\w*)/);
  name = name && name[1];

  // Preprocess 'view' and 'style' field from __dirname into require()
  source = source.replace(/(.*\.prototype\.view\s*=\s*)(__dirname)/,
      "$1require('./index.jade')");
  source = source.replace(/(.*\.prototype\.style\s*=\s*)(__dirname)/,
      "$1require('./index.styl')");

  // If class is being exported we treat it as a component and handle hot reload
  if (name) {
    var loadView = fs.existsSync( path.dirname( this.resourcePath ) + '/index.jade' );
    var appendText = addHotReload(name, loadView);

    if (this.sourceMap === false) {
      return this.callback(null, [
        source,
        appendText
      ].join(separator));
    }


    if (!map) map = makeIdentitySourceMap(source, this.resourcePath);

    var node = new SourceNode(null, null, null, [
      SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
      new SourceNode(null, null, this.resourcePath, appendText)
    ]).join(separator);

    var result = node.toStringWithSourceMap();

    console.log(this.resourcePath, 'map');

    return this.callback(null, result.code, result.map.toString());
  }

  return this.callback(null, source, map);
};

function addHotReload(name, loadView) {
  return ('(' + (function() {

    var recreateComponent = function() {
      window.app.component(__name__);
      window.app.history.refresh();
    };

    if (module.hot) {
      module.hot.accept();
      __reloadView__
      module.hot.dispose = function(data) {
        data.restart = true;
      };
      if (module.hot.data) {
        recreateComponent();
      }
    }

  }).toString() + ')();' )
    .replace(/__reloadView__/g, loadView
      ? [
          "module.hot.accept('./index.jade', function() {"
        + "  __name__.prototype.view = req('./index.jade');"
        + "  recreateComponent();"
        + "});"
        ].join('')
      : ''
    ).replace(/__name__/g, name)
}
