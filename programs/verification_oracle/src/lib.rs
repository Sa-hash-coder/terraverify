use anchor_lang::prelude::*;

declare_id!("Orac1111111111111111111111111111111111111111");

#[program]
pub mod verification_oracle {
    use super::*;

    pub fn submit_verification(
        ctx: Context<SubmitVerification>,
        project_id: u64,
        forest_cover_bps: u16,
        ndvi_mean: u16,
        change_from_baseline: i16,
        quality_score: u8,
        result_status: VerificationResult,
        evidence_hash: [u8; 32],
        evidence_uri: String,
        satellite_date: i64,
    ) -> Result<()> {
        let report = &mut ctx.accounts.report;
        
        report.project_id = project_id;
        report.verifier = ctx.accounts.oracle_authority.key();
        report.forest_cover_bps = forest_cover_bps;
        report.ndvi_mean = ndvi_mean;
        report.change_from_baseline = change_from_baseline;
        report.credit_quality_score = quality_score;
        report.result = result_status.clone();
        report.evidence_hash = evidence_hash;
        report.evidence_uri = evidence_uri;
        report.satellite_date = satellite_date;
        report.verified_at = Clock::get()?.unix_timestamp;
        report.bump = ctx.bumps.report;

        // In a full implementation, here we would execute CPIs (Cross-Program Invocations):
        // match result_status {
        //     VerificationResult::Pass => CPI to carbon_credit program to mint(),
        //     VerificationResult::Fail => CPI to project_registry to suspend(),
        //     VerificationResult::CriticalFail => CPI to carbon_credit to revoke() via Permanent Delegate
        //     _ => {}
        // }

        msg!("Verification report submitted for project {}. Result: {:?}", project_id, result_status);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct SubmitVerification<'info> {
    #[account(
        init,
        payer = oracle_authority,
        space = 8 + VerificationReport::INIT_SPACE,
        seeds = [b"report", project_id.to_le_bytes().as_ref(), Clock::get()?.unix_timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub report: Account<'info, VerificationReport>,
    
    #[account(mut)]
    pub oracle_authority: Signer<'info>, // Must be a whitelisted oracle
    
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct VerificationReport {
    pub project_id: u64,
    pub verifier: Pubkey,
    
    pub forest_cover_bps: u16,
    pub ndvi_mean: u16,
    pub change_from_baseline: i16,
    pub credit_quality_score: u8,
    
    pub result: VerificationResult,
    
    pub evidence_hash: [u8; 32],
    #[max_len(120)]
    pub evidence_uri: String,
    
    pub satellite_date: i64,
    pub verified_at: i64,
    
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum VerificationResult {
    Pass,
    Warning,
    Fail,
    CriticalFail,
}
