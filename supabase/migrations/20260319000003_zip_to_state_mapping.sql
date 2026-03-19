-- =============================================
-- Comprehensive Zip Code to State Mapping
-- Complete mapping for all US zip code ranges
-- =============================================

-- Recreate function with complete mapping
CREATE OR REPLACE FUNCTION get_state_from_zip(zip TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  zip_num INTEGER;
BEGIN
  -- Handle NULL or empty
  IF zip IS NULL OR zip = '' THEN
    RETURN NULL;
  END IF;

  -- Extract numeric part and convert to integer
  zip_num := SUBSTRING(REGEXP_REPLACE(zip, '[^0-9]', '', 'g') FROM 1 FOR 5)::INTEGER;

  -- Comprehensive zip code range mapping
  CASE
    -- Alabama: 350-369
    WHEN zip_num BETWEEN 35000 AND 36999 THEN RETURN 'AL';
    -- Alaska: 995-999
    WHEN zip_num BETWEEN 99500 AND 99999 THEN RETURN 'AK';
    -- Arizona: 850-865
    WHEN zip_num BETWEEN 85000 AND 86599 THEN RETURN 'AZ';
    -- Arkansas: 716-729, 755-729
    WHEN zip_num BETWEEN 71600 AND 72999 OR zip_num BETWEEN 75500 AND 75599 THEN RETURN 'AR';
    -- California: 900-961
    WHEN zip_num BETWEEN 90000 AND 96199 THEN RETURN 'CA';
    -- Colorado: 800-816
    WHEN zip_num BETWEEN 80000 AND 81699 THEN RETURN 'CO';
    -- Connecticut: 060-069
    WHEN zip_num BETWEEN 6000 AND 6999 THEN RETURN 'CT';
    -- Delaware: 197-199
    WHEN zip_num BETWEEN 19700 AND 19999 THEN RETURN 'DE';
    -- Florida: 320-349
    WHEN zip_num BETWEEN 32000 AND 34999 THEN RETURN 'FL';
    -- Georgia: 300-319, 398-399
    WHEN zip_num BETWEEN 30000 AND 31999 OR zip_num BETWEEN 39800 AND 39999 THEN RETURN 'GA';
    -- Hawaii: 967-968
    WHEN zip_num BETWEEN 96700 AND 96899 THEN RETURN 'HI';
    -- Idaho: 832-838
    WHEN zip_num BETWEEN 83200 AND 83899 THEN RETURN 'ID';
    -- Illinois: 600-629
    WHEN zip_num BETWEEN 60000 AND 62999 THEN RETURN 'IL';
    -- Indiana: 460-479
    WHEN zip_num BETWEEN 46000 AND 47999 THEN RETURN 'IN';
    -- Iowa: 500-528
    WHEN zip_num BETWEEN 50000 AND 52899 THEN RETURN 'IA';
    -- Kansas: 660-679
    WHEN zip_num BETWEEN 66000 AND 67999 THEN RETURN 'KS';
    -- Kentucky: 400-427
    WHEN zip_num BETWEEN 40000 AND 42799 THEN RETURN 'KY';
    -- Louisiana: 700-714
    WHEN zip_num BETWEEN 70000 AND 71499 THEN RETURN 'LA';
    -- Maine: 039-049
    WHEN zip_num BETWEEN 3900 AND 4999 THEN RETURN 'ME';
    -- Maryland: 206-219
    WHEN zip_num BETWEEN 20600 AND 21999 THEN RETURN 'MD';
    -- Massachusetts: 010-027
    WHEN zip_num BETWEEN 1000 AND 2799 THEN RETURN 'MA';
    -- Michigan: 480-499
    WHEN zip_num BETWEEN 48000 AND 49999 THEN RETURN 'MI';
    -- Minnesota: 550-567
    WHEN zip_num BETWEEN 55000 AND 56799 THEN RETURN 'MN';
    -- Mississippi: 386-397
    WHEN zip_num BETWEEN 38600 AND 39799 THEN RETURN 'MS';
    -- Missouri: 630-658
    WHEN zip_num BETWEEN 63000 AND 65899 THEN RETURN 'MO';
    -- Montana: 590-599
    WHEN zip_num BETWEEN 59000 AND 59999 THEN RETURN 'MT';
    -- Nebraska: 680-693
    WHEN zip_num BETWEEN 68000 AND 69399 THEN RETURN 'NE';
    -- Nevada: 889-898
    WHEN zip_num BETWEEN 88900 AND 89899 THEN RETURN 'NV';
    -- New Hampshire: 030-038
    WHEN zip_num BETWEEN 3000 AND 3899 THEN RETURN 'NH';
    -- New Jersey: 070-089
    WHEN zip_num BETWEEN 7000 AND 8999 THEN RETURN 'NJ';
    -- New Mexico: 870-884
    WHEN zip_num BETWEEN 87000 AND 88499 THEN RETURN 'NM';
    -- New York: 100-149
    WHEN zip_num BETWEEN 10000 AND 14999 THEN RETURN 'NY';
    -- North Carolina: 270-289
    WHEN zip_num BETWEEN 27000 AND 28999 THEN RETURN 'NC';
    -- North Dakota: 580-588
    WHEN zip_num BETWEEN 58000 AND 58899 THEN RETURN 'ND';
    -- Ohio: 430-458
    WHEN zip_num BETWEEN 43000 AND 45899 THEN RETURN 'OH';
    -- Oklahoma: 730-749
    WHEN zip_num BETWEEN 73000 AND 74999 THEN RETURN 'OK';
    -- Oregon: 970-979
    WHEN zip_num BETWEEN 97000 AND 97999 THEN RETURN 'OR';
    -- Pennsylvania: 150-196
    WHEN zip_num BETWEEN 15000 AND 19699 THEN RETURN 'PA';
    -- Rhode Island: 028-029
    WHEN zip_num BETWEEN 2800 AND 2999 THEN RETURN 'RI';
    -- South Carolina: 290-299
    WHEN zip_num BETWEEN 29000 AND 29999 THEN RETURN 'SC';
    -- South Dakota: 570-577
    WHEN zip_num BETWEEN 57000 AND 57799 THEN RETURN 'SD';
    -- Tennessee: 370-385
    WHEN zip_num BETWEEN 37000 AND 38599 THEN RETURN 'TN';
    -- Texas: 750-799, 885-887
    WHEN zip_num BETWEEN 75000 AND 79999 OR zip_num BETWEEN 88500 AND 88799 THEN RETURN 'TX';
    -- Utah: 840-847
    WHEN zip_num BETWEEN 84000 AND 84799 THEN RETURN 'UT';
    -- Vermont: 050-059
    WHEN zip_num BETWEEN 5000 AND 5999 THEN RETURN 'VT';
    -- Virginia: 220-246
    WHEN zip_num BETWEEN 22000 AND 24699 THEN RETURN 'VA';
    -- Washington: 980-994
    WHEN zip_num BETWEEN 98000 AND 99499 THEN RETURN 'WA';
    -- West Virginia: 247-268
    WHEN zip_num BETWEEN 24700 AND 26899 THEN RETURN 'WV';
    -- Wisconsin: 530-549
    WHEN zip_num BETWEEN 53000 AND 54999 THEN RETURN 'WI';
    -- Wyoming: 820-831
    WHEN zip_num BETWEEN 82000 AND 83199 THEN RETURN 'WY';
    -- Washington DC: 200-205
    WHEN zip_num BETWEEN 20000 AND 20599 THEN RETURN 'DC';
    ELSE RETURN NULL;
  END CASE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_state_from_zip IS 'Converts zip code to state abbreviation using comprehensive USPS zip code ranges.';
