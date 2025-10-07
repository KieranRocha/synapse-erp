// @/renderer/src/modules/onboarding/components/Labels.tsx

export const StepUsuariosLabels = {
  title: 'Usuários',
  description: 'Adicione e gerencie os usuários que terão acesso ao sistema.',
  addUser: 'Adicionar Usuário',
  noUsersAdded: 'Nenhum usuário adicionado.',
  adminUser: 'Administrador',
  obrigatory: 'Obrigatório',

  table: {
    name: 'Nome',
    email: 'E-mail',
    role: 'Cargo',
    actions: 'Ações',
  },

  placeholders: {
    fullName: 'Nome completo',
    email: 'email@empresa.com',
  },

  buttons: {
    save: 'Salvar',
    edit: 'Editar',
    cancel: 'Cancelar',
    delete: 'Excluir',
  },

  roles: {
    Administrador: 'Administrador',
    Financeiro: 'Financeiro',
    Engenharia: 'Engenharia',
    Gerente: 'Gerente',
    Vendedor: 'Vendedor',
    Comprador: 'Comprador',
    Estoquista: 'Estoquista',
  },

  permissions: {
    vendas: 'Vendas',
    compras: 'Compras',
    estoque: 'Estoque',
    financeiro: 'Financeiro',
    admin: 'Admin',
  },

  tooltips: {
    deleteUser: 'Excluir usuário',
    editUser: 'Editar usuário',
    saveUser: 'Salvar usuário',
    cancelEdit: 'Cancelar edição',
    adminInfo: 'O primeiro usuário é o administrador principal e não pode ser removido.',
  },
};
