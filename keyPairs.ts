import { Keypair } from "@solana/web3.js";
// import "dotenv/config";
// import { getKeypairFromEnvironment } from "@solana-developers/helpers";
const keypair = Keypair.generate();
console.log(`✅ Generated keypair!`);
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`✅ Finished!`);


 
// const keypair = getKeypairFromEnvironment(process.env.SECRET_KEY);
 
// console.log(
//   `✅ Finished! We've loaded our secret key securely, using an env file!: ${keypair}`, 
// );