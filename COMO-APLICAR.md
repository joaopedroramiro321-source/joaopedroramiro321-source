# Aplicar a correção

Destino: https://github.com/joaopedroramiro321-source/joaopedroramiro321-source

A integração recusou a gravação (HTTP 403). Nenhum arquivo remoto foi alterado.

1. Adicione `scripts/update-profile.mjs` e `.github/workflows/profile.yml` à branch `main`, preservando as pastas. O envio inicia a geração das imagens.
2. Em **Actions → Atualizar painéis do perfil**, aguarde a execução terminar com sucesso. Também é possível iniciar por **Run workflow**.
3. Confirme que a pasta `assets` contém `stats.svg`, `languages.svg`, `streak.svg`, `trophies.svg`, `activity.svg` e `snake.svg`.
4. Substitua o `README.md` pelo arquivo deste pacote. Faça isso depois da geração, para evitar imagens temporariamente quebradas.

O workflow usa o `GITHUB_TOKEN` automático do repositório; não requer criar um token pessoal. A permissão `contents: write` permite salvar as imagens neste repositório. Se uma política da conta impedir Actions ou gravação pelo workflow, a execução indicará o bloqueio.

Os painéis usam dados públicos e permanecem salvos se uma atualização falhar. O Streak considera a janela de 12 meses e dias em UTC; Top Languages mede bytes, não domínio técnico. Troféus é um painel próprio de marcos reais, identificado como tal.

Banner, typing animation e badges continuam usando os serviços externos que carregaram durante a inspeção. Links de projetos têm texto clicável independente das imagens.

Validação realizada: os seis repositórios existem e são públicos; a sintaxe do gerador foi verificada localmente. A execução real do workflow e a renderização final ainda dependem da publicação autorizada pelo GitHub.
