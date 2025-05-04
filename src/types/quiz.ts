export interface QuizOption {
    id: string;
    text: string;
    icon: string;
}

export interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
}

export interface QuizPage {
    id: string;
    title: string;
    question: string;
    description: string;
    type: 'single-choice' | 'multi-choice';
    options: QuizOption[];
}

export interface QuizData {
    title: string;
    description: string;
    pages: QuizPage[];
    airports: Airport[];
}

export interface QuizAnswer {
    pageId: string;
    selectedOptions: string[];
}

export interface QuizResults {
    planCode: string;
    departureAirport: string;
    answers: QuizAnswer[];
} 