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
- Conteúdo de missões e datas está no código; não há atualização automática por API.
- O recorde do simulador é salvo somente no navegador do visitante.
- Foi mantida a opção original de não indexação pelos buscadores (meta robots em index.html).
- Configurações e arquivos internos do editor Figma foram retirados da versão de publicação.

Referência: https://vite.dev/guide/static-deploy.html#github-pages

