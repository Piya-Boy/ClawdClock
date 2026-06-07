; ClawdClock NSIS installer hooks
; Runs after main installation to register as Windows screensaver

!macro customInstall
  ; Copy exe as .scr into System32 (optional) — or just register in-place
  ; Register the installed exe as the active screensaver
  WriteRegStr HKCU "Control Panel\Desktop" "SCRNSAVE.EXE" "$INSTDIR\ClawdClock.exe"
  WriteRegStr HKCU "Control Panel\Desktop" "ScreenSaveActive" "1"

  ; Create a .scr copy alongside the exe for manual right-click install
  CopyFiles "$INSTDIR\ClawdClock.exe" "$INSTDIR\ClawdClock.scr"
!macroend

!macro customUnInstall
  ; Remove screensaver registration on uninstall
  DeleteRegValue HKCU "Control Panel\Desktop" "SCRNSAVE.EXE"
  ; Leave ScreenSaveActive as-is (user may have other screensaver)
  Delete "$INSTDIR\ClawdClock.scr"
!macroend
