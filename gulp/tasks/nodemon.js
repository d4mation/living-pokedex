var $             = require( 'gulp-load-plugins' )();
var config        = require( '../util/loadConfig' ).nodemon;
var gulp          = require( 'gulp' );
var nodemon       = require( 'gulp-nodemon' );

gulp.task( 'nodemon', function ( cb ) {

    var started = false;

    return nodemon( {
        script: config.app
    } ).on( 'start', function () {
        
        // to avoid nodemon being started multiple times
        if ( ! started ) {
            cb();
            started = true;
        }
        
    } );
    
} );