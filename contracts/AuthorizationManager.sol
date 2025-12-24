// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract AuthorizationManager {
    using ECDSA for bytes32;

    address public immutable authorizedSigner;
    mapping(bytes32 => bool) public consumedAuthorizations;

    event AuthorizationConsumed(bytes32 indexed authHash, address indexed recipient);

    constructor(address _signer) {
        require(_signer != address(0), "Invalid signer");
        authorizedSigner = _signer;
    }

    function verifyAndConsume(
        address vault,
        address recipient,
        uint256 amount,
        bytes32 nonce,
        bytes calldata signature
    ) external returns (bool) {
        // Deterministic message construction
        bytes32 authHash = keccak256(abi.encode(
            block.chainid,
            vault,
            recipient,
            amount,
            nonce
        ));

        require(!consumedAuthorizations[authHash], "Authorization already used");

        // Verify cryptographic signature
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(authHash);
        address recovered = ethHash.recover(signature);
        require(recovered == authorizedSigner, "Invalid signature");

        // Mark as consumed to prevent reuse
        consumedAuthorizations[authHash] = true;
        
        emit AuthorizationConsumed(authHash, recipient);
        return true;
    }
}