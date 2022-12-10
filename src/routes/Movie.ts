import { Request, Response, Router } from 'express';
import MovieController from '../controllers/MovieController';

const movie = Router();


movie.get('/list', (req: Request, res: Response) => {
    const controller = new MovieController(req, res);
    return controller.getList();
});

movie.get('/', (req: Request, res: Response) => {
    const controller = new MovieController(req, res);
    return controller.get();
});


export default movie;