import crypto from "crypto";
export class Rand {
	// Function to generate a random number between a minimum and maximum value using crypto.getRandomValues
	static int(min: number = 0, max: number): number {
		return (
			(crypto.getRandomValues(new Uint32Array(1))[0] % (max - min)) + min
		);
	}

	// Function to generate a random dice roll from a string of dice notation (e.g. "2d6+3", "d8-3" or "d8")
	static roll(diceNotation: string, showRolls: boolean): number | string {
		// Check if the dice notation is valid
		if (!/^(\d*d\d+)([-+]\d+)*$/.test(diceNotation)) {
			return "Invalid dice notation";
		}

		const matches = diceNotation.match(/(\d*)d(\d+)([-+]\d+)*/);

		const numDice = parseInt(matches[1]) || 1;
		const diceSides = parseInt(matches[2]);
		const modifiers = matches[0].match(/[-+]\d+/g) || [];
	  
		const rolls: number[] = [];

		let total = 0;
		for (let i = 0; i < numDice; i++) {
			const roll = this.int(1, diceSides + 1);
			rolls.push(roll);
			total += roll;
		}

		// Adjust the total based on the modifiers
		modifiers.forEach((modifier) => {
			const modifierSign = modifier[0];
			const modifierValue = parseInt(modifier.slice(1));

			if (modifierSign === "+") {
				total += modifierValue;
			} else if (modifierSign === "-") {
				total -= Math.abs(modifierValue);
			}
		});

		if (showRolls) {
			return `${total} (${rolls.join(", ")})${modifiers.join("")}`;
		} else {
			return total;
		}
	}
	
	// Function to generate a random alphanumeric ID of a given length
	static id(length: number = 8, includeTimestamp: boolean = true): string {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		if (includeTimestamp) {
			let timestampString = Date.now().toString(36); // 8 characters
			result = timestampString + result;
		}
		return result;
	}

	// returns a string like "2024-12-31T23:59:59.999Z" from a 8 character timestamp using id() above (e.g. "lu6affyf")
	static dateFromId(id: string): string {
		let timestampString = id.slice(0, 8); // gets the first 8 characters from the id
		let timestamp = parseInt(timestampString, 36);
		return new Date(timestamp).toISOString();
	}
}
