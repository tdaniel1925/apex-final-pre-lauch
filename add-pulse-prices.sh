#!/bin/bash
echo "price_1TIClH0s7Jg0EdCpmtyGm6q9" | tr -d '\n\r' | vercel env add STRIPE_PULSEMARKET_RETAIL_PRICE_ID production
echo "price_1TIClI0s7Jg0EdCp8kq6nbox" | tr -d '\n\r' | vercel env add STRIPE_PULSEMARKET_MEMBER_PRICE_ID production
echo "price_1TIClI0s7Jg0EdCpVfybCJyT" | tr -d '\n\r' | vercel env add STRIPE_PULSEFLOW_RETAIL_PRICE_ID production
echo "price_1TIClI0s7Jg0EdCpLwhhiZuz" | tr -d '\n\r' | vercel env add STRIPE_PULSEFLOW_MEMBER_PRICE_ID production
echo "price_1TIClJ0s7Jg0EdCpiCqXwgel" | tr -d '\n\r' | vercel env add STRIPE_PULSEDRIVE_RETAIL_PRICE_ID production
echo "price_1TIClJ0s7Jg0EdCpWY9OpdFh" | tr -d '\n\r' | vercel env add STRIPE_PULSEDRIVE_MEMBER_PRICE_ID production
echo "price_1TIClJ0s7Jg0EdCpUo41hli0" | tr -d '\n\r' | vercel env add STRIPE_PULSECOMMAND_RETAIL_PRICE_ID production
echo "price_1TIClK0s7Jg0EdCpbAoW8JXA" | tr -d '\n\r' | vercel env add STRIPE_PULSECOMMAND_MEMBER_PRICE_ID production
