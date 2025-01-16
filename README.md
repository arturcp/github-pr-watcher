# Github PR Watcher API

This API was designed to be used with the [GitHub PR Watcher](https://github.com/arturcp/pr-watcher) browser extension. It is a simple API that fetches pull requests from GitHub.

# Requirements

This project runs on ruby 3.2.2 and was tested using Rails 7.0.5

# How to use

This API exposes an endpoint to fetch pull requests from a GitHub repository. The endpoint is `{{PULL_REQUEST_API_URL}}/pull_requests` and it accepts the following parameters on the body:

```
{
    "authors": "arturcp",
    "organization": "colab-dev",
    "token": "..."
}
```

The token needs to have the `repo` and `read:org` scopes to be able to fetch the pull requests. You can [create your tokens here](https://github.com/settings/tokens).

The `organization` parameter is optional and can be used to filter the pull requests by organization, leave it blank if you want to see all pull requests.

# Resources

## Github Authentication

https://developer.github.com/v3/#authentication
