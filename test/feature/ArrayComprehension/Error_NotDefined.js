// Options: --array-comprehension
// Error: :5:1: notDefined is not defined

var array = [for (notDefined of [0]) notDefined];
notDefined;
