# assignee4label
Label action trigers to set an assignees on issues.

## Usage

### Create `.github/assignee4label.yml`

Create a `.github/assignee4label.yml` file with a list of labels and assignees.

```yml
label1:
- user-name
- user-name-2
label2:
- user-name
- user-name-3
```

### Create Workflow

```yml
name: "Assignees4label"
on:
  issues:
    types: [labeled]

jobs:
  set-assignees:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/assignee4label@main
      with:
        github-token: %{{ secrets.GITHUB_TOKEN }}
        configuration-path: '.github/assignee4label.yml'
```