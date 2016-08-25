var browserSync = require( 'browser-sync' );
var config      = require( '../util/loadConfig' ).browsersync;
var gulp        = require( 'gulp' );

gulp.task( 'browser-sync', ['nodemon'], function() {
    
  browserSync.init( null, {
    proxy: config.proxy,
    files: config.files,
    notify: config.notify,
    open: config.open,
    port: config.port,
    xip: config.xip
  } );
    
} );