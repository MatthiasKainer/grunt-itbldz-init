import questions = require('./../question');
var chalk = require('chalk');

class Utils {
    static lang(language: string) {
        var lang;
        switch (language) {
            case new Php()._:
                lang = chalk.cyan;
                break;
            case new JavaScript()._:
                lang = chalk.white;
                break;
            case new TypeScript()._:
                lang = chalk.blue;
                break;
            case new Cs()._:
                lang = chalk.green;
                break;
            case new Java()._:
                lang = chalk.gray;
                break;
            case new StyleSheets()._:
                lang = chalk.yellow;
                break;
            case new Html()._:
                lang = chalk.red;
                break;
        };
        return chalk.white("[") + lang(language) + chalk.white("] ");
    }

    public static src(language: string): questions.QuestionTree {
        var _ = new questions.Question("src", Utils.lang(language) + "Where are your " + language + " source files? ('.' for current directory)");
        _.default = ".";
        return new questions.QuestionTree(_);
    }
    public static unit(language: string): questions.QuestionTree {
        var _ = new questions.Question("unit", Utils.lang(language) + "Where are your " + language + " unittest files? ('-' for you forgot to test)");
        _.default = "tests/unit";
        return new questions.QuestionTree(_);
    }

    public static acceptance(language: string): questions.QuestionTree {
        var _ = new questions.Question("acceptance", Utils.lang(language) + "Where are your " + language + " acceptance test files? ('-' for you forgot to test)");
        _.default = "tests/features";
        return new questions.QuestionTree(_);
    }

    public static style(language: string): questions.QuestionTree {
        var _ = new questions.Question("stylecheck", Utils.lang(language) + "Do you want your " + language + " source files to get stylechecked automatically?");
        _.asConfirmation(true);
        return new questions.QuestionTree(_);
    }

    public static validate(language: string): questions.QuestionTree {
        var _ = new questions.Question("validate", Utils.lang(language) + "Do you want your " + language + " source files to get validated automatically?");
        _.asConfirmation(true);
        return new questions.QuestionTree(_);
    }

    public static compile(language: string): questions.QuestionTree {
        var _ = new questions.Question("compile", Utils.lang(language) + "Do you want your " + language + " source files to get compiled?");
        _.asConfirmation(true);
        return new questions.QuestionTree(_);
    }
}

export interface Language {
    _: string;
    questions(parent: questions.QuestionTree): questions.QuestionTree;
}

export class Html {
    _: string = "HTML";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);

        var _ = new questions.Question("compile", Utils.lang(this._) + "What type of markup files do you want to transpile on build time?");
        _.asList([{ name: "none", checked: true }, { name: "markdown", checked: false }, { name: "jade", checked: false }, { name: "handlebars", checked: false }]);
        container.addFor(this._, [Utils.src(this._), new questions.QuestionTree(_)]);
        return container;
    }
}

export class StyleSheets {
    _: string = "StyleSheets";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);

        var _ = new questions.Question("compile", Utils.lang(this._) + "What type of styles do you want to transpile on build time?");
        _.asList([{ name: "none", checked: true }, { name: "LESS", checked: false }, { name: "Sass", checked: false }, { name: "SCSS", checked: false }, { name: "stylus", checked: false }]);
        container.addFor(this._, [Utils.src(this._), new questions.QuestionTree(_)]);
        return container;
    }
}

export class Java {
    _: string = "Java";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);
        container.addFor(this._, [Utils.src(this._), Utils.compile(this._), Utils.style(this._)]);
        container.addFor(this._, [Utils.unit(this._), Utils.acceptance(this._)]);
        return container;
    }
}

export class Cs {
    _: string = "C#";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);
        container.addFor(this._, [Utils.src(this._), Utils.compile(this._), Utils.style(this._)]);
        container.addFor(this._, [Utils.unit(this._), Utils.acceptance(this._)]);
        return container;
    }
}

export class Php {
    _: string = "PHP";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);

        var binary = new questions.Question("binary", Utils.lang(this._) + "Location for the php binary? ('-' for do not set)");
        binary.default = "-";

        container.addFor(this._, [Utils.src(this._), new questions.QuestionTree(binary), Utils.validate(this._), Utils.unit(this._)]);
        return container;
    }
}

export class TypeScript implements Language {
    _: string = "TypeScript";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);
        container.addFor(this._, [Utils.src(this._), Utils.compile(this._)]);
        container.addFor(this._, [Utils.unit(this._), Utils.acceptance(this._)]);
        return container;
    }
}

export class JavaScript implements Language {
    _: string = "JavaScript";

    public questions(parent): questions.QuestionTree {
        var container = new questions.QuestionTreeContainer(this._, parent);
        container.addFor(this._, [Utils.src(this._), Utils.unit(this._), Utils.acceptance(this._)]);
        container.addFor(this._, [Utils.validate(this._)]);
        return container;
    }
}