:: This batch script makes the Caché application deployment much faster by building and importing
:: the project. Replace the path below to your Caché installation and build & import application to
:: Caché using only one command.

:: CHANGE THIS PATH TO YOUR CACHÉ INSTALLATION PATH ON WINDOWS
set CACHE_DIR=C:\Program Files\InterSystems\Ensemble
:: NAMESPACE IMPORTING TO
set NAMESPACE=USER

npm run gulp & echo w "OK:"_$system.OBJ.ImportDir("%~dp0build\Cache",,"ck") halt | "%CACHE_DIR%\bin\cache.exe" -s "%CACHE_DIR%\mgr" -U %NAMESPACE%