import { createReadStream, fstat, promises } from "fs";
import config from "../config";
import path from "path";
import ffmpeg from 'fluent-ffmpeg';
// import { v4 } from 'uuid';
export interface Node {
    type: 'dir' | 'file',
    name?: string | undefined,
    childNodes?: Node[] | undefined,
    img?: string | undefined,
}

export default class FileSystem {
    basePath: string;
    constructor() {
        this.basePath = config.basePath; 
    }

    public async getDirAsJSNode(): Promise<Node> {
        return this.inspectNodes(this.basePath, 'utf8');
    }

    public async readFile(path) {
        return promises.readFile(path, { encoding: 'utf-8'});
    }

    public async fillPathImages(curPath) {
        try {
            return this.screenshotPromise(curPath);
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    public async convertFormat(file): Promise<string> {
        const newFile = file.replace(/\.\w+$/, '.mp4');
        return new Promise((res, rej) => 
            ffmpeg(file)
            .on('start', function(commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('progress', (progress) => {
                console.log('Processing: ' + progress.percent + '% done', 'timemark: ', progress.timemark);
            })
            .on('error' , (err) => {
                rej(err);
            })
            .on('end', async () => {
                await promises.unlink(file);
                res(newFile);
            }).on('stderr', function(stderrLine) {
                console.log('Stderr output: ' + stderrLine);
            })
            .addOptions(['-map 0:0', '-map 0:1', '-map_metadata 0', '-c:v copy', '-c:a aac'])
            .save(newFile))
    }

    private async screenshotPromise(curPath) {
        const filename = path.basename(curPath).replace(/\.\w+$/, '.png')
        return new Promise((res, rej) => {
            ffmpeg(curPath).on('end', () => {
                res(filename);
            }).on('error', (err) => {
                console.log(err);
                res(null);
            }).screenshot({ count: 1, timestamps: ['50%'], filename, folder: path.dirname(curPath) });
        });
    }

    private async inspectNodes(inspectPath: string, type: BufferEncoding) {
        const baseDir: string[]  = await promises.readdir(inspectPath, type);
        if (!baseDir.length) {
            return null;
        }

        const obj = await Promise.all(baseDir.map(async (it) => {
            let objectName = it;
            let curPath = path.join(`${inspectPath}/${objectName}`);
            const stat = await promises.stat(curPath);
            if (stat.isDirectory()) {
                return {
                    type: 'dir',
                    name: objectName,
                    childNodes: await this.inspectNodes(curPath, type),
                }
            }
            const ext = path.extname(objectName);
            if (!config.allowTypes.includes(ext)) {
                return;
            }
            if (config.mustFormatTypes.includes(ext)) {
                try {
                    const convertedPath = await this.convertFormat(curPath);
                    return {
                        type: 'file',
                        name: path.basename(convertedPath),
                        img: await this.fillPathImages(convertedPath),
                    }
                } catch (e) {
                    console.log(e);
                    return;
                }
            }
            return {
                type: 'file',
                name: objectName,
                img: await this.fillPathImages(curPath),
            }
        }));
        return obj.filter(Boolean);
    }

}