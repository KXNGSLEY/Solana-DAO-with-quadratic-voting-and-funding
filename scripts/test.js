const anchor = require("@project-serum/anchor");
const { expect } = require("chai");

describe("DAO Contract Tests", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.DaoContract;

    let dao, proposal, treasury, creator;

    it("Deploys DAO", async () => {
        dao = anchor.web3.Keypair.generate();
        treasury = anchor.web3.Keypair.generate();
        creator = provider.wallet.publicKey;

        await program.rpc.initialize(
            treasury.publicKey,
            {
                accounts: {
                    dao: dao.publicKey,
                    authority: provider.wallet.publicKey,
                    treasury: treasury.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [dao, treasury]
            }
        );

        expect(dao.publicKey).to.not.be.null;
    });

    it("Creates a proposal", async () => {
        proposal = anchor.web3.Keypair.generate();

        await program.rpc.createProposal(
            "Upgrade DAO System",
            "Proposal to upgrade the DAO's core features",
            { transferSol: { to: creator, amount: new anchor.BN(50000000) } },
            {
                accounts: {
                    dao: dao.publicKey,
                    proposal: proposal.publicKey,
                    creator: creator,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
                signers: [proposal]
            }
        );

        expect(proposal.publicKey).to.not.be.null;
    });

    it("Votes on a proposal using Quadratic Voting", async () => {
        await program.rpc.vote(proposal.publicKey, new anchor.BN(200), true, {
            accounts: {
                proposal: proposal.publicKey,
                voter: provider.wallet.publicKey
            }
        });

        console.log("Voted successfully!");
    });

    it("Executes a proposal", async () => {
        await program.rpc.executeProposal(proposal.publicKey, {
            accounts: {
                dao: dao.publicKey,
                proposal: proposal.publicKey,
                treasury: treasury.publicKey,
                to: creator
            }
        });

        console.log("Proposal executed successfully!");
    });
});

// :)
