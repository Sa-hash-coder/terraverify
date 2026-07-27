use anchor_lang::prelude::*;

declare_id!("Reg1111111111111111111111111111111111111111");

#[program]
pub mod project_registry {
    use super::*;

    pub fn register_project(
        ctx: Context<RegisterProject>,
        project_id: u64,
        name: String,
        bbox: [f64; 4],
        area_hectares: f64,
        methodology: String,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        project.authority = ctx.accounts.authority.key();
        project.project_id = project_id;
        project.name = name;
        project.bbox = bbox;
        project.area_hectares = area_hectares;
        project.methodology = methodology;
        
        project.baseline_forest_pct = 0; // Will be set on first verification
        project.current_forest_pct = 0;
        project.status = ProjectStatus::Pending;
        
        project.created_at = Clock::get()?.unix_timestamp;
        project.last_verified_at = 0;
        project.total_credits_minted = 0;
        project.verification_count = 0;
        project.credit_quality_score = 0;
        project.bump = ctx.bumps.project;

        msg!("Project {} registered successfully.", project_id);
        Ok(())
    }

    pub fn suspend_project(ctx: Context<UpdateProjectStatus>) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        // Ensure only the authorized Oracle or Authority can suspend
        require!(
            ctx.accounts.authority.key() == project.authority || 
            ctx.accounts.authority.key() == Pubkey::default(), // Replace with Oracle Authority
            ErrorCode::Unauthorized
        );

        project.status = ProjectStatus::Suspended;
        msg!("Project {} suspended.", project.project_id);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct RegisterProject<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CarbonProject::INIT_SPACE,
        seeds = [b"project", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project: Account<'info, CarbonProject>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProjectStatus<'info> {
    #[account(mut)]
    pub project: Account<'info, CarbonProject>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct CarbonProject {
    pub authority: Pubkey,                  // 32
    pub project_id: u64,                    // 8
    
    #[max_len(50)]
    pub name: String,                       // 4 + 50
    pub bbox: [f64; 4],                     // 32
    pub area_hectares: f64,                 // 8
    
    #[max_len(20)]
    pub methodology: String,                // 4 + 20
    
    pub baseline_forest_pct: u16,           // 2 (Basis points)
    pub current_forest_pct: u16,            // 2
    pub status: ProjectStatus,              // 1
    
    pub created_at: i64,                    // 8
    pub last_verified_at: i64,              // 8
    pub total_credits_minted: u64,          // 8
    
    pub credit_mint: Pubkey,                // 32
    pub verification_count: u32,            // 4
    pub credit_quality_score: u8,           // 1
    
    pub bump: u8,                           // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProjectStatus {
    Pending,
    Verified,
    Active,
    Suspended,
    Revoked,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access.")]
    Unauthorized,
}
