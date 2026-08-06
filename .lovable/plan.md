# Instalar no celular (app na tela inicial)

O app já é mobile-first (abas inferiores, uma coluna, editor confortável). Falta só torná-lo instalável: adicionar à tela inicial do celular, abrindo em tela cheia sem barra do navegador.

Como o banco PGlite já roda 100% no navegador com dados salvos em IndexedDB, depois de instalado o app continua funcionando com os dados do usuário. Não vou adicionar cache offline do app (service worker) — isso é um passo extra e costuma causar telas travadas em versões antigas; se quiser modo offline completo, faço depois.

## O que será feito

1. Ícones do app (192px, 512px e ícone da Apple), no visual escuro/monoespaçado do app, com as letras "SQL".
2. Arquivo de manifesto com nome "SQL para quem vende", nome curto "SQL vende", tema escuro, abertura em modo standalone.
3. Tags no cabeçalho do app ligando manifesto, ícones e cor de tema.
4. Um item discreto no rodapé/aba de ajuda: "Instalar no celular", que:
   - no Android/Chrome, dispara o prompt nativo de instalação quando disponível;
   - no iPhone/Safari, mostra instruções curtas (Compartilhar > Adicionar à Tela de Início);
   - fica oculto quando o app já está instalado.

## Detalhes técnicos

- `public/manifest.webmanifest`: name, short_name, start_url `/`, scope `/`, `display: standalone`, `background_color` e `theme_color` iguais aos tokens escuros do tema, ícones 192/512 (incluindo purpose `maskable`).
- Ícones gerados em `public/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).
- `src/routes/__root.tsx`: acrescentar em `links` o `rel="manifest"` e `apple-touch-icon`, e em `meta` a `theme-color` e `apple-mobile-web-app-capable`.
- Novo componente `src/components/InstallButton.tsx` usando o evento `beforeinstallprompt` e detecção de iOS/standalone; sem service worker, sem vite-plugin-pwa.
