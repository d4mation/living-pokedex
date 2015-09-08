$( document ).ready( function() {

    $( 'body' ).scrollspy( {
        target: '#pokedex_generation_nav',
        offset: 40
    } );
    
    $( document ).click( function( event ) {
        var container = $( '.navbar-fixed-top' );

        if ( ! container.is( event.target ) // if the target of the click isn't the container...
            && container.has( event.target ).length === 0 ) { // ... nor a descendant of the container
            if ( $( '.navbar-collapse.in' ).length > 0 ) {
                $( '.navbar-toggle' ).trigger( 'click' );
            }
        }
    });
    
    $( document ).on( 'click', '#pokedex_generation_nav a', function() {
        
        var gen = $( this ).attr( 'href' );
        
        gen = gen.replace( '#', '' ).replace( '_', '-' ); // Convert from my ID Naming Convention to my Class Naming Convention
        
        $( '.' + gen ).css( 'background-color', '#00FF00' );
        
        setTimeout( function() {
            
            $( '.' + gen ).removeAttr( 'style' ); // Flash the color, then remove it
            
        }, 750 );
        
    } );
    
    $( '[name="pokedex_caught"]' ).bootstrapSwitch( {
        onText: 'Caught',
        offText: 'Need',
    } );

} );