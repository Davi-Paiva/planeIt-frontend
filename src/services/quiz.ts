import { QuizResponse } from "./api";
import { submitQuiz as submitQuizApi } from "./api";


export const submitQuiz = async (quizData: QuizResponse, code: string): Promise<any> => {
    return await submitQuizApi(quizData, code);
}
