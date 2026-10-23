# Tech CAMPS · SpaceX

Site educacional independente, feito por estudantes do Tech CAMPS. Apresenta veículos e serviços da SpaceX, marcos históricos, aplicações, desafios e uma simulação simplificada de pouso. Não é um site oficial da SpaceX.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Para gerar o site estático: `npm run build`. A saída é criada em `dist/`.

## Publicação na Vercel

O projeto usa Vite e inclui `vercel.json` com o comando `npm run build` e a pasta de saída `dist`. Para conectar a publicação:

1. Importe `rafaelsilvapythondev/Camps_Tech_SpaceX` na Vercel.
2. Confirme o framework Vite, o comando `npm run build` e a pasta `dist`.
3. Publique. A Vercel cria um endereço público em `*.vercel.app` e passa a publicar cada alteração enviada à branch principal.

O site não precisa de variáveis de ambiente nem de servidor próprio. Os vídeos de fundo são carregados sob demanda dos servidores oficiais da SpaceX; se não estiverem disponíveis, imagens locais mantêm a apresentação.

## Feira e acesso sem conexão

- O service worker guarda os arquivos do site depois da primeira visita e mostra uma tela simples de reconexão quando uma navegação falha sem conexão.
- O simulador não depende de chamadas externas depois que o site abriu.
- Vídeos não iniciam quando o visitante prefere movimento reduzido ou usa a opção de economia de dados; também podem ser pausados.

## Conteúdo e fontes

A lista automática de lançamentos foi substituída por marcos passados com referências institucionais, para não apresentar previsões sujeitas a mudança como fatos. As datas do voo 8 da Starship e da recuperação do New Glenn seguem a devolutiva do projeto e as fontes FAA/Blue Origin indicadas no site.

Fotos e vídeos são identificados com créditos. A Starship tem uma ilustração local rotulada como material educacional e vídeo oficial carregado sob demanda. As imagens e marcas pertencem aos respectivos titulares.
