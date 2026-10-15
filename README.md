# CampsTech - SpaceX

Site React preparado para GitHub Pages.

## Publicar
1. Crie um repositório no GitHub, usando a branch main.
2. Coloque o conteúdo desta pasta na raiz do repositório, incluindo .github/workflows/deploy.yml e package-lock.json. Não envie o ZIP sem extrair.
3. Em Settings > Pages > Build and deployment > Source, selecione GitHub Actions.
4. Na aba Actions, execute o fluxo Publicar site no GitHub Pages (Run workflow). Futuras alterações na main publicam automaticamente.
5. Aguarde o fluxo terminar. O endereço aparece em Settings > Pages.

## Executar localmente
Use Node.js 22.12 ou superior da série 22.

    npm ci
    npm run dev

Para gerar a versão publicada: npm run build. Para conferir: npm run preview.

## Observações
- As imagens locais funcionam também no endereço com o nome do repositório.
- Fontes do Google e imagens do Unsplash exigem acesso aos respectivos serviços.
- A seção de lançamentos usa a API Launch Library 2; os demais textos e estatísticas continuam editoriais.
- O recorde do simulador é salvo somente no navegador do visitante.
- Foi mantida a opção original de não indexação pelos buscadores (meta robots em index.html).
- Configurações e arquivos internos do editor Figma foram retirados da versão de publicação.

Referência: https://vite.dev/guide/static-deploy.html#github-pages

## Lançamentos reais
A seção consulta um arquivo gerado com dados da Launch Library 2, do The Space Devs, filtrado pela agência SpaceX (121). São consultados os próximos 15 e os últimos 15 lançamentos, sem necessidade de chave de API.

O fluxo do GitHub Actions atualiza os dados a cada 30 minutos, além de cada publicação manual ou alteração na main. Horários agendados podem atrasar. O navegador verifica o arquivo a cada 5 minutos enquanto a página está visível. Não é uma transmissão em tempo real.

Os resultados de sucesso/falha vêm da API. Quando uma data vence sem resultado confirmado, aparece Aguardando atualização. Só há contagem regressiva para horário preciso e status confirmado. Todos os horários exibidos usam America/Sao_Paulo.

Se a API falhar, preserva-se a consulta publicada mais recente (ou a cópia incluída no projeto); a data da consulta não é falsamente renovada. Após duas horas sem atualização, o site avisa e desativa contagens regressivas. Sem dados válidos, mostra erro em vez de missões inventadas.

Para atualizar localmente: npm run update-launches. Para testar: npm test e npx tsc --noEmit.

Agendamentos de repositórios públicos podem ser desativados pelo GitHub após 60 dias sem atividade. Se isso acontecer, reative o fluxo na aba Actions. A data da última consulta no site ajuda a identificar interrupções.

Fonte: https://thespacedevs.com/llapi

## Netlify
O projeto também está preparado para publicação no Netlify pelo arquivo `netlify.toml`.
Use `npm run build` e a pasta de saída `dist`. A interface pode ser hospedada no
Netlify enquanto os lançamentos continuam sendo atualizados pelo fluxo agendado
do GitHub Pages, sem exigir uma nova publicação do site a cada consulta.


## Fotos e vídeos de fundo
- Abertura: pouso dos propulsores Falcon Heavy, vídeo do site oficial SpaceX.
- Frota: vídeos/renderizações específicos de Falcon 9, Starship e Dragon, com troca pelas abas.
- Voos tripulados: fotografia da Crew Dragon/NASA.
- Lançamentos: fotografia da Falcon 9/NASA como fundo discreto.
- Sobre: fotografia da Starship/SpaceX.

Os arquivos de vídeo são carregados dos servidores oficiais, sem som, em loop, somente quando a seção está visível. Há botão de pausa, imagem alternativa e respeito à preferência de movimento reduzido/economia de dados. A disponibilidade dos vídeos depende dos servidores de origem.

Fontes de mídia: https://www.spacex.com/ e suas páginas /vehicles/falcon-9/, /vehicles/starship/ e /vehicles/dragon/. Imagens e vídeos identificados como SpaceX pertencem à SpaceX. Mantido o aviso de projeto escolar sem vínculo oficial.
