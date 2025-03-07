const anchor = require("@project-serum/anchor");

async function interact() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.DaoContract;

    const daoAccount = new anchor.web3.PublicKey("DAO_PUBLIC_KEY"); // Replace with actual DAO address
    const proposal = anchor.web3.Keypair.generate();

    // Create a proposal
    await program.rpc.createProposal(
        "Fund Open-Source Development",
        "This proposal funds open-source blockchain projects",
        { transferSol: { to: provider.wallet.publicKey, amount: new anchor.BN(100000000) } },
        {
            accounts: {
                dao: daoAccount,
                proposal: proposal.publicKey,
                creator: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [proposal]
        }
    );

    console.log("Proposal created:", proposal.publicKey.toBase58());

    // Vote on the proposal
    const voter = provider.wallet.publicKey;
    const amount = new anchor.BN(100); // Quadratic voting amount

    await program.rpc.vote(proposal.publicKey, amount, true, {
        accounts: {
            proposal: proposal.publicKey,
            voter: voter
        }
    });

    console.log("Vote casted on proposal:", proposal.publicKey.toBase58());

    // Execute the proposal if votes are in favor
    await program.rpc.executeProposal(proposal.publicKey, {
        accounts: {
            dao: daoAccount,
            proposal: proposal.publicKey,
            treasury: provider.wallet.publicKey,
            to: provider.wallet.publicKey
        }
    });

    console.log("Proposal executed!");
}

interact().catch(console.error);

// :)
