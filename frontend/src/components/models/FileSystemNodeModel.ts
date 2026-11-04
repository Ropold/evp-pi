export type NodeType = "file" | "directory";

export type FileSystemNodeModel = {
    name: string;
    type: NodeType;
    owner: string;
    group: string;
    /** Rechte inkl. Spezialbits, z. B. 0o2775 */
    mode: number;
    /** Zeitpunkt der letzten Änderung in Millisekunden */
    modified: number;
    content?: string;
    children?: Record<string, FileSystemNodeModel>;
};
