## Don't you hate it when git complains there's no blank line at the end of a file? Me too!!

Whenever you save a file, this extension will automatically add a blank line at its end, if there isn't one already. A message box will let you know when this happens. You can dismiss it with the "Close" button or just hit Esc. If you have multiple blank lines, only one will be kept.

You can hit "Revert!" and the change will be reverted.
To prevent the file you're currently editing from being automatically updated, just hit "Stop that!" and it will stop that!

It comes with the three configuration values listed below.

`"blankLine.showMessage": false` --- Display a message each time a blank line at the EOF is added/removed (Let me know if you'd like this to be back to `true` by default!)

`"blankLine.removeExtraLines": true` --- Remove extra trailing lines and only keep one

`"blankLine.fileExtensionsToIgnore": [".conf", ".json", ".liquid"]` --- Does not append to files whose extension is listed.

_The above can be useful when the setting `"editor.formatOnSave": true"` is also active, since in some config files it causes vscode to remove the blank line added by the extension, and then the two get in a fight about who gets the last word... If you run into this issue for other files extensions, simply add it to the list. You can also add it to the defaults for everyone if you're so inclined by creating a PR on the repo below. The file to update is `package.json`. Thanks!_

You can see this extension's code [on Github](https://github.com/riccardoNovaglia/vsCodeBlankLine.git) where you can also raise issues, or submit pull requests.

A big thanks to people who took the time to report issues and help me solve them!!! You're the best! :D
