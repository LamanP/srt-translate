import { version } from "../../../StaticFileVersion.js";
import { requiremod } from "../../RequireModule.js";

requiremod.requirejs.config(
    {
        paths: {
            d3: '/3rdparty/d3v5.js'
            // css: '/webContent/js/plugins/cssloader',
            // text: '/webContent/js/plugins/textloader',
            // ts: '/webContent/ts',
            // util: '/webContent/ts/util'
        },
        urlArgs: 'v=' + version
    } );
import { FileBrowser } from "./Widgets/FileBrowser/FileBrowser";

import * as d3 from "d3";

// Temp code to try out file browser
new FileBrowser( "test" )
.caption( "Select a file" )
.parent( d3.select( "body" ) )
.update();
