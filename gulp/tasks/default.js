var gulp          = require( 'gulp' );
var isProduction  = require( '../util/isProduction' );
var sequence      = require( 'run-sequence' );

gulp.task( 'default', function( done ) {
    
    if ( isProduction ) {
        sequence( 'build', done );
    }
    else {
        sequence( 'build', 'browser-sync', 'watch', done );
    }
    
} );