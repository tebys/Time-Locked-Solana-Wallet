import * as anchor from "@coral-xyz/anchor"
import { TimeLockedWallet } from "../../target/types/time_locked_wallet"

export const findPda = (program: anchor.Program<TimeLockedWallet>, ownerPubkey: anchor.web3.PublicKey) => anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("timelock"), ownerPubkey.toBuffer()], program.programId)

export const initialize = async (program: anchor.Program<TimeLockedWallet>, ownerKeypair: anchor.web3.Keypair, unlockUnixTS: number) => {
  const [pda, bump] = findPda(program, ownerKeypair.publicKey)
  const accounts: any = {
    payer: ownerKeypair.publicKey,
    timelock: pda,
    systemProgram: anchor.web3.SystemProgram.programId
  }
  await program.methods
    .initialize(new anchor.BN(unlockUnixTS), bump)
    .accounts(accounts)
    .signers([ownerKeypair])
    .rpc()
}

export const deposit = async (program: anchor.Program<TimeLockedWallet>, depositor: anchor.web3.Keypair, owner: anchor.web3.Keypair, amount: number) => {
  const [pda] = findPda(program, owner.publicKey)
  const accounts: any = {
    depositor: depositor.publicKey,
    timelock: pda,
    systemProgram: anchor.web3.SystemProgram.programId
  }
  await program.methods
    .deposit(new anchor.BN(amount))
    .accounts(accounts)
    .signers([depositor])
    .rpc()
}

export const withdraw = async (program: anchor.Program<TimeLockedWallet>, owner: anchor.web3.Keypair) => {
  const [pda] = findPda(program, owner.publicKey)
  const accounts: any = {
    owner: owner.publicKey,
    timelock: pda,
    systemProgram: anchor.web3.SystemProgram.programId
  }
  await program.methods
    .withdraw()
    .accounts(accounts)
    .signers([owner])
    .rpc()
}



