# SpaceX — projeto educacional

Site independente criado por estudantes do Tech CAMPS. Apresenta veículos, lançamentos, história, aplicações espaciais e um simulador simplificado de pouso. Não é um site oficial da SpaceX.

## Começar

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Comandos disponíveis:

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o servidor local do Vite. |
| `npm run build` | Gera o site estático em `dist/`. |
| `npm run preview` | Abre localmente a versão gerada em `dist/`. |
| `npm test` | Executa os testes dos dados e utilitários de lançamentos. |
| `npm run update-launches` | Atualiza o snapshot local usando a API Launch Library 2. |

## Publicação

O projeto é um site Vite estático. A configuração atual da Vercel usa a raiz do repositório, `npm run build` e `dist/`. Os commits enviados à branch definida como Production no projeto Vercel geram a publicação principal; outras branches podem gerar previews.

Não há variáveis de ambiente obrigatórias. O service worker, manifesto e ícones ficam em `public/` e são copiados sem processamento para a saída.

## Dados e mídia

- `public/data/launches.json` guarda o snapshot da agenda de lançamentos. A interface o atualiza periodicamente e também consulta as estatísticas oficiais da SpaceX.
- `.github/workflows/update-launches.yml` executa a atualização da agenda a cada 30 minutos e grava alterações na branch conectada à publicação.
- `scripts/update-launches.mjs` busca dados da Launch Library 2 e preserva o último snapshot válido se a API estiver indisponível.
- As fontes originais das imagens locais estão catalogadas em [`docs/media/spacex-image-sources.json`](docs/media/spacex-image-sources.json). Os créditos também são apresentados na interface.
- Os vídeos de fundo são carregados sob demanda dos servidores SpaceX; imagens locais são usadas como alternativa. A opção de movimento reduzido e a economia de dados mantêm a experiência mais leve.

## Organização do repositório

```text
.
├── .agents/skills/       # Skill de frontend design usada no projeto
├── .github/workflows/    # Atualização agendada dos lançamentos
├── docs/media/           # Referências e documentação de mídia
├── public/               # Arquivos estáticos, imagens, dados e PWA
├── scripts/              # Rotinas de manutenção de dados
├── src/                  # Aplicação React, estilos e módulos da experiência
│   └── features/          # Funcionalidades isoladas e conteúdo pausado
├── tests/                # Testes automatizados
└── vercel.json            # Build, saída e cabeçalhos de publicação
```

O quiz de visitantes permanece em `src/features/visitor-challenge/` para retomada futura; ele está pausado e não aparece na experiência pública.

## Experiência offline

Após a primeira visita, o service worker guarda os arquivos essenciais e apresenta `public/offline-cards.html` se uma navegação falhar sem conexão. O simulador não depende de chamadas externas depois que a página é carregada.

Fotos, vídeos e marcas pertencem aos respectivos titulares. O projeto é educacional e independente.
