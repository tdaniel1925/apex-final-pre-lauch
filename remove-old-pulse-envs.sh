#!/bin/bash
printf "y\n" | vercel env rm STRIPE_PULSEMARKET_MEMBER_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSEFLOW_RETAIL_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSEFLOW_MEMBER_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSEDRIVE_RETAIL_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSEDRIVE_MEMBER_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSECOMMAND_RETAIL_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSECOMMAND_MEMBER_PRICE_ID production
printf "y\n" | vercel env rm STRIPE_PULSEMARKET_RETAIL_PRICE_ID production
