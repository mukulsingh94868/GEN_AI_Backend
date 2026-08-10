import { z } from "zod";

export const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

export const mockInterviewQuestionSchema = z.object({
  question: z.string().describe("The interview question to ask the candidate"),
  intention: z
    .string()
    .describe("The intention of the interviewer behind asking this question"),
  category: z
    .enum(["technical", "behavioral", "mixed"])
    .describe(
      "The category of the question, whether it is technical, behavioral or mixed",
    ),
});

export const mockInterviewAnswerEvaluationSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("A score between 0 and 100 for the candidate's answer"),
  strengths: z
    .array(z.string())
    .describe("Key strengths visible in the candidate's answer"),
  weaknesses: z
    .array(z.string())
    .describe("Key weaknesses or gaps in the candidate's answer"),
  feedback: z
    .string()
    .describe("Concise and actionable feedback for the candidate"),
  idealAnswer: z
    .string()
    .describe("A model ideal answer the candidate should have given"),
});

export const mockInterviewFinalReportSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall performance score of the candidate between 0 and 100"),
  technicalScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score between 0 and 100 measuring the technical ability of the candidate",
    ),
  communicationScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score between 0 and 100 measuring how clearly and confidently the candidate communicated their answers",
    ),
  problemSolvingScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score between 0 and 100 measuring the candidate's problem solving approach",
    ),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Score between 0 and 100 measuring how confident the candidate sounded in their answers",
    ),
  strengths: z
    .array(z.string())
    .describe(
      "Overall strengths of the candidate observed during the interview",
    ),
  weaknesses: z
    .array(z.string())
    .describe(
      "Overall weaknesses of the candidate observed during the interview",
    ),
  recommendations: z
    .array(z.string())
    .describe(
      "Actionable recommendations for the candidate to improve before the real interview",
    ),
  summary: z
    .string()
    .describe(
      "A paragraph summarizing the overall performance of the candidate",
    ),
  hiringReadiness: z
    .enum(["low", "medium", "high"])
    .describe(
      "How ready the candidate is to be hired for this job, based on their performance",
    ),
});