# [1.9.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.8.1...v1.9.0) (2026-06-19)


### Features

* **web:** add feedback moderation controls for administrators EOB-184 ([2d598cf](https://github.com/EoBryanDev/dev4-palpita-ai/commit/2d598cf56f686e55be5ca638c0564b982fbed4a1))

## [1.8.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.8.0...v1.8.1) (2026-06-19)


### Bug Fixes

* **api:** alias count field in feedbacks subquery EOB-183 ([f32191f](https://github.com/EoBryanDev/dev4-palpita-ai/commit/f32191f9edf6ef30d76ab3fe20cf60c7929338d6))
* **db:** add feedback and voting tables migration EOB-183 ([4e2db64](https://github.com/EoBryanDev/dev4-palpita-ai/commit/4e2db6467bbd60d0d840864e6ceba4591372a7b0))

# [1.8.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.7.0...v1.8.0) (2026-06-19)


### Bug Fixes

* **scraper:** support live match commentary formats for card events EOB-183 ([961294b](https://github.com/EoBryanDev/dev4-palpita-ai/commit/961294b1a57deaa5f9b019de10158a859669f963))


### Features

* **api:** add feedback service and server actions with rate limit ([a3c240c](https://github.com/EoBryanDev/dev4-palpita-ai/commit/a3c240c588fd12689e512faadf25840ead332a97))
* **db:** add feedbacks and feedbacks_votos tables with domain types ([c3276db](https://github.com/EoBryanDev/dev4-palpita-ai/commit/c3276dbaadfba2e419a31859ad3c08385c661ff9))
* **ui:** add feedback components, pages, and navigation ([35c72c1](https://github.com/EoBryanDev/dev4-palpita-ai/commit/35c72c155305b480c66e3233c21a45b95be703a4))

# [1.7.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.6.1...v1.7.0) (2026-06-19)


### Features

* **api:** calculate partial points, enable timeline sorting and allow admin corrections ([a43b047](https://github.com/EoBryanDev/dev4-palpita-ai/commit/a43b047082ba89fe60df70dc96b54aba11de68cf))
* **openspec:** add proposal, design and specs for pontuacoes-parciais-revisao ([752217c](https://github.com/EoBryanDev/dev4-palpita-ai/commit/752217c783b1cf9fec29b994b91c9317047145ac))
* **ui:** display partial score badges, remove calculating status and add review flow for admin ([0a522e9](https://github.com/EoBryanDev/dev4-palpita-ai/commit/0a522e9b3c1222376e575ab592a1f57053da93b6))

## [1.6.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.6.0...v1.6.1) (2026-06-18)


### Bug Fixes

* **scraper:** corrigindo regex de cartoes e adicionando fallback google para busca ogol ([4223e8f](https://github.com/EoBryanDev/dev4-palpita-ai/commit/4223e8f41dca9518c5fac61b3369d18e923d5a32))

# [1.6.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.5.2...v1.6.0) (2026-06-18)


### Features

* **ranking:** ordenar por pontos, acertos exatos e jogos pontuados ([85866ad](https://github.com/EoBryanDev/dev4-palpita-ai/commit/85866adc59a5bae630c95a19e67533a23b20a4da))

## [1.5.2](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.5.1...v1.5.2) (2026-06-18)


### Bug Fixes

* **ci:** also push :latest tag to DockerHub on scraper deploy EOB-164 ([0f5ca80](https://github.com/EoBryanDev/dev4-palpita-ai/commit/0f5ca800270284df0ba05c1f4b45f9db96d835c7))

## [1.5.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.5.0...v1.5.1) (2026-06-17)


### Bug Fixes

* **ci:** remove explicit pnpm version — action-setup@v4 reads from packageManager EOB-164 ([8dac117](https://github.com/EoBryanDev/dev4-palpita-ai/commit/8dac117356177c5c8c4053dbde1ab3ec57261e38))
* **ci:** update pnpm to v10, sync lockfile, add validate gate to scraper-deploy EOB-164 ([23514bb](https://github.com/EoBryanDev/dev4-palpita-ai/commit/23514bbf5bd8c0216da191c6164621623472711e))
* **scraper:** update playwright docker image and pin dep to v1.61.0 EOB-164 ([2b34659](https://github.com/EoBryanDev/dev4-palpita-ai/commit/2b34659b9de429810c7381831a57551bd3f41b3d))

# [1.5.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.4.1...v1.5.0) (2026-06-17)


### Bug Fixes

* **scraper:** allow match events sync even when scoreboard score is unchanged EOB-164 ([c32345d](https://github.com/EoBryanDev/dev4-palpita-ai/commit/c32345d5f850b74a79266a557fc3640cee74c593))
* **scraper:** bypass google bot detection and prevent playwright timeouts EOB-164 ([f78dec2](https://github.com/EoBryanDev/dev4-palpita-ai/commit/f78dec25938f92acb39d83c7a4f4ead00ad14eda))
* **scraper:** limit pending matches query to recent or active matches EOB-164 ([d3fd451](https://github.com/EoBryanDev/dev4-palpita-ai/commit/d3fd451f5b7caec0f76a3639f5e0842d1618e1ad))
* **scraper:** run container via tsx to resolve workspace packages EOB-165 ([24c6d1a](https://github.com/EoBryanDev/dev4-palpita-ai/commit/24c6d1a12d5e0dd26d3bef9f70dfa6e6206ac245))


### Features

* **api:** fetch match events inside obterEventosTimeline query EOB-164 ([fd27aa4](https://github.com/EoBryanDev/dev4-palpita-ai/commit/fd27aa4ef3513de92565edddedca521c837a590e))
* **db:** add eventos_partida table and migration EOB-163 ([7d29778](https://github.com/EoBryanDev/dev4-palpita-ai/commit/7d29778fe409cedf766f8c6e493a210e0cb00775))
* **scraper:** expand sports widget and improve timeline events extraction ([7888d6f](https://github.com/EoBryanDev/dev4-palpita-ai/commit/7888d6fe25a893412d7c6550f9f5610d879e7b05))
* **scraper:** extract substitutions and cards from ogol for finished matches EOB-164 ([5c87d2a](https://github.com/EoBryanDev/dev4-palpita-ai/commit/5c87d2a9160c9e72a7226b7761ffc387de035a4b))
* **scraper:** implement playwright engine with timeline extraction EOB-164 ([afc6b3a](https://github.com/EoBryanDev/dev4-palpita-ai/commit/afc6b3acec83dc0f568de3222ec1dc6fec1c23f2))
* **scraper:** implement scraping engines with cheerio and playwright EOB-164 ([cc60a9d](https://github.com/EoBryanDev/dev4-palpita-ai/commit/cc60a9df817ca135bd7bb2b4ae6dd9847ea02365))
* **scraper:** implement sync engine with dedup and cli EOB-164 ([ac3f677](https://github.com/EoBryanDev/dev4-palpita-ai/commit/ac3f677ad544b42f5f4dd6acdbee25bc31c61f93))
* **scraper:** make timeline tab click robust and load root .env relative to index.ts ([e54bfa7](https://github.com/EoBryanDev/dev4-palpita-ai/commit/e54bfa74cd8ee8bb894340830de7c5541689c309))
* **scraper:** optimize docker image size and support configurable engine EOB-165 ([634db45](https://github.com/EoBryanDev/dev4-palpita-ai/commit/634db451f42eaa80172af8a91e76ab8b2488b21f))
* **scraper:** set default CMD to watch in Dockerfile EOB-165 ([c2f34c2](https://github.com/EoBryanDev/dev4-palpita-ai/commit/c2f34c26b5e7457b2694106003a7e9f9632fa1ab))
* **scraper:** support interval option in watch mode command EOB-164 ([38145ed](https://github.com/EoBryanDev/dev4-palpita-ai/commit/38145ed7376569dc185ae6e03dd6b36fa0ba3eda))
* **scraper:** use official playwright base image in Dockerfile EOB-165 ([8d13c26](https://github.com/EoBryanDev/dev4-palpita-ai/commit/8d13c26ce3a8c24272dfb9c2c4f61925fc356457))
* **scraper:** whitelist dist folder in package.json for pnpm deploy EOB-165 ([ba91105](https://github.com/EoBryanDev/dev4-palpita-ai/commit/ba91105f4d108827be4c41c525a777a83d012a54))
* **web:** render match events scrollbox in timeline card EOB-164 ([31291db](https://github.com/EoBryanDev/dev4-palpita-ai/commit/31291dbc235c6e594d4cd18a97355401cedf2f8a))

## [1.4.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.4.0...v1.4.1) (2026-06-16)


### Bug Fixes

* **web:** allow flag cdn domains in csp img-src ([82dcf84](https://github.com/EoBryanDev/dev4-palpita-ai/commit/82dcf846ff624ce87aae7cb66953d8625fc2165c))

# [1.4.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.3.0...v1.4.0) (2026-06-16)


### Features

* **api:** add individual deadline for late-joiners ([95a23e0](https://github.com/EoBryanDev/dev4-palpita-ai/commit/95a23e054abc87cc2f0475a03c9ef6de61f8e0f5))
* **db:** add data_liberacao column to usuarios ([9e427a1](https://github.com/EoBryanDev/dev4-palpita-ai/commit/9e427a199a89a56108bf7918da0c5b2fd9290b5c))

# [1.3.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.2.1...v1.3.0) (2026-06-16)


### Features

* **admin:** paginar e ordenar partidas por rodada (EOB-181) ([7a7182d](https://github.com/EoBryanDev/dev4-palpita-ai/commit/7a7182d40057009d3257ebd5d8d5fc280fc5801a))

## [1.2.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.2.0...v1.2.1) (2026-06-16)


### Bug Fixes

* **auth:** redirect por cargo no login e limpar cache no logout EOB-178 ([6d439b7](https://github.com/EoBryanDev/dev4-palpita-ai/commit/6d439b7489e40be9509290e11fe0fd8c7e8a6113))

# [1.2.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.1.1...v1.2.0) (2026-06-16)


### Features

* **dashboard:** paginate history and include ongoing matches EOB-180 EOB-182 ([47e0a73](https://github.com/EoBryanDev/dev4-palpita-ai/commit/47e0a7309ae2701041dcdc34de18baab44505ea4))

## [1.1.1](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.1.0...v1.1.1) (2026-06-15)


### Bug Fixes

* **ui:** defer flag image rendering to client to fix SSR hydration and prevent broken alt text ([b71065d](https://github.com/EoBryanDev/dev4-palpita-ai/commit/b71065d7ea6576760b29b6686978b24cf040e101))

# [1.1.0](https://github.com/EoBryanDev/dev4-palpita-ai/compare/v1.0.0...v1.1.0) (2026-06-15)


### Bug Fixes

* **icons:** use jsDelivr with FlagCDN fallback for team flags EOB-170 ([3597744](https://github.com/EoBryanDev/dev4-palpita-ai/commit/3597744844cbd1e06a18ff285e8a9debf914c8c9))


### Features

* **dashboard:** render matches currently in progress on Meu Espaço EOB-169 ([e9773da](https://github.com/EoBryanDev/dev4-palpita-ai/commit/e9773dafc4a5697dce1b624aae378c108dfaf611))
* **events:** add pagination to events timeline EOB-176 ([d5daf25](https://github.com/EoBryanDev/dev4-palpita-ai/commit/d5daf25b06d7ab6e7f08b373a57e8f92b3b14cf3))
* **ranking:** show total scored games and exact guesses EOB-171 ([de0d56b](https://github.com/EoBryanDev/dev4-palpita-ai/commit/de0d56b1ce75703606fb9fb6a65fd540e656cfb4))
* **stats:** reorder and paginate palpites statistics grid EOB-168 ([a19e570](https://github.com/EoBryanDev/dev4-palpita-ai/commit/a19e5703394c6438a02655086129ba7a980f2754))
* **ui:** display current application version in footer ([4b644b8](https://github.com/EoBryanDev/dev4-palpita-ai/commit/4b644b8803c1596e8cf3a22cd1db15a4bd0a7a90))
