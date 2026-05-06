import type { AiChatResponseBody } from "@/types";

type ProposalEnvelopeEvent = Extract<
    AiChatResponseBody,
    { kind: "proposal"; proposalKind: "event" }
>;
type ProposalEnvelopeTask = Extract<
    AiChatResponseBody,
    { kind: "proposal"; proposalKind: "task" }
>;

export type ProposalStatus = "pending" | "added" | "cancelled";

export type ChatProposalItem =
    | {
          kind: "proposal";
          proposalKind: "event";
          data: ProposalEnvelopeEvent["data"];
          status: ProposalStatus;
      }
    | {
          kind: "proposal";
          proposalKind: "task";
          data: ProposalEnvelopeTask["data"];
          status: ProposalStatus;
      };

export type ChatItem =
    | { kind: "user"; text: string }
    | { kind: "assistant"; text: string }
    | { kind: "thinking" }
    | { kind: "error"; text: string }
    | ChatProposalItem;
