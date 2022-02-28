# Contributing

We welcome your contributions to the project. There are a few steps to take when looking to make a contribution.

- Open an issue to discuss the feature/bug
- If feature/bug is deemed valid then fork repo.
- Implement patch to resolve issue.
- Update the docs for any API changes.
- Submit a pull request.

# Bug Reporting

The Product Reviews Sample App uses GitHub issue tracking to manage bugs, please open an issue there.

# Feature Request

You can open a new issue on the GitHub issues and describe the feature you would like to see.

# Developing the library

Requirements:

- [Node](https://nodejs.org/en/) v14 or above

You can set up your development environment by running the following:

```bash
git clone git@github.com:Shopify/product-reviews-sample-app.git # get the code
cd product-reviews-sample-app    	                        # change into the source directory
npm install                                                     # install dependencies
npm run build                                                   # build library
```

Run `prettier` to automatically format code:

```bash
npx prettier --check checkout-extension components constants graphql hooks lib pages server theme-app-extension utilities server
```

or, to overwrite files in-place:

```bash
npx prettier --write checkout-extension components constants graphql hooks lib pages server theme-app-extension utilities server
```
