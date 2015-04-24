import question = require('./questions');

var merge = require('merge');

export interface DependsOn {
    target: question.Question;
    condition: string;

    decorateQuestion(config) : question.Question;
}

export class WhenSome implements DependsOn {
    target: question.Question;
    condition: string;

    public constructor(target: question.Question, condition: string) {
        this.target = target;
        this.condition = condition;
    }

    public decorateQuestion(config) {
        config["when"] = (results: any[]) => {
            var id = this.target.id + "._";
            return results[id] && results[id].some((_) => _ === this.condition);
        };
        return config;
    }
}