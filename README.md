# Github PR Watcher

Github PR Watcher is a tool that helps developers keep track of pull requests on GitHub repositories. By using this project, users can easily fetch and monitor pull requests, ensuring they stay up-to-date with the latest changes and contributions to their projects.

This project is live at [https://prwatcher.colabs.dev/](https://prwatcher.colabs.dev/)

# Requirements

This project runs on Ruby 3.4.1 and Rails 8.0.1.

There is no database in this project. It uses the public GitHub GraphQL API to fetch pull requests and save configurations and lists in local storage. Tokens **will never be saved** on the server, which is more secure, but bear in mind that on a new computer you will have to configure your groups again.

# Settings

## Groups

In a collaborative environment, especially in large organizations or open-source projects, multiple teams or groups of developers might be working on different features or parts of a project. To efficiently manage and review pull requests, it can be helpful to categorize or group these pull requests based on the authors.

## How to Create Groups

* Define Groups: You can define groups based on teams, projects, or any other criteria that make sense for you. Each group will have a list of authors (developers) associated with it.
* Group Configuration: Set a token and select the list of PR authors that belong to the group.

## The Token

The token needs to have the `repo` and `read:org` scopes to be able to fetch the pull requests. You can [create your tokens here](https://github.com/settings/tokens).

The `organization` parameter is optional and can be used to filter the pull requests by organization. Leave it blank if you want to see all pull requests from the authors on the list.

# Features

* Mark a PR as reviewed / not reviewed
* Favorite PRs and add notes to them
