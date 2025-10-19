/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Stakemon,
  Stakemon_RewardClaimed,
  Stakemon_Staked,
  Stakemon_Unstaked,
} from "generated";

Stakemon.RewardClaimed.handler(async ({ event, context }) => {
  const entity: Stakemon_RewardClaimed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
    timestamp: event.params.timestamp,
  };

  context.Stakemon_RewardClaimed.set(entity);
});

Stakemon.Staked.handler(async ({ event, context }) => {
  const entity: Stakemon_Staked = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
    timestamp: event.params.timestamp,
  };

  context.Stakemon_Staked.set(entity);
});

Stakemon.Unstaked.handler(async ({ event, context }) => {
  const entity: Stakemon_Unstaked = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
    reward: event.params.reward,
    timestamp: event.params.timestamp,
  };

  context.Stakemon_Unstaked.set(entity);
});
