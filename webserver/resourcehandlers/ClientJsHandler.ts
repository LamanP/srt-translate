import { AbstractResourceHandler } from "../AbstractResourceHandler";
import { IncomingMessage, ServerResponse } from "http";
import { nover } from "../../StaticFileVersion";
import { FileSystem } from "../../filesys/FileSystem";

export class ClientJsHandler extends AbstractResourceHandler {
    constructor() {
        super();
        this.pathSelector( "/js" )
            .method( "get", this.render, this );
    }

    private render( req: IncomingMessage, res: ServerResponse ): void {
        const self = this;
        if ( !req.url )
            return this.resourceNotFound( req, res ); // never happens
        const resourceName = nover( "./javascript/webserver/static/clientTs/" + req.url.substring( 3 ) );
        FileSystem.readFile( resourceName ).then( ( content: string ) => {
            self.serveContent( res, content, "text/javascript" );
        } ).catch( ( reason: any ) => {
            // Assume file not found
            self.resourceNotFound( req, res );
        } );
    }
}