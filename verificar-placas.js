import supabaseDB from './server/supabaseDB.js';

async function verificarPlacas() {
  console.log('🔍 VERIFICANDO PLACAS DOS VEÍCULOS\n');
  
  const veiculos = await supabaseDB.getAllVehicles();
  
  if (veiculos.length === 0) {
    console.log('❌ Nenhum veículo cadastrado!');
    return;
  }
  
  console.log('📋 Veículos cadastrados:\n');
  veiculos.forEach((v, index) => {
    console.log(`${index + 1}. ${v.marca} ${v.modelo}`);
    console.log(`   🔖 Placa: ${v.placa ? `"${v.placa}"` : '❌ SEM PLACA CADASTRADA'}`);
    console.log(`   🆔 ID: ${v.id}`);
    console.log(`   📅 Ano: ${v.ano || 'N/A'}`);
    console.log('');
  });
  
  console.log('⚠️  IMPORTANTE:');
  console.log('   Se um veículo não tem placa cadastrada, você DEVE usar o MODELO para buscar.');
  console.log('   Se tem placa, use a placa EXATA como mostrado acima.\n');
}

verificarPlacas();
