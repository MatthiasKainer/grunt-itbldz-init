import questionTypes = require('./questionTypes');

export interface Question {
    parent: Question;
    name: string;
    questionType: questionTypes.QuestionType;
    message: string;
    default: string;
    id: string;
    dependency;
}