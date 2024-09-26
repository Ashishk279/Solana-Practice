import { Connection, PublicKey } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh"

async function main() {
    const tokenMint = new PublicKey("GCZqGR74N5FWNkk8nbzYb94MWZfJxRkeGBnuBAeAy9M9")
    const programId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    const seeds = [Buffer.from("metedata"), programId.toBytes(), tokenMint.toBytes()]
    const [metadataPDA, bump] = PublicKey.findProgramAddressSync(seeds, programId)
    const connection = new Connection("https://api.mainnet-beta.solana.com")

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    console.log(accountInfo)
    const borshMetadataLayout = borsh.struct([
        borsh.u8("key"),
        borsh.publicKey("updateAuthority"),
        borsh.publicKey('mint'),
        borsh.str('name'),
        borsh.str('symbol'),
        borsh.str('uri'),
        borsh.u16('sellerFeeBasisPoints'),
    ])
    if(accountInfo){
        const metadata = await borshMetadataLayout.decode(accountInfo.data)
        console.log(metadata)
    
    }


}
main()