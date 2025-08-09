## migration has been a problem i might as well write an article who cares!!

### pnpm run migration:generate src/migrations/CreatedTagsAndUserTable

- this enables one to create a migration by passing the src/migrations/{nameOfMigrationMade}

  **"migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts"**
  - this script above is written in package json so it means generate migrations providing where to find datasource. ts also a migrations need a file where to save the migrations so you need to provide it when running the migration (refer to line 3 above)

### "db:drop": "typeorm-ts-node-commonjs schema:drop -d src/data-source.ts",

- to run this one easy no passing where to save the changes it justs delete the schema (everything in the db) **pnpm run db:drop**

## To run the migrations you need the migration:run so :

**"migration:run": "typeorm-ts-node-commonjs migration:run -d src/data-source.ts"**

## pnpm run migration:run

- the _typeorm-ts-node-commonjs_ - this runs the data-source.ts
- the _-d src/datasource.ts_ -where the datasource file is
