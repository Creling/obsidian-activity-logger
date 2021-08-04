<!--
 * @Author: Creling
 * @Date: 2021-08-03 10:04:10
 * @LastEditors: Creling
 * @LastEditTime: 2021-08-04 16:06:31
 * @Description: file content
-->
# Activity Logger

Log your activities like creating notes, modifying notes, deleting notes and so on.

## Features

- Idempotency, which means that you can exec the command multiply times and it will not insert duplicate logs but update existing logs.

- Template support, which means that you can define your own output.

## Get Started

### Settings

**Start Line**: A special make or sentence after which logs will be insert. Do **NOT** left it empty.

**End Line**: A special mark or sentence before which logs will be insert. Do **NOT** left it empty.

If there are existing `Start Line` & `End Line` in current notes. the plugin will insert logs between them, or it will insert `Start Line`, logs and `End Line` after the cursor. 

**Template**: A snippet with three special variables (`$createdFiles`, `$deletedFiles` & `$modifiedFiles`). 

Any characters in the same line with these three variables and the variables themselves compose a Placeholder. When inserting logs, the variables will be replaced with file paths and additional characters will reserved. That's to say, `- $createdFiles` will get a unordered list of files which are created today. and `- [[$createdFiles]]` will get a similar list but all items are Obsidian internal links. 

### Tricks

`Start Line` and `End Line` are somewhat ugly, but we can incorporate them within our Obsidian Templates. Suppose we have a Template like this:

```markdown
# YYYY-MM-DD
## Daily Activities
……………………
## Daily Plans
……………………
```
We can set `Start Line` as `## Daily Activities` and `End Line` as `## Daily Plans`. Then logs will be insert between these two headings, no ugly marks at all!.