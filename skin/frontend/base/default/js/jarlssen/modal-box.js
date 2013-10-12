var ModalBox = Class.create({

    /**
     * Constructor
     */
    initialize: function()
    {
        Event.observe(window, 'resize', this.adaptToSize);
        Event.observe(document, 'dom:modalBoxAjaxContentLoad', this.adaptToSize);
    },

    /**
     * Do responsive stuff
     */
    adaptToSize: function()
    {
        var allowedWidth = Math.floor(document.viewport.getWidth() / 100 * 90),
            allowedHeight = Math.floor(document.viewport.getHeight() / 100 * 90);
        $$('body > .modal-popup').each(function(popup) {
            var width = Math.min(allowedWidth, popup.getWidth()),
                content_container = popup.firstDescendant();
            popup.setStyle({
                'width': allowedWidth > popup.getWidth() ? null : width + 'px',
                'marginLeft': width / 2 * -1 + 'px'
            });

            var height = Math.min(allowedHeight, popup.getHeight());
            popup.setStyle({
                'height': allowedHeight > popup.getHeight() ? null : height + 'px',
                'marginTop': height / 2 * -1 + 'px'
            });
            if (allowedHeight > popup.getHeight()) {
                content_container.setStyle({ 'height': null });
            } else {
                var lag = Number(content_container.getStyle('padding-top').slice(0, -2))
                        + Number(content_container.getStyle('padding-bottom').slice(0, -2))
                        + Number(content_container.getStyle('margin-top').slice(0, -2))
                        + Number(content_container.getStyle('margin-bottom').slice(0, -2))
                        + Number(content_container.getStyle('border-top-width').slice(0, -2))
                        + Number(content_container.getStyle('border-bottom-width').slice(0, -2));
                content_container.setStyle({ 'height': height - lag + 'px' });
            }
        });
    },

    /**
     * Show popup (maybe it makes sense to combine it with constructor)
     *
     * @param content
     */
    show: function(content)
    {
        if (content) {

            /* If there were already open popups hide them */
            this.hide();

            if (content.match(/^https?:\/\//i)) {
                new Ajax.Request(content, {
                    onSuccess: function(response) {
                        if (200 == response.status) {
                            /**
                             *  In case the popup contents are larger then half size of the screen it is wrapped and
                             *  popup dimensions are calculated incorrectly. For that case the popup is first displaced
                             *  then content is updated and at last positioned back.
                             */
                            popup.setStyle({ 'top': 0, 'left': 0 });

                            $('modal-box-content').update(response.responseText);

                            popup.setStyle({
                                'top': null,
                                'left': null,
                                'marginLeft': popup.getWidth() / 2 * -1 + 'px',
                                'marginTop': popup.getHeight() / 2 * -1 + 'px'
                            });

                            document.fire('dom:modalBoxAjaxContentLoad');
                        }
                    }
                });

                content = 'loading .. ';
            }

            var body = document.body,
                html = document.documentElement,
                allowedWidth = Math.floor(document.viewport.getWidth()/100*90);

            var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
                height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

            var closeButton = new Element('a', {
                'title': Translator.translate('Close'),
                'class': 'popup-close',
                'href': 'javascript:;'
            }).observe('click', this.hide);
            var popup = new Element('div', { 'class': 'modal-popup'})
                .update(
                    new Element('div', { 'id': 'modal-box-content' }).update(content)
                )
                .insert(closeButton);
            var overlay = new Element('div', { 'class': 'modal-box-overlay' })
                .observe('click', this.hide)
                .setStyle({
                    'width': width + 'px',
                    'height': height + 'px'
                });

            $$('body')[0].insert(overlay).insert(popup);

            /* Set margins for center positioning */
            popup.setStyle({
                'margin-left': popup.getWidth() / 2 * -1 + 'px',
                'margin-top': popup.getHeight() / 2 * -1 + 'px'
            });

            this.adaptToSize();
        }
    },

    /**
     * Hide all visible popups
     */
    hide: function()
    {
        var overlay = $$('body > .modal-popup, body > .modal-box-overlay');

        if (overlay.length) {
            overlay.each(function(item) {
                item.remove();
            });

            document.fire('dom:modalBoxAjaxClose');
        }
    }
});