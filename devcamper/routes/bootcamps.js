const express = require("express");
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// Include other resource router
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");
const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route to other resource router
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), uploadBootcampPhoto);
module.exports = router;
