
# stats

  JavaScript statistics library built on uglify-js, reporting all sorts of interesting (and non-interesting) stats. Comes complete with an extremely simple js API, as well as a CLI.

## Installation

     $ npm install -g stats

## Example

 The following is an example of `stats(1)` running against the nodejs core libraries, completing in less than 300ms.

```
 λ projects: stats --totals node/lib

totals:
  loc: 14855
  bytes: 390.80 kb
  statements: 6547
  assignments: 3343
  functions: 868
  stringBytes: 10.28 kb
  arrayLiterals: 108
  objectLiterals: 99
  objectsCreated: 183
  regexpLiterals: 60
  strings: 1211
  numbers: 512
  throws: 91
```

## Statistics

 The following are currently supported:

  - **loc**: lines of code as shown in source
  - **statements**: total number of statements
  - **assignments**: total number of assignments
  - **functions**: total number of functions (both statement & expression)
  - **numbers**: total number of ... numbers :)
  - **throws**: total number of `throw`s
  - **strings**: total number of strings
  - **stringBytes**: total byte-length of all strings
  - **regexpLiterals**: total number of regexp literals
  - **arrayLiterals**: total number of array literals
  - **objectLiterals**: total number of object literals
  - **objectsCreated**: total number of objects initialized with `new`
  - **bytes**: byte-length of source

## API

### .parse(js)

  Returns statistics for the given string of `js`:

```js
var stats = require('stats');
console.log(stats.parse(str))
```

  Outputs something similar to:

```js
{ loc: 65,
  bytes: 1112,
  statements: 16,
  assignments: 9,
  functions: 3,
  stringBytes: 20,
  arrayLiterals: 0,
  objectLiterals: 1,
  objectsCreated: 1,
  strings: 4,
  numbers: 9,
  throws: 1 }
```

## CLI Usage

```

Usage: stats [options] [file|dir ...]

Options:

  -f, --format <name>  Output the given format. text, json
  -j, --json           Output JSON statistics
  -t, --text           Output human-readable plain-text stats
  -T, --totals         Output totals only
  -V, --version        Display the version of stats
  -h, --help           Display help information

```

## Running tests

    $ make test

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.