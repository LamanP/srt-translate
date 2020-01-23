import { RequestListener, ServerResponse, IncomingMessage } from "http";

export type PathSelector = string | ( ( path: string) => boolean );

export abstract class AbstractResourceHandler {
    private _pathSelector: PathSelector;
    private _methods: any;

    constructor() {
        this._methods = {};
        this._pathSelector = "/";
    }

    /**
     * Specifies the path selector.
     * @param _pathSelector The path selector for this resource. If it's a string, paths that start with a url are served by this handler.
     * If it's a function, the function is called to determine whether a url is handled by this handler.
     */
    pathSelector( _pathSelector: PathSelector ): this {
        this._pathSelector = _pathSelector;
        return this;
    }

    /**
     * Handle a request
     * @param url Url that may be handled
     * @param method HTTP method
     * @returns True if request has been handled (either with or without error), otherwise false
     */
    handle( req: IncomingMessage, res: ServerResponse ): boolean {
        const url = req.url;
        let pathOk: boolean;
        if ( typeof this._pathSelector === "string" )
            pathOk = !!url && url.startsWith( this._pathSelector ) && ( url.length == this._pathSelector.length || "?&/".indexOf( url[ this._pathSelector.length ]) >= 0 );
        else
            pathOk = !!url && this._pathSelector( url );

        const allOk = pathOk && req.method && this._methods.hasOwnProperty( req.method.toLowerCase() );
        if ( allOk && req.method ) {
            const handler: RequestListener = this._methods[ req.method.toLowerCase() ];
            if ( handler )
                handler( req, res );
        }
        return allOk;
    }

    protected serveContent( res: ServerResponse, content: string, mimeType: string, httpStatus?: number, httpStatusMessage?: string ): void {
        res.setHeader( "Content-type", mimeType );
        res.writeHead( httpStatus || 200, httpStatusMessage || "OK" );
        res.write( content );
        res.end();
    }

    protected resourceNotFound( req: IncomingMessage, res: ServerResponse ): void {
        const url = req.url ? '"' + req.url + '" ' : "";
        res.writeHead( 404, "Resource " + url + "could not be found." );
        res.end();
    }

    /**
     * Specifies or removes a handler for a method
     * @param _method The method (GET, PUT, POST, etc.)
     * @param handler Specifies a handler.
     */
    method( _method: string, handler: RequestListener, thisArg?: object ): this {
        const method = _method.toLowerCase();
        if ( handler )
            this._methods[ method ] = thisArg ? handler.bind( thisArg) : handler;
        return this;
    }
}