# pdf-to-png-functions
Firebase functions to convert pdf file to png image for high and low resolution using Ghostscript.

https://www.ghostscript.com/

## About
`createPDFThumbnail` is a Callable function, that you can directly call from a Firebase app.

Find out more about Firebase Callable functions: 
https://firebase.google.com/docs/functions/callable

## Setting up Ghostscript
For conversion, we use Ghostscript, however, Cloud Functions doesn’t come with Ghostscript installed so we have to add it to our project ourselves, as a git submodule:

```git submodule add --name lambda-ghostscript -- https://github.com/sina-masnadi/lambda-ghostscript.git functions/lambda-ghostscript```

Doing this will add the directory of the submodule and create a file called .gitmodules that is used to version control your submodules. For more details on how the .gitmodules file is used in a team setting see the documentation provided by git.

*this code is inspired by Stephen Saunders' project*
https://tech.residebrokerage.com/using-firebase-cloud-functions-with-ghostscript-for-pdf-to-image-conversion-f81b248d3b22
