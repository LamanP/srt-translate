export module Utils {
    export type UrlQueryField = {
        key: string,
        value: string | null
    };

    export class HttpUrl {
        schema: string = "http";
        domain: string = "";
        port: number = 80;
        path: string[] = [];
        query: UrlQueryField[] = [];

        parse( url: string ): this {
            if ( url.length === 0 ) return this;

            let unparsed = url;

            // Schema
            let splt = unparsed.split( "://" );
            if ( splt.length === 1 ) {
                this.schema = "http";
                unparsed = splt[ 0 ];
            } else {
                this.schema = splt[ 0 ];
                unparsed = splt[ 1 ];
            }

            // Query
            splt = unparsed.split( "?" );
            if ( splt.length === 0 ) return this;
            let domainPath = splt[ 0 ];
            let queryString = splt.length > 1 ? splt[ 1 ] : null;
            if ( queryString ) {
                this.query = queryString.split( "&" ).map( ( field ) => {
                    let keyValue = field.split( "=" );
                    return {
                        key: keyValue[ 0 ],
                        value: keyValue.length > 1 ? decodeURIComponent( keyValue[ 1 ] ) : null
                    };
                } );
            } else {
                this.query = [];
            }

            // Domain and path
            if ( domainPath.length === 0 ) return this;
            this.path = domainPath.split( "/" );
            let domainPort = this.path.splice( 0, 1 )[ 0 ];
            splt = domainPort.split( ":" );
            this.domain = splt[ 0 ];
            this.port = splt.length < 2 ? 80 : +splt[ 1 ];

            return this;
        }

        /**
         * Property that contains the resource name, which is the last item on the url path
         */
        get resourceName(): string | null {
            if ( this.path && this.path.length > 0 )
                return this.path[ this.path.length - 1 ];
            return null;
        }

        stringify() {
            let url = this.schema;
            if ( url.length > 0 )
                url += ":";
            url += "//" + this.domain + "/" + this.path.join( "/" );
            if ( this.query.length > 0 ) {
                url += "?" + this.query.map( ( field ) => {
                    return field.key + ( field.value ? "=" + encodeURIComponent( field.value ) : "" );
                } );
            }
        }
    }
}
