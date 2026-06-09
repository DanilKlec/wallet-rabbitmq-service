/**
 * Автоматическая синхронизация схемы БД — для ускорения разработки тестового проекта.
 *
 * В production-среде рекомендуется использовать Sequelize migrations
 * вместо sequelize.sync(), чтобы контролировать изменения схемы безопасно.
 *
 * @see https://sequelize.org/docs/v6/other-topics/migrations/
 */
async function syncDatabase(sequelize) {
  await sequelize.sync();
}

module.exports = { syncDatabase };
