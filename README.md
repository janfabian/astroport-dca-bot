ASTROPORT-DCA-BOT
===

[![asciicast](https://asciinema.org/a/520769.svg)](https://asciinema.org/a/520769)

Prerequisites
---

- node v18 

Installation
---

1. `npm i`
2. `npm run build`
3. `cp .env.example .env`
4. 
    **Provide MNEMONIC environment variable** in the .env file. 

    The address of this mnemonic will pay fees for gas if used for dca purchases. This account is also used for all commands modifying DCA contract state.

Usage
---

```
npm run bot help
```

Examples
---

```
# creates a new dca order, initial 1000 uluna, with target axlUSDC, interval 60 seconds and dca amount 10 uluna

npm run bot -- create-order -i 1000 uluna -t ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4 -n 60 -a 10
```

```
# adds address where orders are already created before

npm run bot -- add-address terra1zefg0es5vn8cee4px0xkmpa3l57raqj25vcfjx
```

```
# adds 1000 uluna for bot tip fees

npm run bot -- add-bot-tip -a 10000 uluna
```

```
# starts bot watching for addresses added via `add-address` or `create-dca-order` command

npm run bot -- start
```