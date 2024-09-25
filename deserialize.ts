import { Connection, PublicKey } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh";
const connection = new Connection("https://api.devnet.solana.com/")
const programId = new PublicKey("HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf");
const publickey = new PublicKey("3q38PPKtquk3fkPYnovmyQtDrbyhRd9HiyDZfoZmUSEn")

const borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.u16("playerId"),
    borsh.str("name"),
  ]);

const main = async () => {
    const [pda, bump] = PublicKey.findProgramAddressSync(
        [publickey.toBuffer()],
        programId,
    );
    console.log("pda = ", pda.toBase58());
    console.log("bump = ", bump);

    const [pda2, bump2] = PublicKey.findProgramAddressSync(
        [Buffer.from("Shopping list"), publickey.toBuffer()],
        programId,
    );
    console.log("pda2 = ", pda2.toBase58());
    console.log("bump2 = ", bump2);

}
main()

const fetchProgramAccounts = async () => {
    try {
        const accounts = await connection.getProgramAccounts(programId);

        accounts.forEach(({ pubkey, account }) => {
            console.log("Account:", pubkey.toBase58());
            console.log("Data buffer:", account.data);
            const { initialized, playerId, name } = borshAccountSchema.decode(account.data);
            console.log("initialize: ",initialized )
            console.log("PlayerId:", playerId);
            console.log("Name:", name);
        });
    } catch (error) {
        console.error("Error fetching program accounts:", error);
    }
};

fetchProgramAccounts();

