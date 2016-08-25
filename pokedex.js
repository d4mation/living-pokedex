var util = require( 'util' );
var conf = require( './config' ); // Facilitates easy deployment to "Live"
var port = conf.web.port;

var express = require( 'express' ),
  routes = require( './routes' ),
  api = require( './routes/api' );

var app = express();

var ss = require( 'socket.io-stream' );

var bcrypt = require( 'bcrypt' );
var salt = bcrypt.genSaltSync( 10 );
var fs = require( 'fs' );

function mkdir_p( path, cb ) {
    
    var mkdirp = require( 'mkdirp' );
    var cb1 = cb;
    
    mkdirp( path, function ( err ) {
        cb1();
    } );
    
}

// Routes
app.get( '/', function( req, res ) {
    res.sendFile( __dirname + '/public/index.html' );
} );
app.get( '/partials/:name', routes.partials );

// Serve Assets as if they were at Root
app.use( '/', express.static( __dirname + '/public' ) );

// If there isn't a Sprite available
app.get( '/images/sprites/*', function( req, res ) {
    res.sendFile( __dirname + '/public/images/sprites/default.png' );
} );

// JSON API
app.get( '/api/posts', api.posts );

app.get( '/api/post/:id', api.post );
app.post( '/api/post', api.addPost );
app.put( '/api/post/:id', api.editPost );
app.delete( '/api/post/:id', api.deletePost );

// redirect all others to the index (HTML5 history)
app.get( '*', function( req, res ) {
    res.sendFile( __dirname + '/public/index.html' );
} );

app.listen( port, function() {
    console.log( "Express server listening on port %d", port );
} );