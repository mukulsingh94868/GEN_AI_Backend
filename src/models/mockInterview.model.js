import mongoose from "mongoose";

const questionEvaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    feedback: {
      type: String,
    },
    idealAnswer: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const mockInterviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    intention: {
      type: String,
    },
    category: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
    },
    answer: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
    evaluation: {
      type: questionEvaluationSchema,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const finalReportSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    problemSolvingScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    summary: {
      type: String,
    },
    hiringReadiness: {
      type: String,
      enum: ["low", "medium", "high"],
    },
  },
  {
    _id: false,
  },
);

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    interviewReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewReport",
      required: [true, "Interview report is required"],
    },
    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      required: [true, "Interview type is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Difficulty is required"],
    },
    totalQuestions: {
      type: Number,
      min: 1,
      max: 20,
      required: [true, "Total questions are required"],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "abandoned"],
      default: "pending",
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: [mockInterviewQuestionSchema],
    report: {
      type: finalReportSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const mockInterviewModel = mongoose.model(
  "MockInterview",
  mockInterviewSchema,
);

export default mockInterviewModel;
