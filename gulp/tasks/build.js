var gulp          = require( 'gulp' );
var sequence      = require( 'run-sequence' );

gulp.task( 'build', function( done ) {

   sequence( 'sass', 'uglify', done );
    
} );