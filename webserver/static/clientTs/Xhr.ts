export module Xhr {

    /**
     * Interface to fire XHR requests. To obtain a reference, call the Xhr.requestor() method;
     */
    export interface IRequestor {
        /**
         * Initiate an XHR request
         * @param url URL for request
         * @param method Method (GET, POST, PUT, etc.)
         * @param body Optional request body
         * @returns A promise.
         */
        request( url: string, method: string, body: string | null ): Promise<IResult>;
    }

    /**
     * Represents a single request
     */
    export interface IRequest {
        readonly url: string;
        readonly method: string;
    }

    /**
     * The result of an XHR request. This interface is always returned in the form of either IResponse or IError.
     */
    export interface IResult extends IRequest {
        readonly status: number;
    }

    /**
     * Represents the response to and XHR request.
     */
    export interface IResponse extends IResult {
        readonly response: any;
    }

    /**
     * Represents an error that occured while processing an XHR request.
     */
    export interface IError extends IResult {
        readonly message: string;
    }

    export interface IPendingChangeEventArgs extends IRequest {
        readonly pending: number;
        readonly started: boolean;
    }

    class Request implements IRequest {
        public readonly url: string;
        public readonly method: string;

        constructor( url: string, method: string ) {
            this.url = url;
            this.method = method;
        }
    }

    class Result extends Request implements IResult {
        public readonly status: number;

        constructor( url: string, method: string, status: number ) {
            super( url, method );
            this.status = status;
        }
    }

    class Response extends Result implements IResponse{
        public readonly response: any;

        constructor( url: string, method: string, status: number, response: any ) {
            super( url, method, status );
            this.response = response;
        }
    }

    class XhrError extends Result implements IError {
        public readonly message: string;

        constructor( url: string, method: string, status: number, message: string ) {
            super( url, method, status );
            this.message = message;
        }

        public toString(): string {
            return "Interne fout: " + this.message + this.method + " mislukt met status: " + this.status + ", URL: " + this.url;
        }
    }

    /**
     * Class to make and handle Xhr requests.
     */
    class Requestor implements IRequestor {
        private pending: number;

        constructor() {
            this.pending = 0;
        }

        request( url: string, method: string, body: string | null ): Promise<IResult> {
            return new Promise<any>( ( resolve, reject ) => {
                try {
                    let req = new XMLHttpRequest();
                    let self: Requestor = this;
                    req.addEventListener( "load", () => {
                        --self.pending;
                        if ( Math.floor( req.status / 100) === 2 ) {
                            try {
                                resolve( new Response( url, method, req.status, req.response.length > 0 ? JSON.parse( req.response ) : null ) );
                            } catch ( err ) {
                                reject( err );
                            }
                        } else {
                            reject( new XhrError( url, method, req.status, req.responseText ) );
                        }
                    } );

                    req.addEventListener( "error", () => {
                        --self.pending;
                        reject( new XhrError( url, method, 0, "Network error." ) );
                    } );
                    req.open( method, url );
                    req.setRequestHeader( "Accept", "application/json" );
                    if ( body ) {
                        req.setRequestHeader( "Content-type", "application/json; charset=UTF-8" );
                        req.setRequestHeader( "Accept", "application/json" );
                        req.send( body );
                    }
                    else
                        req.send( null );
                    ++self.pending;
                } catch ( e ) {
                    let message: string = e.getMessage ? e.getMessage() : "";
                    reject( new XhrError( url, method, 0, "Exception while processing XHR network request" + message ) );
                }
            } );
        }

        getPending(): number {
            return this.pending;
        }
    }


    /**
     * Factory for building URLs that are used by XHR requests, do no protocol or host support. Only path and query fields
     */
    export class UrlFactory {
        public absolute: boolean;
        public path: string[];
        public query: any;

        private constructor() {
            this.path = [];
            this.query = {};
            this.absolute = false;
        }

        toString(): string {
            let s: string = "";
            if ( this.absolute )
                s += "/";
            s += this.path.join( "/" );
            let queryKeys = Object.keys( this.query );
            if ( queryKeys.length > 0 ) {
                s += "?" + queryKeys.map( ( key: string ) => {
                    return key + "=" + this.query[ key ];
                } ).join( "&" );
            }
            return s;
        }

        static parse( urlString: string | null ): UrlFactory {
            let url = new UrlFactory();
            if ( urlString ) {
                let pathQuery: string[] = urlString.split( /\?/ );
                if ( pathQuery.length > 0 ) {
                    let pathString: string = pathQuery[0];
                    let absolute: boolean = ( pathString.substring( 0, 1 ) === "/" );
                    if ( absolute ) {
                        pathString = pathString.substring( 1 );
                    }
                    let path = pathString.split( /\// );
                    let query: any = {};
                    if ( pathQuery.length > 1 ) {
                        let queryParts = pathQuery[1].split( /&/ );
                        queryParts.forEach( ( part: string ) => {
                            let kv: string[] = part.split( /=/ );
                            if ( kv.length !== 2 )
                                throw new Error( "Invalid url" );
                            query[ kv[ 0 ] ] = kv[ 1 ];
                        } );
                    }
                    url.absolute = absolute;
                    url.path = path;
                    url.query = query;
                }
            }
            return url;
        }
    }

    let reqtor: IRequestor | undefined;

    /**
     * Obtain the single global XHR requestor for making Xhr requests
     * @returns Interface to the requestor.
     */
    export function requestor(): IRequestor {
        if ( !reqtor )
            reqtor = new Requestor();
        return reqtor;
    }
}
