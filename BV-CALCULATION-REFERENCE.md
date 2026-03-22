# Business Volume (BV) Calculation Reference

**Date**: March 22, 2026
**Status**: FINAL - Ready for Implementation
**Purpose**: Complete BV calculation formulas for all tech products

---

## 📋 EXECUTIVE SUMMARY

**What is BV?**
- **BV (Business Volume)** = Points assigned to each product sale
- **BV represents the actual commission pool** available after all costs
- **BV is used for:**
  1. Personal volume tracking (for rank qualification)
  2. Group volume rollup (for rank qualification)
  3. Calculating actual dollar commissions (seller + overrides)

---

## 🎯 THREE CORE DECISIONS (FINAL)

### Decision 1: BV Based on Actual Price Paid ✅
- Member price sale = Calculate BV from member price
- Retail price sale = Calculate BV from retail price
- **Reason**: Financial accuracy, sustainability, incentivizes retail sales

### Decision 2: BV = Commission Pool AFTER Deductions ✅
- BV calculated AFTER Bonus Pool (3.5%) and Leadership Pool (1.5%) deductions
- BV = actual dollars available for seller commission + override pool
- **Reason**: BV represents real money available for distribution

### Decision 3: Business Center BV = $39 (Exception) ✅
- Business Center gets full subscription price as BV (not commission pool)
- **Reason**: Makes BC valuable for volume/rank qualification despite lower commission pool

---

## 💰 BV CALCULATION FORMULA

### Standard Tech Products (PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook)

```python
def calculate_bv_standard(price):
    """
    Calculate BV for standard tech products.

    Args:
        price: Actual price customer paid (member or retail)

    Returns:
        BV points (rounded to whole number)
    """
    # Step 1: BotMakers takes 30%
    botmakers_fee = price * 0.30
    adjusted_gross = price - botmakers_fee

    # Step 2: Apex takes 30% of adjusted gross
    apex_take = adjusted_gross * 0.30
    remainder = adjusted_gross - apex_take

    # Step 3: Deduct pools
    bonus_pool = remainder * 0.035      # 3.5%
    leadership_pool = remainder * 0.015  # 1.5%

    # Step 4: Commission Pool = BV
    commission_pool = remainder - bonus_pool - leadership_pool

    # Round to whole number
    bv = round(commission_pool)

    return bv

# Alternative one-line formula:
# BV = round(price * 0.70 * 0.70 * 0.95)
# BV = round(price * 0.4606)
```

### Business Center (Fixed Exception)

```python
def calculate_bv_business_center():
    """
    Business Center always returns fixed BV = 39.

    Regardless of commission pool ($18), we assign full
    subscription value as BV for volume qualification.
    """
    return 39
```

---

## 📊 BV TABLE - ALL PRODUCTS

### PulseGuard

| Price Type | Price | BotMakers (30%) | Adj Gross | Apex (30%) | Remainder | Bonus (3.5%) | Leadership (1.5%) | **BV (Commission Pool)** |
|------------|-------|-----------------|-----------|------------|-----------|--------------|-------------------|-------------------------|
| **Member** | $59 | $17.70 | $41.30 | $12.39 | $28.91 | $1.01 | $0.43 | **$27** |
| **Retail** | $79 | $23.70 | $55.30 | $16.59 | $38.71 | $1.35 | $0.58 | **$36** |

### PulseFlow

| Price Type | Price | BotMakers (30%) | Adj Gross | Apex (30%) | Remainder | Bonus (3.5%) | Leadership (1.5%) | **BV (Commission Pool)** |
|------------|-------|-----------------|-----------|------------|-----------|--------------|-------------------|-------------------------|
| **Member** | $129 | $38.70 | $90.30 | $27.09 | $63.21 | $2.21 | $0.95 | **$60** |
| **Retail** | $149 | $44.70 | $104.30 | $31.29 | $73.01 | $2.56 | $1.10 | **$69** |

### PulseDrive

| Price Type | Price | BotMakers (30%) | Adj Gross | Apex (30%) | Remainder | Bonus (3.5%) | Leadership (1.5%) | **BV (Commission Pool)** |
|------------|-------|-----------------|-----------|------------|-----------|--------------|-------------------|-------------------------|
| **Member** | $219 | $65.70 | $153.30 | $45.99 | $107.31 | $3.76 | $1.61 | **$102** |
| **Retail** | $299 | $89.70 | $209.30 | $62.79 | $146.51 | $5.13 | $2.20 | **$139** |

### PulseCommand

| Price Type | Price | BotMakers (30%) | Adj Gross | Apex (30%) | Remainder | Bonus (3.5%) | Leadership (1.5%) | **BV (Commission Pool)** |
|------------|-------|-----------------|-----------|------------|-----------|--------------|-------------------|-------------------------|
| **Member** | $349 | $104.70 | $244.30 | $73.29 | $171.01 | $5.99 | $2.57 | **$162** |
| **Retail** | $499 | $149.70 | $349.30 | $104.79 | $244.51 | $8.56 | $3.67 | **$232** |

### SmartLook

| Price Type | Price | BotMakers (30%) | Adj Gross | Apex (30%) | Remainder | Bonus (3.5%) | Leadership (1.5%) | **BV (Commission Pool)** |
|------------|-------|-----------------|-----------|------------|-----------|--------------|-------------------|-------------------------|
| **Fixed** | $99 | $29.70 | $69.30 | $20.79 | $48.51 | $1.70 | $0.73 | **$46** |

### Business Center (EXCEPTION)

| Price Type | Price | Commission Pool | **BV (Fixed)** | Notes |
|------------|-------|-----------------|----------------|-------|
| **Fixed** | $39 | $18 | **$39** | Exception: BV = full subscription price, not commission pool |

---

## 🔄 HOW BV IS USED

### 1. Personal Volume (for rank qualification)

```python
def calculate_personal_volume(member):
    """
    Personal volume = sum of BV from all personal sales.
    """
    total_bv = 0

    for sale in member.personal_sales_this_month:
        if sale.product == 'business_center':
            total_bv += 39  # Fixed BV
        else:
            # Calculate from actual price paid
            total_bv += calculate_bv_standard(sale.price_paid)

    return total_bv
```

**Example:**
- Rep sells 2 PulseFlow Retail ($149 each) = 69 BV × 2 = 138 BV
- Rep sells 1 Business Center ($39) = 39 BV
- **Total Personal Volume: 177 BV**

### 2. Group Volume (for rank qualification)

```python
def calculate_group_volume(member):
    """
    Group volume = personal volume + all downline volume.
    Includes entire organization (enrollment tree).
    """
    # Start with personal volume
    group_bv = calculate_personal_volume(member)

    # Add all downline volume (recursive)
    for downline_member in get_all_downline(member):
        group_bv += calculate_personal_volume(downline_member)

    return group_bv
```

**Example:**
- Rep personal volume: 177 BV
- Downline member 1: 60 BV
- Downline member 2: 232 BV
- Downline member 3: 39 BV
- **Total Group Volume: 508 BV**

### 3. Commission Calculation (seller + overrides)

**The BV pool is distributed:**
- **60% to Seller** (direct commission)
- **40% to Override Pool** (distributed L1-L5 based on rank)

```python
def calculate_seller_commission(sale):
    """
    Seller gets 60% of the BV pool.
    """
    if sale.product == 'business_center':
        return 10.00  # Fixed $10 for BC seller

    bv_pool = calculate_bv_standard(sale.price_paid)
    seller_commission = bv_pool * 0.60

    return seller_commission
```

**Example: PulseCommand Retail $499**
- BV Pool = $232
- Seller Commission = $232 × 60% = **$139.20**
- Override Pool = $232 × 40% = **$92.80** (distributed to upline)

---

## 📈 RANK QUALIFICATION USING BV

### Tech Rank Requirements (BV-Based)

| Rank | Personal BV/Mo | Group BV/Mo | Downline Rank Req |
|------|----------------|-------------|-------------------|
| Starter | 0 | 0 | None |
| Bronze | 150 | 300 | None |
| Silver | 500 | 1,500 | None |
| Gold | 1,200 | 5,000 | 1 Bronze (sponsored) |
| Platinum | 2,500 | 15,000 | 2 Silvers (sponsored) |
| Ruby | 4,000 | 30,000 | 2 Golds (sponsored) |
| Diamond | 5,000 | 50,000 | 3 Golds OR 2 Plat (sponsored) |
| Crown | 6,000 | 75,000 | 2 Plat + 1 Gold (sponsored) |
| Elite | 8,000 | 120,000 | 3 Plat OR 2 Diamond (sponsored) |

**Example: Gold Rank Qualification**
- Need 1,200 personal BV/month
- Need 5,000 group BV/month
- Need 1 personally sponsored Bronze member

**How to hit 1,200 personal BV:**
- Option 1: Sell 3 PulseCommand Retail ($499) = 232 × 3 = 696 BV + 11 Business Centers = 696 + 429 = **1,125 BV** ❌ (need more)
- Option 2: Sell 5 PulseCommand Retail = 232 × 5 = **1,160 BV** ✅
- Option 3: Sell 4 PulseCommand Retail + 5 PulseFlow Retail = 928 + 345 = **1,273 BV** ✅

---

## 🔢 BV CALCULATION EXAMPLES

### Example 1: New Rep's First Month

**Sales:**
- 1 Business Center (self) = 39 BV
- 2 PulseFlow Member ($129) = 60 × 2 = 120 BV
- 1 PulseGuard Retail ($79) = 36 BV

**Personal Volume:** 39 + 120 + 36 = **195 BV**
**Group Volume:** 195 BV (no downline yet)
**Qualifies for:** Bronze rank (needs 150 personal, 300 group) ❌ Not enough group volume

### Example 2: Growing Team

**Rep's Personal Sales:**
- 5 Business Centers = 39 × 5 = 195 BV
- 10 PulseFlow Retail ($149) = 69 × 10 = 690 BV
- **Personal Volume: 885 BV**

**Downline Sales (3 active reps):**
- Rep A: 300 BV
- Rep B: 450 BV
- Rep C: 3,500 BV
- **Downline Volume: 4,250 BV**

**Total Group Volume:** 885 + 4,250 = **5,135 BV**

**Qualifies for:** Gold rank (needs 1,200 personal ❌, 5,000 group ✅, 1 Bronze sponsored ?)
- **Result**: Need to increase personal volume to 1,200 to qualify

### Example 3: Elite Rank Rep

**Personal Sales:**
- 50 Business Centers = 39 × 50 = 1,950 BV
- 30 PulseCommand Retail ($499) = 232 × 30 = 6,960 BV
- **Personal Volume: 8,910 BV** ✅ (exceeds 8,000 requirement)

**Group Volume:** 145,000 BV ✅ (exceeds 120,000 requirement)
**Personally Sponsored:** 3 Platinums + 2 Diamonds ✅

**Qualifies for:** Elite rank ✅✅✅

---

## 💡 KEY RULES SUMMARY

1. **BV = Actual Commission Pool** (after Bonus/Leadership deductions)
2. **Calculate BV from price paid** (member vs retail = different BV)
3. **Business Center exception** (BV = $39, not $18 commission pool)
4. **Personal Volume** = sum of BV from personal sales
5. **Group Volume** = personal + all downline BV
6. **50 BV minimum** for override qualification (separate from rank requirements)
7. **Rank qualification** uses BV totals (not dollar amounts)
8. **Commission distribution**:
   - Seller: 60% of BV pool
   - Override Pool: 40% of BV pool
   - Business Center: Fixed $10 seller, $8 sponsor

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Database Changes Needed:

```sql
-- Add BV tracking to subscriptions table
ALTER TABLE subscriptions ADD COLUMN bv_value DECIMAL(10,2);

-- Add BV tracking to members table
ALTER TABLE members ADD COLUMN personal_bv_monthly INT DEFAULT 0;
ALTER TABLE members ADD COLUMN group_bv_monthly INT DEFAULT 0;

-- Create BV calculation function
CREATE FUNCTION calculate_bv(product_id TEXT, price_paid DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF product_id = 'business_center' THEN
    RETURN 39;
  ELSE
    -- BV = price * 0.70 * 0.70 * 0.95
    RETURN ROUND(price_paid * 0.4606);
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Code Changes Needed:

1. **Product Configuration** - Add BV calculation to each product
2. **Subscription Creation** - Calculate and store BV when subscription created
3. **Monthly Volume Calculation** - Sum BV for personal/group volume
4. **Rank Evaluation** - Use BV totals (not credit totals)
5. **Commission Calculation** - Pay from BV pool (60/40 split)

---

## 📞 QUESTIONS ANSWERED

### Q1: What if a product price changes?
**A:** BV recalculates automatically based on the actual price paid at time of sale.

### Q2: What if we add a new product?
**A:** Use the standard formula (`price * 0.4606`) unless it's a special fixed-split product like Business Center.

### Q3: Does BV replace the old "credit" system?
**A:** Yes. BV is the new unified system for:
- Volume tracking (personal/group)
- Rank qualification
- Commission calculation

### Q4: What about the 50-credit minimum for overrides?
**A:** Change to **50 BV minimum** for override qualification.

### Q5: Business Center shows 39 BV but only pays $18 in commissions?
**A:** Correct. The extra BV (39 vs 18) helps reps qualify for ranks without costing more in commissions. This is intentional to make BC valuable for volume building.

---

**END OF BV CALCULATION REFERENCE**

*This document provides complete formulas and examples for implementing the Business Volume system across all tech products.*
