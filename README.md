## Don't you hate it when git complains there's no blank line at the end of a file? Me too!

It's good practice to always have a blank line at the end of all your files (for some explanations: http://unix.stackexchange.com/questions/18743/whats-the-point-in-adding-a-new-line-to-the-end-of-a-file).

Whenever you save a file, this extension will automatically add a blank line at its end, if there isn't one already. If you have multiple trailing blank lines, they'll be reduced to one.

If you have good reasons not to apply this to some file, you can specify it in config, by specifying the file name or an extension type. You can find the config under '_blankline.fileTypesToExclude_'.

Optionally you can enable a message box that will alert you when a file is automatically added to your files. It also includes a button to revert the operation. It will also allow you to avoid running the extension for the specific file you're working on. You can find this config under '_blankLine.showMessage_'.  


Please report any issues here: https://github.com/riccardoNovaglia/vsCodeBlankLine/issues
