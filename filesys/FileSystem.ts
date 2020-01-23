export module FileSystem {
    let fs = require( "fs" );
    let path = require( "path" );

    /**
     * Read a file and return a promise for its contents
     * @param path Path to the file
     */
    export function readFile( path: string ): Promise<string> {
        return new Promise<string>( ( resolve, reject ) => {
            fs.readFile( path, 'utf8', ( err: any, data: any ) => {
                if ( err )
                    reject( err );
                else {
                    resolve( data );
                }
            } );
        } );
    }

    /**
     * Write a file and return a promise for its completion
     * @param path Path to the file that must be written
     * @param data Data to be written
     */
    export function writeFile( path: string, data: string ): Promise<void> {
        return new Promise<void>( (resolve, reject ) => {
            fs.writeFile( path, data, ( err: any ) => {
                if ( err )
                    reject( err );
                else {
                    resolve();
                }
            } );
        } );
    }

    export type FileOrFolder = {
        isFolder: boolean,
        name: string
    };

    export function listFolder( inFolder: string, nameRegEx?: RegExp ) : Promise<FileOrFolder[]> {
        return new Promise<FileOrFolder[]>( ( resolve, reject ) => {
            fs.readdir( inFolder, ( err: any,  items: any[] ) => {
                if ( err )
                    reject( err );
                else {
                    let content: FileOrFolder[] = [];
                    for ( var i=0; i < items.length; i++ ) {
                        if ( !nameRegEx || nameRegEx.test( items[ i ] ) ) {
                            fs.stat( inFolder + "/" + items[ i ], ( stat: any ) => {
                                content.push( {
                                    isFolder: stat.isDirectory(),
                                    name: items[ i ]
                                } );
                                if ( i == items.length - 1 )
                                    resolve( content );
                            } );
                        }
                    }
                }
            });
        } );
    }

}