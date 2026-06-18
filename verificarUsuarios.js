// node verificarUsuarios.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

async function verificarUsuarios() {
  let conn = null;
  
  try {
    // Conectar a la base específica
    conn = await mongoose.createConnection(MONGODB_URI);
    console.log('✅ Conectado a:', conn.name);
    console.log('🔗 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Oculta credenciales
    
    // Obtener la colección de usuarios
    const usersCollection = conn.db.collection('users');
    
    // Contar total de usuarios
    const totalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Total de usuarios: ${totalUsers}`);
    
    // Buscar todos los usuarios con sus planes y roles
    const usuarios = await usersCollection.find(
      {},
      {
        projection: {
          username: 1,
          email: 1,
          role: 1,
          channelPlan: 1,
          isPro: 1,
          channelPlanExpiresAt: 1,
          channelPlanAutoRenew: 1,
          createdAt: 1
        }
      }
    ).sort({ createdAt: -1 }).toArray();
    
    if (usuarios.length === 0) {
      console.log('✨ No hay usuarios en la base de datos.');
      return;
    }
    
    // Mostrar tabla de usuarios
    console.log('\n📋 LISTADO DE USUARIOS:');
    console.log('═'.repeat(100));
    console.log(
      'Username'.padEnd(20) +
      'Role'.padEnd(15) +
      'Plan'.padEnd(15) +
      'isPro'.padEnd(8) +
      'Expira'.padEnd(12) +
      'Email'
    );
    console.log('─'.repeat(100));
    
    // Contadores
    let stats = {
      total: usuarios.length,
      userpro: 0,
      admin: 0,
      moderator: 0,
      user: 0,
      basic: 0,
      pro: 0,
      business: 0,
      free: 0,
      sinPlan: 0,
      isPro: 0
    };
    
    usuarios.forEach(user => {
      const username = (user.username || 'N/A').substring(0, 18);
      const role = user.role || 'user';
      const plan = user.channelPlan || 'free';
      const isPro = user.isPro ? '✅' : '❌';
      const expiresAt = user.channelPlanExpiresAt 
        ? new Date(user.channelPlanExpiresAt).toLocaleDateString('es-ES')
        : 'N/A';
      const email = (user.email || 'N/A').substring(0, 25);
      
      console.log(
        username.padEnd(20) +
        role.padEnd(15) +
        plan.padEnd(15) +
        isPro.padEnd(8) +
        expiresAt.padEnd(12) +
        email
      );
      
      // Estadísticas
      stats[role] = (stats[role] || 0) + 1;
      stats[plan] = (stats[plan] || 0) + 1;
      if (user.isPro) stats.isPro++;
    });
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN POR ROL:');
    console.log('═'.repeat(40));
    console.log(`   👤 user:       ${stats.user || 0}`);
    console.log(`   💎 userpro:     ${stats.userpro || 0}`);
    console.log(`   🛡️ moderator:   ${stats.moderator || 0}`);
    console.log(`   👑 admin:       ${stats.admin || 0}`);
    
    console.log('\n📊 RESUMEN POR PLAN:');
    console.log('═'.repeat(40));
    console.log(`   🆓 free:        ${stats.free || 0}`);
    console.log(`   ⭐ basic:       ${stats.basic || 0}`);
    console.log(`   🚀 pro:         ${stats.pro || 0}`);
    console.log(`   👑 business:    ${stats.business || 0}`);
    
    console.log('\n📊 OTROS:');
    console.log('═'.repeat(40));
    console.log(`   ✅ isPro:       ${stats.isPro}`);
    console.log(`   ❌ no Pro:      ${usuarios.length - stats.isPro}`);
    
    // Buscar usuarios específicos (descomenta para buscar)
    /*
    console.log('\n🔍 Buscar usuario específico:');
    const userPro = await usersCollection.findOne(
      { role: 'userpro' },
      { projection: { username: 1, email: 1, role: 1, channelPlan: 1 } }
    );
    if (userPro) {
      console.log('   Primer userpro:', userPro);
    } else {
      console.log('   No hay usuarios con role userpro');
    }
    */
    
    // Buscar usuarios que pagaron pero no se actualizaron
    console.log('\n⚠️ USUARIOS CON POSIBLE INCONSISTENCIA:');
    console.log('═'.repeat(60));
    
    const inconsistencias = usuarios.filter(u => 
      (u.channelPlan && u.channelPlan !== 'free' && u.role !== 'userpro') ||
      (u.role === 'userpro' && (!u.channelPlan || u.channelPlan === 'free'))
    );
    
    if (inconsistencias.length > 0) {
      console.log('   Usuarios con plan pero sin role userpro:');
      inconsistencias.forEach(u => {
        console.log(`   ⚠️ ${u.username} - Plan: ${u.channelPlan} - Role: ${u.role}`);
      });
    } else {
      console.log('   ✅ No se encontraron inconsistencias');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (conn) await conn.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

verificarUsuarios();