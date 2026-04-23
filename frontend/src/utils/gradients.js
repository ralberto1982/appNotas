export const GRADIENTS = [
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
  'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
  'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
  'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
  'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)',
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
  'linear-gradient(135deg,#96fbc4 0%,#f9f586 100%)',
  'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)',
  'linear-gradient(135deg,#fddb92 0%,#d1fdff 100%)',
  'linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)',
];

export const stripHtml = (html) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
