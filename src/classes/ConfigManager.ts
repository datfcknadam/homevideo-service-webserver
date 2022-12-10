import { promises } from "fs";
import config from "../config";
import FileSystem from "./FileSystem";
import chokidar, { FSWatcher } from "chokidar";

export default class ConfigManager {
    basePath: string;
    fileSystem: FileSystem;
    watcher: FSWatcher;
    constructor() {
        this.basePath = config.basePath;
        this.fileSystem = new FileSystem();
        this.checkConfig().then(() => {
            this.init();
        }).catch(e => {
            console.log(e);
        })
    }

    private init() {
        this.watcher = chokidar.watch(this.basePath, {
            usePolling: true,
            awaitWriteFinish: {
                pollInterval: 1000,
                stabilityThreshold: 500
            },
            ignoreInitial: true,
        });
        // TO-DO make update config
        this.watcher.on('add', async (log) => {console.log(log, 'add'); await this.createConfig()});
        this.watcher.on('unlink', async (log) => {console.log(log, 'unlink'); await this.createConfig()});
    }

    private updateConfig(event, filename) {
        const levelR = filename.split('/').length;
    }
    private async createConfig() {
        const node = JSON.stringify(await this.fileSystem.getDirAsJSNode());
        return promises.writeFile(`${config.dataCfgPath}/${config.dataCfgFile}`, node, { encoding: 'utf-8' });
    }

    private async checkConfig(): Promise<void> {
        try {
            const cfgDir = await promises.readdir(config.dataCfgPath);
            return this.createConfig();
        } catch (e) {
            console.log(e);
            if (e.code === 'ENOENT') {
                await promises.mkdir(config.dataCfgPath);
                return this.createConfig();
            }
            console.log(e);
        }
    }
    
}