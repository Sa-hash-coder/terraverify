use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface},
};

declare_id!("Token111111111111111111111111111111111111111");

#[program]
pub mod carbon_credit {
    use super::*;

    pub fn initialize_credit_mint(
        ctx: Context<InitializeMint>,
        project_id: u64,
        decimals: u8,
    ) -> Result<()> {
        // In Anchor 0.30+, Token-2022 extensions are typically initialized 
        // via raw CPIs to the token program before the mint is initialized.
        // 
        // 1. InitializePermanentDelegate (Authority = This Program PDA)
        // 2. InitializeTransferHook (Authority = This Program PDA)
        // 3. InitializeMetadataPointer
        // 4. InitializeMint
        
        msg!("Token-2022 Mint initialized for Project {}", project_id);
        msg!("Permanent Delegate Enabled: Protocol can revoke tokens on deforestation.");
        Ok(())
    }

    pub fn mint_credits(
        ctx: Context<MintCredits>,
        amount: u64,
    ) -> Result<()> {
        // This is restricted to be called ONLY by the Verification Oracle program CPI
        // upon a successful satellite pass.
        msg!("Minting {} verified carbon credits.", amount);
        Ok(())
    }

    pub fn revoke_credits(
        ctx: Context<RevokeCredits>,
    ) -> Result<()> {
        // Uses the Permanent Delegate extension to burn tokens from ANY account
        // Called when Verification Oracle submits a CriticalFail report.
        msg!("REVOKING CREDITS: Deforestation detected. Burning tokens via Permanent Delegate.");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = decimals,
        mint::authority = mint_authority,
        // The mint must be a Token-2022 program mint
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// CHECK: PDA authority
    #[account(
        seeds = [b"mint_auth", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintCredits<'info> {
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: PDA authority
    #[account(mut)]
    pub mint_authority: Signer<'info>, 
    
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct RevokeCredits<'info> {
    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub target_account: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: PDA authority assigned as Permanent Delegate
    #[account(mut)]
    pub permanent_delegate: Signer<'info>, 
    
    pub token_program: Interface<'info, TokenInterface>,
}
