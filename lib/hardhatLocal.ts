// lib/chains.ts
import { Chain } from 'wagmi';

export const PolygonFork: Chain = {
  id: 137,
  name: 'Hardhat Polygon Fork',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['http://172.21.80.1:8545/'] },
    default: { http: ['http://172.21.80.1:8545/'] },
  },
  blockExplorers: {
    default: { name: 'Hardhat Explorer', url: 'http://172.21.80.1:8545/' }, // Placeholder URL
  },
};
export const hardhat: Chain = {
  id: 1337,
  name: 'hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545/'] },
    default: { http: ['http://127.0.0.1:8545/'] },
  },
  blockExplorers: {
    default: { name: 'Hardhat Explorer', url: 'http://127.0.0.1:8545/' }, // Placeholder URL
  },
};

export const polygonAmoy: Chain = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://rpc-mumbai.polygon.technology/'] },
    default: { http: ['https://rpc-mumbai.polygon.technology/'] },
  },
  blockExplorers: {
    default: { name: 'mumbai Testnet', url: 'https://mumbai.polygonscan.com/' }, // Placeholder URL
  },
};

// export const polygon: Chain = {
//   id: 137,
//   name: 'Polygon',
//   network: 'polygon',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Matic',
//     symbol: 'MATIC',
//   },
//   rpcUrls: {
//     public: { http: ['https://polygon-rpc.com'] },
//     default: { http: ['https://polygon-rpc.com'] },
//   },
//   blockExplorers: {
//     default: { name: 'Polygonscan', url: 'https://polygonscan.com' },
//   },
// };
