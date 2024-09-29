// You'll notice our token account does not have a pretty symbol and shows up as 'Unknown Token' in Explorer. That's because our token has no metadata! Let's add some!!

import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { approve, burn, createAccount, createMint, getOrCreateAssociatedTokenAccount, mintTo, revoke, transfer } from "@solana/spl-token";
import { Connection, clusterApiUrl, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from 'fs';

const connection = new Connection(clusterApiUrl("devnet"));

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const tokenMintAddress = new PublicKey("JA7Pw2YHf3P1JfHD3oJDv2XWHg9PtaR9QFPxvDthx17h");  // newly token mint address
const tokenAccountAddress = new PublicKey("4f9pgUaa1ZP6H5rjkUzkPfvTuKqSq1uA64AbpbSbP4R2");  // newly token account address

const delegate = new PublicKey("3q38PPKtquk3fkPYnovmyQtDrbyhRd9HiyDZfoZmUSEn");

const metadataData = {
    name: "Solana Avatar Token",
    symbol: "AVATAR",
    // Arweave / IPFS / Pinata etc link using metaplex standard for offchain data
    uri: "https://gateway.pinata.cloud/ipfs/QmW4ZizhiHXWdktbaCc2k3JFQij22rg5rA1UDpvHgtnKoY",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
};

const metadataPDAAndBump = PublicKey.findProgramAddressSync(
    [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
);

const metadataPDA = metadataPDAAndBump[0];

const loadKeypair = (address: string) => {
    const secret = JSON.parse(fs.readFileSync(address).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const payer = Keypair.fromSecretKey(secretKey);
    return payer
}

const user = loadKeypair("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG.json")
const reciever = loadKeypair("3q38PPKtquk3fkPYnovmyQtDrbyhRd9HiyDZfoZmUSEn.json")
const decimals = 2

console.log(
    `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
);

const TokenMint = async () => {
    let tokenMint = await createMint(connection, user, user.publicKey, null, decimals)
    return tokenMint;
}

const TokenAccount = async () => {
    const tokenAccount = await createAccount(
        connection,
        user,
        tokenMintAddress,
        user.publicKey,
        
    );
    return tokenAccount
}

const CreateMetadataAccountInstruction = async () => {
    const transaction = new Transaction();
    const createMetadataAccountInstruction =
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: tokenMintAddress,
                mintAuthority: user.publicKey,
                payer: user.publicKey,
                updateAuthority: user.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    collectionDetails: null,
                    data: metadataData,
                    isMutable: true,
                },
            },
        );

    transaction.add(createMetadataAccountInstruction);

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [user],
    );


    // console.log(`✅ Transaction confirmed, explorer link is: https://explorer.solana.com/address/${transactionSignature}?cluster=devnet$!`);
    return transactionSignature;
}

const AssociatedAccount = async (recipent: any) => {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        tokenMintAddress,
        recipent.publicKey,
      );

      return tokenAccount
}

const MintToken = async(getATA: any)=> {
    const transactionSignature = await mintTo(
        connection,
        user,
        tokenMintAddress, // Associated Token Address
        getATA.address, //  Associated Account On which you want to mint the Token
        user,
        10 * MINOR_UNITS_PER_MAJOR_UNITS,
      );

      return transactionSignature
}

const TransferToken = async(getSourceATA: any, getDestinationATA: any) => {
    const signature = await transfer(
        connection,
        user,
        getSourceATA.address,
        getDestinationATA.address,
        user,
        1 * MINOR_UNITS_PER_MAJOR_UNITS,
      );

      return signature
}


const Approve = async (sourceATA: any) => {
    const approveTransactionSignature = await approve(
        connection,
        user,
        sourceATA.address,
        delegate,
        user.publicKey,
        5 * MINOR_UNITS_PER_MAJOR_UNITS,
      );
      return approveTransactionSignature
}

const Revoke = async (sourceATA: any) => {
    const revokeTransactionSignature = await revoke(
        connection,
        user,
        sourceATA.address,
        user.publicKey,
      );
      return revokeTransactionSignature
}

const Burn = async (sourceATA: any, ) => {
    const transactionSignature = await burn(
        connection,
        user,
        sourceATA.address,
        tokenMintAddress,
        user,
        5 * MINOR_UNITS_PER_MAJOR_UNITS,
      );
      return transactionSignature
}

const main = async () => {
    // let tokenMintAddress = await TokenMint();
    // console.log(`✅ Finished! Created token mint: https://explorer.solana.com/address/${tokenMintAddress}?cluster=devnet`);

    // let tokenAccountAddress = await TokenAccount();
    // console.log(`✅ Finished! Created token Account: https://explorer.solana.com/address/${tokenAccountAddress}?cluster=devnet`);
    
    // let metaData = await CreateMetadataAccountInstruction();
    // console.log(`✅ Transaction confirmed, explorer link is: https://explorer.solana.com/tx/${metaData}?cluster=devnet$!`);
    
    let userATA = await AssociatedAccount(user)
    console.log(`✅ Get Associated Token Account of User:: `, userATA.address.toBase58());


    // let mintToken = await MintToken(userATA)
    // console.log(`✅ Success! Mint Token Transaction: https://explorer.solana.com/tx/${mintToken}?cluster=devnet`)
    
    let recieverATA = await AssociatedAccount(reciever)
    console.log(`✅ Get Associated Token Account of Reciever:: `, recieverATA.address.toBase58());

    // let transferToken = await TransferToken(userATA, recieverATA)
    // console.log(`✅ Success! Token Transfer Transaction: https://explorer.solana.com/tx/${transferToken}?cluster=devnet`)
    

    // let approveTokens = await Approve(userATA)
    // console.log(`Approve Delegate Transaction: https://explorer.solana.com/tx/${approveTokens}?cluster=devnet`)

    // let revokeTokens = await Revoke(userATA);
    // console.log(`✅ Revoke Delegate Transaction: https://explorer.solana.com/tx/${revokeTokens}?cluster=devnet`)

    let burnTokens = await Burn(userATA);
    console.log(`✅ Revoke Delegate Transaction: https://explorer.solana.com/tx/${burnTokens}?cluster=devnet`)
}

main()
