import { describe, it, expect } from "vitest";
import {
    migrationDirection,
    migrate,
    MigrationDirection,
} from "./migrate";
import { AccountV1, AccountV2 } from "./storage";
import { MIGRATIONS_SCHEMA } from "./migrations";

describe("migrationDirection", () => {
    it("should return MigrationDirection.up if fromVersion is less than toVersion", () => {
        const fromVersion = "1";
        const toVersion = "2";
        const expected: MigrationDirection = MigrationDirection.up;

        const actual = migrationDirection(fromVersion, toVersion);
        expect(actual).toEqual(expected);
    });

    it("should return MigrationDirection.same if fromVersion is equal to toVersion", () => {
        const fromVersion = "1";
        const toVersion = "1";
        const expected = MigrationDirection.same;

        const actual = migrationDirection(fromVersion, toVersion);
        expect(actual).toEqual(expected);
    });

      it("should return MigrationDirection.down if fromVersion is greater than toVersion", () => {
        const fromVersion = "2";
        const toVersion = "1";
        const expected = MigrationDirection.down;
        const actual = migrationDirection(fromVersion, toVersion);
        expect(actual).toEqual(expected);
      });
});

describe("migrate", () => {
    it("should return the same schema if fromVersion is equal to toVersion", () => {
        const fromVersion = "1";
        const schema: AccountV1 = {
            id: "test",
            label: "label",
            uri: "uri",
            issuer: "issuer",
            icon: "icon",
            color: "error",
        };

        const toVersion = "1";
        const expected = schema;

        const actual = migrate(MIGRATIONS_SCHEMA, schema, fromVersion, toVersion);
        expect(actual).toEqual(expected);
    });

    it("should migrate the schema to the latest version if toVersion is greater than fromVersion", () => {
        const fromVersion = "1";
        const accounts: AccountV1[] = [
            {
                id: "test1",
                label: "label",
                uri: "uri",
                issuer: "issuer",

                icon: "comment",
                color: "error",
            },
            {
                id: "test2",
                label: "label",
                uri: "uri",
                issuer: "issuer",

                icon: "discord",
                color: "warning",
            },
            // all the other colors
            {
                id: "test3",
                label: "label",
                uri: "uri",
                icon: ".net",
                color: "success",
            },
        ];
        const toVersion = "2";
        const expected: AccountV2[] = [
            {
                id: "test1",
                label: "label",
                uri: "uri",
                issuer: "issuer",

                icon: "comment",
                color: "#d32f2f",
                order: -1,
            },
            {
                id: "test2",
                label: "label",
                uri: "uri",
                issuer: "issuer",

                icon: 'discord',
                color: "#ed6c02",
                order: -1,
            },
            {
                id: "test3",
                label: "label",
                uri: "uri",
                icon: "dotnet",
                color: "#2e7d32",
                order: -1,
            },
        ];

        accounts.forEach((account, i) => {
            const actual = migrate(MIGRATIONS_SCHEMA, account, fromVersion, toVersion);
            expect(actual).toEqual(expected[i]);
        });
    });
});
