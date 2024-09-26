import { Connection, GetProgramAccountsConfig, PublicKey } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh";
import bs58 from 'bs58'
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
// main()


// Paging and Ordering
const fetchProgramAccounts = async () => {
    // const config: GetProgramAccountsConfig = {
    //     dataSlice: { offset: 0, length: 0 }
    // }
    const config: GetProgramAccountsConfig = {
        dataSlice: { offset: 13, length: 15}
    }
    try {
        const accounts = await connection.getProgramAccounts(programId, config);
        const accountsArray = Array.from(accounts);
        // accounts.forEach(({ pubkey, account }) => {
        //     console.log("Account:", pubkey.toBase58());
        //     console.log("Data buffer:", account.data);

        // });
        accountsArray.sort((a, b) => {

            const dataA = a.account.data
            const dataB = b.account.data
            return dataA.compare(dataB);
        });
        const accountKeys = accounts.map(account => account.pubkey);
        // console.log(accountKeys)
        const paginatedKeys = accountKeys.slice(10, 40);
        const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys);
        accountInfos.forEach(accountInfo => {
            // put logic to deserialize accountInfo.data here
            const { initialized, playerId, name } = borshAccountSchema.decode(accountInfo?.data);
            console.log("initialize: ", initialized)
            console.log("PlayerId:", playerId);
            console.log("Name:", name);
        });
    } catch (error) {
        console.error("Error fetching program accounts:", error);
    }
};

// fetchProgramAccounts();

// Filtering 

async function Filtering() {
    const searchName = `as♣MONEY`
    const nameBuffer = Buffer.concat([
        Buffer.from(Uint8Array.of(searchName.length)), // Length of the string (as a 4-byte integer)
        Buffer.from(searchName, 'utf8') // UTF-8 encoded name
    ]);
    const config: GetProgramAccountsConfig = {
        filters: [
            {
                memcmp: {
                    offset: 3,
                    bytes: bs58.encode(Buffer.from(nameBuffer))
                }
            }
        ]
    }

    try {
        const accounts = await connection.getProgramAccounts(programId, config);
        console.log("Accounts: ", accounts)
        const accountsArray = Array.from(accounts);
        // accounts.forEach(({ pubkey, account }) => {
        //     console.log("Account:", pubkey.toBase58());
        //     console.log("Data buffer:", account.data);

        // });
        accountsArray.sort((a, b) => {

            const dataA = a.account.data
            const dataB = b.account.data
            return dataA.compare(dataB);
        });
        const accountKeys = accounts.map(account => account.pubkey);
        console.log(accountKeys)
        const paginatedKeys = accountKeys.slice(0, accountKeys.length);
        const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys);
        accountInfos.forEach(accountInfo => {
            // put logic to deserialize accountInfo.data here
            const { initialized, playerId, name } = borshAccountSchema.decode(accountInfo?.data);
            console.log("initialize: ", initialized)
            console.log("PlayerId:", playerId);
            console.log("Name:", name);
        });
    } catch (error) {
        console.error("Error fetching program accounts:", error);
    }
}

Filtering()

