import path from "path";

export default {
    /**
     * path to movies
     */
    basePath: path.normalize(path.join(process.cwd(), "data/movies")),
    /**
     * path to config of movies
     */
    dataCfgPath: path.normalize(path.join(process.cwd(), "dataConfig")),
    dataCfgFile: 'index.json',
    allowTypes: ['.mp4', '.avi', '.mkv'],
    mustFormatTypes: ['.mkv'],
    get dataCfgFullPath() {
        return `${this.dataCfgPath}/${this.dataCfgFile}`; 
    },
    nginx: {
        videoPath: '/movies/',
        imagePath: '/images/',
    },
    server: {
        videoPath: '/api/v1/movie/stream/',
    }
    
}