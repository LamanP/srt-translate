export module Converters {
    const htmlParser = require( "node-html-parser" );

    class Element {
        private readonly name: string;
        private readonly attributes: object;
        private readonly children: Element[];
        private _fullClose: boolean;
        private _text: string;

        constructor( name: string ) {
            this.name = name;
            this.attributes = {};
            this.children = [];
            this._text = "";
            this._fullClose = false;
        }

        append( name: string ): Element {
            const child = new Element( name );
            this.children.push( child );
            return child;
        }

        attr( name: string, value: string ): this {
            this.attributes[ name ] = value;
            return this;
        }

        text( text: string ): this {
            this._text = text;
            return this;
        }

        fullClose( _fullClose: boolean ): this {
            this._fullClose = _fullClose;
            return this;
        }

        stringify(): string {
            let ret = "<" + this.name;
            Object.keys( this.attributes ).forEach ( ( key: string ) => {
                ret += " " + key + "=\"" + this.attributes[ key ] + "\"";
            } );
            if ( !this._fullClose && this.children.length ===0 && this._text.length === 0 )
                ret += "/>";
            else {
                ret += ">" + this._text;
                this.children.forEach( ( child: Element ) => {
                    ret += child.stringify();
                } );
                ret += "</" + this.name + ">";
            }
            return ret;
        }
    }

    type ParsedSrtItem = {
        lineNumber: number,
        timeLine: string,
        text: string
    };

    function parseSrt( srtData: string ): ParsedSrtItem[] {
        const items: ParsedSrtItem[] = [];
        const lines = srtData.split( /\n/ ).map( ( line: string ) => {
            return line.replace( "\r", "" );
        } );

        let i = 0;
        let l = lines.length;
        while ( i < l ) {
            // Skip blank lines
            while ( i < l && !lines[ i ] ) ++i;

            // Now we expect the number
            const lineNumber = +lines[ i++ ];
            if ( lineNumber === 0 )
                throw new Error( "Item number expected at line " + i );

            // Now the time line follows
            if ( i >= l )
                throw new Error( "Unexpected end of line, after line number " + i );
            const timeLine = lines[ i++ ];

            // Validate the time line
            if ( !timeLine.match( /^\d\d:\d\d:\d\d,\d\d\d +--> +\d\d:\d\d:\d\d,\d\d\d$/ ) )
                throw new Error( "Timeline has incorrect format at line number " + i );

            // Here the text starts and it continues to either EOF, or an empty line
            const j = i;
            while ( i < l && !!lines[ i ] ) ++i;
            items.push( {
                lineNumber: lineNumber,
                timeLine: timeLine,
                text: lines.slice( j, i ).join( "\r\n" )
            } );
        }
        return items;
    }

    export function SrtToHtml( htmlName: string, srtData: string, srclang: string, trglang: string ): string {

        // Initialize HTML document
        const html = new Element( "html" ).attr( "lang", trglang );
        const head = html.append( "head" );
        head.append( "title" ).text( htmlName );
        const body = html.append( "body" );
        const list = body.append( "ol" ).attr( "id", "list" );
        const items = parseSrt( srtData );
        items.forEach( ( item: ParsedSrtItem ) => {
            list.append( "li" )
                .attr( "lineNumber", "" + item.lineNumber )
                .attr( "time", item.timeLine )
                .text( item.text );
        } );

        // Create a button and a script to convert back to SRT
        body.append( "div" ).append( "button" ).attr( "id", "srtButton" ).text( "get SRT" );
        body.append( "div" ).append( "textarea" ).attr( "id", "srtResult" ).attr( "cols", "70" ).attr( "rows", "40" ).fullClose( true );
        body.append( "script" ).attr( "type", "text/javascript" ).text(
            [
                "const button = document.getElementById( 'srtButton' );",
                "button.addEventListener( 'click', () => {",
                "    const srt = Array.from( document.querySelectorAll( 'li' ) ).map( ( li ) => {",
                "        return li.getAttribute( 'linenumber' ) + \"\\r\\n\" +",
                "            li.getAttribute( 'time' ) + \"\\r\\n\" +",
                "            li.textContent + \"\\r\\n\"",
                "    } ).join( \"\\r\\n\");",
                "const list = document.getElementById( 'list' );",
                "list.parentNode.removeChild( list ); // Free up memory",
                "button.disabled = true;",
                "document.getElementById( 'srtResult' ).value = srt",
                "} )"
            ].join( "\r\n" )
        );
        console.log( "A total of " + items.length + " item(s) have been converted to HTML." );
        return "<!DOCTYPE html>" + html.stringify();
    }

    export function htmlToSrt( htmlName: string, htmlData: string ): string {
        let ret = "";

        const jsonData = htmlParser.parse( htmlData );
        console.log( JSON.stringify( jsonData, null, 2 ) );
        return ret;
    }
}