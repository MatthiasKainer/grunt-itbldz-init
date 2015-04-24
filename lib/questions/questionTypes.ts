import question = require('./questions');
var merge = require('merge');

export enum Type {
    checkbox,
    input,
    confirm,
    list
}

export interface QuestionType {
    type: Type;

    decorateQuestion(config);
}

export interface IChoice {
    name: string;
    checked: boolean;
}

export class Choice {
    public static asConfig(choice: IChoice) {
        return { "name": choice.name, "value": choice.name, "checked": choice.checked };
    }
}

export class Input implements QuestionType {
    type: Type = Type.input;

    public decorateQuestion(config) {
        return config;
    }
}

export class Checkbox implements QuestionType {
    type: Type = Type.checkbox;
    choices: IChoice[];

    public decorateQuestion(config): question.Question {
        var choices = [];
        this.choices.forEach((_) => choices.push(Choice.asConfig(_)));
        (<any>config)["choices"] = choices;
        return config;
    }
}

export class Confirm implements QuestionType {
    type: Type = Type.input;

    public decorateQuestion(config) {
        return config;
    }
}

export class List implements QuestionType {
    type: Type = Type.list;
    choices: IChoice[];

    public decorateQuestion(config): question.Question {
        var choices = [];
        this.choices.forEach((_) => choices.push(Choice.asConfig(_)));
        (<any>config)["choices"] = choices;
        return config;
    }
}