import * as web3 from "@solana/web3.js";
import * as fs from 'fs';
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const PING_PROGRAM_ADDRESS = new web3.PublicKey(
    "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa",
);
const PING_PROGRAM_DATA_ADDRESS = new web3.PublicKey(
    "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod",
);

// Getting keypair from file
const gettingKeypair = async () => {
    const secret = JSON.parse(fs.readFileSync("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG.json").toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const ownerkeypair = web3.Keypair.fromSecretKey(secretKey);
    console.log(
        "Owner Public keypair: ", ownerkeypair.publicKey.toBase58()
    );
 
    // Balance before Transaction
    const ownerBalance = await connection.getBalance(ownerkeypair.publicKey)
    console.log(
        "Onwer Balance:", ownerBalance
    )

    return ownerkeypair;
}


// Create transaction instruction

const transactionInstructions = async () => {
    const transaction = new web3.Transaction();
    const programId = new web3.PublicKey(PING_PROGRAM_ADDRESS);
    const pingProgramDataId = new web3.PublicKey(PING_PROGRAM_DATA_ADDRESS);
    const payer = await gettingKeypair();

    const instruction = new web3.TransactionInstruction({
        keys: [
            {
                pubkey: pingProgramDataId,
                isSigner: false,
                isWritable: true,
            },
        ],
        programId,
    });

    transaction.add(instruction);

    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [payer],
    );

    console.log(`✅ Transaction completed! Signature is ${signature}`);
}

transactionInstructions()

