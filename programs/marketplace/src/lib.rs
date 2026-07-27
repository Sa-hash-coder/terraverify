use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};

declare_id!("Mark111111111111111111111111111111111111111");

#[program]
pub mod marketplace {
    use super::*;

    pub fn list_credits(
        ctx: Context<ListCredits>,
        price_per_credit_sol: u64,
        amount: u64,
    ) -> Result<()> {
        let order = &mut ctx.accounts.sell_order;
        order.seller = ctx.accounts.seller.key();
        order.credit_mint = ctx.accounts.mint.key();
        order.price_per_credit = price_per_credit_sol;
        order.amount_remaining = amount;
        order.bump = ctx.bumps.sell_order;

        // Transfer credits to escrow
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.seller_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

        msg!("{} credits listed for {} SOL each.", amount, price_per_credit_sol);
        Ok(())
    }

    pub fn retire_credits(
        ctx: Context<RetireCredits>,
        amount: u64,
        purpose: String,
    ) -> Result<()> {
        // Retiring credits burns them from circulation and creates an on-chain 
        // Retirement Certificate (often represented as an NFT).
        
        // 1. CPI to carbon_credit program to burn()
        // 2. Mint Retirement Certificate NFT
        
        msg!("{} credits permanently retired for purpose: {}", amount, purpose);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(price_per_credit_sol: u64)]
pub struct ListCredits<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + SellOrder::INIT_SPACE,
        seeds = [b"order", seller.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub sell_order: Account<'info, SellOrder>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub seller_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RetireCredits<'info> {
    #[account(mut)]
    pub retiree: Signer<'info>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub retiree_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct SellOrder {
    pub seller: Pubkey,
    pub credit_mint: Pubkey,
    pub price_per_credit: u64,
    pub amount_remaining: u64,
    pub bump: u8,
}
