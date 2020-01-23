import * as d3 from "d3";
import { AnyD3Selection, useCss, Size } from "../../D3Misc";

useCss( "/css/Widget/widget.css" );

export abstract class Widget {
    private readonly _name: string;
    private _parent: AnyD3Selection | null;
    private _size: Size | null;
    private _caption: string | null;

    constructor( _name: string, _defaultSize?: Size ) {
        this._parent = null;
        this._name = _name;
        this._size = _defaultSize || null;
        this._caption = null;
    }

    parent( _parent: AnyD3Selection ): this {
        this._parent = _parent;
        return this;
    }

    size( _size: Size ): this {
        this._size = _size;
        return this;
    }

    caption( _caption: string ): this {
        this._caption = _caption;
        return this;
    }

    abstract updateInContainer( container: AnyD3Selection ): Promise<this>;

    initWidget( container: AnyD3Selection ): void {
        // To be overridden
    }

    update(): Promise<this> {
        if ( !this._parent ) return Promise.resolve( this );
        let container: AnyD3Selection = this._parent.select( "." + this._name + ".widget" );
        const newWidget = container.empty();
        if ( newWidget )
            container = this._parent.append( "div" ).attr( "class", this._name + " widget" );

        if ( this._caption ) {
            let caption: AnyD3Selection = container.select( ".caption" );
            if ( caption.empty() )
                caption = container.append( "div" ).attr( "class", "caption" ).text( this._caption );
        }
        container = container.append( "div" ).attr( "class", "clientSurface" );
        if ( this._size ) {
            if ( this._size.width )
                container.style( "width", this._size.width );
            if ( this._size.height )
                container.style( "width", this._size.height );
        }
        if ( newWidget ) {
            this.initWidget( container );
        }
        return this.updateInContainer( container );
    }
}