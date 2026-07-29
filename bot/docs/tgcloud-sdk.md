# tgcloud SDK reference

Everything your bot's modules can import from `sdk`: the database (`db`), the
Telegram Bot API (`api`), HTTP (`fetch`), and `console` logging. The database is
the largest surface, so it comes first; `api`, `fetch`, and `console` are at the
end.

> Orientation and project rules live in [../AGENTS.md](../AGENTS.md). This file is
> the API reference.

## `sdk` at a glance

```js
import { db, api, fetch, BotApiError } from 'sdk'
// or from submodules:
import { table, integer, text, eq, sql } from 'sdk/db'
import { api } from 'sdk/api'
import { fetch } from 'sdk/fetch'
```

- **`db`** — SQLite query builder + schema DSL. → most of this file.
- **`api`** — Telegram Bot API (`api.sendMessage(...)`). → *Telegram Bot API* below.
- **`fetch`** — outbound HTTP. → *HTTP* below.
- **`console`** — logging that surfaces in `npx tgcloud run` output. → *Logging* below.

## Rules that bite

The runtime is not stock Node — these defaults don't hold. Detail is in the
sections below; project rules are in [../AGENTS.md](../AGENTS.md).

- **Import by bare module name** — `from 'schema'`, `from 'lib/cart'`, `from 'sdk/db'`. Never a relative path or a `.js` extension.
- **Every DB call is async — always `await`.** `.all()`/`.get()`/`.values()`/`.run()`, `db.$count()`, and raw `db.run/all/get` all return Promises. A forgotten `await` returns the builder, not rows.
- **No foreign keys.** `.references()` and table-level `foreignKey()` **throw when declared** — a schema using them won't deploy. Enforce integrity in app code.
- **Drops happen only via `.deprecated('reason')`** on a column/table/index. Deleting the declaration does *not* drop it; type changes are manual (`db.run(...)`).
- **A handler's `export default (input, ctx)`** gets the update's *payload* as `input` — `handlers/message` receives the `Message` (i.e. `update.message`), `handlers/callback_query` the `CallbackQuery`. The full `Update` (with `update_id`) is `ctx.update`.

# Database (`db`)

## Importing

`db` (the default export of `sdk/db`) holds the whole API; the same functions are
also named exports.

```js
import { table, integer, text, eq, sql } from 'sdk/db'   // named imports
import db, { sql } from 'sdk/db'                          // or namespace + names
```

Import your own modules by **bare name** — `from 'schema'`, `from 'lib/cart'` —
never a relative path or `.js` extension.

## Defining the schema (`schema.js`)

Tables are **named exports**. `table()` builds a descriptor at runtime (no DB call);
the platform discovers the exported tables and runs migrations when you deploy
`schema.js`.

```js
import { table, integer, text, boolean, json, index, check, sql } from 'sdk/db'

export const users = table('users', {
  id:      integer('id').primaryKey({ autoIncrement: true }),
  tgId:    integer('tg_id').unique(),
  name:    text('name').notNull(),
  lang:    text('lang').default('en'),
  isAdmin: boolean('is_admin').default(false),
  prefs:   json('prefs'),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  createdIdx: index('idx_users_created').on(t.created),
}))

export const todos = table('todos', {
  id:     integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),   // logical link to users.id — FKs are NOT enforced
  text:   text('text').notNull(),
  done:     boolean('done').default(false),
  priority: integer('priority').default(0),
}, (t) => ({
  userDoneIdx:   index('idx_todos_user_done').on(t.userId, t.done),
  priorityCheck: check('priority_check', sql`${t.priority} >= 0`),
}))
```

The third argument to `table()` is a callback `(t) => ({...})` where `t` exposes the
columns (`t.userId` → a column ref); declare indexes and table-level constraints there.

## Column types

| factory     | SQLite | notes                                          |
|-------------|--------|------------------------------------------------|
| `text()`    | TEXT   |                                                |
| `integer()` | INTEGER|                                                |
| `real()`    | REAL   | alias `float()`                                |
| `numeric()` | NUMERIC|                                                |
| `blob()`    | BLOB   | takes/returns `Uint8Array`                     |
| `boolean()` | INTEGER| stored 0/1, read as `true`/`false`             |
| `json()`    | TEXT   | auto `JSON.stringify` / `JSON.parse`           |

Signature: `integer(name?, opts?)`. The name is optional — if omitted it's taken
from the JS key. `opts.mode` sets runtime conversion:

| mode           | stored as          | JS value              |
|----------------|--------------------|-----------------------|
| `boolean`      | INTEGER 0/1        | `boolean`             |
| `json`         | TEXT (JSON)        | any object/array      |
| `timestamp`    | INTEGER (unix sec) | `Date`                |
| `timestamp_ms` | INTEGER (unix ms)  | `Date`                |
| `bytes`        | BLOB               | `Uint8Array`          |

`boolean()` and `json()` are sugar over `integer(name, { mode: 'boolean' })` and
`text(name, { mode: 'json' })`. A `blob()` column takes and returns a `Uint8Array`
automatically — that's handled at the wire level, so it needs no mode.

## Column modifiers (chainable)

```js
integer('id').primaryKey()
integer('id').primaryKey({ autoIncrement: true })
text('name').notNull()
text('tg').unique()
text('lang').default('en')
integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
text('slug').generatedAlwaysAs(sql`lower(name)`, { mode: 'stored' })  // 'virtual' | 'stored'
text('name').constraint('COLLATE NOCASE')       // arbitrary column-level DDL
text('email').deprecated('replaced by login')   // marks for drop; invisible at runtime
```

- `.default()` on a `json()` column encodes the value automatically; a `` sql`...` ``
  default is passed through verbatim.
- `.deprecated()` is terminal — don't chain methods after it.

## No foreign keys

The runtime runs with `PRAGMA foreign_keys` **off**, so a declared FK would be
silently inert (no cascades, no orphan protection). To make that impossible,
`.references()` and table-level `foreignKey()` **throw when declared** — a schema
using them won't deploy. `REFERENCES`/`FOREIGN KEY` smuggled in via `.constraint()`
or a raw `db.run('CREATE TABLE …')` stay inert too. Enforce integrity in app code:
delete children before parents, insert parents before children, sweep orphans with
`LEFT JOIN … WHERE parent.id IS NULL`.

## Table-level constraints & indexes (in the callback)

```js
table('t', { ... }, (t) => ({
  pk:    primaryKey({ columns: [t.a, t.b] }),
  uq:    unique('uq_email').on(t.email),
  chk:   check('chk_done', sql`${t.done} in (0, 1)`),
  idx:   index('idx_name').on(t.col),
  uidx:  uniqueIndex('uidx_email').on(t.email),
  lower: index('idx_lower').on(sql`lower(${t.email})`),          // expression index
  active:index('idx_active').on(t.userId).where(sql`done = 0`),  // partial index
  // foreignKey(...) is NOT supported — it throws (see "No foreign keys")
}))
```

Table modifiers (chained after `table(...)`): `.strict()`, `.withoutRowid()`,
`.constraint('CHECK (x > 0)', 'chk_x')`, `.deprecated('reason')`.

## Query builder

### select

`select(projection?)` → `.from(table)` → builder. No projection = `SELECT *`.

```js
await db.select().from(todos).all()                          // all rows
await db.select().from(todos).where(eq(todos.id, 1)).get()   // first row or null
await db.$count(todos)                                        // COUNT(*)

await db.select().from(todos)
  .where(and(eq(todos.userId, uid), eq(todos.done, false)))
  .orderBy(desc(todos.priority), asc(todos.id))
  .limit(10).offset(20)
  .all()

// projection: { alias: colRef | sqlExpr }
await db.select({ id: todos.id, title: todos.text, n: sql`count(*)` })
  .from(todos).groupBy(todos.userId).having(sql`count(*) > ${1}`).all()
```

Chain: `.where()` `.orderBy()` `.limit()` `.offset()` `.groupBy()` `.having()`
`.distinct()`; terminals `.all()` / `.get()` / `.values()`.

The builder is **awaitable** — `await db.select().from(todos)` (with `.where(…)`
etc. as needed) runs `.all()` and resolves to the row array, so `.all()` is
optional. Use `.get()`/`.values()` for the other shapes; count rows with
`db.$count(table, where?)`.

### insert / update / delete

```js
await db.insert(todos).values({ userId: 1, text: 'Buy milk' }).run()
await db.insert(todos).values([{ text: 'A' }, { text: 'B' }]).run()   // batch
await db.insert(todos).values({ text: 'X' }).returning().run()        // RETURNING *

await db.insert(users).values({ tgId: 42, name: 'Ann' })
  .onConflictDoNothing({ target: users.tgId }).run()
await db.insert(users).values({ tgId: 42, name: 'Ann' })
  .onConflictDoUpdate({ target: users.tgId, set: { name: 'Ann' } }).run()

await db.update(todos).set({ done: true }).where(eq(todos.id, 1)).run()   // .set() required
await db.delete(todos).where(eq(todos.id, 1)).run()
```

A plain insert/update/delete resolves to `[]` — there's no insert id or row count.
Add `.returning()` (→ `RETURNING *`) or `.returning({ id: todos.id })` to get the
affected rows back (converted, since they're bound to the table). Like select,
these builders are **awaitable**: `await db.insert(todos).values({ … })` runs
without an explicit `.run()`.

### Raw SQL — `db.run` / `db.all` / `db.get`

Mode is by method, not auto-detected: `run` = write/exec, `all` = all rows,
`get`/`one` = first row (or `null`). Each takes a `` sql`…` `` object or a
`(queryString, params)` pair.

```js
await db.run('UPDATE todos SET done = 1 WHERE id = :id', { ':id': 5 })
await db.all(sql`SELECT * FROM todos WHERE done = ${false}`)
await db.get(sql`SELECT count(*) AS c FROM todos`)
```

> Raw methods are **not bound to a table**, so rows come back without mode
> conversion (boolean/json/timestamp arrive as 0/1, a JSON string, unix seconds).
> Only the table-bound builder converts.

`db.raw.read(sql, params)` / `db.raw.write(sql, params)` are the low-level escape
hatch (params default `{}`); prefer `run`/`all`/`get` above.

## `sql` tagged template

`` sql`...` `` interpolates values as named parameters, column refs as identifiers,
and splices nested `sql`.

```js
sql`count = ${n}`                 // count = :p1
sql`${todos.priority} > ${min}`   // priority > :p2  (column as identifier)
sql`WHERE ${cond}`                // nested sql spliced in
sql.raw('datetime("now")')        // literal, no parameters
```

In DDL contexts (DEFAULT / CHECK / GENERATED) parameters don't work — use literal SQL.

## Operators

Import from `sdk/db`:

```js
import {
  eq, ne, gt, gte, lt, lte,
  like, notLike,
  isNull, isNotNull, and, or, not,
  between, notBetween, inArray, notInArray,
  count, sum, avg, min, max,
  asc, desc,
} from 'sdk/db'
```

`.where(e1, e2)` with multiple args is equivalent to `and(e1, e2)`.

## Migrations (summary)

- **Adding** columns/tables/indexes — applied automatically on `npx tgcloud migrate`
  after you deploy `schema.js`.
- **Dropping** — only via `.deprecated()`; the CLI shows what will be removed.
- **Changing a column's type** — not automatic; do it manually with `db.run`.

`npx tgcloud push` reports pending DB changes but never applies them. Run
`npx tgcloud migrate` to apply.

# Telegram Bot API (`api`)

`import { api, BotApiError } from 'sdk'`. Call any Bot API method as
`api.<method>(params)` — a Proxy dispatches the name, so every current (and
future) method works with no SDK update.

```js
const me = await api.getMe()                          // → the unwrapped `result`
await api.sendMessage({ chat_id: id, text: 'Hello!' })
await api.editMessageText({ chat_id, message_id, text: 'Updated' })
await api.answerCallbackQuery({ callback_query_id, text: 'Done' })
```

- **The envelope is unwrapped.** On `{ ok: true }` the call resolves to `result`
  directly — no `.ok`/`.result` wrapper. Params are one object using the Bot API's
  snake_case names (`chat_id`, `message_id`, …).
- **Failures throw `BotApiError`.** On `{ ok: false }` it throws; the error carries
  `.code` (Bot API `error_code` — 400/403/429/…), `.description`, `.method`, and
  `.parameters` (e.g. `retry_after` on 429, `migrate_to_chat_id`). Catch and inspect
  `.code` to handle an expected failure:

```js
try {
  await api.deleteMessage({ chat_id, message_id });
} catch (e) {
  if (e.code !== 400) throw e;   // 400 = already gone; anything else is a real error
}
```

# HTTP (`fetch`)

`import { fetch } from 'sdk'`. A `fetch`-like client for outbound HTTP.

```js
const res = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});
if (!res.ok) throw new Error(res.statusText);
const data = await res.json();
```

The response: `res.status`, `res.statusText`, `res.ok` (true for 200–299),
`res.url`, `res.headers` (`.get()` / `.has()` / `.keys()` / `.entries()`), and body
readers `await res.json()` / `await res.text()`. Or stream:
`for await (const chunk of res.body)`.

Body helpers set the matching `Content-Type` for you:

```js
await fetch(url, { method: 'POST', body: fetch.body.json({ a: 1 }) }); // application/json
await fetch(url, { method: 'POST', body: fetch.body.form({ a: 1 }) }); // x-www-form-urlencoded
await fetch(url, { method: 'POST', body: fetch.body.text('hi') });     // text/plain
```

Notes: a body can be read **once** — a second `.json()`/`.text()`/stream throws
`TypeError: body used already` (check `res.bodyUsed`). Redirects are followed
automatically (web-parity) — `res.url` is the final URL after any hops. A 404 (or
any HTTP status) resolves normally with `res.ok === false`; only real network
errors (bad host, invalid URL) reject.

# Logging (`console`)

Plain `console` works, and its output shows up in `npx tgcloud run`:

```js
console.log('processing', { chatId: id });  // log / debug — plain
console.info('started');                     // info  — blue
console.warn('rate limited');                // warn  — yellow
console.error(err);                          // error — red, includes a stack
```

Each line is tagged with its `[file:line]`. `console.error` and `console.trace`
append a full stack trace; `console.warn` does not.
