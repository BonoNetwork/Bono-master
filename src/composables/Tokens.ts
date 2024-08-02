export interface Token {
  mintAddress: string;
  decimals: number;
  name: string;
  addValueButtons: Array<{ amount: number, usd: number, title: string }>
}

export const kSupportedTokens: Array<Token> = [
  {
    mintAddress: 'SOL',
    decimals: 9,
    name: 'SOL',
    addValueButtons: [
      {
        amount: 0.05,
        usd: 10,
        title: "+0.05 SOL"
      },
      {
        amount: 0.5,
        usd: 100,
        title: "+0.5 SOL"
      },
      {
        amount: 1,
        usd: 200,
        title: "+1 SOL"
      }
    ]
  },
  {
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    name: 'USDC',
    addValueButtons: [
      {
        amount: 5,
        usd: 5,
        title: "+5 USDC"
      },
      {
        amount: 25,
        usd: 25,
        title: "+25 USDC"
      },
      {
        amount: 50,
        usd: 50,
        title: "+50 USDC"
      }
    ]
  },
  {
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    name: 'BONK',
    addValueButtons: [
      {
        amount: 200000,
        usd: 5,
        title: "+200k BONK"
      },
      {
        amount: 1000000,
        usd: 25,
        title: "+1M BONK"
      },
      {
        amount: 2000000,
        usd: 50,
        title: "+2M BONK"
      }
    ]
  },
  {
    mintAddress: 'FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds',
    decimals: 9,
    name: 'FORGE',
    addValueButtons: [
      {
        amount: 100,
        usd: 4,
        title: "+100 FORGE"
      },
      {
        amount: 250,
        usd: 10,
        title: "+250 FORGE"
      },
      {
        amount: 1000,
        usd: 40,
        title: "+1k FORGE"
      }
    ]
  },

];
export const getTokenByAddress = (address: string): Token | undefined => {
  return kSupportedTokens.find(token => token.mintAddress === address);
}

export const getTokenByName = (name: string): Token | undefined => {
  return kSupportedTokens.find(token => token.name === name);
}