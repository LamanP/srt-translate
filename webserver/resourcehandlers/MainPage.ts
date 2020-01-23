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
            .appendCssStyleSheet( "/css/default.css" )
            .appendJavascript( "https://d3js.org/d3.v5.min.js" )
            .appendES6Module( "/js/mainpage.js" );
        doc.body.append( "h1" ).text( "SRT Editor" );
        doc.body.append( "div" ).clazz( "intro" ).text( "This editor lets you create/upload projects to the server consisting of a video file and a srt file. The srt file is parsed and rendered in a user-friendly way." +
            " You are provided with several editing functions and if you're using chrome, you can have the SRT automatically translated by Google Translate<sup>TM</sup>. Click <a href=\"/htmldocs/help.html\" target=\"_blank\">here</a> for more help." );

        this.serveContent( res, doc.pretty(), "text/html" );
    }
}