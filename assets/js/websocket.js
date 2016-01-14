console.todo = console.info;

io = io.connect();

var loginData = {
    room:  'pokedexLobby',
}
// Emit ready event with room name.

ss.forceBase64 = true; // Necessary to properly stream to the server

io.emit( 'ready', loginData );

io.on( 'getPokedex', function() {

    $( '#database_modal' ).modal( 'show' );

} );

io.on( 'pokedexCreated', function() {

    io.emit( 'ready', loginData );

    $( '#database_modal' ).modal( 'hide' );

} );

io.on( 'pokedexList', function( pokedex ) {

    var box = '';

    var caught = {
        gen1: 0,
        gen2: 0,
        gen3: 0,
        gen4: 0,
        gen5: 0,
        gen6: 0,
    };
    var totalCaught = 0;

    var pokemonGeneration;
    var currentGen;
    var startOfGen;

    for ( var nationalDex = 1, boxPokemonCounter = 1, boxLineCounter = 1; nationalDex <= pokedex.length; nationalDex++, boxPokemonCounter++, boxLineCounter++ ) {

        pokemonGeneration = whichGeneration( nationalDex );

        currentGen = pokemonGeneration.currentGen;
        startOfGen = pokemonGeneration.startOfGen;

        if ( pokedex[ nationalDex -1 ].caught === true ) {

            caught['gen' + currentGen ]++;

        }

        if ( boxLineCounter == 1 ) {

            box = box + '<div class = "row">';

        }

        box = box + '<a href = "#" class = "edit-pokedex-entry" data-id = "' + pokedex[ nationalDex - 1 ]._id + '">';

        box = box + '<div' + ( ( startOfGen === true ) ? ' id = "gen_' + currentGen + '"' : '' ) + ' class = "col-sm-2 col-xs-4 pokedex-entry no-' + nationalDex + ' gen-' + currentGen + ( ( startOfGen === true ) ? ' new-gen-begins' : '' ) + ( ( pokedex[ nationalDex - 1 ].caught === true ) ? ' caught' : '' ) + '"><img src = "/images/sprites/' + nationalDex + '.png" />' + '#' + nationalDex + ' ' + pokedex[ nationalDex - 1 ].pokemon + '</div>';

        box = box + '</a>';

        if ( boxLineCounter == 6 ) {

            box = box + '</div>';

            boxLineCounter = 0;

        }

        if ( ( boxPokemonCounter == 30 ) || ( nationalDex == pokedex.length ) ) {

            box = '<div class = "container-fluid"><h3 id = "box_' + ( nationalDex - ( boxPokemonCounter - 1 ) ) + '_' + nationalDex + '">' + ( nationalDex - ( boxPokemonCounter - 1 ) ) + ' - ' + nationalDex + '</h3><div class = "section">' + box + '</div></div>';

            $( '#pokedex_container' ).append( box );

            box = '';

            boxPokemonCounter = 0;

        }

    }

    for ( var name in caught ) {

        totalCaught = totalCaught + caught[name];

        $( '#' + name + '_completion' ).text( caught[name] );

    }

    $( '#national_completion' ).text( totalCaught );

});

$( 'form' ).submit( function( event ) {

    event.preventDefault(); // Allows Forms to Validate, but doesn't force a Refresh of the page on Submission

} );

$( document ).on( 'click', '#login', function( event ) {

    event.preventDefault();

    $( '#login_modal' ).modal( 'show' );

} );

$( document ).on( 'click', '#login_modal .btn.login', function() {

    var data = {
        username: $( '#login_modal .username' ).val(),
        password: $( '#login_modal .password' ).val(),
    };

    io.emit( 'su', data );

} );

io.on( 'suSuccess', function() { 

    console.log( 'successful login' );

    $( '#login_modal' ).modal( 'hide' );

    $( '#admin_controls' ).html( '<li><a href = "#" id = "import">Import</a></li><li><a href = "#" id = "edit_user">Change Password</a></li><li><a href = "#" id = "logout">Logout</a></li>' );
    
    $( 'body' ).addClass( 'admin' );

} );

$( document ).on( 'click', '#logout', function( event ) {

    event.preventDefault();

    io.emit( 'logout' );

} );

io.on( 'logoutComplete', function() {

    console.log( 'sucessful logout' );

    $( '#admin_controls' ).html( '<li><a href = "#" id = "login">Admin Login</a></li>' );
    
    $( 'body' ).removeClass( 'admin' );

} );

io.on( 'suFailure', function() {

    console.log( 'unsuccessful login' );

} );

io.on( 'niceTry', function() {

    alert( 'Nice Try' );
    
} );

$( document ).on( 'click', '#edit_user', function( event ) {

    event.preventDefault();

    io.emit( 'getCurrentUser' );

} );

io.on( 'currentUserData', function( data ) {

    $( '#edit_user_modal .modal-title' ).text( 'Edit ' + data.username );
    $( '#edit_user_modal .username' ).val( data.username );
    $( '#edit_user_modal .btn.save' ).data( 'id', data._id );

    $( '#edit_user_modal' ).modal( 'show' );

} );

$( document ).on( 'click', '#edit_user_modal .btn.save', function() {

    var data = {
        id: $( '#edit_user_modal .btn.save' ).data( 'id' ),
        password: $( '#edit_user_modal .password' ).val(),
    };

    io.emit( 'editUser', data );

} );

io.on( 'userUpdated', function( data ) {

    console.log( data.username + ' Updated' );

    $( '#edit_user_modal' ).modal( 'hide' );

} );

$( document ).on( 'click', '.edit-pokedex-entry', function( event ) {

    event.preventDefault();

    var dexNumber = $( this ).data( 'id' );

    io.emit( 'editPokedexEntry', dexNumber );

} );

io.on( 'pokedexEntryDetails', function( data ) {

    $( '#pokedex_entry_modal .modal-title' ).text( 'Edit ' + data.pokemon );

    $( '#pokedex_entry_modal .sprite' ).attr( 'src', '/images/sprites/' + data.no + '.png' );

    ( ( data.caught === true ) ? $( '#pokedex_entry_modal [name="pokedex_caught"]' ).bootstrapSwitch( 'state', true, false ) : $( '#pokedex_entry_modal [name="pokedex_caught"]' ).bootstrapSwitch( 'state', false, false ) );

    $( '#pokedex_entry_modal .btn.save' ).data( 'id', data._id );

    $( '#pokedex_entry_modal' ).modal( 'show' );

} );

$( document ).on( 'click', '#pokedex_entry_modal .btn.save', function() {

    var data = {
        id: $( '#pokedex_entry_modal .btn.save' ).data( 'id' ),
        caught: $( '#pokedex_entry_modal [name="pokedex_caught"]' ).bootstrapSwitch( 'state' ),
    };

    io.emit( 'updatePokedexEntry', data );

} );

io.on( 'pokemonUpdated', function( data ) {

    updatePokedexDisplay( data.no, data.caught );

} );

$( '#pokedex_entry_modal' ).on( 'hidden.bs.modal', function () {

    $( '#pokedex_entry_modal .btn.save' ).data( 'id', '' ); // Clear out ID to prevent mistakes/abuse

} );

$( document ).on( 'click', '#import', function( event ) {

    event.preventDefault();

    $( '#csv_import_modal' ).modal( 'show' );

} );

$( document ).on( 'click', '#csv_import_modal .btn.import', function() {

    $( this ).val( 'Working...' ).attr( 'disabled', true );

    var file = $( '#csv_import_modal .file-upload' )[0].files[0];
    var stream = ss.createStream();

    var blobStream = ss.createBlobReadStream( file );

    var data = {
        data: file,
        size: file.size,
        name: file.name,
    }

    blobStream.on( 'data', function( chunk ) {

        stream.write( chunk );

    } );

    blobStream.on( 'end', function() {

        stream.end();

    } );

    // upload a file to the server. 
    ss( io ).emit( 'csvUpload', stream, data, loginData.room );
    blobStream.pipe( stream );

} );

io.on( 'pokedexEntryImported', function( data, caught ) {

    updatePokedexDisplay( data.no, caught );

} );

io.on( 'pokedexImported', function() {

    $( '#csv_import_modal' ).modal( 'hide' );

    $( '#csv_import_modal .btn.import' ).val( 'Import' ).attr( 'disabled', false );

} );

$( '#login_modal, #edit_user_modal, #csv_import_modal' ).on( 'hidden.bs.modal', function () {

    $( this ).find( 'form' )[0].reset(); // Clear out inputs to prevent mistakes/abuse

} );

function updatePokedexDisplay( nationalDex, caught ) {

    var pokemonGeneration = whichGeneration( nationalDex );

    if ( caught === true ) {

        if ( ! $( '.no-' + nationalDex ).hasClass( 'caught' ) ) {

            $( '#gen' + pokemonGeneration.currentGen + '_completion' ).text( parseInt( $( '#gen' + pokemonGeneration.currentGen + '_completion' ).text() ) + 1 );

            $( '#national_completion' ).text( parseInt( $( '#national_completion' ).text() ) + 1 );

            $( '.no-' + nationalDex ).addClass( 'caught' );

        }

    }
    else {

        if ( $( '.no-' + nationalDex ).hasClass( 'caught' ) ) {

            $( '#gen' + pokemonGeneration.currentGen + '_completion' ).text( parseInt( $( '#gen' + pokemonGeneration.currentGen + '_completion' ).text() ) - 1 );

            $( '#national_completion' ).text( parseInt( $( '#national_completion' ).text() ) - 1 );

            $( '.no-' + nationalDex ).removeClass( 'caught' );

        }

    }

}

function whichGeneration( nationalDex ) {

    var generations = {
        gen1: {
            start: 1,
            end: 151,
        },
        gen2: {
            start: 152,
            end: 251,
        },
        gen3: {
            start: 252,
            end: 386,
        },
        gen4: {
            start: 387,
            end: 493,
        },
        gen5: {
            start: 494,
            end: 649,
        },
        gen6: {
            start: 650,
            end: 721,
        },
    };

    var pokemonGeneration = {
        currentGen: 0,
        startOfGen: false,
    };

    if ( ( nationalDex >= generations.gen1.start ) && ( nationalDex <= generations.gen1.end ) ) {
        pokemonGeneration.currentGen = 1;
        if ( nationalDex == generations.gen1.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }
    else if ( ( nationalDex >= generations.gen2.start ) && ( nationalDex <= generations.gen2.end ) ) {
        pokemonGeneration.currentGen = 2;
        if ( nationalDex == generations.gen2.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }
    else if ( ( nationalDex >= generations.gen3.start ) && ( nationalDex <= generations.gen3.end ) ) {
        pokemonGeneration.currentGen = 3;
        if ( nationalDex == generations.gen3.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }
    else if ( ( nationalDex >= generations.gen4.start ) && ( nationalDex <= generations.gen4.end ) ) {
        pokemonGeneration.currentGen = 4;
        if ( nationalDex == generations.gen4.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }
    else if ( ( nationalDex >= generations.gen5.start ) && ( nationalDex <= generations.gen5.end ) ) {
        pokemonGeneration.currentGen = 5;
        if ( nationalDex == generations.gen5.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }
    else if ( ( nationalDex >= generations.gen6.start ) && ( nationalDex <= generations.gen6.end ) ) {
        pokemonGeneration.currentGen = 6;
        if ( nationalDex == generations.gen6.start ) {
            pokemonGeneration.startOfGen = true;
        }
    }

    return pokemonGeneration;

}