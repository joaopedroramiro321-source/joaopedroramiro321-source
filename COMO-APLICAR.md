# Manutenção do perfil

A configuração foi concluída em 22/09/2026. O README e as seis imagens em `assets/` estão publicados. A primeira execução do workflow terminou com sucesso.

## Atualização

O workflow `.github/workflows/profile.yml` atualiza os painéis e a Snake diariamente às 06:23 UTC (03:23 de Brasília). Agendamentos do GitHub podem sofrer atrasos. Para atualizar manualmente, abra Actions → Atualizar painéis do perfil → Run workflow.

O gerador usa o `GITHUB_TOKEN` automático do repositório. Não é necessário um token pessoal. Os arquivos SVG permanecem publicados caso uma atualização falhe; consulte o histórico do Actions para diagnosticar falhas.

## Como interpretar os painéis

- Estatísticas: repositórios públicos próprios, sem forks, e contribuições dos últimos 12 meses.
- Top Languages: participação em bytes, não proficiência.
- Streak: sequências na janela de 12 meses, com dias em UTC.
- Troféus: painel próprio de marcos públicos, não os Achievements oficiais do GitHub.
- Activity Graph: contribuições diárias nos últimos 90 dias.

Banner, typing animation e badges usam serviços externos. Os projetos também têm links de texto independentes das imagens.
