ASTROPORT-DCA-BOT
===

Prerequisites
---

- node v18 

1. `npm i`
2. `npm run build`
3. `cp .env.example .env`
4. 
    **Provide MNEMONIC environment variable** in the .env file. 

    The address of this mnemonic will pay fees for gas if used for dca purchases. This account is also used for all commands modifying DCA contract state.

Examples
---

```
creates a new dca order, initial 1000 uluna, with target axlUSDC, interval 60 seconds and dca amount 10 uluna

npm run bot -- create-order -i 1000 uluna -t ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4 -n 60 -a 10
```

```
adds 1000 uluna for bot tip fees

npm run bot -- add-bot-tip -a 10000 uluna
```

```
starts bot

npm run bot -- start
```