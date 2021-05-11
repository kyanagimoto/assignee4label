import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import * as fs from "fs";

async function run() {
  try {
    core.debug(`${github.context}`) 
    const token = core.getInput("github-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: true });
    const syncLabels = !!core.getInput("sync-labels", { required: false });
    
    const issueNumber = getIssueNumber();
    if (!issueNumber) {
        console.log("Could not get issue number from context, exiting.");
        return;
    }

    const client = new github.GitHub(token);

    const configurationContent: JSON = JSON.parse(JSON.stringify(yaml.load(fs.readFileSync(configPath, 'utf8'), {json: true})));

    Object.keys(configurationContent).forEach(function(key) {
      if (github.context.payload.label.name == key) {
        JSON.parse(JSON.stringify(configurationContent[key])).forEach(element => {
          removeAssignees(client, issueNumber);
          core.debug(`assignee name: ${element}`)
          addAssignees(client, issueNumber, element);
        });
      }
    });
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getIssueNumber(): number | undefined {
  const issue = github.context.payload.issue;
  if (!issue) {
      return undefined;
  }
  
  return issue.number
}

async function addAssignees(
  client: github.GitHub,
  issueNumber: number,
  assignees: string[]
) {
  await client.issues.addAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    assignees: assignees
  })
}

async function removeAssignees(
  client: github.GitHub,
  issueNumber: number
) {
  await client.issues.removeAssignees({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber
  })
}

run();