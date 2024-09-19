import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

const connection = new Connection(clusterApiUrl("devnet"));

const generateKeypair = async () => {
    const keypair = Keypair.generate();
    console.log(`✅ Generated keypair!`);
    console.log(`The public key is: `, keypair.publicKey.toBase58());
    console.log(`The secret key is: `, keypair.secretKey);
    const address = keypair.publicKey
    const secret = keypair.secretKey

    return { address, secret }

}

const address = new PublicKey("5XmqWXY9xJAkze3DSQgznrM6rKNou6rU7tqmQX5wGu1e")
const getBalance = async (address: any) => {
    let balance = await connection.getBalance(address);
    console.log(`Balance of Address:${address} `, balance)
}

getBalance(address)




const getAirdrop = async () => {
    try {

        const amount = LAMPORTS_PER_SOL * 0.5
        const { address, secret } = await generateKeypair();
        let balance = await connection.getBalance(address);
        console.log("Balance of Address: ", balance)
        if (balance >= LAMPORTS_PER_SOL * 1.0) {
            console.log("Lamport Error")
        }
        let airdropRequest = await connection.requestAirdrop(address, amount)
        await connection.confirmTransaction(airdropRequest);
        balance = await connection.getBalance(address);
        console.log("Balance of Address: ", balance)

    } catch (error) {
        console.log("Lamport Error", error.message)
    }
}

// getAirdrop()

