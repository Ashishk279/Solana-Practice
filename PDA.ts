import { Connection, PublicKey } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh";

const PROGRAM_ID = new PublicKey("HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf")
const borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.u16("playerId"),
    borsh.str("name"),
  ]);

const [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from("GLOBAL_STATE")], PROGRAM_ID);

console.log("PDA =", pda.toBase58());
console.log("bump =", bump)

// If not provide bump then it create a new address
// const pda2 = PublicKey.createProgramAddressSync([Buffer.from("GLOBAL_STATE")], PROGRAM_ID)
//  console.log("pda2 = ", pda2.toBase58())

 const pda2 = PublicKey.createProgramAddressSync([Buffer.from("GLOBAL_STATE"), Buffer.from([252])], PROGRAM_ID)
 console.log("PDA2 = ", pda2.toBase58())

 console.log("Is on curve = ", PublicKey.isOnCurve(pda2))
 console.log("Is on curve = ", PublicKey.isOnCurve(pda))

 const userPK = new PublicKey("Gw3C6facHGCmVPhLSTAxrenwBKYU4GKrRoK68pnBVmcW");
 const [pda3, bump3] = PublicKey.findProgramAddressSync([Buffer.from("USER_DATA"),userPK.toBuffer() ], PROGRAM_ID)

 console.log("PDA3 =", pda3.toBase58());
console.log("bump3 =", bump3)


const main = async() =>{
    const connection = new Connection("https://api.devnet.solana.com/");
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    accounts.forEach(({pubkey, account}) => {
          console.log("Account: ", pubkey.toBase58())
          console.log("Data Buffer: ", account.data)
          const { initialized, playerId, name } = borshAccountSchema.decode(account.data);
            console.log("initialize: ",initialized )
            console.log("PlayerId:", playerId);
            console.log("Name:", name);
    })
}

main()