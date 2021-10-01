# Polkadot Chain Explorer
A polkadot chain explorer to query chain storage data

[Production App](ppolka-chain-exploerer.vercel.app)

## Features
- **Custom RPC**: connect to any custom RPC endpoint, which will fetch metadata and parse it to get all available storage queries 
- **Quick Query Selection**: a dropdown with submenu to quickly select storage queries, and display input boxes based on it's arguments
- **Powerful Data Viewer**: fetch and display result data in a nice viewer, with variable options to display result in the best manner
- **Paginated Supported**: for large queries, fetch paginated results, and use prev/next page button to navigate.
## Commands
- install dependencies: `yarn`
- run dev server: `yarn start`
- build: `yarn build`
- serve production: `yarn serve`
- lint: `yarn lint`