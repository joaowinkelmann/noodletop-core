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
	
	
}
