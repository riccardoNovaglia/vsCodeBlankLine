## Don't you hate it when git complains there's no blank line at the end of a file? Me too!!

Whenever you save a file, this extension will automatically add a blank line at its end, if there isn't one already. A message box will let you know when this happens. You can dismiss it with the "Close" button or just hit Esc.

If you didn't want the line, you can hit "Revert!" and it will be removed. The file will be automatically saved as it was, without the blank line. Making futher changes and saving the file will trigger the extension once again, but don't dispair!
If this is bugging you because this one file should NOT have a line at its end, just hit "Stop that!" and it will stop that! Now when you save the file, nothing will happen! (except saving the file of course... the blank line won't be added though)

NEW: Now 100% more configurable! I've added a configuration option to allow you to disable the message that appears when the new line is added. By default it's set to true and you'll see the message, if you don't fancy that just jump to your VS Code config file and change

`//-------- Flag to indicate whether to display an message when a line is added to your file --------`
	`// Controls whether a message is displayed each time a line is added to your file`
	`"blankLine.showMessage": true,`

to

`"blankLine.showMessage": false`

`//-------- Flag to indicate whether to remove extra empty lines beside one --------`
	`"blankLine.removeExtraLines": true(default value)`

I kept this extension as easy as it can be. All its code can be found here: https://github.com/riccardoNovaglia/vsCodeBlankLine.git
I would say that if you're interested in making your own extension, this is a nice little example!

If you think this is awesome, spot any errors or think of anything interesting it should do, feel free to raise issues or make pull requests on the git repo!
