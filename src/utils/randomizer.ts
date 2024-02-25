export class Rand {
	// Function to generate a random number between a minimum and maximum value using crypto.getRandomValues
	static int(min: number = 0, max: number): number {
		return (
			(crypto.getRandomValues(new Uint32Array(1))[0] % (max - min)) + min
		);
	}

	// Function to generate a random dice roll from a string of dice notation (e.g. "2d6+3")
	static roll(diceNotation: string): number {
		// check if the dice notation is valid
		if (!/^\d+d\d+(\+|-)?\d+$/.test(diceNotation)) {
			throw new Error("Invalid dice notation");
		}

		const [numDice, diceSides, modifier] = diceNotation
			.split(/[d+]/)
			.map(Number);
		let total = 0;
		for (let i = 0; i < numDice; i++) {
			total += this.int(1, diceSides);
		}

		// Adjust the total based on the modifier
		if (diceNotation.includes("+")) {
			total += modifier;
		} else if (diceNotation.includes("-")) {
			total -= Math.abs(modifier);
		}

		return total;
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
