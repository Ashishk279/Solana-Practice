import { ACCOUNT_SIZE, createAssociatedTokenAccountInstruction, createInitializeAccountInstruction, createMint, getAssociatedTokenAddress, getMinimumBalanceForRentExemptAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CurveType, TOKEN_SWAP_PROGRAM_ID, TokenSwap, TokenSwapLayout } from "@solana/spl-token-swap";
import { Account, clusterApiUrl, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import fs from 'fs'


const connection = new Connection(clusterApiUrl("devnet"))


const loadKeypair = (address: string) => {
    const secret = JSON.parse(fs.readFileSync(address).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const payer = Keypair.fromSecretKey(secretKey);
    return payer
}

const wallet = loadKeypair("SwaAVn1KMPQssnuzN1NwUEP8jcP646EvP5bhA2TED1J.json")
console.log("Wallet: ", wallet.publicKey.toBase58())


const getTokenAssociatedAccountCreationInstruction = async (mint: PublicKey,
    swapAuthority: PublicKey,
    wallet: PublicKey): Promise<{
        tokenAccountAddress: PublicKey;
        tokenAccountInstruction: TransactionInstruction;
    }> => {
    let tokenAccountAddress = await getAssociatedTokenAddress(
        mint, // mint
        swapAuthority, // owner
        true // allow owner off curve
    )

    const tokenAccountInstruction = await createAssociatedTokenAccountInstruction(
        wallet, // payer
        tokenAccountAddress, // ata
        swapAuthority, // owner
        mint // mint
    )

    return { tokenAccountAddress, tokenAccountInstruction };
}

const TokenStateAccountInstruction = async (tokenSwapStateAccount: PublicKey, rent: number, wallet: PublicKey): Promise<{ tokenSwapStateAccountInstruction: TransactionInstruction }> => {
    const tokenSwapStateAccountInstruction = SystemProgram.createAccount({
        newAccountPubkey: tokenSwapStateAccount,
        fromPubkey: wallet,
        lamports: rent,
        space: TokenSwapLayout.span,
        programId: TOKEN_SWAP_PROGRAM_ID
    })

    return { tokenSwapStateAccountInstruction };
}

const TokenSwapStateAccount = async () => {
    let transaction = new Transaction()

    // const tokenSwapStateAccount = Keypair.generate();
    const tokenSwapStateAccount = loadKeypair("AyePVWp53d7Kx33LNiiktzu1QS4uhigCtJMPb1yPwnLr.json")

    // const tokenSwapStateAccountACCOUNT = new Account(tokenSwapStateAccount.secretKey)
    console.log("Generated TokenSwapStateAccount: ", tokenSwapStateAccount.publicKey.toBase58());
    console.log("Generated TokenSwapStateAccount: ", tokenSwapStateAccount.secretKey);

    const rent = await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection);
    console.log("Rent for TokenSwap: ", rent);

    // const tokenSwapStateAccountInstruction = SystemProgram.createAccount({
    //     newAccountPubkey: tokenSwapStateAccount.publicKey,
    //     fromPubkey: wallet.publicKey,
    //     lamports: rent,
    //     space: TokenSwapLayout.span,
    //     programId: TOKEN_SWAP_PROGRAM_ID
    // })
    const { tokenSwapStateAccountInstruction: tokenSwapStateAccountInstruction } = await TokenStateAccountInstruction(tokenSwapStateAccount.publicKey, rent, wallet.publicKey)
    transaction.add(tokenSwapStateAccountInstruction)

    const [swapAuthority, bump] = PublicKey.findProgramAddressSync(
        [tokenSwapStateAccount.publicKey.toBuffer()],
        TOKEN_SWAP_PROGRAM_ID,
    )

    console.log("SwapAuthority: ", swapAuthority.toBase58());
    console.log("Bump: ", bump)

    const tokenAMint = new PublicKey("AToEpLDQuemi7iTop3UpxR6oXTQnrKrv4PwwmL6Dtbxu")
    const tokenBMint = new PublicKey("BToiuvf1pSR1ea2Uavva8sVuiU15GrBAa3qedpQ9c8kh")

    console.log("TokenAMint: ", tokenAMint.toBase58())
    console.log("TokenBMint: ", tokenBMint.toBase58())


    const { tokenAccountAddress: tokenAAccountAddress, tokenAccountInstruction: tokenAAccountInstruction } = await getTokenAssociatedAccountCreationInstruction(tokenAMint, swapAuthority
        , wallet.publicKey)
    const { tokenAccountAddress: tokenBAccountAddress, tokenAccountInstruction: tokenBAccountInstruction } = await getTokenAssociatedAccountCreationInstruction(tokenBMint, swapAuthority, wallet.publicKey)

    transaction.add(tokenAAccountInstruction, tokenBAccountInstruction)

    console.log("TokenAAccountAddress: ", tokenAAccountAddress.toString())
    console.log("TokenBAccountAddress: ", tokenBAccountAddress.toString())

    // const Signature = await sendAndConfirmTransaction(connection, transaction, [wallet, tokenSwapStateAccount])
    // console.log("Give Verification to tokenswapAccount: ",Signature)
    // 2o7EkQJjbY2UqEwLmHH4DHomXTsBWCNePefeZUTKWp2MY9MV5qux9V4B5yEqgGgBMJog8fqhBP4PEpk7K71EY47R

    transaction = new Transaction()

    const poolTokenKeypair = loadKeypair("LPT2ZVQCXSR2WAqHH88aP5i41v69PDCiuSt2JQj9MgK.json")

    // const poolTokenMint = await createMint(
    //     connection,
    //     wallet,
    //     swapAuthority,
    //     null,
    //     2,
    //     poolTokenKeypair

    // )

    const poolTokenMint = new PublicKey("LPT2ZVQCXSR2WAqHH88aP5i41v69PDCiuSt2JQj9MgK")
    console.log("PoolTokenMint: ", poolTokenMint.toBase58())

    const tokenAccountPool = Keypair.generate()
    console.log("TokenAccountPool: ", tokenAccountPool)

    const poolAccountrent = await getMinimumBalanceForRentExemptAccount(connection)
    console.log("PoolAccountRent: ", poolAccountrent)

    const createTokenAccountPoolInstruction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tokenAccountPool.publicKey,
        space: ACCOUNT_SIZE,
        lamports: poolAccountrent,
        programId: TOKEN_PROGRAM_ID,
    })

    transaction.add(createTokenAccountPoolInstruction)

    const initializeTokenAccountPoolInstruction = createInitializeAccountInstruction(
        tokenAccountPool.publicKey,
        poolTokenMint,
        wallet.publicKey
    )
    transaction.add(initializeTokenAccountPoolInstruction)


    const feeOwner = new PublicKey('HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN')

    let tokenFeeAccountAddress = await getAssociatedTokenAddress(
        poolTokenMint, // mint
        feeOwner, // owner
        true // allow owner off curve
    )

    const tokenFeeAccountInstruction = await createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        tokenFeeAccountAddress, // ata
        feeOwner, // owner
        poolTokenMint // mint
    )

    transaction.add(tokenFeeAccountInstruction)
    // const tokenSwapStateAccountACCOUNT = new Account(tokenSwapStateAccount.secretKey)
    // const tokenSwapInitSwapInstruction = TokenSwap.createInitSwapInstruction(
    //     tokenSwapStateAccount,
    //     swapAuthority,
    //     tokenAAccountAddress,
    //     tokenBAccountAddress,
    //     poolTokenMint,
    //     tokenFeeAccountAddress,
    //     tokenAccountPool.publicKey,
    //     TOKEN_PROGRAM_ID,
    //     TOKEN_SWAP_PROGRAM_ID,
    //     BigInt(0),
    //     BigInt(100),
    //     BigInt(5),
    //     BigInt(10000),
    //     BigInt(0),
    //     BigInt(100),
    //     BigInt(1),
    //     BigInt(100),
    //     CurveType.ConstantProduct,
    // )

    // transaction.add(tokenSwapInitSwapInstruction)

    // const Signature = await sendAndConfirmTransaction(connection, transaction, [wallet, tokenAccountPool])
    // console.log(Signature)

    // Execute Swap
    const alice = loadKeypair("ALicscmVXdYf374JAVLycQpkTxWwyvrueiRBCUzDCGBH.json")
    const aliceTokenAata = new PublicKey("uzphzCedXEW6Zt83g6a352q4FzkSgn6s46WyCXmsdsk")
    const aliceTokenBata = new PublicKey("3MmWKF8B4S6T56WDKF5WC4PE8vMcE2qvQQPBFAT3aW7e")

    let amountBuffer= Buffer.alloc(8);
    amountBuffer.writeBigInt64LE(BigInt("10"))
    const swapInstruction = TokenSwap.swapInstruction(
        tokenSwapStateAccount.publicKey,  // Token Swap State Account public key
        swapAuthority,                    // Swap Authority public key
        alice.publicKey,                  // User's public key (transfer authority)
        aliceTokenAata,                   // User's associated Token A account
        tokenAAccountAddress,             // Pool's associated Token A account
        tokenBAccountAddress,             // Pool's associated Token B account
        aliceTokenBata,                   // User's associated Token B account
        poolTokenMint,                    // Pool token mint (LP token mint)
        tokenFeeAccountAddress,           // Fee account for swap fees
        null,                             // Host fee account (can be null if unused)
        tokenAMint,                       // Mint of the source token (Token A)
        tokenBMint,                       // Mint of the destination token (Token B)
        TOKEN_SWAP_PROGRAM_ID,            // Token Swap program ID
        TOKEN_PROGRAM_ID,                 // Source token program ID (SPL Token Program)
        TOKEN_PROGRAM_ID,                 // Destination token program ID (SPL Token Program)
        TOKEN_PROGRAM_ID,                 // Pool token program ID (SPL Token Program)
        BigInt(10),                       // Amount of Token A to swap
        BigInt(0)                         // Minimum amount of Token B to receive
    )

    const tx = new Transaction();
    tx.add(swapInstruction)
    const as = await connection.sendTransaction(tx, [alice])
    console.log(as)
}

TokenSwapStateAccount()


// Token Pool Address = 2m2jjCfw4KAkumuko9yL2cbTbXcfgJQFxtQzaWnQNE9Lg1zxKskYNhE6ZqTL2MsQiKbuDsTaQJoK6Bgzc5cCTPbW