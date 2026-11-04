import type { Command } from "../../models/CommandResultModel.ts";
import { findHost } from "../SessionManager.ts";
import { usageError } from "./CommandHelpers.ts";

export const pingCommand: Command = (args) => {
    let count = 4;
    const operands: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-c") {
            count = Math.min(Math.max(parseInt(args[++i] ?? "4", 10) || 4, 1), 10);
        } else if (/^-c\d+$/.test(args[i])) {
            count = Math.min(parseInt(args[i].slice(2), 10) || 4, 10);
        } else {
            operands.push(args[i]);
        }
    }

    const input = operands[0];
    if (!input) return usageError("ping", "usage error: Destination address required");

    const host = findHost(input);
    if (!host) return { lines: [`ping: ${input}: Name or service not known`] };

    const label = input === host.ip ? host.ip : `${host.name} (${host.ip})`;
    const lines = [`PING ${input} (${host.ip}) 56(84) bytes of data.`];

    for (let seq = 1; seq <= count; seq++) {
        lines.push(
            host.reachable
                ? `64 bytes from ${label}: icmp_seq=${seq} ttl=64 time=${(0.3 + seq * 0.07).toFixed(3)} ms`
                : `From 192.168.0.42 icmp_seq=${seq} Destination Host Unreachable`,
        );
    }

    const received = host.reachable ? count : 0;
    const loss = host.reachable ? 0 : 100;
    lines.push(
        "",
        `--- ${input} ping statistics ---`,
        `${count} packets transmitted, ${received} received, ${loss}% packet loss, time ${(count - 1) * 1001}ms`,
    );
    return { lines };
};
