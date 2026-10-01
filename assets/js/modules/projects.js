const PROJECTS = [
  {
    title: 'Landing page Apoia.se',
    category: 'Hackathon SouJunior · 3º lugar',
    date: '2026/09',
    summary: 'Criei a API do formulário com sanitização de dados e limite por IP, além de gerenciar o deploy de front e back. Squad de 9 pessoas em 15 dias.',
    demo: 'https://soujunior-apoiase-landingpage.vercel.app/',
    github: 'https://github.com/Girls-In-Cortex/soujunior-apoiase-landingpage',
    tags: ['Java', 'API REST', 'Segurança'],
    details: [
      'Validação rigorosa e sanitização dos dados no formulário para prevenção de dados maliciosos.',
      'Configuração de limite de requisições por IP e políticas estritas de CORS.',
      'Deploy automatizado com gerenciamento seguro de variáveis de ambiente.'
    ]
  },
  {
    title: 'Gestor de Estoque & PDV em Nuvem',
    category: 'Full-Stack & Cloud Security',
    date: '2026/08 - 2026/09',
    summary: 'Sistema em Java para controle de insumos e vendas. Foco em arquitetura limpa, análise SonarQube e autenticação JWT stateless.',
    demo: 'https://conferindoestoque.vercel.app/',
    github: 'https://github.com/JustBruder/gestor-de-estoque',
    tags: ['Java', 'JWT', 'SonarQube'],
    details: [
      'Abatimento automático proporcional de insumos no estoque a cada venda realizada.',
      'Autenticação estateless via JWT garantindo isolamento total por cliente.',
      'Integração com SonarQube para auditoria contínua de segurança do código.'
    ]
  },
    {
    title: 'Java Minimalist API + Docker & CI/CD Pipeline',
    category: 'DevSecOps & CI/CD Pipeline',
    date: '2026/07',
    summary: 'Servidor HTTP nativo em Java sem frameworks rodando em Linux Mint, criado do zero para entender na prática a conteinerização e a automação de publicação com segurança.',
    demo: '',
    github: 'https://github.com/JustBruder/java-docker-cicd',
    tags: ['Java Native', 'Docker', 'GitHub Actions', 'Secrets'],
    details: [
      'Construção de um servidor web nativo em Java puro, sem frameworks ou dependências externas, para ter controle total da aplicação.',
      'Criação e otimização do Dockerfile para gerar imagens leves e portáveis.',
      'Pipeline de CI/CD automatizado no GitHub Actions para compilar o código e gerar o build a cada push.',
      'Gerenciamento seguro de credenciais com GitHub Repository Secrets na publicação de imagens no Docker Hub.'
    ]
  },
  {
    title: 'Gerenciador de Eventos',
    category: 'Backend & Database',
    date: '2025/09',
    summary: 'Sistema em Java para gerenciamento automatizado de eventos, focado na aplicação prática de Orientação a Objetos, consultas SQL e tratamento rigoroso de exceções.',
    demo: '',
    github: 'https://github.com/JustBruder/Servi-o-de-Atendimento',
    tags: ['Java POO', 'SQL', 'CRUD', 'Tratamento de Exceções'],
    details: [
      'Modelagem de domínio em Java aplicando os pilares da Orientação a Objetos para isolamento de responsabilidades.',
      'Operações completas de CRUD e persistência de dados estruturados com SQL.',
      'Tratamento centralizado de exceções e validações de entrada para evitar falhas e garantir a integridade dos dados.'
    ]
  }
];

export function initProjects() {
  const container = document.getElementById('projects-container');
  const modal = document.getElementById('modal');

  if (!container || !modal) return;

  container.innerHTML = PROJECTS.map((p, i) => `
    <article class="box-card project-card">
      <div>
        <span class="card-label">${p.category}</span>
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="tag-cloud">
          ${p.tags.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
      <button class="btn-more" data-index="${i}">Ver arquitetura técnica ›</button>
    </article>
  `).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-more');
    if (!btn) return;
    openModal(PROJECTS[btn.dataset.index], modal);
  });
}

function openModal(p, modal) {
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="modal-close-btn">×</button>
      <span class="card-label">${p.category} · ${p.date}</span>
      <h3>${p.title}</h3>
      <p>${p.summary}</p>
      <ul>
        ${p.details.map(d => `<li>${d}</li>`).join('')}
      </ul>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        ${p.demo ? `<a class="btn-primary" href="${p.demo}" target="_blank">Ver site no ar ↗</a>` : ''}
        ${p.github ? `<a class="btn-primary" href="${p.github}" target="_blank">GitHub ↗</a>` : ''}
      </div>
    </div>
  `;
  modal.classList.add('active');

  document.getElementById('modal-close-btn').onclick = () => modal.classList.remove('active');
}