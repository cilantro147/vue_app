const core = require('@actions/core');
const github = require('@actions/github');
const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

async function askQuestion(question) {
  const { data: pullRequest } = await octokit.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  });

  const body = pullRequest.body || '';

  if (body.includes(question)) {
    console.log(`Skipping question "${question}", already asked in this pull request`);
    return;
  }

  const newBody = `${body}\n\n${question}`;

  await octokit.pulls.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
    body: newBody,
  });

  console.log(`Asked question "${question}"`);
}

async function run() {
  try {
    const sha = process.argv[2];
    const pullNumber = process.argv[3];

    const [_, baseBranch] = (await octokit.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pullNumber,
    })).data.base.ref.split('/');

    const isMainBranch = baseBranch === 'main';

    if (isMainBranch) {
      await askQuestion('Have you reviewed your code before sending it for review?');
      await askQuestion('Did you add a test to the code base?');
      await askQuestion('Have you updated the linear issue with that has changed to make testing easier?');
      await askQuestion('What is the purpose of this PR?');
      await askQuestion('What is the impact of this PR?');
      await askQuestion('What is the risk of this PR?');
      await askQuestion('What is the test plan for this PR?');
    } else if (baseBranch === 'production') {
      await askQuestion('Have you checked that any required migrations have been run?');
      
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();