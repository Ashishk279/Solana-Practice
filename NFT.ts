// Use the Metaplex Token Metadata program for NFT metadata
import {
    createNft,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
// import {
//     airdropIfRequired,
//     getExplorerLink,
//     getKeypairFromFile,
// } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fs from "fs";
import * as path from "path";

// Create a connection 
const connection = new Connection(clusterApiUrl("devnet"));
const umi = createUmi(connection);

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const loadKeypair = (address: string) => {
    const secret = JSON.parse(fs.readFileSync(address).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    const payer = Keypair.fromSecretKey(secretKey);
    return payer
}

const user = loadKeypair("AshwhQKHScGq1nzpMLj9WsGG97EHCLPZfNsfMFhHvDTG.json")
console.log("User ", user)

const TokenMetadata = () => {
    // convert to umi compatible keypair
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    // assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
    umi
        .use(keypairIdentity(umiKeypair))
        .use(mplTokenMetadata())
        .use(irysUploader());
}

const UmiUploderIrys = async () => {
    const collectionImagePath = path.resolve(__dirname, "nft.png")
    console.log(collectionImagePath);

    const buffer = await fs.readFileSync(collectionImagePath)

    let file = createGenericFile(buffer, collectionImagePath, {
        contentType: "image/png"
    })

    const [image] = await umi.uploader.upload([file]);
    console.log("Image URI: ", image)

    const uri = await umi.uploader.uploadJson({
        name: "My Ultimate Collection",
        symbol: "MUC",
        description: "My ultimate collection NFTs that are unique to all.",
        image,
    })

    console.log("Collection offchain metadata URI:", uri);
}

const getAirdrop = async (address: any) => {
    try {

        const amount = LAMPORTS_PER_SOL * 0.2
        let balance = await connection.getBalance(address.publicKey);
        console.log("Balance of Address: ", balance)
        let airdropRequest = await connection.requestAirdrop(address, amount)
        await connection.confirmTransaction(airdropRequest);
        balance = await connection.getBalance(address);
        console.log("Balance of Address: ", balance)

    } catch (error) {
        console.log("Lamport Error", error.message)
    }
}

const main = async () => {
    const airdrop = await getAirdrop(user)
    console.log(airdrop)
}

main()