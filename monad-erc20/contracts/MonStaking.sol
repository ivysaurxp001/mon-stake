// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonStaking
 * @notice Simple staking contract for MON tokens with rewards
 * @dev Allows users to stake MON, earn 10% APY, and unstake after lock period
 */
contract MonStaking {
    // Staking info per user
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public stakingTime;
    
    // Constants
    uint256 public constant REWARD_RATE = 10; // 10% APY
    uint256 public constant MIN_STAKE = 0.1 ether; // 0.1 MON minimum
    uint256 public constant LOCK_PERIOD = 7 days;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    /**
     * @notice Stake MON tokens
     * @dev Calculates pending rewards before adding new stake
     */
    function stake() external payable {
        require(msg.value >= MIN_STAKE, "Min stake is 0.1 MON");
        
        // Calculate pending rewards before adding new stake
        if (stakes[msg.sender] > 0) {
            _calculateRewards(msg.sender);
        }
        
        stakes[msg.sender] += msg.value;
        stakingTime[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Unstake tokens and claim all rewards
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        require(block.timestamp >= stakingTime[msg.sender] + LOCK_PERIOD, "Still locked");
        
        _calculateRewards(msg.sender);
        
        stakes[msg.sender] -= amount;
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        
        uint256 totalAmount = amount + reward;
        
        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount, reward, block.timestamp);
    }
    
    /**
     * @notice Claim rewards without unstaking
     */
    function claimRewards() external {
        _calculateRewards(msg.sender);
        
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards");
        
        rewards[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }
    
    /**
     * @notice Calculate and update rewards for a user
     * @param user User address
     */
    function _calculateRewards(address user) internal {
        if (stakes[user] == 0) return;
        
        uint256 timeElapsed = block.timestamp - stakingTime[user];
        uint256 reward = (stakes[user] * REWARD_RATE * timeElapsed) / (365 days * 100);
        rewards[user] += reward;
        stakingTime[user] = block.timestamp;
    }
    
    /**
     * @notice Get staking info for a user
     * @param user User address
     * @return stakedAmount Amount currently staked
     * @return pendingRewards Pending rewards including unclaimed
     * @return lockEndsAt Timestamp when lock period ends
     * @return canUnstake Whether user can unstake now
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 lockEndsAt,
        bool canUnstake
    ) {
        stakedAmount = stakes[user];
        
        // Calculate pending rewards
        if (stakedAmount > 0) {
            uint256 timeElapsed = block.timestamp - stakingTime[user];
            pendingRewards = rewards[user] + (stakedAmount * REWARD_RATE * timeElapsed) / (365 days * 100);
        } else {
            pendingRewards = rewards[user];
        }
        
        lockEndsAt = stakingTime[user] + LOCK_PERIOD;
        canUnstake = block.timestamp >= lockEndsAt && stakedAmount > 0;
        
        return (stakedAmount, pendingRewards, lockEndsAt, canUnstake);
    }
    
    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Allow contract to receive ETH/MON
     */
    receive() external payable {}
}

