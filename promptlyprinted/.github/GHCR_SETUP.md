# GitHub Container Registry Setup

This project uses GitHub Container Registry (GHCR) to store Docker images for deployment.

## Workflow Status

The GitHub Actions workflow builds and pushes Docker images on every push to main.

Check status at: https://github.com/PromptlyPrinted/Promptly-Printed-Website/actions

## Making Packages Public

After the first build, you may need to make the packages public:

1. Go to https://github.com/orgs/PromptlyPrinted/packages
2. Find each package (web, app, api)
3. Go to Package settings > Change visibility > Public

## Triggering Manual Build

You can manually trigger the workflow from the Actions tab on GitHub.
