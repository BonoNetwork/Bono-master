# Bono Network
![bono](https://github.com/user-attachments/assets/aec0eb26-a7a3-48be-8cc2-2002f64c67df)

Bono Network is a decentralized platform for legal fundraising campaigns built on the Solana blockchain. It facilitates fundraising for legal cases related to scams and fraud, connecting case creators, contributors, a High Table for governance, and legal firms.

## Project Structure

The project is divided into two main parts:

1. Frontend (Vue.js application)
2. Backend (Node.js/Express API)

## Frontend

The frontend is a Vue.js application built with TypeScript and Vite.

### Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Compile and hot-reload for development:
   ```sh
   npm run dev
   ```

3. Type-check, compile and minify for production:
   ```sh
   npm run build
   ```

### Testing

- Run unit tests with Vitest:
  ```sh
  npm run test:unit
  ```

- Run end-to-end tests with Cypress:
  ```sh
  npm run test:e2e:dev
  ```

### Linting

```sh
npm run lint
```

### Key Dependencies

- Vue.js 3
- Pinia for state management
- Vue Router
- Solana Web3.js and related libraries
- Metaplex Foundation libraries for NFT interactions

## Backend

The backend is a Node.js application using Express.js, built with TypeScript.

### Setup

1. Navigate to the `api` directory:
   ```
   cd api
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create `.env.development` and `.env.production` files with the necessary variables (refer to the Environment Variables section in the API README).

4. Run the development server:
   ```sh
   npm run dev
   ```

5. Build for production:
   ```sh
   npm run build
   ```

6. Run in production:
   ```sh
   npm run prod
   ```

### Key Dependencies

- Express.js
- Mongoose for MongoDB interactions
- Solana Web3.js and related libraries
- Metaplex Foundation libraries
- JWT for authentication
- Express Validator for request validation

## Features

- Case creation and approval process
- Contribution system with Solana integration
- High Table governance and case oversight
- Legal firm assignment and case progress tracking
- Fund distribution and management

## Solana Integration

The project integrates with the Solana blockchain for:
- Creating campaign NFTs
- Managing campaign tokens
- Processing contributions
- Handling token redemptions

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) with the following extensions:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### Type Support for `.vue` Imports in TS

If you're using TypeScript in `.vue` imports, please refer to the Type Support section in the original README for configuration details.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Solana Foundation
- Metaplex
- All contributors and supporters of the Bono Network project

For more detailed information about the API endpoints and backend functionality, please refer to the [API README](api/README.md).
