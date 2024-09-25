import * as borsh from "@coral-xyz/borsh"
import { clusterApiUrl, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import * as fs from 'fs';

const secret = JSON.parse(fs.readFileSync("Apykey.json").toString()) as number[];
const secretKey = Uint8Array.from(secret);
const ownerkeypair = Keypair.fromSecretKey(secretKey);
console.log(
  "Owner Public keypair: ", ownerkeypair.publicKey.toBase58()
);

const player = new PublicKey("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG")
const PROGRAM_ID =new PublicKey('HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf')
const equipPlayerSchema = borsh.struct([
  borsh.u8("varient"),
  borsh.u16("playerId"),
  borsh.u256("itemId")
]);

const buffer = Buffer.alloc(1000);

// Serialize the data
equipPlayerSchema.encode({ variant: 2, playerId: 1234, itemId: new BN(737498) }, buffer);
const instructionBuffer = buffer.subarray(0, equipPlayerSchema.getSpan(buffer))

console.log(equipPlayerSchema.getSpan(buffer))
console.log(instructionBuffer)

const main = async () => {

  const endpoint = clusterApiUrl(
    "devnet"
  );
  const connection = new Connection(endpoint);

  const transaction = new Transaction();
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: ownerkeypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: player,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false
      },
    ],
    data: instructionBuffer,
    programId: PROGRAM_ID 
  })

  transaction.add(instruction);

  try {
    console.log("-----------")
    const transactionId = await sendAndConfirmTransaction(connection, transaction, [ownerkeypair])
    console.log(`Transaction submitted: ${transactionId} `)
  } catch (error) {
    console.log(error)
  }
}

main()