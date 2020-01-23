import * as d3 from "d3";
import { ClientFileSystemApi } from "../../ClientFileSystem/ClientFileSystemApi";
import { ClientFileSystem } from "../../ClientFileSystem/ClientFileSystem";
import { AnyD3Selection, useCss, Size } from "../../D3Misc";
import { Widget } from "./Widget";

useCss( "/css/Widget/FileBrowser/filebrowser.css" );

export class FileBrowser extends Widget {
    private _folder: ClientFileSystemApi.IFolder;
    private _selected: ClientFileSystemApi.IFolderFile | null;

    constructor( _name: string ) {
        super( name, {
            width: "15em",
            height: "10em"
        } );
        this._folder = ClientFileSystem.getRoot();
        this._selected = null;
    }

    folder( _folder: ClientFileSystemApi.IFolder ): this {
        this._folder = _folder;
        return this;
    }

    path( _path: string ): Promise<this> {
        const self = this;
        return ClientFileSystem.parsePath( _path ).then( ( ff: ClientFileSystemApi.IFolderFile | null ) => {
            if ( ff ) {
                if ( ff.isFolder() ) {
                    self._folder = ff as ClientFileSystemApi.IFolder;
                    self._selected = null;
                }
                else {
                    self._folder = ff.getParentFolder() || ClientFileSystem.getRoot();
                    self._selected = ff;
                }
            } else {
                self._folder = ClientFileSystem.getRoot();
                self._selected = null;
            }
            return this;
        } );
    }

    initWidget( container: AnyD3Selection ): void {
        container.append( "div" ).attr( "class", "pathbar" );
        container.append( "div" ).attr( "class", "fileList" );
    }

    private folderItemToName( item: ClientFileSystemApi.FolderItem ): string {
        return item.file ? item.file.getName() : ( item.folder ? item.folder.getName() || "" : "" );
    }

    updateInContainer( container: AnyD3Selection ): Promise<this> {
        container.classed( "filebrowser", true );
        container.select( ".pathbar").text( this._folder ? this._folder.fullPath() : "/" );
        let fileList = container.select( ".fileList" );

        // List the files that are in the folder
        return this._folder.list().then( ( items: ClientFileSystemApi.FolderItem[] ) => {
            let fileEntries: AnyD3Selection = fileList.selectAll( ".fileEntry" ).data( items );
            fileEntries.exit().remove();

            // Create and init new entries
            const newFileEntries = fileEntries.enter().append( "div" ).attr( "class", "fileEntry" );
            newFileEntries.append( "img" );
            newFileEntries.append( "span" );
            fileEntries = newFileEntries.merge( fileEntries );
            fileEntries.classed( "selected", d => !!this._selected && this._selected.getName() === this.folderItemToName( d ) );
            fileEntries.select( "img" )
                .attr( "src", d => "/img/" + ( d.folder ? "folder" : "file" ) + "icon.svg" );
            fileEntries.select( "span" )
                .text( d => this.folderItemToName( d ) );
            return this;
        } );
    }

}