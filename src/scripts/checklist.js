const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

// async function askQuestion(question) {
//   const { data: pullRequest } = await octokit.rest.pulls.get({
//     owner: github.context.repo.owner,
//     repo: github.context.repo.repo,
//     pull_number: github.context.payload.pull_request.number,
//   });

//   const body = pullRequest.body || '';

//   if (body.includes(question)) {
//     console.log(`Skipping question "${question}", already asked in this pull request`);
//     return;
//   }

//   const newBody = `${body}\n\n${question}`;

//   await octokit.rest.pulls.update({
//     owner: github.context.repo.owner,
//     repo: github.context.repo.repo,
//     pull_number: github.context.payload.pull_request.number,
//     body: newBody,
//   });

//   console.log(`Asked question "${question}"`);
//   console.log(`New body: ${newBody}`);
// }

// async function run() {
//   try {
//     const sha = process.argv[2];
//     const pullNumber = process.argv[3];

//     const [_, baseBranch] = (await octokit.rest.pulls.get({
//       owner: github.context.repo.owner,
//       repo: github.context.repo.repo,
//       pull_number: pullNumber,
//       sha,
//     })).data.base.ref.split('/');

//     const isMainBranch = baseBranch === 'main';

//     if (isMainBranch) {
//       await askQuestion('Have you reviewed your code before sending it for review?');
//       await askQuestion('Did you add a test to the code base?');
//       await askQuestion('Have you updated the linear issue with that has changed to make testing easier?');
//       await askQuestion('What is the purpose of this PR?');
//       await askQuestion('What is the impact of this PR?');
//       await askQuestion('What is the risk of this PR?');
//       await askQuestion('What is the test plan for this PR?');
//     } else if (baseBranch === 'production') {
//       await askQuestion('Have you checked that any required migrations have been run?');
      
//     }
//   } catch (error) {
//     core.setFailed(error.message);
//   }
// }

// run();

const run = async () => {
  const MainChecks = [
    'Have you reviewed your code before sending it for review?',
    'Did you add a test to the code base?',
    'Have you updated the linear issue with that has changed to make testing easier?',
    'What is the purpose of this PR?',
    'What is the impact of this PR?',
  ];

  const ProductionChecks = [
    'Have you checked that any required migrations have been run?',
  ];
  const { data: pullRequest } =  await octokit.rest.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  });

  // console.log({pullRequest});
  const set = new Set()
  const body = pullRequest.body || set
 
  const currentBranch = pullRequest.base.ref
  if(body.has(questions)) {
     console.log('already asked')
     return
   }
  
  const newBody = currentBranch === 'main' ? MainChecks.reduce((acc, question) => {
    if(!body.has(question)) {
      acc += `\n\n${question}`
    }
    return acc
  }, body) : ProductionChecks.reduce((acc, question) => {
    if(!body.has(question)) {
      acc += `\n\n${question}`
    }
    return acc
  }, body)





  await octokit.rest.pulls.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
    body: newBody,
  });

 console.log({pullRequest})

}

run();