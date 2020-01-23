import { ClientFileSystemApi } from "./ClientFileSystemApi";
import { Xhr } from "../Xhr";

export module  ClientFileSystem {

    function executeXhr<T>( ff: FolderFile, method: string, body?: string ): Promise<Xhr.IResponse> {
        const req: Xhr.IRequestor = Xhr.requestor();
        const url = "/fs/" + ( ff.isFolder ? "folder" : "file" ) + ff.fullPath();
        return req.request( url, method, body || null ).then( ( result: Xhr.IResult ) => {
            return ( result as Xhr.IResponse );
        } );
    }

    export function getRoot(): ClientFileSystemApi.IFolder {
        return new Folder( null, {
            name: "",
            isFolder: true
        } );
    }

    export function parsePath( path: string ): Promise<ClientFileSystemApi.IFolderFile | null> {
        const items = path.split( "/" );
        if ( items.length === 0 )
            return Promise.resolve( null );
        var folder = new Folder( null, {
            isFolder: true,
            name: ""
        } );
        return new Promise<ClientFileSystemApi.IFolderFile | null>( ( resolve ) => {
            items.forEach( ( item: string, index: number, items: string[] ) => {
                if ( index < items.length )
                    folder = new Folder( folder, {
                        isFolder: true,
                        name: item
                    } );
                else { // For the last item we need to query the server to see if this is a file
                    folder.checkItem( item ).then( ( itemKind: ClientFileSystemApi.ItemKind ) => {
                        switch (itemKind ) {
                            case ClientFileSystemApi.ItemKind.File:
                                resolve( new File( folder, {
                                    isFolder: false,
                                    name: item
                                } ) );
                            case ClientFileSystemApi.ItemKind.Folder:
                                resolve( new Folder( folder, {
                                    isFolder: true,
                                    name: item
                                } ) );
                            default:
                                resolve( null );
                        }
                    } );
                }
            } );
        } );
    }

    class FolderFile implements ClientFileSystemApi.IFolderFile {
        private readonly _rawData: ClientFileSystemApi.RawFolderFileInfo;
        private readonly _parent: Folder | null;

        constructor( _parent: Folder | null, _rawData: ClientFileSystemApi.RawFolderFileInfo ) {
            this._parent = _parent;
            this._rawData = _rawData;
        }

        getName(): string {
            return this._rawData.name;
        }

        setName(name: string): void {
            throw new Error("Method not implemented.");
        }

        getParentFolder(): ClientFileSystemApi.IFolder | null {
            return this._parent;
        }

        isFolder(): boolean {
            return this._rawData.isFolder;
        }

        fullPath(): string {
            let ff: FolderFile | null = this;
            let path = "";
            while ( ff ) {
                path = ff.getName() + "/" + path;
                ff = ff._parent;
            }
            return path;
        }

        delete(): Promise<void> {
            return executeXhr( this, "delete" ).then( ( response: Xhr.IResponse ) => {
                if ( Math.floor( response.status / 100) !== 2 )
                    throw new Error( "File/folder could not be deleted." );
            } );
        }
    }

    class Folder extends FolderFile implements ClientFileSystemApi.IFolder {
        checkItem(name: string): Promise<ClientFileSystemApi.ItemKind> {
            throw new Error("Method not implemented.");
        }

        constructor( _parent: Folder | null, _rawData: ClientFileSystemApi.RawFolderFileInfo ) {
            super( _parent, _rawData );
        }

        list(): Promise<ClientFileSystemApi.FolderItem[]> {
            const self = this;
            return executeXhr( this, "get" ).then( ( response: Xhr.IResponse ) => {
                // A folder listing is an array of raw data
                return ( response.response as ClientFileSystemApi.RawFolderFileInfo[] ).map( ( raw: ClientFileSystemApi.RawFolderFileInfo ) => {
                    return {
                        folder: raw.isFolder ? new Folder( self, raw ) : null,
                        file: raw.isFolder ? null : new File( self, raw )
                    }
                } );
            } );
        }
    }

    class File extends FolderFile implements ClientFileSystemApi.IFile {
        exists(): Promise<boolean> {
            return executeXhr( this, "head" ).then( ( response: Xhr.IResponse ) => {
                return Math.floor( response.status / 100 ) === 2;
            } );
        }

        read(): Promise<any> {
            return executeXhr( this, "get" ).then( ( response: Xhr.IResponse ) => {
                return response.response;
            } );
        }

        write( content: any ): Promise<void> {
            return executeXhr( this, "post", JSON.stringify( content ) ).then( ( response: Xhr.IResponse ) => {
                return response.response;
            } );
        }
    }
}