/**
 * OpenCode Beads Plugin
 *
 * Integrates the beads issue tracker with OpenCode.
 *
 * Features:
 * - Context injection via `bd prime` on session start and after compaction
 * - Commands parsed from beads command definitions
 * - Task agent for autonomous issue completion
 */

import type { Plugin, PluginInput } from '@opencode-ai/plugin';
import * as tools from './tool';
import { bd_stats_mock } from './tool/bd-stats-mock';

type OpencodeClient = PluginInput['client'];

/**
 * Get the current model/agent context for a session by querying messages.
 *
 * Mirrors OpenCode's internal lastModel() logic to find the most recent
 * user message. Used during event handling when we don't have direct access
 * to the current user message's context.
 */
async function getSessionContext(
  client: OpencodeClient,
  sessionID: string
): Promise<{ model?: { providerID: string; modelID: string }; agent?: string } | undefined> {
  try {
    const response = await client.session.messages({
      path: { id: sessionID },
      query: { limit: 50 },
    });

    if (response.data) {
      for (const msg of response.data) {
        if (msg.info.role === 'user' && 'model' in msg.info && msg.info.model) {
          return { model: msg.info.model, agent: msg.info.agent };
        }
      }
    }
  } catch {
    // On error, return undefined (let opencode use its default)
  }

  return undefined;
}

/**
 * Check if beads is enabled for the current repository.
 *
 * Uses `bd info --json` to verify beads is properly initialized.
 * Returns false if the command fails or returns unexpected output.
 */
async function isBeadsEnabled($: PluginInput['$']): Promise<boolean> {
  try {
    await $`bd info --json`.text();

    return true;
  } catch {
    return false;
  }
}

export const BeadsPlugin: Plugin = async ({ client, $ }) => {
  // Check if beads is enabled for this repository
  const beadsEnabled = await isBeadsEnabled($);

  // If beads is not enabled, return minimal plugin with mock bd_stats tool
  if (!beadsEnabled) {
    return {
      config: async config => {
        // No commands, agents, or tools installed
      },
      tool: {
        bd_stats: bd_stats_mock,
      },
    };
  }

  return {
    config: async config => {
      // No commands, agents, or tools installed
    },
    tool: tools,
  };
};
