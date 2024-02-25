import crypto from "crypto";
export class Rand {
	// Function to generate a random number between a minimum and maximum value using crypto.getRandomValues
	static int(min: number = 0, max: number): number {
		return (
			(crypto.getRandomValues(new Uint32Array(1))[0] % (max - min)) + min
		);
	}

	// Function to generate a random dice roll from a string of dice notation (e.g. "2d6+3" or "d8")
	static roll(diceNotation: string, showRolls: boolean): number | string {
		// Check if the dice notation is valid
		if (!/^\d*d\d+(\+|-)?\d*$/.test(diceNotation)) {
			return "Invalid dice notation";
		}

		// if a string like 'd6' is passed, change it to '1d6'
		if (diceNotation.startsWith("d")) {
			diceNotation = "1" + diceNotation;
		}

		const [numDice, diceSides, modifier] = diceNotation
			.split(/[d+]/)
			.map(Number);
		const rolls: number[] = [];

		let total = 0;
		const actualNumDice = isNaN(numDice) ? 1 : numDice; // Treat 'd6' as '1d6'
		for (let i = 0; i < actualNumDice; i++) {
			const roll = this.int(1, diceSides + 1);
			rolls.push(roll);
			total += roll;
		}

		// Adjust the total based on the modifier
		if (modifier !== undefined) {
			if (diceNotation.includes("+")) {
				total += modifier;
			} else if (diceNotation.includes("-")) {
				total -= Math.abs(modifier);
			}
		}
		if (showRolls) {
			return `${total} (${rolls.join(", ")})`;
		} else {
			return total;
		}
	}

	// Function to generate a random alphanumeric ID of a given length
	static id(len: number = 8): string {
		let result = "";
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength = characters.length;
		for (let i = 0; i < len; i++) {
			result += characters.charAt(this.int(0, charactersLength));
		}
		return result;
	}
}
