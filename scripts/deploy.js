const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

async function deploy() {
    
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.DaoContract;

    const treasury = anchor.web3.Keypair.generate();

    const dao = anchor.web3.Keypair.generate();
    await program.rpc.initialize(
        treasury.publicKey,
        {
            accounts: {
                dao: dao.publicKey,
                authority: provider.wallet.publicKey,
                treasury: treasury.publicKey,
                systemProgram: SystemProgram.programId
            },
            signers: [dao, treasury]
        }
    );

    console.log("DAO deployed at:", dao.publicKey.toBase58());
    console.log("Treasury address:", treasury.publicKey.toBase58());
}

deploy().catch(console.error);

//:)
