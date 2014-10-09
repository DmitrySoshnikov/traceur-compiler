// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * @fileoverview This file generates the code for ParseTreeTransformer.js
 * based on a JSON file, which gets passed in on the command line.
 */


var fs = require('fs');
var util = require('./util.js');

var trees = readTrees();

util.printLicense();
util.printAutoGenerated();
printImports(trees);
printHeader();
printTrees(trees);
printEnd();

function printImports(trees) {
  var names = Object.keys(trees);
  util.print('import {');
  names.forEach(function(name) {
    util.print('  %s,', name);
  });
  util.print("} from '../syntax/trees/ParseTrees';")
}

function printHeader() {
  util.print(fs.readFileSync('build/parse-tree-transformer.header', 'utf8'));
}

function readTrees() {
  var data = fs.readFileSync(process.argv[2], 'utf-8');
  return util.parseJSON(data);
}

function printTrees(trees) {
  var names = Object.keys(trees);
  names.forEach(function(name) {
    printTransformTree(name, trees[name], trees);
  });
}

function printTransformTree(name, tree, trees) {
  util.print('  transform' + name + '(tree) {');
  printTransformBody(name, tree, trees);
  util.print('  }');
}

function printTransformBody(name, tree, trees) {
  var test = null;
  var args = 'tree.location';
  function addTest(fieldName) {
    var nextTest = fieldName + ' === tree.' + fieldName;
    if (test) {
      test += ' && ' + nextTest;
    } else {
      test = nextTest;
    }
    args += ', ' + fieldName;
  }
  var fieldNames = Object.keys(tree);
  fieldNames.forEach(
    function(fieldName) {
      if (fieldName == 'location') {
        return;
      }
      var fieldTypes = tree[fieldName];
      var fieldType = fieldTypes[0];
      if (util.isBlockOrStatementType(fieldTypes, trees)) {
        util.print('    var ' + fieldName +
                   ' = this.transformToBlockOrStatement(tree.' + fieldName +
                   ');');
        addTest(fieldName);
      } else if (util.isParseTreeType(fieldType, trees)) {
        util.print('    var ' + fieldName + ' = this.transformAny(tree.' +
            fieldName + ');');
        addTest(fieldName);
      } else if (util.isParseTreeListType(fieldType, trees)) {
        util.print('    var ' + fieldName + ' = this.transformList(tree.' +
            fieldName + ');');
        addTest(fieldName);
      } else {
        args += ', tree.' + fieldName;
      }
    }
  );

  if (test) {
    util.print('    if (' + test + ') {');
    util.print('      return tree;');
    util.print('    }');
    util.print('    return new ' + name + '(' + args + ');');
  } else {
    util.print('    return tree;');
  }
}

function printEnd() {
  util.print('}');
}
