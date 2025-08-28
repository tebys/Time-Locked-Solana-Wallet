import * as anchor from '@coral-xyz/anchor';

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/time_locked_wallet.json`.
 */
type TimeLockedWallet = {
    "address": "EnmtdHTvfeyS8F14DvKwzjVu4Nhubw58MQzbDdribsCH";
    "metadata": {
        "name": "timeLockedWallet";
        "version": "0.1.0";
        "spec": "0.1.0";
        "description": "Created with Anchor";
    };
    "instructions": [
        {
            "name": "deposit";
            "discriminator": [
                242,
                35,
                198,
                137,
                82,
                225,
                242,
                182
            ];
            "accounts": [
                {
                    "name": "depositor";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "timelock";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    116,
                                    105,
                                    109,
                                    101,
                                    108,
                                    111,
                                    99,
                                    107
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "timelock.owner";
                                "account": "timeLock";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "amount";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "initialize";
            "discriminator": [
                175,
                175,
                109,
                31,
                13,
                152,
                155,
                237
            ];
            "accounts": [
                {
                    "name": "payer";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "timelock";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    116,
                                    105,
                                    109,
                                    101,
                                    108,
                                    111,
                                    99,
                                    107
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "payer";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "unlockTime";
                    "type": "i64";
                },
                {
                    "name": "bump";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "withdraw";
            "discriminator": [
                183,
                18,
                70,
                156,
                148,
                109,
                161,
                34
            ];
            "accounts": [
                {
                    "name": "owner";
                    "writable": true;
                    "signer": true;
                    "relations": [
                        "timelock"
                    ];
                },
                {
                    "name": "timelock";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    116,
                                    105,
                                    109,
                                    101,
                                    108,
                                    111,
                                    99,
                                    107
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "timelock.owner";
                                "account": "timeLock";
                            }
                        ];
                    };
                }
            ];
            "args": [];
        }
    ];
    "accounts": [
        {
            "name": "timeLock";
            "discriminator": [
                254,
                6,
                114,
                1,
                127,
                220,
                253,
                110
            ];
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "tooEarly";
            "msg": "Unlock time has not been reached yet.";
        }
    ];
    "types": [
        {
            "name": "timeLock";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "owner";
                        "type": "pubkey";
                    },
                    {
                        "name": "unlockTime";
                        "type": "i64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        }
    ];
};

declare const findPda: (program: anchor.Program<TimeLockedWallet>, ownerPubkey: anchor.web3.PublicKey) => [anchor.web3.PublicKey, number];
declare const initialize: (program: anchor.Program<TimeLockedWallet>, ownerKeypair: anchor.web3.Keypair, unlockUnixTS: number) => Promise<void>;
declare const deposit: (program: anchor.Program<TimeLockedWallet>, depositor: anchor.web3.Keypair, owner: anchor.web3.Keypair, amount: number) => Promise<void>;
declare const withdraw: (program: anchor.Program<TimeLockedWallet>, owner: anchor.web3.Keypair) => Promise<void>;

export { deposit, findPda, initialize, withdraw };
