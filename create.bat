@echo off
setlocal DisableDelayedExpansion
rem Scaffold a new Tab Sage extension under extensions\<id>\.
rem
rem Usage (flags, any omitted are prompted for):
rem   create.bat --id my-ext --name "My Ext" --description "Does a thing." ^
rem              --author "You" [--homepage URL] [--permissions content_scripts,storage] ^
rem              [--matches "<all_urls>"] [--run-at document_end]
rem
rem Or just run create.bat with no arguments to be prompted for everything.
rem
rem The valid permissions are: content_scripts (required), storage, ai, tabs, notifications, dialogs, adblock, cutout.

set "repo_root=%~dp0"
if "%repo_root:~-1%"=="\" set "repo_root=%repo_root:~0,-1%"
set "ext_root=%repo_root%\extensions"

rem Left empty so every manifest field is prompted for when not passed as a flag.
rem The defaults are applied after the prompts below.
set "ID="
set "NAME="
set "DESCRIPTION="
set "AUTHOR="
set "HOMEPAGE="
set "PERMISSIONS="
set "MATCHES="
set "RUN_AT="

rem --- parse flags ------------------------------------------------------------
:parseargs
if "%~1"=="" goto afterargs
if "%~1"=="--id" ( set "ID=%~2" & shift & shift & goto parseargs )
if "%~1"=="--name" ( set "NAME=%~2" & shift & shift & goto parseargs )
if "%~1"=="--description" ( set "DESCRIPTION=%~2" & shift & shift & goto parseargs )
if "%~1"=="--desc" ( set "DESCRIPTION=%~2" & shift & shift & goto parseargs )
if "%~1"=="--author" ( set "AUTHOR=%~2" & shift & shift & goto parseargs )
if "%~1"=="--homepage" ( set "HOMEPAGE=%~2" & shift & shift & goto parseargs )
if "%~1"=="--permissions" ( set "PERMISSIONS=%~2" & shift & shift & goto parseargs )
if "%~1"=="--perms" ( set "PERMISSIONS=%~2" & shift & shift & goto parseargs )
if "%~1"=="--matches" ( set "MATCHES=%~2" & shift & shift & goto parseargs )
if "%~1"=="--run-at" ( set "RUN_AT=%~2" & shift & shift & goto parseargs )
if "%~1"=="-h" goto help
if "%~1"=="--help" goto help
echo Unknown option: %~1>&2
exit /b 1

:help
echo Scaffold a new Tab Sage extension under extensions\^<id^>\.
echo.
echo Usage (flags, any omitted are prompted for):
echo   create.bat --id my-ext --name "My Ext" --description "Does a thing." ^^
echo              --author "You" [--homepage URL] [--permissions content_scripts,storage] ^^
echo              [--matches "^<all_urls^>"] [--run-at document_end]
echo.
echo Or just run create.bat with no arguments to be prompted for everything.
echo.
echo The valid permissions are: content_scripts (required), storage, ai, tabs, notifications, dialogs, adblock, cutout.
exit /b 0

:afterargs

rem --- prompt for anything still missing (id and name are required) -----------
if "%ID%"=="" set /p "ID=Extension id (lowercase, digits, hyphens): "
if "%NAME%"=="" set /p "NAME=Display name: "
if "%DESCRIPTION%"=="" set /p "DESCRIPTION=One-line description: "
if "%AUTHOR%"=="" set /p "AUTHOR=Author: "
if "%HOMEPAGE%"=="" set /p "HOMEPAGE=Homepage URL (optional): "
if "%PERMISSIONS%"=="" set /p "PERMISSIONS=Permissions (comma-separated) [content_scripts]: "
if "%PERMISSIONS%"=="" set "PERMISSIONS=content_scripts"
if "%MATCHES%"=="" set /p "MATCHES=Match pattern [<all_urls>]: "
if "%MATCHES%"=="" set "MATCHES=<all_urls>"
if "%RUN_AT%"=="" set /p "RUN_AT=Run at (document_start|document_end) [document_end]: "
if "%RUN_AT%"=="" set "RUN_AT=document_end"

rem --- validate ---------------------------------------------------------------
echo(%ID%| findstr /r /c:"^[a-z0-9-][a-z0-9-]*$" >nul
if errorlevel 1 (
  echo Error: id must be lowercase letters, digits, and hyphens only.>&2
  exit /b 1
)
if "%NAME%"=="" (
  echo Error: name, description, and author are required.>&2
  exit /b 1
)
if "%DESCRIPTION%"=="" (
  echo Error: name, description, and author are required.>&2
  exit /b 1
)
if "%AUTHOR%"=="" (
  echo Error: name, description, and author are required.>&2
  exit /b 1
)

set "dest=%ext_root%\%ID%"
if exist "%dest%\" (
  echo Error: %dest% already exists.>&2
  exit /b 1
)

rem Normalize + validate the permissions list. content_scripts is always included.
call :build_perms || exit /b 1

if not "%RUN_AT%"=="document_start" if not "%RUN_AT%"=="document_end" (
  echo Error: run-at must be document_start or document_end.>&2
  exit /b 1
)

rem CamelCase the id for a unique window guard flag.
set "guard=__ts"
set "idspaced=%ID:-= %"
for %%s in (%idspaced%) do call :appendcap "%%s"

rem --- write files ------------------------------------------------------------
mkdir "%dest%"

call :write_manifest
call :write_content
call :write_style
call :write_readme

echo Created %dest%
echo.
echo Next steps:
echo   1. Edit content.js / style.css.
echo   2. In Tab Sage: Settings ^> Extensions ^> Load unpacked -^> %dest%
echo   3. Reload a page it matches to test it.
exit /b 0

rem ============================================================================
rem Subroutines
rem ============================================================================

:is_valid_perm
set "pp=%~1"
for %%v in (content_scripts storage ai tabs notifications dialogs adblock cutout) do if "%pp%"=="%%v" exit /b 0
exit /b 1

:build_perms
setlocal EnableDelayedExpansion
set DQ="
set "pj="
set "has_cs=0"
for %%p in (%PERMISSIONS%) do (
  call :is_valid_perm "%%p"
  if errorlevel 1 (
    echo Error: unknown permission '%%p'. Valid: content_scripts, storage, ai, tabs, notifications, dialogs, adblock, cutout.>&2
    endlocal & exit /b 1
  )
  if "%%p"=="content_scripts" set "has_cs=1"
  if defined pj (set "pj=!pj!, !DQ!%%p!DQ!") else (set "pj=!DQ!%%p!DQ!")
)
if "!has_cs!"=="0" (
  if defined pj (set "pj=!DQ!content_scripts!DQ!, !pj!") else (set "pj=!DQ!content_scripts!DQ!")
)
endlocal & set "perms_json=[ %pj% ]"
exit /b 0

:appendcap
set "seg=%~1"
if "%seg%"=="" exit /b 0
set "first=%seg:~0,1%"
set "rest=%seg:~1%"
call :toupperchar first
set "guard=%guard%%first%%rest%"
exit /b 0

:toupperchar
setlocal EnableDelayedExpansion
set "ch=!%~1!"
set "low=abcdefghijklmnopqrstuvwxyz"
set "up=ABCDEFGHIJKLMNOPQRSTUVWXYZ"
set "res=!ch!"
for /l %%i in (0,1,25) do if "!ch!"=="!low:~%%i,1!" set "res=!up:~%%i,1!"
endlocal & set "%~1=%res%"
exit /b 0

:write_manifest
setlocal EnableDelayedExpansion
set "f=%dest%\manifest.json"
echo {>"!f!"
echo   "id": "!ID!",>>"!f!"
echo   "name": "!NAME!",>>"!f!"
echo   "version": "1.0.0",>>"!f!"
echo   "description": "!DESCRIPTION!",>>"!f!"
echo   "author": "!AUTHOR!",>>"!f!"
if "!HOMEPAGE!"=="" (echo   "homepage": null,>>"!f!") else (echo   "homepage": "!HOMEPAGE!",>>"!f!")
echo   "permissions": !perms_json!,>>"!f!"
echo   "content_scripts": [>>"!f!"
echo     {>>"!f!"
echo       "matches": ["!MATCHES!"],>>"!f!"
echo       "js": ["content.js"],>>"!f!"
echo       "css": ["style.css"],>>"!f!"
echo       "run_at": "!RUN_AT!">>"!f!"
echo     }>>"!f!"
echo   ]>>"!f!"
echo }>>"!f!"
endlocal
exit /b 0

:write_content
setlocal DisableDelayedExpansion
set "f=%dest%\content.js"
echo // %NAME% — %DESCRIPTION%>"%f%"
echo (function () {>>"%f%"
echo   // Content scripts can run more than once per page (e.g. after in-page>>"%f%"
echo   // navigation), so bail out if we already ran.>>"%f%"
echo   if (window.%guard%) return;>>"%f%"
echo   window.%guard% = true;>>"%f%"
echo(>>"%f%"
echo   // console output shows up in Settings ^> Extensions, so it confirms the>>"%f%"
echo   // extension is alive on the page.>>"%f%"
echo   console.log("%NAME% ready on", location.href);>>"%f%"
echo(>>"%f%"
echo   // TODO: your extension code here. If you requested host permissions, the>>"%f%"
echo   // `tabsage` API is available as an in-scope local (NOT window.tabsage):>>"%f%"
echo   //   if (typeof tabsage !== "undefined" ^&^& tabsage.ai) { ... }>>"%f%"
echo   // Groups: tabsage.storage, tabsage.ai (chat/prompt), tabsage.tabs,>>"%f%"
echo   // tabsage.notify, tabsage.dialog, tabsage.adblock, tabsage.cutout.>>"%f%"
echo   // See README.md and DEVELOP.md for the full reference and examples.>>"%f%"
echo })();>>"%f%"
endlocal
exit /b 0

:write_style
setlocal DisableDelayedExpansion
set "f=%dest%\style.css"
echo /* Styles for %NAME%. Keep selectors specific so you don't affect the host page. */>"%f%"
endlocal
exit /b 0

:write_readme
setlocal EnableDelayedExpansion
set "f=%dest%\README.md"
echo # !NAME!>"!f!"
echo(>>"!f!"
echo !DESCRIPTION!>>"!f!"
echo(>>"!f!"
echo ## What it touches>>"!f!"
echo(>>"!f!"
echo - Runs on: `!MATCHES!` (never in incognito).>>"!f!"
echo - Describe here exactly what the extension reads or changes.>>"!f!"
echo(>>"!f!"
echo ## Permissions>>"!f!"
echo(>>"!f!"
echo !PERMISSIONS!>>"!f!"
echo(>>"!f!"
echo ## Changes>>"!f!"
echo(>>"!f!"
echo - 1.0.0 — Initial release.>>"!f!"
endlocal
exit /b 0
