export type GroupModel = {
    name: string;
    gid: number;
    /** Weitere Mitglieder (nicht die, für die es die Primärgruppe ist) */
    members: string[];
};
