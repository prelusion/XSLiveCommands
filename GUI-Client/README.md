????????????

---

Some day this will have a proper description... For now just a development explanation :)

---

# Development

## Installation

When developing install dependencies using (Node 16.11.1 was used): 

```
yarn install
```

## Active development

For seeing a local development, first run the below command to build and watch for file changes

```
yarn build:dev:watch
```

Then the final command to run electron itself:

```
yarn start
```

## Building installer

To build the installer, run:

```
yarn electron:build
```

This will place the installer in the `dist_electron` folder.
