@ECHO off

REM variables
SET MAINFILE=main.tex

REM compilation
ECHO Running pdflatex...
PDFLATEX -interaction=nonstopmode "%MAINFILE%"
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: pdflatex failed with error code %ERRORLEVEL%.
    PAUSE
    EXIT /b %ERRORLEVEL%
)
ECHO Compilation succeeded.

REM clean up
ECHO Cleaning up build files...
DEL *.aux *.log


ECHO Build completed successfully!

PAUSE
