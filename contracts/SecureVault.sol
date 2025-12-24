// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuthManager {
    function verifyAndConsume(address v, address r, uint256 a, bytes32 n, bytes calldata s) external returns (bool);
}

contract SecureVault {
    IAuthManager public immutable authManager;
    
    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    constructor(address _authManager) {
        authManager = IAuthManager(_authManager);
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(
        address payable recipient,
        uint256 amount,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(address(this).balance >= amount, "Insufficient balance");

        // Request authorization validation from Manager
        bool isValid = authManager.verifyAndConsume(
            address(this),
            recipient,
            amount,
            nonce,
            signature
        );
        require(isValid, "Unauthorized");

        // Execute withdrawal
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(recipient, amount);
    }
}