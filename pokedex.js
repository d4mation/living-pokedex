var util = require( 'util' );
var conf = require( './config' ); // Facilitates easy deployment to "Live"
var port = conf.web.port;

var mongoose = require( 'mongoose' );

var express = require( 'express.io' ); // Includes Socket.io

var app = express().http().io();

var ss = require( 'socket.io-stream' );

var csv = require( 'fast-csv' );

app.use( express.cookieParser( 'yourCookieParserSecret' ) );
app.use( express.session( {
    secret: 'yourSessionSecret',
} ) );

var bcrypt = require( 'bcrypt' );
var salt = bcrypt.genSaltSync( 10 );
var fs = require( 'fs' );

var db = mongoose.connection;

var hasDownloaded = false;
var skippedCount = 0;
var hasStartedDownloading = setInterval( function() {
    if( hasDownloaded ) {
        clearInterval( hasStartedDownloading );
    }
}, 1500 );

var dpm = 0;
var dt = 0;

var PseudoGuid = new (function() {
    this.empty = "00000000-0000-0000-0000-000000000000";
    this.GetNew = function() {
        var fourChars = function() {
            return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
        };
        return (fourChars() + fourChars() + "-" + fourChars() + "-" + fourChars() + "-" + fourChars() + "-" + fourChars() + fourChars() + fourChars());
    };
})();

function mkdir_p( path, cb ){
    var mkdirp = require( 'mkdirp' );
    var cb1 = cb;
    mkdirp( path, function ( err ) {
        cb1();
    });
}

function download( url, path, cb ) {
    hasDownloaded=true;
    dpm++;
    dt++;
    console.log( 'downloading: \n' + url + '\n' + path + '\n' );
    var http = require( 'http' );
    var fs = require( 'fs' );

    var file = fs.createWriteStream( path );
    var request = http.get( url, function( response ) {
        response.pipe( file );
        cb();
    })
    }

db.on( 'error', console.error );
db.once( 'open', function() {

    var userSchema = new mongoose.Schema({
        username: {
            type: String,
        },
        password: {
            type: String,
        },
        admin: {
            type: Boolean,
            default: false,
        },

    });

    // Compile a 'User' model using the movieSchema as the structure.
    // Mongoose also creates a MongoDB collection called 'User' for these documents.
    var User = mongoose.model( 'users', userSchema );

    app.io.route( 'su', function( req ) {

        if ( req.session.su_trys === undefined ) {
            req.session.su_trys = 0;
        }

        if ( req.session.su_trys > 15 ) {
            req.io.emit( 'suFailure' );                
        }

        var password = req.data.password;

        User.find( { admin: true }, 'username password' ).exec( function( err, users ) { 
            if (err) return console.error(err);

            var result = false;

            for( user in users ) {
                user = users[user];

                if( ( bcrypt.compareSync( password, user.password ) ) && ( req.data.username == user.username ) ) {

                    result = true;
                    req.session.su = true;
                    req.session.user = user._id;
                    req.session.save( function( err ) { 
                        console.log( req.session );

                        req.io.emit( 'suSuccess' );
                        req.session.su_trys = 0;

                    } );
                    break;
                }
                else {
                    console.log( 'incorrect password' );
                    req.session.su_trys++;
                }

            }

            if( ! result ) {
                req.io.emit( 'suFailure' ); 
                req.session.su_trys++;           
            }

        } );

    } );

    app.io.route( 'getCurrentUser', function( req ) {

        if ( req.session.su === undefined ) {

            req.io.emit( 'suFailure' );
            req.io.emit( 'niceTry' );
            return false;

        }

        User.findOne( { _id: req.session.user }, 'username admin' ).exec( function( err, user ) {
            if ( err ) return console.error( err );

            req.io.emit( 'currentUserData', user );

        } );

    } );

    app.io.route( 'editUser', function( req ) {

        if ( req.session.su === undefined ) {

            req.io.emit( 'suFailure' );
            req.io.emit( 'niceTry' );
            return false;

        }

        var hashed = bcrypt.hashSync( req.data.password, salt );

        User.findOne( {_id:req.data.id }, 'username' ).exec( function( err, user ) { 
            if (err) return console.error( err );

            User.update( { _id: req.data.id }, { password: hashed }, function ( err, status ) {
                if ( err ) return console.error( err );

                req.io.emit( 'userUpdated', user );

            } );

        } );

    } );

    app.io.route( 'logout', function( req ) {
        req.session.su = false;
        req.session.user = null;
        req.session.su_trys = 0;
        req.session.save( function() {
            req.io.emit( 'logoutComplete' );
        } );
    } );

    var livingPokedexCompletionSchema = new mongoose.Schema( {
        no: {
            type: Number,
        },
        pokemon: {
            type: String,
        },
        caught:{
            type: Boolean,
            default: false,
        },
        x: {
            type: String,
            default: '',
        },
        y: {
            type: String,
            default: '',
        },
        or: {
            type: String,
            default: '',
        },
        as: {
            type: String,
            default: '',
        },
    } );

    var PokemonEntry = mongoose.model( 'LivingPokedexCompletion', livingPokedexCompletionSchema );

    function newPokemonEntry( no, pokemon, caught, x, y, or, as ) {
        var newPokemonEntry = new PokemonEntry( {
            no: no,
            pokemon: pokemon,
            caught: caught,
            x: x,
            y: y,
            or: or,
            as: as,
        } );

        newPokemonEntry.save( function( err, thor ) {
            if( err ) return console.error( err );
            console.dir( thor );
        } );
    }

    app.io.route( 'ready', function( req ) {

        if ( req.session.su === true ) {

            req.io.emit( 'suSuccess' );

        }

        req.io.join( req.data.room );

        PokemonEntry.find( {}, 'no pokemon caught x y or as' ).sort( 'no' ).exec( function( err, pokemon ) { 
            if ( err ) return console.error( err );

            if ( ( pokemon.length == 0 ) || ( pokemon[0] === undefined ) ) { 
                
                req.io.emit( 'getPokedex' );
                
                var pokeApiSprite = 'http://pokeapi.co/media/img/';

                for ( var nationalDex = 1; nationalDex <= 718; nationalDex++ ) {
                    // This merely checks if you have their Sprites downloaded. If they are downloaded, nothing happens.
                    // PokeApi has a supposed limit of 300 requests per day. I never hit it in Development, but I did once I went Live.

                    ( function( nationalDex ) {

                        var exists = require( './existsSync.js' );
                        var downloadDest = __dirname + '/assets/images/sprites/' + nationalDex + '.png';
                        var destDir = downloadDest.substring( 0, downloadDest.lastIndexOf( '/' ) );

                        var downloadUrl = pokeApiSprite + nationalDex + '.png';

                        if ( exists( downloadDest ) === false ) {
                            console.log( downloadDest + ' does not exist' );
                            mkdir_p( destDir, function() {
                                download( downloadUrl, downloadDest, function() {
                                    console.log( 'finished downloading ' + downloadUrl );
                                } );
                            } );
                        }

                    } )( nationalDex );

                }

                console.log( 'Importing from nationalDex.csv' );

                var request = require( 'request' );

                var stream = fs.createReadStream( __dirname + '/nationalDex.csv' );

                var csvStream = csv( {
                    headers: true, 
                    quote: null, 
                    escape: null, 
                    trim: true,
                    discardUnmappedColumns: true,
                } )
                .on( 'data', function( data ) {
                    newPokemonEntry( data.no, data.pokemon, 0, '', '', '', '' );
                } )
                .transform( function( data ) {

                    for( var name in data ) {

                        var newName = name.replace( /"/g, '' );

                        Object.defineProperty( data, newName,
                                              Object.getOwnPropertyDescriptor( data, name ) ); // Fast CSV is super picky about Quotation Marks and it is hard to deal with Objects with them in the Property Name.
                        delete data[name];

                        data[newName] = data[newName].replace( /"/g, '' ); // May as well rip them out of the Property Values while we're at it

                    }

                    return data;

                } )
                .on( 'end', function() {
                    req.io.emit( 'pokedexCreated' );
                });

                stream.pipe( csvStream );

            }
            else {

                // Creates the nationalDex.csv of a Blank Slate if one doesn't already exist
                
                var exists = require( './existsSync.js' );
                var downloadDest = './nationalDex.csv';
                var destDir = downloadDest.substring( 0, downloadDest.lastIndexOf( '/' ) );

                if ( exists( downloadDest ) === false ) {

                    var dexCsv = 'no,pokemon\n';

                    for ( var dexIndex = 0; dexIndex < pokemon.length; dexIndex++ ) {

                        dexCsv = dexCsv + pokemon[dexIndex].no + ',' + pokemon[dexIndex].pokemon + '\n';

                    }

                    fs.writeFile( downloadDest, dexCsv );

                }

            }

            req.io.emit( 'pokedexList', pokemon );

        } );

    } );

    app.io.route( 'editPokedexEntry', function( req ) {

        if ( req.session.su === undefined ) {

            req.io.emit( 'suFailure' );
            return false;

        }

        PokemonEntry.findOne( {_id:req.data}, 'no pokemon caught' ).exec( function( err, pokemon ) {
            if (err) return console.error(err);

            req.io.emit( 'pokedexEntryDetails', pokemon );

        } );

    } );

    app.io.route( 'updatePokedexEntry', function( req ) {

        if ( req.session.su === undefined ) {

            req.io.emit( 'suFailure' );  
            req.io.emit( 'niceTry' );
            return false;

        }

        PokemonEntry.findOne( {_id:req.data.id}, 'no pokemon caught' ).exec( function( err, pokemon ) {
            if (err) return console.error(err);

            pokemon.caught = req.data.caught;
            pokemon.save();

            req.io.emit( 'pokemonUpdated', pokemon ); // Emit to current user
            req.io.room( req.data.room ).broadcast( 'pokemonUpdated', pokemon ); // Broadcasts to other clients the changes

        } );

    } );

    // CSV Upload Stream 
    app.io.on( 'connection', function( socket ) {

        ss( socket ).on( 'csvUpload', function( stream, data, room ) {

            if ( socket.handshake.session.su === undefined ) {

                socket.emit( 'suFailure' );
                req.io.emit( 'niceTry' );
                return false;

            }

            stream.on( 'data', function( chunk ) {
                // use a chunk of file. a chunk is a Buffer.
            } );
            stream.on( 'error', function( error ) {
                console.log( 'error ' + error );
            } );
            stream.on('end', function() {
                // upload finished
            } );

            var csvStream = csv( { 
                headers: true, 
                quote: null, 
                escape: null, 
                trim: true,
                discardUnmappedColumns: true,
            } )
            .on( 'data', function( data ) {

                if ( data.Species == 'Farfetch’d' ) {

                    data.Species = 'Farfetch&rsquo;d';

                }
                else if ( data.Species == 'Flabébé' ) {

                    data.Species = 'Flab&#xE9;b&#xE9;';

                }
                else if ( data.Species == 'Nidoran♂' ) {

                    data.Species = 'Nidoran&#9794;';

                }
                else if ( data.Species == 'Nidoran♀' ) {

                    data.Species = 'Nidoran&#9792;';

                }

                PokemonEntry.findOne( { pokemon: data.Species }, 'no pokemon caught' ).exec( function( err, pokemon ) { 
                    if (err) return console.error( err );

                    if ( pokemon !== null ) { // Don't try to update something that isn't there

                        PokemonEntry.update( { _id: pokemon._id }, { caught: true }, function( err, status ) {
                            if ( err ) return console.error( err );

                            socket.emit( 'pokedexEntryImported', pokemon, true ); // Emits to current socket
                            socket.broadcast.to( room ).emit( 'pokedexEntryImported', pokemon, true ); // Broadcasts to other clients the changes

                        } );

                    }

                } );

            } )
            .transform( function( data ) {

                for( var name in data ) {

                    var newName = name.replace( /"/g, '' );

                    Object.defineProperty( data, newName,
                                          Object.getOwnPropertyDescriptor( data, name ) ); // Fast CSV is super picky about Quotation Marks and it is hard to deal with Objects with them in the Property Name.
                    delete data[name];

                    data[newName] = data[newName].replace( /"/g, '' ); // May as well rip them out of the Property Values while we're at it

                }

                return data;

            } )
            .on( 'error', function( error ) {

                console.log( error );

            } )
            .on( 'end', function() {

                socket.emit( 'pokedexImported' );
                console.log( 'CSV Parsing Complete' );

            } );

            stream.pipe( csvStream );

        } );

    } );

    app.use( '/', express.static( __dirname + '/assets' ) );

    app.get( '/',function( req, res ) {
        res.sendfile( __dirname + '/index.html' );
    } );

    app.get( '/images/sprites/*', function( req, res ) {
        res.sendfile( __dirname + '/assets/images/sprites/default.png' ); // If there isn't a Sprite available
    } );

    console.log( 'server started on port ' + port );

    app.listen( port );

} );

mongoose.connect( 'mongodb://localhost/pokedex' );