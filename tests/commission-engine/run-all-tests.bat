@echo off
REM =============================================
REM RUN ALL COMMISSION ENGINE TESTS (Windows)
REM Convenience script to run complete test cycle
REM =============================================

echo ================================================
echo APEX COMMISSION ENGINE - COMPLETE TEST SUITE
echo ================================================
echo.

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: psql command not found
  echo.
  echo Please install PostgreSQL client tools or use Supabase SQL Editor instead.
  echo You can also run the SQL files manually in the Supabase dashboard.
  pause
  exit /b 1
)

echo Step 1/6: Setting up test environment...
psql -c "\i 00-setup-test-environment.sql" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo FAILED - Check your database connection
  pause
  exit /b 1
)
echo DONE - Test environment setup complete
echo.

echo Step 2/6: Seeding test distributors (150+ distributors)...
psql -c "\i 01-seed-test-distributors.sql" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo FAILED
  pause
  exit /b 1
)
echo DONE - Test distributors created
echo.

echo Step 3/6: Seeding test customers and orders...
psql -c "\i 02-seed-test-orders.sql" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo FAILED
  pause
  exit /b 1
)
echo DONE - Test orders and BV created
echo.

echo Step 4/6: Running commission calculations (all 16 types)...
psql -c "\i 03-run-commission-tests.sql"
if %ERRORLEVEL% NEQ 0 (
  echo FAILED
  pause
  exit /b 1
)
echo DONE - Commission calculation complete
echo.

echo Step 5/6: Verifying results...
psql -c "\i 04-verify-results.sql"
if %ERRORLEVEL% NEQ 0 (
  echo FAILED
  pause
  exit /b 1
)
echo DONE - Verification complete
echo.

echo Step 6/6: Cleanup
set /p cleanup="Do you want to cleanup test data now? (y/N): "
if /i "%cleanup%"=="y" (
  psql -c "\i 99-cleanup-test-data.sql" >nul 2>&1
  echo DONE - Test data cleaned up
) else (
  echo Cleanup skipped. Run 99-cleanup-test-data.sql manually when ready.
)

echo.
echo ================================================
echo COMPLETE TEST SUITE FINISHED
echo ================================================
echo.
echo Review the output above for any failures or warnings.
echo.
pause
