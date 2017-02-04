var $             = require( 'gulp-load-plugins' )();
var config        = require( '../util/loadConfig' ).javascript;
var gulp          = require( 'gulp' );
var notify        = require( 'gulp-notify' );
var fs            = require( 'fs' );
var pkg           = JSON.parse( fs.readFileSync( './package.json' ) );
var onError       = notify.onError( {
   title:    pkg.name,
   message:  '<%= error.name %> <%= error.message %>'   
} );

gulp.task( 'front-uglify', function() {

    return gulp.src( config.front.vendor.concat( config.front.src ) )
        .pipe( $.plumber( { errorHandler: onError } ) )
        .pipe( $.sourcemaps.init() )
        .pipe( $.babel( {
            compact: true,
            presets: ['es2015'], // Gulp-uglify has no official support for ECMAScript 2015 (aka ES6, aka Harmony), so we'll transpile to EcmaScript5
			plugins: ["inline-json-import", {}]
        } ) )
        .pipe( $.concat( config.front.filename ) )
        .pipe( $.uglify() )
        .pipe( $.sourcemaps.write( '.' ) )
        .pipe( gulp.dest( config.dest.root ) )
        .pipe( $.plumber.stop() )
        .pipe( notify( {
            title: pkg.name,
            message: 'JS Complete',
            onLast: true
        } ) );

} );

gulp.task( 'admin-uglify', function() {

    return gulp.src( config.admin.src )
        .pipe( $.plumber( { errorHandler: onError } ) )
        .pipe( $.sourcemaps.init() )
        .pipe( $.babel( {
            compact: true
        } ) )
        .pipe( $.concat( config.admin.filename ) )
        .pipe( $.uglify() )
        .pipe( $.sourcemaps.write( '.' ) )
        .pipe( gulp.dest( config.dest.root ) )
        .pipe( $.plumber.stop() )
        .pipe( notify( {
            title: pkg.name,
            message: 'Admin JS Complete',
            onLast: true
        } ) );

} );

gulp.task( 'uglify', ['front-uglify', 'admin-uglify'], function( done ) {
} );