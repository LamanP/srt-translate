import { AbstractResourceHandler } from "../AbstractResourceHandler";
import { IncomingMessage, ServerResponse } from "http";
import { nover } from "../../StaticFileVersion";
import { FileSystem } from "../../filesys/FileSystem";

export class HtmlDocs extends AbstractResourceHandler {
    constructor() {
        super();
        this.pathSelector( "/htmldocs" )
            .method( "get", this.render, this );
    }

    private render( req: IncomingMessage, res: ServerResponse ): void {
        const self = this;
        if ( !req.url )
            return this.resourceNotFound( req, res ); // never happens
        const resourceName = nover( "./webserver/static" + req.url );
        FileSystem.readFile( resourceName ).then( ( content: string ) => {
            self.serveContent( res, content, "text/html" );
        } ).catch( ( reason: any ) => {
            // Assume file not found
            self.resourceNotFound( req, res );
        } );
    }
}