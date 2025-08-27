import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeLockedWallet } from "../target/types/time_locked_wallet";
import assert from "assert";


const provider = anchor.AnchorProvider.local()
anchor.setProvider(provider);
const program = anchor.workspace.timeLockedWallet as Program<TimeLockedWallet>;

const findPda = ownerPubkey => anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("timelock"), ownerPubkey.toBuffer()], program.programId)

const initialize = async (ownerKeypair: anchor.web3.Keypair, unlockUnixTS: number) => {
  const [pda, bump] = findPda(ownerKeypair.publicKey)
  await program.methods
    .initialize(new anchor.BN(unlockUnixTS), bump)
    .accounts({
      payer: ownerKeypair.publicKey,
      timelock: pda,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([ownerKeypair])
    .rpc()
}

const deposit = async (depositor: anchor.web3.Keypair, owner: anchor.web3.Keypair, amount: number) => {
  const [pda] = findPda(owner.publicKey)
  await program.methods
    .deposit(new anchor.BN(amount))
    .accounts({
      depositor: depositor.publicKey,
      timelock: pda,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([depositor])
    .rpc()
}

const withdraw = async (owner: anchor.web3.Keypair) => {
  const [pda] = findPda(owner.publicKey)
  await program.methods
    .withdraw()
    .accounts({
      owner: owner.publicKey,
      timelock: pda,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([owner])
    .rpc()
}

describe("time_locked_wallet", () => {
  const owner = anchor.web3.Keypair.generate()
  const depositor = anchor.web3.Keypair.generate()

  it("Does the full dance", async () => {
    // 1. Airdrop para pagar fees
    await provider.connection.requestAirdrop(owner.publicKey, 1e9) // 1SOL
    await provider.connection.requestAirdrop(depositor.publicKey, 1e9)
    await new Promise(r => setTimeout(r, 1000)) // Espera el airdrop

    // 2. Inicializar wallet
    const unlockTime = Math.floor(Date.now() / 1000) + 60 // 60s
    await initialize(owner, unlockTime)

    // 3. Depositar 0.01 SOL
    await deposit(depositor, owner, 0.01 * anchor.web3.LAMPORTS_PER_SOL)

    // 4. Intentar retirar antes del unlock
    let failed = false
    try {
      await withdraw(owner)
    } catch (err) {
      assert(err.toString().includes("TooEarly"))
      failed = true
    }
    assert(failed, "Withdraw should have failed because it's too early")

    // 5. Esperar hasta unlock_time
    const now = Math.floor(Date.now() / 1000)
    if (unlockTime > now) {
      await new Promise(r => setTimeout(r, (unlockTime - now + 1) * 1000))
    }

    await withdraw(owner)

    // 7. Verificar
    const [pda] = findPda(owner.publicKey)
    const pdaBalance = await provider.connection.getBalance(pda)
    assert(pdaBalance === 0, "PDA should be empty after withdrawal")
  });
});
