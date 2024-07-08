(function ($) {
    $.fn.quicksand = function (collection, customOptions) {     
        var options = {
            duration: 750, // Duración de la animación en milisegundos
            easing: 'swing', // Tipo de interpolación de la animación
            attribute: 'data-id', // Atributo utilizado para reconocer los mismos elementos en origen y destino
            adjustHeight: 'auto', // Ajuste de altura: 'dynamic' la ajusta durante la animación, 'auto' antes o después, false la deja constante
            useScaling: true, // Habilitar o deshabilitar el uso del efecto de escalado
            enhancement: function(c) {}, // Función de mejora visual para los elementos clonados
            selector: '> *', // Selector de los elementos a animar
            dx: 0, // Desplazamiento en el eje X
            dy: 0 // Desplazamiento en el eje Y
        };
        $.extend(options, customOptions); // Extiende las opciones predeterminadas con las personalizadas
        
        // Deshabilita el escalado en IE o si la función 'scale' no está definida
        if ($.browser.msie || (typeof($.fn.scale) == 'undefined')) {
            options.useScaling = false;
        }
        
        var callbackFunction;
        if (typeof(arguments[1]) == 'function') {
            var callbackFunction = arguments[1]; // Callback function en segundo argumento
        } else if (typeof(arguments[2] == 'function')) {
            var callbackFunction = arguments[2]; // Callback function en tercer argumento
        }
    
        // Itera sobre cada elemento seleccionado
        return this.each(function (i) {
            var val;
            var animationQueue = []; // Cola para almacenar parámetros de animación antes de comenzar
            var $collection = $(collection).clone(); // Clona la colección de destino
            var $sourceParent = $(this); // Contenedor visible de la colección fuente
            var sourceHeight = $(this).css('height'); // Altura del contenedor fuente
            
            var destHeight;
            var adjustHeightOnCallback = false;
            
            var offset = $($sourceParent).offset(); // Offset del contenedor visible
            var offsets = []; // Coordenadas de cada elemento de la colección fuente
            
            var $source = $(this).find(options.selector); // Elementos de la colección fuente
            
            // Reemplaza la colección y sale si es IE6
            if ($.browser.msie && $.browser.version.substr(0,1)<7) {
                $sourceParent.html('').append($collection);
                return;
            }

            // Función que se llama cuando cualquier animación termina
            var postCallbackPerformed = 0; // Previene que la función se llame más de una vez
            var postCallback = function () {
                if (!postCallbackPerformed) {
                    postCallbackPerformed = 1;
                    
                    // Hack para evitar parpadeos en nuevas versiones de Webkit
                    $toDelete = $sourceParent.find('> *');
                    $sourceParent.prepend($dest.find('> *'));
                    $toDelete.remove();
                         
                    if (adjustHeightOnCallback) {
                        $sourceParent.css('height', destHeight);
                    }
                    options.enhancement($sourceParent); // Realiza mejoras visuales en la nueva colección
                    if (typeof callbackFunction == 'function') {
                        callbackFunction.call(this); // Llama a la función de callback si está definida
                    }                    
                }
            };
            
            // Situaciones de posición relativa
            var $correctionParent = $sourceParent.offsetParent();
            var correctionOffset = $correctionParent.offset();
            if ($correctionParent.css('position') == 'relative') {
                if ($correctionParent.get(0).nodeName.toLowerCase() == 'body') {
                    // Si es el body, no hace correcciones adicionales
                } else {
                    correctionOffset.top += (parseFloat($correctionParent.css('border-top-width')) || 0);
                    correctionOffset.left +=( parseFloat($correctionParent.css('border-left-width')) || 0);
                }
            } else {
                correctionOffset.top -= (parseFloat($correctionParent.css('border-top-width')) || 0);
                correctionOffset.left -= (parseFloat($correctionParent.css('border-left-width')) || 0);
                correctionOffset.top -= (parseFloat($correctionParent.css('margin-top')) || 0);
                correctionOffset.left -= (parseFloat($correctionParent.css('margin-left')) || 0);
            }
            
            // Realiza correcciones personalizadas si Quicksand falla en detectarlas correctamente
            if (isNaN(correctionOffset.left)) {
                correctionOffset.left = 0;
            }
            if (isNaN(correctionOffset.top)) {
                correctionOffset.top = 0;
            }
            
            correctionOffset.left -= options.dx;
            correctionOffset.top -= options.dy;

            // Mantiene los nodos después del contenedor fuente, asegurando su posición
            $sourceParent.css('height', $(this).height());
            
            // Obtiene las posiciones de la colección fuente
            $source.each(function (i) {
                offsets[i] = $(this).offset();
            });
            
            // Detiene animaciones previas en el contenedor fuente
            $(this).stop();
            var dx = 0; var dy = 0;
            $source.each(function (i) {
                $(this).stop(); // Detiene la animación de los elementos de la colección
                var rawObj = $(this).get(0);
                if (rawObj.style.position == 'absolute') {
                    dx = -options.dx;
                    dy = -options.dy;
                } else {
                    dx = options.dx;
                    dy = options.dy;                    
                }

                rawObj.style.position = 'absolute';
                rawObj.style.margin = '0';

                rawObj.style.top = (offsets[i].top - parseFloat(rawObj.style.marginTop) - correctionOffset.top + dy) + 'px';
                rawObj.style.left = (offsets[i].left - parseFloat(rawObj.style.marginLeft) - correctionOffset.left + dx) + 'px';
            });
                    
            // Crea un contenedor temporal con la colección de destino
            var $dest = $($sourceParent).clone();
            var rawDest = $dest.get(0);
            rawDest.innerHTML = '';
            rawDest.setAttribute('id', '');
            rawDest.style.height = 'auto';
            rawDest.style.width = $sourceParent.width() + 'px';
            $dest.append($collection);      
            
            // Inserta el nodo en el HTML
            $dest.insertBefore($sourceParent);
            $dest.css('opacity', 0.0);
            rawDest.style.zIndex = -1;
            
            rawDest.style.margin = '0';
            rawDest.style.position = 'absolute';
            rawDest.style.top = offset.top - correctionOffset.top + 'px';
            rawDest.style.left = offset.left - correctionOffset.left + 'px';
            
            if (options.adjustHeight === 'dynamic') {
                // Si el contenedor de destino tiene una altura diferente al de origen,
                // la altura se puede animar, ajustándola a la altura del destino
                $sourceParent.animate({height: $dest.height()}, options.duration, options.easing);
            } else if (options.adjustHeight === 'auto') {
                destHeight = $dest.height();
                if (parseFloat(sourceHeight) < parseFloat(destHeight)) {
                    // Ajusta la altura ahora para que los elementos no se muevan fuera del contenedor
                    $sourceParent.css('height', destHeight);
                } else {
                    // Ajusta más tarde, en el callback
                    adjustHeightOnCallback = true;
                }
            }
                
            // Ahora es el momento de hacer la animación de barajado
            // Primero, necesitamos identificar los mismos elementos en las colecciones de origen y destino    
            $source.each(function (i) {
                var destElement = [];
                if (typeof(options.attribute) == 'function') {
                    val = options.attribute($(this));
                    $collection.each(function() {
                        if (options.attribute(this) == val) {
                            destElement = $(this);
                            return false;
                        }
                    });
                } else {
                    destElement = $collection.filter('[' + options.attribute + '=' + $(this).attr(options.attribute) + ']');
                }
                if (destElement.length) {
                    // El elemento está tanto en la colección de origen como en la de destino
                    // Si está en una posición diferente, vamos a moverlo
                    if (!options.useScaling) {
                        animationQueue.push({
                            element: $(this), 
                            animation: {
                                top: destElement.offset().top - correctionOffset.top, 
                                left: destElement.offset().left - correctionOffset.left, 
                                opacity: 1.0
                            }
                        });
                    } else {
                        animationQueue.push({
                            element: $(this), 
                            animation: {
                                top: destElement.offset().top - correctionOffset.top, 
                                left: destElement.offset().left - correctionOffset.left, 
                                opacity: 1.0, 
                                scale: '1.0'
                            }
                        });
                    }
                } else {
                    // El elemento de la colección fuente no está presente en la colección de destino
                    // Vamos a eliminarlo
                    if (!options.useScaling) {
                        animationQueue.push({
                            element: $(this), 
                            animation: {opacity: '0.0'}
                        });
                    } else {
                        animationQueue.push({
                            element: $(this), 
                            animation: {
                                opacity: '0.0', 
                                scale: '0.0'
                            }
                        });
                    }
                }
            });
            
            $collection.each(function (i) {
                // Obtiene todos los elementos de la colección de destino que no están presentes en la colección visible de origen
                var sourceElement = [];
                var destElement = [];
                if (typeof(options.attribute) == 'function') {
                    val = options.attribute($(this));
                    $source.each(function() {
                        if (options.attribute(this) == val) {
                            sourceElement = $(this);
                            return false;
                        }
                    });                 

                    $collection.each(function() {
                        if (options.attribute(this) == val) {
                            destElement = $(this);
                            return false;
                        }
                    });
                } else {
                    sourceElement = $source.filter('[' + options.attribute + '=' + $(this).attr(options.attribute) + ']');
                    destElement = $collection.filter('[' + options.attribute + '=' + $(this).attr(options.attribute) + ']');
                }
                
                var animationOptions;
                if (sourceElement.length === 0) {
                    // No hay tal elemento en la colección de origen...
                    if (!options.useScaling) {
                        animationOptions = {
                            opacity: '1.0'
                        };
                    } else {
                        animationOptions = {
                            opacity: '1.0',
                            scale: '1.0'
                        };
                    }
                    // Vamos a crearlo
                    d = destElement.clone();
                    var rawDestElement = d.get(0);
                    rawDestElement.style.position = 'absolute';
                    rawDestElement.style.margin = '0';
                    rawDestElement.style.top = destElement.offset().top - correctionOffset.top + 'px';
                    rawDestElement.style.left = destElement.offset().left - correctionOffset.left + 'px';
                    d.css('opacity', 0.0); // IE
                    if (options.useScaling) {
                        d.css('transform', 'scale(0.0)');
                    }
                    d.appendTo($sourceParent);
                    
                    animationQueue.push({
                        element: $(d), 
                        animation: animationOptions
                    });
                }
            });
            
            $dest.remove();
            options.enhancement($sourceParent); // Realiza mejoras visuales personalizadas durante la animación
            for (i = 0; i < animationQueue.length; i++) {
                animationQueue[i].element.animate(animationQueue[i].animation, options.duration, options.easing, postCallback);
            }
        });
    };
})(jQuery);

