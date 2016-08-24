var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var sequence      = require('run-sequence');

gulp.task( 'build', function( done ) {

    if ( isProduction ) {
        sequence( 'sass', 'uglify', 'rev:collect', done );
    }
    else {
        sequence( 'sass', 'uglify', 'rev:reverse', done );
    }
    
} );