import BaseController from "./BaseController";
import { Request, Response } from "express";
import FileSystem, { Node } from "../classes/FileSystem";
import config from "../config";
import path from "path";
interface MovieNode {
    img?: string,
    name?: string,
    movies?: MovieNode[],
    video?: string,
}
interface Movie {
    type: 'serial' | 'movie',
    collectionMovies: MovieNode[],
    movie: MovieNode,
}
const CHUNK_SIZE = 10 ** 8;

export default class MovieController extends BaseController {
    private readonly fileSystem: FileSystem;
    private name: string;
    private episode?: string;

    constructor(req: Request, res: Response) {
        super(req, res);
        this.fileSystem = new FileSystem();
        this.name = req.query.name as string;
        this.episode = req.query.episode as string;
    }

    public async getList() {
        try {
            const movieNode: Node[] = JSON.parse(await this.fileSystem.readFile(config.dataCfgFullPath));
            return this.sendSuccess(this.flatNode(movieNode));
        } catch (e) {
            console.log(e);
            return this.sendInternalError();
        }
    }

    public async get() {
        const movie = await this.getMovie();
        if (movie) {
            return this.sendSuccess(movie);
        }
        return this.sendNotFound();
    }

    private flatNode(nodes: Node[], dir = ''): MovieNode[] {
        return nodes.map((node: Node) => {
            if (node.type === 'dir') {
                const movies = this.flatNode(node.childNodes, node.name);
                const { img } = movies.length ? movies[this.getRandomInt(movies.length)] : node;
                return {
                    name: node.name,
                    movies: movies,
                    img,
                };
            }
            return {
                name: node.name,
                video: this.getVideoPath(`${dir}/${node.name}`),
                img: `${config.nginx.imagePath}${dir}/${node.img}`,
            };
        }).filter(Boolean);
    }

    private getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    private async getMovie() : Promise<Movie | null> {
        const movieNode: Node[] = JSON.parse(await this.fileSystem.readFile(config.dataCfgFullPath));
        const movie = movieNode.find(it => it.name === this.name);
        if (!movie) {
            return null;
        }
        const flatNodes = this.flatNode(movie.childNodes, movie.name);
        const nodes = flatNodes.map((it, id) => ({ ...it, id, current: this.getCurrent(it.name, id) }));
        const isMovie = nodes.length === 1;
        return {
            type: isMovie ? 'movie' : 'serial',
            collectionMovies: (!isMovie && nodes) || null,
            movie: nodes.find(it => it.current),
        };
    }

    private getCurrent(name: string, iteration: number) {
        if (this.episode) {
            return name === this.episode;
        }
        return iteration === 0;
    }

    private getVideoPath(dir) {
        return `${config.nginx.videoPath}${dir}`;
    }
}