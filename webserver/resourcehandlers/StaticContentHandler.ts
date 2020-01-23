import { AbstractResourceHandler } from "../AbstractResourceHandler";
import { IncomingMessage, ServerResponse } from "http";
import { nover, verContent, ver } from "../../StaticFileVersion";
import { FileSystem } from "../../filesys/FileSystem";
import { Utils } from "../static/clientTs/Util";

type ExtensionInfo = {
    serverPath: string,
    contentType: string,
    versionLinks: boolean
};

let extensionMap: any = {
    js : {
        serverPath:     "./javascript/transpiled/webserver/static/",
        contentType:    "text/javascript",
        versionLinks:   false
    },
    css : {
        serverPath:     "./webserver/static/",
        contentType:    "text/css",
        versionLinks:   false
    },
    html : {
        serverPath:     "./webserver/static/",
        contentType:    "text/html",
        versionLinks:   true
    },
    png : {
        serverPath:     "./webserver/static/",
        contentType:    "image/png",
        versionLinks:   false
    },
    svg : {
        serverPath:     "./webserver/static/",
        contentType:    "image/svg+xml",
        versionLinks:   false
    }
};

function urlToExtInfo( url: Utils.HttpUrl ): ExtensionInfo | null {
    let resourceName = url.resourceName;

    if ( !resourceName ) return null;
    const nameExt = resourceName.split( "." );
    if ( nameExt.length < 2 ) return null;
    let ext = nameExt[ nameExt.length - 1 ];
    if ( !extensionMap.hasOwnProperty( ext ) ) return null;
    return extensionMap[ ext ];
}

function pathSelector( url: string ): boolean {
    return url === "/" || !!urlToExtInfo( new Utils.HttpUrl().parse( url ) );
}

function unslash( path: string ): string {
    if ( path.length > 0 && path[ 0 ] === "/" )
        return path.substring( 1 );
    return path;
}

export class StaticContentHandler extends AbstractResourceHandler {
    constructor() {
        super();
        this.pathSelector( pathSelector )
            .method( "get", this.render, this );
    }

    private render( req: IncomingMessage, res: ServerResponse ): void {
        const self = this;
        if ( !req.url )
            return this.resourceNotFound( req, res ); // never happens
        const parsedUrl = new Utils.HttpUrl().parse( req.url );

        // Is this the home page?
        let resourceName: string;
        let contentType: string;
        const extInfo = urlToExtInfo( parsedUrl );
        if ( !extInfo ) {
            self.resourceNotFound( req, res );
            return;
        }
        contentType = extInfo.contentType;
        if ( req.url = "/" ) {
            resourceName = "./webserver/static/default.html";

        // Is this third party stuff?
        } else if ( parsedUrl.path.length > 0 && parsedUrl.path[ 0 ] === "3rdparty") {
            resourceName = "./javascript/" + parsedUrl.resourceName;
        } else {
            resourceName = nover( extInfo.serverPath + unslash( req.url ) );
        }
        FileSystem.readFile( resourceName ).then( ( content: string ) => {
            if ( extInfo.versionLinks )
                content = verContent( content );
            self.serveContent( res, content, contentType );
        } ).catch( ( reason: any ) => {
            // Assume file not found
            self.resourceNotFound( req, res );
        } );
    }
}