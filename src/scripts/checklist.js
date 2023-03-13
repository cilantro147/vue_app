const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const run = async () => {
  try {
    const { data: pullRequest } =  await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    });
    const MainChecks = [
      `@${pullRequest.user.login}`,
      'Have you reviewed your code before sending it for review?',
      'Did you add a test to the code base?',
      'Have you updated the linear issue with that has changed to make testing easier?',
      'What is the purpose of this PR?',
      'What is the impact of this PR?',
    ];
  
    const ProductionChecks = [
      'Have you checked that any required migrations have been run?',
    ];
  
    const currentBranch = pullRequest.base.ref;
  
    const isMainBranch = currentBranch === 'main';
    const isProductionBranch = currentBranch === 'production';
  
    const body = pullRequest.body || '';
  
    let newBody = body;
  
    if (isMainBranch) {
      MainChecks.forEach((check) => {
        if (!body.includes(check)) {
          newBody = `${newBody}\n\n${check}`;
        }
      });
    } else if (isProductionBranch) {
      ProductionChecks.forEach((check) => {
        if (!body.includes(check)) {
          newBody = `${newBody}\n\n${check}`;
        }
      });
  
    }
  
    await octokit.rest.pulls.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      body: newBody,
    });
  
    // reload the pull request to get the updated body
    const { data: updatedPullRequest } = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    });
  
   // check if the body has changed
    if (updatedPullRequest.body !== body) {
      await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.payload.pull_request.number,
        body: 'The pull request body has been updated with the required checklist items.',
      });
    }
      else {
        await octokit.rest.issues.createComment({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.payload.pull_request.number,
          body: 'The pull request body is up to date.',
        });

    }
    
  } catch (error) {
    core.setFailed(error.message);
  }

}

run();