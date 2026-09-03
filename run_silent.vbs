Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
BatchPath = ScriptDir & "\run.bat"
' Run with window style 0 (completely hidden) and wait for completion
WshShell.Run "cmd.exe /c """ & BatchPath & """", 0, True
