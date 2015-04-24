import questions = require('./question');
import add = require('./files/add');
import fs = require('fs');
import languages = require('./languages/core');
import language = require('./languages/create');
import path = require('path');

var join = (front, back) => {
    return (front + (back !== ".") ? back : "").replace(/\\/g, "/");
};

var root = "<%= config.directories.root %>/";

export class Create {
    static save(file, result) {
        fs.writeFileSync(file, JSON.stringify(result, null, 4)); 
    }

    public static config(config) {
        var result: any = {
            directories: {
                target: root + config.target._
            },
            sources: {},
            deployables: {
                files : []
            }
        };

        var addFolderFor = (lang, what) => {
            if (!config.languages[lang][what]) return;
            result.directories[lang][what] = join(root, config.languages[lang][what]._);
        };

        var addFilesFor = (lang) => {
            add._for(lang, config, result);
        };

        if (config.languages) {
            config.languages._.forEach((lang) => {
                result.directories[lang] = {
                    "src": join(root, config.languages[lang].src._)
                };

                addFolderFor(lang, "unit");
                addFolderFor(lang, "acceptance");
                addFolderFor(lang, "unit");

                addFilesFor(lang);
            });
        }

        Create.save('config.json', result);
    }

    public static build(config) {
        var result = {
            "prepare": { }
        };

        if (config.languages) {
            config.languages._.forEach((lang) => {
                language.Create(lang, config, result);
            });
        }

        Create.save('build.json', result);
    }

    public static deploy(config) {
        var result : any = {
            "prepare": {
                "clean": {
                    "task": "clean",
                    "package": "grunt-contrib-clean",
                    "options": { "force": true },
                    "target": ["<%= config.directories.target %>"]
                }
            },
            "create-deployable": {
                "copy": {
                    "task": "copy",
                    "package": "grunt-contrib-copy",
                    "deployables": {
                        "files": "<%= config.deployables.files %>"
                    }
                }
            },
            "publish": {}
        };
        if (!config.deployment) return;

        var deployment = config.deployment;
        var deployments: string[] = deployment._;
        if (deployments.some((_) => _ === "git")) {
            result.publish["git"] = {
                "task": "release",
                "package": "grunt-release",
                "options": {
                    "bump": false,
                    "add": true,
                    "commit": true,
                    "tag": true,
                    "push": true,
                    "pushTags": true,
                    "npm": false,
                    "npmtag": false,
                    "file": "<%= config.directories.destination %>/package.json",
                    "folder": "<%= config.directories.destination %>"
                }
            };
        }

        if (deployments.some((_) => _ === "npm")) {
            if (deployment.npm.bump._ === true) {
                result.prepare["npm"] = result.prepare["npm"] || {};
                result.prepare.npm["bump-version"] = {
                    "task": "release",
                    "package": "grunt-release",
                    "options": {
                        "bump": true,
                        "add": false,
                        "commit": false,
                        "tag": false,
                        "push": false,
                        "pushTags": false,
                        "npm": false,
                        "npmtag": true,
                        "file": "<%= config.directories.root %>/package.json",
                        "folder": "<%= config.directories.root %>"
                    }
                };
            }

            if (deployment.npm.publish._ === true) {
                result.publish["npm"] = {
                    "task": "release",
                    "package": "grunt-release",
                    "options": {
                        "bump": false,
                        "add": false,
                        "commit": false,
                        "tag": false,
                        "push": false,
                        "pushTags": false,
                        "file": "<%= config.directories.target %>/package.json",
                        "folder": "<%= config.directories.target %>"
                    }
                };
            }
        }

        if (deployments.some((_) => _ === "sftp")) {
            result.publish["sftp"] = {
                "task": "sftp-deploy",
                "package": "grunt-sftp-deploy",
                "build": {
                    "auth": {
                        "host": "<%= env.SSHHOST %>",
                        "authKey": "<%= env.SSHAUTHKEY %>"
                    },
                    "src": "<%= config.directories.target %>/",
                    "serverSep": "/",
                    "dest": "application"
                }
            };
        }

        Create.save('deploy.json', result);
    }
}