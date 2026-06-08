; ClawdClock NSIS installer hooks
; Runs after main installation to register as Windows screensaver

!macro customInstall
  ; Create a .scr copy alongside the exe (same binary; arg-parses /s /p /c).
  CopyFiles "$INSTDIR\ClawdClock.exe" "$INSTDIR\ClawdClock.scr"

  ; Register the .scr (not the .exe) as the active screensaver so the Windows
  ; Screen Saver Settings dialog previews and configures it correctly.
  WriteRegStr HKCU "Control Panel\Desktop" "SCRNSAVE.EXE" "$INSTDIR\ClawdClock.scr"
  WriteRegStr HKCU "Control Panel\Desktop" "ScreenSaveActive" "1"
!macroend

!macro customUnInstall
  ; Remove screensaver registration on uninstall
  DeleteRegValue HKCU "Control Panel\Desktop" "SCRNSAVE.EXE"
  ; Leave ScreenSaveActive as-is (user may have other screensaver)
  Delete "$INSTDIR\ClawdClock.scr"
!macroend
