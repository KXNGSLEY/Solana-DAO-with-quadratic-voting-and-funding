use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, Transfer};
use solana_program::pubkey::Pubkey;

declare_id!("DAO1111111111111111111111111111111111111");

#[program]
pub mod dao_contract {
    use super::*;

    // Initialize the DAO
    pub fn initialize(ctx: Context<Initialize>, treasury_bump: u8) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.treasury = ctx.accounts.treasury.key();
        dao.treasury_bump = treasury_bump;
        dao.proposal_count = 0;
        Ok(())
    }

    // Create a proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        action: ProposalAction,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao = &mut ctx.accounts.dao;
        
        proposal.id = dao.proposal_count;
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title;
        proposal.description = description;
        proposal.action = action;
        proposal.vote_yes = 0;
        proposal.vote_no = 0;
        proposal.executed = false;

        dao.proposal_count += 1;
        Ok(())
    }

    // Vote on a proposal using quadratic voting
    pub fn vote(ctx: Context<Vote>, proposal_id: u64, amount: u64, vote_yes: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &ctx.accounts.voter;

        require!(proposal.executed == false, DAOError::ProposalAlreadyExecuted);

        let voting_power = (amount as f64).sqrt() as u64;
        
        if vote_yes {
            proposal.vote_yes += voting_power;
        } else {
            proposal.vote_no += voting_power;
        }

        Ok(())
    }

    // Execute a proposal if it has enough votes
    pub fn execute_proposal(ctx: Context<ExecuteProposal>, proposal_id: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        require!(proposal.executed == false, DAOError::ProposalAlreadyExecuted);
        require!(proposal.vote_yes > proposal.vote_no, DAOError::NotEnoughVotes);

        match proposal.action {
            ProposalAction::TransferSol { to, amount } => {
                let treasury = &ctx.accounts.treasury;
                **treasury.to_account_info().try_borrow_mut_lamports()? -= amount;
                **ctx.accounts.to.to_account_info().try_borrow_mut_lamports()? += amount;
            }
        }

        proposal.executed = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 64)]
    pub dao: Account<'info, DAO>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 8 + 64)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, DAO>,
    #[account(init, payer = creator, space = 8 + 512)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub dao: Account<'info, DAO>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
}

#[account]
pub struct DAO {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub treasury_bump: u8,
    pub proposal_count: u64,
}

#[account]
pub struct Proposal {
    pub id: u64,
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub action: ProposalAction,
    pub vote_yes: u64,
    pub vote_no: u64,
    pub executed: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ProposalAction {
    TransferSol { to: Pubkey, amount: u64 },
}

#[error_code]
pub enum DAOError {
    #[msg("Proposal has already been executed.")]
    ProposalAlreadyExecuted,
    #[msg("Not enough votes to execute proposal.")]
    NotEnoughVotes,
}

// :)
