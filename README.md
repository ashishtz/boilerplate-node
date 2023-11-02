# Boilerplate Node

This boilerplate has been developed using the Express.js framework with TypeScript. The project utilizes MySQL as the chosen database system, seamlessly integrated with the Object-Relational Mapping (ORM) capabilities provided by Objection.js.


## Project Boilerplate for Independent Projects

This repository serves as a versatile boilerplate for our independent projects. It offers a solid starting point for project references while allowing us to maintain a clear separation from existing repositories.

To utilize this boilerplate, follow these steps:

1. **Clone the Repository**
   
   Begin by cloning this repository using the following command:
   
   ```bash
   git clone git@github.com:ashishtz/boilerplate-node.git PROJECT_REPO_NAME
   ```
   
   Replace `PROJECT_REPO_NAME` with your desired repository name. This will create a local copy of the boilerplate for your project.

   *Note*: The `PROJECT_REPO_NAME` parameter enables you to have a meaningful folder name for your project, rather than using "boilerplate-node" every time.

2. **Initialize and Configure Git**

   Once the repository is cloned successfully, navigate to the cloned folder and perform the following steps:
   
   ```bash
   cd PROJECT_REPO_NAME
   rm -rf .git
   git init
   git add .
   git commit -m 'Initial boilerplate'
   git remote add origin PROJECT_REPO_URL
   git push -u origin master
   ```

   These commands achieve the following:

   - `git init`: Initializes an empty Git workspace within your project folder.
   - `git remote add origin PROJECT_REPO_URL`: Associates your local project repository with the remote project repository. Replace `PROJECT_REPO_URL` with the URL of your project repository.

After completing these steps, your project will be equipped with the boilerplate foundation, allowing you to begin your work with confidence.

Feel free to customize and build upon this boilerplate according to the specific requirements of your project. Happy coding!



Below is a breakdown of each module integrated into this boilerplate:

## Config
The `config` module serves as a repository for storing variables that are prone to change in the future or are commonly used throughout the application. Additionally, any frequently used logical functions (excluding database queries) should be defined here. For specific module-related variables, you can create separate files and include them in the `index.ts` file within the same folder.

## Middlewares
In the `middlewares` module, you'll find all the middleware components for your application. Any required middleware can be placed within this folder and easily imported wherever needed.

## Models
The `models` module is dedicated to defining the model structures for each table. Each table corresponds to a specific model defined within this folder. Don't forget to include the model in the `index.ts` file of this directory.

## Providers
The `providers` module houses common service providers that are utilized across the application.

## Routes
All application routes are organized within the `routes` module.

## Services
The `services` module contains the implementation of various services required by the application.

## Tokens
The `tokens` module contains configurations related to different types of tokens. Note that modifications to this directory should only be made when necessary. Two token types, `custom` and `password`, are defined here. `Custom` tokens generate tokens for tasks like sending reset password or account activation links, while `password` tokens are used for password encryption and comparison.

## Types
Global type declarations are stored in the `types` module. These type declarations apply throughout the entire project.


#### Several advanced methods are implemented within this boilerplate, which may appear intricate. Let's delve into them:

## XACML
XACML is a specialized tool employed to verify if requests contain the appropriate information from a database. While we already possess mechanisms to check request attributes like message content or URLs, these checks often fall short when it comes to required database-related information. To address this, I introduce XACML policies as checkpoints that evaluate incoming requests before reaching the service layer. This ensures that the service remains streamlined and focused on its core responsibilities, unburdened by extensive validation checks.

XACML serves two primary purposes:

1. Request Validation: Validates incoming request data (params, body, query) from the client.
2. Data Verification: Validates the authenticity and validity of data received from the client.

XACML functions as middleware, accepting three parameters. Let's use the example of a registration request to illustrate its usage:

### 1. Validation
In the `validation` step, validation schemas are defined for different request sources (`body`, `params`, or `query`). These schemas are automatically validated by XACML.

Example for body validation:

```javascript
const registrationSchema = {
  body: {
    email: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  },
};
```

### 2. Pre
The `pre` step involves fetching data from the database necessary for request validation. For instance, in the registration example, the goal might be to check if an email address already exists in the system.

```javascript
const registrationPre = [
  {
    assign: 'user',
    method: (req) => {
      return User.query().whereNotDeleted().where('email', req.body.email);
    },
  },
];
```

Additional pre steps can be added for fetching multiple data sets.

### 3. Secondary Validation
In `secondaryValidation`, the data fetched in the previous `pre` step is utilized for in-depth validation. Here, you have access to all request data (body, params, query, user) and the pre-fetched data.

Example:

```javascript
const registrationValidation = [
  {
    assign: 'checkUserExist',
    method: (req) => {
      return !req.pre.userByEmail;
    },
  },
  {
    assign: 'checkFromSameOrganization',
    method: (req) => {
      return req.pre.userByEmail.org_id === req.organization.id;
    },
  },
];
```

All these components are seamlessly integrated into the `accessControl` middleware:

```javascript
const { accessControl } = require('@crm/xacml');

router.post('/registration', accessControl({
  validation: registrationSchema,
  pre: registrationPre,
  secondaryValidation: registrationValidation,
}), registerUserService);
```

This middleware ensures that data is validated using Joi, and subsequent checks are performed based on the fetched data. If all checks pass, the request proceeds to the service; otherwise, a `400` Bad Request response is sent, preventing the service from being executed. This approach promotes reusable service functions with streamlined checks.

## Setup
Ensure your Node version is 16+. Start by creating a `.env` file; you can copy `.env.example` and modify it accordingly:

```shell
cp .env.example .env
```

Install project dependencies:

```shell
npm install
```

Generate JWT secure keys within the `keys` folder:

```shell
npm run generate:keys
```

Note the significance of this step, as it's essential for JWT token generation during user authentication. Following successful execution, two new key files will appear in the `keys` folder.

With the setup complete, you can initiate the application in development mode:

```shell
npm run dev
```

For production deployment, generate a build:

```shell
npm run build
```

Subsequently, start the application in production mode:

```shell
npm run prod
```

By adhering to these steps, you can effectively utilize the Boilerplate Node for your projects.