## Don't you hate it when git complains there's no blank line at the end of a file? Me too!!

Whenever you save a file, this extension will automatically add a blank line at its end, if there isn't one already. A message box will let you know when this happens. You can dismiss it with the "Close" button or just hit Esc. If you have multiple blank lines, only one will be kept.

You can hit "Revert!" and the change will be reverted.
To prevent the file you're currently editing from being automatically updated, just hit "Stop that!" and it will stop that!

It comes with two configuration values, to decide whether to display the message each time the file is edited, and to set whether to also remove extra trailing lines and only keep one.

`"blankLine.showMessage": true` --- (defaults to true)

`"blankLine.removeExtraLines": true` --- (defaults to true)

You can see this extension's code [on Github](https://github.com/riccardoNovaglia/vsCodeBlankLine.git) where you can also raise issues, or submit pull requests.
