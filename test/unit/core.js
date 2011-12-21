module("Utils");

var U = ALT.module("utils");
test("Utils Signature Test", function() {
  ok(typeof U.formatDollarAmount !== "undefined", "formatDollarAmount exists");
  ok(typeof U.frequencyCount !== "undefined", "frequencyCount exists");
});

test("Frequency Count Basic", function() {
  var obj = [
    { "name" : "a" },
    { "name" : "a" },
    { "name" : "a" },
    { "name" : "a" },
    { "name" : "b" },
    { "name" : "b" },
    { "name" : "c" },
  ];

  var result = [
    ["a", 4],
    ["b", 2],
    ["c", 1]
  ];
  ok(_.isEqual(U.frequencyCount(obj, "name"), result), 
    "frequency counts are correct");
});


test("Frequency Count Basic with id", function() {
  var obj = [
    { "name" : "a", "id" : 1 },
    { "name" : "a", "id" : 1 },
    { "name" : "a", "id" : 1 },
    { "name" : "a", "id" : 1 },
    { "name" : "b", "id" : 2 },
    { "name" : "b", "id" : 2 },
    { "name" : "c", "id" : 3 }
  ];

  var result = [
    [1, "a", 4],
    [2, "b", 2],
    [3, "c", 1]
  ];
  console.log(U.frequencyCount(obj, "name", "id"));
  ok(_.isEqual(U.frequencyCount(obj, "name", "id"), result), 
    "frequency counts are correct");
});

test("Frequency Count Out of Order", function() {
  var obj = [
    { "name" : "b" },
    { "name" : "c" },
    { "name" : "a" },
    { "name" : "b" },
    { "name" : "a" },
    { "name" : "a" },
    { "name" : "a" }
  ];

  var result = [
    ["a", 4],
    ["b", 2],
    ["c", 1]
  ];
  
  ok(_.isEqual(U.frequencyCount(obj, "name"), result), 
    "frequency counts are correct");
});

test("Format Dollar Amount", function() {
  var samples = {
    0 : "$0",
    10 : "$10",
    100 : "$100",
    1000 : "$1,000",
    1000000 : "$1,000,000"
  };

  _.each(samples, function(value, key) {
    ok(U.formatDollarAmount(key) === value, "dollar amount " + key + " is formatted correctly as " + value);
  });
});

test("Remap values", function() {
  ok(U.remap(1, 0, 10, 0, 100) === 10, "U.remap(1, 0, 10, 0, 100) === 10");
  ok(U.remap(10, 0, 10, 0, 100) === 100, "U.remap(10, 0, 10, 0, 100) === 100");
  ok(U.remap(5, 0, 10, 0, 100) === 50, "U.remap(5, 0, 10, 0, 100) === 50");
});