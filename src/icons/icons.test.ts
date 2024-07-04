import { describe, expect, test } from "vitest";
import { titleToIconSlug } from "./icons.ts";

describe("titleToIconSlug", () => {
    const url =
        "https://raw.githubusercontent.com/simple-icons/simple-icons/master/slugs.md";

    test("should convert all titles to slugs", async () => {
        // Load convert table from simpleicons
        const response = await fetch(url);
        expect(response).toHaveProperty("ok", true)
        
        const text = await response.text();
        const table = text
            .split("\n")
            .filter((line) => line.includes("|"))
            .map((line) => line.split("|").map((cell) => cell.trim().replace(/`/gi, '')))
            .map(line => line.filter(cell => cell.length > 0))
            // skip header of table
            .slice(2);

        // more than 2000 icons at @v11
        expect(table.length).toBeGreaterThan(2000)

        table.forEach(([brandName, brandSlug], i) => {
            // Skip duplicate values
            if (i-1 >= 0 && table[i-1][0] == brandName) return;
            
            expect(titleToIconSlug(brandName)).toBe(brandSlug);
        });
    });
});
