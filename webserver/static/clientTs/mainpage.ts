import { FileBrowser } from "./Widgets/FileBrowser/FileBrowser";
import * as d3 from "d3";

// Temp code to try out file browser
new FileBrowser( "test" )
.caption( "Select a file" )
.parent( d3.select( "body" ) )
.update();
