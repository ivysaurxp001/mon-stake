// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonStaking
 * @dev Simple staking contract for MON tokens
 * @author Your Name
 * 
 * Features:
 * - Stake MON (native token)
 * - Earn 10% APY rewards
 * - 7-day lock period
 * - Compound rewards automatically
 * - Claim rewards anytime
 */
contract MonStaking {
    // ========== STATE VARIABLES ==========
    
    /// @notice Mapping of user address to their staked amount
    mapping(address => uint256) public stakes;
    
    /// @notice Mapping of user address to their accumulated rewards
    mapping(address => uint256) public rewards;
    
    /// @notice Mapping of user address to their staking timestamp
    mapping(address => uint256) public stakingTime;
    
    /// @notice Annual Percentage Yield (10%)
    uint256 public constant REWARD_RATE = 10;
    
    /// @notice Minimum stake amount (1 MON)
    uint256 public constant MIN_STAKE = 1 ether;
    
    /// @notice Lock period (7 days)
    uint256 public constant LOCK_PERIOD = 7 days;
    
    /// @notice Total staked across all users
    uint256 public totalStaked;
    
    /// @notice Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    // ========== EVENTS ==========
    
    /// @notice Emitted when a user stakes MON
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when a user unstakes MON
    event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    
    /// @notice Emitted when a user claims rewards
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    // ========== ERRORS ==========
    
    error InsufficientStakeAmount();
    error InsufficientBalance();
    error StillLocked();
    error NoRewards();
    error TransferFailed();
    
    // ========== EXTERNAL FUNCTIONS ==========
    
    /**
     * @notice Stake MON tokens
     * @dev Must send at least MIN_STAKE (1 MON)
     */
    function stake() external payable {
        if (msg.value < MIN_STAKE) revert InsufficientStakeAmount();
        
        // Calculate and add pending rewards before adding new stake
        if (stakes[msg.sender] > 0) {
            _calculateRewards(msg.sender);
        }
        
        // Update state
        stakes[msg.sender] += msg.value;
        stakingTime[msg.sender] = block.timestamp;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Unstake MON tokens
     * @param amount Amount to unstake (in wei)
     * @dev Can only unstake after LOCK_PERIOD
     */
    function unstake(uint256 amount) external {
        if (stakes[msg.sender] < amount) revert InsufficientBalance();
        if (block.timestamp < stakingTime[msg.sender] + LOCK_PERIOD) revert StillLocked();
        
        // Calculate rewards
        _calculateRewards(msg.sender);
        
        // Update state
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        
        uint256 totalAmount = amount + reward;
        totalRewardsDistributed += reward;
        
        // Transfer tokens
        (bool success, ) = msg.sender.call{value: totalAmount}("");
        if (!success) revert TransferFailed();
        
        emit Unstaked(msg.sender, amount, reward, block.timestamp);
    }
    
    /**
     * @notice Claim accumulated rewards without unstaking
     * @dev Rewards are sent to the user
     */
    function claimRewards() external {
        _calculateRewards(msg.sender);
        
        uint256 reward = rewards[msg.sender];
        if (reward == 0) revert NoRewards();
        
        rewards[msg.sender] = 0;
        totalRewardsDistributed += reward;
        
        (bool success, ) = msg.sender.call{value: reward}("");
        if (!success) revert TransferFailed();
        
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @notice Calculate pending rewards for a user
     * @param user Address of the user
     * @dev Formula: (stakedAmount * REWARD_RATE * timeElapsed) / (365 days * 100)
     */
    function _calculateRewards(address user) internal {
        if (stakes[user] == 0) return;
        
        uint256 timeElapsed = block.timestamp - stakingTime[user];
        uint256 reward = (stakes[user] * REWARD_RATE * timeElapsed) / (365 days * 100);
        
        rewards[user] += reward;
        stakingTime[user] = block.timestamp;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get comprehensive stake info for a user
     * @param user Address of the user
     * @return stakedAmount Amount currently staked
     * @return pendingRewards Pending rewards (including unclaimed)
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
        
        // Calculate pending rewards (view-only, doesn't update state)
        if (stakedAmount > 0) {
            uint256 timeElapsed = block.timestamp - stakingTime[user];
            uint256 newRewards = (stakedAmount * REWARD_RATE * timeElapsed) / (365 days * 100);
            pendingRewards = rewards[user] + newRewards;
        } else {
            pendingRewards = rewards[user];
        }
        
        lockEndsAt = stakingTime[user] + LOCK_PERIOD;
        canUnstake = block.timestamp >= lockEndsAt && stakedAmount > 0;
        
        return (stakedAmount, pendingRewards, lockEndsAt, canUnstake);
    }
    
    /**
     * @notice Get estimated APY for a user based on their stake
     * @param user Address of the user
     * @return apy Annual Percentage Yield (in basis points, e.g., 1000 = 10%)
     */
    function getAPY(address user) external pure returns (uint256 apy) {
        // For now, APY is constant at 10%
        // Can be dynamic based on total staked, user tier, etc.
        return REWARD_RATE * 100; // 1000 = 10%
    }
    
    /**
     * @notice Get contract statistics
     * @return _totalStaked Total amount staked by all users
     * @return _totalRewards Total rewards distributed
     * @return contractBalance Contract's MON balance
     */
    function getStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewards,
        uint256 contractBalance
    ) {
        return (totalStaked, totalRewardsDistributed, address(this).balance);
    }
    
    // ========== FALLBACK ==========
    
    /// @notice Allow contract to receive MON
    receive() external payable {}
    
    /// @notice Fallback function
    fallback() external payable {}
}

/*
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Compile:
 *    solc --optimize --bin --abi MonStaking.sol
 * 
 * 2. Deploy:
 *    - Network: Monad testnet
 *    - Chain ID: 10143
 *    - RPC: https://rpc.ankr.com/monad_testnet
 * 
 * 3. Verify (optional):
 *    - On Monad explorer
 *    - Upload source code
 * 
 * 4. Test:
 *    - Stake 1 MON
 *    - Wait a bit
 *    - Check pending rewards
 *    - Try to unstake (should fail if locked)
 *    - Wait 7 days
 *    - Unstake (should succeed)
 * 
 * SECURITY NOTES:
 * - Simple implementation for MVP
 * - No reentrancy guard (using checks-effects-interactions pattern)
 * - No pause mechanism
 * - No admin functions
 * - For production, consider adding:
 *   - ReentrancyGuard
 *   - Pausable
 *   - Access Control
 *   - More robust reward calculation
 *   - Emergency withdraw
 */

