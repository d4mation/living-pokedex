var $             = require( 'gulp-load-plugins' )();
var autoprefixer  = require( 'gulp-autoprefixer' );
var config        = require( '../util/loadConfig' ).sass;
var gulp          = require( 'gulp' );
var sass          = require( 'gulp-sass' );
var concat        = require( 'gulp-concat' );
var notify        = require( 'gulp-notify' );
var fs            = require( 'fs' );
var pkg           = JSON.parse( fs.readFileSync( './package.json' ) );

gulp.task( 'front-sass', function() {

    return gulp.src( config.front.src )
        .pipe( $.sourcemaps.init() )
        .pipe( $.sass( {
                includePaths: config.front.vendor
            } )
            .on( 'error', notify.onError( {
                title: pkg.name,
                message: "<%= error.message %>",
            } )
         ) )
        .pipe( concat( config.front.filename ) )
        .pipe( autoprefixer( config.compatibility ) )
        .pipe( $.cssnano() )
        .pipe( $.sourcemaps.write( '.' ) )
        .pipe( gulp.dest( config.dest.root ) )
        .pipe( notify( {
            title: pkg.name,
            message: 'SASS Complete',
            onLast: true
        } ) );

} );

gulp.task( 'admin-sass', function() {

    return gulp.src( config.admin.src )
        .pipe( $.sourcemaps.init() )
        .pipe( $.sass()
          .on( 'error', notify.onError( {
                title: pkg.name,
                message: "<%= error.message %>",
            } )
         ) )
        .pipe( concat( config.admin.filename ) )
        .pipe( autoprefixer( config.compatibility ) )
        .pipe( $.cssnano() )
        .pipe( $.sourcemaps.write( '.' ) )
        .pipe( gulp.dest( config.dest.root ) )
        .pipe( notify( {
            title: pkg.name,
            message: 'Admin SASS Complete',
            onLast: true
        } ) );

} );

gulp.task( 'sass', ['front-sass', 'admin-sass'], function( done ) {
} );