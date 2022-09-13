ASTROPORT-DCA-BOT
===

Prerequisites
---

- node v18 

```
npm i
npm run build

cp .env.example .env
```

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