// node actualizarCanales.js
require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('./models/channelModel');
const User = require('./models/userModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

async function actualizarCanales() {
  let connection = null;
  
  try {
    // Conectar a MongoDB
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // ============================================
    // 1. CONTAR CANALES EXISTENTES
    // ============================================
    const totalCanales = await Channel.countDocuments();
    console.log(`📺 Canales encontrados: ${totalCanales}\n`);
    
    if (totalCanales === 0) {
      console.log('✨ No hay canales para actualizar.');
      process.exit(0);
    }
    
    // ============================================
    // 2. MOSTRAR ESTADO ACTUAL
    // ============================================
    const canalesSinPending = await Channel.countDocuments({ pending: { $exists: false } });
    const canalesConPendingTrue = await Channel.countDocuments({ pending: true });
    const canalesConPendingFalse = await Channel.countDocuments({ pending: false });
    
    console.log('📊 Estado actual de canales:');
    console.log(`   - Sin campo "pending": ${canalesSinPending}`);
    console.log(`   - Con pending = true: ${canalesConPendingTrue}`);
    console.log(`   - Con pending = false: ${canalesConPendingFalse}\n`);
    
    // Mostrar primeros 10 canales
    const canales = await Channel.find()
      .limit(15)
      .select('name owner createdAt pending isActive')
      .lean();
    
    console.log('📋 Ejemplo de canales:');
    canales.forEach((channel, idx) => {
      const pendingStatus = channel.pending === undefined 
        ? '❌ No existe' 
        : channel.pending ? '⏳ Pendiente' : '✅ Aprobado';
      console.log(`   ${idx + 1}. ${channel.name}`);
      console.log(`      - Dueño: ${channel.owner}`);
      console.log(`      - Estado: ${pendingStatus}`);
      console.log(`      - Activo: ${channel.isActive ? 'Sí' : 'No'}`);
    });
    
    if (totalCanales > 15) {
      console.log(`   ... y ${totalCanales - 15} más`);
    }
    
    // ============================================
    // 3. CONFIRMACIÓN INTERACTIVA
    // ============================================
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n📝 Lo que hará este script:');
    console.log('   1. Añadir campo "pending" = true a canales que no lo tengan');
    console.log('   2. Asegurar que los canales con pending = null o undefined se actualicen');
    console.log('   3. Los canales existentes quedarán pendientes de aprobación');
    console.log('   4. Mantener canales que ya tengan pending = false');
    
    const answer = await new Promise(resolve => {
      readline.question('\n⚠️ ¿Ejecutar actualización? Escribe "ACTUALIZAR" para confirmar: ', resolve);
    });
    readline.close();
    
    if (answer !== 'ACTUALIZAR') {
      console.log('\n❌ Operación cancelada.');
      process.exit(0);
    }
    
    // ============================================
    // 4. ACTUALIZAR CANALES SIN CAMPO PENDING
    // ============================================
    console.log('\n🔄 Actualizando canales...');
    
    // Opción 1: Actualizar canales que no tienen el campo pending
    const result1 = await Channel.updateMany(
      { pending: { $exists: false } },
      { 
        $set: { 
          pending: true,
          isActive: false  // Por defecto, inactivos hasta aprobación
        } 
      }
    );
    console.log(`   ✅ Actualizados ${result1.modifiedCount} canales sin campo "pending"`);
    
    // Opción 2: Asegurar que los canales con pending = null también se actualicen
    const result2 = await Channel.updateMany(
      { pending: null },
      { 
        $set: { 
          pending: true,
          isActive: false
        } 
      }
    );
    console.log(`   ✅ Actualizados ${result2.modifiedCount} canales con pending = null`);
    
    // ============================================
    // 5. VERIFICAR RESULTADOS
    // ============================================
    const nuevosTotales = await Channel.aggregate([
      {
        $group: {
          _id: '$pending',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Estado FINAL de canales:');
    nuevosTotales.forEach(item => {
      const status = item._id === true ? '⏳ Pendientes' : '✅ Aprobados';
      console.log(`   - ${status}: ${item.count}`);
    });
    
    // ============================================
    // 6. MOSTRAR CANALES ACTUALIZADOS
    // ============================================
    const canalesActualizados = await Channel.find()
      .limit(10)
      .select('name owner pending isActive createdAt')
      .lean();
    
    console.log('\n📋 Canales después de la actualización:');
    canalesActualizados.forEach((channel, idx) => {
      console.log(`   ${idx + 1}. ${channel.name}`);
      console.log(`      - Estado: ${channel.pending ? '⏳ Pendiente de aprobación' : '✅ Aprobado'}`);
      console.log(`      - Activo: ${channel.isActive ? 'Sí' : 'No'}`);
      console.log(`      - Creado: ${channel.createdAt.toISOString().split('T')[0]}`);
    });
    
    // ============================================
    // 7. OPCIÓN: Asignar canales de ADMIN como aprobados
    // ============================================
    console.log('\n📝 ¿Deseas aprobar automáticamente los canales de administradores?');
    const adminAnswer = await new Promise(resolve => {
      const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Escribe "SI" para aprobar canales de admins, o "NO" para dejar todos pendientes: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
    
    if (adminAnswer === 'SI') {
      // Encontrar usuarios admin
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      if (adminIds.length > 0) {
        const resultAdmin = await Channel.updateMany(
          { owner: { $in: adminIds }, pending: true },
          { 
            $set: { 
              pending: false,
              isActive: true 
            } 
          }
        );
        console.log(`\n✅ Aprobados ${resultAdmin.modifiedCount} canales de administradores`);
      } else {
        console.log('\n⚠️ No se encontraron administradores en el sistema');
      }
    } else {
      console.log('\n⏸️ Manteniendo todos los canales pendientes de aprobación');
    }
    
    // ============================================
    // 8. RESUMEN FINAL
    // ============================================
    const resumenFinal = await Channel.aggregate([
      {
        $group: {
          _id: { pending: '$pending', isActive: '$isActive' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.pending': -1 } }
    ]);
    
    console.log('\n📊 RESUMEN FINAL:');
    resumenFinal.forEach(item => {
      const estado = item._id.pending 
        ? `⏳ Pendiente (${item._id.isActive ? 'activo' : 'inactivo'})`
        : `✅ Aprobado (${item._id.isActive ? 'activo' : 'inactivo'})`;
      console.log(`   - ${estado}: ${item.count} canales`);
    });
    
    console.log('\n🎉 ¡Actualización completada!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
actualizarCanales();