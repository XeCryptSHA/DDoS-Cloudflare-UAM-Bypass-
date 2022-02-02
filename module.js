const fs = require( 'fs' );
const request = require( 'request' );
const progress = require( 'request-progress' );
const pre = '----';
const downloadManager = function ( url, filename ) {
    progress( request( url ), {
        throttle: 500
    } ).on( 'progress', function ( state ) {
        process.stdout.write( pre + '' + ( Math.round( state.percent * 100 ) ) + "%" );
    } ).on( 'error', function ( err ) {
        console.log( 'error :( ' + err );
    } ).on( 'end', function () {
        console.log( pre + '100% \n Download Completed' );
    } ).pipe( fs.createWriteStream( filename ) );
}
downloadManager( 'http://localhost:4181', 's.zip' );
