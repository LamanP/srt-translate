import { FileSystem } from "./filesys/FileSystem";
import { Converters } from "./Converters";

// Validate argument
if ( process.argv.length < 5 ) {
    console.log( "Arguments: srtfile srclan trglan\r\n\r\nsrtfile\tName of the source SRT file\r\nsrclan\tnCode for the source language (as in html)\r\ntrglan\tnCode for the target language (as in html)" );
    process.exit();
}
const srtName = process.argv[ 2 ];
const srclang = process.argv[ 3 ];
const trglang = process.argv[ 4 ];

FileSystem.readFile( srtName ).then( ( srtData: string ) => {

    // Form the name of the html file
    const extensionIndex = srtName.lastIndexOf( "." );
    const htmlName = ( extensionIndex < 0 ? srtName : srtName.substring( 0, extensionIndex ) + "_" + trglang + ".html" );
    FileSystem.writeFile( htmlName, Converters.SrtToHtml( htmlName, srtData, srclang, trglang ) ).then( () => {
        console.log( "Converted content successfully writen to \"" + htmlName + "\"" );
    } ).catch( ( reason ) => {
        console.error( "Can't write \"" + htmlName + "\", reason: " + reason );
    } );
} ).catch( ( reason ) => {
    console.error( "Can't read \"" + srtName + "\", reason: " + reason );
} );