import mockInterviewModel from "../models/mockInterview.model.js";
import interviewReportModel from "../models/interviewReport.model.js";
import {
  generateFirstMockInterviewQuestion,
  generateNextMockInterviewQuestion,
  evaluateMockInterviewAnswer,
  generateMockInterviewFinalReport,
} from "../services/ai.service.js";

const VALID_INTERVIEW_TYPES = ["technical", "behavioral", "mixed"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

/**
 * @description Controller to create a mock interview session on the basis of an interview report and generate the first question.
 */
async function createMockInterviewController(req, res) {
  const { interviewReportId, interviewType, difficulty, totalQuestions } =
    req.body;

  if (!interviewReportId || !interviewType || !difficulty || !totalQuestions) {
    return res.status(400).json({
      message:
        "Please provide interviewReportId, interviewType, difficulty and totalQuestions.",
    });
  }

  if (!VALID_INTERVIEW_TYPES.includes(interviewType)) {
    return res.status(400).json({
      message:
        "interviewType must be one of technical, behavioral or mixed.",
    });
  }

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({
      message: "difficulty must be one of easy, medium or hard.",
    });
  }

  if (
    !Number.isInteger(totalQuestions) ||
    totalQuestions < 1 ||
    totalQuestions > 20
  ) {
    return res.status(400).json({
      message: "totalQuestions must be an integer between 1 and 20.",
    });
  }

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewReportId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  let firstQuestion;

  try {
    firstQuestion = await generateFirstMockInterviewQuestion({
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      jobDescription: interviewReport.jobDescription,
      skillGaps: interviewReport.skillGaps,
      title: interviewReport.title,
      matchScore: interviewReport.matchScore,
      interviewType,
      difficulty,
    });
  } catch (error) {
    return res.status(502).json({
      message: "Failed to generate the first question. Please try again.",
    });
  }

  const mockInterview = await mockInterviewModel.create({
    user: req.user.id,
    interviewReport: interviewReport._id,
    interviewType,
    difficulty,
    totalQuestions,
    status: "in_progress",
    currentQuestionIndex: 0,
    questions: [firstQuestion],
  });

  res.status(201).json({
    message: "Mock interview session created successfully.",
    mockInterview,
  });
}

/**
 * @description Controller to answer the current question of a mock interview, evaluate it and generate the next question.
 */
async function answerMockInterviewQuestionController(req, res) {
  const { id } = req.params;
  const { answer } = req.body;

  if (!answer || typeof answer !== "string" || !answer.trim()) {
    return res.status(400).json({
      message: "Please provide your answer.",
    });
  }

  const mockInterview = await mockInterviewModel.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!mockInterview) {
    return res.status(404).json({
      message: "Mock interview session not found.",
    });
  }

  if (
    mockInterview.status === "completed" ||
    mockInterview.status === "abandoned"
  ) {
    return res.status(400).json({
      message: `Mock interview is already ${mockInterview.status}.`,
    });
  }

  const { questions, currentQuestionIndex, totalQuestions } = mockInterview;

  if (currentQuestionIndex >= questions.length) {
    return res.status(400).json({
      message: "No question is currently pending.",
    });
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Resume flow: current question is already evaluated but the next question
  // was never generated, so just generate and return the next question.
  if (currentQuestion.status === "answered") {
    if (questions.length >= totalQuestions) {
      return res.status(200).json({
        message:
          "All questions are answered. You can generate the final report now.",
        evaluation: currentQuestion.evaluation,
        nextQuestion: null,
        interviewComplete: true,
        mockInterview,
      });
    }

    let nextQuestion;

    try {
      nextQuestion = await generateNextMockInterviewQuestion({
        resume: null,
        selfDescription: null,
        jobDescription: null,
        skillGaps: null,
        title: null,
        interviewType: mockInterview.interviewType,
        difficulty: mockInterview.difficulty,
        previousQuestion: currentQuestion.question,
        previousAnswer: currentQuestion.answer,
        previousEvaluation: currentQuestion.evaluation,
        questionHistory: questions.map((question) => question.question),
      });
    } catch (error) {
      return res.status(502).json({
        message: "Failed to generate the next question. Please try again.",
      });
    }

    mockInterview.questions.push(nextQuestion);
    mockInterview.currentQuestionIndex = mockInterview.questions.length - 1;
    await mockInterview.save();

    return res.status(200).json({
      message: "Next question generated successfully.",
      evaluation: currentQuestion.evaluation,
      nextQuestion,
      interviewComplete: false,
      mockInterview,
    });
  }

  const interviewReport = await interviewReportModel.findById(
    mockInterview.interviewReport,
  );

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  let evaluation;

  try {
    evaluation = await evaluateMockInterviewAnswer({
      question: currentQuestion.question,
      intention: currentQuestion.intention,
      answer: answer.trim(),
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      jobDescription: interviewReport.jobDescription,
      interviewType: mockInterview.interviewType,
      difficulty: mockInterview.difficulty,
    });
  } catch (error) {
    return res.status(502).json({
      message: "Failed to evaluate your answer. Please try again.",
    });
  }

  currentQuestion.answer = answer.trim();
  currentQuestion.evaluation = evaluation;
  currentQuestion.status = "answered";

  if (currentQuestionIndex + 1 >= totalQuestions) {
    await mockInterview.save();

    return res.status(200).json({
      message:
        "Answer evaluated successfully. Interview complete, you can generate the final report now.",
      evaluation,
      nextQuestion: null,
      interviewComplete: true,
      mockInterview,
    });
  }

  let nextQuestion;

  try {
    nextQuestion = await generateNextMockInterviewQuestion({
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      jobDescription: interviewReport.jobDescription,
      skillGaps: interviewReport.skillGaps,
      title: interviewReport.title,
      interviewType: mockInterview.interviewType,
      difficulty: mockInterview.difficulty,
      previousQuestion: currentQuestion.question,
      previousAnswer: currentQuestion.answer,
      previousEvaluation: evaluation,
      questionHistory: questions.map((question) => question.question),
    });
  } catch (error) {
    // Keep the evaluated answer so the session can be resumed later.
    await mockInterview.save();

    return res.status(502).json({
      message:
        "Answer evaluated but failed to generate the next question. Please answer again to continue.",
      evaluation,
      mockInterview,
    });
  }

  mockInterview.questions.push(nextQuestion);
  mockInterview.currentQuestionIndex = currentQuestionIndex + 1;
  await mockInterview.save();

  res.status(200).json({
    message: "Answer evaluated successfully. Next question generated.",
    evaluation,
    nextQuestion,
    interviewComplete: false,
    mockInterview,
  });
}

/**
 * @description Controller to generate the final report of a completed mock interview.
 */
async function completeMockInterviewController(req, res) {
  const { id } = req.params;

  const mockInterview = await mockInterviewModel.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!mockInterview) {
    return res.status(404).json({
      message: "Mock interview session not found.",
    });
  }

  if (mockInterview.status === "abandoned") {
    return res.status(400).json({
      message: "Mock interview is already abandoned.",
    });
  }

  if (mockInterview.status === "completed") {
    return res.status(200).json({
      message: "Mock interview is already completed.",
      report: mockInterview.report,
      mockInterview,
    });
  }

  const isAllQuestionsAnswered =
    mockInterview.questions.length >= mockInterview.totalQuestions &&
    mockInterview.questions.every((question) => question.status === "answered");

  if (!isAllQuestionsAnswered) {
    return res.status(400).json({
      message:
        "Please answer all the questions before completing the mock interview.",
    });
  }

  const interviewReport = await interviewReportModel.findById(
    mockInterview.interviewReport,
  );

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const questionEvaluations = mockInterview.questions.map((question) => ({
    question: question.question,
    answer: question.answer,
    evaluation: question.evaluation,
  }));

  let report;

  try {
    report = await generateMockInterviewFinalReport({
      title: interviewReport.title,
      jobDescription: interviewReport.jobDescription,
      interviewType: mockInterview.interviewType,
      difficulty: mockInterview.difficulty,
      questionEvaluations,
    });
  } catch (error) {
    return res.status(502).json({
      message: "Failed to generate the final report. Please try again.",
    });
  }

  mockInterview.report = report;
  mockInterview.status = "completed";
  await mockInterview.save();

  res.status(200).json({
    message: "Mock interview completed successfully.",
    report,
    mockInterview,
  });
}

/**
 * @description Controller to get a mock interview session by mockInterviewId.
 */
async function getMockInterviewByIdController(req, res) {
  const { id } = req.params;

  const mockInterview = await mockInterviewModel
    .findOne({
      _id: id,
      user: req.user.id,
    })
    .populate("interviewReport", "title matchScore");

  if (!mockInterview) {
    return res.status(404).json({
      message: "Mock interview session not found.",
    });
  }

  res.status(200).json({
    message: "Mock interview session fetched successfully.",
    mockInterview,
  });
}

/**
 * @description Controller to get all mock interview sessions of logged in user.
 */
async function getAllMockInterviewsController(req, res) {
  const mockInterviews = await mockInterviewModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select("-questions -report -__v")
    .populate("interviewReport", "title");

  res.status(200).json({
    message: "Mock interviews fetched successfully.",
    mockInterviews,
  });
}

/**
 * @description Controller to abandon a mock interview session.
 */
async function abandonMockInterviewController(req, res) {
  const { id } = req.params;

  const mockInterview = await mockInterviewModel.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!mockInterview) {
    return res.status(404).json({
      message: "Mock interview session not found.",
    });
  }

  if (
    mockInterview.status === "completed" ||
    mockInterview.status === "abandoned"
  ) {
    return res.status(400).json({
      message: `Mock interview is already ${mockInterview.status}.`,
    });
  }

  mockInterview.status = "abandoned";
  await mockInterview.save();

  res.status(200).json({
    message: "Mock interview abandoned successfully.",
    mockInterview,
  });
}

export {
  createMockInterviewController,
  answerMockInterviewQuestionController,
  completeMockInterviewController,
  getMockInterviewByIdController,
  getAllMockInterviewsController,
  abandonMockInterviewController,
};
