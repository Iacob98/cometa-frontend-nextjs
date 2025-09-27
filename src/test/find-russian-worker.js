// Поиск русскоязычного работника с навыком "god"

const API_BASE = 'http://localhost:3001/api';

async function findRussianWorker() {
  console.log('🔍 Поиск русскоязычного работника с навыком "god"');
  console.log('================================================');

  try {
    // Получаем всех пользователей
    const response = await fetch(`${API_BASE}/users?page=1&per_page=50`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Всего пользователей в базе: ${data.total}`);
      console.log('');

      // Фильтруем доступных работников (crew, worker, foreman)
      const availableWorkers = data.items.filter(user =>
        ["crew", "worker", "foreman"].includes(user.role)
      );

      console.log(`👷 Доступных работников: ${availableWorkers.length}`);
      console.log('');

      // Ищем русскоязычных работников
      const russianWorkers = availableWorkers.filter(user =>
        user.lang_pref === 'ru'
      );

      console.log(`🇷🇺 Русскоязычных работников: ${russianWorkers.length}`);
      russianWorkers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email || 'Без email'})`);
        console.log(`      📱 Телефон: ${user.phone || 'Нет'}`);
        console.log(`      🎯 Роль: ${user.role}`);
        console.log(`      💡 Навыки: [${user.skills?.join(', ') || 'Нет навыков'}]`);
        console.log(`      ✅ Активен: ${user.is_active ? 'Да' : 'Нет'}`);
        console.log('');
      });

      // Ищем пользователя с навыком "god"
      const godSkillUsers = availableWorkers.filter(user =>
        user.skills?.includes('god')
      );

      console.log(`👨‍💼 Работников с навыком "god": ${godSkillUsers.length}`);
      godSkillUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. 🌟 ${user.full_name} (${user.email || 'Без email'})`);
        console.log(`      📱 Телефон: ${user.phone || 'Нет'}`);
        console.log(`      🎯 Роль: ${user.role}`);
        console.log(`      🌍 Язык: ${user.lang_pref}`);
        console.log(`      💡 Навыки: [${user.skills?.join(', ') || 'Нет навыков'}]`);
        console.log(`      🔑 PIN: ${user.pin_code || 'Нет'}`);
        console.log(`      ✅ Активен: ${user.is_active ? 'Да' : 'Нет'}`);
        console.log('');
      });

      // Проверяем конкретного пользователя "еуые еуууу"
      const targetUser = data.items.find(user =>
        user.full_name.includes('еуые') || user.email === 'dddd@ff.com'
      );

      if (targetUser) {
        console.log('🎯 НАЙДЕН ЦЕЛЕВОЙ ПОЛЬЗОВАТЕЛЬ:');
        console.log('==============================');
        console.log(`👤 Имя: ${targetUser.full_name}`);
        console.log(`📧 Email: ${targetUser.email}`);
        console.log(`📱 Телефон: ${targetUser.phone || 'Нет'}`);
        console.log(`🎯 Роль: ${targetUser.role}`);
        console.log(`🌍 Язык: ${targetUser.lang_pref}`);
        console.log(`💡 Навыки: [${targetUser.skills?.join(', ') || 'Нет навыков'}]`);
        console.log(`🔑 PIN: ${targetUser.pin_code || 'Нет'}`);
        console.log(`✅ Активен: ${targetUser.is_active ? 'Да' : 'Нет'}`);
        console.log(`📅 Создан: ${new Date(targetUser.created_at).toLocaleString('ru')}`);
        console.log('');

        // Проверяем, попадает ли в категорию "Available Workers"
        const isAvailableWorker = ["crew", "worker", "foreman"].includes(targetUser.role);
        console.log(`🔍 Статус отображения:`);
        console.log(`   ✅ Во вкладке "All Users": ДА (показывает всех)`);
        console.log(`   ${isAvailableWorker ? '✅' : '❌'} Во вкладке "Available Workers": ${isAvailableWorker ? 'ДА' : 'НЕТ'} (роль: ${targetUser.role})`);

        if (isAvailableWorker) {
          console.log('');
          console.log('🎉 ПРОБЛЕМА РЕШЕНА!');
          console.log('Ваш пользователь теперь будет виден во вкладке "Available Workers"');
        }
      } else {
        console.log('❌ Целевой пользователь не найден');
      }

    } else {
      console.log(`❌ Ошибка API: ${response.status}`);
      console.log(`📄 Ошибка: ${JSON.stringify(data)}`);
    }

  } catch (error) {
    console.error('❌ Сетевая ошибка:', error.message);
  }
}

findRussianWorker().catch(console.error);