import { burn, createAccount, createAssociatedTokenAccount, createMint, getAssociatedTokenAddressSync, getMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from 'fs'

const connection = new Connection(clusterApiUrl("devnet"))

const loadKeypair = (address: string) => {
    const secret = JSON.parse(fs.readFileSync(address).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const payer = Keypair.fromSecretKey(secretKey);
    return payer
}

const payer = loadKeypair("Apykey.json")
console.log(payer.publicKey.toBase58())

const newPayer = loadKeypair("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG.json")

const TokenMint = async () => {
    const tokenMintkeypair = loadKeypair("TM.json")
    console.log(tokenMintkeypair.publicKey.toBase58())

    const tokenMint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9,
        tokenMintkeypair
    );
    console.log(tokenMint.toBase58())

    return tokenMint;
}


const TokenAccount = async (tokenMintAddress: any) => {
    // Getting keypair from file for tokenAccount
    const tokenAccountKeypair = loadKeypair("TA.json")
    console.log(tokenAccountKeypair.publicKey.toBase58())

    const tokenAccount = await createAccount(
        connection,
        payer,
        tokenMintAddress,
        payer.publicKey,
        tokenAccountKeypair,
    );
    console.log(tokenAccount.toBase58())
}

const AssociatedTokenAccount = async (tokenMintAddress: any) => {
    const associatedTokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        tokenMintAddress,
        payer.publicKey,
    );
    return associatedTokenAccount;
}


const GetATA = (tokenMintAddress: any, payer: any) => {
    const getATA = getAssociatedTokenAddressSync(tokenMintAddress, payer.publicKey)
    console.log(getATA.toBase58())
    return getATA
}

const TokenAccountInfo = async(tokenMintAddress: any) => {
    const getATA = GetATA(tokenMintAddress, payer)
    console.log(getATA.toBase58())
    const tokenAccountInfo = await connection.getTokenAccountBalance(getATA);
    console.log("Token Balance:", tokenAccountInfo.value.amount);

    return tokenAccountInfo
}

const MintTokens = async(tokenMintAddress: any) => {
    const decimals = 9;
    const amount = 3 * 10** decimals
    const getATA = await GetOrCreateATA(tokenMintAddress, payer)
    const transactionSignature = await mintTo(
        connection,
        payer,
        tokenMintAddress,
        getATA.address,
        payer,
        amount,
      );
      console.log(transactionSignature)
      return transactionSignature
}

const GetOrCreateATA = async(tokenMintAddress: any, newPayer: any)=> {
    const getOrCreate = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenMintAddress,
        newPayer.publicKey
    ); 
    return getOrCreate
}

const TransferToken = async(tokenMintAddress: any) => {
    const getATA = await GetOrCreateATA(tokenMintAddress, payer)
    const receiverTokenAccount = await GetOrCreateATA(tokenMintAddress, newPayer)
    const transactionSignature = await transfer(
        connection,
        payer,
        getATA.address, // associated Token Account
        receiverTokenAccount.address,  // reciever Associated account
        payer.publicKey,
        1,
    );

    console.log(transactionSignature)
}

const BurnToken = async(tokenMintAddress: any) => {
    const decimals = 9
    const amountTOBurn = 1*10**decimals-1
    const getATA = GetATA(tokenMintAddress, payer)
    const txs = await burn(connection, payer, getATA, tokenMintAddress, payer.publicKey, amountTOBurn)
    return txs
}
const main = async () => {
// Call Funcation that we needs
  const tokenMintAddress = new PublicKey("9gPc8cEGhcaZ4HHm1QM5zW35gmi9i2R48YSMxBjavvbS")
  const token = await BurnToken(tokenMintAddress)
  console.log(token)
}


main()