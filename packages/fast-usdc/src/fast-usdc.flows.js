/**
 * @import {Orchestrator, OrchestrationFlow} from '@agoric/orchestration';
 */

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 */
export const makeLocalAccount = async orch => {
  const agoricChain = await orch.getChain('agoric');
  return agoricChain.makeAccount();
};
harden(makeLocalAccount);
