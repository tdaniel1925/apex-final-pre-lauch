# Update Pulse Product Price IDs in Vercel

## The Problem
Production has OLD TEST mode price IDs. They need to be replaced with LIVE mode price IDs.

## Manual Fix (5 minutes)

Go to: https://vercel.com/bot-makers/apex-final-pre-lauch/settings/environment-variables

### Update These 8 Variables:

Click "Edit" on each variable below and replace with the new value:

1. **STRIPE_PULSEMARKET_RETAIL_PRICE_ID**
   - Old: `price_1TGsvC0UcCrfpyRU082s0NcQ`
   - New: `price_1TIClH0s7Jg0EdCpmtyGm6q9`

2. **STRIPE_PULSEMARKET_MEMBER_PRICE_ID**
   - Old: (different old value)
   - New: `price_1TIClI0s7Jg0EdCp8kq6nbox`

3. **STRIPE_PULSEFLOW_RETAIL_PRICE_ID**
   - Old: `price_1TGsvD0UcCrfpyRUX2bUFMqt`
   - New: `price_1TIClI0s7Jg0EdCpVfybCJyT`

4. **STRIPE_PULSEFLOW_MEMBER_PRICE_ID**
   - Old: `price_1TGsvD0UcCrfpyRU3DBAVUeZ`
   - New: `price_1TIClI0s7Jg0EdCpLwhhiZuz`

5. **STRIPE_PULSEDRIVE_RETAIL_PRICE_ID**
   - Old: `price_1THWfV0UcCrfpyRUdNGb7Ynv`
   - New: `price_1TIClJ0s7Jg0EdCpiCqXwgel`

6. **STRIPE_PULSEDRIVE_MEMBER_PRICE_ID**
   - Old: `price_1THWPL0UcCrfpyRUxs4VSi1X`
   - New: `price_1TIClJ0s7Jg0EdCpWY9OpdFh`

7. **STRIPE_PULSECOMMAND_RETAIL_PRICE_ID**
   - Old: `price_1TGsvF0UcCrfpyRURhEQBs6A`
   - New: `price_1TIClJ0s7Jg0EdCpUo41hli0`

8. **STRIPE_PULSECOMMAND_MEMBER_PRICE_ID**
   - Old: `price_1TGtvb0UcCrfpyRUlkSoeHRm`
   - New: `price_1TIClK0s7Jg0EdCpbAoW8JXA`

## After Updating

1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait 2-3 minutes
4. Test all 4 Pulse product purchase buttons

## Quick Copy-Paste for Each Variable

```
price_1TIClH0s7Jg0EdCpmtyGm6q9
price_1TIClI0s7Jg0EdCp8kq6nbox
price_1TIClI0s7Jg0EdCpVfybCJyT
price_1TIClI0s7Jg0EdCpLwhhiZuz
price_1TIClJ0s7Jg0EdCpiCqXwgel
price_1TIClJ0s7Jg0EdCpWY9OpdFh
price_1TIClJ0s7Jg0EdCpUo41hli0
price_1TIClK0s7Jg0EdCpbAoW8JXA
```
