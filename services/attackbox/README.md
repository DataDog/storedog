# Attack Box

This is a container that simulates an adversary attempting to hack the online store.

The script has 3 stages:
1) Malicious SSH configuration
2) Gobuster
3) Hydra

## Deployment

The attack box is configurable via environment variables found in the `.env` file.
- **ATTACK_SSH**: Set to `1` to run the SSH attack script against the discounts container
- **ATTACK_GOBUSTER**: Set to `1` to run the Gobuster tool for crawling directories on the container specified in `ATTACK_HOST`
- **ATTACK_HYDRA**: Set to `1` to run the Hydra tool for brute force login
- **ATTACK_SSH_INTERVAL**: Number of seconds between SSH attack invocations (if ommited, SSH attack will run once)
- **ATTACK_GOBUSTER_INTERVAL**: Number of seconds between GOBUSTER invocations (if ommited, GOBUSTER will run once)
- **ATTACK_HYDRA_INTERVAL**: Number of seconds between HYDRA invocations (if ommited, HYDRA will run once)
- **ATTACK_PORT**: The web port you want to run the attacks against for hydra and dirbuster.
- **ATTACK_HOST**: The web host that hydra and dirbuster will attack. ( Probably frontend or nginx )

For example, if you wanted to run Gobuster every 60 seconds and Hydra ever 90 seconds, your `.env` file would look like this:
```
ATTACK_GOBUSTER=1
ATTACK_GOBUSTER_INTERVAL=60
ATTACK_HYDRA=1
ATTACK_HYDRA_INTERVAL=90
```
## How to start the  attackbox service
1. `cp .env.template .env`
2. Set the attack config variables as explained above
3. Run `docker compose --profile attackbox up `