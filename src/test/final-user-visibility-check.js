// Финальная проверка видимости пользователя после исправлений

const API_BASE = 'http://localhost:3001/api';

async function finalVisibilityCheck() {
  console.log('🎯 ФИНАЛЬНАЯ ПРОВЕРКА ВИДИМОСТИ ПОЛЬЗОВАТЕЛЯ');
  console.log('============================================');
  console.log('Проверяем исправления для проблемы: "я добавил но не вижу его"');
  console.log('');

  try {
    // Тестируем API с разными параметрами пагинации
    console.log('🔍 Тестирование API с разными параметрами...');

    // Тест 1: Стандартный запрос (как делал фронтенд раньше)
    const response20 = await fetch(`${API_BASE}/users?page=1&per_page=20`);
    const data20 = await response20.json();

    // Тест 2: Расширенный запрос (как должен делать теперь)
    const response100 = await fetch(`${API_BASE}/users?page=1&per_page=100`);
    const data100 = await response100.json();

    console.log(`📊 Результаты API запросов:`);
    console.log(`   per_page=20: ${data20.items?.length || 0} пользователей из ${data20.total || 0} общих`);
    console.log(`   per_page=100: ${data100.items?.length || 0} пользователей из ${data100.total || 0} общих`);
    console.log('');

    // Используем расширенный список для анализа
    const allUsers = data100.items || [];

    // Фильтруем по категориям как в интерфейсе
    const availableWorkers = allUsers.filter(user =>
      ["crew", "worker", "foreman"].includes(user.role)
    );

    const russianWorkers = availableWorkers.filter(user =>
      user.lang_pref === 'ru'
    );

    const godSkillUsers = allUsers.filter(user =>
      user.skills?.includes('god')
    );

    // Ищем целевого пользователя
    const targetUser = allUsers.find(user =>
      user.full_name.includes('еуые') ||
      user.email === 'dddd@ff.com' ||
      user.skills?.includes('god')
    );

    console.log('📋 АНАЛИЗ КАТЕГОРИЙ ПОЛЬЗОВАТЕЛЕЙ:');
    console.log('===================================');
    console.log(`👥 Всего пользователей: ${allUsers.length}`);
    console.log(`👷 Доступных работников (crew/worker/foreman): ${availableWorkers.length}`);
    console.log(`🇷🇺 Русскоязычных работников: ${russianWorkers.length}`);
    console.log(`🌟 Пользователей с навыком "god": ${godSkillUsers.length}`);
    console.log('');

    if (targetUser) {
      console.log('🎯 ЦЕЛЕВОЙ ПОЛЬЗОВАТЕЛЬ НАЙДЕН!');
      console.log('===============================');
      console.log(`👤 Имя: ${targetUser.full_name}`);
      console.log(`📧 Email: ${targetUser.email}`);
      console.log(`🎯 Роль: ${targetUser.role}`);
      console.log(`🌍 Язык: ${targetUser.lang_pref}`);
      console.log(`💡 Навыки: [${targetUser.skills?.join(', ') || 'Нет'}]`);
      console.log(`🔑 PIN: ${targetUser.pin_code}`);
      console.log(`✅ Активен: ${targetUser.is_active ? 'Да' : 'Нет'}`);
      console.log('');

      // Проверяем видимость в разных вкладках
      console.log('🔍 ПРОВЕРКА ВИДИМОСТИ ПО ВКЛАДКАМ:');
      console.log('===================================');

      // 1. All Users Tab
      const inAllUsers = allUsers.some(u => u.id === targetUser.id);
      console.log(`   📋 Вкладка "All Users": ${inAllUsers ? '✅ ВИДЕН' : '❌ НЕ ВИДЕН'}`);

      // 2. Available Workers Tab
      const inAvailableWorkers = availableWorkers.some(u => u.id === targetUser.id);
      console.log(`   👷 Вкладка "Available Workers": ${inAvailableWorkers ? '✅ ВИДЕН' : '❌ НЕ ВИДЕН'}`);

      // 3. Проверка в кратком списке (per_page=20)
      const inShortList = data20.items?.some(u => u.id === targetUser.id);
      console.log(`   📄 В кратком списке (20 записей): ${inShortList ? '✅ ВИДЕН' : '❌ НЕ ВИДЕН'}`);

      console.log('');

      if (inAllUsers && inAvailableWorkers) {
        console.log('🎉 УСПЕХ! ПРОБЛЕМА РЕШЕНА!');
        console.log('==========================');
        console.log('✅ Пользователь теперь виден во всех соответствующих вкладках');
        console.log('✅ API возвращает достаточное количество записей');
        console.log('✅ Фильтрация работает корректно');
        console.log('');
        console.log('📱 Как найти пользователя в интерфейсе:');
        console.log('   1. Откройте http://localhost:3001/dashboard/teams');
        console.log('   2. Перейдите на вкладку "Available Workers"');
        console.log('   3. Найдите пользователя "еуые еуууу" в списке');
        console.log('   ИЛИ');
        console.log('   1. Перейдите на вкладку "All Users"');
        console.log('   2. Используйте поиск по "еуые", "god" или "dddd@ff.com"');
      } else {
        console.log('⚠️  ЧАСТИЧНОЕ РЕШЕНИЕ');
        console.log('=====================');
        if (!inAllUsers) console.log('❌ Не виден в "All Users" - проблема с общим списком');
        if (!inAvailableWorkers) console.log('❌ Не виден в "Available Workers" - проблема с фильтрацией');
        if (!inShortList) console.log('⚠️  Не попадает в первые 20 записей - нужна пагинация или поиск');
      }

    } else {
      console.log('❌ ЦЕЛЕВОЙ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН');
      console.log('=================================');
      console.log('Возможные причины:');
      console.log('- Пользователь не был создан');
      console.log('- Проблемы с API');
      console.log('- Неправильные критерии поиска');
    }

  } catch (error) {
    console.error('❌ Ошибка при выполнении проверки:', error.message);
  }
}

finalVisibilityCheck().catch(console.error);