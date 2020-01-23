import { RequestListener, ServerResponse, IncomingMessage } from "http";

export abstract class AbstractResourceHandler {
    private _pathSelector: string;
    private _methods: any;

    constructor() {
        this._methods = {};
        this._pathSelector = "/";
    }

    /**
     * Specifies the path selector. This handler will be invoked if the URL path starts with this path
     * @param _pathSelector The path selector for this resource
     */
    pathSelector( _pathSelector: string ): this {
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
        const pathOk = url && url.startsWith( this._pathSelector ) && ( url.length == this._pathSelector.length || "?&/".indexOf( url[ this._pathSelector.length ]) >= 0 );
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