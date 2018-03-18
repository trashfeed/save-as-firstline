# save-as-firstline
`save-as-firstline` is use the first line as the file name to quickly create or overwrite the file.

## Installation
https://marketplace.visualstudio.com/items?itemName=trash-feed.save-as-firstline


## Feature
- this extension is use filename at first line to create file.
- or, this extension is  use file name of first line (e.g. #) of markdown  create file.
- Using markdown and txt, can quickly create a document for each file.

## Usage
### Example1
1. input the following text.
``` txt
title
foo bar fuga.
...
...
```
2. `cmd+shift+h` on OSX or `ctrl+shift+h` on Windows
3. A file name `title.md` is created or overrided. 
> the extension change is `save.as.firstline.extension` at config.(default:`.md`)  

### Example2
1. input the following text.
```txt
/directory/directory/title
foo bar fuga.
...
...
```
2. `cmd+shift+h` on OSX or `ctrl+shift+h` on Windows
3. A file path `/directory/directory/title.md` is created or overrided. a root of the path is the project folder.


### Example3
1. input the following text.
``` markdown
...
title
# head1
foo bar fuga.
...
...
```
2. `cmd+shift+h` on OSX or `ctrl+shift+h` on Windows
3. A file name `head1.md` is created or overrided.


## Options
- `save.as.firstline.extension`
  - create file name of extension.
  - default `.md`.
- `save.as.firstline.isMarkdownHeader`
  - use filename at first line or first line (e.g. #) of markdown.
  - default `first line`.


## Licence
[MIT](https://raw.githubusercontent.com/trashfeed/save-as-firstline/master/LICENSE.md)

## Author
[trashfeed](https://github.com/trashfeed)
