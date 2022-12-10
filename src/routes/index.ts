import { Router } from 'express';
import movie from './Movie';

const router: Router = Router();

const routes = {
  '/movie': movie,
};

Object.entries(routes).map(([path, route]) => {
  router.use(path, route);
});

export default router;
