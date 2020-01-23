import { ver } from "./StaticFileVersion";

export module Html {

    enum Html5ElementType {
        Void,
        Template,
        RawText,
        Normal
    }

    type IndentedLine = {
        indent: string;
        content: string;
    }

    function html5elementType( elementName: string ): Html5ElementType
    {
        switch( elementName )
        {
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "input":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr":
                return Html5ElementType.Void;
            case "template":
                return Html5ElementType.Template;
            case "textarea":
            case "title":
            case "script":
            case "div":
            case "style":
                return Html5ElementType.RawText;
            default:
                return Html5ElementType.Normal;
        }
    }

    export class Element {
        private readonly name: string;
        private readonly attributes: any;
        private readonly children: Element[];
        private _text: string;

        constructor( name: string ) {
            this.name = name;
            this.attributes = {};
            this.children = [];
            this._text = "";
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

        clazz( classes: string ): this {
            return this.attr( "class", classes );
        }

        text( text: string ): this {
            this._text = text;
            return this;
        }

        stringify(): string {
            let ret = "<" + this.name;
            Object.keys( this.attributes ).forEach ( ( key: string ) => {
                ret += " " + key + "=\"" + this.attributes[ key ] + "\"";
            } );
            const fullClose = html5elementType( this.name ) == Html5ElementType.RawText;
            if ( !fullClose && this.children.length ===0 && this._text.length === 0 )
                ret += "/>";
            else {
                ret += ">" + this._text;
                this.children.forEach( ( child: Element ) => {
                    ret += child.stringify();
                } );
                if ( html5elementType( this.name ) != Html5ElementType.Void )
                    ret += "</" + this.name + ">";
            }
            return ret;
        }

        private indented( lines: IndentedLine[], indent: string ): void {
            let line = "<" + this.name;
            Object.keys( this.attributes ).forEach ( ( key: string ) => {
                line += " " + key + "=\"" + this.attributes[ key ] + "\"";
            } );
            const fullClose = html5elementType( this.name ) == Html5ElementType.RawText;
            if ( !fullClose && this.children.length ===0 && this._text.length === 0 ) {
                line += "/>";
                lines.push( {
                    indent: indent,
                    content: line
                } );
            }
            else {
                line += ">" + this._text;
                lines.push( {
                    indent: indent,
                    content: line
                } );
                this.children.forEach( ( child: Element ) => {
                    child.indented( lines, indent + "  " );
                } );
                if ( html5elementType( this.name ) != Html5ElementType.Void )
                    lines.push( {
                        indent: indent,
                        content: "</" + this.name + ">"
                    } );
            }
        }

        pretty(): string {
            const lines: IndentedLine[] = [];
            this.indented( lines, "" );
            return lines.map ( ( line: IndentedLine ) => {
                return line.indent + line.content;
            } ).join( "\r\n" );
        }

    }

    export class HtmlDocument {
        private _html: Element;
        private _head: Element;
        private _body: Element;

        constructor() {
            this._html = new Element( "html ");
            this._head = this._html.append( "head" );
            this._body = this._html.append( "body" );
        }

        get html(): Element {
            return this._html;
        }

        get head(): Element {
            return this._head;
        }

        get body(): Element {
            return this._body;
        }

        appendCssStyleSheet( url: string ): this {
            this._head.append( "link" )
                .attr( "rel", "stylesheet" )
                .attr( "type", "text/css" )
                .attr( "href", ver( url ) );
            return this;
        }

        appendJavascript( url: string, parent?: Element ): this {
            const addHere = parent || this.head;
            addHere.append( "script" )
                .attr( "type", "text/javascript" )
                .attr( "src", ver( url ) );
            return this;
        }

        appendES6Module( url: string, parent?: Element ): this {
            const addHere = parent || this.head;
            addHere.append( "script" )
                .attr( "type", "module" )
                .attr( "src", ver( url ) );
            return this;
        }

        stringify() {
            return "<!DOCTYPE>" + this._html.stringify();
        }
        pretty(): string {
            return "<!DOCTYPE>\r\n" + this._html.pretty();
        }
    }
}
