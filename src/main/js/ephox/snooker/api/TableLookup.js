define(
  'ephox.snooker.api.TableLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.util.LayerSelector',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Selectors',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, Structs, LayerSelector, Attr, Node, SelectorFilter, SelectorFind, Selectors, Traverse, parseInt) {

    // lookup inside this table
    var lookup = function (tags, element) {
      // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
      // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
      if (Arr.contains(tags, Node.name(element))) return Option.some(element);

      var isRoot = function (element) {
        return Selectors.is(element, 'table');
      };

      return SelectorFind.ancestor(element, tags.join(','), isRoot);
    };

    /*
     * Identify the optional cell that element represents.
     */
    var cell = function (element) {
      return lookup([ 'td', 'th' ], element);
    };

    var cells = function (ancestor) {
      return LayerSelector.firstLayer(ancestor, 'th,td');
    };

    var notCell = function (element) {
      return lookup([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element);
    };

    var neighbours = function (selector, element) {
      return Traverse.parent(element).map(function (parent) {
        return SelectorFilter.children(parent, selector);
      });
    };

    var neighbourCells = Fun.curry(neighbours, 'th,td');
    var neighbourRows  = Fun.curry(neighbours, 'tr');

    var firstCell = function (ancestor) {
      return SelectorFind.descendant(ancestor, 'th,td');
    };

    var table = function (element) {
      return SelectorFind.closest(element, 'table');
    };

    var row = function (element) {
      return lookup([ 'tr' ], element);
    };

    var rows = function (ancestor) {
      return LayerSelector.firstLayer(ancestor, 'tr');
    };

    var attr = function (element, property) {
      return parseInt(Attr.get(element, property), 10);
    };

    var grid = function (element, rowProp, colProp) {
      var rows = attr(element, rowProp);
      var cols = attr(element, colProp);
      return Structs.grid(rows, cols);
    };

    return {
      cell: cell,
      firstCell: firstCell,
      cells: cells,
      neighbourCells: neighbourCells,
      table: table,
      row: row,
      rows: rows,
      notCell: notCell,
      neighbourRows: neighbourRows,
      attr: attr,
      grid: grid
    };
  }
);
