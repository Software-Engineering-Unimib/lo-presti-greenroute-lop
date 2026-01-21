@ECHO off

REM variables
SET MAINFILE=main.tex
SET PASSES=2

REM Compile multiple times
FOR /L %%i IN (1,1,%PASSES%) DO (
    ECHO "Running pdflatex (pass %%i)..."
    PDFLATEX -interaction=nonstopmode "%MAINFILE%"
    IF ERRORLEVEL 1 (
        ECHO Error: pdflatex failed on pass %%i with code %ERRORLEVEL%.
        PAUSE
        EXIT /b %ERRORLEVEL%
    )
)

ECHO Compilation succeeded.

REM clean up
ECHO Cleaning up auxiliary files...
DEL *.aux *.log *.toc


ECHO Build completed successfully!

PAUSE
