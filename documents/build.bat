@ECHO off


REM validate argument
IF "%~1"=="" (
    ECHO Usage: build.bat ^<tex file name^>.tex
	PAUSE
    EXIT /b 1
)

REM variables
SET "MAINFILE=%~1"
SET PASSES=2
SET BUILD_DIR="build"

REM Compile multiple times
FOR /L %%i IN (1,1,%PASSES%) DO (
    ECHO "Running pdflatex (pass %%i)..."
    PDFLATEX -interaction=nonstopmode -output-directory="%BUILD_DIR%" "%MAINFILE%"
    IF ERRORLEVEL 1 (
        ECHO Error: pdflatex failed on pass %%i with code %ERRORLEVEL%.
        EXIT /b %ERRORLEVEL%
    )
)

ECHO Compilation succeeded.

REM clean up
ECHO Cleaning up auxiliary files...
CD "%BUILD_DIR%"
DEL *.aux *.log *.toc


ECHO Build completed successfully!
