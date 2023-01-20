---
description: コントラクトで使用したSolidityの解説です。
---

# Solidity解説

## コントラクトコード

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
