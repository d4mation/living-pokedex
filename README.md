# Living Pokédex Completion Tracker

> A living Pokédex is a fan term for a game which not only has a complete Pokédex, but has one of every available species of Pokémon stored in its PC boxes as well, usually in their National Pokédex order. It follows the most literal interpretation of the slogan of the series, "Gotta catch 'em all!".

## Features:
* Live-Refreshing Content across all Clients  
    * If a Pokémon is checked off, all connected Clients will immediately see it.
* Shows a count of all "Living" Pokémon across all Generations as well as per-Generation.
    * The per-Generation count is currently hidden on Mobile
* XY/ORAS Save Game Data exported and converted to .CSV by [PKHeX](https://github.com/kwsch/PKHeX) can be imported directly.
    * Tools -> Box Data Report -> Close (Asks you if you'd like to save a .CSV)
    * This will only check off Pokémon in your PC Boxes. Party, Battle Box, Day Care, etc. will be excluded.

## Requirements:
* [Node.js](https://nodejs.org/) installed
    * [ARM (i.e. Raspberry Pi) installation instructions](https://nikolayarhangelov.wordpress.com/2015/01/25/raspberry-pi-running-nodejs-and-mongodb-on-pi/)
* [mongoDB](https://www.mongodb.org/) installed
    * Running mongoDB on ARM can prove [fairly annoying](https://emersonveenstra.net/mongodb-raspberry-pi/).
        * Be sure to add 
            export PATH=$PATH:/opt/mongo/bin
            To your .profile file if you choose this method.
            
## Setup
            
By default, this Web App runs on Port 3000. If you would like to change that, open config.js in the Root Directory and change it there.

To install all of its dependencies, simply enter the directory and run:

    npm install
    
In pokedex.js within the Root Directory, you will want to change these strings:

    app.use( express.cookieParser( 'yourCookieParserSecret' ) );
    app.use( express.session( {
        secret: 'yourSessionSecret',
    } ) );

## Admin Account

Without an Admin Account, you will be unable to do much with this Web App.

I did not include a GUI for creating Admins, so you will need to do this via the mongo shell.

***NOTE:*** You will need to load the Webpage once before running these commands.

To create one, enter the mongo shell

    mongo
    
Then enter

    use pokedex
    db.createCollection( 'users' )
    db.users.insert( { username: '<USERNAME>', password: '<PASSWORD_HASH>', admin: true } )
    exit
    
#### Generating a Password Hash

You may have noticed you need to provide a Password Hash when creating that Admin Account. This Web App uses [bcrypt](https://www.npmjs.com/package/bcrypt) for its hashing functionality. 

The easiest way to hash yourself a password would be like this:

In index.html, add this anywhere you can find it:

    <input type = "text" class = "gimme-hash" />
    
In assets/js/websocket.js, add this at the end of the file:

    $( document ).on( 'change', '.gimme-hash', function() {

        io.emit( 'gimmeHash', $( this ).val() );

    } );

    io.on( 'hashGiven', function( data ) {

        console.log( data );

    } );
    
In pokedex.js, add this anywhere inside the db.once( 'open', function() { } ); Anonymous Callback Function:

    app.io.route( 'gimmeHash', function( req ) {

        var encrypt = bcrypt.hashSync( req.data, salt );

        req.io.emit( 'hashGiven', encrypt );

    } );
    
Once this is completed, type something inside the Text Input you made and click off of it. The hashed password should appear inside your Browser Console.

You will want to either delete all this added code or comment it out once you are finished. Pulling a new copy from this Repository to overwrite your changes will work as well (Just be sure to remember to change your Cookie and Session Secrets again).