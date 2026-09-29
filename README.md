# Isadora Figueiredo Arquitetura & Interiores

Prévia do site portfólio. HTML, CSS e JavaScript puros, sem build.

## Páginas

index.html              home: intro, abertura, identidade, projetos em destaque, prévia da galeria, arquiteta, escritório (com endereço e contatos), depoimentos e contato
arquiteta.html          a arquiteta e a equipe
escritorio.html         o escritório: frentes de atuação, como trabalhamos, endereço e mapa
projetos.html           todos os projetos, em galeria (mosaico e tour por ambiente) ou em lista (?v=lista), com filtro ?c=arquitetura ou ?c=interiores
galeria.html            redireciona para projetos.html (endereço antigo)
projeto.html?p=<slug>   página de cada projeto: abertura, ficha, texto, ambientes e próximo projeto

## Estrutura

assets/style.css        tokens (cores, fontes) no :root e todos os estilos
assets/main.js          comum às páginas: intro, menu, painel "Falar com a equipe", rolagem, visualizador, ambientes, depoimentos
assets/projetos.js      monta a galeria, a lista e o tour de fotos
assets/projeto.js       monta a página de um projeto
assets/data.js          projetos, textos, categoria e fotos separadas por ambiente
assets/img/<slug>/      fotos em WebP
assets/img/escritorio/  foto do escritório (original em fotos/Escritorio)
assets/brand/           onça, nome e assinatura recortados da marca original

## WhatsApp

Número (44) 99134-4852, tirado de bio.site/IsadoraFigueiredo. Para trocar, edite WA_NUMBER em assets/main.js e os links wa.me nos arquivos .html.

## Antes de ir ao ar

Os depoimentos da home são provisórios, escritos só para a prévia. Trocar pelos depoimentos reais dos clientes.
Faltam, se quiser, nomes e fotos da equipe para a página da arquiteta.
