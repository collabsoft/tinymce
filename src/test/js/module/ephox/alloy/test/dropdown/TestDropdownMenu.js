define(
  'ephox.alloy.test.dropdown.TestDropdownMenu',

  [
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.ItemWidget',
    'ephox.alloy.api.ui.Menu',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Step, Waiter, Representing, ItemWidget, Menu, Fun, Merger, Attr, SelectorFind) {
    var renderMenu = function (spec) {
      return {
        dom: {
          tag: 'ol',
          classes: [ 'menu' ],
          attributes: spec.text !== undefined ? {
            'aria-label': spec.text
          } : { }
        },
        items: spec.items,
        components: [
          Menu.parts().items({ })
        ]
      };
    };

    var renderItem = function (spec) {
      return spec.type === 'widget' ? {
        type: 'widget',
        data: spec.data,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value
          },
          classes: [ 'item-widget' ]
        },
        components: [
          ItemWidget.parts().widget(spec.widget)
        ]
      } : {
        type: spec.type,
        data: spec.data,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value,
            'data-test-id': 'item-' + spec.data.value
          },
          classes: [ ],
          innerHtml: spec.data.text
        },
        components: [ ]
      };
    };

    var part = function (store) {
      return {
        dom: {
          tag: 'div'
        },
        markers: markers,
        onExecute: function (dropdown, item) {
          var v = Representing.getValue(item);
          return store.adderH('dropdown.menu.execute: ' + v.value)();
        }
      };
    };

    var mStoreMenuUid = function (component) {
      return Step.stateful(function (value, next, die) {
        var menu = SelectorFind.descendant(component.element(), '.menu').getOrDie('Could not find menu');
        var uid = Attr.get(menu, 'data-alloy-id');
        next(
          Merger.deepMerge(value, { menuUid: uid })
        );
      });
    };

    var mWaitForNewMenu = function (component) {
      return Step.stateful(function (value, next, die) {
        Waiter.sTryUntil(
          'Waiting for a new menu (different uid)',
          Step.sync(function () {
            SelectorFind.descendant(component.element(), '.menu').filter(function (menu) {
              var uid = Attr.get(menu, 'data-alloy-id');
              return value.menuUid !== uid;
            }).getOrDie('New menu has not appeared');
          }),
          100,
          3000
        )(value, next, die);
      });
    };

    var markers = {
      item: 'item',
      selectedItem: 'selected-item',
      menu: 'menu',
      selectedMenu: 'selected-menu',
      'backgroundMenu': 'background-menu'
    };

    return {
      renderItem: renderItem,
      renderMenu: renderMenu,
      part: part,
      markers: Fun.constant(markers),

      mWaitForNewMenu: mWaitForNewMenu,
      mStoreMenuUid: mStoreMenuUid
    };
  }
);