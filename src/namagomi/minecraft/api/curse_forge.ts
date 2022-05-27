import urlJoin from 'url-join'
import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../settings/config'
import {jsonToModSearchParams} from './NamagomiApi'
import {ModSearchParam} from './ModSearchParam';
import {sampleGomiJson} from "./sample";
import ipcMain = Electron.ipcMain;

const curseForgeHeaders: RequestInit = {
    headers: {
        'Accept': 'application/json',
        'x-api-key': curseForgeApiKey
    }
}

const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), curseForgeHeaders)
    return response.json()
}

const fetchJsons = async (urls: Array<URL>) => {
    return await Promise.all(urls.map(fetchJson))
}

const getModFileUrl = async (param: ModSearchParam) => {
    if (param.directUrl != '')
        return new URL(param.directUrl)
    const url = new URL(urlJoin([curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files']))
    if (!url.searchParams.has('gameVersion'))
        url.searchParams.append('gameVersion', param.gameVersion)
    const json = fetchJson(url)
    const trimmed = await trimJson(json, param)
    param.displayName = trimmed['displayName'] != null ? trimmed['displayName'] : ''
    if (trimmed.downloadUrl == null) {
        console.info(`modid:${param.modid} gameversion:${param.gameVersion} ${param.displayName} doesn't have download url`)
        return null
    } else
        return new URL(trimmed.downloadUrl)
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = async (json: any, param: ModSearchParam) => {
    const pattern = param.fileNamePattern
    return await json.then((data: any) => {
        const single = data.data.find((j: any) => j.fileName.indexOf(pattern) != -1)
        if (single == null)
            console.error(`${param.modid} ${param.gameVersion} ${param.fileNamePattern} not found`)
        return single
    })
}

const trimJsons = (jsons: Array<any>, params: Array<ModSearchParam>) => {
    return jsons.map((json: any, index) => trimJson(json, params[index]))
}

export const downloadAllModFiles = async () => {
    const p = (await fetch(namagomiModListUrl))
    await p.text().then(text => {
        const params = jsonToModSearchParams(text)
        const urls = getModFileUrls(params)
        urls.map(url => {
            if (url != null) {
                const request = new XMLHttpRequest()
                request.open('GET', url.toString(), true)
                request.responseType = 'blob'
                request.send()
            }
        })
    })
}

export const downloadClientModFiles = async () => {
    const p = (await fetch(namagomiModListUrl))
    await p.text().then(text => {
        const params = jsonToModSearchParams(text)
        const urls = getModFileUrls(params)
        urls.map((url, index) => {
            if (url != null && params[index].side === 'CLIENT') {
                const request = new XMLHttpRequest()
                request.open('GET', url.toString(), true)
                request.responseType = 'blob'
                request.send()
            }
        })
    })
}

export const downloadServerModFiles = async () => {
    const p = (await fetch(namagomiModListUrl))
    await p.text().then(text => {
        const params = jsonToModSearchParams(text)
        const urls = getModFileUrls(params)
        urls.map((url, index) => {
            if (url != null && params[index].side === 'SERVER') {
                const request = new XMLHttpRequest()
                request.open('GET', url.toString(), true)
                request.responseType = 'blob'
                request.send()
            }
        })
    })
}

export const sampleDownloadModFiles = async () => {
    const params = jsonToModSearchParams(sampleGomiJson)
    const urls = getModFileUrls(params)
    urls.map((url, index) => {
        url.then(url => {
            if (url != null) {
                const request = new XMLHttpRequest()
                request.open('GET', url.toString(), true)
                request.responseType = 'blob'
                request.send()
            }
        })
    })
}