/**
 * Script de création des utilisateurs de démonstration SOFIBANQUE
 * Utilise l'API Supabase Admin pour créer les utilisateurs avec le bon hashage
 *
 * Mot de passe pour tous: Password123!
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoUsers = [
  {
    email: 'drh@sofibanque.com',
    password: 'Password123!',
    firstname: 'Marie',
    lastname: 'Dubois',
    phone: '+243810000001',
    employee_number: 'EMP-2024-001',
    role_code: 'drh',
    hire_date: '2020-01-15',
    job_position_title: 'Directeur des Ressources Humaines',
    job_position_code: 'DRH'
  },
  {
    email: 'rh@sofibanque.com',
    password: 'Password123!',
    firstname: 'Jean',
    lastname: 'Martin',
    phone: '+243810000002',
    employee_number: 'EMP-2024-002',
    role_code: 'rh_manager',
    hire_date: '2021-03-10'
  },
  {
    email: 'manager@sofibanque.com',
    password: 'Password123!',
    firstname: 'Sophie',
    lastname: 'Leroy',
    phone: '+243810000003',
    employee_number: 'EMP-2024-003',
    role_code: 'manager',
    hire_date: '2021-06-01'
  },
  {
    email: 'employe@sofibanque.com',
    password: 'Password123!',
    firstname: 'Pierre',
    lastname: 'Durand',
    phone: '+243810000004',
    employee_number: 'EMP-2024-004',
    role_code: 'employee',
    hire_date: '2023-01-15'
  }
];

async function createDemoUsers() {
  console.log('🚀 Début de la création des utilisateurs de démonstration...\n');

  // Récupérer les données nécessaires
  console.log('📊 Récupération des données de base...');

  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('business_name', 'SOFIBANQUE')
    .maybeSingle();

  if (!account) {
    console.error('❌ Compte SOFIBANQUE non trouvé');
    process.exit(1);
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('account_id', account.id)
    .maybeSingle();

  const { data: direction } = await supabase
    .from('directions')
    .select('id')
    .eq('code', 'DRH')
    .maybeSingle();

  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('direction_id', direction?.id)
    .maybeSingle();

  const { data: grade } = await supabase
    .from('grades')
    .select('id')
    .eq('code', 'CS')
    .maybeSingle();

  console.log('✅ Données de base récupérées\n');

  for (const user of demoUsers) {
    console.log(`👤 Création de ${user.firstname} ${user.lastname} (${user.email})...`);

    try {
      // 1. Créer l'utilisateur dans auth.users via l'API Admin
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          firstname: user.firstname,
          lastname: user.lastname
        }
      });

      if (authError) {
        console.error(`   ❌ Erreur création auth: ${authError.message}`);
        continue;
      }

      console.log(`   ✓ Utilisateur auth créé (ID: ${authUser.user.id.substring(0, 8)}...)`);

      // 2. Mettre à jour le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          account_id: account.id,
          root_store: store?.id,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          email: user.email,
          status: 1
        })
        .eq('user_id', authUser.user.id);

      if (profileError) {
        console.error(`   ⚠️  Erreur profil: ${profileError.message}`);
      } else {
        console.log(`   ✓ Profil mis à jour`);
      }

      // 3. Récupérer le rôle et l'assigner
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('code', user.role_code)
        .maybeSingle();

      if (role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
            role_id: role.id
          });

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error(`   ⚠️  Erreur rôle: ${roleError.message}`);
        } else {
          console.log(`   ✓ Rôle assigné (${user.role_code})`);
        }
      }

      // 4. Récupérer ou créer le poste si nécessaire
      let jobPositionId = null;
      if (user.job_position_code) {
        const { data: jobPosition } = await supabase
          .from('job_positions')
          .select('id')
          .eq('code', user.job_position_code)
          .maybeSingle();

        jobPositionId = jobPosition?.id;
      }

      // 5. Créer l'enregistrement employé
      const { error: empError } = await supabase
        .from('employees')
        .insert({
          user_id: authUser.user.id,
          employee_number: user.employee_number,
          first_name: user.firstname,
          last_name: user.lastname,
          email: user.email,
          phone: user.phone,
          hire_date: user.hire_date,
          direction_id: direction?.id,
          service_id: service?.id,
          grade_id: grade?.id,
          job_position_id: jobPositionId,
          employment_status: 'active',
          contract_type: 'permanent',
          is_active: true
        });

      if (empError) {
        console.error(`   ⚠️  Erreur employé: ${empError.message}`);
      } else {
        console.log(`   ✓ Enregistrement employé créé`);
      }

      console.log(`   ✅ ${user.firstname} ${user.lastname} créé avec succès!\n`);

    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}\n`);
    }
  }

  console.log('🎉 Création des utilisateurs terminée!');
  console.log('\n📋 Récapitulatif des utilisateurs:');
  console.log('─────────────────────────────────────────────');
  demoUsers.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Mot de passe: ${user.password}`);
    console.log(`Rôle: ${user.role_code}`);
    console.log('─────────────────────────────────────────────');
  });
}

createDemoUsers().catch(console.error);
