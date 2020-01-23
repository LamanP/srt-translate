import { AbstractResourceHandler } from "../AbstractResourceHandler";
import { IncomingMessage, ServerResponse } from "http";
import { Html } from "../../Html";
import { FileSystem } from "../../filesys/FileSystem";
import { ClientFileSystemApi } from "../static/clientTs/ClientFileSystem/ClientFileSystemApi";

type ParsedUrl = {
    isFolder: boolean,
    path: string[],
    joinedPath: string
};

export class ServerFileSystem extends AbstractResourceHandler {
    constructor() {
        super();
        this.pathSelector( "/fs" )
            .method( "get", this.get, this )
            .method( "post", this.post, this )
            .method( "delete", this.delete, this );
    }

    private parseUrl( url: string ): ParsedUrl {
        let path = url.split( "/" );
        let isFolder = path[ 1 ] === "folder";
        path.splice( 0, 3 );
        return {
            isFolder: isFolder,
            path: path,
            joinedPath: "/" + path.join( "/" )
        };
    }

    private get( req: IncomingMessage, res: ServerResponse ): void {
        if ( !req.url ) return this.resourceNotFound( req, res );
        const self = this;
        const parsed = this.parseUrl( req.url );
        if ( parsed.isFolder ) {
            FileSystem.listFolder( parsed.joinedPath ).then( ( content: FileSystem.FileOrFolder[] ) => {
                const responseData: ClientFileSystemApi.RawFolderFileInfo[] = content.map( ( item: FileSystem.FileOrFolder ) => {
                    return {
                        isFolder: item.isFolder,
                        name: item.name
                    };
                } );
                self.serveContent( res, JSON.stringify( responseData ), "application/json" );
            } )
        }
    }

    private post( req: IncomingMessage, res: ServerResponse ): void {
        if ( !req.url ) return this.resourceNotFound( req, res );
    }

    private delete( req: IncomingMessage, res: ServerResponse ): void {
        if ( !req.url ) return this.resourceNotFound( req, res );
    }
}