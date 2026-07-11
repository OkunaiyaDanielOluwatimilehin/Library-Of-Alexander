import { Router } from "express";
import cmsRouter from "./cms.js";
import booksRouter from "./books.js";
import authorsRouter from "./authors.js";
import reviewsRouter from "./reviews.js";
import homepageRouter from "./homepage.js";
import rankingsRouter from "./rankings.js";
import originalBooksRouter from "./original-books.js";
import searchRouter from "./search.js";
import genresRouter from "./genres.js";
import collectionsRouter from "./collections.js";
import healthRouter from "./health.js";

const router = Router();

router.use(cmsRouter);
router.use(booksRouter);
router.use(authorsRouter);
router.use(reviewsRouter);
router.use(homepageRouter);
router.use(rankingsRouter);
router.use(originalBooksRouter);
router.use(searchRouter);
router.use(genresRouter);
router.use(collectionsRouter);
router.use(healthRouter);

export default router;
