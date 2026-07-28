const guard = `(function(){
  var blocked = /^(bis_|__processed_)/;
  var clean = function (node) {
    if (!node || node.nodeType !== 1 || !node.attributes) return;
    for (var i = node.attributes.length - 1; i >= 0; i--) {
      var name = node.attributes[i].name;
      if (blocked.test(name)) node.removeAttribute(name);
    }
  };
  var sweep = function () {
    clean(document.documentElement);
    var all = document.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) clean(all[i]);
  };
  sweep();
  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record.type === "attributes") {
        if (blocked.test(record.attributeName)) {
          record.target.removeAttribute(record.attributeName);
        }
        continue;
      }
      for (var j = 0; j < record.addedNodes.length; j++) {
        clean(record.addedNodes[j]);
      }
    }
  }).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });
  document.addEventListener("DOMContentLoaded", sweep);
})();`;

const ExtensionAttributeGuard = () => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return <script dangerouslySetInnerHTML={{ __html: guard }} />;
};

export default ExtensionAttributeGuard;
