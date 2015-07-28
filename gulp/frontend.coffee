gulp = require 'gulp'
webpack = require 'webpack'
path = require 'path'
_ = require 'lodash'
WebpackDevServer = require 'webpack-dev-server'

module.exports = (options) ->
  base = require('./base') options

  config = base.config
    target: 'web'
    entry: [
      __dirname + '/../node_modules/webpack-dev-server/client?http://localhost:' + options.webpackPort
      __dirname + '/../node_modules/webpack/hot/dev-server'
      __dirname + '/../node_modules/racer-highway/lib/browser'
      options.dirname + '/node_modules/derby-parsing'
    ].concat(options.frontend.entry || [options.dirname + '/app'])
    module:
      loaders: [
        test: /\.css$/
        loader: 'style!autoprefixer?{browsers:["last 2 version", "> 1%", "ie 10", "android 4"]}!css?module&localIdentName=[component]-[local]'
      ,
        test: /\.styl$/
        loaders: 'style!autoprefixer?{browsers:["last 2 version", "> 1%", "ie 10", "android 4"]}!css?module&localIdentName=[component]-[local]!stylus'
      ,
        include: /racer-highway\/lib\/browser\.js$/
        loaders: [__dirname + '/../loaders/racer-highway-loader.js']
      ]

    output:
      path: options.dirname + '/client'
      pathInfo: true
      publicPath: "http://localhost:#{ options.webpackPort }/client/"
      filename: 'main.js'
    plugins: [
      new webpack.HotModuleReplacementPlugin(quiet: true)
    ]
    stylus: options.stylus || {}

  gulp.task 'frontend-build', (done) ->
    webpack(config).run base.onBuild(done)

  gulp.task 'frontend-watch', ->
    # webpack(config).watch(100, onBuild());
    new WebpackDevServer(webpack(config),
      publicPath: '/client/'
      contentBase: './client/'
      hot: true
      inline: true
      stats: colors: true
      noInfo: true
      headers: {
        'Access-Control-Allow-Origin': "http://localhost:#{ options.serverPort }",
        'Access-Control-Allow-Headers': 'X-Requested-With'
      }
    ).listen options.webpackPort, 'localhost', (err, result) ->
      if err
        console.log err
      else
        console.log "webpack dev server listening at localhost:#{ options.webpackPort }"
