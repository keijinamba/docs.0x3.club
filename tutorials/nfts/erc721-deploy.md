---
description: このチュートリアルでは、ERC721のスマートコントラクトを実装しEthereum（Goerli）上にデプロイしNFTを発行する練習をします。
---

# ERC721コントラクトのデプロイとNFT発行

## 前提知識

* Javascript
* MetaMaskウォレット

## 紹介事項

- Ethereum: イーサリアムの仕組み
- Solidity: イーサリアムのスマートコントラクトで使用する言語
- Dapps: イーサリアムのスマートコントラクトで動かすアプリケーション
- IPFS: 分散型ストレージ
- Hardhat: Solidityの開発ツール（コンパイル、デプロイ）
- MetaMask Javascript API: MetaMaskのEthereum API

## 環境構築

```bash
% yarn init
yarn init v1.22.11
question name (docs.0x3.club): docs.0x3.club
question version (1.0.0): 
question description: 
question entry point (index.js): 
question repository url (https://github.com/keijinamba/docs.0x3.club.git): 
question author: Keiji Namba
question license (MIT): 
question private: 
success Saved package.json
✨  Done in 41.50s.
```