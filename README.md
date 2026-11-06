# Consumo API

Aplicação React/Vite com suporte a PWA para consultar perfil, personagens, Pokémon e filmes.

## Arquitetura

O fluxo dos filmes é **React/Vite PWA → Express local `/api` → OMDb**. Somente o backend
acrescenta a chave à requisição enviada à OMDb; o navegador recebe os dados utilizados
pela interface. As outras integrações (MockAPI, Dragon Ball API e PokéAPI) são consultadas
diretamente pelo frontend.

Em desenvolvimento, o proxy do Vite encaminha `/api` ao Express na porta 3001. Em produção,
o Express atende essas rotas e serve os arquivos compilados de `dist`.

## Configuração e segurança

Use Node.js 22.12 ou superior e execute `npm install`.
Copie `.env.example` para `.env` na raiz e substitua o placeholder pelo valor de
`OMDB_API_KEY`. No ambiente local, a chave deve existir somente no `.env`, que é ignorado
pelo Git. Não inclua a chave no frontend, na documentação ou no `.env.example` e não use
o prefixo `VITE_`.

Em hospedagem, configure o proxy público para o servidor local e forneça `OMDB_API_KEY`
somente ao processo do backend, por uma variável de ambiente protegida.

Se uma chave já foi incluída em commits, substitua-a no provedor. Removê-la dos arquivos
atuais não a remove do histórico do Git.

## Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o Express na porta 3001 e o Vite, normalmente na porta 5173. |
| `npm run dev:server` | Inicia somente o backend. |
| `npm run dev:client` | Inicia somente o frontend de desenvolvimento. |
| `npm run build` | Gera o frontend, o manifesto e o service worker em `dist`. |
| `npm start` | Serve o build existente e a API em `http://127.0.0.1:3001`. |
| `npm test` | Executa os testes automatizados do backend. |
| `npm run lint` | Verifica o código com ESLint. |

Para executar em produção local, rode `npm run build` antes de `npm start`.

## Rotas de filmes

- `/api/movies/search?query=Batman`: busca de filmes.
- `/api/movies/title?title=The%20Matrix`: consulta por título, usada pela seção de filme favorito.

As consultas vazias ou com mais de 200 caracteres retornam HTTP 400. Uma busca sem
resultados retorna HTTP 200 com `Response: "False"`; um título não encontrado retorna
404. Falhas da OMDb retornam 502/503, timeout retorna 504 e consultas amplas demais
retornam 422. As mensagens não repassam detalhes de autenticação.

## PWA e funcionamento offline

Após gerar o build e iniciar o servidor, abra a aplicação e use a opção de instalação
do navegador. O uso da PWA em produção requer **HTTPS**, com exceção de `localhost`
e endereços de loopback, como `127.0.0.1`. O `vite-plugin-pwa` gera o manifesto e o
service worker somente no build de produção.

A primeira visita online prepara o cache de HTML, JavaScript, CSS e ícones. Depois disso,
a estrutura estática da aplicação pode abrir offline. As APIs locais e de terceiros
usam `NetworkOnly` com `cache: 'no-store'`: suas respostas não são armazenadas pelo
service worker nem reutilizadas do cache HTTP. Imagens externas não entram no precache.

Enquanto o navegador estiver offline:

- Um aviso geral informa que os dados das APIs precisam de uma conexão com a internet.
- Os indicadores de carregamento e erros individuais das seções de API ficam ocultos.
- A busca mostra: “Você está offline. Conecte-se à internet para pesquisar filmes.”
- Nenhuma requisição de busca de filmes é enviada; buscas pendentes são canceladas.

Ao reconectar, a busca de filmes retoma automaticamente o texto atual, respeitando
o debounce de 800 ms, o cancelamento e a proteção contra respostas antigas. As demais
seções voltam ao tratamento normal de carregamento e erro; recarregue a aplicação
para consultar novamente dados que falharam durante a falta de conexão.

Atualizações do service worker são ativadas automaticamente, substituem os arquivos
estáticos da versão anterior e podem recarregar abas abertas. Nenhuma variável de
ambiente é incluída no precache.

O ícone original está em `public/pwa-icon.svg`, com versões PNG de 192 e 512 pixels
e uma versão maskable de 512 pixels.
