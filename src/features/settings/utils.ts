export function createGitHubIssueURL() {
  const owner = 'nuwa-protocol';
  const repo = 'nuwa-client';
  const title = '[Nuwa Client Feedback] PLEASE ENTER TITLE HERE';
  const body =
    '## Info\n - My DID: \n - Client Version: ...\n\n## Description\n PLEASE DESCRIBE THE ISSUE HERE...';
  const labels = ['uncategorized'];

  const baseURL = `https://github.com/${owner}/${repo}/issues/new`;
  const params = new URLSearchParams();

  params.append('title', title);
  params.append('body', body);
  params.append('labels', labels.join(','));

  return `${baseURL}?${params.toString()}`;
}
