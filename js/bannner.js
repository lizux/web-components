function htmlInject(id, content) {
    var element = document.createElement('div');
    element.setAttribute('id', id);
    element.innerHTML = content;
    if (!document.getElementById(id)) {
        document.body.appendChild(element);
    }
}

function cssInject(rule) {
    var css = document.createElement('style');
    css.type = 'text/css';
    if (css.styleSheet) {
        css.styleSheet.cssText = rule;
    } else {
        css.appendChild(document.createTextNode(rule));
    }
    document.getElementsByTagName('head')[0].appendChild(css);
}

var rule =
    'html {padding-top: 30px}#global-banner {position: fixed; top: 0; z-index: 1000; width: 100%; height: 30px; background: #000; color: #fff; line-height: 28px; text-align: center}';
cssInject(rule);
htmlInject('global-banner', 'show your name');
