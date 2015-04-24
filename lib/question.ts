import question = require('./questions/questions');
import questionTypes = require('./questions/questionTypes');
import dependecies = require('./questions/questionDependencies');
import Languages = require('./languages/core');
var merge = require('merge');
var chalk = require('chalk');

export class QuestionFactory { 

    get targetDirectory(): QuestionTree {
        var _ = new Question("target", "Where do you want to put your deployable");
        _.default = "../target";
        var targetDirectory = new QuestionTree(_);
        return targetDirectory;
    }

    get languages(): QuestionTree {
        var _ = new Question("languages", "What languages do you want to work with?");

        var languagesToApply: Languages.Language[] = [
            new Languages.JavaScript(),
            new Languages.TypeScript(),
            new Languages.Php(),
            new Languages.StyleSheets(),
            new Languages.Html()
        ];

        languagesToApply.map((_) => { name: _._; value: _._; checked : false });
        _.asCheckbox(languagesToApply.map((_) => <questionTypes.IChoice>{ name: _._, value: _._, checked: false }));

        var languages = new QuestionTree(_);
        languagesToApply.forEach((language) => {
            languages.addFor(language._, [language.questions(languages)]);
        });

        return languages;
    }

    get publish(): QuestionTree {

        var _ = new Question("deployment", "How do you want to deploy your stuff?");
        _.asCheckbox([{ name: "git", checked: true }, { name: "npm", checked: true }, { name: "sftp", checked: true }]);

        var deployment = new QuestionTree(_);
        var git = new Question("npm", "Do you want commit/tag/push your changes to git?");
        git.asConfirmation(true);

        var npm = new QuestionTreeContainer("npm", deployment);
        var npmBumpVersion = new Question("bump", "Do you want to bump a new package version on build?");
        npmBumpVersion.asConfirmation(true);
        var npmPublish = new Question("publish", "Do you want to npm publish a new version on deploy?");
        npmPublish.asConfirmation(true);
        npm.addFor("npm", [new QuestionTree(npmBumpVersion), new QuestionTree(npmPublish)]);
        
        deployment.addFor("git", [new QuestionTree(git)]);
        deployment.addFor("npm", [<QuestionTree>npm]);

        return deployment;
    }

    get buildOrDeploy(): QuestionTree {
        var _ = new Question("itbldz", "What do you want to create?");
        _.asCheckbox([{ name: "build", checked: true }, { name: "deploy", checked: true }]);

        var build = new QuestionTree(_);
        build.add([this.targetDirectory]);
        build.addFor("build", [this.languages]);
        build.addFor("deploy", [this.publish]);
        return build;
    }
}

export class QuestionTree {
    question: Question;
    questions: QuestionTree[];

    setupInnerQuestionTree(_: QuestionTree): QuestionTree{
        if (_.question) {
            _.question.parent = this.question;
            _.question.dependency = this.question.dependency;
        }

        return _;
    }

    public add(items: QuestionTree[]) {
        items.forEach((_) => {
            _.question.parent = this.question;
            _.question.dependency = this.question.dependency;
            this.questions.push(_);
        });
    }

    public addFor(what: string, items: QuestionTree[]) {
        items.forEach((_) => {
            _.question.parent = this.question;
            _.question.when(what);
            this.questions.push(_);
        });
    }

    constructor(question : Question) {
        this.question = question;
        this.questions = [];
    }

    public toConfig() {
        var result = this.question ? [this.question.toConfig()] : [];
        this.questions.forEach((_) => {
            _.toConfig().forEach((question) => result.push(question));
        });

        return result;
    }
}

export class QuestionTreeContainer extends QuestionTree {
    parentTree: QuestionTree;

    constructor(name: string, question: QuestionTree) {
        var emptyQuestion = new Question(name, "");
        emptyQuestion.parent = question.question;
        super(emptyQuestion);
    }

    public add(items: QuestionTree[]) {
        items.forEach((_) => {
            _.question.parent = this.question;
            _.question.dependency = this.question.parent.dependency;
            this.questions.push(_);
        });
    }

    public addFor(what: string, items: QuestionTree[]) {
        items.forEach((_) => {
            _.question.parent = this.question;
            _.question.when(what, this.question.parent);
            this.questions.push(_);
        });
    }

    public toConfig() {
        var result = [];
        this.questions.forEach((_) => {
            _.toConfig().forEach((question) => result.push(question));
        });

        return result;
    }
}

export class Question implements question.Question {
    parent: question.Question;
    name: string;
    questionType: questionTypes.QuestionType;
    message: string;
    dependency: dependecies.DependsOn;
    default: any;

    public constructor(name, message) {
        this.parent = null;
        this.name = name;
        this.message = message;
        this.questionType = new questionTypes.Input();
    }

    public asList(choices: questionTypes.IChoice[]) {
        var checkbox = new questionTypes.List();
        checkbox.choices = choices;
        this.questionType = checkbox;
    }

    public asCheckbox(choices: questionTypes.IChoice[]) {
        var checkbox = new questionTypes.Checkbox();
        checkbox.choices = choices;
        this.questionType = checkbox;
    }

    public asConfirmation(defaultValue: boolean = false) {
        var confirmation = new questionTypes.Confirm();
        this.questionType = confirmation;
        this.default = defaultValue;
    }

    public when(what: string, on : question.Question = this.parent) {
        this.dependency = new dependecies.WhenSome(on, what);
    }

    public get id(): string {
        return this.parent ? this.parent.id + "." + this.name : this.name;
    }

    public toConfig() {
        var result = {};
        result["config"] = this.id + "._";
        result["type"] = questionTypes.Type[this.questionType.type];
        result["message"] = this.message;
        if (this.default) result["default"] = this.default;
        result = this.questionType.decorateQuestion(result);
        if (this.dependency)
            result = this.dependency.decorateQuestion(result);
        return result;
    }
}

export function setUp(): any {
    var questionFactory = new QuestionFactory();
    return questionFactory.buildOrDeploy.toConfig();
}