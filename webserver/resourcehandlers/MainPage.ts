import { AbstractResourceHandler } from "../AbstractResourceHandler";
import { IncomingMessage, ServerResponse } from "http";
import { Html } from "../../Html";

export class MainPage extends AbstractResourceHandler {
    constructor() {
        super();
        this.pathSelector( "/" )
            .method( "get", this.render, this );
    }

    private render( req: IncomingMessage, res: ServerResponse ): void {
        const doc = new Html.HtmlDocument();
        doc.head.append( "title" ).text( "SRT editor" );
        doc
            .appendCssStyleSheet( "/css/mainpage.css" )
            .appendJavascript( "/js/mainpage.js" );
        doc.body.append( "h1" ).text( "SRT Editor" );
        this.serveContent( res, doc.stringify(), "text/html" );
    }
}