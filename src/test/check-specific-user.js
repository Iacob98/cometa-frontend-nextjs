// Проверка конкретного пользователя "еуые еуууу" с навыком "god"

const API_BASE = 'http://localhost:3001/api';

async function checkSpecificUser() {
  console.log('🎯 ПРОВЕРКА КОНКРЕТНОГО ПОЛЬЗОВАТЕЛЯ');
  console.log('===================================');
  console.log('Ищем: "еуые еуууу" с навыком "god" и роль crew');
  console.log('');

  try {
    // Получаем всех пользователей как делает фронтенд
    const response = await fetch(`${API_BASE}/users?page=1&per_page=100`);
    const data = await response.json();

    console.log(`📊 API ответ: ${data.items?.length || 0} из ${data.total || 0} пользователей`);
    console.log('');

    // Ищем точного пользователя
    const targetUser = data.items?.find(user => user.email === 'dddd@ff.com');

    if (targetUser) {
      console.log('✅ ПОЛЬЗОВАТЕЛЬ НАЙДЕН!');
      console.log('======================');
      console.log(`👤 Полное имя: ${targetUser.full_name}`);
      console.log(`📧 Email: ${targetUser.email}`);
      console.log(`📱 Телефон: ${targetUser.phone}`);
      console.log(`🎯 Роль: ${targetUser.role}`);
      console.log(`🌍 Язык: ${targetUser.lang_pref}`);
      console.log(`💡 Навыки: [${targetUser.skills?.join(', ') || 'Нет'}]`);
      console.log(`🔑 PIN: ${targetUser.pin_code}`);
      console.log(`✅ Активен: ${targetUser.is_active ? 'Да' : 'Нет'}`);
      console.log('');

      // Проверяем все условия для отображения в "Available Workers"
      console.log('🔍 ПРОВЕРКА УСЛОВИЙ ОТОБРАЖЕНИЯ:');
      console.log('===============================');

      const isValidRole = ["crew", "worker", "foreman"].includes(targetUser.role);
      const isActive = targetUser.is_active;
      const hasGodSkill = targetUser.skills?.includes('god');
      const isRussian = targetUser.lang_pref === 'ru';

      console.log(`   🎯 Роль подходит (crew/worker/foreman): ${isValidRole ? '✅ ДА' : '❌ НЕТ'} (${targetUser.role})`);
      console.log(`   ✅ Пользователь активен: ${isActive ? '✅ ДА' : '❌ НЕТ'}`);
      console.log(`   🌟 Есть навык "god": ${hasGodSkill ? '✅ ДА' : '❌ НЕТ'}`);
      console.log(`   🇷🇺 Русский язык: ${isRussian ? '✅ ДА' : '❌ НЕТ'}`);
      console.log('');

      // Проверка видимости в разных категориях
      const allUsers = data.items || [];
      const availableWorkers = allUsers.filter(user =>
        ["crew", "worker", "foreman"].includes(user.role)
      );

      const isInAllUsers = allUsers.some(u => u.id === targetUser.id);
      const isInAvailableWorkers = availableWorkers.some(u => u.id === targetUser.id);

      console.log('📋 ВИДИМОСТЬ В ИНТЕРФЕЙСЕ:');
      console.log('==========================');
      console.log(`   📋 Вкладка "All Users" (${allUsers.length}): ${isInAllUsers ? '✅ ВИДЕН' : '❌ НЕ ВИДЕН'}`);
      console.log(`   👷 Вкладка "Available Workers" (${availableWorkers.length}): ${isInAvailableWorkers ? '✅ ВИДЕН' : '❌ НЕ ВИДЕН'}`);
      console.log('');

      if (isValidRole && isActive && isInAvailableWorkers) {
        console.log('🎉 ПОЛНЫЙ УСПЕХ!');
        console.log('================');
        console.log('✅ Пользователь соответствует всем критериям');
        console.log('✅ Виден во вкладке "Available Workers"');
        console.log('✅ Проблема "я добавил но не вижу его" РЕШЕНА!');
        console.log('');
        console.log('📱 Инструкция для пользователя:');
        console.log('   1. Откройте http://localhost:3001/dashboard/teams');
        console.log('   2. Войдите в систему');
        console.log('   3. Перейдите на вкладку "Available Workers"');
        console.log('   4. Найдите пользователя "еуые еуууу" в списке');
        console.log('   5. Также можно использовать поиск в "All Users"');
      } else {
        console.log('⚠️  ПРОБЛЕМЫ ОБНАРУЖЕНЫ:');
        console.log('========================');
        if (!isValidRole) console.log('❌ Неподходящая роль для "Available Workers"');
        if (!isActive) console.log('❌ Пользователь неактивен');
        if (!isInAvailableWorkers) console.log('❌ Не попадает в фильтр "Available Workers"');
      }

    } else {
      console.log('❌ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН!');
      console.log('==========================');
      console.log('Возможные причины:');
      console.log('- Email dddd@ff.com не существует в базе');
      console.log('- Пользователь был удален');
      console.log('- Проблемы с API запросом');
      console.log('');
      console.log('🔍 Попробуем найти по другим критериям...');

      // Поиск по навыку "god"
      const godUsers = data.items?.filter(user => user.skills?.includes('god')) || [];
      console.log(`👨‍💼 Найдено пользователей с навыком "god": ${godUsers.length}`);
      godUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - роль: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkSpecificUser().catch(console.error);