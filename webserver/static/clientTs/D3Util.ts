import * as d3 from "d3";

export type AnyD3Selection = d3.Selection<any, any, any, any>;

export type Size = {
    width: string | null,
    height: string | null
};

const cssUsed: string[] = [];

export function useCss( url: string ): void {
    if ( cssUsed.indexOf( url ) < 0 ) {
        d3.select( "head" ).append( "link" )
            .attr( "rel", "stylesheet" )
            .attr( "type", "text/css" )
            .attr( "href", url );
        cssUsed.push( url );
    }
}
