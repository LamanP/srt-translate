/**
 * Static file version numbers. Update this number each time static files have been changed
 */
const version = 1;

/**
 * Appends a version number to a static resource
 * @param url Url the needs to versioned
 */
export function ver( url: string ): string {
    const argStart: string = url.indexOf( "?" ) < 0 ? "?" : "&";
    return url + argStart + "ver=" + version;
}

/**
 * Strips the status version number from an url
 * @param url url to be stripped
 */
export function nover( url: string ): string {
    return url.replace( /\?ver=\d+/, "" ).replace( /\&ver=\d+/, "" );
}