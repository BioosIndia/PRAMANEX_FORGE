import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import {workerCycle} from '../lib/runtime-repository';

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, async () => {
      const url = new URL(request.url);
      const trustedUserId = request.headers.get('oai-authenticated-user-id');
      const eligible = request.method === 'POST' && url.pathname === '/api/runtime' && Boolean(trustedUserId);
      const copy = eligible ? request.clone() : null;
      const response = await handler.fetch(request, env, ctx);
      if (copy && response.ok) {
        const committed = response.clone();
        ctx.waitUntil((async () => {
          const input = await copy.json() as any;
          if (['enqueue','control'].includes(input.action)) {
            // Derive the workspace from the successful authorized server result;
            // control requests need only a workflow ID and may omit workspaceId.
            const result = await committed.json() as any;
            const workspaceId = result.workflow?.workspaceId;
            if (typeof workspaceId !== 'string') return;
            // Bounded event-triggered draining persists each leased step. A wait,
            // HOLD, future retry or absent ready task stops without a browser loop.
            for (let cycle=0;cycle<4;cycle++) {
              const work = await workerCycle({workspaceId,userId:trustedUserId!,limit:3});
              if (!work.processed) break;
            }
          }
        })().catch(() => { console.error('forge_background_cycle_held'); }));
      }
      return response;
    });
  },
  scheduled(_event: ScheduledController, _env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(workerCycle({limit:8}).catch(() => {console.error('forge_scheduled_cycle_held');}));
  },
};
