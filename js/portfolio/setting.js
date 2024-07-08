jQuery(document).ready(function($) {
    // Verifica si el plugin quicksand está disponible
    if (jQuery().quicksand) {
        // Clona los elementos del portafolio para obtener una segunda colección
        var $data = $(".portfolio").clone();
        
        // NOTA: Solo filtrar en la página principal del portafolio, no en las páginas de subcategorías
        $('.filter li').click(function(e) {
            $(".filter li").removeClass("active"); // Elimina la clase 'active' de todos los filtros
            
            // Usa la última clase de categoría como la categoría para filtrar. Esto significa que no se soportan múltiples categorías (todavía)
            var filterClass = $(this).attr('class').split(' ').slice(-1)[0];
            
            // Filtra los elementos del portafolio según la clase seleccionada
            var $filteredData;
            if (filterClass == 'all') {
                $filteredData = $data.find('.item-thumbs');
            } else {
                $filteredData = $data.find('.item-thumbs[data-type=' + filterClass + ']');
            }
            
            // Usa el plugin quicksand para realizar la transición a la nueva colección filtrada
            $(".portfolio").quicksand($filteredData, {
                duration: 600, // Duración de la animación en milisegundos
                adjustHeight: 'auto' // Ajuste de la altura del contenedor durante la animación
            }, function() {
                // Inicializa el plugin fancybox para los elementos del portafolio
                $(".fancybox").fancybox({
                    padding: 0, // Sin relleno alrededor del contenido
                    beforeShow: function() {
                        // Configura el título y descripción antes de mostrar el fancybox
                        this.title = $(this.element).attr('title');
                        this.title = '<h4>' + this.title + '</h4>' + '<p>' + $(this.element).parent().find('img').attr('alt') + '</p>';
                    },
                    helpers: {
                        title: { type: 'inside' } // Muestra el título dentro del fancybox
                    }
                });
            });
            
            // Añade la clase 'active' al filtro seleccionado
            $(this).addClass("active");
            return false;
        });
    } // if quicksand
});
