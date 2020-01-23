/**
 * This module defines the API for the client file system. On the client side, this is implemented by making rest calls to the server.
 * On the server side, this is implemented to serve the local file system.
 */
export module ClientFileSystemApi {

    export type RawFolderFileInfo = {
        isFolder: boolean;
        name: string;
    };

    export type FolderItem = {
        folder: IFolder | null,
        file: IFile | null
    }

    export interface IFolderFile {
        getName(): string;
        setName( name: string ): void;
        getParentFolder(): IFolder | null;
        isFolder(): boolean;
        fullPath(): string;
        delete(): Promise<void>;
    }

    export enum ItemKind {
        Folder,
        File,
        NoSuchItem
    }

    export interface IFolder extends IFolderFile {
        list(): Promise<FolderItem[]>
        checkItem( name: string ): Promise<ItemKind>;
    }

    export interface IFile extends IFolderFile {
        exists(): Promise<boolean>;
        read(): Promise<any>;
        write( content: any ): Promise<void>;
    }
}