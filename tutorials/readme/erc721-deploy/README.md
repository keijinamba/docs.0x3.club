---
description: このチュートリアルでは、ERC721のスマートコントラクトを実装しEthereum（Goerli）上にデプロイしNFTを発行する練習をします。
---

# ERC721コントラクトの実装とデプロイ

## 前提知識

* Javascript
* MetaMaskウォレット

## 紹介事項

* Ethereum: イーサリアムの仕組み
* Solidity: イーサリアムのスマートコントラクトで使用する言語
* Dapps: イーサリアムのスマートコントラクトで動かすアプリケーション
* IPFS: 分散型ストレージ
* Hardhat: Solidityの開発ツール（コンパイル、デプロイ）
* MetaMask Javascript API: MetaMaskのEthereum API

## 環境構築

{% code title="terminal" %}
```shell
% node -v
v16.6.1
```
{% endcode %}

{% code title="terminal" %}
```shell
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
{% endcode %}

### Hardhatのインストール

<figure><img src="../../../.gitbook/assets/96893278-ebc67580-1460-11eb-9530-d5df3a3d65d0.png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
**Hardhatとは？**

Hardhatとは、Ethereumソフトウェアをコンパイル、デプロイ、テスト、およびデバッグするための開発環境です。

[https://hardhat.org/](https://hardhat.org/)
{% endhint %}

Hardhatをインストールしていきます。

{% code title="terminal" %}
```shell
% yarn add -D hardhat
```
{% endcode %}

{% hint style="warning" %}
nodeのバージョンが違うと以下のエラーが出ます。

<mark style="color:red;">hardhat@2.12.6: The engine "node" is incompatible with this module. Expected version "^14.0.0 || ^16.0.0 || ^18.0.0". Got "19.4.0"</mark>
{% endhint %}

### Hardhatプロジェクトの初期化

Hardhatを初期化します。今回は、yarnのプロジェクトルートから一段下のサブディレクトリにHardhatのプロジェクトを入れていくので、`Hardhat project root: · /XXX/YYY/hardhat` の部分で/hardhatを追加してます。

{% code title="terminal" %}
```shell
% npx hardhat

888    888                      888 888               888
888    888                      888 888               888
888    888                      888 888               888
8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
888    888 .d888888 888    888  888 888  888 .d888888 888
888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888

👷 Welcome to Hardhat v2.12.6 👷‍

✔ What do you want to do? · Create a JavaScript project
✔ Hardhat project root: · /XXX/YYY/hardhat
✔ Do you want to add a .gitignore? (Y/n) · y
✔ Do you want to install this sample project's dependencies with yarn (XXX YYY)? (Y/n) · y

✨ Project created ✨
```
{% endcode %}

Hardhatプロジェクトが正常に初期化されたかを確認するために、以下のコマンドを打ちます。

{% code title="terminal" %}
```
% npx hardhat --config hardhat/hardhat.config.js test
Downloading compiler 0.8.17
Compiled 1 Solidity file successfully


  Lock
    Deployment
      ✔ Should set the right unlockTime (778ms)
      ✔ Should set the right owner
      ✔ Should receive and store the funds to lock
      ✔ Should fail if the unlockTime is not in the future
    Withdrawals
      Validations
        ✔ Should revert with the right error if called too soon
        ✔ Should revert with the right error if called from another account
        ✔ Shouldn't fail if the unlockTime has arrived and the owner calls it
      Events
        ✔ Should emit an event on withdrawals
      Transfers
        ✔ Should transfer the funds to the owner


  9 passing (960ms)
```
{% endcode %}

今後 `harthat test` と `hardhat compile` コマンドは多用するので、yarnのコマンドとして打てるようにしておきます。

{% code title="package.json" %}
```json
{
  "scripts": {
    "test": "npx hardhat --config hardhat/hardhat.config.js test",
    "compile": "npx hardhat --config hardhat/hardhat.config.js compile"
  },
}
```
{% endcode %}

ここまででhardhatの環境構築は完了です。次に、ERC721スマートコントラクトをSolidityを使って実装する際に便利なOpenzeppelinというライブラリをインストールしていきます。

### Openzeppelinのインストール

{% hint style="info" %}
**Openzeppelinとは？**

「OpenZeppelin」は、Solidityの再利用可能で安全なスマートコントラクトのオープンフレームワークです。

[https://www.openzeppelin.com/](https://www.openzeppelin.com/)
{% endhint %}

Openzeppelinをインストールしていきます。

{% code title="terminal" %}
```shell
% yarn add -D @openzeppelin/contracts
```
{% endcode %}

さて、ここまで出来れば開発環境の構築は完了です。実際にSolidityでERC721スマートコントラクトを書いていきましょう。

<figure><img src="../../../.gitbook/assets/hackathon_transparent.png" alt=""><figcaption></figcaption></figure>

## ERC721スマートコントラクトを実装

{% hint style="info" %}
**ERCとは**

ERCとは「Ethereum Request for Comments」の略で、トークン規格のようなコントラクトの実装を含むアプリケーションレベルでの標準規格です。
{% endhint %}

アプリケーションレベルでコントラクト実装を標準化するERCにはいくつかの規格が存在します。

#### **ERC20：**FT**（**Fungible Token**）を実現するための規格**

最も有名なERC規格です。

標準規格ということは、このERC20を継承したトークンは他のトークンと完全に同じ機能（関数）を有するので、ERC20トークン対応のウォレット（MetaMaskなど）一つでこれら全てのトークンを扱うことができます。

ERC20トークンのように、同種で量が同じであればその価値も同じとなる、通貨と同様のトークンのことをFT（Fungible Token：代替可能トークン）といいます。

#### ERC721：NFT（Non Fungible Token）を実現するための規格

ERC20が同種のトークンであれば同じ価値を持ち互換性があるのに対して、この規格のトークンは一つ一つがユニークで、同じコントラクトの他のトークンと異なる価値を持つことができます。

NFTは`tokenId`というユニークなIDを持つので、イーサリアム上でコントラクトアドレスと`tokenId`のペアはグローバルに一意となります。

### Solidityを実装

以下の場所にNFT用のコントラクトを実装していきます。

```
./hardhat/contracts/SimpleNFT.sol
```

<pre class="language-solidity" data-title="SimpleNFT.sol"><code class="lang-solidity">// SPDX-License-Identifier: MIT
<strong>pragma solidity ^0.8.17;
</strong>
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("SimpleNFT", "SN") {}

    function mintNFT(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
</code></pre>

では、このコードの中身を上から説明していきます。

### pragma

コンパイラのバージョン指定を行います。`pragma solidity ^0.8.17`となっていれば**0.8.17**以上**0.9**未満のコンパイラで正常にコンパイル出来ることを示しています。

### contract

Solidityにおいて`contract`句で宣言されるContractが基本の構成要素であり、スマートコントラクトは、この`contract`句に処理を記述していくことで実装されます。

オブジェクト指向言語でいうところのClassにあたる概念で、インスタンス変数のような内部に状態を保持する変数と、それらの状態を変更したり機能を実行するためのメソッドがあります。

### using A for B

Bの型に対してlibaray Aで定義された全てのメソッドを使用できるように継承させます。

例えば、以下のようにCountableライブラリにadd関数を定義した上で、MyContract内で`using Countable for uint`を書けば、add3メソッド内でuint型であるnumberに対してaddメソッドを使用できるようになります。

```solidity
library Countable {
    function add(uint self , uint b) public pure returns(uint){
        return self + b;
    }
}

contract MyContract {
    using Countable for uint;
    
    function add3(uint number) returns (uint) {
        return number.add(3);
    }
}
```

なので、`using Counters for Counters.Counter`ではCountersコントラクト内に定義されているstruct型であるCounterにCountersコントラクトに定義されてある`increment()`などのメソッドを使えるように継承させています。

<details>

<summary>@openzeppelin/contracts/utils/Counters.sol</summary>

[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol)

```solidity
library Counters {
    struct Counter {
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}
```

</details>

### constructor() Parent("abc", 10) {}

コントラクトの継承元である親コントラクトのコンストラクタに引数を渡しながら実行する方法です。

ここでは、継承している`ERC721URIStorage`のさらに親クラスである`ERC721`コントラクトのコンストラクタを実行しています。

{% code title="ERC721.sol" %}
```solidity
contract ERC721 is Context, ERC165, IERC721, IERC721Metadata {
    // ...
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }
    
    // ...
}
```
{% endcode %}

nameとsymbolはトークンを表す名前と記号になります。通貨で言うと、nameが「United States dollar」でsymbolが「USD」にあたるような形です。

<details>

<summary>@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol</summary>

[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol)

```solidity
abstract contract ERC721URIStorage is ERC721 {
    using Strings for uint256;

    mapping(uint256 => string) private _tokenURIs;

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }

        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
    }
}
```

</details>

### address型

ウォレットやコントラクトを表す16進数で40桁の数値です。16進数の1桁を表すのに4bit（2^4）必要なので、address型は`40桁 x 4bit = 160bit = 20byte`となります。

アドレス型は広義的には同じである2つの種類があります。

> * `address`: 20バイトの値 (Ethereumアドレスの大きさ)です。
> * `address payable`: `address` と同じですが、追加のメンバ `transfer` と `send` が使えます。

この特徴が意味するのは、`address payable` にはEtherを送ることができますが、ただの `address` にはできません。

### memoryとstorage

**storage**

ブロックチェーン上に永久に格納される変数。ブロックチェーン上のすべてのノードで保存されるのでガス代が高くなる

**memory**

コントラクト実行時のみ保持される変数。コストがかからない。

### OwnableとonlyOwner

Ownableはコントラクトのアクセスに制限を与えるコントラクトになります。

`onlyOwner`を使うことでそのメソッドがコントラクト作成者しか実行できなくなります。

<details>

<summary>@openzeppelin/contracts/access/Ownable.sol</summary>

[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol)

```solidity
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
```

</details>

### mintNFTメソッド内の処理

```solidity
_tokenIds.increment();
```

トークンのIDを最後使用された値から+1します。

```solidity
uint256 newItemId = _tokenIds.current();
```

\+1された現在のIDをnewItemIdとしてローカル変数に保持しておきます。

```solidity
_mint(recipient, newItemId);
```

ERC721コントラクトの\_mintメソッドを実行します。recipientのウォレットに対して新しく発行したトークンを送付します。

{% embed url="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/785f65183c3ca6826cb0d4c160f65f4f92e33460/contracts/token/ERC721/ERC721.sol#L264-L286" %}

```solidity
_setTokenURI(newItemId, tokenURI);
```

ERC721URIStorageコントラクトの\_setTokenURIメソッドを実行します。NFTのメタデータを格納したファイルのURLをトークンに紐づけて保存します。

{% embed url="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/785f65183c3ca6826cb0d4c160f65f4f92e33460/contracts/token/ERC721/extensions/ERC721URIStorage.sol#L45-L48" %}

では実際にこのコントラクトをコンパイルして、MetaMask経由でNFTを発行してみましょう。

<figure><img src="../../../.gitbook/assets/core.png" alt=""><figcaption></figcaption></figure>

## Solidityをデプロイ

### hardhatの設定

まず、hardhatでデプロイ用のスクリプトを実行する際に便利なライブラリをインストールします。

```shell
% yarn add -D @nomiclabs/hardhat-ethers dotenv
```

そして、`/hardhat/hardhat.config.js`ファイルを以下のように変更します。

{% code title="hardhat.config.js" %}
```javascript
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
```
{% endcode %}

ここで、プロジェクトのルートディレクトリに.envファイルを追加し、API\_URLとPRIVATE\_KEYを定義しておきます。

{% code title=".env" %}
```properties
API_URL=https://goerli.infura.io/v3/XXXXXXXXX
PRIVATE_KEY=XXXXXXXXX
```
{% endcode %}

#### InfuraからWeb3 API URLを取得

今回はWeb3 APIとしてInfuraを使用します。Alchemyなどでも同様に無料で登録して試せます。

<figure><img src="../../../.gitbook/assets/app.infura.io_dashboard_ethereum.png" alt=""><figcaption></figcaption></figure>

#### MetaMaskウォレットの秘密鍵

MetaMaskの「アカウントの詳細 > 秘密鍵のエクスポート」からウォレットの秘密鍵を取得できます。

<div>

<figure><img src="../../../.gitbook/assets/スクリーンショット 2023-01-15 6.43.52.png" alt=""><figcaption></figcaption></figure>

 

<figure><img src="../../../.gitbook/assets/スクリーンショット 2023-01-15 6.45.38.png" alt=""><figcaption></figcaption></figure>

</div>

### デプロイ用のスクリプトを記述

`/hardhat/scripts/deploy.js`にデプロイ用のスクリプトを記述していきます。

{% code title="deploy.js" %}
```javascript
async function main() {
  const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
  const contract = await SimpleNFT.deploy();
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });¥
```
{% endcode %}

### デプロイコマンドを実行

次にデプロイ用のコマンドをpackage.jsonに追加します。

{% code title="package.json" %}
```json
{
    "scripts": {
        "deploy": "npx hardhat --config hardhat/hardhat.config.js run hardhat/scripts/deploy.js --network goerli"
    }
}
```
{% endcode %}

では実際にdeployコマンドでスクリプトを実行してNFTコントラクトをGoerli上にデプロイしましょう。

```shell
% yarn deploy
yarn run v1.22.11
$ npx hardhat --config hardhat/hardhat.config.js run hardhat/scripts/deploy.js
Contract deployed to address: 0xd232B0121686304A46a80F1a87Ca2a245b54D873
✨  Done in 4.71s.
```

この<mark style="color:purple;">**`0xd232B0121686304A46a80F1a87Ca2a245b54D873`**</mark>と書かれた値が作成されたコントラクトのアドレスになります。こちらは後ほどフロント実装時にも使用するのでメモしておきましょう。

### Etherscanで確認

{% embed url="https://goerli.etherscan.io/" %}

デプロイしたコントラクトはEtherscan上で確認できます。検索窓に先ほど作成したコントラクトのアドレスを入力しエンターを押します。

「Contract Creation」と書かれたトランザクションが表示されていればデプロイが完了しています。

<figure><img src="../../../.gitbook/assets/goerli.etherscan.io_address_0xd232B0121686304A46a80F1a87Ca2a245b54D873(iPad Air).png" alt=""><figcaption></figcaption></figure>

## Next

{% content-ref url="../nftnomintosaitowo.md" %}
[nftnomintosaitowo.md](../nftnomintosaitowo.md)
{% endcontent-ref %}
