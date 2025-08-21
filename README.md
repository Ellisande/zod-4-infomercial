## Dependencies

You'll need bun:

```sh
curl -fsSL https://bun.sh/install | bash
```

Then you'll need to install the project dependencies:

```sh
bun install
```

## Running the app

To run:

```sh
bun run dev
```

open http://localhost:3000

## Using Bruno

Starting at step-2-friendly-errors the code base contains a [Bruno](https://usebruno.com) repository that contains sample endpoint requests. Import it into bruno using the following steps:

- Download and install Bruno
- Run the app
- Click the three dots in the upper left
- Select `open collection`
- Select the `/bruno/zod-4-zero-hero` directory

And you are all set to go!

## Steps

This repo is broken down into a series of steps showing a progression of using Zod along the way. Here is a list of the branches and the functionality that they add

### step-0

This is the starting point for a `refund` API. There is no input validation here yet, just some plain TypeScript types and minimal endpoint config.

### step-1-refund-schemas

In this branch we start to introduce Zod. Changes include:

- Convert straight JS types to Zod schemas
- Use Zod to parse user input
- Extract business logic out of the endpoint handler

### step-2-friendly-errors

In this branch we are focused on using Zod to create helpful API errors that out end user can understand. Changes include:

- Use `.safeParse` to detect and react gracefully to failed validations

### step-3-custom-refine

In this branch we refine out schema with both standard refines as well as some custom rules. Changes include:

- Make a reusable schema for UUIDs
- Add a minimum to refund amounts
- Add a really cool custom validation to refund reason

### step-4-amount-transforms

In this branch we change our schema for refund amounts. Highlights include:

- Support two different input types for amount
- Gracefully convert to the new amount schema
- Extend the schema to handle output serialization

### step-5-redacting-middleware

This is the final step where we dive into schema meta-programming using Zod 4's metadata registries. Highlights include:

- Addition of a sensitive bank account fields
- Creation of a redacted schema registry
- Middleware factory for redacting information from sensitive schemas
