/* Basic Overlay 0.8 ==============================================
 * Updated: 17/10/2012
 *
 * Author: Gianluca Buoncompagni
 * URL: http://gianlucabuoncompagni.net
 * Required files: jQuery 1.7+ Core
 * License: MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
var basicOverlay = (function ($, window, document) {
    "use strict";
    // DEFAULT OPTIONS VALUES
    var defaults = {
        overlayId: 'basicOverlay',
        overlayColor: '#000000',
        overlayOpacity: 0.5,
        closable: true,
        externalPage: '',
        content: '#modal',
        before: null,
        after: null,
        onClose: null,
        afterClose: null
    };

    var globalPosition = 'fixed',
        overlay = '.bso-overlay',
        horizon = '.bso-content',
        closeBtn = '.overlay-close';
    var basicOverlay = {
        options: defaults,
        init: function (options) {
            var bodyHeight = $('body').outerHeight(),
                viewportHeight = $(window).height();
            $('body').append('<div id="' + options.overlayId + '"><div class="bso-overlay" /><div class="bso-content" /></div>');
            $('#' + options.overlayId).find(overlay).css({
                'width': '100%',
                'height': viewportHeight > bodyHeight ? viewportHeight : bodyHeight + 'px',
                'z-index': '9998',
                'background': options.overlayColor,
                'position': globalPosition,
                'top': '0',
                'left': '0',
                'text-align': 'center',
                'filter': 'alpha(opacity=' + options.overlayOpacity * 100 + ')',
                '-khtml-opacity': options.overlayOpacity,
                '-webkit-opacity': options.overlayOpacity,
                '-moz-opacity': options.overlayOpacity,
                'opacity': options.overlayOpacity
            });
            $('#' + options.overlayId).find(horizon).css({
                'z-index': '9999',
                'position': globalPosition,
                'top': (viewportHeight / 2) + 'px',
                'left': '0',
                'right': '0',
                'height': '1px',
                'text-align': 'center',
                'overflow': 'visible',
                'opacity': 0
            });
            if (options.closable === true) {
                $(overlay).on('click',

                function () {
                    basicOverlay.close(options.overlayId);
                });
                // close by pressing esc
                $(document).on('keyup',

                function (e) {
                    if (e.keyCode === 27) {
                        basicOverlay.close(options.overlayId);
                    }
                    // esc
                });
            }
            // check content and load accordingly
            if (options.externalPage.length > 1) {
                this.loadRemote(options);
            } else {
                if (options.content.length > 1 && options.content.substr(0, 1) === '#'){ 
                    this.loadInPage(options);
                }else{
                    this.loadRemote(options);
                }
            }
        },
        loadInPage: function (options) {
            if ($(options.content).length !== 0) {
                var modal = options.content;
                //var localModal = modal+'_local';
                var h = $(options.content).clone().appendTo(horizon).show().outerHeight();
                //basicOverlay.show(localMmodal, h, options);
                basicOverlay.show(modal, h, options);
            } else {
                basicOverlay.close(options.overlayId);
            }
        },
        loadRemote: function (options) {
            var modal = options.content,
                path = options.externalPage + ' ' + modal;
            $(horizon).load(options.externalPage,

            function (response, status, xhr) {
                var loaded = $(horizon).find(modal).length;
                if (status === 'success' && loaded !== 0) {
                    var h = $(horizon).find(modal).outerHeight();
                    basicOverlay.show(modal, h, options);
                } else {
                    basicOverlay.close(options.overlayId);
                }
            });
        },
        show: function (el, h, options) {
            //if (options.closable == true) {
            $(closeBtn).on('click',

            function () {
                basicOverlay.close(options.overlayId);
            });
            //}
            $(horizon).find(el).css({
                'margin': '0 auto',
                'position': 'relative',
                'top': (-1) * (Math.abs(h / 2)) + 'px',
                'display': 'block'
            });
            // close button
            basicOverlay.current = el;
            basicOverlay.onClose = options.onClose;
            basicOverlay.afterClose = options.afterClose;
            if (options.before) {
                $(horizon).css({
                    'opacity': '1'
                });
                options.before($(horizon).find(el),

                function () {
                    if (options.after) {
                        options.after($(horizon).find(el));
                    }
                });
            } else {
                $(horizon).animate({
                    'opacity': '1'
                },
                500,

                function () {
                    if (options.after) {
                        options.after($(horizon).find(el));
                    }
                });
            }
        },
        open: function (options) {
            // merge with global settings
            options = $.extend({},
            basicOverlay.config, options);
            // merge with element settings
            options = $.extend({},
            basicOverlay.options, options);
            basicOverlay.init(options);
        },
        close: function (id) {
            var el = $(horizon).find(basicOverlay.current);
            if (basicOverlay.onClose) {
                basicOverlay.onClose(el,

                function () {
                    basicOverlay.removeHtml(id);
                });
            } else {
                basicOverlay.removeHtml(id);
            }
        },
        removeHtml: function (id) {
            var el = $(horizon).find(basicOverlay.current);
            $(overlay + ', ' + horizon + ' ,#' + id).remove();
            if (basicOverlay.afterClose) {
                basicOverlay.afterClose(el);
            }
            //unbind
            $(overlay).off('click');
            $(document).off('keyup');
            $(closeBtn).off('click');
            basicOverlay.current = null;
            basicOverlay.onClose = null;
            basicOverlay.afterClose = null;
        }
    };

    // JQUERY STYLE PLUGIN
    $.fn.basicOverlay = function (opts) {
        opts = opts || {};
        return this.each(function () {
            var content;
            var href = $(this).attr('href');
            var data = $(this).attr('data-overlay-modal');

            if (href && href.length > 1) {
                content = data || (href.substr(0, 1) === '#' ? href : false);
                var extP = href.substr(0, 1) !== '#' ? href : false;
            } else {
                content = data;
            }
            if (opts.content || content) {
                opts.content = opts.content || content;
            }
            if (opts.externalPage || extP) {
                opts.externalPage = opts.externalPage || extP;
            }
            $(this).on('click',

            function () {
                basicOverlay.open(opts);
                return false;
            });
        });
    };
    return basicOverlay;
})(jQuery, window, document);