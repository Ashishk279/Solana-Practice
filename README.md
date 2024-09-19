# Solana Practice Code
npm i @solana/web3.js
npm install typescript @solana/web3.js esrun @solana-developers/helpers

## Run a file:
npx esrun generate-keypair.ts

npx esrun module1.ts 

## Install CLI of solana for windows
cmd /c "curl https://release.solana.com/v1.18.18/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"

C:\solana-install-tmp\solana-install-init.exe v1.18.18

## Open new CMD Terminal 
solana --version
solana-install update

## configure the solana files, RPC Url, KeyPair path, Websocket url, Commitment
solana config get
solana address
solana balance

## if you see the mainnet-beta then use the command
solana config set --url devnet

## How to Generate a Vanity Address
--- Vanity publickeys, or custom addresses, are keys that have start with specific characters.
solana-keygen grind --starts-with Ash:1 

## Set the address in keyPair path
solana config set -k .\AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG.json 

## get some fake SOL in this address 
solana airdrop 0.42
