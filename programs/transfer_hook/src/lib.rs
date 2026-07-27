use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("Hook1111111111111111111111111111111111111111");

#[program]
pub mod transfer_hook {
    use super::*;

    /// The transfer hook instruction that the SPL Token-2022 program CPIs into
    /// EVERY time a token is transferred.
    pub fn execute(
        ctx: Context<ExecuteTransferHook>,
        amount: u64,
    ) -> Result<()> {
        msg!("TRANSFER HOOK TRIGGERED: {} credits moving.", amount);
        
        let source = &ctx.accounts.source;
        let destination = &ctx.accounts.destination;
        
        msg!("From: {}", source.key());
        msg!("To: {}", destination.key());
        
        // Example Compliance Check:
        // We could require that the destination wallet has passed a KYC check
        // or ensure that tokens aren't sent to sanctioned addresses.
        
        // For TerraVerify, we use this to build an immutable, on-chain 
        // audit trail for carbon accounting.
        emit!(TransferEvent {
            source: source.key(),
            destination: destination.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExecuteTransferHook<'info> {
    #[account(
        token::mint = mint,
    )]
    pub source: InterfaceAccount<'info, TokenAccount>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        token::mint = mint,
    )]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: System required
    pub owner: UncheckedAccount<'info>,
    
    /// CHECK: System required
    #[account(
        seeds = [b"extra-account-meta-list", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
}

#[event]
pub struct TransferEvent {
    pub source: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
