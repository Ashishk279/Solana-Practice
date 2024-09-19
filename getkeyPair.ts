import dotenv from 'dotenv'
import * as fs from 'fs'
// import { getKeypairFromEnvironment, getKeypairFromFile } from "@solana-developers/helpers";
import { Keypair } from "@solana/web3.js";
dotenv.config()
// console.log(process.env.SECRET_KEY)

// Getting keypair from file
const secret = JSON.parse(fs.readFileSync("Apykey.json").toString()) as number[];
console.log("Secret!  ", secret)
const secretKey = Uint8Array.from(secret);
console.log("SecretKey!  ", secretKey)
const ownerkeypair = Keypair.fromSecretKey(secretKey);
console.log(
    `✅ Finished! We've loaded our secret key securely, from file!`, ownerkeypair.publicKey.toBase58()
  );
// Get keypair from secret key
const keyPair = Keypair.fromSecretKey(
    Uint8Array.from([124,215,215,107,99,205,225,16,164,232,150,47,1,195,114,237,83,172,95,218,111,118,86,156,132,160,186,246,94,62,250,206,146,182,132,105,198,219,214,152,194,21,39,137,200,66,121,103,30,108,188,201,146,123,11,181,25,37,62,187,167,55,39,107])
)

console.log(
    `✅ Finished! We've loaded our secret key securely!`, keyPair.publicKey.toBase58()
  );
console.log(
    `✅ Finished! We've loaded our secret key securely!`, keyPair.secretKey
  );