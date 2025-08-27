use anchor_lang::prelude::*;

declare_id!("EnmtdHTvfeyS8F14DvKwzjVu4Nhubw58MQzbDdribsCH");

#[program]
pub mod time_locked_wallet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, unlock_time: i64, bump: u8) -> Result<()> {
        let timelock = &mut ctx.accounts.timelock;
        timelock.owner = *ctx.accounts.payer.key;
        timelock.unlock_time = unlock_time;
        timelock.bump = bump;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.depositor.key,
            &ctx.accounts.timelock.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.timelock.to_account_info(),
            ],
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let timelock = &ctx.accounts.timelock;
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= timelock.unlock_time,
            ErrorCode::TooEarly
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 1,
        seeds = [b"timelock", payer.key().as_ref()],
        bump
    )]
    pub timelock: Account<'info, TimeLock>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(
        mut,
        seeds = [b"timelock", timelock.owner.as_ref()],
        bump = timelock.bump
    )]
    pub timelock: Account<'info, TimeLock>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"timelock", timelock.owner.as_ref()],
        bump = timelock.bump,
        has_one = owner,
        close = owner
    )]
    pub timelock: Account<'info, TimeLock>,
}

#[account]
pub struct TimeLock {
    pub owner: Pubkey,
    pub unlock_time: i64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unlock time has not been reached yet.")]
    TooEarly,
}
