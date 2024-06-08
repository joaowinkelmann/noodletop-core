import { Rand } from '../utils/randomizer';
import { User } from './user';

export type Team = {
    id: string;
    name: string;
    members: User['id'][];
};

export class TeamManager {
    private teams: Map<Team['id'], Team>;

    constructor() {
        this.teams = new Map<string, Team>();
    }

    create(name: string): Team {
        const team: Team = {
            id: Rand.id(1, true),
            name,
            members: []
        };
        this.teams.set(team.id, team);
        return team;
    }

    get(id: Team['id']): Team | null {
        return this.teams.get(id) || null;
    }

    // retruns team id and name from the room
    list(): string {
        return JSON.stringify(Array.from(this.teams.values()).map(({ id, name }) => ({ id, name })));
    }

    /**
     * Adds a user to a team.
     *
     * @param teamId - The ID of the team.
     * @param userId - The ID of the user.
     */
    join(teamId: Team['id'], userId: User['id']): boolean {
        const team = this.teams.get(teamId);
        if (team) {
            team.members.push(userId);
            return true;
        }
        return false;
    }

    /**
     * Removes a user from a team.
     *
     * @param userId - The ID of the user.
     * @param teamId - The ID of the team.
     * @returns true if the user was successfully removed from the team
     */
    leave(teamId: Team['id'], userId: User['id']): boolean {
        const team = this.teams.get(teamId);
        if (team) {
            team.members = team.members.filter((id) => id !== userId);
            return true;
        }
        return false;
    }

    /**
     * Deletes a team from the manager.
     * @param teamId - The ID of the team to delete.
     * @returns A boolean indicating whether the team was successfully deleted.
     */
    delete(teamId: Team['id']): boolean {
        return this.teams.delete(teamId);
    }

    getTeamFromUser(userId: User['id']): Team | undefined {
        return Array.from(this.teams.values()).find((team) => team.members.includes(userId));
    }
}