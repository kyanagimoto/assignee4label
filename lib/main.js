"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.debug(`${JSON.stringify(github.context)}`);
            const token = core.getInput("github-token", { required: true });
            const configPath = core.getInput("configuration-path", { required: true });
            const issueNumber = getIssueNumber();
            if (!issueNumber) {
                console.log("Could not get issue number from context, exiting.");
                return;
            }
            const client = new github.GitHub(token);
            const configurationContent = JSON.parse(JSON.stringify(yaml.load(fs.readFileSync(configPath, 'utf8'), { json: true })));
            core.debug("remove assignees.");
            const issue = JSON.parse(JSON.stringify(github.context.payload.issue));
            core.debug(`issue: ${JSON.stringify(issue)}`);
            issue['assignees'].forEach(element => {
                const loginName = JSON.parse(JSON.stringify(element))['login'];
                core.debug(`loginname: ${loginName}`);
                removeAssignees(client, issueNumber, loginName);
            });
            Object.keys(configurationContent).forEach(function (key) {
                if (github.context.payload.label.name == key) {
                    JSON.parse(JSON.stringify(configurationContent[key])).forEach(element => {
                        let assigneeName = JSON.stringify(element);
                        core.debug(`assignee name: ${assigneeName}`);
                        if (assigneeName == "issue-author") {
                            assigneeName = JSON.parse(JSON.stringify(github.context.payload.user))['login'];
                            core.debug(`loginName: ${assigneeName}`);
                        }
                        core.debug(`assignee name: ${assigneeName}`);
                        addAssignees(client, issueNumber, ['${assigneeName}']);
                    });
                }
            });
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
function getIssueNumber() {
    const issue = github.context.payload.issue;
    if (!issue) {
        return undefined;
    }
    return issue.number;
}
function addAssignees(client, issueNumber, assignees) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.issues.addAssignees({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issueNumber,
            assignees: assignees
        });
    });
}
function removeAssignees(client, issueNumber, assignees) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.issues.removeAssignees({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issueNumber,
            assignees: assignees
        });
    });
}
run();
