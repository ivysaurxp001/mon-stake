import assert from "assert";
import { 
  TestHelpers,
  Stakemon_RewardClaimed
} from "generated";
const { MockDb, Stakemon } = TestHelpers;

describe("Stakemon contract RewardClaimed event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Stakemon contract RewardClaimed event
  const event = Stakemon.RewardClaimed.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Stakemon_RewardClaimed is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await Stakemon.RewardClaimed.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualStakemonRewardClaimed = mockDbUpdated.entities.Stakemon_RewardClaimed.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedStakemonRewardClaimed: Stakemon_RewardClaimed = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      user: event.params.user,
      amount: event.params.amount,
      timestamp: event.params.timestamp,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualStakemonRewardClaimed, expectedStakemonRewardClaimed, "Actual StakemonRewardClaimed should be the same as the expectedStakemonRewardClaimed");
  });
});
