import { webcrypto } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const BASE62 = '0123456789abcdefghijklm_opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE62_PAD = 'n';

const assetsDir = path.join(__dirname, '../assets/');
const adjectives = fs.readFileSync(path.join(assetsDir, 'english-adjectives.txt'), 'utf8').split('\n');
const colors = fs.readFileSync(path.join(assetsDir, 'english-colors.txt'), 'utf8').split('\n');
const nouns = fs.readFileSync(path.join(assetsDir, 'english-nouns.txt'), 'utf8').split('\n');

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
     * Generates a random boolean value.
     * @returns A random boolean value.
     */
    static bool(): boolean {
        return this.int(0, 1) === 1;
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
        // @todo - Check if this regex test is necessary, given we're also checking in 'matches'
        if (!/^(\d*d\d+)([-+]\d+)*$/.test(diceNotation)) {
            return '{"err": "Invalid dice notation"}'
        }

        const matches = diceNotation.match(/(\d*)d(\d+)([-+]\d+)*/);
        if (!matches) {
            return '{"err": "Invalid dice notation"}'
        }

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
     * @param length The length of the ID string. Default is 8. (Collision probability is 1 in 62^length within the same nanosecond, assuming includeTimestamp is true.)
     * @param includeTimestamp Adds a base62 encoded string of unix miliseconds + (micro + nanoseconds) since epoch at the start of the ID. Default is true. Adds 14 characters to the ID.
     *     The miliseconds are unix epoch time, and the nanoseconds are relative to the current Node.js process.
     * @returns The generated ID string.
     */
    static id(length: number = 8, includeTimestamp: boolean = true): string {
        let id = '';
        if (includeTimestamp) {
            const timestamp = Date.now();
            const timestampNano = parseInt(String(process.hrtime()[1]).slice(-6)); // micro and nanoseconds in the same millisecond
            const paddedTimestamp = this.toBase62(timestamp, 10) + this.toBase62(timestampNano, 4);
            // console.log(`Timestamp: ${timestamp}\nNano: ${timestampNano}`)
            // console.log(`Base62 timestamp: ${this.toBase62(timestamp, 10)}\nBase62 timestampNano: ${this.toBase62(timestampNano, 4)}\nBase62 padded: ${paddedTimestamp}`)
            id += paddedTimestamp;
        }
        while (id.length < length + (includeTimestamp ? 14 : 0)) { // account for 14 chars if timestamp is included
            id += this.toBase62(this.int(0, 61), 1);
        }
        return id;
    }

    /**
     * Converts an ID string into a Date object.
     * Assumes that the timestamp takes up 10 characters in the given string.
     * @param id - The ID string to convert.
     * @param getNano - A boolean indicating whether to include the nanoseconds in the output. Default is false.
     * @returns 'Sat Apr 20 2024 10:14:41 GMT-0300 (Brasilia Standard Time)' - A Date object representing the timestamp encoded in the ID.
     */
    static dateFromId(id: string, getNano: boolean = false): Date | string {
        const timestampBase62 = id.slice(0, 10); // we're now using 10 chars to store the timestamp
        const timestamp = this.fromBase62(timestampBase62);
        if (getNano) {
            // get the 4 characters after the timestamp (encoded micro + nanoseconds)
            const nanotimeBase62 = id.slice(10, 14);
            const nanotime = this.fromBase62(nanotimeBase62);
            return new Date(timestamp).toISOString() + ' Nanotime:' + nanotime.toString();
        }
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

    /**
     * Converts a number to a base62 string.
     * 
     * @param value - The number or bigint to convert.
     * @param minLength - The minimum length of the resulting base62 string. Defaults to 0.
     *     Uses the constant BASE62_PAD to pad the string.
     * @returns The base62 string representation of the input value.
     */
    static toBase62(value: number | bigint, minLength: number = 0): string {
        let num: bigint;
        let result: string = '';

        // convert to integer
        num = BigInt(value);

        // convert to base62
        while (num > 0) {
            result = BASE62[Number(num % 62n)] + result;
            num = num / 62n;
        }

        // padding
        while (result.length < minLength) {
            result = BASE62_PAD + result;
        }
        return result;
    }

    static fromBase62(base62: string): number {
        // Remove the padding characters
        const trimmedBase62 = base62.replace(new RegExp(`^${BASE62_PAD}+`), '');

        return trimmedBase62.split('').reverse().reduce((acc, char, index) => {
          return acc + BASE62.indexOf(char) * Math.pow(62, index);
        }, 0);
    }

    /**
     * Generates a random name based on the specified pattern.
     * 
     * @param chunks The number of chunks to include in the name. Default is 3.
     * @param separator The separator to use between chunks. Default is '-'.
     * @param camelcase Indicates whether to use camel case for the name. Default is false.
     * @param pattern The pattern to generate the name. If not provided, a random pattern will be used.
     *                'a' -> adjective || 'c' -> color || 'n' -> noun.
     * 
     * @returns The generated random name.
     * 
     * @throws Error if an invalid pattern character is provided.
     */
    static getName(chunks: number = 3, separator: string = '-', camelcase: boolean = false, pattern?: string): string {
        let name = '';
        let wordsArray: string[] = [];
        
        // Generate a random pattern if no pattern was provided
        if (pattern === undefined) {
            pattern = '';
            const possibleChars = ['a', 'c', 'n'];
            while (pattern.length < chunks) {
                const randomIndex = this.int(0, possibleChars.length - 1);
                pattern += possibleChars[randomIndex];
            }
        }
        
        // Generate words based on pattern
        for (const char of pattern) {
            switch (char) {
                case 'a':
                    wordsArray.push(adjectives[this.int(0, adjectives.length - 1)]);
                    break;
                case 'c':
                    wordsArray.push(colors[this.int(0, colors.length - 1)]);
                    break;
                case 'n':
                    wordsArray.push(nouns[this.int(0, nouns.length - 1)]);
                    break;
                default:
                    throw new Error('Invalid pattern character');
            }
        }
        // Ensure only the required number of chunks are used
        wordsArray = wordsArray.slice(0, chunks);
    
        if (camelcase) {
            name = wordsArray[0];
            // get the words after the first and capitalize the first letter
            for (let i = 1; i < wordsArray.length; i++) {
                name += wordsArray[i][0].toUpperCase() + wordsArray[i].slice(1);
            }
        } else {
            name = wordsArray.join(separator);
        }
    
        return name;
    }
}

// go over the files ending in .txt, and remove elements that are over 10 characters long. then, rewrite the files
// files.forEach(file => {
//     if (file.endsWith('.txt')) {
//         const filePath = path.join(assetsDir, file);
//         let words = fs.readFileSync(filePath, 'utf8').split('\n');
//         words = words.filter(word => word.length <= 8);
//         fs.writeFileSync(filePath, words.join('\n'));
//     }
// });

// // // now, order the words by length
// files.forEach(file => {
//     if (file.endsWith('.txt')) {
//         const filePath = path.join(assetsDir, file);
//         let words = fs.readFileSync(filePath, 'utf8').split('\n');
//         words = words.sort((a, b) => a.length - b.length);
//         fs.writeFileSync(filePath, words.join('\n'));
//     }
// });