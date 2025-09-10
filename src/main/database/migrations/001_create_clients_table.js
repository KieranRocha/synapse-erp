exports.up = function(knex) {
  return knex.schema.createTable('clients', function(table) {
    table.increments('id').primary()
    table.enum('tipo_pessoa', ['PJ', 'PF']).defaultTo('PJ')
    table.string('razao_social').notNullable()
    table.string('nome_fantasia').defaultTo('')
    table.string('cpf_cnpj', 14).notNullable()
    table.enum('indicador_ie', ['Contribuinte', 'Isento', 'Não Contribuinte']).defaultTo('Contribuinte')
    table.string('ie').defaultTo('')
    table.string('im').defaultTo('')
    table.string('suframa').defaultTo('')
    table.enum('regime_trib', ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']).defaultTo('Simples Nacional')
    table.string('cep', 8).defaultTo('')
    table.string('logradouro').defaultTo('')
    table.string('numero').defaultTo('')
    table.string('complemento').defaultTo('')
    table.string('bairro').defaultTo('')
    table.string('cidade').defaultTo('')
    table.string('uf', 2).defaultTo('')
    table.string('pais').defaultTo('Brasil')
    table.string('email').defaultTo('')
    table.string('telefone').defaultTo('')
    table.string('responsavel').defaultTo('')
    table.string('cargo').defaultTo('')
    table.string('cond_pgto_padrao').defaultTo('')
    table.decimal('limite_credito', 10, 2).defaultTo(0)
    table.string('vendedor_padrao').defaultTo('')
    table.enum('transporte_padrao', ['CIF', 'FOB']).defaultTo('CIF')
    table.text('observacoes').defaultTo('')
    table.timestamps(true, true)
    
    // Indexes for better performance
    table.index('cpf_cnpj')
    table.index('razao_social')
    table.index('email')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('clients')
}