import express from "express";
import authUser from "../middlewares/auth.middleware.js";
import {
  createMockInterviewController,
  answerMockInterviewQuestionController,
  completeMockInterviewController,
  getMockInterviewByIdController,
  getAllMockInterviewsController,
  abandonMockInterviewController,
} from "../controllers/mockInterview.controller.js";

const mockInterviewRouter = express.Router();

/**
 * @route POST /api/mock-interview/
 * @description create a new mock interview session on the basis of an interview report and generate the first question.
 * @access private
 */
mockInterviewRouter.post("/", authUser, createMockInterviewController);

/**
 * @route POST /api/mock-interview/:id/answer
 * @description answer the current question, evaluate it and generate the next question.
 * @access private
 */
mockInterviewRouter.post(
  "/:id/answer",
  authUser,
  answerMockInterviewQuestionController,
);

/**
 * @route POST /api/mock-interview/:id/complete
 * @description generate the final report of a completed mock interview.
 * @access private
 */
mockInterviewRouter.post(
  "/:id/complete",
  authUser,
  completeMockInterviewController,
);

/**
 * @route GET /api/mock-interview/:id
 * @description get a mock interview session by mockInterviewId.
 * @access private
 */
mockInterviewRouter.get("/:id", authUser, getMockInterviewByIdController);

/**
 * @route GET /api/mock-interview/
 * @description get all mock interview sessions of logged in user.
 * @access private
 */
mockInterviewRouter.get("/", authUser, getAllMockInterviewsController);

/**
 * @route PATCH /api/mock-interview/:id/abandon
 * @description abandon a mock interview session.
 * @access private
 */
mockInterviewRouter.patch(
  "/:id/abandon",
  authUser,
  abandonMockInterviewController,
);

export default mockInterviewRouter;
