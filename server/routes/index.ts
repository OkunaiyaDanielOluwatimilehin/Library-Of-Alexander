import { Router } from "express";
import cmsRouter from "./cms.ts";
import booksRouter from "./books.ts";
import authorsRouter from "./authors.ts";
import reviewsRouter from "./reviews.ts";
import homepageRouter from "./homepage.ts";
import rankingsRouter from "./rankings.ts";
import originalBooksRouter from "./original-books.ts";
import searchRouter from "./search.ts";
import genresRouter from "./genres.ts";
import collectionsRouter from "./collections.ts";
import healthRouter from "./health.ts";

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
