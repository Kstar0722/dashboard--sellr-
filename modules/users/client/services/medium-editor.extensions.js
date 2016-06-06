'use strict';

(function() {
    var _createLink = MediumEditor.util.createLink;
    MediumEditor.util.createLink = function (document, textNodes, href, target) {
        var anchor = _createLink.apply(this, arguments);
        anchor.setAttribute('href', '#');
        anchor.setAttribute('onclick', "window.open('" + url(href) + "', '_system', 'location=yes'); return false;");
        return anchor;
    };

    var _createLinkPro = MediumEditor.prototype.createLink;
    MediumEditor.prototype.createLink = function (opts) {
        var result = _createLinkPro.apply(this, arguments);
        var $sel = $(MediumEditor.selection.getSelectedElements(document));
        var $a = $sel.is('a') ? $sel : $sel.find('a');
        if ($a.length) {
            var href = url($a.attr('href'));
            $a.attr('onclick', "window.open('" + href + "', '_system', 'location=yes'); return false;");
            $a.attr('href', '#');
            this.events.enableCustomEvent('editableInput');
        }
        return result;
    };

    function url(addr) {
        if (typeof addr != 'string') return addr;
        if (!addr.trim().match(/^(http|#|\/)/)) addr = 'http://' + addr;
        return addr;
    }
})();
