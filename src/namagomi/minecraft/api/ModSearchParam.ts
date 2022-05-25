export class ModSearchParam {
    modid: string
    gameVersion: string
    fileNamePattern: string
    directUrl: string
    side: "CLIENT" | "SERVER"
    displayName: string
    constructor(modid: string, gameVersion: string, fileNamePattern: string, directUrl: string, side: "CLIENT" | "SERVER") {
        this.modid = modid
        this.gameVersion = gameVersion
        this.fileNamePattern = fileNamePattern
        this.directUrl = directUrl
        this.side = side
        this.displayName = ""
    }
}