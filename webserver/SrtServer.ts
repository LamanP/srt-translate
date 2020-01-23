import { createServer, IncomingMessage, ServerResponse, Server } from "http";
import { AbstractResourceHandler } from "./AbstractResourceHandler";
import { MainPage } from "./resourcehandlers/MainPage";
import { CssHandler } from "./resourcehandlers/CssHandler";
import { ClientJsHandler } from "./resourcehandlers/ClientJsHandler";

export class SrtServer {
    private _port: number;
    private readonly _server: Server;
    private _started: boolean;
    private _handlers: AbstractResourceHandler[];

    constructor() {
        this._port = 3000;
        this._server = createServer( this.requestHandler.bind( this ) );
        this._started = false;
        this._handlers = [];
    }

    port( _port: number ): this {
        if ( _port !== this._port ) {
            this.stop();
            this._port = _port;
        }
        return this;
    }

    get started(): boolean {
        return this._started;
    }

    start(): this {
        if ( !this._started ) {
            this._server.listen( this._port );
            console.log( "SRT server started on port " + this._port + ". Surf to http://localhost:" + this._port + " to use it." );
            this._started = true;
        }
        return this;
    }

    registerHandler( _handler: AbstractResourceHandler ): this {
        this._handlers.push( _handler );
        return this;
    }

    stop(): this {
        if ( this._started ) {
            this._server.close();
            this._started = false;
        }
        return this;
    }

    private requestHandler( req: IncomingMessage, res: ServerResponse ): void {
        try {
            res.statusCode = 200; // Optimistic default

            // Let the first registered handler that can handle this, do it.
            let handled = false;
            for ( let i = 0, l = this._handlers.length; i < l && !handled; ++ i ) {
                const handler: AbstractResourceHandler = this._handlers[ i ];
                handled = handler.handle( req, res );
            }
            if ( !handled ) {
                res.writeHead( 404, "Resource not found" );
                res.end();
            }
        } catch( error ) {
            res.writeHead( 500, "Internal server error: " + error );
            res.end();
        }
    }
}

new SrtServer()
    .port( 3000 ) // Change if it conflicts
    .registerHandler( new MainPage() )
    .registerHandler( new CssHandler() )
    .registerHandler( new ClientJsHandler() )
    .start();
