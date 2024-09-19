import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import * as fs from 'fs';
(async () => {
    // Create connection
    const connnection = new Connection(clusterApiUrl("devnet"))

    // Getting keypair from file
    const secret = JSON.parse(fs.readFileSync("Apykey.json").toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const ownerkeypair = Keypair.fromSecretKey(secretKey);
    console.log(
        "Owner Public keypair: ", ownerkeypair.publicKey.toBase58()
    );

    // Balance before Transaction
    const ownerBalance = await connnection.getBalance(ownerkeypair.publicKey)
    console.log(
        "Onwer Balance:", ownerBalance
    )


    const recipient = new PublicKey("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG")
    const recipientBalance = await connnection.getBalance(recipient)

    console.log("Recipient Public keypair: ", recipient.toBase58())
    // Balance before Transaction
    console.log(
        "Recipent Balance:", recipientBalance
    )

    // Getting airdrop on owner address
    // const airdropRequest = await connnection.requestAirdrop(
    //     ownerkeypair.publicKey,
    //     LAMPORTS_PER_SOL * 0.5
    // )

    // await connnection.confirmTransaction(airdropRequest)

    // Create Transaction
    const transaction = new Transaction();
    const sendSOLInstruction = SystemProgram.transfer({
        fromPubkey: ownerkeypair.publicKey,
        toPubkey: recipient,
        lamports: LAMPORTS_PER_SOL * 0.1
    })

    transaction.add(sendSOLInstruction)

    const signature = await sendAndConfirmTransaction(
        connnection,
        transaction,
        [ownerkeypair]
    )

    console.log("Transaction: ", signature)

    // Balance after transaction
    const ownerBalance1 = await connnection.getBalance(ownerkeypair.publicKey)
    console.log(
        "Onwer Balance:", ownerBalance1
    )
    const recipientBalance1 = await connnection.getBalance(recipient)
    console.log(
        "Recipent Balance:", recipientBalance1
    )
})()
