/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SOLANA_RPC: string
  readonly VITE_APP_BONO_API_URL: string
  readonly VITE_APP_BONO_NETWORK: 'mainnet' | 'testnet' | 'devnet'
  readonly VITE_APP_HIGH_TABLE_PROGRAM_ID: string
  readonly VITE_APP_CAMPAIGN_PROGRAM_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}