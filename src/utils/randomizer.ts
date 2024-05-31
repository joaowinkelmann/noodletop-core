import { webcrypto } from 'crypto';

export const BASE36 = 'js2gmdoknufxzpwqcb45liy013vra7et968h';
// export const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export class Rand {
    /**
     * Generates a cryptographically secure random integer.
     *
     * @param min - The minimum value (inclusive).
     * @param max - The maximum value (inclusive).
     * @returns An integer between min (inclusive) and max (inclusive).
     */
    static int(min: number = 0, max: number): number {
        return (
            webcrypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1) + min
        );
    }

    /**
     * Rolls dice based on the given dice notation and returns the result.
     *
     * @param diceNotation - The dice notation (e.g. "2d6+3", "d8-3" or "d8") string representing the number and sides of the dice, along with optional modifiers.
     * @param showRolls - A boolean indicating whether to include the individual dice rolls in the result.
     * @param diceLimit - An optional number indicating the maximum number of dice to roll. Defaults to 100.
     * @returns The total result of the dice roll, or a string containing the total and individual rolls if `showRolls` is `true`.
     * @throws If the dice notation is invalid.
     */
    static roll(diceNotation: string, showRolls: boolean, diceLimit: number = 100): string | number {
        // Check if the dice notation is valid
        if (!/^(\d*d\d+)([-+]\d+)*$/.test(diceNotation)) {
            return 'Invalid dice notation';
        }

        const matches = diceNotation.match(/(\d*)d(\d+)([-+]\d+)*/);

        const numDice = parseInt(matches[1], 10) || 1;
        const diceSides = parseInt(matches[2], 10);
        const modifiers = matches[0].match(/[-+]\d+/g) || [];

        const rolls: number[] = [];

        let total = 0;
        for (let i = 0; i < Math.min(numDice, diceLimit); i++) {
            const roll = this.int(1, diceSides);
            rolls.push(roll);
            total += roll;
        }

        // Adjust the total based on the modifiers
        modifiers.forEach((modifier) => {
            const modifierSign = modifier[0];
            const modifierValue = parseInt(modifier.slice(1), 10);

            if (modifierSign === '+') {
                total += modifierValue;
            } else if (modifierSign === '-') {
                total -= Math.abs(modifierValue);
            }
        });

        if (showRolls) {
            return `${total} (${rolls.join(', ')})${modifiers.join('')}`;
        } else {
            return total;
        }
    }

    /**
     * Generates a random alphanumeric ID of a given length.
     *
     * @todo This will break around the year 2059, when the timestamp will be 9 characters long.
     *
     * @param length The length of the ID string. Default is 8. (Collision probability is 1 in 62^length within the same millisecond)
     * @param includeTimestamp Adds a base36 encoded string of milliseconds since epoch at the start of the ID. Default is true.
     * @returns The generated ID string.
     */
    static id(length: number = 8, includeTimestamp: boolean = true): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(this.int(0, charactersLength - 1));
        }
        if (includeTimestamp) {
            let timestampString = Date.now().toString(36); // 8 characters representing the timestamp
            const scrambledBase36 = BASE36.slice(length % 36) + BASE36.slice(0, length % 36);
            timestampString = timestampString.split('').map((char) => {
                const index = BASE36.indexOf(char);
                return scrambledBase36[index];
            }).join('');
            result = timestampString + result;
        }
        return result;
    }

    /**
     * Converts an ID string into a Date object.
     * Assumes that the timestamp takes up 8 characters in the given string.
     * @param id - The ID string to convert.
     * @returns 'Sat Apr 20 2024 10:14:41 GMT-0300 (Brasilia Standard Time)' - A Date object representing the timestamp encoded in the ID.
     */
    static dateFromId(id: string): Date {
        const length = id.length - 8; // retrieve the length from the id, assuming that the timestamp takes up 8 characters in the given string
        let timestampString = id.slice(0, 8); // gets the first 8 characters from the id

        const scrambledBase36 = BASE36.slice(length % 36) + BASE36.slice(0, length % 36);
        timestampString = timestampString.split('').map((char) => {
            const index = scrambledBase36.indexOf(char);
            return BASE36[index];
        }).join('');
        const timestamp = parseInt(timestampString, 36);
        return new Date(timestamp);
    }

    /**
     * Generates a random color in hexadecimal format.
     * @param saturated - A boolean indicating whether the generated color should be more saturated (not grayed out). Default is true.
     * @returns - #FF22BB - String of a color in hexadecimal format.
     */
    static color(saturated: boolean = true): string {
        const rgb = [0, 0, 0];

        if (saturated) {
            // Let's choose between one or two channels and "amp" them up, by keeping their values high
            const numChannels = this.int(1, 2);

            for (let i = 0; i < numChannels; i++) {
                rgb[this.int(0, 2)] = this.int(180, 255);
            }

            // Keeping the remaining channel(s) at a low value, preventing "grayish" colors
            for (let i = 0; i < 3; i++) {
                if (rgb[i] === 0) {
                    rgb[i] = this.int(0, 80);
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                rgb[i] = this.int(0, 255);
            }
        }
        return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
    }
}
