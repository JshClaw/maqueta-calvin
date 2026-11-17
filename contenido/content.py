# -*- coding: utf-8 -*-
"""Contenido único del manual (versión manual, con perilla): de aquí salen las diapositivas y el documento imprimible."""

TOTAL = 8

PASOS = [
    # ------------------------------------------------------------------ 1
    dict(
        id='paso1', n=1, tag='Estructura', title='La caja',
        lead='Una caja de 60 × 60 cm y 6.2 cm de alto. Por dentro solo gira un brazo de madera, así que bastan 5 cm libres. '
             'La tapa va atornillada, no pegada, porque la quitarás varias veces.',
        result='Una caja firme con 4 postes adentro y una tapa que se pone y se quita con 4 tornillos.',
        time='≈ 1.5 h + 1 h de secado',
        tools='Serrucho o segueta para madera, lija 120, escuadra, regla, taladro con brocas de 2 y 3.5 mm y broca avellanadora, desarmador de cruz',
        needs=['MDF de 6 mm cortado: fondo y tapa de 60 × 60 cm, 2 paredes de 60 × 5 cm y 2 de 58.8 × 5 cm',
               'Listón o moldura cuadrada de pino de ¾ × ¾″ (≈ 2 × 2 cm), 1 m', '8 pijas (tornillos para madera) de cabeza plana #6 × ¾″',
               'Pegamento blanco de carpintero y cinta masking'],
        media=[('img', 'Caja armada', 'img/arm_caja.jpg', 'Caja de MDF armada con sus esquineros y los 4 postes de apoyo'),
               ('img', 'Despiece', 'img/despiece.jpg', 'Despiece: paredes separadas, brazo con imanes y tapa levantada')],
        ver3d={'armado': 2},
        blocks=[
            ('h', '1. Prepara las piezas'),
            ('ol', [
                'Pide en la maderería los cortes de MDF de 6 mm de la lista ([Cortes para la maderería](#materiales), en Materiales). Lija los cantos con lija 120 para quitar las rebabas.',
                ('Corta el listón con la escuadra, para que los cortes queden rectos, y escribe con lápiz en cada pieza para qué es. Compáralas con los dibujos de la página 5 del PDF (la hoja de **Plantillas**):', [
                    '**8 de 5 cm**: 4 esquineros y 4 postes de apoyo de la tapa.',
                    '**3 de 3 cm**: torres de las 3 tarjetas (Paso 6).',
                    '**1 de 2.5 cm**: torre de la pinza (Paso 6).',
                    '**1 de 7 cm**: torre de la compuerta (se atornilla en el Paso 6; la compuerta se arma en el 7).',
                    '**1 de 7.1 cm y 1 de 1.9 cm**: pilares de la rampa (Paso 7).']),
                'Escribe con lápiz en la cara de adentro de cada pared: FRENTE, ATRÁS, IZQ o DER.',
            ]),
            ('h', '2. Arma la caja'),
            ('ol', [
                'Pon pegamento blanco en el canto de abajo de cada pared y en los cantos donde se juntan. Ármala sobre el fondo: las paredes de 60 cm (frente y atrás) por fuera, y las de 58.8 cm entre ellas.',
                'Pega un esquinero de 5 cm en cada esquina de adentro. Su cara de arriba debe quedar **al ras** del canto de las paredes: revísalo con una regla.',
                'Rodea la caja con masking, pon peso encima y revisa con la escuadra que las esquinas queden a 90°. Deja secar 1 hora; el pegamento termina de endurecer en 24 horas.',
                'Traza con regla las dos diagonales del fondo, de esquina a esquina: donde se cruzan está el centro (30, 30).',
            ]),
            ('h', '3. Postes de apoyo de la tapa'),
            ('ol', [
                'Marca en el fondo los centros de los 4 postes. En el plano están en (14, 15), (46, 15), (15, 45) y (44, 46), medidos desde la esquina de afuera; por dentro de la caja mide desde la cara de adentro de la pared izquierda (x) y de la de atrás (y), y réstale 0.6 cm a cada número (el grueso de la pared): **(13.4, 14.4), (45.4, 14.4), (14.4, 44.4) y (43.4, 45.4)**.',
                'En cada marca, haz un agujero de 3.5 mm que atraviese el fondo.',
                'Pega cada poste de 5 cm parado sobre su marca y deja secar.',
                'Voltea la caja. Por cada agujero, perfora 2 cm dentro del poste con broca de 2 mm (si no, la madera se raja), avellana el agujero del fondo y pon un tornillo. La cabeza debe quedar al ras para que la caja no cojee.',
            ]),
            ('h', '4. La tapa'),
            ('ol', [
                'Pon la tapa encima. Debe apoyar parejo sobre paredes, esquineros y postes; si cojea, lija lo que sobresale.',
                'Marca 4 agujeros, uno en cada esquina, a **1.6 cm de cada orilla** (justo encima del esquinero). Perfora la tapa con 3.5 mm y el esquinero con 2 mm, 2 cm de hondo. Avellana y atornilla.',
                'Escribe con plumón "FRENTE ↓" en la cara de abajo de la tapa, del lado del frente, para ponerla siempre igual.',
                'Quita la tapa: la forras en el Paso 2.',
            ]),
            ('note', 'idea', '**¿No encuentras el listón?** Sirve cualquier palito cuadrado de 1.8 a 2.5 cm de grueso: lo que importa son los largos de los cortes. Se usan unos 68 cm, así que con 1 m sobra. '
                             'Búscalo en Home Depot o en la tlapalería, en el pasillo de molduras; en una maderería, pidiendo una tira de 2 × 2 cm cortada de una tabla de pino; o en papelería, como "varilla cuadrada de madera". '
                             'Si no lo encuentras, pega una sobre otra 3 tiras de MDF de 6 mm × 2 cm.'),
            ('note', 'idea', '**¿Por qué 4 postes?** Los imanes del brazo y los del vagón se jalan con una fuerza de unos 300 gramos. Sin postes, una tapa de 60 cm se hundiría un poco en el centro y el brazo rasparía.'),
            ('note', 'warn', '**Taladro:** usa lentes y sujeta la pieza con una prensa, nunca con la mano. Si en la escuela no hay taladro, pide los agujeros en la maderería: vienen en la lista de cortes.'),
        ]),
    # ------------------------------------------------------------------ 2
    dict(
        id='paso2', n=2, tag='Tapa', title='La impresión del ciclo',
        lead='La página 1 del PDF se imprime a tamaño real (60 × 60 cm) en vinil adherible mate y se pega sobre la tapa. '
             'Trae la pista, las 8 paradas numeradas y una marca para cada pieza, agujero y tornillo.',
        result='La tapa forrada con el vinil, con el agujero del centro y los 5 agujeros de las torres, y las páginas 2 a 7 impresas.',
        time='≈ 45 min + la impresión',
        tools='Tarjeta de plástico, cúter, alfiler, taladro con broca de 3.5 mm y broca de paleta de ⅝″, madera de sacrificio, desarmador de cruz',
        needs=['Página 1 del PDF impresa en vinil adherible mate de 60 × 60 cm', 'Páginas 2 a 7 impresas en hojas tamaño carta', 'La tapa del Paso 1'],
        media=[('img', 'El archivo', 'img/vinil.jpg', 'Diseño del vinil de 60 por 60 centímetros con la pista y las paradas numeradas', 'square'),
               ('img', 'Tapa puesta', 'img/arm_tapa.jpg', 'Caja con la tapa, el vinil y la perilla al centro'),
               ('img', 'Vista superior', 'img/top.jpg', 'Maqueta vista desde arriba')],
        ver3d={'armado': 5},
        pdf=True,
        blocks=[
            ('ol', [
                'Lleva el PDF a un local de impresión de gran formato (plotter). Pide la **página 1** a escala **100 %** (tamaño real, sin "ajustar a la página") en **vinil adherible mate**: el brillante refleja la luz y el vagón resbala distinto.',
                'Comprueba la escala con la regla impresa abajo a la derecha: debe medir **10 cm exactos**. Si no, pide que la reimpriman.',
                'Imprime tú las páginas 2 a 7 en hojas tamaño carta, también al **100 %** (en el cuadro de impresión elige "tamaño real"). Abajo de cada hoja dice «hoja 1 de 6» a «hoja 6 de 6»: la hoja 1 es la página 2 del PDF, y así. Comprueba: el disco del vagón de la hoja de **Plantillas** debe medir 4.5 cm.',
                'Limpia la tapa con un trapo seco. Ponla boca arriba, con el lado del frente hacia ti (la marca "FRENTE ↓" que escribiste queda abajo, en esa orilla). El vinil va con la regla de 10 cm abajo a la derecha: la palabra FIJACIÓN queda hacia atrás.',
                'Despega solo 10 cm del papel protector, alinea dos esquinas con las de la tapa y pégalas. Ve quitando el resto del protector mientras alisas con una tarjeta de plástico, del centro hacia afuera. Si queda una burbuja, pícala con un alfiler y alísala.',
                'Agujero del centro: corta el vinil en cruz sobre la cruz del centro. Si la maderería no te hizo el agujero, perfora ahí con broca de paleta de **⅝″** (16 mm), con una madera debajo. Por aquí pasará el palo de la perilla: es más ancho que el palo para que gire suelto.',
                'Agujeros de las torres: busca los **5 cuadritos punteados de 2 × 2 cm que tienen una crucecita** (pinza, ATP, NADPH, ATP de regeneración y compuerta) y perfora en la crucecita con **3.5 mm**, de lado a lado. Por ellos entran los tornillos que sujetan las torres desde abajo. Los 2 cuadritos de la rampa no llevan crucecita ni agujero: ahí solo se pegan los pilares.',
                'Corta el vinil en cruz sobre los 4 agujeros de las esquinas y vuelve a atornillar la tapa.',
            ]),
            ('note', 'idea', '**Sin vinil también funciona:** imprime la página 1 en hojas carta con la opción "póster" de tu lector de PDF al 100 %, une las hojas con cinta por detrás y pégalas con adhesivo en aerosol. Revisa que la regla mida 10 cm.'),
            ('note', 'idea', '**Las paradas numeradas** son las rayitas negras con número en la orilla de la pista. Ahí se detiene el vagón: del 0 (RuBP, el inicio) al 7 (ATP de regeneración).'),
        ]),
    # ------------------------------------------------------------------ 3
    dict(
        id='paso3', n=3, tag='Mecanismo', title='El brazo con imanes y la perilla',
        lead='Es el corazón de la maqueta: una sola pieza que gira. Arriba de la tapa va la perilla; un palo la atraviesa por el centro '
             'y abajo sostiene el brazo con imanes. Al girar la perilla, los imanes jalan al vagón a través de la madera, como si se moviera solo.',
        result='La perilla, el palo y el brazo unidos en una sola pieza que gira sin raspar.',
        time='≈ 2 h (incluye 1 h de curado)',
        tools='Taladro con broca de paleta de ½″ y broca de 12 mm, caladora (recomendada) o sierra de copa, segueta, lija 120, escuadra, desarmador de cruz, guantes, 2 pilas de libros',
        needs=['Tira de MDF de 6 mm de 31 × 2.5 cm (brazo)', 'Retazo de MDF de 6 mm para 2 discos de 4.5 cm (perilla)',
               'Palo redondo de madera de ½″, 4 cm', '2 imanes de neodimio de 12 × 3 mm', '2 cuadros de fieltro adhesivo de 2 × 2 cm, de 2 mm de grueso',
               'Rondana plana de ½″', 'Plastiacero (pegamento epóxico de 2 partes)', 'Los 2 imanes de 10 × 3 mm del vagón, sueltos (sostienen el brazo mientras seca)',
               'Calcomanía de la perilla (página 4, opcional)'],
        media=[('img', 'Por dentro', 'img/brazo_det.jpg', 'El brazo de madera con imanes y fieltros, unido a la perilla por el palo'),
               ('svg', 'Plano del brazo', 'brazo'),
               ('img', 'La perilla', 'img/perilla_det.jpg', 'La perilla sobre su rondana, al centro del ciclo'),
               ('img', 'Tapa transparente', 'img/transparente.jpg', 'Con la tapa transparente se ve el brazo justo debajo del vagón')],
        ver3d={'punto': 'brazo'},
        blocks=[
            ('h', '1. El brazo'),
            ('ol', [
                'Marca con un clavo el **centro** de la tira de 31 × 2.5 cm (a **15.5 cm** de cada punta) y el centro del agujero de los imanes, a **14.4 cm** del centro (1.1 cm antes de una punta). Puedes usar el brazo de la hoja de **Plantillas** (página 5): pon su raya roja sobre el centro de la tira. La plantilla dice 30 cm y se queda 5 mm antes de la punta: es correcto, la tira es más larga para que quede madera alrededor de los imanes.',
                'Si la maderería no te hizo los agujeros, prensa la tira sobre una madera de sacrificio y perfora: al centro con broca de paleta de **½″** (ahí entra el palo) y en la marca de los imanes con broca de **12 mm**. Que atraviesen. Entre el agujero de los imanes y la punta quedan 5 mm de madera.',
                'Junta los 2 imanes de 12 × 3 mm uno sobre otro (se pegan solos) y mete los imanes encimados en su agujero: deben quedar **al ras** por las dos caras (3 + 3 = 6 mm, lo mismo que el MDF). Antes de meterlos, unta una capa delgada de Plastiacero en la pared del agujero. Limpia lo que se salga y no los muevas en 5 minutos, que es lo que tarda en fijar.',
                'Escoge la cara de **arriba** (la que mirará a la tapa) y escribe "ARRIBA" con lápiz. Pega ahí un cuadro de fieltro en cada punta, al ras de la orilla: uno queda encima de los imanes.',
            ]),
            ('h', '2. El palo'),
            ('ol', [
                'Corta el palo redondo de ½″ a **4 cm** con la segueta y lija las puntas.',
                'Ponle poco Plastiacero en la punta y mételo en el agujero del centro del brazo, desde la cara de ARRIBA, hasta que quede **al ras por abajo**. Sobresale 3.4 cm por arriba. Limpia con un trapo lo que se salga antes de que endurezca.',
                'Antes de que seque, pon la escuadra junto al palo: tiene que quedar **parado a 90°** del brazo, visto de frente y de lado. Si queda chueco, el brazo raspará la tapa.',
            ]),
            ('h', '3. La perilla'),
            ('ol', [
                'Corta 2 discos de MDF de 4.5 cm con la plantilla de la perilla (página 5) y la caladora. Del retazo de 15 × 6 cm salen los 3 discos (2 de la perilla y 1 del vagón). Lija la orilla.',
                'Haz el agujero del centro de cada disco con la broca de paleta de ½″ (si usaste sierra de copa, agranda el que dejó la broca guía). Prueba que el palo entre justo.',
                'Pega los 2 discos uno sobre otro con pegamento blanco. Para alinear los agujeros, mete el palo **sin pegamento** y sácalo cuando estén alineados. Deja secar.',
                'Opcional: pega arriba la calcomanía de la página 4 con lápiz adhesivo, con la flecha en sentido horario. Mide 4.5 cm: si tu disco salió de 4 cm, recórtala a su tamaño.',
            ]),
            ('note', 'idea', '**¿Con sierra de copa?** Saca un disco más chico que su medida. La de 44 mm da discos de unos 4 cm, que también funcionan. Con una de 48 mm (1⅞″) o 51 mm (2″) salen de 4.5 cm lijando lo que sobre, pero del retazo de 15 × 6 cm solo caben 2: el del vagón (Paso 4) sale de otro retacito de MDF de 6 mm, que en la maderería suelen regalar.'),
            ('h', '4. Montaje en la tapa'),
            ('ol', [
                'Quita la tapa de la caja y ponla **boca arriba** sobre 2 pilas de libros, una bajo cada orilla, para que el centro quede al aire: el brazo necesita girar unos 16 cm alrededor del centro sin tocar nada.',
                'Mete el palo del brazo **desde abajo** por el agujero del centro, con los fieltros hacia la tapa.',
                'Pon los 2 imanes de 10 × 3 mm sueltos sobre la pista, justo encima de los imanes del brazo: se jalan a través de la madera y **sostienen el brazo** pegado a la tapa. Ya tienes las manos libres.',
                'Arriba, mete la rondana en el palo. Unta una capa delgada de Plastiacero alrededor del palo, solo en el tramo que quedará dentro de la perilla, sin llegar a la rondana. Mete la perilla y empújala hasta que toque la rondana: el palo sobresale como 1 cm arriba de la perilla, así debe quedar. Limpia con un trapo lo que se salga por arriba antes de que endurezca: es negro y ahí se ve. No la muevas en 5 minutos, que es lo que tarda en fijar.',
                'Espera 1 hora a que cure. Luego quita los imanes sueltos y gira la perilla una vuelta completa: el brazo gira con ella, los fieltros rozan la tapa y nada raspa. Ahora la tapa, el palo, el brazo y la perilla son una sola pieza.',
                'Pon la tapa en la caja y atorníllala.',
            ]),
            ('note', 'idea', '**¿Por qué el vagón se mueve solo?** Los imanes de neodimio son tan fuertes que su atracción atraviesa la tapa de 6 mm. Los del brazo jalan a los del vagón: al girar la perilla mueves el brazo escondido y el vagón lo sigue por encima.'),
            ('note', 'warn', '**Imanes de neodimio:** se pegan muy fuerte y pueden pellizcarte o romperse si chocan. Sepáralos deslizándolos, no jalándolos, y guárdalos lejos de celulares y tarjetas. **Plastiacero:** usa guantes. Es negro: pon poco y limpia lo que se salga antes de que endurezca; ya duro no se quita y se ve feo, sobre todo en la perilla.'),
        ]),
    # ------------------------------------------------------------------ 4
    dict(
        id='paso4', n=4, tag='Mecanismo', title='El vagón',
        lead='Un disco de MDF con dos imanes al centro, forrado abajo con tela de teflón para que resbale, y una placa 4 × 4 arriba con el bloque verde: el carbono del CO₂. Pesa unos 15 g.',
        result='Un vagón que sigue a la perilla por toda la pista sin quedarse atrás.',
        time='≈ 45 min + 1 h de curado',
        tools='Caladora (recomendada) o sierra de copa, taladro con broca de 10 mm, lija 120, cúter, tijeras, plumón, guantes',
        needs=['Lo que quedó del retazo de MDF de 15 × 6 cm (alcanza para el disco)', '2 imanes de neodimio de 10 × 3 mm',
               'Tela o cinta de teflón para selladora, 7 × 7 cm (o fieltro adhesivo delgado)',
               'Placa 4 × 4 y un bloque 1 × 1 verde', 'Plastiacero y pegamento de contacto', 'Un pedazo de lija 120'],
        media=[('img', 'Vagón', 'img/vagon_det.jpg', 'Vagón sobre la pista con la placa 4 por 4 y el bloque verde'),
               ('svg', 'Capas', 'vagon'),
               ('img', 'En la parada 1', 'img/vagon_pinza.jpg', 'La pinza RuBisCO sobre el vagón en la parada 1')],
        ver3d={'punto': 'vagon'},
        blocks=[
            ('ol', [
                'Traza el disco con la plantilla del vagón (página 5, Ø 4.5 cm) y córtalo con la caladora. Con sierra de copa también sirve (el agujero de la broca guía te marca el centro), pero el disco sale más chico: lee la nota de la perilla en el [Paso 3](#paso3). Lija la orilla.',
                'Haz un agujero de 10 mm justo al centro, que atraviese el disco.',
                'Busca qué cara va abajo: junta los 2 imanes de 10 × 3 uno sobre otro, ponlos sobre la pista y muévelos despacio alrededor. En un punto se quedarán pegados solos: ahí abajo están los imanes del brazo. Marca con plumón la cara que quedó **hacia arriba**. Si en vez de pegarse se voltean o se alejan, voltéalos y vuelve a probar.',
                'Mete los imanes encimados en el agujero con la cara marcada **hacia arriba**, al ras por los dos lados, y fíjalos con poco Plastiacero. Limpia lo que se salga por las dos caras y no los muevas en 5 minutos. Antes de forrar, espera 1 hora a que cure.',
                ('Forra la cara de abajo con la tela de teflón, como un tambor. Si tu tela sí trae adhesivo, solo pégala en la cara de abajo y recórtala a la orilla. Si no trae (lo más común):', [
                    'Si quedó Plastiacero salido en la cara de abajo, líjalo al ras: cualquier bulto se nota a través de la tela.',
                    'Corta un círculo de tela de **7 cm** (todo el cuadro de 7 × 7). El disco mide 4.5 cm: lo que sobra sube por el canto de 6 mm y se dobla sobre la cara de arriba.',
                    'Pon el disco en el centro del círculo y marca su orilla. Haz cortecitos cada 1 cm, desde la orilla de la tela hasta la marca: son las pestañas, para que doble sin arrugas.',
                    'Lija las pestañas con lija 120 por el lado que toca el disco, para que el pegamento agarre la fibra.',
                    'Unta pegamento de contacto en las pestañas y en la orilla de la cara de arriba del disco. Espera unos 10 minutos, hasta que ya no se pegue al dedo.',
                    'Pon el disco sobre la tela, con su cara de abajo hacia la tela. Dobla las pestañas una por una hacia la cara de arriba, jalándolas para que abajo quede liso y sin arrugas.',
                    'La cara de abajo queda solo de teflón: sin pegamento y sin cinta, porque hacen bultos y frenan el vagón. Nada de grapas ni clavos: son de metal y van junto a los imanes.']),
                'Pega la placa 4 × 4 centrada en la cara de arriba con pegamento de contacto: queda encima de parte de las pestañas y ayuda a sujetarlas. Si tu disco salió de 4 cm, las esquinas de la placa sobresalen un poco; funciona igual.',
                'Pon el bloque verde en el pivote de la **fila 2, columna 2** (uno de los 4 del centro).',
                'Prueba: pon el vagón en la pista, encima de los imanes del brazo, y gira la perilla despacio. El vagón debe seguirlo sin quedarse atrás.',
            ]),
            ('note', 'idea', '**¿Qué tela compro?** Tela (o cinta) de teflón para selladora térmica: es PTFE con fibra de vidrio, brillosa, café clara o blanca, y casi siempre viene sin adhesivo. Se consigue en tienda en línea, ferretería grande o tienda de empaque. '
                             '**No** es la cinta blanca de plomería, la de las roscas. Si lo que encuentras es una lámina rígida que no se dobla, no se puede forrar: usa fieltro adhesivo delgado. '
                             'Si no encuentras la tela, usa fieltro adhesivo delgado; de emergencia, cinta de empaque transparente bien lisa.'),
            ('note', 'warn', '**¿Se queda atrás?** 1) Gira más despacio. 2) Revisa que la base esté lisa, sin arrugas ni bultos de pegamento o de Plastiacero: el teflón resbala mucho mejor que el fieltro. '
                             '3) Lo de abajo no debe pasar de 1 mm de grueso: los deslizadores para muebles, por ejemplo, separan los imanes de la tapa y el vagón se queda atrás. '
                             '4) Si el vagón brinca o se voltea, los imanes quedaron al revés: sácalos y voltéalos.'),
        ]),
    # ------------------------------------------------------------------ 5
    dict(
        id='paso5', n=5, tag='Moléculas', title='Las estaciones con bloques',
        lead='Cada bloque 1 × 1 es un átomo de carbono. Las moléculas se arman una vez y se quedan en su estación: usas 81 bloques negros y 1 verde, y las cuentas de carbonos cuadran en cada paso del ciclo.',
        result='Las 5 placas con sus bloques pegadas en su lugar y la pieza de salida armada.',
        time='≈ 45 min',
        tools='Tijeras',
        needs=['5 placas 8 × 8 (6.4 × 6.4 cm)', '81 bloques 1 × 1 negros o gris oscuro (compra 90)', '1 placa 1 × 3',
               'Página 7 impresa (mapas de bloques)', 'Cinta doble cara de espuma', 'Pegamento instantáneo'],
        media=[('svg', 'Mapas de bloques', 'lego'),
               ('img', 'RuBP y 3-PGA', 'img/estaciones.jpg', 'Estaciones RuBP y 3-PGA con bloques negros'),
               ('img', 'Regeneración', 'img/regen_det.jpg', 'Mesa de regeneración: 5 piezas de 3 y 3 piezas de 5'),
               ('img', 'Placas en su lugar', 'img/arm_mid.jpg', 'Tapa con las placas, las tarjetas y la pinza puestas')],
        ver3d={'punto': 'rubp'},
        blocks=[
            ('table', ['Estación', 'Centro (x, y)', 'Bloques', 'Dónde va cada uno'], [
                ['**RuBP** (parada 0)', '(12.7, 12.7)', '15', 'Filas 2, 4 y 6; columnas 2 a 6. Cada fila es una RuBP de 5 carbonos.'],
                ['**3-PGA** (parada 2)', '(47.3, 12.7)', '18', 'Filas 2, 4 y 6; columnas 1 a 3 y 5 a 7: 6 piezas de 3.'],
                ['**G3P** (parada 5)', '(30, 54.5)', '15', 'Filas 2 y 4: columnas 1 a 3 y 5 a 7. Fila 6: solo columnas 1 a 3. El hueco es la G3P que sale.'],
                ['**Regeneración, la de atrás** (parada 6)', '(7, 31)', '15', 'Igual que G3P: 5 G3P.'],
                ['**Regeneración, la de adelante**', '(7, 39.5)', '15', 'Igual que RuBP: 3 RuBP.'],
                ['**Pieza de salida**', 'arriba de la rampa', '3', 'Sobre una placa 1 × 3.'],
                ['**Vagón**', 'sobre la pista', '1 verde', 'Fila 2, columna 2 de la placa 4 × 4.'],
            ]),
            ('ol', [
                'Pon cada placa encima de su mapa de la página 7 (la hoja **Dónde va cada bloque**) y coloca un bloque en cada cuadro negro. Presiónalos hasta que hagan clic.',
                'Cuenta: cada grupo de bloques juntos es una molécula (5 bloques = RuBP; 3 bloques = 3-PGA o G3P). Entre molécula y molécula queda libre una fila o columna de pivotes.',
                'Pieza de salida: pon 3 bloques sobre la placa 1 × 3 y pégalos con una gota de pegamento instantáneo: esta pieza baja por la rampa y no se debe desarmar.',
                'Pega 4 cuadritos de cinta doble cara de espuma en las esquinas de abajo de cada placa y pégala centrada sobre su cuadro punteado del vinil. **La fila 1 va hacia la pared de atrás.**',
                'No pegues los bloques de las estaciones: así puedes quitarlos para explicar cómo se rearman.',
            ]),
            ('note', 'idea', '**Las cuentas cuadran:** 3 RuBP (15 C) + 3 CO₂ (3 C) = 6 3-PGA (18 C) → 6 G3P (18 C). Sale 1 G3P (3 C) y los otros 5 (15 C) se rearman en 3 RuBP (15 C).'),
        ]),
    # ------------------------------------------------------------------ 6
    dict(
        id='paso6', n=6, tag='Piezas a mano', title='Tarjetas giratorias y pinza RuBisCO',
        lead='Cada pieza que se mueve con la mano va sobre una torre de listón atornillada por debajo de la tapa: aquí se atornillan las 5, también la de la compuerta del Paso 7. '
             'Las tarjetas giran sobre un palito de brocheta y la pinza sobre un tornillo.',
        result='3 tarjetas que giran y se quedan donde las dejas, y la pinza que llega sobre el vagón en la parada 1.',
        time='≈ 1.5 h',
        tools='Taladro con brocas de 2 y 3.5 mm, desarmador de cruz, cúter, tijeras, regla, pistola de silicón de baja temperatura, pincel',
        needs=['Las 5 torres del Paso 1: 3 de 3 cm, 1 de 2.5 cm y 1 de 7 cm', 'Cartón gris de 2 mm (o cartulina gruesa): 6 rectángulos de 6 × 8 cm', '3 palitos de brocheta',
               'Caras de las tarjetas (página 2 del PDF)', 'Palito de paleta, pinza de ropa de madera y pintura acrílica amarilla',
               '5 pijas #6 × ¾″, 1 pija #6 × ½″ y 1 rondana chica', 'Lápiz adhesivo, silicón de baja temperatura y masking'],
        media=[('img', 'Tarjetas', 'img/tarjetas.jpg', 'La tarjeta ATP a media vuelta, mostrando su cara gastada'),
               ('svg', 'La tarjeta por dentro', 'tarjeta'),
               ('img', 'Pinza', 'img/pinza_det.jpg', 'Pinza RuBisCO amarilla sobre su palito y su torre'),
               ('img', 'Pinza sobre el CO₂', 'img/vagon_pinza.jpg', 'La pinza girada a mano sobre el vagón en la parada 1')],
        ver3d={'punto': 'atp'},
        blocks=[
            ('h', '1. Las torres'),
            ('ol', [
                'En la cara de abajo de las 5 torres, marca el centro cruzando las diagonales y haz un agujero de **2 mm**, 1.5 cm de hondo: ahí entrará el tornillo que viene de abajo.',
                'En las 3 de 3 cm (las de las tarjetas), haz arriba al centro un agujero de **3.5 mm** y 1.2 cm de hondo: ahí girará el palito. Marca la broca con un pedazo de cinta para saber hasta dónde meterla.',
                'En la de 2.5 cm (pinza) y la de 7 cm (compuerta), haz arriba al centro un agujero de **2 mm** y 1 cm de hondo: ahí entrará el tornillo que hace de eje. Sin él, el listón se raja.',
                'Quita la tapa (sale junto con la perilla y el brazo) y ponla boca arriba sobre las 2 pilas de libros.',
                ('Pon cada torre sobre su cuadro punteado y atorníllala desde abajo por el agujero que hiciste en el Paso 2:', [
                    '**Pinza:** (30, 7.5), arriba de la pista.',
                    '**ATP:** (52.5, 30), a la derecha.',
                    '**NADPH:** (47.2, 44.5), abajo a la derecha.',
                    '**ATP de regeneración:** (8.9, 22.3), a la izquierda.',
                    '**Compuerta (la de 7 cm):** (22.9, 50.3), abajo a la izquierda, junto a donde irá la rampa.']),
                'Regresa la tapa a la caja y atorníllala.',
            ]),
            ('h', '2. Tarjetas giratorias (haz 3)'),
            ('ol', [
                'Corta 6 rectángulos de cartón de 6 × 8 cm.',
                ('Recorta las caras de la página 2 y pégalas con lápiz adhesivo, una en cada cartón, con las letras derechas:', [
                    '**6 ATP** y **6 ADP**.', '**6 NADPH** y **6 NADP⁺**.', '**3 ATP** y **3 ADP** (regeneración).']),
                'Corta 3 palitos de brocheta de **9 cm** y quítales la punta.',
                'Pon una línea de silicón en la espalda del cartón de la cara gastada (ADP o NADP⁺), acuesta el palito justo en medio, a lo largo, con **1.5 cm** saliendo por abajo, y tapa con el cartón de la cara cargada, espalda con espalda. Aprieta 30 segundos.',
                'Mete cada palito en su torre: la tarjeta debe quedar 3 mm arriba de la torre y **girar con los dedos**, quedándose donde la dejes. Si gira sola o queda floja, enrolla una vuelta de masking en la punta del palito.',
                'Déjalas con la cara **cargada** (ATP, NADPH) hacia el frente.',
            ]),
            ('h', '3. Pinza RuBisCO'),
            ('ol', [
                'Pinta la pinza de ropa de amarillo y deja secar 20 minutos.',
                'Con la plantilla del brazo de la pinza (página 5), haz en el palito de paleta un agujero de **3.5 mm** a 6 mm de una punta.',
                'Pega la pinza **acostada** sobre el palito con silicón, con la boca hacia la punta sin agujero: la boca queda a **8 cm** del agujero (marca de la plantilla).',
                'Atornilla el palito encima de su torre con la pija de #6 × ½″ (la corta, para que no choque con la de abajo) y una rondana chica entre el palito y la torre. No lo aprietes de más: debe girar con un dedo y quedarse quieto.',
                'Déjala en reposo apuntando a la **izquierda**, paralela a la pista. Prueba: gira la perilla hasta la parada 1 y lleva la pinza con la mano: su boca debe quedar encima del bloque verde.',
            ]),
            ('note', 'idea', '**¿Por qué tornillo y no pegamento?** Así las piezas aguantan cientos de vueltas sin despegarse. El tornillo de abajo sujeta la torre; el de arriba de la pinza solo hace de eje.'),
        ]),
    # ------------------------------------------------------------------ 7
    dict(
        id='paso7', n=7, tag='Piezas a mano', title='Rampa, compuerta, glucosa, letreros y solapas',
        lead='En la parada 5 se abre la compuerta y una pieza de 3 bloques baja por la rampa hasta la caja de glucosa. '
             'La compuerta es un abatelenguas que gira en un tornillo y cruza el canal por un tramo donde las paredes están recortadas.',
        result='La rampa con su compuerta, la caja de glucosa, los 2 letreros y las 2 solapas.',
        time='≈ 1.5 h',
        tools='Cúter, regla metálica, tijeras, taladro con broca de 3.5 mm, desarmador, pistola de silicón de baja temperatura',
        needs=['Foamboard de 5 mm', 'Acetato o mica de 20 × 5 cm', 'Los pilares de 7.1 y 1.9 cm del Paso 1 (la torre de 7 cm ya quedó atornillada en el Paso 6)',
               'Abatelenguas, 1 pija #6 × ½″ y 1 rondana chica', 'Páginas 3, 4, 5 y 6 impresas',
               'Silicón de baja temperatura, cinta doble cara delgada y de espuma, cinta transparente ancha, lápiz adhesivo'],
        media=[('svg', 'Rampa de lado', 'rampa'),
               ('img', 'Compuerta abierta', 'img/compuerta.jpg', 'Compuerta girada: la pieza G3P baja por la rampa'),
               ('img', 'De cerca', 'img/rampa_det.jpg', 'Rampa con la pieza G3P esperando detrás del abatelenguas')],
        ver3d={'punto': 'compuerta', 't': 19.3},
        blocks=[
            ('h', '1. El canal'),
            ('ol', [
                'Con la plantilla de la página 6 (la hoja **Rampa de la compuerta**) corta en foamboard: el **piso de 15.5 × 3 cm**, **2 paredes de 15.5 × 1 cm** y un **tope de 2 × 1 cm**.',
                'En las 2 paredes, entre 2.5 y 6.5 cm desde la punta de arriba, recorta la pared dejándola de **3 mm de alto** (la zona gris de la plantilla). Ahí pasará el abatelenguas.',
                'Pega las paredes **encima** de las orillas largas del piso (queda un canal de 2 cm) y el tope cerrando la punta de arriba, con silicón de baja temperatura.',
                'Pega dentro del canal una tira de acetato de 15 × 2 cm con cinta doble cara delgada, lisa y sin burbujas: es el tobogán.',
            ]),
            ('h', '2. Caja de glucosa (va antes que la rampa)'),
            ('ol', [
                'Corta en foamboard la base de 9 × 8 cm y pégale encima, con lápiz adhesivo, el hexágono de "½ glucosa" de la página 4.',
                'Corta 2 paredes de 9 × 1.5 cm y 2 de 7 × 1.5 cm y pégalas paradas **encima** de las orillas de la base, las cortas entre las largas.',
                'Pega la caja en su rectángulo, de (2, 50) a (11, 58), con cinta doble cara **delgada**: así su orilla queda a 2 cm, a la altura de la punta de la rampa. Con cinta de espuma quedaría más alta y la pieza G3P se atoraría.',
            ]),
            ('h', '3. Pilares y rampa'),
            ('ol', [
                'Pega los pilares de pino parados, con silicón, sobre sus cuadritos punteados: el de **7.1 cm en (25.5, 54)** y el de **1.9 cm en (12, 54)**.',
                'Pon el canal encima, con el tope arriba. La punta de arriba queda en x = 26.5 (a 3 mm de la placa G3P) y la de abajo en x = 11, tocando por fuera la pared de la caja de glucosa. Compara con la vista de lado de la página 6: la superficie del piso queda a **8 cm sobre la tapa** arriba y a **2 cm** abajo, a la altura de la orilla de la caja.',
                'Pega el canal a los pilares rellenando con silicón la cuña entre el pilar y el piso inclinado.',
                'Prueba: suelta la pieza G3P desde arriba. Debe bajar sola y caer en la caja. Si se atora, revisa que el acetato esté liso, que nada roce y que la orilla de la caja no quede más alta que la punta de la rampa.',
            ]),
            ('h', '4. La compuerta'),
            ('ol', [
                'Revisa que la torre de **7 cm** ya esté atornillada en **(22.9, 50.3)**, junto a la parte de arriba de la rampa (Paso 6). Si no, quita la tapa y atorníllala desde abajo como las demás.',
                'Corta un abatelenguas a **8 cm** y haz un agujero de **3.5 mm** a 1 cm de una punta (plantilla de la compuerta, página 5).',
                'Atorníllalo encima de la torre con la pija de #6 × ½″ y una rondana chica en medio, sin apretar de más. En reposo, la punta larga cruza el canal por el tramo recortado, unos **5 mm arriba del piso**, sin tocarlo.',
                'Pon la pieza G3P arriba de la rampa: debe quedarse detenida por el abatelenguas. Gíralo hacia la caja de glucosa: la pieza baja sola y cae en la caja.',
            ]),
            ('h', '5. Letreros y solapas'),
            ('ol', [
                'Corta en foamboard 2 letreros de 17 × 6 cm, 2 piezas de 14 × 6 cm (solapa "¿Dónde ocurre?") y 2 de 10 × 5 cm (solapa "¿Por qué le dicen fase oscura?").',
                'Pega con lápiz adhesivo cada impresión de las páginas 3 y 4 sobre su pieza y recorta lo que sobre.',
                'Pega los letreros sobre sus rectángulos, en (2, 2) y (41, 2), con cinta doble cara de espuma.',
                'Solapas: pega la pieza de la **respuesta** sobre su rectángulo de la tapa con cinta doble cara de espuma; encima pon la de la **pregunta** y únelas con cinta transparente por la orilla de atrás, como bisagra. Al levantarla se lee la respuesta.',
            ]),
        ]),
    # ------------------------------------------------------------------ 8
    dict(
        id='paso8', n=8, tag='Prueba', title='Probar y ensayar',
        lead='Antes de presentarla, dale varias vueltas completas. Cada parada debe funcionar a la primera y cada quien debe saber qué le toca.',
        result='Una vuelta completa que sale bien a la primera, y cada quien sabe qué le toca.',
        time='≈ 30 min',
        tools='Desarmador (por si hay que ajustar un tornillo)',
        needs=[],
        media=[('img', 'Terminada', 'img/hero.jpg', 'La maqueta terminada con la pinza sobre el vagón'),
               ('img', 'Desde arriba', 'img/top.jpg', 'La maqueta vista desde arriba')],
        ver3d={'t': 0.0, 'armado': 11},
        blocks=[
            ('h', '1. Revisión'),
            ('ol', [
                'Gira la perilla una vuelta completa, despacio: el vagón sigue al brazo sin quedarse atrás y nada raspa.',
                'Detén el vagón en cada número de la orilla de la pista (0 a 7): debe quedar centrado frente a su estación.',
                'Parada 1: la pinza llega justo encima del bloque verde.',
                'Paradas 3, 4 y 7: cada tarjeta gira media vuelta y se queda quieta.',
                'Parada 5: el abatelenguas detiene la pieza G3P y, al girarlo, la pieza baja y cae en la caja.',
                'Las dos solapas se levantan y se lee la respuesta.',
            ]),
            ('h', '2. Antes de cada presentación'),
            ('ol', [
                'Vagón en la parada 0 (RuBP).',
                'Tarjetas con la cara cargada (ATP, NADPH) hacia el frente.',
                'Pinza en reposo, apuntando a la izquierda.',
                'Pieza G3P arriba de la rampa, detrás del abatelenguas.',
                'Solapas cerradas.',
            ]),
            ('h', '3. Ensayo con papeles'),
            ('ol', [
                'Repartan los 4 papeles de [Presentar](#clase): conductor, RuBisCO, energía y salida.',
                'Den una vuelta completa diciendo cada quien su parte en voz alta. Con explicación, una vuelta dura de 2 a 3 minutos.',
                'Cambien de papel y repitan: así todos entienden el ciclo completo, no solo su parte.',
            ]),
            ('note', 'idea', '**Si algo falla**, en [Ayuda](#problemas) está la solución de lo más frecuente.'),
        ]),
]

# ------------------------------------------------------------------ una vuelta (así funciona)
VUELTA = [
    ('st1', '1', 'Fijación · parada 1', 'El conductor gira la perilla y el vagón sale de RuBP. En la parada 1, la pinza RuBisCO gira sobre él y “atrapa” el CO₂.'),
    ('st1', '2', '3-PGA · parada 2', 'El vagón llega a la estación de 6 3-PGA: lo que se formó al fijar el CO₂.'),
    ('st2', '3', 'Reducción · paradas 3 y 4', 'Frente a la tarjeta ATP y luego frente a la NADPH, cada una se gira media vuelta y muestra su cara gastada.'),
    ('st2', '4', 'Salida · parada 5', 'En G3P se abre la compuerta y 1 G3P baja por la rampa a la caja de glucosa.'),
    ('st3', '5', 'Regeneración · paradas 6 y 7', 'El vagón pasa por la mesa 5 G3P → 3 RuBP y la tercera tarjeta muestra 3 ADP.'),
    ('sun', '6', 'Recarga · de vuelta en 0', 'De regreso en RuBP, las tres tarjetas se regresan a su cara cargada: es la energía que trae la fase luminosa.'),
]

PAPELES = [
    ('Conductor', 'Gira la perilla y anuncia cada parada.', 'Paradas 0 a 7'),
    ('RuBisCO', 'Lleva la pinza sobre el CO₂ y explica la fijación.', 'Parada 1'),
    ('Energía', 'Voltea las tarjetas de ATP y NADPH y las recarga al final.', 'Paradas 3, 4 y 7'),
    ('Salida', 'Abre la compuerta y explica la salida y la regeneración.', 'Paradas 5 y 6'),
]

GUION = [
    ('surface', '0', 'Antes de empezar', 'Conductor', '“El ciclo de Calvin, también llamado fase oscura, es la parte de la fotosíntesis que convierte CO₂ en azúcar. Ocurre en el estroma del cloroplasto. Cada bloque es un átomo de carbono.”'),
    ('st1', '1', 'Fijación', 'RuBisCO', '“La enzima RuBisCO une el CO₂ a la RuBP. Por cada 3 CO₂ y 3 RuBP se forman 6 moléculas de 3-PGA.”'),
    ('st2', '2', 'Reducción', 'Energía', '“Para convertir los 6 3-PGA en 6 G3P se gastan 6 ATP y 6 NADPH: por eso las tarjetas cambian a ADP y NADP⁺.”'),
    ('st2', '3', 'Salida', 'Salida', '“Uno de los 6 G3P sale del ciclo: es el producto. Con dos de ellos la planta arma una glucosa; por eso la caja dice ½ glucosa.”'),
    ('st3', '4', 'Regeneración', 'Salida y Energía', '“Los otros 5 G3P, 15 carbonos, se reacomodan en 3 RuBP, también de 15 carbonos. Esto cuesta 3 ATP más.”'),
    ('sun', '5', 'Recarga', 'Energía', '“El ATP y el NADPH vienen de la fase luminosa, en los tilacoides. Al recargar las tarjetas, el ciclo puede empezar otra vez.”'),
]

BALANCE = '**Balance de una vuelta:** 3 CO₂ + 9 ATP + 6 NADPH → 1 G3P + 9 ADP + 8 Pᵢ + 6 NADP⁺. Para una glucosa (6 carbonos) se necesitan dos vueltas: 6 CO₂, 18 ATP y 12 NADPH.'
SIMPLIFICACION = '**Simplificación que conviene decir:** el vagón lleva un solo bloque verde que representa los 3 CO₂ de cada vuelta. Las cantidades de las estaciones sí son las reales para 3 CO₂.'
SOLAPAS = [
    ('¿Dónde ocurre?', 'En el estroma del cloroplasto, el líquido que rodea a los tilacoides.'),
    ('¿Por qué le dicen fase oscura?', 'Porque no usa la luz directamente. Pero no ocurre de noche: usa el ATP y el NADPH que fabrica la fase luminosa, y varias de sus enzimas, como la RuBisCO, solo se activan con luz. Por eso, aunque también se le llama “fase independiente de la luz”, ocurre de día.'),
]

PROBLEMAS = [
    ['La perilla gira pero el vagón se queda', 'Imanes débiles, base áspera o muy gruesa, o giro muy rápido', 'Gira más despacio. Forra el vagón con teflón, liso y de menos de 1 mm. Revisa que los fieltros del brazo toquen la tapa: si el brazo cuelga, los imanes quedan lejos.'],
    ['La tela del vagón se arruga o se despega', 'Pestañas sin lijar o muy pocas, tela muy chica, o se juntó el pegamento de contacto antes de esperar', 'Despega la tela. Lija las pestañas con lija 120, haz cortecitos cada 1 cm, unta las dos partes, espera 10 minutos y vuelve a doblarlas jalando. Si la tela es rígida y no se dobla, usa fieltro adhesivo delgado (Paso 4).'],
    ['El vagón brinca o se voltea', 'La pila de imanes del vagón está al revés', 'Sácala, voltéala y vuelve a pegarla (Paso 4).'],
    ['La perilla está dura', 'Fieltro muy grueso, palo chueco o Plastiacero en la rondana', 'Usa fieltro de 2 mm, no más grueso. Revisa con la escuadra que el palo esté a 90° del brazo. Si cayó Plastiacero en la rondana, ráspalo con el cúter.'],
    ['El brazo raspa la tapa', 'Palo chueco o tapa hundida', 'Revisa que la tapa apoye en los 4 postes y que los fieltros estén bien pegados en las dos puntas.'],
    ['El brazo se cae al quitar la tapa', 'Se despegó la perilla del palo', 'Repite el montaje del Paso 3 con Plastiacero nuevo, sosteniendo el brazo con los imanes sueltos.'],
    ['Una tarjeta gira sola o se ladea', 'El palito quedó flojo en su agujero', 'Enrolla una vuelta de masking en la punta del palito y vuelve a meterlo.'],
    ['Una tarjeta no gira', 'Agujero muy justo o silicón en el palito', 'Agranda el agujero con la broca de 3.5 mm y limpia el palito.'],
    ['La pinza no queda sobre el vagón', 'Boca de la pinza mal medida o torre fuera de lugar', 'La boca debe quedar a 8 cm del tornillo. Revisa que la torre esté en (30, 7.5).'],
    ['La pinza o la compuerta se caen o se atoran', 'Tornillo muy flojo o muy apretado', 'Ajusta el tornillo de arriba un cuarto de vuelta: debe girar con un dedo y quedarse quieto.'],
    ['La pieza G3P no baja', 'Poca pendiente o fricción', 'Revisa las alturas (8 y 2 cm) y que el acetato esté liso. El abatelenguas no debe rozar el piso del canal.'],
    ['La pieza G3P se pasa sin abrir la compuerta', 'El abatelenguas va muy alto', 'Debe cruzar el canal unos 5 mm arriba del piso. Revisa que la torre mida 7 cm.'],
    ['Una placa de bloques se despega', 'Poca cinta o vinil sucio', 'Limpia el vinil y usa 4 cuadritos de cinta de espuma, uno en cada esquina.'],
]

COORDS = [
    ['Centro del ciclo y perilla', '(30, 30)', 'Agujero de ⅝″ en la tapa; perilla de 4.5 cm sobre una rondana'],
    ['Pista', 'r 12.4 a 16.4', '4 cm de ancho, impresa'],
    ['Paradas numeradas', 'r 17.45', '0 RuBP · 1 fijación · 2 3-PGA · 3 ATP · 4 NADPH · 5 G3P · 6 regeneración · 7 ATP'],
    ['Placa RuBP', '(12.7, 12.7)', '6.4 × 6.4 cm'],
    ['Placa 3-PGA', '(47.3, 12.7)', '6.4 × 6.4 cm'],
    ['Placa G3P', '(30, 54.5)', '6.4 × 6.4 cm'],
    ['Placas de regeneración', '(7, 31) y (7, 39.5)', 'Dos de 6.4 × 6.4 cm'],
    ['Torre de la pinza', '(30, 7.5)', '2 × 2 × 2.5 cm; la pinza gira en un tornillo'],
    ['Torre de la tarjeta ATP', '(52.5, 30)', '2 × 2 × 3 cm'],
    ['Torre de la tarjeta NADPH', '(47.2, 44.5)', '2 × 2 × 3 cm'],
    ['Torre de la tarjeta ATP de regeneración', '(8.9, 22.3)', '2 × 2 × 3 cm'],
    ['Torre de la compuerta', '(22.9, 50.3)', '2 × 2 × 7 cm'],
    ['Rampa', '(26.5, 54) → (11, 54)', '15.5 cm; baja de 8 a 2 cm sobre la tapa'],
    ['Pilares de la rampa', '(25.5, 54) y (12, 54)', '7.1 cm y 1.9 cm de alto'],
    ['Caja de glucosa', '(2, 50) → (11, 58)', '9 × 8 cm'],
    ['Letrero del título', '(2, 2) → (19, 8)', 'Foamboard'],
    ['Letrero de fase luminosa', '(41, 2) → (58, 8)', 'Foamboard'],
    ['Solapa "¿Dónde ocurre?"', '(40, 51) → (54, 57)', 'Bisagra de cinta'],
    ['Solapa "¿Por qué le dicen fase oscura?"', '(2, 43.5) → (12, 48.5)', 'Bisagra de cinta'],
    ['Tornillos de la tapa', 'a 1.6 cm de cada orilla', '4 esquinas'],
    ['Postes de apoyo (abajo)', '(14, 15), (46, 15), (15, 45), (44, 46)', '2 × 2 × 5 cm'],
    ['Brazo con imanes (abajo)', 'gira en el centro', '31 × 2.5 cm; imanes a 14.4 cm del centro'],
]

# ------------------------------------------------------------------ materiales
MATERIALES = [
    ('Cortes para la maderería', [
        ('MDF de 6 mm', '2', '60 × 60 cm', 'Fondo y tapa'),
        ('MDF de 6 mm', '2', '60 × 5 cm', 'Paredes frontal y trasera'),
        ('MDF de 6 mm', '2', '58.8 × 5 cm', 'Paredes laterales'),
        ('MDF de 6 mm', '1', '31 × 2.5 cm', 'Brazo de los imanes'),
        ('MDF de 6 mm', '1', 'Retazo de 15 × 6 cm', '3 discos de 4.5 cm: vagón y perilla'),
        ('Agujero en la tapa (si te lo hacen)', '1', '⅝″ (16 mm) al centro, en (30, 30)', 'Paso del palo de la perilla'),
        ('Agujeros en el brazo (si te los hacen)', '2', '½″ al centro y 12 mm a 14.4 cm del centro (1.1 cm antes de una punta)', 'Palo e imanes'),
    ]),
    ('Estructura', [
        ('Listón o moldura cuadrada de pino de ¾ × ¾″ (≈ 2 × 2 cm)', '1', '1 m', 'Esquineros, postes, torres y pilares. Se usan unos 68 cm; sirve de 1.8 a 2.5 cm de grueso (ver Paso 1)'),
        ('Pija (tornillo para madera) de cabeza plana', '14', '#6 × ¾″', 'Postes, tapa y torres (uno de repuesto)'),
        ('Pija (tornillo para madera) de cabeza plana', '2', '#6 × ½″', 'Ejes de la pinza y la compuerta'),
        ('Vinil adherible mate impreso', '1', '60 × 60 cm (página 1 del PDF)', 'El dibujo del ciclo sobre la tapa'),
        ('Foamboard (cartón pluma) de 5 mm', '1', '50 × 70 cm', 'Rampa, caja de glucosa, letreros y solapas. No es foami: el foamboard es rígido, con papel en las dos caras'),
        ('Cartón gris de 2 mm (o cartulina gruesa)', '1', '20 × 25 cm', 'Los 6 cartones de las tarjetas'),
        ('Acetato o mica', '1', '20 × 5 cm', 'Tobogán de la rampa'),
        ('Hojas tamaño carta', '6', 'Páginas 2 a 7 del PDF', 'Tarjetas, letreros, plantillas y mapas'),
    ]),
    ('Mecanismo y vagón', [
        ('Palo redondo de madera', '1', '½″ (12.7 mm); se usan 4 cm', 'Eje de la perilla'),
        ('Rondana plana', '1', '½″', 'Debajo de la perilla'),
        ('Imán de neodimio', '2', 'Disco de 12 × 3 mm', 'Punta del brazo (encimados)'),
        ('Imán de neodimio', '2', 'Disco de 10 × 3 mm', 'Centro del vagón'),
        ('Fieltro adhesivo', '2', 'Cuadros de 2 × 2 cm, de 2 mm', 'Puntas del brazo: rozan la tapa. Si solo lo encuentras más grueso, busca otro: separa los imanes'),
        ('Tela o cinta de teflón para selladora (con o sin adhesivo)', '1', '7 × 7 cm', 'Base del vagón. En tienda en línea, ferretería grande o tienda de empaque. No es la cinta blanca de plomería'),
    ]),
    ('Estaciones y piezas a mano', [
        ('Bloques 1 × 1 compatibles con Lego', '90', 'Negros o gris oscuro', 'Carbonos (se usan 81)'),
        ('Bloque 1 × 1 verde', '2', '—', 'El carbono del CO₂ (uno de repuesto)'),
        ('Placa 8 × 8', '5', '6.4 × 6.4 cm', 'RuBP, 3-PGA, G3P y regeneración (2)'),
        ('Placa 4 × 4', '1', '3.2 × 3.2 cm', 'Encima del vagón'),
        ('Placa 1 × 3', '1', '—', 'Base de la pieza G3P de salida'),
        ('Palitos de brocheta', '3', '—', 'Ejes de las tarjetas'),
        ('Palito de paleta', '1', '—', 'Brazo de la pinza'),
        ('Abatelenguas', '1', '—', 'Compuerta'),
        ('Pinza de ropa de madera', '1', '—', 'Pinza RuBisCO'),
        ('Pintura acrílica amarilla', '1', 'Frasco chico', 'Pinza RuBisCO'),
        ('Rondana chica', '2', 'Para pija #6', 'Ejes de la pinza y la compuerta'),
    ]),
    ('Pegamentos y cintas', [
        ('Pegamento blanco de carpintero', '1', '250 ml', 'Madera con madera'),
        ('Plastiacero (pegamento epóxico de 2 partes)', '1', 'Empaque chico', 'Imanes, palo y perilla. Es negro: limpia lo que se salga antes de que endurezca'),
        ('Pegamento de contacto o instantáneo', '1', 'Tubo chico', 'Placa del vagón, pieza G3P y pestañas del teflón'),
        ('Pistola y barras de silicón de baja temperatura', '1', '—', 'Foamboard, tarjetas, pinza y pilares'),
        ('Lápiz adhesivo', '1', '—', 'Papel impreso sobre foamboard o cartón, y calcomanía de la perilla'),
        ('Cinta doble cara de espuma (de montaje)', '1', 'Rollo', 'Placas, letreros y solapas'),
        ('Cinta doble cara delgada', '1', 'Rollo', 'Acetato de la rampa y caja de glucosa'),
        ('Cinta transparente ancha y masking', '1 c/u', '—', 'Bisagras y rótulos'),
    ]),
    ('Herramientas', [
        ('Serrucho o segueta para madera', '', '', 'Listón y palo'),
        ('Taladro con brocas de 2, 3.5, 10 y 12 mm, broca avellanadora y brocas de paleta de ½″ y ⅝″', '', '', 'Agujeros (o pídelos en la maderería)'),
        ('Caladora (recomendada) o sierra de copa', '', '', 'Discos del vagón y la perilla. Con caladora y la plantilla salen los 3 del retazo de 15 × 6 cm. La sierra de copa saca un disco más chico que su medida: la de 44 mm da discos de unos 4 cm, que también funcionan; con una de 48 mm (1⅞″) o 51 mm (2″) salen de 4.5 cm lijando, pero en el retazo solo caben 2 y el tercero sale de otro retacito de MDF.'),
        ('Cúter con navajas nuevas, tijeras, regla metálica, escuadra y tabla de corte', '', '', 'Cortes rectos y la tela de teflón'),
        ('Lija 120', '', '', 'Rebabas, ajustes y pestañas del teflón'),
        ('Desarmador de cruz', '', '', 'Pijas'),
        ('Pistola de silicón de baja temperatura', '', '', 'Foamboard y cartón'),
        ('Lentes de seguridad y guantes', '', '', 'Taladro y Plastiacero'),
        ('Prensa (sargento) y un retazo de madera de sacrificio', '', '', 'Sujetar la pieza y perforar encima sin dañar la mesa'),
        ('Lápiz, plumón, un clavo, un alfiler, una tarjeta de plástico, un pincel y 2 pilas de libros', '', '', 'Marcar, alisar el vinil, pintar la pinza y apoyar la tapa'),
    ]),
]

PEGAMENTOS = [
    ['MDF con MDF o con pino (caja, esquineros, postes, discos de la perilla)', 'Pegamento blanco de carpintero', 'Sujeta con masking o peso 1 h. Endurece del todo en 24 h.'],
    ['Imanes en el brazo y en el vagón; palo en el brazo; perilla al palo', 'Plastiacero (epóxico de 2 partes)', 'Mezcla las 2 partes como diga el empaque. Fija en 5 minutos: no lo muevas en ese tiempo. Cura en 1 hora: no le hagas fuerza antes. Usa guantes. Es negro: pon poco y limpia lo que se salga antes de que endurezca, o se verá feo.'],
    ['Placa 4 × 4 al vagón; pieza G3P de salida', 'Pegamento de contacto o instantáneo', 'Una gota basta.'],
    ['Placas de bloques, letreros y base de las solapas sobre el vinil', 'Cinta doble cara de espuma', 'Se despega si te equivocas.'],
    ['Caja de glucosa sobre el vinil', 'Cinta doble cara delgada', 'Así su orilla queda a la altura de la punta de la rampa.'],
    ['Torres sobre la tapa', 'Una pija por debajo', 'Agujero de 3.5 mm en la tapa y de 2 mm en la torre. La pinza y la compuerta llevan otro de 2 mm arriba, para su eje.'],
    ['Pilares de la rampa', 'Silicón de baja temperatura', 'Rellena la cuña con el piso inclinado.'],
    ['Foamboard con foamboard (rampa, caja)', 'Silicón de baja temperatura', 'El de alta temperatura derrite el foamboard.'],
    ['Palito entre los cartones de las tarjetas; pinza al palito', 'Silicón de baja temperatura', 'Aprieta 30 segundos.'],
    ['Impresiones de papel sobre foamboard o cartón; calcomanía de la perilla', 'Lápiz adhesivo', 'Alisa con la mano del centro a las orillas.'],
    ['Acetato dentro del canal', 'Cinta doble cara delgada', 'Sin burbujas.'],
    ['Bisagras de las solapas', 'Cinta transparente ancha', 'Por la orilla de atrás.'],
    ['Fieltro en el brazo; teflón con adhesivo bajo el vagón', 'Ya son adhesivos', 'Recórtalos a la orilla.'],
    ['Teflón sin adhesivo (forrado del vagón)', 'Pegamento de contacto, solo en las pestañas', 'Lija las pestañas antes. La cara de abajo no lleva pegamento.'],
]

GLOSARIO = [
    ('MDF', 'Tablero liso de fibra de madera. Se pide cortado a la medida en la maderería.'),
    ('Listón o moldura cuadrada de pino de ¾ × ¾″', 'Palo de madera de sección cuadrada de unos 2 cm de lado (¾″ = 1.9 cm). En la tienda está con las molduras.'),
    ('Palo redondo de ½″', 'Varilla de madera redonda de 12.7 mm, como un palo de escoba pero delgado.'),
    ('Foamboard', 'Cartón pluma: espuma rígida con papel en las dos caras. Se corta con cúter. No es foami.'),
    ('Pija', 'Tornillo para madera: tiene punta y rosca abierta. El #6 es el grueso (unos 3.5 mm) y ¾″ o ½″ el largo.'),
    ('Tela de teflón para selladora', 'Tela de PTFE con fibra de vidrio, brillosa, café clara o blanca, que se usa en las selladoras de bolsas. Casi nada se le pega y resbala mucho. No es la cinta blanca de plomería.'),
    ('Plastiacero', 'Pegamento epóxico de 2 partes que se mezclan. Pega metal con madera muy fuerte. Es negro: lo que se salga se ve.'),
    ('Sierra de copa', 'Broca en forma de vaso con dientes que saca discos. El disco sale más chico que la medida de la sierra.'),
    ('Broca de paleta', 'Broca plana para hacer agujeros grandes en madera, como los de ½″ y ⅝″.'),
    ('Avellanar', 'Abrir la boca del agujero en forma de cono para que la cabeza del tornillo quede al ras.'),
    ('Rondana', 'Arandela: disco de metal con un agujero que va entre un tornillo (o la perilla) y la madera.'),
    ('Imán de neodimio', 'Imán muy fuerte, gris y brillante. Su atracción atraviesa varios milímetros de madera.'),
    ('Pivote', 'Cada botoncito redondo de una placa o bloque tipo Lego.'),
    ('Sentido horario', 'Como giran las manecillas del reloj, visto desde arriba.'),
    ('Ciclo de Calvin', 'La parte de la fotosíntesis que usa CO₂ para fabricar azúcar. No necesita luz directamente, pero sí la energía de la fase luminosa.'),
    ('Estroma', 'El líquido dentro del cloroplasto, alrededor de los tilacoides. Ahí ocurre el ciclo de Calvin.'),
    ('RuBisCO', 'La enzima que une el CO₂ a la RuBP. Es la proteína más abundante del planeta.'),
    ('RuBP', 'Ribulosa bifosfato: molécula de 5 carbonos que recibe al CO₂.'),
    ('3-PGA', 'Ácido 3-fosfoglicérico: molécula de 3 carbonos que se forma al fijar el CO₂.'),
    ('G3P', 'Gliceraldehído 3-fosfato: azúcar de 3 carbonos. Dos G3P forman una glucosa.'),
    ('ATP y ADP', 'El ATP es energía “cargada”; al gastarse queda ADP.'),
    ('NADPH y NADP⁺', 'El NADPH lleva electrones (poder reductor); al entregarlos queda NADP⁺.'),
    ('Fase luminosa', 'La parte de la fotosíntesis que usa la luz, en los tilacoides, para fabricar ATP y NADPH.'),
]
