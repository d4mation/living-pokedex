var config      = require( '../util/loadConfig' ).watch;
var gulp        = require( 'gulp' );

// Watch files for changes, recompile/rebuild
gulp.task( 'watch', function() {
    gulp.watch( config.javascript.front, ['front-uglify'] );
    gulp.watch( config.javascript.admin, ['admin-uglify'] );
    gulp.watch( config.javascript.server, ['server-uglify'] );
    gulp.watch( config.sass.front, ['front-sass'] );
    gulp.watch( config.sass.admin, ['admin-sass'] );
} );